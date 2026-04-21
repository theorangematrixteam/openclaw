const { chromium } = require('playwright');
const fs = require('fs');

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
    // First check if session is valid
    console.log('Checking WhatsApp session...');
    await page.goto('https://web.whatsapp.com/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    
    const mainText = await page.evaluate(() => document.body.innerText.substring(0, 300));
    const isLoggedIn = !mainText.includes('Scan') && !mainText.includes('QR');
    console.log('Logged in:', isLoggedIn);
    console.log('Page text:', mainText.substring(0, 150));
    
    if (!isLoggedIn) {
      console.log('Session expired - need new QR scan');
      process.exit(1);
    }
    
    // Now open chat with Jinay
    const phone = '917977147253';
    const message = 'hey jinay, test from orange matrix whatsapp';
    const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    
    console.log('Opening chat...');
    await page.goto(url, { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000); // longer wait for chat to load
    
    const chatText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Chat text:', chatText.substring(0, 200));
    
    // Check if number not found
    if (chatText.includes('not found') || chatText.includes('invalid')) {
      console.log('Phone number not on WhatsApp');
      process.exit(1);
    }
    
    // Find the text input - WhatsApp Web uses contenteditable div
    const allInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="textbox"], [contenteditable="true"], textarea, input[type="text"]')).map(el => ({
        tag: el.tagName,
        ariaLabel: el.getAttribute('aria-label') || '',
        placeholder: el.getAttribute('placeholder') || '',
        role: el.getAttribute('role') || '',
        contentEditable: el.contentEditable,
        title: el.getAttribute('title') || ''
      }));
    });
    console.log('Inputs:', JSON.stringify(allInputs, null, 2));
    
    // Find message input specifically
    const msgInput = await page.$('[aria-label="Type a message"]')
      || await page.$('[title="Type a message"]')
      || await page.$('[role="textbox"]')
      || await page.$('[contenteditable="true"]');
    
    if (msgInput) {
      console.log('Found message input. The URL pre-filled the message. Pressing Enter to send...');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      console.log('Enter pressed. Checking if message was sent...');
      
      // Check for "single tick" or "double tick" or any error
      const afterText = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log('After send:', afterText.substring(0, 150));
    } else {
      console.log('No message input found. Trying to find send button...');
      const sendBtn = await page.$('[aria-label="Send"]') || await page.$('[data-icon="send"]');
      if (sendBtn) {
        console.log('Found send button, clicking...');
        await sendBtn.click();
        await page.waitForTimeout(3000);
      } else {
        console.log('No send button either. Trying Enter on page...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
      }
    }
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 300));
  } finally {
    await browser.close();
  }
})();