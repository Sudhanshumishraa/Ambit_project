import { test, expect } from '@playwright/test';

// Test Suite for Role Master Functionality
test.describe('Role Master Module', () => {
    // Test data
    const testData = {
        validCredentials: {
            email: 'gautam@mailinator.com',
            password: 'Rahul@1'
        },
        newRole: {
            name: `QAA_${Date.now()}`, // Unique role name
            description: 'Automated test role for QA purposes'
        }
    };

    test.beforeEach(async ({ page }) => {
        // Common setup before each test
        await page.goto('https://uatbudgeting.cylsys.com/');
        console.log('Navigated to login page');

        // Verify login page is loaded
        await expect(page.getByPlaceholder('Enter email')).toBeVisible();
        await expect(page.getByPlaceholder('Password')).toBeVisible();

        // Login before each test
        await performLogin(page);
    });

    // Helper function for login
    async function performLogin(page) {
        try {
            const emailInput = page.getByPlaceholder('Enter email');
            const passwordInput = page.getByPlaceholder('Password');
            const loginButton = page.getByRole('button', { name: 'Log in' });

            await emailInput.click();
            await emailInput.fill(testData.validCredentials.email);
            console.log('Entered email');

            await passwordInput.click();
            await passwordInput.fill(testData.validCredentials.password);
            console.log('Entered password');

            await loginButton.click();
            console.log('Clicked login button');

            // Wait for navigation and verify dashboard
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/dashboard', { timeout: 10000 });
            await expect(page.getByRole('button', { name: 'Masters' })).toBeVisible();
            console.log('Successfully logged in to dashboard');
        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        }
    }

    // Function for TC01 logic: Navigate to Role Master
    async function navigateToRoleMaster(page) {
        try {
            const mastersButton = page.getByRole('button', { name: 'Masters' });
            const roleMasterLink = page.getByRole('link', { name: 'Role Master' });

            await mastersButton.click();
            console.log('Clicked on Masters button');

            await roleMasterLink.click();
            console.log('Clicked on Role Master link');

            // Verify Role Master page
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/role');
            await expect(page.getByRole('button', { name: '+ Add Role' })).toBeVisible();
            console.log('Successfully navigated to Role Master page');
        } catch (error) {
            console.error('Navigation to Role Master failed:', error.message);
            throw error;
        }
    }

    // Test Case 1: Navigate to Role Master
    test('TC01 - Should successfully navigate to Role Master page', async ({ page }) => {
        await test.step('Navigate to Role Master', async () => {
            await navigateToRoleMaster(page);
        });

        await test.step('Verify Role Master page elements', async () => {
            // Verify essential elements on Role Master page
            await expect(page.getByRole('heading', { name: /Role Master/i })).toBeVisible();
            await expect(page.getByRole('button', { name: '+ Add Role' })).toBeEnabled();
            // Verify the presence of role list or table
            await expect(page.locator('table')).toBeVisible();
        });
    });

    // Test Case 2: Add New Role
    test('TC02 - Should successfully add a new role', async ({ page }) => {
        await test.step('Navigate to Role Master', async () => {
            await navigateToRoleMaster(page);
        });

        await test.step('Click Add Role and verify form', async () => {
            await page.getByRole('button', { name: '+ Add Role' }).click();
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/addRole');
            
            // Verify form elements
            await expect(page.getByPlaceholder('Role Name')).toBeVisible();
            await expect(page.getByPlaceholder('Description')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
        });

        await test.step('Fill and submit role details', async () => {
            const roleNameInput = page.getByPlaceholder('Role Name');
            const descriptionInput = page.getByPlaceholder('Description');
            const addButton = page.getByRole('button', { name: 'Add' });

            await roleNameInput.fill(testData.newRole.name);
            await descriptionInput.fill(testData.newRole.description);
            
            // Verify input values before submission
            await expect(roleNameInput).toHaveValue(testData.newRole.name);
            await expect(descriptionInput).toHaveValue(testData.newRole.description);

            await addButton.click();
            console.log('Submitted new role');

            // Verify successful addition
            await expect(page.getByText('Role added successfully')).toBeVisible({ timeout: 5000 });
        });

        await test.step('Verify role in listing', async () => {
            // Wait for navigation back to role listing
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/role');
            // Verify the newly added role appears in the list
            await expect(page.getByText(testData.newRole.name)).toBeVisible();
        });
    });
});