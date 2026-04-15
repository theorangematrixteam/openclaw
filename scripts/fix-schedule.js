const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext({
    storageState: authPath
  });
  const page = await context.newPage();
  
  try {
    // Navigate to Posts
    console.log('Navigating to Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click on Drafts tab
    console.log('Opening Drafts...');
    await page.click('button:has-text("Draft")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-01-drafts.png'), fullPage: true });
    
    // Click on the draft (click on the card)
    console.log('Opening draft...');
    const draftCards = await page.$$('div[class*="card"], div[class*="post"]');
    console.log('Draft cards found:', draftCards.length);
    
    // Get all clickable elements and find the draft
    const allElements = await page.$$('div, button');
    for (const el of allElements) {
      const text = await el.textContent();
      if (text && text.includes('AI') && text.includes('automatically') && text.length < 200) {
        console.log('Found draft:', text.slice(0, 100));
        await el.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-02-draft-open.png'), fullPage: true });
    
    // Now in the editor - find the Schedule button
    console.log('Looking for Schedule button...');
    
    // Get all buttons in the dialog
    const buttons = await page.$$('button');
    console.log('Buttons found:', buttons.length);
    
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text) {
        const trimmed = text.trim();
        if (trimmed.length < 50 && (trimmed.includes('Schedule') || trimmed.includes('Save') || trimmed.includes('Publish'))) {
          console.log('Button:', trimmed);
        }
      }
    }
    
    // Look for "Publish at" toggle first
    const publishToggle = await page.$('text=/publish at/i');
    if (publishToggle) {
      console.log('Found Publish at toggle');
      await publishToggle.click();
      await page.waitForTimeout(1000);
    }
    
    // Set schedule time - 10 mins from now
    const now = new Date();
    const scheduleTime = new Date(now.getTime() + 10 * 60 * 1000);
    const dateStr = scheduleTime.toISOString().split('T')[0];
    const timeStr = scheduleTime.toTimeString().slice(0, 5);
    
    console.log('Setting time:', dateStr, timeStr);
    
    const dateInput = await page.$('input[type="date"]');
    const timeInput = await page.$('input[type="time"]');
    
    if (dateInput) {
      await dateInput.fill(dateStr);
      console.log('Date set');
    }
    if (timeInput) {
      await timeInput.fill(timeStr);
      console.log('Time set');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-03-time-set.png'), fullPage: true });
    
    // Now find the Schedule button and click it
    console.log('Clicking Schedule...');
    const scheduleBtn = await page.$('button:has-text("Schedule")');
    if (scheduleBtn) {
      await scheduleBtn.click({ force: true });
      console.log('Clicked Schedule');
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-04-done.png'), fullPage: true });
    
    console.log('Done - check screenshots');
    
    // Keep browser open
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();