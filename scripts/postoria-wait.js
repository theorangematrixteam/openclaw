const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - WAIT FOR UPLOAD
 * 
 * Upload takes ~30 seconds on Postoria. Wait for it to complete.
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
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    // STEP 1
    console.log('[1] Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // STEP 2
    console.log('[2] New...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    // STEP 3: Upload FIRST (before anything else)
    console.log('[3] Uploading image (will take 30+ seconds)...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      console.log('  File selected, waiting for upload to complete...');
      
      // Wait up to 60 seconds for upload
      let uploaded = false;
      for (let i = 0; i < 60; i++) {
        await page.waitForTimeout(1000);
        
        // Check for image preview (upload complete)
        const img = await page.$('img');
        if (img) {
          console.log(`  Upload complete at ${i+1}s!`);
          uploaded = true;
          break;
        }
        
        // Check for progress bar still showing (upload in progress)
        const progress = await page.$('[class*="progress"]');
        if (progress) {
          // Upload still in progress, keep waiting
        }
        
        if (i % 5 === 0) {
          console.log(`  ${i+1}s...`);
        }
      }
      
      if (!uploaded) {
        console.log('  WARNING: Upload did not complete in 60s');
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'wait-01-upload.png'), fullPage: true });
    
    // STEP 4: Networks
    console.log('[4] Networks > Instagram...');
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
    
    // STEP 5: Accounts
    console.log('[5] Accounts > theorangematrix...');
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
    
    // STEP 6: Date
    console.log('[6] Date:', timeStr);
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
    
    // STEP 7: Caption
    console.log('[7] Caption...');
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill("OpenClaw automated post 🤖", { force: true });
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'wait-02-ready.png'), fullPage: true });
    
    // STEP 8: Find Schedule button
    console.log('[8] Finding Schedule button...');
    const allButtons = await page.$$('button');
    let scheduleBtn = null;
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && (text.includes('Schedule') && !text.includes('Scheduled'))) {
        console.log(`  Found: "${text.trim()}"`);
        scheduleBtn = btn;
        break;
      }
    }
    
    // STEP 9: Schedule
    console.log('[9] Clicking Schedule...');
    if (scheduleBtn) {
      await scheduleBtn.click({ force: true });
      await page.waitForTimeout(5000);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'wait-03-after.png'), fullPage: true });
    
    // STEP 10: Close
    console.log('[10] Closing...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // STEP 11: Verify
    console.log('[11] Verifying...');
    await page.click('button:has-text("Scheduled")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'wait-04-scheduled.png'), fullPage: true });
    
    console.log('\nDone.');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'wait-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();