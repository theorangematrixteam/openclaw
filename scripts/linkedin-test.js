const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - LinkedIn Text Test
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
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
  
  const caption = "this is linkedin test";
  
  console.log('=== LINKEDIN TEST ===');
  console.log('Schedule for:', timeStr);
  console.log('Caption:', caption);
  console.log('=====================\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('[1] Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('[2] New...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    console.log('[3] Networks > LinkedIn...');
    await page.click('button:has-text("network")', { force: true });
    await page.waitForTimeout(2000);
    
    // Click LinkedIn
    const netItems = await page.$$('button, div, span');
    for (const item of netItems) {
      const text = await item.textContent();
      if (text && text.toLowerCase().includes('linkedin') && text.length < 50) {
        console.log('  Found LinkedIn, clicking...');
        await item.click({ force: true });
        await page.waitForTimeout(1000);
        break;
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    console.log('[4] Accounts > jinayshah07...');
    await page.click('button:has-text("account")', { force: true });
    await page.waitForTimeout(2000);
    
    const accItems = await page.$$('button, div, span');
    for (const item of accItems) {
      const text = await item.textContent();
      if (text && (text.toLowerCase().includes('jinayshah07') || text.includes('jinay'))) {
        console.log('  Found jinayshah07, clicking...');
        await item.click({ force: true });
        await page.waitForTimeout(1000);
        break;
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
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
      await page.waitForTimeout(1000);
    }
    
    console.log('[6] Caption:', caption);
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill(caption, { force: true });
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'linkedin-01-ready.png'), fullPage: true });
    
    console.log('[7] Finding Schedule button...');
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Schedule') && !text.includes('Scheduled')) {
        console.log('  Found:', text.trim());
      }
    }
    
    const scheduleBtn = await page.$('button');
    const buttons = await page.$$('button');
    let targetBtn = null;
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Schedule') && !text.includes('Scheduled') && !text.includes('Published')) {
        targetBtn = btn;
        break;
      }
    }
    
    console.log('[8] Clicking Schedule...');
    if (targetBtn) {
      await targetBtn.click({ force: true });
      console.log('  Clicked!');
      await page.waitForTimeout(5000);
    } else {
      console.log('  ERROR: Button not found');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'linkedin-02-after.png'), fullPage: true });
    
    console.log('[9] Checking result...');
    // Check if dialog closed
    const dialog = await page.$('[role="dialog"]');
    if (dialog) {
      console.log('  Dialog still open');
      // Check for errors
      const dialogText = await dialog.textContent();
      console.log('  Dialog text:', dialogText?.slice(0, 200));
      
      // Try clicking Schedule again
      const btns2 = await page.$$('button');
      for (const btn of btns2) {
        const text = await btn.textContent();
        if (text && text.includes('Schedule') && !text.includes('Scheduled')) {
          console.log('  Clicking Schedule again...');
          await btn.click({ force: true });
          await page.waitForTimeout(3000);
          break;
        }
      }
    } else {
      console.log('  Dialog closed - success?');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'linkedin-03-check.png'), fullPage: true });
    
    // Close dialog if still open
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Check Scheduled tab
    console.log('[10] Scheduled tab...');
    await page.click('button:has-text("Scheduled")', { force: true });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'linkedin-04-scheduled.png'), fullPage: true });
    
    // Check Drafts
    console.log('[11] Drafts tab...');
    await page.click('button:has-text("Draft")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'linkedin-05-drafts.png'), fullPage: true });
    
    console.log('\nDone. Check screenshots.');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'linkedin-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();