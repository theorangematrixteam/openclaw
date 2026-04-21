const { chromium } = require('playwright');
const fs = require('fs');

const username = process.argv[2];
const message = process.argv[3];

(async () => {
  const cookies = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    await page.goto(`https://www.instagram.com/${username}/`, { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const msgBtn = await page.$('button:has-text("Message")') || await page.$('div[role="button"]:has-text("Message")');
    if (!msgBtn) { console.log('No Message button'); process.exit(1); }
    await msgBtn.click();
    await page.waitForTimeout(5000); // longer wait for popup to render

    // Debug: get all inputs
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, [contenteditable], [role="textbox"], [role="combobox"]')).map(el => ({
        tag: el.tagName, type: el.type || '', placeholder: el.placeholder || '', 
        ariaLabel: el.getAttribute('aria-label') || '', role: el.getAttribute('role') || '',
        contentEditable: el.contentEditable, className: (el.className || '').toString().substring(0, 60)
      }));
    });
    console.log('Inputs after Message click:', JSON.stringify(inputs, null, 2));

    // Try broader search
    const msgInput = await page.$('[role="textbox"]') 
      || await page.$('textarea')
      || await page.$('[contenteditable="true"]')
      || await page.$('[aria-label="Message"]')
      || await page.$('[placeholder="Message..."]');
    
    if (msgInput) {
      console.log('Found input, sending...');
      await msgInput.click();
      await page.waitForTimeout(300);
      await page.keyboard.type(message, { delay: 50 });
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
      console.log(`Sent to @${username}: "${message}"`);
      await page.waitForTimeout(2000);
    } else {
      // Try the direct URL approach instead
      console.log('Trying direct DM URL...');
      await page.goto(`https://www.instagram.com/direct/t/`, { timeout: 15000 });
      await page.waitForTimeout(3000);
      const dmInputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, textarea, [contenteditable], [role="textbox"]')).map(el => ({
          tag: el.tagName, placeholder: el.placeholder || '', ariaLabel: el.getAttribute('aria-label') || '', role: el.getAttribute('role') || ''
        }));
      });
      console.log('DM page inputs:', JSON.stringify(dmInputs));
    }
  } catch(e) {
    console.log('Error:', e.message.substring(0, 300));
  } finally {
    await browser.close();
  }
})();