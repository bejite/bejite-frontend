import { test, expect } from '@playwright/test';

const username = process.env.E2E_ADMIN_USERNAME;
const password = process.env.E2E_ADMIN_PASSWORD;
const hasCreds = Boolean(username && password);

test.describe('admin sign-in (public)', () => {
  test('shows login form on /admin/login', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByTestId('admin-login-form')).toBeVisible();
    await expect(page.getByTestId('admin-login-username')).toBeVisible();
    await expect(page.getByTestId('admin-login-password')).toBeVisible();
    await expect(page.getByTestId('admin-login-submit')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Admin Access' }),
    ).toBeVisible();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page
      .getByTestId('admin-login-username')
      .fill(username || 'not-an-admin');
    await page
      .getByTestId('admin-login-password')
      .fill('definitely-wrong-password-xyz');
    await page.getByTestId('admin-login-submit').click();

    await expect(page.getByTestId('admin-login-error')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page).toHaveURL(/\/admin\/login\/?$/);
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeFalsy();
  });

  test('logs in via UI and reaches an admin page', async ({ page }) => {
    test.skip(!hasCreds, 'Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD');

    await page.goto('/admin/login');
    await page.getByTestId('admin-login-username').fill(username);
    await page.getByTestId('admin-login-password').fill(password);
    await page.getByTestId('admin-login-submit').click();

    await page.waitForFunction(() => !!localStorage.getItem('accessToken'), null, {
      timeout: 30_000,
    });

    await expect
      .poll(async () => new URL(page.url()).pathname, { timeout: 30_000 })
      .toMatch(/^\/admin\/(dashboard|revenue)/);
  });
});
