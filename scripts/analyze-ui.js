const { chromium } = require('playwright');
const path = require('path');

// Quick test to understand Postoria UI structure

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('Opening Postoria...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click New
    console.log('Clicking New...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'ui-01-dialog.png'), fullPage: true });
    
    // Get dialog structure
    const dialog = await page.$('[role="dialog"]');
    if (dialog) {
      const allText = await dialog.textContent();
      console.log('\nDialog text:', allText?.slice(0, 500));
      
      // Get all buttons in dialog
      const buttons = await dialog.$$('button');
      console.log('\nButtons in dialog:', buttons.length);
      
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        if (text && text.trim().length > 0 && text.trim().length < 50) {
          console.log(`  ${i}: "${text.trim()}"`);
        }
      }
      
      // Get all inputs
      const inputs = await dialog.$$('input, textarea');
      console.log('\nInputs in dialog:', inputs.length);
      
      for (let i = 0; i < inputs.length; i++) {
        const type = await inputs[i].getAttribute('type');
        const placeholder = await inputs[i].getAttribute('placeholder');
        console.log(`  ${i}: type=${type || 'textarea'}, placeholder=${placeholder}`);
      }
      
      // Look for "Publish" related elements
      const allElements = await dialog.$$('div, span, button');
      console.log('\nLooking for Publish/Schedule elements...');
      
      for (const el of allElements) {
        const text = await el.textContent();
        if (text && (text.includes('Publish') || text.includes('Schedule') || text.includes('Draft'))) {
          const className = await el.getAttribute('class');
          if (text.trim().length < 100) {
            console.log(`  Found: "${text.trim()}" class="${className?.slice(0, 50)}"`);
          }
        }
      }
    }
    
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();