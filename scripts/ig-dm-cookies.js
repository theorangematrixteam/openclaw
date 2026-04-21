const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json', 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  
  // Add cookies before navigating
  await context.addCookies(cookies);
  console.log('Cookies loaded');
  
  const page = await context.newPage();
  
  try {
    // Navigate to Instagram to verify session
    console.log('Checking if session is valid...');
    await page.goto('https://www.instagram.com/', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    const url = page.url();
    console.log('URL:', url);
    
    const text = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('Page text:', text);
    
    // Check if we're logged in by looking for indicators
    const isLoggedIn = !url.includes('login') && !text.includes('Log into Instagram');
    console.log('Logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('Session invalid - need fresh cookies');
      await browser.close();
      return;
    }
    
    // Navigate to send a new DM
    console.log('Navigating to new DM...');
    await page.goto('https://www.instagram.com/direct/new/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    const dmUrl = page.url();
    console.log('DM URL:', dmUrl);
    
    // Get page structure
    const dmText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('DM page text:', dmText);
    
    // Find the search/recipient input
    const allInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]')).map(el => ({
        tag: el.tagName,
        type: el.type || '',
        name: el.name || '',
        placeholder: el.placeholder || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        role: el.getAttribute('role') || '',
        contentEditable: el.contentEditable
      }));
    });
    console.log('Input elements:', JSON.stringify(allInputs, null, 2));
    
    // Take screenshot
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-page.png' });
    console.log('Screenshot saved');
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();