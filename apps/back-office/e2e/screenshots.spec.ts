import { expect, test } from '@playwright/test';

// Screenshots of the main pages for the README. Skipped in normal test runs;
// the Screenshots workflow sets SCREENSHOTS_DIR. Runs against the real backend in SYST.
const dir = process.env.SCREENSHOTS_DIR;

test.skip(!dir, 'Only runs in the Screenshots workflow');
test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });

test('back office screenshots', async ({ page }) => {
  await page.goto('/signin');
  await expect(page.getByRole('heading', { name: 'Back office sign in' })).toBeVisible();
  await page.screenshot({ path: `${dir}/back-office-sign-in.png` });

  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('Admin123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  await expect(page.getByText('customer@example.com').first()).toBeVisible();
  await page.screenshot({ path: `${dir}/back-office-customers.png` });

  await page.getByRole('link', { name: 'Feature flags' }).click();
  await expect(page.getByRole('heading', { name: 'Feature flags' })).toBeVisible();
  await page.screenshot({ path: `${dir}/back-office-feature-flags.png` });
});
