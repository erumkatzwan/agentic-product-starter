import { expect, test } from '@playwright/test';

// Screenshots of the main pages for the README. Skipped in normal test runs;
// the Screenshots workflow sets SCREENSHOTS_DIR. Runs against the real backend in SYST.
const dir = process.env.SCREENSHOTS_DIR;

test.skip(!dir, 'Only runs in the Screenshots workflow');
test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });

test('web app screenshots', async ({ page }) => {
  await page.goto('/signin');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.screenshot({ path: `${dir}/web-app-sign-in.png` });

  await page.getByLabel('Email').fill('customer@example.com');
  await page.getByLabel('Password').fill('Customer123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Hi, Demo Customer' })).toBeVisible();
  await expect(page.getByText('Welcome to the starter app')).toBeVisible();
  await page.screenshot({ path: `${dir}/web-app-home.png` });

  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page.getByLabel('Name')).toBeVisible();
  await page.screenshot({ path: `${dir}/web-app-profile.png` });
});
