import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Every screen meets WCAG 2.2 AA in a real browser, colour contrast included (ADR-0011).
test.skip(process.env.ACCESSIBILITY_CHECKS === 'off', 'Accessibility checks are off (repository variable ACCESSIBILITY_CHECKS)');

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

async function expectAccessible(page: Page, screen: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations.map((v) => `${screen}: ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)).toEqual([]);
}

test('every screen meets WCAG 2.2 AA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expectAccessible(page, 'sign in');

  await page.getByRole('link', { name: 'Create an account' }).click();
  await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  await expectAccessible(page, 'sign up');

  await page.getByLabel('Name').fill('Accessible Person');
  await page.getByLabel('Email').fill(`a11y-${Date.now()}@example.com`);
  await page.getByLabel('Password').fill('Password1!');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Hi, Accessible Person' })).toBeVisible();
  await expectAccessible(page, 'home');

  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  await expectAccessible(page, 'profile');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expectAccessible(page, 'profile (dark mode)');
});
