import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const page = pathToFileURL(resolve(import.meta.dirname, '../index.html')).href;

test('landing page shows every section and the call to action', async ({ page: browser }) => {
  await browser.goto(page);

  await expect(browser.getByRole('heading', { level: 1 })).toHaveText('The agentic product foundation.');
  for (const section of ["What's inside", 'Built for', 'How it works', 'Quality built in']) {
    await expect(browser.getByRole('heading', { level: 2, name: section })).toBeVisible();
  }
  await expect(browser.getByRole('link', { name: 'View on GitHub' })).toHaveAttribute('href', /github\.com/);
});

test('uses the shared design tokens', async ({ page: browser }) => {
  await browser.goto(page);

  const primary = await browser.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim());
  expect(primary).toBe('#3F5BD9');
});

test('the footer links to the repository, docs, changelog and LinkedIn', async ({ page: browser }) => {
  await browser.goto(page);

  const footer = browser.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', /github\.com\/erumkatzwan\/agentic-product-starter$/);
  await expect(footer.getByRole('link', { name: 'Changelog' })).toHaveAttribute('href', /\/releases$/);
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com\/in\/erumkatzwan/);
  await expect(footer).toContainText('Wisdom knows which questions matter.');
});

test('the theme button switches between light and dark mode and remembers it', async ({ page: browser }) => {
  await browser.emulateMedia({ colorScheme: 'light' });
  await browser.goto(page);
  const background = () => browser.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const light = await background();

  await browser.getByRole('button', { name: 'Dark mode' }).click();
  expect(await background()).not.toBe(light);
  await expect(browser.getByRole('button', { name: 'Light mode' })).toBeVisible();

  await browser.reload();
  expect(await browser.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
});
