const { chromium } = require('playwright');
const path = require('path');

// Final test - understand the Schedule button

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click New
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    // Get the dialog
    const dialog = await page.$('[role="dialog"]');
    
    // Scroll to bottom of dialog
    console.log('Scrolling dialog...');
    await dialog.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'dialog-bottom.png'), fullPage: true });
    
    // Get all buttons at the bottom
    const buttons = await dialog.$$('button');
    console.log('\nButtons at bottom:');
    for (let i = Math.max(0, buttons.length - 5); i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const className = await buttons[i].getAttribute('class');
      console.log(`  ${i}: "${text?.trim()}" class="${className?.slice(0, 50)}"`);
    }
    
    // Find "Publish now" or "Schedule" button
    console.log('\nLooking for action buttons...');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && (text.includes('Publish') || text.includes('Schedule') || text.includes('Draft'))) {
        console.log(`Found: "${text.trim()}"`);
      }
    }
    
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();