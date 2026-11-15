// Example security.json for the dashboard tests (the real one is published by the Security workflow).
export const securitySample = {
  generatedAt: '2026-11-16T05:17:00Z',
  source: 'OSV (https://osv.dev)',
  packages: 584,
  counts: { critical: 1, high: 0, medium: 2, low: 0, unknown: 0 },
  apps: [
    { app: 'backend', packages: 40, counts: { critical: 0, high: 0, medium: 2, low: 0, unknown: 0 } },
    { app: 'web-app', packages: 300, counts: { critical: 1, high: 0, medium: 0, low: 0, unknown: 0 } },
  ],
  findings: [
    { level: 'critical', app: 'web-app', ecosystem: 'npm', package: 'left-pad', version: '1.0.0', fixed: '1.0.1', scope: 'runtime', id: 'GHSA-aaaa-bbbb-cccc', cve: 'CVE-2026-0001', summary: 'Example', url: 'https://osv.dev/vulnerability/GHSA-aaaa-bbbb-cccc' },
    { level: 'medium', app: 'backend', ecosystem: 'NuGet', package: 'Some.Lib', version: '2.0.0', fixed: null, scope: 'runtime', id: 'GHSA-dddd-eeee-ffff', cve: '', summary: 'Example', url: 'https://osv.dev/vulnerability/GHSA-dddd-eeee-ffff' },
  ],
  notScanned: [],
};
