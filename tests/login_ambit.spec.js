import { test, expect } from '@playwright/test';
import { performLogin } from './helpers/loginHelper.js';

// Test Suite for Login Functionality
test.describe('Login Page Test Suite', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://uatbudgeting.cylsys.com/');
        console.log('Navigated to login page');
    });

    // Basic Login Tests
    test.describe('Basic Login Functionality', () => {
        test('TC01 - Verify successful login with valid credentials', async ({ page }) => {
            await performLogin(page);
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/dashboard');

            const userProfile = page.getByRole('button', { name: 'Logo' });
            await expect(userProfile).toBeVisible();
        });

        test('TC02 - Verify error message with invalid email address', async ({ page }) => {
            await page.getByPlaceholder('Enter email').fill('invalid@email.com');
            await page.getByPlaceholder('Password').fill('Rahul@1');
            await page.getByRole('button', { name: 'Log in' }).click();

            const errorText = await page.getByText('User does not exist!');
            await expect(errorText).toBeVisible();
        });

        test('TC03 - Verify error message with invalid password', async ({ page }) => {
            await page.getByPlaceholder('Enter email').fill('rahul.gupta@cylsys.com');
            await page.getByPlaceholder('Password').fill('wrongpassword');
            await page.getByRole('button', { name: 'Log in' }).click();

            const errorText = await page.getByText('Invalid Password!');
            await expect(errorText).toBeVisible();
        });
    });

    // Performance Tests
    test.describe('Performance Tests', () => {
        test('TC04 - Verify login response time', async ({ page }) => {
            const startTime = Date.now();
            await performLogin(page);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            console.log(`Login response time: ${responseTime}ms`);
            expect(responseTime).toBeLessThan(5000); // Login should take less than 5 seconds

            if (responseTime > 2000) {
                console.warn('Login response time is higher than expected');
            } else {
                console.log('Login response time is within expected limits');
            }

            // Verify that the user is logged in
            const userProfile = page.locator('xpath=//*[@id="root"]/div/div/div[2]/div/div[1]/div/h1');
            await expect(userProfile).toBeVisible();
            
            // Optional: Click the profile if needed
            await userProfile.click();
        });

        test('TC05 - Test login under slow network conditions', async ({ page }) => {
            // Simulate slow 3G network
            await page.route('**/*', async route => {
                await route.continue({
                    throttling: {
                        downloadSpeed: 750 * 1024 / 8, // 750kb/s
                        uploadSpeed: 250 * 1024 / 8, // 250kb/s
                        latency: 100 // 100ms
                    }
                });
            });

            const startTime = Date.now();
            await performLogin(page);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            if (responseTime > 10000) {
                console.error('Login took longer than expected on slow network', { responseTime });
                expect(responseTime).toBeLessThan(10000); // Should work within 10 seconds even on slow network
            } else {
                console.log('Login completed within expected time on slow network', { responseTime });
            }

            // Verify that the user is logged in
            const userProfile = page.locator('xpath=//*[@id="root"]/div/div/div[2]/div/div[1]/div/h1');
            await expect(userProfile).toBeVisible();
            
            // Optional: Click the profile if needed
            await userProfile.click();
        });
    });

    // Security Tests
    test.describe('Security Tests', () => {
        test('TC06 - Test SQL injection prevention', async ({ page }) => {
            const sqlInjectionAttempts = [
                "' OR '1'='1",
                "admin' --",
                "'; DROP TABLE users; --"
            ];

            for (const attempt of sqlInjectionAttempts) {
                await page.getByPlaceholder('Enter email').fill('test@example.com');
                await page.getByPlaceholder('Password').fill(attempt);
                await page.getByRole('button', { name: 'Log in' }).click();

                // Check if the login page is still visible
                const loginPage = await page.isVisible('text=Log in');
                if (loginPage) {
                    console.log('Login page is still visible');
                } else {
                    console.error('Login page is not visible, something went wrong');
                }

                // Check if the dashboard page is not visible
                const dashboardPage = await page.isVisible('text=Dashboard');
                if (dashboardPage) {
                    console.error('Dashboard page is visible, something went wrong');
                } else {
                    console.log('Dashboard page is not visible');
                }

                // Verify we're still on login page and not logged in
                await expect(page).not.toHaveURL('https://uatbudgeting.cylsys.com/dashboard');
            }
        });

        test('TC07 - Test password strength requirements', async ({ page }) => {
            const weakPasswords = ['123456', 'password', 'abcdef'];

            for (const password of weakPasswords) {
                await page.getByPlaceholder('Enter email').fill('test@example.com');
                await page.getByPlaceholder('Password').fill(password);
                await page.getByRole('button', { name: 'Log in' }).click();

                // Verify error message for weak password
                const errorText = await page.getByText('Invalid Password!');
                await expect(errorText).toBeVisible();
            }
        });

        test('TC08 - Test XSS prevention', async ({ page }) => {
            const xssPayload = '<script>alert("XSS")</script>';
            await page.getByPlaceholder('Enter email').fill(xssPayload);
            await page.getByPlaceholder('Password').fill('password');

            // Verify the XSS payload is properly escaped
            const emailInput = await page.getByPlaceholder('Enter email');
            const value = await emailInput.inputValue();
            expect(value).not.toContain('<script>');
        });
    });

    // Accessibility Tests
    test.describe.only('Accessibility Tests', () => {
        test('TC09 - Test keyboard navigation', async ({ page }) => {
            // Test Tab navigation
            await page.keyboard.press('Tab');
            let focusedElement = await page.evaluate(() => document.activeElement.getAttribute('placeholder'));
            expect(focusedElement).toBe('Enter email');

            await page.keyboard.press('Tab');
            focusedElement = await page.evaluate(() => document.activeElement.getAttribute('placeholder'));
            expect(focusedElement).toBe('Password');

            // Test Enter key for form submission
            await page.getByPlaceholder('Enter email').fill('gautam@mailinator.com');
            await page.getByPlaceholder('Password').fill('Rahul@1');
            await page.keyboard.press('Enter');
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/dashboard');
        });

        test('TC10 - Verify ARIA labels', async ({ page }) => {
            // Check for proper ARIA labels
            const emailInput = page.getByPlaceholder('Enter email');
            const passwordInput = page.getByPlaceholder('Password');
            const loginButton = page.getByRole('button', { name: 'Log in' });

            await expect(emailInput).toHaveAttribute('aria-label', 'Email input');
            await expect(passwordInput).toHaveAttribute('aria-label', 'Password input');
            await expect(loginButton).toHaveAttribute('aria-label', 'Login button');
        });
    });

    // Session Management Tests
    test.describe('Session Management', () => {
        test('TC11 - Test session timeout', async ({ page }) => {
            await performLogin(page);

            // Wait for session timeout (adjust time based on your session timeout setting)
            await page.waitForTimeout(30 * 60 * 1000); // 30 minutes

            // Try to access a protected route
            await page.goto('https://uatbudgeting.cylsys.com/dashboard');

            // Should be redirected to login page
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/');
        });

        test('TC12 - Test logout functionality', async ({ page }) => {
            await performLogin(page);

            // Click logout button
            const logoutButton = page.getByRole('button', { name: 'Logout' });
            await logoutButton.click();

            // Verify redirect to login page
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/');

            // Verify session is cleared by trying to access dashboard
            await page.goto('https://uatbudgeting.cylsys.com/dashboard');
            await expect(page).toHaveURL('https://uatbudgeting.cylsys.com/');
        });
    });

    // API Integration Tests
    test.describe('API Integration', () => {
        test('TC13 - Test login API response', async ({ page, request }) => {
            // Make direct API call to login endpoint
            const loginResponse = await request.post('https://uatbudgeting.cylsys.com/api/login', {
                data: {
                    email: 'rahul.gupta@cylsys.com',
                    password: 'Rahul@1'
                }
            });

            expect(loginResponse.ok()).toBeTruthy();
            const responseBody = await loginResponse.json();
            expect(responseBody).toHaveProperty('token');
        });

        test('TC14 - Test API error responses', async ({ request }) => {
            // Test invalid credentials
            const invalidLoginResponse = await request.post('https://uatbudgeting.cylsys.com/api/login', {
                data: {
                    email: 'invalid@email.com',
                    password: 'wrongpassword'
                }
            });

            expect(invalidLoginResponse.status()).toBe(401);
            const errorBody = await invalidLoginResponse.json();
            expect(errorBody).toHaveProperty('error');
        });

        test('TC15 - Test token management', async ({ page, request }) => {
            // Login and get token
            const loginResponse = await request.post('https://uatbudgeting.cylsys.com/api/login', {
                data: {
                    email: 'rahul.gupta@cylsys.com',
                    password: 'Rahul@1'
                }
            });

            const { token } = await loginResponse.json();

            // Test protected API endpoint with token
            const protectedResponse = await request.get('https://uatbudgeting.cylsys.com/api/protected-route', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            expect(protectedResponse.ok()).toBeTruthy();
        });
    });
});