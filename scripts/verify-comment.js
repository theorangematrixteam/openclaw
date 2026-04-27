const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json', 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    console.log('Checking BITCHN latest post...');
    await page.goto('https://www.instagram.com/p/DXThCu7EeEk/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Check for our comment
    const pageText = await page.evaluate(() => document.body.innerText);
    if (pageText.includes('The quality here is next level')) {
      console.log('✅ Comment successfully posted!');
      console.log('Post: https://instagram.com/p/DXThCu7EeEk/');
    } else {
      console.log('❌ Comment not found on post');
    }
    
  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 100));
  } finally {
    await browser.close();
  }
})();
