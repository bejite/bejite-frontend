import { test, expect } from '@playwright/test';

const hasCreds = Boolean(
  process.env.E2E_ADMIN_USERNAME && process.env.E2E_ADMIN_PASSWORD,
);

async function getAdminRole(page) {
  return page.evaluate(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const user = JSON.parse(raw);
      return String(user?.admin_role || '').toLowerCase();
    } catch {
      return null;
    }
  });
}

test.describe('authenticated admin flows', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD');

  test('dashboard shows overview KPIs', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.getByTestId('admin-dashboard')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByTestId('admin-kpi-total-users')).toBeVisible();
    await expect(
      page.getByText(/Platform overview and engagement metrics/i),
    ).toBeVisible();
  });

  test('super_admin can open users and jobs lists', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.getByTestId('admin-dashboard')).toBeVisible({
      timeout: 30_000,
    });

    const role = await getAdminRole(page);
    test.skip(
      role !== 'super_admin',
      `Users/Jobs lists require super_admin (got: ${role || 'unknown'})`,
    );

    await page.goto('/admin/users');
    await expect(page.getByTestId('admin-users-page')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole('heading', { name: 'User Management' }),
    ).toBeVisible();
    await expect(page.getByPlaceholder('Search users...')).toBeVisible();

    await page.goto('/admin/jobs');
    await expect(page.getByTestId('admin-jobs-page')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole('heading', { name: 'Job Listings' }),
    ).toBeVisible();
  });
});
