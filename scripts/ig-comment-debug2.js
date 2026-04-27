const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json', 'utf8'));
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    await page.goto('https://www.instagram.com/bitchn.official/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Click first post
    const firstPost = await page.$('a[href*="/p/"]');
    await firstPost.click();
    await page.waitForTimeout(3000);
    
    // Find comment input and click
    const commentInput = await page.$('[aria-label="Add a comment…"]') ||
                        await page.$('[placeholder="Add a comment…"]');
    await commentInput.click();
    await page.waitForTimeout(1000);
    
    // Type something
    await page.keyboard.type('test');
    await page.waitForTimeout(1000);
    
    // Get all buttons and their text
    const buttons = await page.$$('button, div[role="button"]');
    console.log(`Found ${buttons.length} buttons:\n`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].evaluate(el => {
        return el.textContent || el.innerText || el.value || '';
      });
      const ariaLabel = await buttons[i].evaluate(el => el.getAttribute('aria-label') || '');
      const type = await buttons[i].evaluate(el => el.getAttribute('type') || '');
      if (text.trim() || ariaLabel) {
        console.log(`Button ${i}: text="${text.trim().substring(0, 50)}" aria-label="${ariaLabel}" type="${type}"`);
      }
    }
    
    // Wait to see the UI
    await page.waitForTimeout(10000);
    
  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();
