import { expect, test } from '@playwright/test';

// Runs against the real backend in SYST with the seeded admin and demo customer.

async function signInAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('Admin123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
}

test('customers cannot sign in to the back office', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('customer@example.com');
  await page.getByLabel('Password').fill('Customer123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('This account is not an administrator.');
});

test('support finds, edits, disables and deletes a customer', async ({ page, request }) => {
  const email = `support-${Date.now()}@example.com`;
  const signUp = await request.post('http://localhost:5080/api/auth/signup', {
    data: { email, password: 'Password1!', displayName: 'Needs Help' },
  });
  expect(signUp.ok()).toBeTruthy();
  page.on('dialog', (dialog) => dialog.accept());

  await signInAsAdmin(page);
  await page.getByLabel('Search by name or email').fill(email);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('link', { name: 'Needs Help' }).click();

  await page.getByLabel('Name').fill('Helped Customer');
  await page.getByLabel('Disable account (blocks sign in)').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Customer saved.')).toBeVisible();

  const blocked = await request.post('http://localhost:5080/api/auth/signin', { data: { email, password: 'Password1!' } });
  expect(blocked.status()).toBe(403);

  await page.getByRole('button', { name: 'Delete customer' }).click();
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  await page.getByLabel('Search by name or email').fill(email);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('No customers found.')).toBeVisible();
});

test('admins switch a feature flag that every app reads', async ({ page, request }) => {
  await signInAsAdmin(page);
  await page.getByRole('link', { name: 'Feature flags' }).click();

  const toggle = page.getByRole('checkbox', { name: 'push_prompt' });
  const before = await toggle.isChecked();
  await toggle.click();
  await expect(toggle).toBeChecked({ checked: !before });

  const flags = await (await request.get('http://localhost:5080/api/feature-flags')).json();
  expect(flags.flags.push_prompt).toBe(!before);

  await toggle.click();
  await expect(toggle).toBeChecked({ checked: before });
});
