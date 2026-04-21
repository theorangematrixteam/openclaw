const { chromium } = require('playwright');
const fs = require('fs');

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
    // Strategy: Go to jinayshahh_'s profile, click Message button
    console.log('Going to jinayshahh_ profile...');
    await page.goto('https://www.instagram.com/jinayshahh_/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    const profileText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Profile text:', profileText.substring(0, 200));
    
    // Find and click the Message button
    console.log('Looking for Message button...');
    const messageBtn = await page.$('button:has-text("Message")') 
      || await page.$('div[role="button"]:has-text("Message")')
      || await page.$('a:has-text("Message")');
    
    if (messageBtn) {
      console.log('Found Message button, clicking...');
      await messageBtn.click();
      await page.waitForTimeout(5000);
      
      // Now we should be in the DM thread
      const dmText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log('DM thread text:', dmText);
      
      // Find the message input
      const msgInput = await page.$('[role="textbox"]') 
        || await page.$('textarea[placeholder="Message..."]')
        || await page.$('[contenteditable="true"]');
      
      if (msgInput) {
        console.log('Found message input, typing "hi"...');
        await msgInput.click();
        await page.waitForTimeout(500);
        
        // Type the message
        await page.keyboard.type('hi', { delay: 100 });
        await page.waitForTimeout(1000);
        
        // Send by pressing Enter
        await page.keyboard.press('Enter');
        console.log('Message sent!');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-sent.png' });
        console.log('Screenshot saved');
      } else {
        console.log('Could not find message input');
        const inputs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('input, textarea, [contenteditable], [role="textbox"]')).map(el => ({
            tag: el.tagName, placeholder: el.placeholder || '', ariaLabel: el.getAttribute('aria-label') || '', role: el.getAttribute('role') || ''
          }));
        });
        console.log('Available inputs:', JSON.stringify(inputs));
      }
    } else {
      console.log('No Message button found. Checking page...');
      const followBtn = await page.$('button:has-text("Follow")') || await page.$('div[role="button"]:has-text("Follow")');
      if (followBtn) {
        console.log('Found Follow button - need to follow first or use different approach');
      }
      
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, [role="button"]')).map(el => ({
          text: el.innerText?.substring(0, 30) || '',
          type: el.type || '',
          ariaLabel: el.getAttribute('aria-label') || ''
        })).filter(b => b.text || b.ariaLabel);
      });
      console.log('Buttons:', JSON.stringify(buttons));
    }
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 300));
  } finally {
    await browser.close();
  }
})();