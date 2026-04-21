const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Go to Instagram
    console.log('Going to Instagram...');
    await page.goto('https://www.instagram.com/', { timeout: 30000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Get page content to see what we're dealing with
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Page text:', pageText.substring(0, 200));
    
    // Try to find login form elements - Instagram uses different layouts
    const inputs = await page.evaluate(() => {
      const allInputs = Array.from(document.querySelectorAll('input'));
      return allInputs.map(i => ({ name: i.name, type: i.type, placeholder: i.placeholder, ariaLabel: i.getAttribute('aria-label') }));
    });
    console.log('Inputs found:', JSON.stringify(inputs));
    
    // Try multiple selectors for username field
    let usernameField = await page.$('input[name="username"]') 
      || await page.$('input[aria-label="Phone number, username, or email"]')
      || await page.$('input[aria-label="Username"]')
      || await page.$('#loginForm input:first-of-type');
    
    let passwordField = await page.$('input[name="password"]')
      || await page.$('input[aria-label="Password"]')
      || await page.$('input[type="password"]')
      || await page.$('#loginForm input:last-of-type');
    
    console.log('Username field found:', !!usernameField);
    console.log('Password field found:', !!passwordField);
    
    if (usernameField && passwordField) {
      console.log('Filling credentials...');
      await usernameField.click();
      await usernameField.fill('theorangematrix');
      await page.waitForTimeout(500);
      await passwordField.click();
      await passwordField.fill('Theorangematrix28*');
      await page.waitForTimeout(500);
      
      // Click login
      const loginBtn = await page.$('button[type="submit"]') 
        || await page.$('button:has-text("Log in")')
        || await page.$('#loginForm button');
      
      if (loginBtn) {
        console.log('Clicking login...');
        await loginBtn.click();
      } else {
        console.log('No login button found, trying Enter...');
        await page.keyboard.press('Enter');
      }
      
      // Wait for navigation
      await page.waitForTimeout(8000);
      
      // Check result
      const newUrl = page.url();
      console.log('After login URL:', newUrl);
      
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log('After login text:', bodyText);
    } else {
      console.log('Could not find login form. Trying direct login URL...');
      await page.goto('https://www.instagram.com/accounts/login/', { timeout: 20000 });
      await page.waitForTimeout(3000);
      
      const inputs2 = await page.evaluate(() => {
        const allInputs = Array.from(document.querySelectorAll('input'));
        return allInputs.map(i => ({ name: i.name, type: i.type, placeholder: i.placeholder }));
      });
      console.log('Inputs on login page:', JSON.stringify(inputs2));
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  } finally {
    await browser.close();
  }
})();