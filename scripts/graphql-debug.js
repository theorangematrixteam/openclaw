const { chromium } = require('playwright');
const path = require('path');

/**
 * Capture GraphQL responses to find accounts
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  // Capture all responses
  const graphQLData = [];
  
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('graphql')) {
      try {
        const body = await res.text();
        // Look for account-related data
        if (body.includes('account') || body.includes('jinay') || body.includes('instagram') || body.includes('linkedin')) {
          graphQLData.push({
            url,
            body: body.slice(0, 5000)
          });
        }
      } catch (e) {}
    }
  });
  
  try {
    console.log('Loading Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    console.log('\n=== GRAPHQL RESPONSES WITH ACCOUNT DATA ===');
    console.log('Found', graphQLData.length, 'responses with account data\n');
    
    graphQLData.forEach((data, i) => {
      console.log(`\n--- Response ${i+1} ---`);
      console.log('URL:', data.url);
      console.log('Body:', data.body);
    });
    
    // Save full responses to file
    const fs = require('fs');
    fs.writeFileSync(
      path.join(__dirname, 'graphql-responses.json'),
      JSON.stringify(graphQLData, null, 2)
    );
    console.log('\n\nSaved to graphql-responses.json');
    
    await page.screenshot({ path: path.join(screenshotsDir, 'graphql-debug.png'), fullPage: true });
    
    console.log('\nDone.');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();