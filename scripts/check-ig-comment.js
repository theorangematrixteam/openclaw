const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json', 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    await page.goto('https://www.instagram.com/bitchn.official/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Get latest post URL
    const firstPost = await page.$('a[href*="/p/"]');
    if (firstPost) {
      const href = await firstPost.getAttribute('href');
      console.log('Latest post:', `https://instagram.com${href}`);
    }
    
    // Click to open post and check comments
    await firstPost.click();
    await page.waitForTimeout(3000);
    
    // Check for our comment
    const pageContent = await page.content();
    if (pageContent.includes('The quality here is next level')) {
      console.log('✅ Comment found on post!');
    } else {
      console.log('❌ Comment not found — may not have been posted');
    }
    
  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 100));
  } finally {
    await browser.close();
  }
})();
