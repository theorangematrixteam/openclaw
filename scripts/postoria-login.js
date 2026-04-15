const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to Postoria...');
    await page.goto('https://app.postoria.io/', { waitUntil: 'domcontentloaded' });
    
    // Fill login form
    console.log('Filling login form...');
    await page.fill('input[name="username"]', 'theorangematrixteam@gmail.com');
    await page.fill('input[name="password"]', 'OrangematrixPostoria123');
    
    // Submit login
    console.log('Submitting login...');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    ]);
    
    // Wait for dashboard elements to appear
    console.log('Waiting for dashboard...');
    await page.waitForSelector('.calendar, [data-testid="sidebar"], nav, .sidebar', { timeout: 10000 });
    
    console.log('Login successful! URL:', page.url());
    
    // Save dashboard screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard.png'), 
      fullPage: true 
    });
    
    // Save auth state for future sessions
    await context.storageState({ path: path.join(__dirname, 'postoria-auth.json') });
    console.log('Auth state saved to postoria-auth.json!');
    
    // Explore the dashboard
    console.log('Dashboard loaded successfully');
    
    // Keep browser open for 5 seconds to see the dashboard
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'error.png'), 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();