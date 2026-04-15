const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - COMPLETE WORKING VERSION
 * 
 * CRITICAL FINDINGS:
 * 1. Both "networks" AND "accounts" must be selected (not just one)
 * 2. The button changes from "Publish now" to "Schedule" when date is filled
 * 3. Date format: MM/DD/YYYY hh:mm aa (e.g., "04/07/2026 10:35 AM")
 * 4. Must dispatch input/change events on date field for button to update
 * 5. Use force: true on all dialog interactions due to overlays
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const imagePath = path.join(__dirname, 'post-image.jpg');
  
  // Schedule time: 15 mins from now
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
  
  console.log('=== POSTORIA SCHEDULER ===');
  console.log('Current time:', now.toTimeString().slice(0, 8));
  console.log('Schedule for:', timeStr);
  console.log('==========================\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    // ===== STEP 1: Open Posts =====
    console.log('[1/8] Opening Posts page...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    // ===== STEP 2: New Post =====
    console.log('[2/8] Creating new post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    // ===== STEP 3: Select Networks =====
    console.log('[3/8] Selecting networks...');
    
    // Click networks button
    const networksBtn = await page.$('button:has-text("network")');
    if (networksBtn) {
      await networksBtn.click({ force: true });
      await page.waitForTimeout(1500);
      console.log('  Network selector opened');
      
      // Click Instagram network
      const items = await page.$$('button, div[role="button"]');
      for (const item of items) {
        const text = await item.textContent();
        if (text && text.toLowerCase().includes('instagram') && text.length < 50) {
          await item.click({ force: true });
          console.log('  Instagram network selected');
          await page.waitForTimeout(500);
          break;
        }
      }
      
      // Close selector
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // ===== STEP 4: Select Accounts =====
    console.log('[4/8] Selecting accounts...');
    
    // Click accounts button
    const accountsBtn = await page.$('button:has-text("account")');
    if (accountsBtn) {
      await accountsBtn.click({ force: true });
      await page.waitForTimeout(1500);
      console.log('  Account selector opened');
      
      // Click Instagram account (theorangematrix)
      const items = await page.$$('button, div[role="button"]');
      for (const item of items) {
        const text = await item.textContent();
        if (text && text.toLowerCase().includes('instagram') && text.length < 100) {
          await item.click({ force: true });
          console.log('  Instagram account selected');
          await page.waitForTimeout(500);
          break;
        }
      }
      
      // Close selector
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-v2-01-accounts.png'), fullPage: true });
    
    // ===== STEP 5: Upload Image =====
    console.log('[5/8] Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      console.log('  Image selected');
      await page.waitForTimeout(4000);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-v2-02-uploaded.png'), fullPage: true });
    
    // ===== STEP 6: Add Caption =====
    console.log('[6/8] Adding caption...');
    const caption = "This post was automatically scheduled by AI 🤖\n\nTesting the automation workflow - from Discord command to scheduled Instagram post, all handled by OpenClaw.";
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill(caption, { force: true });
      console.log('  Caption added');
    }
    await page.waitForTimeout(300);
    
    // ===== STEP 7: Set Schedule =====
    console.log('[7/8] Setting schedule:', timeStr);
    
    const dateInput = await page.$('input[placeholder*="MM/DD/YYYY"]');
    if (dateInput) {
      await dateInput.click({ force: true });
      await page.waitForTimeout(200);
      await dateInput.fill(timeStr, { force: true });
      await page.waitForTimeout(300);
      
      // Dispatch events to trigger button change
      await dateInput.evaluate(el => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      console.log('  Date/time set');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-v2-03-ready.png'), fullPage: true });
    
    // ===== STEP 8: Schedule =====
    console.log('[8/8] Clicking Schedule...');
    
    // Check button text
    const scheduleBtn = await page.$('button:has-text("Schedule")');
    if (scheduleBtn) {
      console.log('  Found Schedule button - clicking...');
      await scheduleBtn.click({ force: true });
      await page.waitForTimeout(5000);
    } else {
      console.log('  WARNING: Schedule button not found!');
      await page.screenshot({ path: path.join(screenshotsDir, 'final-v2-error-no-schedule.png'), fullPage: true });
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-v2-04-after-click.png'), fullPage: true });
    
    // ===== VERIFY =====
    console.log('\n[VERIFY] Checking result...');
    
    const dialogAfter = await page.$('[role="dialog"]');
    if (!dialogAfter) {
      console.log('SUCCESS: Dialog closed - post scheduled!');
    } else {
      console.log('Dialog still open - checking for errors...');
      
      // Get any error messages
      const dialogText = await dialogAfter.textContent();
      const errors = dialogText.match(/error|invalid|required|missing/i);
      if (errors) {
        console.log('Errors found:', errors);
      }
      
      // Check networks/accounts count
      if (dialogText.includes('0 networks') || dialogText.includes('0 accounts')) {
        console.log('WARNING: Networks or accounts not selected properly');
      }
    }
    
    // Go to Scheduled tab
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Scheduled")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-v2-05-scheduled-tab.png'), fullPage: true });
    
    console.log('\n=== DONE ===');
    console.log('Check screenshots for results.');
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'final-v2-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();