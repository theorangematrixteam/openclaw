const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // headed for first login to handle any verification
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Go to Instagram login
    console.log('Navigating to Instagram login...');
    await page.goto('https://www.instagram.com/accounts/login/', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Accept cookies if prompted
    try {
      const cookieBtn = await page.$('button:has-text("Allow all cookies")') || await page.$('button:has-text("Accept")') || await page.$('button:has-text("Allow")');
      if (cookieBtn) {
        await cookieBtn.click();
        console.log('Accepted cookies');
        await page.waitForTimeout(1000);
      }
    } catch(e) {}
    
    // Fill in username and password
    console.log('Filling in credentials...');
    const usernameInputs = await page.$$('input[name="username"]');
    const passwordInputs = await page.$$('input[name="password"]');
    
    if (usernameInputs.length > 0 && passwordInputs.length > 0) {
      await usernameInputs[0].fill('theorangematrix');
      await passwordInputs[0].fill('Theorangematrix28*');
      console.log('Credentials filled');
      await page.waitForTimeout(1000);
      
      // Click login button
      const loginBtn = await page.$('button[type="submit"]') || await page.$('button:has-text("Log in")') || await page.$('div[role="button"]:has-text("Log in")');
      if (loginBtn) {
        await loginBtn.click();
        console.log('Login button clicked');
      } else {
        // Try pressing Enter
        await page.keyboard.press('Enter');
        console.log('Pressed Enter to login');
      }
    }
    
    // Wait for login to complete
    await page.waitForTimeout(8000);
    
    // Check if we need to handle "Save Login Info" prompt
    try {
      const notNowBtn = await page.$('button:has-text("Not Now")') || await page.$('div[role="button"]:has-text("Not Now")');
      if (notNowBtn) {
        await notNowBtn.click();
        console.log('Dismissed Save Login Info prompt');
        await page.waitForTimeout(2000);
      }
    } catch(e) {}
    
    // Check if we need to handle notifications prompt
    try {
      const notNowBtn2 = await page.$('button:has-text("Not Now")') || await page.$('div[role="button"]:has-text("Not Now")');
      if (notNowBtn2) {
        await notNowBtn2.click();
        console.log('Dismissed notifications prompt');
        await page.waitForTimeout(2000);
      }
    } catch(e) {}
    
    // Check current URL to see if login succeeded
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('challenge') || currentUrl.includes('checkpoint')) {
      console.log('SECURITY CHECKPOINT DETECTED - may need manual verification');
      console.log('Waiting 30 seconds for manual intervention...');
      await page.waitForTimeout(30000);
    }
    
    // Save cookies/session state
    await context.storageState({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-session.json' });
    console.log('Session state saved');
    
    // Now navigate to DM page
    console.log('Navigating to DMs...');
    await page.goto('https://www.instagram.com/direct/new/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    // Take a screenshot to see what we have
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-1.png' });
    console.log('Screenshot saved');
    
    // Try to find the recipient search input
    const searchInput = await page.$('input[placeholder="Search"]') || await page.$('input[aria-label="Search"]') || await page.$('input[name="queryBox"]');
    
    if (searchInput) {
      console.log('Found search input, typing recipient name...');
      await searchInput.click();
      await searchInput.fill('jinayshahh_');
      await page.waitForTimeout(3000);
      
      // Take screenshot of search results
      await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-2.png' });
      console.log('Search screenshot saved');
      
      // Click on the first result
      const firstResult = await page.$('[role="dialog"] [role="button"]') || await page.$('div[role="dialog"] li:first-child') || await page.$('div.-qQT3');
      if (firstResult) {
        await firstResult.click();
        console.log('Selected recipient');
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('Could not find search input');
    }
    
    // Keep browser open for debugging
    console.log('Keeping browser open for 60 seconds for manual inspection...');
    await page.waitForTimeout(60000);
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-dm-error.png' });
  } finally {
    await browser.close();
  }
})();