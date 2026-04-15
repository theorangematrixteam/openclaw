const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - Account Focus
 * 
 * The account selector shows "The Orange Matrix" with email
 * Need to click on the account row/card, not just any element
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
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('[1] Opening Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('[2] New post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    // Open accounts dialog
    console.log('[3] Opening accounts...');
    
    // Find and click the accounts button (shows "0 accounts")
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('account')) {
        console.log('Clicking accounts button:', text);
        await btn.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'acc-01-selector.png'), fullPage: true });
    
    // Find and click on the Instagram account
    // The account shows as "The Orange Matrix" with email
    console.log('[4] Selecting Instagram account...');
    
    // Get all clickable elements in the dialog
    const dialog = await page.$('[role="dialog"]');
    const clickables = await dialog.$$('div, button, span, li');
    
    for (const el of clickables) {
      const text = await el.textContent();
      // Look for "The Orange Matrix" which is the Instagram account
      if (text && text.includes('The Orange Matrix') && !text.includes('0')) {
        console.log('Found account:', text.slice(0, 100));
        // Try clicking on it
        try {
          await el.click();
          console.log('Clicked!');
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log('Click failed, trying parent...');
          const parent = await el.$('xpath=..');
          if (parent) {
            await parent.click();
          }
        }
        break;
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'acc-02-after-click.png'), fullPage: true });
    
    // Close the accounts dialog
    console.log('[5] Closing dialog...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'acc-03-closed.png'), fullPage: true });
    
    // Check if account was selected
    const dialogAfterClose = await page.$('[role="dialog"]');
    if (dialogAfterClose) {
      const dialogText = await dialogAfterClose.textContent();
      if (dialogText.includes('1 account')) {
        console.log('SUCCESS: 1 account selected');
      } else {
        console.log('WARNING: Account not selected properly');
      }
    }
    
    // Upload image
    console.log('[6] Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      await page.waitForTimeout(4000);
    }
    
    // Add caption
    console.log('[7] Adding caption...');
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill("Automated test post 🤖", { force: true });
    }
    
    // Set schedule
    console.log('[8] Setting schedule:', timeStr);
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
    
    await page.screenshot({ path: path.join(screenshotsDir, 'acc-04-ready.png'), fullPage: true });
    
    // Click Schedule
    console.log('[9] Clicking Schedule...');
    
    // First check if button says "Schedule"
    const scheduleBtn = await page.$('button:has-text("Schedule")');
    if (scheduleBtn) {
      console.log('Schedule button found - clicking...');
      await scheduleBtn.click({ force: true });
      await page.waitForTimeout(5000);
    } else {
      console.log('Schedule button not found');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'acc-05-after-schedule.png'), fullPage: true });
    
    // Check if dialog is gone
    await page.waitForTimeout(2000);
    const dialogExists = await page.$('[role="dialog"]');
    if (!dialogExists) {
      console.log('SUCCESS: Dialog closed!');
    } else {
      console.log('Dialog still open');
      
      // Try clicking Schedule again
      const scheduleBtn2 = await page.$('button:has-text("Schedule")');
      if (scheduleBtn2) {
        console.log('Clicking Schedule again...');
        await scheduleBtn2.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }
    
    // Close dialog if still open
    const dialogFinal = await page.$('[role="dialog"]');
    if (dialogFinal) {
      console.log('Closing dialog manually...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    // Go to Scheduled tab
    console.log('[10] Checking Scheduled tab...');
    await page.goto('https://app.postoria.io/posts?status=SCHEDULED', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'acc-06-scheduled-tab.png'), fullPage: true });
    
    console.log('Done.');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'acc-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();