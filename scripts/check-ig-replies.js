const { chromium } = require('playwright');
const fs = require('fs');

// Check Instagram notifications for replies to our comments
// Run this periodically to catch replies

const COOKIES_PATH = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json';

(async () => {
  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    console.log('Checking Instagram notifications...');
    
    // Go to notifications page
    await page.goto('https://www.instagram.com/accounts/activity/', { 
      timeout: 20000, 
      waitUntil: 'domcontentloaded' 
    });
    await page.waitForTimeout(3000);
    
    // Get all notification text
    const notifications = await page.evaluate(() => {
      const items = document.querySelectorAll('[role="button"]');
      return Array.from(items).map(item => {
        const text = item.textContent || '';
        const href = item.getAttribute('href') || '';
        return { text: text.trim(), href };
      }).filter(item => item.text.length > 0);
    });
    
    // Look for comment replies (mentions of "replied" or "commented")
    const replies = notifications.filter(n => 
      n.text.toLowerCase().includes('replied') || 
      n.text.toLowerCase().includes('mentioned') ||
      n.text.toLowerCase().includes('commented')
    );
    
    console.log(`\nFound ${replies.length} comment-related notifications:\n`);
    for (const reply of replies.slice(0, 10)) {
      console.log(`- ${reply.text.substring(0, 80)}`);
    }
    
    // Save results
    fs.writeFileSync(
      'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-replies.json',
      JSON.stringify(replies, null, 2)
    );
    
    console.log('\nSaved to ig-replies.json');
    
  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();
