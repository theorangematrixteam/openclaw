const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to Postoria login
    console.log('Navigating to Postoria...');
    await page.goto('https://app.postoria.io/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see the page
    await page.screenshot({ path: 'postoria-login.png', fullPage: true });
    console.log('Screenshot saved: postoria-login.png');
    
    // Look for login form elements
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"]');
    
    console.log('Email input found:', !!emailInput);
    console.log('Password input found:', !!passwordInput);
    console.log('Login button found:', !!loginButton);
    
    // Try to find any input fields
    const allInputs = await page.$$('input');
    console.log('Total inputs found:', allInputs.length);
    
    for (let i = 0; i < allInputs.length; i++) {
      const type = await allInputs[i].getAttribute('type');
      const placeholder = await allInputs[i].getAttribute('placeholder');
      const name = await allInputs[i].getAttribute('name');
      console.log(`Input ${i}: type=${type}, placeholder=${placeholder}, name=${name}`);
    }
    
    // Wait for user to see the page
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'postoria-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();