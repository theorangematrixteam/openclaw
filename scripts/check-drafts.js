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
    // Navigate to Posts page
    console.log('Navigating to Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click on Drafts tab
    console.log('Checking Drafts...');
    await page.click('button:has-text("Draft")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'drafts.png'), fullPage: true });
    
    // Get draft posts
    const drafts = await page.$$('div');
    console.log('Looking for drafts...');
    
    // Find the draft we just created
    const bodyText = await page.textContent('body');
    console.log('Drafts page loaded');
    
    // Check if our AI post is there
    if (bodyText.includes('AI') || bodyText.includes('OpenClaw')) {
      console.log('Found AI post in drafts');
    }
    
    // Click on the first draft to open it
    const draftItems = await page.$$('div[role="button"], button, div');
    for (const item of draftItems) {
      const text = await item.textContent();
      if (text && text.includes('AI') && text.includes('automatically')) {
        console.log('Clicking draft:', text.slice(0, 50));
        await item.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'draft-open.png'), fullPage: true });
    
    // Check the dialog structure
    const dialogText = await page.textContent('body');
    console.log('Dialog opened');
    
    // Look for Schedule button vs Publish button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && (text.includes('Schedule') || text.includes('Publish'))) {
        console.log('Found button:', text);
      }
    }
    
    // Keep browser open
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();