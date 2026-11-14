import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const page = pathToFileURL(resolve(import.meta.dirname, '../index.html')).href;

test('landing page shows every section and the call to action', async ({ page: browser }) => {
  await browser.goto(page);

  await expect(browser.getByRole('heading', { level: 1 })).toHaveText('Start your next product with AI agents, end to end.');
  for (const section of ["What's inside", 'How it works', 'Quality built in']) {
    await expect(browser.getByRole('heading', { level: 2, name: section })).toBeVisible();
  }
  await expect(browser.getByRole('link', { name: 'View on GitHub' })).toHaveAttribute('href', /github\.com/);
});

test('uses the shared design tokens', async ({ page: browser }) => {
  await browser.goto(page);

  const primary = await browser.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim());
  expect(primary).toBe('#3F5BD9');
});
