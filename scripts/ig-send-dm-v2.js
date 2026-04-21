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
    // Go directly to the DM thread with jinayshahh_ 
    // Instagram URL format for DMs: /direct/t/{user_id}
    // But we can also use the search approach on the /direct/new/ page
    
    console.log('Navigating to DM page...');
    await page.goto('https://www.instagram.com/direct/new/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    // Get all interactive elements to understand the page structure
    const pageStructure = await page.evaluate(() => {
      const elements = [];
      // Find all input-like elements
      document.querySelectorAll('input, textarea, [contenteditable="true"], [role="textbox"], [role="combobox"]').forEach(el => {
        elements.push({
          tag: el.tagName,
          type: el.type || '',
          name: el.name || '',
          placeholder: el.placeholder || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          role: el.getAttribute('role') || '',
          contentEditable: el.contentEditable,
          id: el.id || '',
          className: (el.className || '').toString().substring(0, 80)
        });
      });
      return elements;
    });
    console.log('Interactive elements:', JSON.stringify(pageStructure, null, 2));
    
    // Instagram DM new page typically has a search input in a dialog
    // Try to find and interact with the search
    
    // Method: type in the search area using keyboard
    // First click on the search area
    const searchArea = await page.$('[role="dialog"] input') 
      || await page.$('input[placeholder="Search"]')
      || await page.$('[aria-label="Search"]');
    
    if (searchArea) {
      console.log('Found search area, clicking...');
      await searchArea.click();
      await page.waitForTimeout(1000);
      await searchArea.type('jinayshahh_', { delay: 100 });
      console.log('Typed search query');
      await page.waitForTimeout(3000);
    } else {
      console.log('No search area found, trying keyboard approach...');
      // Click somewhere in the dialog first
      const dialog = await page.$('[role="dialog"]');
      if (dialog) {
        await dialog.click();
        await page.waitForTimeout(500);
      }
      await page.keyboard.type('jinayshahh_', { delay: 100 });
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-search.png' });
    console.log('Search screenshot saved');
    
    // Get the search results text
    const resultsText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 1000);
    });
    console.log('Results:', resultsText);
    
    // Try to find and click the user in results
    // Instagram shows results as clickable items
    const userFound = await page.evaluate(() => {
      const allText = document.body.innerText;
      if (allText.toLowerCase().includes('jinayshahh')) {
        return true;
      }
      return false;
    });
    console.log('User found in results:', userFound);
    
    // Click on the first result (should be jinayshahh_)
    if (userFound) {
      // Find clickable elements containing jinayshahh
      const clicked = await page.evaluate(() => {
        const allElements = document.querySelectorAll('[role="button"], [role="option"], [role="row"], a');
        for (const el of allElements) {
          if (el.innerText && el.innerText.toLowerCase().includes('jinayshahh')) {
            el.click();
            return true;
          }
        }
        // Try clicking on any div containing the text
        const divs = document.querySelectorAll('div');
        for (const div of divs) {
          if (div.innerText && div.innerText.toLowerCase().includes('jinayshahh') && div.children.length < 5) {
            div.click();
            return true;
          }
        }
        return false;
      });
      console.log('Clicked on user:', clicked);
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-selected.png' });
      console.log('Selected screenshot saved');
      
      // Now try to find the message input
      const afterSelectText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log('After select text:', afterSelectText);
      
      // Look for Next button or message input
      const nextBtn = await page.$('button:has-text("Next")') || await page.$('div[role="button"]:has-text("Next")');
      if (nextBtn) {
        console.log('Found Next button, clicking...');
        await nextBtn.click();
        await page.waitForTimeout(3000);
      }
      
      await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-next.png' });
      
      // Find message input
      const msgInput = await page.$('[role="textbox"]') || await page.$('textarea[placeholder="Message..."]') || await page.$('[contenteditable="true"]');
      if (msgInput) {
        console.log('Found message input, typing "hi"...');
        await msgInput.click();
        await page.waitForTimeout(500);
        await msgInput.type('hi', { delay: 50 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-typed.png' });
        
        // Send by pressing Enter
        await page.keyboard.press('Enter');
        console.log('Message sent!');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-sent.png' });
        console.log('Sent screenshot saved');
      } else {
        console.log('Could not find message input');
        
        // Check all text inputs/textareas
        const inputs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('input, textarea, [contenteditable], [role="textbox"]')).map(el => ({
            tag: el.tagName,
            placeholder: el.placeholder || '',
            ariaLabel: el.getAttribute('aria-label') || '',
            role: el.getAttribute('role') || ''
          }));
        });
        console.log('Available inputs:', JSON.stringify(inputs));
      }
    }
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 300));
  } finally {
    await browser.close();
  }
})();