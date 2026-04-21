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
    // Navigate to new DM
    console.log('Navigating to new DM...');
    await page.goto('https://www.instagram.com/direct/new/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    // Search for recipient
    console.log('Searching for jinayshahh_...');
    const searchInput = await page.$('input[name="searchInput"]');
    if (!searchInput) {
      console.log('Could not find search input');
      // Try alternative
      const altInput = await page.$('input[placeholder="Search"]');
      if (altInput) {
        await altInput.click();
        await altInput.fill('jinayshahh_');
      }
    } else {
      await searchInput.click();
      await searchInput.fill('jinayshahh_');
    }
    
    await page.waitForTimeout(3000);
    
    // Take screenshot to see search results
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-search-results.png' });
    console.log('Search screenshot saved');
    
    // Get search results
    const searchResults = await page.evaluate(() => {
      const results = [];
      // Instagram search results are typically in a list
      const items = document.querySelectorAll('[role="dialog"] [role="button"], [role="listbox"] [role="option"], div.x1n2onr6');
      items.forEach(item => {
        results.push({
          text: item.innerText?.substring(0, 100) || '',
          role: item.getAttribute('role') || '',
          className: item.className?.substring(0, 50) || ''
        });
      });
      return results.slice(0, 10);
    });
    console.log('Search results:', JSON.stringify(searchResults, null, 2));
    
    // Try clicking on the first result that matches
    const clicked = await page.evaluate(() => {
      // Look for elements containing jinayshahh_
      const allElements = document.querySelectorAll('div, span, a');
      for (const el of allElements) {
        if (el.innerText && el.innerText.toLowerCase().includes('jinayshahh')) {
          // Find the clickable parent
          const clickable = el.closest('[role="button"]') || el.closest('[role="row"]') || el.closest('a') || el;
          if (clickable) {
            clickable.click();
            return 'Clicked: ' + el.innerText.substring(0, 50);
          }
        }
      }
      return 'Not found';
    });
    console.log('Click result:', clicked);
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-after-click.png' });
    console.log('After click screenshot saved');
    
    // Now look for the message input
    const messageInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"], [role="textbox"]')).map(el => ({
        tag: el.tagName,
        type: el.type || '',
        placeholder: el.placeholder || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        role: el.getAttribute('role') || '',
        contentEditable: el.contentEditable
      }));
    });
    console.log('Message inputs:', JSON.stringify(messageInputs, null, 2));
    
    // Try to type in the message field
    const msgField = await page.$('[role="textbox"]') || await page.$('textarea[placeholder="Message..."]') || await page.$('[contenteditable="true"]');
    if (msgField) {
      console.log('Found message field, typing "hi"...');
      await msgField.click();
      await page.waitForTimeout(500);
      await msgField.fill('hi');
      await page.waitForTimeout(1000);
      
      // Take screenshot before sending
      await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-before-send.png' });
      console.log('Before send screenshot saved');
      
      // Try pressing Enter or clicking send
      await page.keyboard.press('Enter');
      console.log('Pressed Enter to send');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-after-send.png' });
      console.log('After send screenshot saved');
      
      const finalText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log('Final page text:', finalText);
    } else {
      console.log('Could not find message input field');
    }
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 300));
  } finally {
    await browser.close();
  }
})();