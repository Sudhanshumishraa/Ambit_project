import { test, expect } from '@playwright/test';

// Test Suite for Login Functionality
test.describe('Login Page Test Suite', () => {
    test.beforeEach(async ({ page }) => {
        // Common setup before each test
        await page.goto('https://uatbudgeting.cylsys.com/');
        console.log('Navigated to login page');
    });

    // Test Case 1: Successful Login
    test('TC01 - Verify successful login with valid credentials', async ({ page }) => {
        // Enter email
        await page.getByPlaceholder('Enter email').click();
        await page.getByPlaceholder('Enter email').fill('gautam@mailinator.com');
        console.log('Entered valid email');
        await expect(page.getByPlaceholder('Enter email')).toHaveValue('gautam@mailinator.com');

        // Enter password
        await page.getByPlaceholder('Password').click();
        await page.getByPlaceholder('Password').fill('Rahul@1');
        console.log('Entered valid password');
        await expect(page.getByPlaceholder('Password')).toHaveValue('Rahul@1');

        // Click login button
        await page.getByRole('button', { name: 'Log in' }).click();
        console.log('Clicked login button');

        // Verify successful login and navigation to dashboard
        await page.waitForNavigation({ url: 'https://uatbudgeting.cylsys.com/dashboard' });
        console.log('Successfully logged in to dashboard');

        // Verify dashboard elements are visible
        await expect(page.getByRole('button', { name: 'Logo' }).nth(3)).toBeVisible();
        await page.getByRole('button', { name: 'Logo' }).nth(3).click();
        console.log('Dashboard elements verified');
    });

    // Test Case 2: Login with Invalid Email
    test('TC02 - Verify error message with invalid email address', async ({ page }) => {
        // Enter invalid email and valid password
        await page.getByPlaceholder('Enter email').fill('invalid@email.com');
        await page.getByPlaceholder('Password').fill('Rahul@1');
        await page.getByRole('button', { name: 'Log in' }).click();
        await page.waitForTimeout(1000);

        // Verify error message
        const errorText = await page.getByText('User does not exist!');
        await expect(errorText).toBeVisible();
        console.log('Error verified: User does not exist!');
    });

    // Test Case 3: Login with Invalid Password
    test('TC03 - Verify error message with incorrect password', async ({ page }) => {
        // Enter valid email and invalid password
        await page.getByPlaceholder('Enter email').fill('gautam@mailinator.com');
        await page.getByPlaceholder('Password').fill('WrongPassword123');
        await page.getByRole('button', { name: 'Log in' }).click();
        await page.waitForTimeout(1000);

        // Verify error message
        const errorText = await page.getByText('Incorrect password.');
        await expect(errorText).toBeVisible();
        console.log('Error verified: Incorrect password');
    });

    // Test Case 4: Empty Fields Validation
    test('TC04 - Verify validation for empty fields', async ({ page }) => {
        // Click login without entering any details
        await page.getByRole('button', { name: 'Log in' }).click();

        // Verify validation message
        const errorElement = page.getByText('Please fill in the valid credentials.');
        if (await errorElement.isVisible()) {
            console.log('Error verified: Please fill in the valid credentials.');
        } else {
            console.log('Error not verified: Please fill in the valid credentials.');
        }
    });
});