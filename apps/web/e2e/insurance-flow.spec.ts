import { test, expect } from '@playwright/test';

test.describe('Insurance Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Go to the application
        await page.goto('/');

        // Login before each test
        await page.click('text=Login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button:has-text("Sign In")');

        // Wait for dashboard to load
        await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should create a new policy', async ({ page }) => {
        // Navigate to policies
        await page.click('text=Policies');
        await page.click('text=New Policy');

        // Fill policy form
        await page.fill('[name="customerId"]', 'CUST123');
        await page.selectOption('select[name="type"]', 'comprehensive');
        await page.fill('[name="vehicle.registrationNumber"]', 'ABC123');
        await page.fill('[name="vehicle.make"]', 'Toyota');
        await page.fill('[name="vehicle.model"]', 'Camry');
        await page.fill('[name="vehicle.year"]', '2023');
        await page.fill('[name="vehicle.engineNumber"]', 'ENG123');
        await page.fill('[name="vehicle.chassisNumber"]', 'CHS123');
        await page.fill('[name="vehicle.value"]', '25000');
        await page.selectOption('select[name="vehicle.usage"]', 'private');

        // Submit form
        await page.click('button:has-text("Create Policy")');

        // Verify success
        await expect(page.locator('text=Policy created successfully')).toBeVisible();
    });

    test('should submit a claim', async ({ page }) => {
        // Navigate to claims
        await page.click('text=Claims');
        await page.click('text=New Claim');

        // Fill claim form
        await page.fill('[name="policyId"]', 'POL123');
        await page.fill('[name="description"]', 'Minor accident');
        await page.fill('[name="incidentDate"]', '2024-02-20');
        await page.fill('[name="location.address"]', '123 Test St');
        await page.selectOption('select[name="damageType"]', 'Vehicle');
        await page.fill('[name="amount"]', '5000');

        // Upload document
        const fileInput = await page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'test-doc.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('test content'),
        });

        // Submit form
        await page.click('button:has-text("Submit Claim")');

        // Verify success
        await expect(page.locator('text=Claim submitted successfully')).toBeVisible();
    });

    test('should use AI assistant', async ({ page }) => {
        // Navigate to AI assistant
        await page.click('text=AI Assistant');

        // Type a question
        await page.fill('textarea[name="query"]', 'What types of insurance do you offer?');
        await page.click('button:has-text("Ask")');

        // Verify response
        await expect(page.locator('.ai-response')).toContainText('comprehensive');
        await expect(page.locator('.ai-response')).toContainText('third party');
    });

    test('should manage documents', async ({ page }) => {
        // Navigate to documents
        await page.click('text=Documents');
        await page.click('text=Upload Document');

        // Upload document
        const fileInput = await page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'test-doc.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('test content'),
        });

        // Fill document details
        await page.fill('[name="description"]', 'Test Document');
        await page.selectOption('select[name="category"]', 'policy');

        // Submit form
        await page.click('button:has-text("Upload")');

        // Verify success
        await expect(page.locator('text=Document uploaded successfully')).toBeVisible();
    });
}); 