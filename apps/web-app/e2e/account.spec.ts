import { expect, test } from '@playwright/test';

// Runs against the real backend in SYST with seeded test data.

test('a new customer signs up, edits the profile, signs out and back in, then deletes the account', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  page.on('dialog', (dialog) => dialog.accept());

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByLabel('Name').fill('End To End');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Password1!');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Hi, End To End' })).toBeVisible();
  await expect(page.getByText('Welcome to the starter app')).toBeVisible();

  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByLabel('Name').fill('Renamed Person');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Profile saved.')).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Password1!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Hi, Renamed Person' })).toBeVisible();

  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'Delete account' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Password1!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect.');
});

test('the seeded demo customer can sign in', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('customer@example.com');
  await page.getByLabel('Password').fill('Customer123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Hi, Demo Customer' })).toBeVisible();
});

test('sign up shows validation errors from the backend', async ({ page }) => {
  await page.goto('/signup');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Use at least 8 characters.')).toBeVisible();
  await expect(page.getByText('Enter your name.')).toBeVisible();
});
