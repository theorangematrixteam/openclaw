const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - IMAGE UPLOAD FIX
 * 
 * The image upload requires clicking Browse or proper file input handling
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
    // STEP 1: Posts
    console.log('\n[1] Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // STEP 2: New
    console.log('[2] New...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    // STEP 3: Networks
    console.log('[3] Networks > Instagram...');
    await page.click('button:has-text("network")', { force: true });
    await page.waitForTimeout(1000);
    
    const netItems = await page.$$('button, div');
    for (const item of netItems) {
      const text = await item.textContent();
      if (text && text.toLowerCase().includes('instagram') && text.length < 50) {
        await item.click({ force: true });
        await page.waitForTimeout(300);
        break;
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // STEP 4: Accounts
    console.log('[4] Accounts > theorangematrix...');
    await page.click('button:has-text("account")', { force: true });
    await page.waitForTimeout(1000);
    
    const accItems = await page.$$('button, div');
    for (const item of accItems) {
      const text = await item.textContent();
      if (text && (text.toLowerCase().includes('theorangematrix') || text.includes('@theorangematrix'))) {
        await item.click({ force: true });
        await page.waitForTimeout(300);
        break;
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // STEP 5: Date
    console.log('[5] Date:', timeStr);
    const dateInput = await page.$('input[placeholder*="MM/DD/YYYY"]');
    if (dateInput) {
      await dateInput.click();
      await dateInput.fill(timeStr);
      await dateInput.evaluate(el => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }
    
    // STEP 6: Upload Image - CRITICAL: Wait for upload to complete
    console.log('[6] Uploading image (this takes time)...');
    
    // Find file input
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      console.log('  File selected, waiting for upload (10s)...');
      
      // Wait longer for upload
      await page.waitForTimeout(10000);
      
      console.log('  Upload wait complete');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-01-after.png'), fullPage: true });
    
    // STEP 7: Caption
    console.log('[7] Caption...');
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill("OpenClaw automated post test 🤖", { force: true });
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-02-caption.png'), fullPage: true });
    
    // STEP 8: Schedule button
    console.log('[8] Finding Schedule button...');
    
    // Get all buttons with Schedule text
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && (text.includes('Schedule') || text.includes('Publish'))) {
        console.log(`  Button: "${text.trim()}"`);
      }
    }
    
    // Find the right Schedule button (not "Scheduled" or "Published")
    let scheduleBtn = null;
    for (const btn of allButtons) {
      const text = await btn.textContent();
      // Look for "Schedule 1 post" or "Schedule" but not "Scheduled"
      if (text && text.includes('Schedule') && !text.includes('Scheduled') && !text.includes('Published')) {
        scheduleBtn = btn;
        console.log(`  Found action button: "${text.trim()}"`);
        break;
      }
    }
    
    if (scheduleBtn) {
      console.log('[9] Clicking Schedule...');
      await scheduleBtn.click({ force: true });
      await page.waitForTimeout(5000);
    } else {
      console.log('[9] ERROR: Schedule button not found');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-03-after-click.png'), fullPage: true });
    
    // STEP 10: Close
    console.log('[10] Closing dialog...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // STEP 11: Verify
    console.log('[11] Checking Scheduled tab...');
    await page.click('button:has-text("Scheduled")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-04-verify.png'), fullPage: true });
    
    console.log('\nDone.');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();