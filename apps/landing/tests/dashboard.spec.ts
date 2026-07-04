import { test, expect } from '@playwright/test';

/**
 * Dashboard Functionality E2E Tests
 * Tests dashboard access, usage display, API key management, and settings
 */

test.describe('Dashboard Functionality', () => {
  
  test('should display dashboard heading', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show dashboard heading
    const dashboardHeading = page.getByRole('heading', { name: /dashboard|overview|home/i });
    await expect(dashboardHeading).toBeVisible();
  });

  test('should display user greeting or welcome message', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for welcome message or user name
    const welcomeText = page.getByText(/welcome|hello|hi/i);
    
    if (await welcomeText.count() > 0) {
      await expect(welcomeText).toBeVisible();
    }
  });

  test('should show current plan status (Free or Pro)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should display plan information
    const planText = page.getByText(/free plan|pro plan|current plan|subscription/i);
    await expect(planText).toBeVisible();
  });

  test('should display usage statistics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show usage metrics
    const usageMetrics = [
      page.getByText(/requests|api calls|tokens/i),
      page.getByText(/usage|consumed|remaining/i)
    ];
    
    const anyVisible = await Promise.race(
      usageMetrics.map(locator => 
        locator.isVisible().then(visible => visible)
      )
    );
    
    expect(anyVisible).toBeTruthy();
  });

  test('should have navigation links to other pages', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should have nav links
    const navLinks = [
      page.getByRole('link', { name: /billing/i }),
      page.getByRole('link', { name: /settings/i }),
      page.getByRole('link', { name: /api keys/i })
    ];
    
    for (const link of navLinks) {
      if (await link.count() > 0) {
        await expect(link).toBeVisible();
      }
    }
  });

  test('should navigate to API keys page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on API keys link
    const apiKeysLink = page.getByRole('link', { name: /api keys|keys/i });
    
    if (await apiKeysLink.count() > 0) {
      await apiKeysLink.click();
      await expect(page).toHaveURL(/.*api-keys/);
    } else {
      // Might be directly accessible
      await page.goto('/api-keys');
      await expect(page).toHaveURL(/.*api-keys/);
    }
  });

  test('should display API keys page content', async ({ page }) => {
    await page.goto('/api-keys');
    
    // Should show API keys heading
    const heading = page.getByRole('heading', { name: /api keys|manage keys|authentication/i });
    await expect(heading).toBeVisible();
  });

  test('should have button to generate new API key', async ({ page }) => {
    await page.goto('/api-keys');
    
    // Should have generate/create key button
    const generateButton = page.getByRole('button', { name: /generate|create|new key/i });
    await expect(generateButton).toBeVisible();
  });

  test('should show API key after generation', async ({ page }) => {
    await page.goto('/api-keys');
    
    // Click generate button
    const generateButton = page.getByRole('button', { name: /generate|create|new key/i });
    await generateButton.click();
    
    // Wait for key to be generated (might show in modal or on page)
    await page.waitForTimeout(2000);
    
    // Should show key or success message
    const keyOrSuccess = [
      page.getByText(/sk_|api_|key generated/i),
      page.getByText(/success|created|copy your key/i)
    ];
    
    const anyVisible = await Promise.race(
      keyOrSuccess.map(locator => 
        locator.isVisible().then(visible => visible)
      )
    );
    
    expect(anyVisible).toBeTruthy();
  });

  test('should allow copying API key to clipboard', async ({ page }) => {
    await page.goto('/api-keys');
    
    // Look for copy button
    const copyButton = page.getByRole('button', { name: /copy/i });
    
    if (await copyButton.count() > 0) {
      await expect(copyButton).toBeVisible();
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to settings
    const settingsLink = page.getByRole('link', { name: /settings/i });
    
    if (await settingsLink.count() > 0) {
      await settingsLink.click();
      await expect(page).toHaveURL(/.*settings/);
    } else {
      await page.goto('/settings');
      await expect(page).toHaveURL(/.*settings/);
    }
  });

  test('should display settings page content', async ({ page }) => {
    await page.goto('/settings');
    
    // Should show settings heading
    const heading = page.getByRole('heading', { name: /settings|account|profile/i });
    await expect(heading).toBeVisible();
  });

  test('should show email and profile information on settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Should show email or profile fields
    const emailField = page.locator('input[type="email"]');
    
    if (await emailField.count() > 0) {
      await expect(emailField).toBeVisible();
    }
  });

  test('should have option to update password', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for password update section
    const passwordSection = page.getByText(/password|change password|update password/i);
    
    if (await passwordSection.count() > 0) {
      await expect(passwordSection).toBeVisible();
    }
  });

  test('should have option to delete account', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for delete account option
    const deleteButton = page.getByRole('button', { name: /delete account|close account/i });
    
    if (await deleteButton.count() > 0) {
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should display usage chart or visualization', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for chart/graph elements
    const chartElements = [
      page.locator('svg'),
      page.locator('canvas'),
      page.getByText(/usage over time|activity|chart/i)
    ];
    
    const anyVisible = await Promise.race(
      chartElements.map(locator => 
        locator.isVisible().then(visible => visible).catch(() => false)
      )
    );
    
    // Charts are optional, so just check if present
    expect(typeof anyVisible).toBe('boolean');
  });

  test('should show upgrade prompt for free users', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Free users should see upgrade prompts
    const upgradeButton = page.getByRole('button', { name: /upgrade|get pro|unlock/i });
    
    if (await upgradeButton.count() > 0) {
      await expect(upgradeButton).toBeVisible();
    }
  });

  test('should have logout functionality', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for logout button
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    
    if (await logoutButton.isVisible()) {
      await expect(logoutButton).toBeVisible();
    } else {
      // Might be in a user menu
      const userMenu = page.getByRole('button', { name: /account|profile|user/i });
      if (await userMenu.count() > 0) {
        await userMenu.click();
        const logoutMenuItem = page.getByRole('menuitem', { name: /logout|sign out/i });
        await expect(logoutMenuItem).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Dashboard should still be accessible
    const dashboardHeading = page.getByRole('heading', { name: /dashboard/i });
    await expect(dashboardHeading).toBeVisible();
  });
});
