const { chromium } = require('playwright');
const path = require('path');

/**
 * Debug account selector
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('Opening Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('New post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    // Click accounts button
    console.log('Opening accounts selector...');
    await page.click('button:has-text("account")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'debug-accounts-open.png'), fullPage: true });
    
    // Analyze the account selector
    console.log('\n=== ACCOUNT SELECTOR ANALYSIS ===\n');
    
    // Get all elements in the dialog
    const dialog = await page.$('[role="dialog"]');
    const allElements = await dialog.$$('button, div, span, li, a');
    
    console.log('Total elements found:', allElements.length);
    
    // Look for account-like elements
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      const text = await el.textContent();
      const className = await el.getAttribute('class');
      const tagName = await el.evaluate(e => e.tagName);
      
      if (text && text.length > 2 && text.length < 100) {
        const trimmed = text.trim();
        // Look for account names
        if (trimmed.toLowerCase().includes('jinay') || 
            trimmed.toLowerCase().includes('linkedin') ||
            trimmed.toLowerCase().includes('matrix') ||
            trimmed.includes('@')) {
          console.log(`${i}: [${tagName}] "${trimmed}" class="${className?.slice(0, 50)}"`);
        }
      }
    }
    
    // Try to find clickable account items
    console.log('\n=== TRYING DIFFERENT SELECTORS ===\n');
    
    // Method 1: Click on element containing text
    const jinayElements = await page.$$('text=/jinayshah07/i');
    console.log('Method 1 - text=/jinayshah07/:', jinayElements.length);
    
    // Method 2: XPath
    const xpathElements = await page.$$('xpath=//*[contains(text(), "jinayshah07")]');
    console.log('Method 2 - xpath:', xpathElements.length);
    
    // Method 3: Click on list item
    const listItems = await page.$$('li');
    console.log('Method 3 - li elements:', listItems.length);
    
    // Method 4: Click on div with role=button
    const roleButtons = await page.$$('div[role="button"]');
    console.log('Method 4 - div[role="button"]:', roleButtons.length);
    
    // Method 5: MuiListItem
    const muiItems = await page.$$('[class*="MuiListItem"]');
    console.log('Method 5 - MuiListItem:', muiItems.length);
    
    // Try clicking each method
    if (listItems.length > 0) {
      console.log('\n=== CLICKING FIRST li ===');
      await listItems[0].click({ force: true });
      await page.waitForTimeout(1000);
      
      // Check if selected
      const dialogText = await dialog.textContent();
      if (dialogText.includes('1 account')) {
        console.log('SUCCESS: Account selected!');
      } else {
        console.log('NOT selected');
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'debug-accounts-after.png'), fullPage: true });
    
    console.log('\nDone. Check screenshots.');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'debug-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();