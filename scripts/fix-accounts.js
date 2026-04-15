const { chromium } = require('playwright');
const path = require('path');

/**
 * Fix account selection - click on the RIGHT element
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
    
    // Open accounts selector
    console.log('Opening accounts...');
    await page.click('button:has-text("account")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-01-accounts-open.png'), fullPage: true });
    
    // Find all MuiListItem elements
    console.log('Finding account items...');
    const muiItems = await page.$$('[class*="MuiListItem"]');
    console.log('MuiListItem count:', muiItems.length);
    
    // Get text from each
    for (let i = 0; i < Math.min(15, muiItems.length); i++) {
      const text = await muiItems[i].textContent();
      if (text && text.length < 100 && text.length > 2) {
        console.log(`  ${i}: "${text.trim()}"`);
      }
    }
    
    // Click on the FIRST MuiListItem (should be jinayshah07)
    console.log('\nClicking first account item...');
    await muiItems[0].click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-02-after-click.png'), fullPage: true });
    
    // Check if "1 accounts" is now shown
    const dialog = await page.$('[role="dialog"]');
    const dialogText = await dialog.textContent();
    console.log('Dialog now shows:', dialogText.includes('1 account') ? '1 account selected!' : 'Still 0 accounts');
    
    // Close selector
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-03-closed.png'), fullPage: true });
    
    // Check final state
    const dialogText2 = await dialog.textContent();
    if (dialogText2.includes('1 account')) {
      console.log('SUCCESS: Account is selected in dialog!');
    } else {
      console.log('FAILED: Account not selected');
      console.log('Dialog text:', dialogText2.slice(0, 200));
    }
    
    console.log('\nDone.');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();