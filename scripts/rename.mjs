#!/usr/bin/env node
// Rename the whole product: apps, packages, bundle IDs, namespaces, folders and docs.
//
//   node scripts/rename.mjs --name "Fashion Girl" --dry-run      # preview every change
//   node scripts/rename.mjs --name "Fashion Girl"                # apply
//   node scripts/rename.mjs --name "Fashion Girl" --id com.fashiongirl.app --repo my-org/fashion-girl
//
// --name   Display name shown to users (required).
// --id     App ID for iOS and Android, also the Kotlin package. Default: com.<name>.app
// --repo   GitHub owner/name of your copy, for README, screenshot and website links.
//          Default: read from `git remote get-url origin` when available.
// --force  Run even with uncommitted changes.
// --check  Do not rename; list any old identifier still in the repo (used by CI after a rename).
//
// Only specific identifiers are replaced (AgenticApp, com.agentic.app, "Agentic Back Office"...),
// never the word "agentic" on its own, and credit lines for the starter are kept.
// Requires Node 22+. Run it on a new branch, then run each app's checks.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const STARTER_REPO = 'erumkatzwan/agentic-product-starter';
const OLD_ID = 'com.agentic.app';
const SKIP_DIRS = new Set(['.git', 'node_modules', 'bin', 'obj', 'build', 'dist', 'coverage', '.gradle', '.kotlin', 'DerivedData', 'test-results', 'playwright-report', '.archify']);
const TEXT = /\.(md|json|mjs|js|ts|tsx|css|html|yml|yaml|toml|xml|kts|kt|swift|xcconfig|plist|entitlements|cs|csproj|slnx|sln|props|py|sh|txt|pro|properties)$|^(Makefile|Dockerfile|\.gitignore|\.editorconfig|_typos\.toml)$/;
// Lines that credit the starter keep its name and links.
const CREDIT = /Erum Awan|Built from the \[Agentic Product Starter\]|Built with Agentic Product Starter/;
// Added under the title of a renamed copy's README: credit to the starter, and a way to find copies on GitHub.
export const BADGE = `[![Built with Agentic Product Starter](https://img.shields.io/badge/built%20with-Agentic%20Product%20Starter-3F5BD9)](https://github.com/${STARTER_REPO})`;

export function deriveNames(rawName, id) {
  const name = rawName.trim().replace(/\s+/g, ' ');
  if (!/^[A-Za-z][A-Za-z0-9 -]*$/.test(name)) throw new Error('--name may use letters, digits, spaces and hyphens, and must start with a letter, for example "Fashion Girl"');
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (!words.length || !/^[A-Za-z]/.test(words[0])) throw new Error('--name must start with a letter, for example "Fashion Girl"');
  const pascal = words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  const slug = words.map((w) => w.toLowerCase()).join('-');
  const flat = words.map((w) => w.toLowerCase()).join('');
  const appId = id ?? `com.${flat}.app`;
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(appId)) {
    throw new Error(`--id "${appId}" must look like com.company.app: lowercase letters, digits and underscores, at least three parts`);
  }
  const reserved = ['package', 'class', 'object', 'fun', 'val', 'var', 'when', 'is', 'in', 'as', 'do', 'if', 'try', 'interface', 'typealias'];
  if (appId.split('.').some((part) => reserved.includes(part))) throw new Error(`--id "${appId}" uses a Kotlin keyword`);
  return { name, pascal, slug, flat, appId, idPrefix: appId.split('.').slice(0, -1).join('.') };
}

/** Ordered replacements: longest and most specific first. */
export function contentRules(n) {
  return [
    ['Agentic Product Starter', n.name],
    ['Agentic Back Office', `${n.name} Back Office`],
    ['Agentic Product', n.name],
    ['Agentic App', n.name],
    ['Agentic Dev', `${n.name} Dev`],
    ['Agentic SYST', `${n.name} SYST`],
    ['AgenticProduct', n.pascal],
    ['AgenticApp', n.pascal],
    [OLD_ID, n.appId],
    ['com/agentic/app', n.appId.replaceAll('.', '/')],
    ['com.agentic', n.idPrefix],
    ['agentic-web-app', `${n.slug}-web-app`],
    ['agentic-back-office', `${n.slug}-back-office`],
    ['agentic-website', `${n.slug}-website`],
    ['agentic.admin.token', `${n.flat}.admin.token`],
    ['agentic.token', `${n.flat}.token`],
    ['agentic.example', `${n.flat}.example`],
    // Exact display-name spots that are just "Agentic".
    ['<string name="app_name">Agentic</string>', `<string name="app_name">${n.name}</string>`],
    ['APP_DISPLAY_NAME = Agentic\n', `APP_DISPLAY_NAME = ${n.name}\n`],
  ];
}

export function repoRules(repo) {
  if (!repo || repo === STARTER_REPO) return [];
  const [owner, name] = repo.split('/');
  return [
    [`raw.githubusercontent.com/${STARTER_REPO}/`, `raw.githubusercontent.com/${repo}/`],
    [`erumkatzwan.github.io/agentic-product-starter`, `${owner}.github.io/${name}`],
    [`github.com/${STARTER_REPO}`, `github.com/${repo}`],
    [`template_name=agentic-product-starter&template_owner=erumkatzwan`, `template_name=${name}&template_owner=${owner}`],
    // Badges and charts (shields.io, star-history) name the repository on its own.
    [STARTER_REPO, repo],
  ];
}

