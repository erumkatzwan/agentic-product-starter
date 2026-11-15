#!/usr/bin/env node
// Security audit for every app in the repo: one report of known vulnerabilities in dependencies.
//
// Collects the exact dependency versions each app ships, asks the OSV database (https://osv.dev,
// which aggregates GitHub, npm, NuGet and Maven advisories) which ones are vulnerable, and prints
// a Markdown report with the lowest fixed version for each finding.
//
//   node scripts/security-audit.mjs                     # report to the terminal
//   node scripts/security-audit.mjs --out report.md     # also write the report to a file
//   node scripts/security-audit.mjs --fail-on high      # exit 1 if anything is high or critical
//   node scripts/security-audit.mjs --list              # only list the packages found, no network
//   node scripts/security-audit.mjs --json security.json --badge security-badge.json
//                                                       # results for the security dashboard and README badge
//
// Sources: npm lock files (web app, back office, website), NuGet (backend, after `dotnet restore`),
// Gradle (Android, needs Java), Swift Package Manager (iOS, when packages are added).
// Requires Node 22+. No npm install needed.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEVERITIES = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'UNKNOWN'];
const OSV = 'https://api.osv.dev/v1';

// ---------- collectors: each returns [{ app, ecosystem, name, version, scope }] ----------

export function npmPackages(app, lockText) {
  const lock = JSON.parse(lockText);
  return Object.entries(lock.packages ?? {})
    .filter(([path, info]) => path && info.version && !info.link)
    .map(([path, info]) => ({
      app,
      ecosystem: 'npm',
      name: info.name ?? path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length),
      version: info.version,
      scope: info.dev ? 'dev' : 'runtime',
    }));
}

export function nugetPackages(app, assetsText, isTestProject = false) {
  const assets = JSON.parse(assetsText);
  const direct = new Set(
    Object.values(assets.project?.frameworks ?? {}).flatMap((f) => Object.keys(f.dependencies ?? {}).map((n) => n.toLowerCase())),
  );
  return Object.entries(assets.libraries ?? {})
    .filter(([, info]) => info.type === 'package')
    .map(([key]) => {
      const [name, version] = key.split('/');
      const scope = isTestProject ? 'dev' : direct.has(name.toLowerCase()) ? 'runtime' : 'transitive';
      return { app, ecosystem: 'NuGet', name, version, scope };
    });
}

export function gradlePackages(app, dependencyTree) {
  const found = new Map();
  for (const line of dependencyTree.split('\n')) {
    const match = line.match(/[+\\]--- ([\w.-]+):([\w.-]+):([\w.+-]+)(?: -> ([\w.+-]+))?/);
    if (!match || line.includes('(c)')) continue;
    const [, group, artifact, requested, resolved] = match;
    const version = resolved ?? requested;
    found.set(`${group}:${artifact}`, { app, ecosystem: 'Maven', name: `${group}:${artifact}`, version, scope: 'runtime' });
  }
  return [...found.values()];
}

export function swiftPackages(app, resolvedText) {
  const resolved = JSON.parse(resolvedText);
  const pins = resolved.pins ?? resolved.object?.pins ?? [];
  return pins
    .filter((pin) => pin.state?.version)
    .map((pin) => ({
      app,
      ecosystem: 'SwiftURL',
      name: (pin.location ?? pin.repositoryURL).replace(/^https?:\/\//, '').replace(/\.git$/, ''),
      version: pin.state.version,
      scope: 'runtime',
    }));
}

function findFiles(dir, fileName, depth = 6) {
  if (depth < 0 || !existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', '.git', 'build', 'DerivedData', '.gradle'].includes(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findFiles(path, fileName, depth - 1);
    return entry.name === fileName ? [path] : [];
  });
}

function listProjects(dir, depth = 5) {
  if (depth < 0 || !existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['bin', 'obj', 'node_modules', '.git'].includes(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listProjects(path, depth - 1);
    return entry.name.endsWith('.csproj') ? [path] : [];
  });
}

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
}

