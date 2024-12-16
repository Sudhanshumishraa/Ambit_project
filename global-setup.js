// global-setup.js
import { chromium } from '@playwright/test';
import { performLogin } from './tests/helpers/loginHelper.js';

async function globalSetup() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Perform login
    await performLogin(page);
    
    // Save signed-in state to 'storageState.json'
    await page.context().storageState({ path: 'storageState.json' });
    await browser.close();
}

export default globalSetup;