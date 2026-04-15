const { chromium } = require('playwright');
const path = require('path');

/**
 * Capture network requests to see if accounts API is being called
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  // Capture all network requests
  const requests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('account') || url.includes('network') || url.includes('api')) {
      requests.push({
        url,
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Capture responses
  const responses = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('account') || url.includes('network') || url.includes('api')) {
      try {
        const body = await response.text();
        responses.push({
          url,
          status: response.status(),
          body: body.slice(0, 500),
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        // Ignore
      }
    }
  });
  
  try {
    console.log('Going to Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('\n=== INITIAL API CALLS ===');
    console.log('Requests:', requests.length);
    console.log('Responses:', responses.length);
    responses.forEach(r => {
      console.log(`  ${r.status} ${r.url.slice(0, 80)}`);
      if (r.body.includes('account') || r.body.includes('jinay')) {
        console.log(`    Body: ${r.body.slice(0, 200)}`);
      }
    });
    
    console.log('\nClicking New...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    console.log('\n=== AFTER NEW POST ===');
    console.log('Requests:', requests.length);
    console.log('Responses:', responses.length);
    
    // Clear previous
    requests.length = 0;
    responses.length = 0;
    
    console.log('\nClicking accounts button...');
    await page.click('button:has-text("account")', { force: true });
    
    // Wait for API calls
    console.log('Waiting for API...');
    await page.waitForTimeout(5000);
    
    console.log('\n=== AFTER ACCOUNTS CLICK ===');
    console.log('Requests:', requests.length);
    requests.forEach(r => console.log(`  ${r.method} ${r.url}`));
    
    console.log('Responses:', responses.length);
    responses.forEach(r => {
      console.log(`  ${r.status} ${r.url.slice(0, 80)}`);
      console.log(`    Body: ${r.body.slice(0, 300)}`);
    });
    
    await page.screenshot({ path: path.join(screenshotsDir, 'network-accounts.png'), fullPage: true });
    
    console.log('\nDone.');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();