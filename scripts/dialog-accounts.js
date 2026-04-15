const { chromium } = require('playwright');
const path = require('path');

/**
 * Fix account selection - wait for dialog then click
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('Opening Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('New post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    // Get the main dialog first
    const mainDialog = await page.$('[role="dialog"]');
    
    // Click accounts button
    console.log('Opening accounts selector...');
    const accountsBtn = await mainDialog.$('button:has-text("account")');
    if (accountsBtn) {
      await accountsBtn.click({ force: true });
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'dialog-01-accounts-open.png'), fullPage: true });
    
    // Now there should be TWO dialogs - find the account selector
    console.log('Finding account selector dialog...');
    const allDialogs = await page.$$('div[role="presentation"]');
    console.log('Dialogs found:', allDialogs.length);
    
    // The account selector is likely the newest dialog
    // Wait for it to appear
    await page.waitForTimeout(1000);
    
    // Get all clickable items that look like accounts
    console.log('Looking for account items...');
    
    // Try finding by looking for elements with account-like content
    const pageContent = await page.content();
    
    // Find elements containing "jinayshah07"
    const jinayElements = await page.$$('xpath=//*[contains(text(), "jinayshah07")]');
    console.log('Elements with jinayshah07:', jinayElements.length);
    
    // Try clicking with XPath
    if (jinayElements.length > 0) {
      console.log('Clicking jinayshah07 element...');
      await jinayElements[0].click({ force: true });
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'dialog-02-after-click.png'), fullPage: true });
    
    // Check if selected
    const dialogText = await mainDialog.textContent();
    console.log('Dialog text check:', dialogText.includes('1 account') ? 'SUCCESS - 1 account!' : 'NOT selected');
    
    // Close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'dialog-03-closed.png'), fullPage: true });
    
    // Final check
    const finalText = await mainDialog.textContent();
    console.log('Final check:', finalText.includes('1 account') ? 'SELECTED!' : 'NOT selected');
    
    console.log('\nDone.');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'dialog-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();