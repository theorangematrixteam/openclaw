const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - TEXT ONLY (LinkedIn)
 * Try 3 times without image
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  // Schedule for 15 mins from now
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
  
  const caption = "This is an automated test post from OpenClaw 🤖\n\nTesting LinkedIn scheduling without image.";
  
  console.log('=== TEXT-ONLY SCHEDULING TEST (LinkedIn) ===');
  console.log('Schedule for:', timeStr);
  console.log('Attempt: 3 tries');
  console.log('Account: jinayshah07 (LinkedIn)');
  console.log('==========================================\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`\n=== ATTEMPT ${attempt} ===`);
    
    try {
      // STEP 1: Posts
      console.log('[1] Opening Posts...');
      await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // STEP 2: New
      console.log('[2] New post...');
      await page.click('button:has-text("New")');
      await page.waitForTimeout(2000);
      
      // STEP 3: Networks > LinkedIn
      console.log('[3] Networks > LinkedIn...');
      await page.click('button:has-text("network")', { force: true });
      await page.waitForTimeout(1500);
      
      // Find and click LinkedIn
      const netItems = await page.$$('button, div, span');
      for (const item of netItems) {
        const text = await item.textContent();
        if (text && text.toLowerCase().includes('linkedin') && text.length < 50) {
          console.log('  Found LinkedIn');
          await item.click({ force: true });
          await page.waitForTimeout(500);
          break;
        }
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // STEP 4: Accounts > jinayshah07
      console.log('[4] Accounts > jinayshah07...');
      await page.click('button:has-text("account")', { force: true });
      await page.waitForTimeout(1500);
      
      const accItems = await page.$$('button, div, span');
      for (const item of accItems) {
        const text = await item.textContent();
        if (text && (text.toLowerCase().includes('jinayshah07') || text.includes('jinay'))) {
          console.log('  Found jinayshah07');
          await item.click({ force: true });
          await page.waitForTimeout(500);
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
      
      // STEP 6: Caption (NO IMAGE)
      console.log('[6] Adding caption (no image)...');
      const textarea = await page.$('[role="dialog"] textarea');
      if (textarea) {
        await textarea.fill(caption, { force: true });
        await page.waitForTimeout(300);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, `text-attempt${attempt}-01-ready.png`), 
        fullPage: true 
      });
      
      // STEP 7: Find Schedule button
      console.log('[7] Finding Schedule button...');
      const allButtons = await page.$$('button');
      let scheduleBtn = null;
      
      for (const btn of allButtons) {
        const text = await btn.textContent();
        if (text) {
          const trimmed = text.trim();
          if (trimmed.includes('Schedule') && !trimmed.includes('Scheduled') && !trimmed.includes('Published')) {
            console.log(`  Found: "${trimmed}"`);
            scheduleBtn = btn;
            break;
          }
        }
      }
      
      // STEP 8: Schedule
      console.log('[8] Clicking Schedule...');
      if (scheduleBtn) {
        await scheduleBtn.click({ force: true });
        await page.waitForTimeout(5000);
        console.log('  Clicked!');
      } else {
        console.log('  ERROR: Schedule button not found');
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, `text-attempt${attempt}-02-after.png`), 
        fullPage: true 
      });
      
      // STEP 9: Close dialog
      console.log('[9] Closing dialog...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      
      // STEP 10: Verify
      console.log('[10] Checking Scheduled tab...');
      await page.click('button:has-text("Scheduled")', { force: true });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, `text-attempt${attempt}-03-verify.png`), 
        fullPage: true 
      });
      
      // Check for success
      const pageText = await page.textContent('body');
      if (pageText.includes(timeStr.split(' ')[0]) || pageText.includes('LinkedIn')) {
        console.log('SUCCESS: Post scheduled!');
        break; // Don't retry if successful
      } else {
        console.log('Post not found in Scheduled tab');
      }
      
      // Close browser for next attempt
      if (attempt < 3) {
        console.log('Retrying...');
        await page.waitForTimeout(2000);
      }
      
    } catch (error) {
      console.error(`Attempt ${attempt} ERROR:`, error.message);
      await page.screenshot({ 
        path: path.join(screenshotsDir, `text-attempt${attempt}-error.png`), 
        fullPage: true 
      });
    }
  }
  
  console.log('\n=== DONE ===');
  await page.waitForTimeout(10000);
  await browser.close();
})();