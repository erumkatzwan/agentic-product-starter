import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { ROOT, iosXcconfig, loadJson, parseEnv, repoSteps, statusRows, upsertEnv, xcconfigValue } from './setup.mjs';

const registry = loadJson('config/integrations.json');
const settings = registry.integrations.flatMap((i) => i.settings);

test('parses .env files with comments, blanks and quotes', () => {
  const values = parseEnv('# comment\n\nA=1\n B = two \nC="three"\nD=\'four\'\nE=\nbroken line\n');
  assert.deepEqual(values, { A: '1', B: 'two', C: 'three', D: 'four', E: '' });
});

test('updates one key in an .env file and keeps the rest', () => {
  assert.equal(upsertEnv('', 'A', '1'), 'A=1\n');
  assert.equal(upsertEnv('# keep\nA=old\nB=2\n', 'A', 'new'), '# keep\nA=new\nB=2\n');
  assert.equal(upsertEnv('B=2', 'A', '1'), 'B=2\nA=1\n');
});

test('writes URLs so xcconfig does not read // as a comment', () => {
  assert.equal(xcconfigValue('https://k@o.ingest.sentry.io/1'), 'https:/$()/k@o.ingest.sentry.io/1');
  assert.match(iosXcconfig({}), /^SENTRY_DSN = $/m);
  assert.match(iosXcconfig({ SENTRY_DSN_IOS: 'https://k@h/1' }), /^SENTRY_DSN = https:\/\$\(\)\/k@h\/1$/m);
});

test('reports each setting per environment', () => {
  const github = { Syst: new Set(['SENTRY_DSN_IOS']), Prod: new Set() };
  const rows = statusRows(registry, {}, github);
  const state = (key, environment) => rows.find((r) => r.key === key && r.environment === environment).state;

  assert.equal(state('SENTRY_DSN_IOS', 'Syst'), 'set in GitHub');
  assert.equal(state('SENTRY_DSN_IOS', 'Prod'), 'off');
  assert.equal(state('SENTRY_DSN_IOS', 'Dev'), 'not used');
  assert.equal(statusRows(registry, {}, undefined).find((r) => r.environment === 'Prod').state, 'unknown (sign in with gh as an admin)');
});

test('the integration list is complete and consistent', () => {
  const keys = settings.map((s) => s.key);
  assert.equal(new Set(keys).size, keys.length, 'keys are unique');
  for (const integration of registry.integrations) {
    assert.ok(['optional', 'publish'].includes(integration.when), integration.id);
    assert.ok(integration.signUp.startsWith('https://') && integration.steps.length, integration.id);
    assert.ok(statSync(join(ROOT, integration.guide.split('#')[0])).isFile(), `${integration.id} guide exists`);
    for (const setting of integration.settings) {
      assert.ok(setting.environments.every((e) => registry.environments.includes(e)), setting.key);
    }
  }
  const example = parseEnv(readFileSync(join(ROOT, '.env.example'), 'utf8'));
  for (const key of keys) assert.ok(key in example, `${key} is in .env.example`);
  for (const key of Object.keys(example)) assert.ok(keys.includes(key), `${key} from .env.example is in config/integrations.json`);
});

function files(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.git', 'build', 'dist', 'bin', 'obj', '.gradle', 'coverage', 'test-results'].includes(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files(path, found);
    else if (/\.(ts|tsx|kts|kt|swift|cs|mjs|xcconfig|yml|json)$|Makefile$/.test(name)) found.push(path);
  }
  return found;
}

test('every app setting is read somewhere in the code', () => {
  const code = files(join(ROOT, 'apps'))
    .concat(files(join(ROOT, 'backend')), files(join(ROOT, 'scripts')))
    .filter((path) => !relative(ROOT, path).startsWith('scripts/setup'))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  for (const { key } of settings) {
    const read = code.includes(key) || (key.startsWith('OTEL_') && code.includes('OTEL_EXPORTER_OTLP_ENDPOINT'));
    assert.ok(read, `${key} is used by an app`);
  }
});

test('the repo settings cover security, labels and the main ruleset', () => {
  const repoSettings = loadJson('config/repo-settings.json');
  const steps = repoSteps('owner/repo', repoSettings, registry.environments);
  const names = steps.map(([description]) => description);

  for (const expected of ['Dependabot alerts', 'CodeQL default setup', 'Secret scanning and push protection', 'Environment Prod', 'Label incident']) {
    assert.ok(names.includes(expected), expected);
  }
  const checks = repoSettings.ruleset.rules.find((r) => r.type === 'required_status_checks').parameters.required_status_checks;
  const workflowText = readdirSync(join(ROOT, '.github/workflows'))
    .map((file) => readFileSync(join(ROOT, '.github/workflows', file), 'utf8'))
    .join('\n');
  for (const { context } of checks) assert.ok(workflowText.includes(`name: ${context}`), `"${context}" is a job in a workflow`);
});