function collect(warn) {
  const packages = [];
  for (const app of ['web-app', 'back-office', 'website']) {
    const lock = join(root, 'apps', app, 'package-lock.json');
    if (existsSync(lock)) packages.push(...npmPackages(app, readFileSync(lock, 'utf8')));
  }

  const backend = join(root, 'backend');
  if (existsSync(backend)) {
    const csprojs = listProjects(backend);
    if (csprojs.some((p) => !existsSync(join(dirname(p), 'obj', 'project.assets.json')))) {
      try {
        run('dotnet', ['restore'], backend);
      } catch {
        warn('backend: run `dotnet restore` (needs the .NET SDK and network) to include every NuGet package.');
      }
    }
    for (const csproj of csprojs) {
      const assets = join(dirname(csproj), 'obj', 'project.assets.json');
      const isTest = /test/i.test(relative(backend, csproj));
      if (existsSync(assets)) packages.push(...nugetPackages('backend', readFileSync(assets, 'utf8'), isTest));
    }
  }

  const android = join(root, 'apps', 'android');
  if (existsSync(join(android, 'gradlew'))) {
    try {
      const tree = run('sh', ['./gradlew', '-q', ':app:dependencies', '--configuration', 'systReleaseRuntimeClasspath'], android);
      packages.push(...gradlePackages('android', tree));
    } catch {
      warn('android: Gradle could not list dependencies (needs Java 17+ and network). Android is still covered by Dependabot alerts.');
    }
  }

  for (const file of findFiles(join(root, 'apps', 'ios'), 'Package.resolved')) {
    packages.push(...swiftPackages('ios', readFileSync(file, 'utf8')));
  }

  const unique = new Map();
  for (const p of packages) unique.set(`${p.app}|${p.ecosystem}|${p.name}|${p.version}`, p);
  return [...unique.values()];
}

// ---------- OSV ----------

