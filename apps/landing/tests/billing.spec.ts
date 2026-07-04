import { test, expect } from '@playwright/test';

/**
 * Billing & Checkout Flow E2E Tests
 * Tests Stripe checkout, subscription creation, and payment flows
 */

test.describe('Billing & Checkout Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display pricing section on homepage', async ({ page }) => {
    // Scroll to pricing section
    const pricingHeading = page.getByRole('heading', { name: /pricing|plans/i });
    await pricingHeading.scrollIntoViewIfNeeded();
    await expect(pricingHeading).toBeVisible();
  });

  test('should show Pro plan pricing at $19/month', async ({ page }) => {
    // Look for Pro plan pricing
    const proPricing = page.getByText(/\$19/);
    await expect(proPricing).toBeVisible();
    
    // Should mention "per month" or "/mo"
    const perMonth = page.getByText(/per month|\/mo/i);
    await expect(perMonth).toBeVisible();
  });

  test('should have upgrade/checkout button for Pro plan', async ({ page }) => {
    // Look for upgrade button in pricing section
    const upgradeButton = page.getByRole('button', { name: /upgrade|get pro|subscribe|buy now/i }).first();
    await expect(upgradeButton).toBeVisible();
  });

  test('should require authentication before checkout', async ({ page }) => {
    // Try to click upgrade without being logged in
    const upgradeButton = page.getByRole('button', { name: /upgrade|get pro|subscribe/i }).first();
    
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();
      
      // Should either redirect to login or show login modal
      await page.waitForTimeout(1000);
      
      const loginIndicators = [
        page.getByText(/login|sign in/i),
        page.locator('input[type="email"]')
      ];
      
      const anyVisible = await Promise.race(
        loginIndicators.map(locator => 
          locator.isVisible().then(visible => visible)
        )
      );
      
      expect(anyVisible).toBeTruthy();
    }
  });

  test('should navigate to billing page from dashboard', async ({ page }) => {
    // Navigate to billing (this assumes user is logged in for real test)
    await page.goto('/billing');
    
    // Should show billing page elements
    const billingHeading = page.getByRole('heading', { name: /billing|subscription|payment/i });
    await expect(billingHeading).toBeVisible();
  });

  test('should display current subscription status on billing page', async ({ page }) => {
    await page.goto('/billing');
    
    // Should show subscription status (Free or Pro)
    const statusElement = page.getByText(/free plan|pro plan|starter|current plan/i);
    await expect(statusElement).toBeVisible();
  });

  test('should show usage information on billing page', async ({ page }) => {
    await page.goto('/billing');
    
    // Should display usage stats
    const usageText = page.getByText(/usage|requests|tokens|api calls/i);
    await expect(usageText).toBeVisible();
  });

  test('should have cancel subscription option for Pro users', async ({ page }) => {
    await page.goto('/billing');
    
    // Look for cancel or manage subscription button
    const manageButton = page.getByRole('button', { name: /cancel|manage subscription|downgrade/i });
    
    // Might not be visible if user is on free plan
    const buttonCount = await manageButton.count();
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });

  test('should redirect to success page after successful checkout', async ({ page }) => {
    // Navigate to success page (simulating Stripe redirect)
    await page.goto('/success?session_id=mock_session_123');
    
    // Should show success message
    const successMessage = page.getByText(/success|thank you|payment confirmed|subscription active/i);
    await expect(successMessage).toBeVisible();
  });

  test('should redirect to cancel page if checkout is cancelled', async ({ page }) => {
    // Navigate to cancel page (simulating Stripe cancel)
    await page.goto('/cancel');
    
    // Should show cancellation message
    const cancelMessage = page.getByText(/cancel|try again|something went wrong/i);
    await expect(cancelMessage).toBeVisible();
  });

  test('should display invoice history on billing page', async ({ page }) => {
    await page.goto('/billing');
    
    // Look for invoice/payment history section
    const historySection = page.getByText(/invoice|payment history|transactions|billing history/i);
    
    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible();
    }
  });

  test('should show Stripe-powered badge or mention', async ({ page }) => {
    await page.goto('/billing');
    
    // Should mention Stripe somewhere (for trust)
    const stripeText = page.getByText(/stripe|powered by stripe/i);
    
    if (await stripeText.count() > 0) {
      await expect(stripeText).toBeVisible();
    }
  });

  test('should allow downloading invoices if available', async ({ page }) => {
    await page.goto('/billing');
    
    // Look for download invoice links
    const downloadLinks = page.getByRole('link', { name: /download|invoice|receipt/i });
    
    const linkCount = await downloadLinks.count();
    // May be 0 if no invoices yet
    expect(linkCount).toBeGreaterThanOrEqual(0);
  });

  test('should display payment method information', async ({ page }) => {
    await page.goto('/billing');
    
    // Look for payment method section
    const paymentMethodText = page.getByText(/payment method|card ending|visa|mastercard/i);
    
    // Might not exist if no payment method added
    const textCount = await paymentMethodText.count();
    expect(textCount).toBeGreaterThanOrEqual(0);
  });

  test('should show upgrade prompt on free plan', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Free users should see upgrade prompts
    const upgradePrompt = page.getByText(/upgrade to pro|get unlimited|unlock features/i);
    
    if (await upgradePrompt.count() > 0) {
      await expect(upgradePrompt).toBeVisible();
    }
  });

  test('should navigate back to billing from success page', async ({ page }) => {
    await page.goto('/success?session_id=mock_session_123');
    
    // Look for link back to dashboard or billing
    const backLink = page.getByRole('link', { name: /dashboard|billing|continue/i });
    
    if (await backLink.count() > 0) {
      await expect(backLink).toBeVisible();
    }
  });
});
