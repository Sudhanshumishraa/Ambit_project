import { test, expect } from '@playwright/test';
import { performLogin } from './helpers/loginHelper.js';

// Test Suite for Role Master Functionality
test.describe('Role Master Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await performLogin(page);
    });

    // Test Case 1: Navigate to Role Master
    test('TC01 - Add new role and verify', async ({ page }) => {
        // Click on masters button and verify it's visible
        const mastersButton = page.getByRole('button', { name: 'Masters' });
        await expect(mastersButton).toBeVisible();
        await mastersButton.click();

        // Click on Role Master link and verify navigation
        const roleMasterLink = page.getByRole('link', { name: 'Role Master' });
        await expect(roleMasterLink).toBeVisible();
        await roleMasterLink.click();
           
        // Verify page title
        const pageTitle = page.locator('.active');
        await expect(pageTitle).toHaveText('Role Master');

        // Click on Add Role button
        const addRoleButton = page.getByRole('button', { name: '+ Add Role' });
        await expect(addRoleButton).toBeVisible();
        await addRoleButton.click();

        // Fill in role details
        const roleNameInput = page.getByPlaceholder('Role Name');
        await expect(roleNameInput).toBeVisible();
        await roleNameInput.fill('SEO_Role');
        await expect(roleNameInput).toHaveValue('SEO_Role');

        const descriptionInput = page.getByPlaceholder('Description');
        await expect(descriptionInput).toBeVisible();
        await descriptionInput.fill('SEO_Description_Role');
        await expect(descriptionInput).toHaveValue('SEO_Description_Role');

        // Click Add button
        const addButton = page.getByRole('button', { name: 'Add' });
        await expect(addButton).toBeEnabled();
        await addButton.click();

        // Verify success message
        const successMessage = page.getByText('Roles Added Successfully!');
        await expect(successMessage).toBeVisible();

        // Verify the newly added role appears in the list
        const newRole = page.getByText('SEO');
        await expect(newRole).toBeVisible();

        // Optional: Verify role description
        const roleDescription = page.getByText('SEO_Description');
        await expect(roleDescription).toBeVisible();
    });
});
