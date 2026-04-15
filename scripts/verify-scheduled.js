const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext({
    storageState: authPath
  });
  const page = await context.newPage();
  
  try {
    // Navigate to Posts page
    console.log('Navigating to Posts page...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Click on Scheduled tab
    console.log('Clicking Scheduled tab...');
    await page.click('button:has-text("Scheduled")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'scheduled-posts.png'), fullPage: true });
    
    // Get scheduled posts
    const posts = await page.$$('div[class*="post"], div[class*="card"]');
    console.log('Scheduled posts found:', posts.length);
    
    // Get text content
    const bodyText = await page.textContent('body');
    console.log('Page contains scheduled:', bodyText.includes('10:18'));
    
    // Keep browser open
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();