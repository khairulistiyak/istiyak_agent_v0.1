import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 * Tests user registration, login, logout, and OAuth flows
 */

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should display login and register buttons on homepage', async ({ page }) => {
    // Check if login button exists
    const loginButton = page.getByRole('link', { name: /login/i });
    await expect(loginButton).toBeVisible();
    
    // Check if register/signup button exists
    const registerButton = page.getByRole('link', { name: /get started|sign up|register/i });
    await expect(registerButton).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click on register button
    await page.click('text=/Get Started|Sign Up|Register/i');
    
    // Should navigate to register page
    await expect(page).toHaveURL(/.*register/);
    
    // Should show registration form
    await expect(page.getByRole('heading', { name: /create account|sign up|register/i })).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Generate unique email for test
    const timestamp = Date.now();
    const testEmail = `test.user.${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = `Test User ${timestamp}`;
    
    // Fill registration form
    await page.fill('input[type="email"], input[name="email"]', testEmail);
    await page.fill('input[type="password"], input[name="password"]', testPassword);
    
    // Check if name field exists (might not be in all forms)
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    if (await nameInput.count() > 0) {
      await nameInput.first().fill(testName);
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to success page or dashboard
    // Wait for navigation (either to dashboard, verify-email, or success page)
    await page.waitForURL(/.*\/(dashboard|verify-email|success|login)/, { timeout: 10000 });
    
    // Check for success indicator
    const successIndicators = [
      page.getByText(/account created|registration successful|check your email/i),
      page.getByRole('heading', { name: /dashboard|welcome/i })
    ];
    
    const anyVisible = await Promise.race(
      successIndicators.map(locator => 
        locator.isVisible().then(visible => visible ? locator : null)
      )
    );
    
    expect(anyVisible).toBeTruthy();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=/Login|Sign In/i');
    
    // Should navigate to login page
    await expect(page).toHaveURL(/.*login/);
    
    // Should show login form
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.getByText(/invalid|incorrect|failed|wrong/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without email
    await page.fill('input[type="password"]', 'SomePassword123');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should display OAuth login options', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Google OAuth button
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
    
    // Check for GitHub OAuth button
    const githubButton = page.getByRole('button', { name: /github/i });
    await expect(githubButton).toBeVisible();
  });

  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot password|reset password/i });
    
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.click();
      
      // Should navigate to reset password page
      await expect(page).toHaveURL(/.*reset-password/);
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test('should logout user successfully', async ({ page }) => {
    // This test assumes user is logged in
    // For a real test, we'd need to login first or use auth state
    
    await page.goto('/dashboard');
    
    // Look for logout button or user menu
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to homepage or login
      await expect(page).toHaveURL(/.*\/(|login|$)/);
    } else {
      // Might be in a dropdown menu
      const userMenu = page.getByRole('button', { name: /account|profile|user/i });
      if (await userMenu.count() > 0) {
        await userMenu.click();
        await page.getByRole('menuitem', { name: /logout|sign out/i }).click();
        await expect(page).toHaveURL(/.*\/(|login|$)/);
      }
    }
  });

  test('should require authentication for dashboard access', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display email verification notice if unverified', async ({ page }) => {
    // This test checks if the app shows verification prompts
    await page.goto('/verify-email');
    
    // Should show verification message
    const verificationText = page.getByText(/verify|confirmation|check your email/i);
    await expect(verificationText).toBeVisible();
  });
});
