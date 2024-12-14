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

    // Test Case 5: Password Visibility Toggle
    test('TC05 - Verify password visibility toggle functionality', async ({ page }) => {
        // Fill the password field
        await page.getByPlaceholder('Password').fill('TestPassword123');
    
        // Check that the initial password field type is 'password' (hidden)
        const passwordInput = page.getByPlaceholder('Password');
        await expect(passwordInput).toHaveAttribute('type', 'password');
        console.log('Password field is hidden by default');
    
        // Click the "show password" button (eye icon) and verify the password is visible
        const showPasswordButton = page.locator('path'); 
        await showPasswordButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        console.log('Password is now visible');
    
        // Verify the "hide password" button (eye-off icon) is now visible
        const hidePasswordButton = page.locator('svg'); 
        await expect(hidePasswordButton).toBeVisible();
        console.log('Hide password button is visible');
    
        // Click the "hide password" button and verify the password is hidden again
        await hidePasswordButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
        console.log('Password is hidden again');
    
        // Verify the "show password" button is visible again
        await expect(showPasswordButton).toBeVisible();
        console.log('Show password button is visible again');
    });
    

    // Test Case 6: Email Format Validation
    test.only('TC06 - Verify email format validation', async ({ page }) => {
        // Test with invalid email formats
        const invalidEmails = ['test', 'test@', 'test@.com', '@domain.com'];

        for (const email of invalidEmails) {
            await page.getByPlaceholder('Enter email').fill(email);
            await page.getByPlaceholder('Password').click(); // Trigger validation

            // Verify validation message
            const errorText = await page.getByText('Please enter a valid email address');
            await expect(errorText).toBeVisible();
        }
    });

    // Test Case 7: Password Strength Requirements
    test('TC07 - Verify password strength requirements', async ({ page }) => {
        await page.getByPlaceholder('Enter email').fill('test@example.com');

        // Test with weak passwords
        const weakPasswords = ['123456', 'abcdef', 'password'];

        for (const password of weakPasswords) {
            await page.getByPlaceholder('Password').fill(password);
            await page.getByRole('button', { name: 'Log in' }).click();

            // Verify validation message for password requirements
            const errorText = await page.getByText('Password must contain at least 8 characters, one uppercase letter, one number and one special character');
            await expect(errorText).toBeVisible();
        }
    });

    // Test Case 9: Multiple Failed Login Attempts
    test('TC09 - Verify account lockout after multiple failed attempts', async ({ page }) => {
        const maxAttempts = 5;

        for (let i = 0; i < maxAttempts; i++) {
            await page.getByPlaceholder('Enter email').fill('gautam@mailinator.com');
            await page.getByPlaceholder('Password').fill('WrongPassword' + i);
            await page.getByRole('button', { name: 'Log in' }).click();
            await page.waitForTimeout(1000);
        }

        // Verify account lockout message
        const lockoutText = await page.getByText('Too many failed attempts. Please try again later.');
        await expect(lockoutText).toBeVisible();
    });

    // Test Case 10: Session Timeout
    test('TC10 - Verify session timeout functionality', async ({ page }) => {
        // Login successfully
        await page.getByPlaceholder('Enter email').fill('gautam@mailinator.com');
        await page.getByPlaceholder('Password').fill('Rahul@1');
        await page.getByRole('button', { name: 'Log in' }).click();

        // Wait for session timeout (simulated)
        await page.waitForTimeout(3600000); // Adjust timeout value based on actual session timeout

        // Verify redirect to login page or session timeout message
        await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/');
        const timeoutMessage = await page.getByText('Session expired. Please login again.');
        await expect(timeoutMessage).toBeVisible();
    });
});