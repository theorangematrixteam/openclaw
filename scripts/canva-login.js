const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const AUTH_FILE = path.join(__dirname, 'canva-session.json');
const SCREENSHOTS = path.join(__dirname, 'screenshots');

(async () => {
  if (!fs.existsSync(SCREENSHOTS)) {
    fs.mkdirSync(SCREENSHOTS, { recursive: true });
  }

  console.log('Launching Canva...');
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });

  let context;
  if (fs.existsSync(AUTH_FILE)) {
    console.log('Using saved session...');
    context = await browser.newContext({ storageState: AUTH_FILE });
  } else {
    context = await browser.newContext();
  }

  const page = await context.newPage();
  await page.goto('https://www.canva.com/login');
  await page.waitForTimeout(2000);

  // Check if already logged in
  const currentUrl = page.url();
  if (!currentUrl.includes('login')) {
    console.log('✅ Already logged in!');
    await context.storageState({ path: AUTH_FILE });
    console.log('Session saved.');
    await page.screenshot({ path: path.join(SCREENSHOTS, 'canva-ready.png') });
    await browser.close();
    process.exit(0);
  }

  console.log('\n========================================');
  console.log('BROWSER IS OPEN - COMPLETE LOGIN NOW');
  console.log('1. Click "Continue with Google"');
  console.log('2. Login with your Google account');
  console.log('3. Wait for Canva to fully load');
  console.log('========================================\n');
  console.log('Waiting for you to login...');
  console.log('(Browser will stay open until you finish)\n');

  // Wait indefinitely for navigation away from login page
  let loggedIn = false;
  while (!loggedIn) {
    await page.waitForTimeout(5000);
    const url = page.url();
    console.log('Current URL:', url);
    
    if (!url.includes('login') && !url.includes('oauth') && url.includes('canva.com')) {
      console.log('\n✅ Login detected!');
      loggedIn = true;
      
      // Wait for page to settle
      await page.waitForTimeout(5000);
      
      // Save session
      await context.storageState({ path: AUTH_FILE });
      console.log('Session saved to:', AUTH_FILE);
      
      await page.screenshot({ path: path.join(SCREENSHOTS, 'canva-ready.png') });
      console.log('Screenshot saved.');
      
      // Keep browser open for 10 more seconds so you can see it worked
      console.log('\nClosing browser in 10 seconds...');
      await page.waitForTimeout(10000);
    }
  }

  await browser.close();
  console.log('Done. You can now use Canva automation!');
})();