const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - Precision Version
 * 
 * Focus on selecting the RIGHT account by name
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const imagePath = path.join(__dirname, 'post-image.jpg');
  
  const now = new Date();
  const scheduleTime = new Date(now.getTime() + 15 * 60 * 1000);
  
  const month = String(scheduleTime.getMonth() + 1).padStart(2, '0');
  const day = String(scheduleTime.getDate()).padStart(2, '0');
  const year = scheduleTime.getFullYear();
  let hours = scheduleTime.getHours();
  const minutes = String(scheduleTime.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
  
  console.log('Schedule for:', timeStr);
  
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('[1] Opening Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    console.log('[2] New post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    // STEP 3: Click accounts button and list all options
    console.log('[3] Opening account selector...');
    
    // Find and click the accounts button
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('account')) {
        console.log('Found accounts button:', text);
        await btn.click({ force: true });
        break;
      }
    }
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'precise-01-accounts-open.png'), fullPage: true });
    
    // List all account options
    console.log('\n=== ACCOUNT OPTIONS ===');
    const accountOptions = await page.$$('div, button, span');
    let foundAccounts = [];
    for (const opt of accountOptions) {
      const text = await opt.textContent();
      if (text && text.length > 2 && text.length < 100) {
        const trimmed = text.trim();
        // Look for account-like names
        if (trimmed.includes('@') || 
            trimmed.toLowerCase().includes('instagram') ||
            trimmed.toLowerCase().includes('theorangematrix') ||
            trimmed.toLowerCase().includes('matrix')) {
          if (!foundAccounts.includes(trimmed)) {
            foundAccounts.push(trimmed);
            console.log('  -', trimmed);
          }
        }
      }
    }
    
    // Click on the first Instagram/theorangematrix account
    console.log('\n[4] Selecting account...');
    for (const opt of accountOptions) {
      const text = await opt.textContent();
      if (text && text.toLowerCase().includes('instagram') && 
          (text.toLowerCase().includes('theorangematrix') || text.includes('@'))) {
        console.log('Clicking:', text.slice(0, 50));
        await opt.click({ force: true });
        await page.waitForTimeout(500);
        break;
      }
    }
    
    // Close selector
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'precise-02-account-selected.png'), fullPage: true });
    
    // Upload image
    console.log('[5] Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      await page.waitForTimeout(4000);
    }
    
    // Add caption
    console.log('[6] Adding caption...');
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill("This post was automatically scheduled by AI 🤖\n\nTesting the automation workflow.", { force: true });
    }
    
    // Set schedule
    console.log('[7] Setting schedule:', timeStr);
    const dateInput = await page.$('input[placeholder*="MM/DD/YYYY"]');
    if (dateInput) {
      await dateInput.click({ force: true });
      await dateInput.fill(timeStr, { force: true });
      await dateInput.evaluate(el => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'precise-03-ready.png'), fullPage: true });
    
    // Click Schedule
    console.log('[8] Clicking Schedule...');
    await page.click('button:has-text("Schedule")', { force: true });
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'precise-04-done.png'), fullPage: true });
    
    // Check if dialog closed
    const dialog = await page.$('[role="dialog"]');
    if (!dialog) {
      console.log('SUCCESS: Dialog closed!');
    } else {
      console.log('Dialog still open - check screenshot');
    }
    
    // Check Scheduled tab
    await page.click('button:has-text("Scheduled")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, 'precise-05-scheduled.png'), fullPage: true });
    
    console.log('Done.');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'precise-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();