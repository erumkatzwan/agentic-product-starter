import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { securitySample } from './security-sample';

const dashboard = pathToFileURL(resolve(import.meta.dirname, '../security/index.html')).href;
const data = '**/security/security.json';


test('shows the counts by level, by app and every finding with its fix', async ({ page }) => {
  await page.route(data, (route) => route.fulfill({ json: securitySample }));
  await page.goto(dashboard);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Known vulnerabilities');
  await expect(page.locator('#level-critical')).toContainText('1');
  await expect(page.locator('#level-critical')).toContainText('Fix needed');
  await expect(page.locator('#level-high')).toContainText('None');
  await expect(page.locator('#security-apps')).toContainText('web-app');
  await expect(page.locator('#security-findings')).toContainText('1.0.1 or later');
  await expect(page.locator('#security-findings')).toContainText('No fix yet');
  await expect(page.getByRole('link', { name: 'CVE-2026-0001' })).toHaveAttribute('href', /osv\.dev\/vulnerability\/GHSA-aaaa/);
  await expect(page.getByRole('status')).toContainText('584 packages scanned');
});

test('says so when nothing is known', async ({ page }) => {
  await page.route(data, (route) =>
    route.fulfill({ json: { ...securitySample, counts: { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 }, findings: [] } }),
  );
  await page.goto(dashboard);

  await expect(page.locator('#security-findings')).toContainText('No known vulnerabilities in 584 packages.');
});

test('explains what to do before the first scan', async ({ page }) => {
  await page.route(data, (route) => route.fulfill({ status: 404, body: 'Not Found' }));
  await page.goto(dashboard);

  await expect(page.getByRole('status')).toContainText('No scan yet');
});

test('the landing page links to the security dashboard', async ({ page }) => {
  await page.goto(pathToFileURL(resolve(import.meta.dirname, '../index.html')).href);

  await expect(page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: 'Security' })).toHaveAttribute('href', 'security/');
});
