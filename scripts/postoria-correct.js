const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - CORRECT WORKFLOW
 * 
 * Based on user's manual workflow:
 * 1. Open Posts page
 * 2. Click New
 * 3. Enter date FIRST (before image)
 * 4. Upload image/video (WAIT for upload)
 * 5. Add caption
 * 6. Click Networks > Instagram
 * 7. Click Accounts > theorangematrix
 * 8. Click "Schedule 1 post"
 * 9. Click Close
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const imagePath = path.join(__dirname, 'post-image.jpg');
  
  // Schedule for 15 mins from now
  const now = new Date();
  const scheduleTime = new Date(now.getTime() + 15 * 60 * 1000);
  
  // MM/DD/YYYY hh:mm aa format
  const month = String(scheduleTime.getMonth() + 1).padStart(2, '0');
  const day = String(scheduleTime.getDate()).padStart(2, '0');
  const year = scheduleTime.getFullYear();
  let hours = scheduleTime.getHours();
  const minutes = String(scheduleTime.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
  
  console.log('=== POSTORIA SCHEDULER (CORRECT WORKFLOW) ===');
  console.log('Schedule for:', timeStr);
  console.log('============================================\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    // ===== STEP 1: Open Posts =====
    console.log('[1] Opening Posts page...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // ===== STEP 2: New Post =====
    console.log('[2] Clicking New...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    // ===== STEP 3: Enter Date FIRST =====
    console.log('[3] Entering date:', timeStr);
    
    const dateInput = await page.$('input[placeholder*="MM/DD/YYYY"]');
    if (dateInput) {
      await dateInput.click({ force: true });
      await page.waitForTimeout(300);
      await dateInput.fill(timeStr, { force: true });
      await page.waitForTimeout(300);
      // Dispatch events to update button
      await dateInput.evaluate(el => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      console.log('  Date entered');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-01-date.png'), fullPage: true });
    
    // ===== STEP 4: Upload Image (WAIT for upload) =====
    console.log('[4] Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      console.log('  File selected, waiting for upload...');
      
      // Wait for upload to complete (check for loading indicator to disappear)
      await page.waitForTimeout(2000);
      
      // Wait longer for larger files
      let uploadComplete = false;
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(1000);
        // Check if image preview appeared
        const preview = await page.$('img[src*="blob"], img[src*="data:"], [class*="preview"]');
        if (preview) {
          uploadComplete = true;
          console.log('  Upload complete!');
          break;
        }
        console.log(`  Waiting... ${i + 1}s`);
      }
      
      if (!uploadComplete) {
        console.log('  WARNING: Upload may not be complete');
      }
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-02-uploaded.png'), fullPage: true });
    
    // ===== STEP 5: Add Caption =====
    console.log('[5] Adding caption...');
    const caption = "This post was automatically scheduled by AI 🤖\n\nTesting the automation workflow - from Discord command to scheduled Instagram post, all handled by OpenClaw.";
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill(caption, { force: true });
      await page.waitForTimeout(300);
      console.log('  Caption added');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-03-caption.png'), fullPage: true });
    
    // ===== STEP 6: Click Networks > Instagram =====
    console.log('[6] Clicking Networks > Instagram...');
    
    // Find and click "networks" button (shows "0 networks")
    const networksBtn = await page.$('button:has-text("network")');
    if (networksBtn) {
      await networksBtn.click({ force: true });
      console.log('  Network selector opened');
      await page.waitForTimeout(1500);
      
      // Click on Instagram
      const allElements = await page.$$('button, div, span');
      for (const el of allElements) {
        const text = await el.textContent();
        if (text && text.toLowerCase().includes('instagram') && text.length < 50) {
          await el.click({ force: true });
          console.log('  Instagram clicked');
          await page.waitForTimeout(500);
          break;
        }
      }
      
      // Close selector
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-04-networks.png'), fullPage: true });
    
    // ===== STEP 7: Click Accounts > theorangematrix =====
    console.log('[7] Clicking Accounts > theorangematrix...');
    
    // Find and click "accounts" button (shows "0 accounts" or "1 accounts")
    const accountsBtn = await page.$('button:has-text("account")');
    if (accountsBtn) {
      await accountsBtn.click({ force: true });
      console.log('  Account selector opened');
      await page.waitForTimeout(1500);
      
      // Click on theorangematrix
      const allElements = await page.$$('button, div, span');
      for (const el of allElements) {
        const text = await el.textContent();
        if (text && (text.toLowerCase().includes('theorangematrix') || text.includes('@theorangematrix'))) {
          await el.click({ force: true });
          console.log('  theorangematrix clicked');
          await page.waitForTimeout(500);
          break;
        }
      }
      
      // Close selector
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-05-accounts.png'), fullPage: true });
    
    // ===== STEP 8: Click "Schedule 1 post" =====
    console.log('[8] Clicking "Schedule 1 post"...');
    
    // Look for "Schedule 1 post" button (not just "Schedule")
    const scheduleBtn = await page.$('button:has-text("Schedule")');
    if (scheduleBtn) {
      const btnText = await scheduleBtn.textContent();
      console.log(`  Found button: "${btnText?.trim()}"`);
      await scheduleBtn.click({ force: true });
      console.log('  Clicked!');
      await page.waitForTimeout(3000);
    } else {
      console.log('  ERROR: Schedule button not found');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-06-after-schedule.png'), fullPage: true });
    
    // ===== STEP 9: Click Close =====
    console.log('[9] Clicking Close...');
    
    // Look for close button or press Escape
    const closeBtn = await page.$('button:has-text("Close"), button[aria-label="Close"]');
    if (closeBtn) {
      await closeBtn.click();
      console.log('  Close clicked');
    } else {
      await page.keyboard.press('Escape');
      console.log('  Escape pressed');
    }
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-07-done.png'), fullPage: true });
    
    // ===== VERIFY =====
    console.log('\n[VERIFY] Checking Scheduled tab...');
    
    // Go to Scheduled tab
    await page.click('button:has-text("Scheduled")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-08-scheduled-tab.png'), fullPage: true });
    
    const scheduledText = await page.textContent('body');
    if (scheduledText.includes(timeStr.split(' ')[0]) || scheduledText.includes('AI')) {
      console.log('SUCCESS: Post found in Scheduled tab!');
    } else {
      console.log('Post not visible in Scheduled tab - check Drafts');
    }
    
    console.log('\n=== DONE ===');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'correct-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();