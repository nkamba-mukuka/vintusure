import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the landing page with proper content', async ({ page }) => {
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/VintuSure/)
    
    // Check for main navigation elements
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByText('VintuSure')).toBeVisible()
    
    // Check for hero section
    await expect(page.getByRole('heading', { name: /AI-Powered Insurance Intelligence/i })).toBeVisible()
    
    // Check for call-to-action buttons
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Learn More/i })).toBeVisible()
  })

  test('should have proper accessibility features', async ({ page }) => {
    // Check for skip to main content link
    await expect(page.getByRole('link', { name: /Skip to main content/i })).toBeVisible()
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    expect(headings.length).toBeGreaterThan(0)
    
    // Check for alt text on images
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if mobile menu is accessible
    const mobileMenuButton = page.getByRole('button', { name: /menu/i })
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.getByRole('navigation')).toBeVisible()
    }
    
    // Check if content is properly sized for mobile
    const heroSection = page.locator('main').first()
    await expect(heroSection).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    // Test navigation to login page
    await page.getByRole('link', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/.*login/)
    
    // Go back to landing page
    await page.goto('/')
    
    // Test navigation to sign up page
    await page.getByRole('link', { name: /Sign Up/i }).click()
    await expect(page).toHaveURL(/.*signup/)
  })

  test('should handle theme switching', async ({ page }) => {
    // Find theme toggle button
    const themeButton = page.getByRole('button', { name: /Switch to dark mode/i })
    await expect(themeButton).toBeVisible()
    
    // Click theme toggle
    await themeButton.click()
    
    // Check if theme changed (this might need adjustment based on your implementation)
    await expect(page.locator('html')).toHaveAttribute('class', /dark/)
  })

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check for essential meta tags
    await expect(page.locator('meta[name="description"]')).toBeVisible()
    await expect(page.locator('meta[name="keywords"]')).toBeVisible()
    await expect(page.locator('meta[property="og:title"]')).toBeVisible()
    await expect(page.locator('meta[property="og:description"]')).toBeVisible()
  })
})
