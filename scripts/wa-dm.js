const { chromium } = require('playwright');
const fs = require('fs');

const phone = process.argv[2]; // format: 919717773719 (no +, no spaces)
const message = process.argv[3];

if (!phone || !message) {
  console.log('Usage: node wa-dm.js <phone> "<message>"');
  console.log('Phone format: country code + number, no + or spaces. e.g. 919717773719');
  process.exit(1);
}

(async () => {
  const raw = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\wa-cookies.json', 'utf8'));
  const cookies = Array.isArray(raw) ? raw : raw.cookies;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    // Use WhatsApp's URL scheme to open a chat with pre-filled message
    const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    console.log(`Opening chat with ${phone}...`);
    await page.goto(url, { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Check if chat opened
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    
    if (pageText.includes('Phone number') && pageText.includes('not found')) {
      console.log('FAIL: Phone number not registered on WhatsApp');
      process.exit(1);
    }

    // Find the message input and send
    const msgInput = await page.$('[role="textbox"][aria-label="Type a message"]') 
      || await page.$('[contenteditable="true"][data-tab="10"]')
      || await page.$('div[title="Type a message"]')
      || await page.$('[role="textbox"]');
    
    if (msgInput) {
      console.log('Chat opened, sending message...');
      await msgInput.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Enter');
      console.log(`SENT to ${phone}: "${message}"`);
      await page.waitForTimeout(3000);
    } else {
      console.log('Chat opened but message already pre-filled via URL. Looking for send button...');
      // The URL scheme pre-fills the message, we just need to hit Enter or click send
      await page.keyboard.press('Enter');
      console.log(`SENT to ${phone}: "${message}"`);
      await page.waitForTimeout(3000);
    }

  } catch(e) {
    console.log('Error:', e.message.substring(0, 300));
  } finally {
    await browser.close();
  }
})();