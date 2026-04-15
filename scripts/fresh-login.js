const { chromium } = require('playwright');
const path = require('path');

/**
 * Try fresh login and then check accounts
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  
  // Try WITHOUT saved session first (to see what a fresh login shows)
  let context = await browser.newContext();
  let page = await context.newPage();
  
  try {
    console.log('=== FRESH LOGIN TEST ===\n');
    
    console.log('Going to Postoria...');
    await page.goto('https://app.postoria.io/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Check if we need to login
    const usernameInput = await page.$('input[name="username"]');
    if (usernameInput) {
      console.log('Login page detected - logging in...');
      await page.fill('input[name="username"]', 'theorangematrixteam@gmail.com');
      await page.fill('input[name="password"]', 'OrangematrixPostoria123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      console.log('Logged in!');
      
      // Save new session
      await context.storageState({ path: authPath });
      console.log('Session saved!');
    } else {
      console.log('Already logged in (using saved session?)');
    }
    
    // Go to Posts
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click New
    console.log('\nOpening new post dialog...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fresh-01-dialog.png'), fullPage: true });
    
    // Click accounts
    console.log('Opening accounts selector...');
    await page.click('button:has-text("account")', { force: true });
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'fresh-02-accounts.png'), fullPage: true });
    
    // Check what loaded
    const dialogText = await page.textContent('body');
    console.log('\n=== ACCOUNTS CHECK ===');
    console.log('Contains jinayshah07:', dialogText.includes('jinayshah07'));
    console.log('Contains Instagram:', dialogText.includes('Instagram'));
    console.log('Contains LinkedIn:', dialogText.includes('LinkedIn'));
    console.log('Contains "No accounts":', dialogText.includes('No accounts'));
    
    console.log('\nDone.');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'fresh-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();