export function renameContent(text, rules) {
  return text
    .split('\n')
    .map((line) => (CREDIT.test(line) ? line : rules.reduce((acc, [from, to]) => acc.split(from).join(to), line + '\n').slice(0, -1)))
    .join('\n');
}

export function renamePath(path, n) {
  return path
    .split(sep)
    .join('/')
    .replaceAll('com/agentic/app', n.appId.replaceAll('.', '/'))
    .replaceAll('AgenticProduct', n.pascal)
    .replaceAll('AgenticApp', n.pascal);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP_DIRS.has(entry.name)) return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function removeEmptyDirs(dir) {
  if (!existsSync(dir) || !statSync(dir).isDirectory() || SKIP_DIRS.has(dir.split(sep).pop())) return;
  for (const entry of readdirSync(dir)) removeEmptyDirs(join(dir, entry));
  if (dir !== root && !readdirSync(dir).length) rmdirSync(dir);
}

function gitOutput(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function detectRepo() {
  const url = gitOutput(['remote', 'get-url', 'origin']);
  return url?.match(/github\.com[:/]([^/]+\/[^/.]+?)(\.git)?$/)?.[1] ?? null;
}

export function addCredit(readme) {
  if (readme.includes('Built with Agentic Product Starter](') || readme.includes('Built from the [Agentic Product Starter]')) return readme;
  const lines = readme.split('\n');
  const title = lines.findIndex((l) => l.startsWith('# '));
  lines.splice(title + 1, 0, '', BADGE);
  return lines.join('\n');
}

const LEFTOVER = /AgenticApp|AgenticProduct|com\.agentic|com\/agentic|Agentic (App|Dev|SYST|Back Office|Product)|agentic\.(token|admin|example)|agentic-(web-app|back-office|website)|>Agentic<|= Agentic$/;

export function leftovers() {
  const found = [];
  for (const file of walk(root)) {
    const rel = relative(root, file);
    if (rel === join('scripts', 'rename.mjs') || rel === 'LICENSE' || rel.startsWith(join('.github', 'workflows', 'rename-check'))) continue;
    if (/AgenticApp|AgenticProduct/.test(rel) || rel.split(sep).join('/').includes('com/agentic/')) found.push(`${rel} (path)`);
    if (!TEXT.test(rel.split(sep).pop())) continue;
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (LEFTOVER.test(line) && !CREDIT.test(line)) found.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
  }
  return found;
}

function main() {
  const args = process.argv.slice(2);
  const option = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
  if (args.includes('--check')) {
    const found = leftovers();
    if (found.length) {
      console.error(`The starter's name is still used here. Rename it, or teach scripts/rename.mjs the new spot:\n${found.join('\n')}`);
      process.exit(1);
    }
    console.log('No starter names left.');
    return;
  }
  if (!option('--name')) {
    console.error('Usage: node scripts/rename.mjs --name "Fashion Girl" [--id com.fashiongirl.app] [--repo owner/name] [--dry-run]');
    process.exit(2);
  }
  const dryRun = args.includes('--dry-run');
  const names = deriveNames(option('--name'), option('--id'));
  const repo = option('--repo') ?? detectRepo();

  if (!dryRun && !args.includes('--force') && gitOutput(['status', '--porcelain'])) {
    console.error('You have uncommitted changes. Commit or stash them first (or pass --force).');
    process.exit(1);
  }

  const rules = [...contentRules(names), ...repoRules(repo)];
  let edited = 0;
  let moved = 0;
  const changes = [];
  for (const file of walk(root)) {
    const rel = relative(root, file);
    if (rel === join('scripts', 'rename.mjs') || rel === 'LICENSE' || rel.startsWith(join('.github', 'workflows', 'rename-check'))) continue;
    const base = rel.split(sep).pop();
    let content = null;
    if (TEXT.test(base)) {
      const before = readFileSync(file, 'utf8');
      let after = renameContent(before, rules);
      if (rel === 'README.md') after = addCredit(after);
      if (after !== before) {
        content = after;
        edited++;
      }
    }
    const target = renamePath(rel, names);
    const isMove = target !== rel.split(sep).join('/');
    if (isMove) moved++;
    if (content !== null || isMove) changes.push(`${isMove ? `${rel} -> ${target}` : rel}${content !== null ? ' (edited)' : ''}`);
    if (dryRun) continue;
    if (content !== null) writeFileSync(file, content);
    if (isMove) {
      mkdirSync(dirname(join(root, target)), { recursive: true });
      renameSync(file, join(root, target));
    }
  }
  if (!dryRun) removeEmptyDirs(root);

  console.log(changes.join('\n'));
  console.log(`\n${dryRun ? 'Would change' : 'Changed'} ${edited} files and ${dryRun ? 'move' : 'moved'} ${moved}.`);
  console.log(`Name: ${names.name} · Code name: ${names.pascal} · App ID: ${names.appId} · Repo: ${repo ?? 'unchanged'}`);
  if (!dryRun) {
    console.log('\nNext: run each app\'s checks (see .agents/skills/rename-product/SKILL.md), then commit.');
  }
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') main();
