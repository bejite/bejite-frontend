import { test, expect } from '@playwright/test';

const hasCreds = Boolean(
  process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD,
);

test.describe('authenticated user flows', () => {
  test.skip(!hasCreds, 'Set E2E_USER_EMAIL and E2E_USER_PASSWORD');

  test('news feed shows composer', async ({ page }) => {
    await page.goto('/news-feed');
    await expect(page).toHaveURL(/\/news-feed/);
    await expect(page.getByTestId('news-feed')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('news-feed-start-post')).toBeVisible();
    await expect(page.getByText('Start a post')).toBeVisible();
  });

  test('employer dashboard loads stats', async ({ page }) => {
    await page.goto('/employer/dashboard');
    await expect(page.getByTestId('employer-dashboard')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole('heading', { name: 'Employer Dashboard' }),
    ).toBeVisible();
    await expect(page.getByText('Total Jobs')).toBeVisible();
    await expect(page.getByText('Active Jobs')).toBeVisible();
  });

  test('job vacancy listing page loads', async ({ page }) => {
    await page.goto('/job-vacancy');
    await expect(
      page.getByRole('heading', { name: /Find Your Next Opportunity/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByPlaceholder(/Search jobs, companies, skills/i),
    ).toBeVisible();
  });
});
