import { test, expect } from '@playwright/test';
import { performLogin } from './helpers/loginHelper.js';

// Test Suite for Role Master Functionality
test.describe('Role Master Test Suite', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await performLogin(page);
    });

    // Test Case 1: Navigate to Role Master
    test('TC01 - Navigate to Role Master page', async ({ page }) => {
        // Click on masters button
        await page.getByRole('button', { name: 'Masters' }).click();
        
        // Click on Role Master link
        await page.getByRole('link', { name: 'Role Master' }).click();
        
        // Verify we're on the Role Master page
        await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/role');
    });
});
