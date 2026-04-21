const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Going to Instagram login...');
    await page.goto('https://www.instagram.com/accounts/login/', { timeout: 30000, waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Dismiss cookie banner
    try {
      const cookieBtn = await page.$('button:has-text("Allow all cookies")') || await page.$('button:has-text("Accept All")');
      if (cookieBtn) { await cookieBtn.click(); console.log('Dismissed cookies'); await page.waitForTimeout(1000); }
    } catch(e) {}
    
    // Fill credentials using correct field names
    console.log('Filling credentials...');
    const emailField = await page.$('input[name="email"]') || await page.$('input[type="text"]');
    const passField = await page.$('input[name="pass"]') || await page.$('input[type="password"]');
    
    if (emailField && passField) {
      await emailField.click();
      await emailField.fill('theorangematrix');
      await page.waitForTimeout(500);
      await passField.click();
      await passField.fill('Theorangematrix28*');
      await page.waitForTimeout(500);
      
      // Click login
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        console.log('Login submitted');
      }
      
      // Wait for result
      await page.waitForTimeout(10000);
      
      const currentUrl = page.url();
      console.log('URL after login:', currentUrl);
      
      // Handle "Save Login Info" prompt
      try {
        const notNow = await page.$('button:has-text("Not Now")') || await page.$('div[role="button"]:has-text("Not Now")');
        if (notNow) { await notNow.click(); console.log('Dismissed Save Login Info'); await page.waitForTimeout(2000); }
      } catch(e) {}
      
      // Handle notifications prompt
      try {
        const notNow2 = await page.$('button:has-text("Not Now")') || await page.$('div[role="button"]:has-text("Not Now")');
        if (notNow2) { await notNow2.click(); console.log('Dismissed notifications'); await page.waitForTimeout(2000); }
      } catch(e) {}
      
      const finalUrl = page.url();
      const finalText = await page.evaluate(() => document.body.innerText.substring(0, 200));
      console.log('Final URL:', finalUrl);
      console.log('Final text:', finalText);
      
      // Check for checkpoint/suspicious login
      if (finalUrl.includes('challenge') || finalUrl.includes('checkpoint')) {
        console.log('SECURITY CHECKPOINT - needs manual verification');
      }
      
      // Save session
      await context.storageState({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-session.json' });
      console.log('Session saved');
      
      // If logged in, try to navigate to DMs
      if (finalUrl.includes('instagram.com') && !finalUrl.includes('login') && !finalUrl.includes('challenge')) {
        console.log('Login appears successful! Navigating to DMs...');
        await page.goto('https://www.instagram.com/direct/new/', { timeout: 20000 });
        await page.waitForTimeout(5000);
        
        const dmText = await page.evaluate(() => document.body.innerText.substring(0, 300));
        console.log('DM page text:', dmText);
      }
      
    } else {
      console.log('Could not find login fields');
    }
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();