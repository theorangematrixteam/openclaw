const { chromium } = require('playwright');
const path = require('path');

/**
 * Extract ALL text from account selector
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
    await page.waitForTimeout(3000);
    
    // Get ALL text from the page
    const allText = await page.textContent('body');
    
    // Save to file for analysis
    const fs = require('fs');
    fs.writeFileSync(path.join(__dirname, 'page-text.txt'), allText);
    
    console.log('\n=== PAGE TEXT (first 3000 chars) ===\n');
    console.log(allText.slice(0, 3000));
    
    // Get innerHTML of all dialogs
    const dialogs = await page.$$('div[role="presentation"]');
    console.log('\n=== DIALOGS ===');
    console.log('Count:', dialogs.length);
    
    for (let i = 0; i < dialogs.length; i++) {
      const html = await dialogs[i].innerHTML();
      const text = await dialogs[i].textContent();
      console.log(`\nDialog ${i} text (first 500 chars):`);
      console.log(text.slice(0, 500));
    }
    
    // Find elements by position
    console.log('\n=== CLICKABLE ELEMENTS ===');
    const clickables = await page.$$('button, [role="button"], div[onclick]');
    console.log('Total clickables:', clickables.length);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'text-analysis.png'), fullPage: true });
    
    console.log('\nDone.');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();