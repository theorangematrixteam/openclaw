const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json', 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    console.log('Checking BITCHN latest post for our comment...');
    await page.goto('https://www.instagram.com/p/DXThCu7EeEk/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Get all text on page
    const text = await page.evaluate(() => document.body.innerText);
    
    // Check for action blocked
    if (text.includes('Action Blocked') || text.includes('Try Again Later')) {
      console.log('❌ Instagram blocked the action — account may be rate-limited');
    }
    
    // Check for our comment
    if (text.includes('next level')) {
      console.log('✅ Comment found!');
    } else {
      console.log('❌ Comment not found — may have been blocked or deleted');
    }
    
    // Check for any error messages
    if (text.includes('error') || text.includes('failed')) {
      console.log('Error text found:', text.substring(0, 200));
    }
    
  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 100));
  } finally {
    await browser.close();
  }
})();
