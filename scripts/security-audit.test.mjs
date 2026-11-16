import assert from 'node:assert/strict';
import { test } from 'node:test';
import { badge, severityOf, summary } from './security-audit.mjs';

const packages = [
  { app: 'web-app', ecosystem: 'npm', name: 'left-pad', version: '1.0.0', scope: 'runtime' },
  { app: 'web-app', ecosystem: 'npm', name: 'vite', version: '6.0.0', scope: 'dev' },
  { app: 'backend', ecosystem: 'NuGet', name: 'Some.Lib', version: '2.0.0', scope: 'runtime' },
];
const findings = [
  { ...packages[0], id: 'GHSA-aaaa', cve: 'CVE-2026-1', summary: 'Bad thing', severity: 'CRITICAL', fixed: '1.0.1' },
  { ...packages[2], id: 'GHSA-bbbb', cve: '', summary: 'Less bad', severity: 'MODERATE', fixed: null },
];

test('the dashboard data counts findings per level, overall and per app', () => {
  const data = summary(findings, packages, ['iOS: no packages'], '2026-11-15T00:00:00Z');
  assert.equal(data.packages, 3);
  assert.deepEqual(data.counts, { critical: 1, high: 0, medium: 1, low: 0, unknown: 0 });
  assert.deepEqual(data.apps.map((a) => [a.app, a.packages, a.counts.critical, a.counts.medium]), [['backend', 1, 0, 1], ['web-app', 2, 1, 0]]);
  assert.equal(data.findings[0].level, 'critical');
  assert.equal(data.findings[0].url, 'https://osv.dev/vulnerability/GHSA-aaaa');
  assert.equal(data.findings[1].fixed, null);
  assert.deepEqual(data.notScanned, ['iOS: no packages']);
});

test('the badge shows every level, critical first; red for critical or high, amber for medium, green when clear', () => {
  const at = (counts) => badge({ counts: { critical: 0, high: 0, medium: 0, low: 0, unknown: 0, ...counts } });
  assert.deepEqual(at({ critical: 1 }), { schemaVersion: 1, label: 'vulnerabilities', message: '1 critical · 0 high · 0 medium · 0 low', color: '#C93636' });
  assert.equal(at({ high: 2 }).color, '#C93636');
  assert.deepEqual([at({ medium: 3 }).message, at({ medium: 3 }).color], ['0 critical · 0 high · 3 medium · 0 low', '#9A5C00']);
  assert.deepEqual([at({}).message, at({}).color], ['0 critical · 0 high · 0 medium · 0 low', '#1A7F45']);
});

test('severity comes from the advisory label, or else the CVSS score', () => {
  assert.equal(severityOf({ database_specific: { severity: 'HIGH' } }), 'HIGH');
  assert.equal(severityOf({ database_specific: { severity: 'MEDIUM' } }), 'MODERATE');
  assert.equal(severityOf({ severity: [{ score: '9.8' }] }), 'CRITICAL');
  assert.equal(severityOf({}), 'UNKNOWN');
});
