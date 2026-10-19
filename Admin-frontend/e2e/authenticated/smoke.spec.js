import { test, expect } from '@playwright/test';

const hasCreds = Boolean(
  process.env.E2E_ADMIN_USERNAME && process.env.E2E_ADMIN_PASSWORD,
);

test.describe('authenticated admin smoke', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD');

  test('session has accessToken and dashboard is reachable', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard');

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();

    await expect(page.getByTestId('admin-login-form')).toHaveCount(0);
    await expect(page).toHaveURL(/\/admin\/(dashboard|revenue)/);
  });
});
