import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '.auth/admin.json');

const username = process.env.E2E_ADMIN_USERNAME;
const password = process.env.E2E_ADMIN_PASSWORD;
const hasCreds = Boolean(username && password);

function writeEmptyAuth() {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.writeFileSync(
    authFile,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  );
}

async function waitForLoginSuccess(page) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (token) return;

    const inline = page.getByTestId('admin-login-error');
    if (await inline.isVisible().catch(() => false)) {
      throw new Error(
        `Admin login failed: ${(await inline.textContent())?.trim() || 'unknown error'}. Check E2E_ADMIN_* and API :3001.`,
      );
    }
    await page.waitForTimeout(200);
  }
  throw new Error('Admin login timed out waiting for accessToken');
}

setup('authenticate as admin', async ({ page }) => {
  if (!hasCreds) {
    writeEmptyAuth();
    setup.skip(true, 'Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD');
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('admin-login-username').waitFor({
    state: 'visible',
    timeout: 30_000,
  });
  await page.getByTestId('admin-login-username').fill(username);
  await page.getByTestId('admin-login-password').fill(password);
  await page.getByTestId('admin-login-submit').click();

  await waitForLoginSuccess(page);

  await expect
    .poll(async () => new URL(page.url()).pathname, { timeout: 30_000 })
    .toMatch(/^\/admin\/(dashboard|revenue)/);

  await page.context().storageState({ path: authFile });
});