async function post(path, body) {
  const response = await fetch(`${OSV}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`OSV ${path} answered ${response.status}`);
  return response.json();
}

async function get(path) {
  const response = await fetch(`${OSV}${path}`);
  if (!response.ok) throw new Error(`OSV ${path} answered ${response.status}`);
  return response.json();
}

async function lookup(packages) {
  const hits = [];
  for (let i = 0; i < packages.length; i += 500) {
    const chunk = packages.slice(i, i + 500);
    const { results } = await post('/querybatch', {
      queries: chunk.map((p) => ({ package: { name: p.name, ecosystem: p.ecosystem }, version: p.version })),
    });
    results.forEach((result, j) => (result.vulns ?? []).forEach((v) => hits.push({ pkg: chunk[j], id: v.id })));
  }
  const ids = [...new Set(hits.map((h) => h.id))];
  const details = new Map();
  for (let i = 0; i < ids.length; i += 8) {
    const batch = await Promise.all(ids.slice(i, i + 8).map((id) => get(`/vulns/${encodeURIComponent(id)}`)));
    batch.forEach((v) => details.set(v.id, v));
  }
  return hits.map((h) => ({ ...h, vuln: details.get(h.id) }));
}

// ---------- analysis ----------

export function compareVersions(a, b) {
  const parts = (v) => v.split(/[.+-]/).map((x) => (/^\d+$/.test(x) ? Number(x) : x));
  const [pa, pb] = [parts(a), parts(b)];
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const [x, y] = [pa[i] ?? 0, pb[i] ?? 0];
    if (x === y) continue;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x).localeCompare(String(y));
  }
  return 0;
}

export function severityOf(vuln) {
  const label = String(vuln.database_specific?.severity ?? '').toUpperCase();
  if (SEVERITIES.includes(label)) return label;
  if (label === 'MEDIUM') return 'MODERATE';
  const score = vuln.severity?.map((s) => parseFloat(s.score)).find((n) => !Number.isNaN(n));
  if (score >= 9) return 'CRITICAL';
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MODERATE';
  if (score > 0) return 'LOW';
  return 'UNKNOWN';
}

export function fixedVersion(vuln, pkg) {
  const fixes = (vuln.affected ?? [])
    .filter((a) => a.package?.name?.toLowerCase() === pkg.name.toLowerCase())
    .flatMap((a) => (a.ranges ?? []).flatMap((r) => r.events ?? []))
    .map((e) => e.fixed)
    .filter((v) => v && compareVersions(v, pkg.version) > 0)
    .sort(compareVersions);
  return fixes[0] ?? null;
}

export function toFindings(hits) {
  return hits
    .map(({ pkg, vuln }) => ({
      ...pkg,
      id: vuln.id,
      cve: (vuln.aliases ?? []).find((a) => a.startsWith('CVE-')) ?? '',
      summary: (vuln.summary ?? vuln.details ?? '').split('\n')[0].slice(0, 120),
      severity: severityOf(vuln),
      fixed: fixedVersion(vuln, pkg),
    }))
    .sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) || a.app.localeCompare(b.app));
}

export function report(findings, packages, warnings) {
  const lines = ['# Security audit', ''];
  const apps = [...new Set(packages.map((p) => p.app))];
  lines.push(`Scanned ${packages.length} packages in ${apps.join(', ') || 'no apps'} against [OSV](https://osv.dev).`, '');
  if (!findings.length) {
    lines.push('**No known vulnerabilities.**', '');
  } else {
    lines.push('| Severity | App | Package | Version | Fix: upgrade to | Scope | Advisory |', '|---|---|---|---|---|---|---|');
    for (const f of findings) {
      const advisory = `[${f.id}](https://osv.dev/vulnerability/${f.id})${f.cve && f.cve !== f.id ? ` (${f.cve})` : ''}`;
      lines.push(`| ${f.severity} | ${f.app} | \`${f.name}\` | ${f.version} | ${f.fixed ? `**${f.fixed}** or later` : 'no fix yet'} | ${f.scope} | ${advisory} |`);
    }
    lines.push('');
    const counts = SEVERITIES.map((s) => [s, findings.filter((f) => f.severity === s).length]).filter(([, n]) => n);
    lines.push(`Totals: ${counts.map(([s, n]) => `${n} ${s.toLowerCase()}`).join(', ')}.`, '');
    lines.push('How to fix: see `.agents/skills/security-audit/SKILL.md` (direct dependencies, transitive overrides, verification).', '');
  }
  if (warnings.length) lines.push('**Not scanned:**', ...warnings.map((w) => `- ${w}`), '');
  return lines.join('\n');
}

// ---------- dashboard data ----------

const LEVELS = { CRITICAL: 'critical', HIGH: 'high', MODERATE: 'medium', LOW: 'low', UNKNOWN: 'unknown' };

/** Counts per level, overall and per app, plus every finding: the data behind the security dashboard. */
export function summary(findings, packages, warnings, generatedAt = new Date().toISOString()) {
  const count = (list) => Object.fromEntries(Object.values(LEVELS).map((level) => [level, list.filter((f) => LEVELS[f.severity] === level).length]));
  const apps = [...new Set(packages.map((p) => p.app))].sort();
  return {
    generatedAt,
    source: 'OSV (https://osv.dev)',
    packages: packages.length,
    counts: count(findings),
    apps: apps.map((app) => ({
      app,
      packages: packages.filter((p) => p.app === app).length,
      counts: count(findings.filter((f) => f.app === app)),
    })),
    findings: findings.map((f) => ({
      level: LEVELS[f.severity],
      app: f.app,
      ecosystem: f.ecosystem,
      package: f.name,
      version: f.version,
      fixed: f.fixed,
      scope: f.scope,
      id: f.id,
      cve: f.cve,
      summary: f.summary,
      url: `https://osv.dev/vulnerability/${f.id}`,
    })),
    notScanned: warnings,
  };
}

/** A shields.io endpoint badge: red for critical or high, amber for medium, green otherwise. */
export function badge(data) {
  const { critical, high, medium, low } = data.counts;
  const color = critical || high ? 'C93636' : medium ? '9A5C00' : '1A7F45';
  const message = critical || high ? `${critical} critical · ${high} high` : medium || low ? `${medium} medium · ${low} low` : 'none known';
  return { schemaVersion: 1, label: 'vulnerabilities', message, color: `#${color}` };
}

// ---------- main ----------

async function main() {
  const args = process.argv.slice(2);
  const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const warnings = [];
  const packages = collect((w) => warnings.push(w));

  if (args.includes('--list')) {
    for (const p of packages) console.log(`${p.app}\t${p.ecosystem}\t${p.name}\t${p.version}\t${p.scope}`);
    console.error(`${packages.length} packages`);
    warnings.forEach((w) => console.error(`warning: ${w}`));
    return;
  }

  const findings = toFindings(await lookup(packages));
  const text = report(findings, packages, warnings);
  console.log(text);
  if (option('--out')) writeFileSync(option('--out'), text);
  if (option('--json') || option('--badge')) {
    const data = summary(findings, packages, warnings);
    if (option('--json')) writeFileSync(option('--json'), `${JSON.stringify(data, null, 2)}\n`);
    if (option('--badge')) writeFileSync(option('--badge'), `${JSON.stringify(badge(data))}\n`);
  }

  const failOn = option('--fail-on')?.toUpperCase();
  if (failOn) {
    const limit = SEVERITIES.indexOf(failOn === 'MEDIUM' ? 'MODERATE' : failOn);
    if (limit < 0) throw new Error(`--fail-on must be one of ${SEVERITIES.slice(0, 4).join(', ').toLowerCase()}`);
    const blocking = findings.filter((f) => SEVERITIES.indexOf(f.severity) <= limit);
    if (blocking.length) {
      console.error(`${blocking.length} finding(s) at ${failOn.toLowerCase()} or above.`);
      process.exitCode = 1;
    }
  }
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 2;
  });
}
