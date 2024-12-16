// tests/helpers/loginhelper.js
export async function performLogin(page) {
    await page.goto('https://uatbudgeting.cylsys.com/');
    
    // Enter email
    await page.getByPlaceholder('Enter email').click();
    await page.getByPlaceholder('Enter email').fill('gautam@mailinator.com');
    
    // Enter password
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill('Rahul@1');
    
    // Click login button
    await page.getByRole('button', { name: 'Log in' }).click();
    
    // Wait for navigation to complete
    await page.waitForURL('https://uatbudgeting.cylsys.com/dashboard');
}