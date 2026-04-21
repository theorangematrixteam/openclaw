const { chromium } = require('playwright');
const fs = require('fs');

const username = process.argv[2];
const message = process.argv[3];

if (!username || !message) {
  console.log('Usage: node ig-dm.js <username> "<message>"');
  process.exit(1);
}

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
    if (!msgBtn) { console.log('FAIL: No Message button (not following or profile not found)'); process.exit(1); }
    await msgBtn.click();
    await page.waitForTimeout(4000);

    const msgInput = await page.$('[role="textbox"][aria-label="Message"]') || await page.$('[contenteditable="true"]');
    if (!msgInput) { console.log('FAIL: No message input found'); process.exit(1); }
    await msgInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.type(message, { delay: 50 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    console.log(`SENT to @${username}: "${message}"`);
    await page.waitForTimeout(2000);
  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();