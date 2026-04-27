const { chromium } = require('playwright');
const fs = require('fs');

// Twitter/X DM sender using cookie-based auth
// Usage: node twitter-dm.js <username> "<message>"

const username = process.argv[2];
const message = process.argv[3];

if (!username || !message) {
  console.log('Usage: node twitter-dm.js <username> "<message>"');
  process.exit(1);
}

const COOKIES_PATH = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\twitter-cookies.json';

(async () => {
  let cookies;
  try {
    cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf8'));
    // Fix sameSite values
    for (const cookie of cookies) {
      if (cookie.sameSite === 'unspecified') cookie.sameSite = 'Lax';
      if (cookie.sameSite === 'no_restriction') cookie.sameSite = 'None';
    }
  } catch(e) {
    console.log('ERROR: No Twitter cookies found. Export cookies from browser first.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    console.log(`Navigating to @${username}'s profile...`);
    await page.goto(`https://x.com/${username}`, { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Check if profile exists
    const notFound = await page.$('text=This account doesn\'t exist');
    if (notFound) {
      console.log('FAIL: Account doesn\'t exist');
      process.exit(1);
    }

    // Look for the message button
    const msgBtn = await page.$('[data-testid="sendDMFromProfile"]') || 
                   await page.$('button[aria-label*="Message"]') ||
                   await page.$('[role="button"]:has-text("Message")');
    
    if (!msgBtn) {
      console.log('FAIL: No DM button found. User may have DMs closed.');
      process.exit(1);
    }

    await msgBtn.click();
    await page.waitForTimeout(3000);

    // Find the message input in the DM composer
    const msgInput = await page.$('[data-testid="dmComposerTextInput"]') ||
                     await page.$('[contenteditable="true"]') ||
                     await page.$('[role="textbox"]');
    
    if (!msgInput) {
      console.log('FAIL: No message input found in DM composer');
      process.exit(1);
    }

    await msgInput.click();
    await page.waitForTimeout(300);
    
    // Type the message
    await page.keyboard.type(message, { delay: 30 });
    await page.waitForTimeout(500);

    // Send it
    const sendBtn = await page.$('[data-testid="dmComposerSendButton"]');
    
    if (sendBtn) {
      await sendBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    
    await page.waitForTimeout(2000);
    console.log(`SENT to @${username}: "${message.substring(0, 50)}..."`);

  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();