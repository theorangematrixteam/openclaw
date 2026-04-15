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
    // Navigate to Calendar
    console.log('Navigating to Calendar...');
    await page.goto('https://app.postoria.io/calendar', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Get page content
    const bodyText = await page.textContent('body');
    console.log('Calendar loaded');
    
    // Look for any scheduled posts
    const scheduledPosts = await page.$$('div, button, span');
    for (const el of scheduledPosts.slice(0, 20)) {
      const text = await el.textContent();
      if (text && (text.includes('10:18') || text.includes('AI') || text.includes('OpenClaw'))) {
        console.log('Found:', text.slice(0, 100));
      }
    }
    
    // Check if there's a post for today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    console.log('Today:', todayStr);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'calendar-today.png'), fullPage: true });
    
    // Keep browser open
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();