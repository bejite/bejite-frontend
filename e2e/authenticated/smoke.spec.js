import { test, expect } from '@playwright/test';

const hasCreds = Boolean(
  process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD,
);

test.describe('authenticated user smoke', () => {
  test.skip(!hasCreds, 'Set E2E_USER_EMAIL and E2E_USER_PASSWORD');

  test('session has accessToken and can open a protected path', async ({
    page,
  }) => {
    await page.goto('/news-feed');

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();

    await expect(page).not.toHaveURL(/\/$/);
    await expect(page.getByTestId('signin-form')).toHaveCount(0);
  });
});
