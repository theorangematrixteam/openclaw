const { chromium } = require('playwright');
const fs = require('fs');

// Save Twitter/X cookies from a manual login session
// Run this in headed mode — you login, cookies get saved

const COOKIES_PATH = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\twitter-cookies.json';

(async () => {
  const browser = await chromium.launch({ headless: false }); // headed so you can login
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('Opening Twitter/X login page...');
  console.log('Please login manually. Cookies will be saved automatically after login.\n');
  
  await page.goto('https://x.com/login', { timeout: 30000, waitUntil: 'domcontentloaded' });

  // Wait for the user to login — check for home page indicator
  console.log('Waiting for login (looking for Home feed)...');
  
  let loggedIn = false;
  for (let i = 0; i < 120; i++) { // 2 min timeout
    try {
      const home = await page.$('[data-testid="primaryColumn"]') || 
                   await page.$('[data-testid="AppTabBar_Home_Link"]') ||
                   await page.$('[aria-label="Home"]');
      if (home) {
        loggedIn = true;
        break;
      }
    } catch(e) {}
    await page.waitForTimeout(1000);
  }

  if (loggedIn) {
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    console.log(`\n✅ Cookies saved to ${COOKIES_PATH}`);
    console.log(`Saved ${cookies.length} cookies`);
  } else {
    console.log('\n❌ Login timeout — took too long. Try again.');
  }

  await browser.close();
})();