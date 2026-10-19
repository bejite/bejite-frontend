import { test, expect } from '@playwright/test';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const hasCreds = Boolean(email && password);

test.describe('user sign-in (public)', () => {
  test('shows login form on /', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('signin-form')).toBeVisible();
    await expect(page.getByTestId('signin-email')).toBeVisible();
    await expect(page.getByTestId('signin-password')).toBeVisible();
    await expect(page.getByTestId('signin-submit')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Welcome Back!' }),
    ).toBeVisible();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('signin-email').fill(email || 'nobody@example.com');
    await page
      .getByTestId('signin-password')
      .fill('definitely-wrong-password-xyz');
    await page.getByTestId('signin-submit').click();

    await expect(
      page
        .locator(
          '[data-testid="signin-error"], .Toastify__toast--error, .Toastify__toast--info',
        )
        .first(),
    ).toBeVisible({ timeout: 20_000 });

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeFalsy();
  });

  test('logs in via UI and stores accessToken', async ({ page }) => {
    test.skip(!hasCreds, 'Set E2E_USER_EMAIL and E2E_USER_PASSWORD');

    await page.goto('/');
    await page.getByTestId('signin-email').fill(email);
    await page.getByTestId('signin-password').fill(password);
    await page.getByTestId('signin-submit').click();

    const deadline = Date.now() + 30_000;
    let token = null;
    while (Date.now() < deadline) {
      token = await page.evaluate(() => localStorage.getItem('accessToken'));
      if (token) break;
      const err = page.getByTestId('signin-error');
      if (await err.isVisible().catch(() => false)) {
        throw new Error(
          `Login failed: ${(await err.textContent())?.trim()}. Start backend on :3001 (E2E defaults to local API).`,
        );
      }
      await page.waitForTimeout(200);
    }
    expect(token).toBeTruthy();

    await expect
      .poll(async () => new URL(page.url()).pathname, { timeout: 30_000 })
      .not.toBe('/');

    const pathname = new URL(page.url()).pathname;
    expect(
      ['/news-feed', '/resume', '/complete-signup'].some((p) =>
        pathname.startsWith(p),
      ),
    ).toBe(true);
  });
});
