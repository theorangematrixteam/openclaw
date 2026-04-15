const { chromium } = require('playwright');
const path = require('path');

// Debug version - check what's happening after clicking Schedule

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    // Click New
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    // Get full dialog HTML structure
    console.log('\n=== DIALOG STRUCTURE ===\n');
    
    const dialog = await page.$('[role="dialog"]');
    const dialogHTML = await dialog.evaluate(el => el.innerHTML.slice(0, 2000));
    console.log('Dialog HTML preview:', dialogHTML);
    
    // Get all text in dialog
    const dialogText = await dialog.textContent();
    console.log('\n=== DIALOG TEXT ===\n');
    console.log(dialogText);
    
    // Look for error elements
    const errorElements = await dialog.$$('.error, .Mui-error, [class*="error"], [class*="warning"]');
    console.log('\n=== ERROR ELEMENTS ===');
    console.log('Found:', errorElements.length);
    
    for (const el of errorElements) {
      const text = await el.textContent();
      console.log('Error:', text);
    }
    
    // Check validation messages
    const helperTexts = await dialog.$$('.MuiFormHelperText-root, [class*="helper"]');
    console.log('\n=== HELPER TEXTS ===');
    for (const el of helperTexts) {
      const text = await el.textContent();
      if (text && text.length > 0) {
        console.log('Helper:', text);
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'debug-dialog.png'), fullPage: true });
    
    // Wait for user to see
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();