const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  
  const context = await browser.newContext({
    storageState: authPath
  });
  const page = await context.newPage();
  
  try {
    console.log('Navigating to Postoria Accounts...');
    await page.goto('https://app.postoria.io/accounts', { waitUntil: 'domcontentloaded' });
    
    // Wait longer for content to load
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'accounts-loaded.png'), 
      fullPage: true 
    });
    
    // Get all text content
    const bodyText = await page.textContent('body');
    console.log('Full page text:');
    console.log(bodyText);
    
    // Look for account items or "Add Account" buttons
    const addAccountBtn = await page.$('button:has-text("Add"), button:has-text("Connect")');
    if (addAccountBtn) {
      const btnText = await addAccountBtn.textContent();
      console.log('Found button:', btnText);
    }
    
    // Check for connected accounts
    const accountCards = await page.$$('[class*="account"], [class*="profile"]');
    console.log('Account cards found:', accountCards.length);
    
    // Wait for user to see
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'error.png'), 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();