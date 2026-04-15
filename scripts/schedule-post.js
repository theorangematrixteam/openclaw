const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const imagePath = path.join(__dirname, 'post-image.jpg');
  
  // Calculate time 15 minutes from now
  const now = new Date();
  const scheduleTime = new Date(now.getTime() + 15 * 60 * 1000);
  const dateStr = scheduleTime.toISOString().split('T')[0];
  const timeStr = scheduleTime.toTimeString().slice(0, 5);
  
  console.log('Current time:', now.toTimeString().slice(0, 8));
  console.log('Scheduling for:', dateStr, timeStr);
  
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
    console.log('Navigating to Posts page...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click New button
    console.log('Clicking New button...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(2000);
    
    // Click on accounts button
    console.log('Opening accounts selector...');
    await page.click('button:has-text("account")', { force: true });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-01-accounts.png'), fullPage: true });
    
    // Find Instagram account - look for theorangematrix
    console.log('Selecting Instagram theorangematrix...');
    const allElements = await page.$$('div, button, span');
    for (const el of allElements) {
      const text = await el.textContent();
      if (text) {
        const lower = text.toLowerCase();
        // Look for Instagram + theorangematrix in the same element or nearby
        if ((lower.includes('instagram') || lower.includes('@theorangematrix')) && 
            !lower.includes('0 accounts') && !lower.includes('select')) {
          console.log('Found potential account:', text.slice(0, 50));
        }
      }
    }
    
    // Try clicking on Instagram icon/label
    const instagramElements = await page.$$('div:has-text("Instagram")');
    for (const el of instagramElements) {
      const parentText = await el.textContent();
      console.log('Instagram element parent:', parentText?.slice(0, 100));
    }
    
    // Click on the first Instagram account
    const accountItems = await page.$$('div[role="button"], button');
    for (const item of accountItems) {
      const text = await item.textContent();
      if (text && text.toLowerCase().includes('instagram')) {
        console.log('Clicking:', text.slice(0, 50));
        await item.click({ force: true });
        await page.waitForTimeout(500);
        break;
      }
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'final-02-selected.png'), fullPage: true });
    
    // Close account selector - press Escape
    console.log('Closing account selector...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-03-closed.png'), fullPage: true });
    
    // Upload image
    console.log('Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      await page.waitForTimeout(5000);
      console.log('Image uploaded');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-04-uploaded.png'), fullPage: true });
    
    // Add caption
    console.log('Adding caption...');
    const caption = "This post was automatically scheduled by AI 🤖\n\nTesting the automation workflow - from Discord command to scheduled Instagram post, all handled by OpenClaw.";
    
    const textarea = await page.$('[role="dialog"] textarea');
    if (textarea) {
      await textarea.fill(caption, { force: true });
      console.log('Caption added');
    }
    
    await page.waitForTimeout(500);
    
    // Enable scheduling - click on "Publish at" button/toggle
    console.log('Enabling scheduling...');
    
    // Find and click the schedule toggle
    const scheduleToggles = await page.$$('button');
    for (const btn of scheduleToggles) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('publish')) {
        await btn.click({ force: true });
        console.log('Clicked publish toggle');
        await page.waitForTimeout(500);
        break;
      }
    }
    
    // Set date and time
    const dateInput = await page.$('input[type="date"]');
    const timeInput = await page.$('input[type="time"]');
    
    if (dateInput) {
      await dateInput.fill(dateStr, { force: true });
      console.log('Date set:', dateStr);
    }
    if (timeInput) {
      await timeInput.fill(timeStr, { force: true });
      console.log('Time set:', timeStr);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-05-ready.png'), fullPage: true });
    
    // Click Schedule button - use force to bypass overlays
    console.log('Clicking Schedule...');
    const scheduleBtn = await page.$('button:has-text("Schedule")');
    if (scheduleBtn) {
      await scheduleBtn.click({ force: true });
      console.log('Clicked Schedule button');
      await page.waitForTimeout(5000);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'final-06-done.png'), fullPage: true });
    
    // Check for success
    const finalText = await page.textContent('body');
    if (finalText.includes('scheduled') || finalText.includes('success')) {
      console.log('SUCCESS: Post scheduled for', dateStr, timeStr);
    } else {
      console.log('Check final screenshot for result');
    }
    
    // Keep browser open
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'final-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();