import { test, expect } from '@playwright/test';

const RECRUITERS = Array.from({ length: 12 }, (_, idx) => {
  const num = idx + 1;
  return {
    id: `rec-${num}`,
    firstName: 'Recruiter',
    lastName: `Person ${num}`,
    jobTitle: num % 2 === 0 ? 'Talent Partner' : 'HR Analyst',
    companyName: num % 3 === 0 ? `Acme Corp ${num}` : null,
    isCorporate: num % 3 === 0,
    mode: num % 3 === 0 ? 'corporate' : 'recruiter',
    profilePhoto: null,
  };
});

test.describe('Connect With Recruiters selection (public)', () => {
  test('allows selecting and unselecting recruiters before completing signup', async ({
    page,
  }) => {
    let submittedPayload = null;

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'signup-session-token');
      localStorage.setItem('authToken', 'signup-session-token');
    });

    await page.route('**/auth/signup/discover-recruiters**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: RECRUITERS }),
      });
    });

    await page.route('**/auth/complete-signup', async (route) => {
      submittedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Signup completed successfully!',
          accessToken: 'completed-token',
          user: { id: 'usr-new-1', email: 'tester@example.com' },
        }),
      });
    });

    await page.route('**/connections/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.route('**/follows/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto(
      '/jobconnection?email=tester%40example.com&role=jobseeker&mode=active_jobseeker',
    );

    await expect(page.getByText('Connect With Recruiters')).toBeVisible();
    await expect(page.getByText('0/10 recruiters selected')).toBeVisible();

    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeDisabled();

    // Select first recruiter -> transitions to Added (pressed) and updates count
    const firstAddBtn = page.getByRole('button', {
      name: 'Add Recruiter Person 1',
      exact: true,
    });
    await firstAddBtn.click();
    await expect(page.getByText('1/10 recruiters selected')).toBeVisible();

    const firstUnselectBtn = page.getByRole('button', {
      name: 'Unselect Recruiter Person 1',
      exact: true,
    });
    await expect(firstUnselectBtn).toHaveAttribute('aria-pressed', 'true');
    await firstUnselectBtn.hover();
    await expect(firstUnselectBtn.getByText('Remove')).toBeVisible();

    // Unselect first recruiter -> reverts back to + Add and decrements count
    await firstUnselectBtn.click();
    await expect(page.getByText('0/10 recruiters selected')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Add Recruiter Person 1', exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');

    // Select recruiters 1..10 -> unlocks Continue
    for (let i = 1; i <= 10; i += 1) {
      await page
        .getByRole('button', { name: `Add Recruiter Person ${i}`, exact: true })
        .click();
    }
    await expect(page.getByText('10/10 recruiters selected')).toBeVisible();
    await expect(continueBtn).toBeEnabled();

    // Unselect recruiter 5 -> drops back to 9/10 and disables Continue again
    await page
      .getByRole('button', { name: 'Unselect Recruiter Person 5', exact: true })
      .click();
    await expect(page.getByText('9/10 recruiters selected')).toBeVisible();
    await expect(continueBtn).toBeDisabled();

    // Select recruiter 11 to reach 10 again -> submit and verify unselected ID is omitted
    await page
      .getByRole('button', { name: 'Add Recruiter Person 11', exact: true })
      .click();
    await expect(page.getByText('10/10 recruiters selected')).toBeVisible();
    await expect(continueBtn).toBeEnabled();

    await continueBtn.click();
    await expect.poll(() => submittedPayload).not.toBeNull();
    expect(submittedPayload.followings).toHaveLength(10);
    expect(submittedPayload.followings).not.toContain('rec-5');
    expect(submittedPayload.followings).toContain('rec-11');

    await expect(page).toHaveURL(/\/resume(?:\?|$)/);
    await expect(page.getByText(/Build Your Resume\./i)).toBeVisible();

    const storedUser = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('user') || '{}')
    );
    expect(storedUser.role).toBe('jobseeker');
    expect(storedUser.mode).toBe('active_jobseeker');

    const getStartedBtn = page.getByRole('button', { name: /Get Started/i });
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    await expect(page).toHaveURL(/\/bio(?:\?|$)/);
    await expect(page.getByText(/Bio\/Personal Information/i)).toBeVisible();
  });
});

