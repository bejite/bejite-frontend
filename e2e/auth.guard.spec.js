import { test, expect } from '@playwright/test';

test.describe('protected routes (public)', () => {
  test('unauthenticated user is redirected from protected candidate search', async ({
    page,
  }) => {
    await page.goto('/candidate-search-page');
    await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
    await expect(page.getByTestId('signin-form')).toBeVisible();
  });
});
