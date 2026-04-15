const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - FIXED WORKFLOW
 * 
 * Issues found:
 * 1. Image upload needs longer wait
 * 2. Need to click "Browse" button to trigger file upload
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
    // STEP 1: Open Posts
    console.log('\n[1] Opening Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // STEP 2: New
    console.log('[2] New post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-01-dialog.png'), fullPage: true });
    
    // STEP 3: Date FIRST
    console.log('[3] Date:', timeStr);
    const dateInput = await page.$('input[placeholder*="MM/DD/YYYY"]');
    if (dateInput) {
      await dateInput.click();
      await page.waitForTimeout(200);
      await dateInput.fill(timeStr);
      await page.waitForTimeout(200);
      await dateInput.evaluate(el => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-02-date.png'), fullPage: true });
    
    // STEP 4: Networks FIRST (before image upload)
    console.log('[4] Networks > Instagram...');
    await page.click('button:has-text("network")', { force: true });
    await page.waitForTimeout(1500);
    
    // Click Instagram
    const networkItems = await page.$$('button, div');
    for (const item of networkItems) {
      const text = await item.textContent();
      if (text && text.toLowerCase().includes('instagram') && text.length < 50) {
        await item.click({ force: true });
        console.log('  Instagram selected');
        await page.waitForTimeout(500);
        break;
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // STEP 5: Accounts
    console.log('[5] Accounts > theorangematrix...');
    await page.click('button:has-text("account")', { force: true });
    await page.waitForTimeout(1500);
    
    const accountItems = await page.$$('button, div');
    for (const item of accountItems) {
      const text = await item.textContent();
      if (text && (text.toLowerCase().includes('theorangematrix') || text.includes('@theorangematrix'))) {
        await item.click({ force: true });
        console.log('  theorangematrix selected');
        await page.waitForTimeout(500);
        break;
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-03-accounts.png'), fullPage: true });
    
    // STEP 6: Upload Image - use the file input directly
    console.log('[6] Uploading image...');
    
    // Try to find and click Browse button, then use file input
    const browseBtn = await page.$('button:has-text("Browse"), input[type="file"]');
    const fileInput = await page.$('input[type="file"]');
    
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      console.log('  File selected via input');
      
      // Wait for upload - look for preview or loading indicator
      console.log('  Waiting for upload...');
      await page.waitForTimeout(3000);
      
      // Check if image appeared
      const img = await page.$('img');
      if (img) {
        console.log('  Image preview found!');
      } else {
        console.log('  No preview yet, waiting more...');
        await page.waitForTimeout(5000);
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-04-upload.png'), fullPage: true });
    
    // STEP 7: Caption
    console.log('[7] Caption...');
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill("Automated test post by OpenClaw 🤖", { force: true });
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-05-caption.png'), fullPage: true });
    
    // STEP 8: Check button text
    console.log('[8] Checking button...');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && (text.includes('Schedule') || text.includes('Publish'))) {
        console.log(`  Button: "${text.trim()}"`);
      }
    }
    
    // STEP 9: Schedule
    console.log('[9] Scheduling...');
    
    // Look for "Schedule 1 post" or "Schedule" button
    const scheduleBtn = await page.$('button:has-text("Schedule 1 post"), button:has-text("Schedule")');
    if (scheduleBtn) {
      const btnText = await scheduleBtn.textContent();
      console.log(`  Clicking: "${btnText?.trim()}"`);
      await scheduleBtn.click({ force: true });
      await page.waitForTimeout(5000);
    } else {
      // Try "Publish now" if date wasn't set properly
      const publishBtn = await page.$('button:has-text("Publish now")');
      if (publishBtn) {
        console.log('  WARNING: Still shows "Publish now" - date may not be set');
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-06-after-click.png'), fullPage: true });
    
    // STEP 10: Close dialog
    console.log('[10] Closing...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // STEP 11: Verify
    console.log('[11] Verifying...');
    await page.click('button:has-text("Scheduled")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-07-verify.png'), fullPage: true });
    
    console.log('\nDone. Check screenshots.');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();