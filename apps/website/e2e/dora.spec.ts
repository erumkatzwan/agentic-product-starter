import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dashboard = pathToFileURL(resolve(import.meta.dirname, '../dora/index.html')).href;
const data = '**/metrics/dora.json';

const sample = {
  repository: 'owner/repo',
  generatedAt: '2026-11-16T06:23:00Z',
  windowDays: 30,
  deploymentSource: 'pull requests merged into main',
  metrics: {
    deploymentFrequency: { total: 42, perWeek: 9.8, level: 'elite' },
    leadTime: { medianHours: 3.5, changes: 42, level: 'elite' },
    changeFailureRate: { percent: 4.8, failures: 2, deployments: 42, level: 'elite' },
    timeToRestore: { medianHours: null, incidents: 0, open: 0, level: null },
  },
  history: [
    { date: '2026-11-09', deploymentsPerWeek: 7, leadTimeHours: 5, changeFailurePercent: 0, timeToRestoreHours: null },
    { date: '2026-11-16', deploymentsPerWeek: 9.8, leadTimeHours: 3.5, changeFailurePercent: 4.8, timeToRestoreHours: null },
  ],
};

test('shows the four keys with their DORA level', async ({ page }) => {
  await page.route(data, (route) => route.fulfill({ json: sample }));
  await page.goto(dashboard);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Delivery performance');
  await expect(page.locator('#deployment-frequency')).toContainText('9.8 / week');
  await expect(page.locator('#deployment-frequency')).toContainText('Elite');
  await expect(page.locator('#lead-time')).toContainText('3.5 h');
  await expect(page.locator('#change-failure-rate')).toContainText('4.8 %');
  await expect(page.locator('#time-to-restore')).toContainText('No incidents');
  await expect(page.getByRole('status')).toContainText('Last 30 days');
  await expect(page.locator('#deployment-frequency svg.sparkline')).toBeVisible();
});

test('explains what to do before the first run', async ({ page }) => {
  await page.route(data, (route) => route.fulfill({ status: 404, body: 'Not Found' }));
  await page.goto(dashboard);

  await expect(page.getByRole('status')).toContainText('No numbers yet');
});

test('the landing page links to the dashboard', async ({ page }) => {
  await page.goto(pathToFileURL(resolve(import.meta.dirname, '../index.html')).href);

  await expect(page.getByRole('link', { name: 'Delivery metrics' })).toHaveAttribute('href', 'dora/');
});
