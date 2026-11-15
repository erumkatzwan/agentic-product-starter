import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Both pages meet WCAG 2.2 AA in light and dark mode, colour contrast included (ADR-0011).
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];
const url = (file: string) => pathToFileURL(resolve(import.meta.dirname, '..', file)).href;
const sample = {
  generatedAt: '2026-11-16T06:23:00Z',
  windowDays: 30,
  deploymentSource: 'pull requests merged into main',
  metrics: {
    deploymentFrequency: { total: 23, perWeek: 5.4, level: 'high' },
    leadTime: { medianHours: 0.1, changes: 23, level: 'elite' },
    changeFailureRate: { percent: 4.8, failures: 1, deployments: 23, level: 'medium' },
    timeToRestore: { medianHours: 30, incidents: 1, open: 0, level: 'low' },
  },
  history: [
    { date: '2026-11-09', deploymentsPerWeek: 4, leadTimeHours: 1, changeFailurePercent: 0, timeToRestoreHours: null },
    { date: '2026-11-16', deploymentsPerWeek: 5.4, leadTimeHours: 0.1, changeFailurePercent: 4.8, timeToRestoreHours: 30 },
  ],
};

async function expectAccessible(page: Page, name: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations.map((v) => `${name}: ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)).toEqual([]);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`landing page and dashboard meet WCAG 2.2 AA (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.route('**/metrics/dora.json', (route) => route.fulfill({ json: sample }));

    await page.goto(url('index.html'));
    await expectAccessible(page, 'landing page');

    await page.goto(url('dora/index.html'));
    await expect(page.locator('#time-to-restore')).toContainText('30 h');
    await expectAccessible(page, 'dashboard');
  });
}
