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
    // Navigate to Posts
    console.log('Checking Scheduled posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click on Scheduled tab
    await page.click('button:has-text("Scheduled")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'scheduled-check.png'), fullPage: true });
    
    const bodyText = await page.textContent('body');
    if (bodyText.includes('10:23') || bodyText.includes('AI')) {
      console.log('Found scheduled post!');
    } else {
      console.log('No scheduled posts found');
    }
    
    // Also check calendar
    await page.goto('https://app.postoria.io/calendar', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'calendar-check.png'), fullPage: true });
    
    console.log('Check calendar for scheduled post');
    
    await page.waitForTimeout(10000);
    
  } finally {
    await browser.close();
  }
})();