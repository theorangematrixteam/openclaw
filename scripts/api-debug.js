const { chromium } = require('playwright');
const path = require('path');

/**
 * Capture network requests - simpler version
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  // Capture all XHR/fetch requests
  const apiCalls = [];
  page.on('request', req => {
    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
      apiCalls.push({ url: req.url(), method: req.method() });
    }
  });
  
  page.on('response', async res => {
    if (res.request().resourceType() === 'xhr' || res.request().resourceType() === 'fetch') {
      const url = res.url();
      if (url.includes('account') || url.includes('network') || url.includes('user')) {
        try {
          const body = await res.text();
          console.log(`\n=== API RESPONSE ===`);
          console.log(`URL: ${url}`);
          console.log(`Status: ${res.status()}`);
          console.log(`Body: ${body.slice(0, 1000)}`);
        } catch (e) {}
      }
    }
  });
  
  try {
    console.log('Loading Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    console.log('\n=== INITIAL API CALLS ===');
    console.log('Total API calls:', apiCalls.length);
    apiCalls.forEach(c => console.log(`  ${c.method} ${c.url}`));
    
    console.log('\nClicking New...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    // Clear and capture account click
    apiCalls.length = 0;
    
    console.log('\nClicking accounts...');
    await page.click('button:has-text("account")', { force: true });
    await page.waitForTimeout(10000);
    
    console.log('\n=== AFTER ACCOUNTS CLICK ===');
    console.log('API calls:', apiCalls.length);
    apiCalls.forEach(c => console.log(`  ${c.method} ${c.url}`));
    
    await page.screenshot({ path: path.join(screenshotsDir, 'api-accounts.png'), fullPage: true });
    
    const bodyText = await page.textContent('body');
    console.log('\nContains jinayshah07:', bodyText.includes('jinayshah07'));
    console.log('Contains "No accounts":', bodyText.includes('No accounts'));
    
    console.log('\nDone.');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();