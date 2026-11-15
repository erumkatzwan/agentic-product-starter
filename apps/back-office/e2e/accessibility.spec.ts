import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Every screen meets WCAG 2.2 AA in a real browser, colour contrast included (ADR-0011).
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

async function expectAccessible(page: Page, screen: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations.map((v) => `${screen}: ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)).toEqual([]);
}

test('every screen meets WCAG 2.2 AA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Back office sign in' })).toBeVisible();
  await expectAccessible(page, 'sign in');

  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('Admin123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  await expectAccessible(page, 'customers');

  await page.getByRole('link', { name: 'Demo Customer' }).click();
  await expect(page.getByRole('heading', { name: 'Demo Customer' })).toBeVisible();
  await expectAccessible(page, 'customer detail');

  await page.getByRole('link', { name: 'Feature flags' }).click();
  await expect(page.getByRole('heading', { name: 'Feature flags' })).toBeVisible();
  await expectAccessible(page, 'feature flags');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expectAccessible(page, 'feature flags (dark mode)');
});
