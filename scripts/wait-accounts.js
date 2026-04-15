const { chromium } = require('playwright');
const path = require('path');

/**
 * Wait for accounts to load
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('Opening Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('New post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    // Click accounts and WAIT for content to load
    console.log('Opening accounts (waiting for content to load)...');
    await page.click('button:has-text("account")', { force: true });
    
    // Wait for accounts to appear (up to 10 seconds)
    console.log('Waiting for accounts to load...');
    let accountsLoaded = false;
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(500);
      
      const dialogText = await page.textContent('body');
      if (dialogText.includes('jinayshah07') || dialogText.includes('LinkedIn') || dialogText.includes('Instagram')) {
        console.log(`  Accounts loaded at ${(i+1)*500}ms!`);
        accountsLoaded = true;
        break;
      }
      console.log(`  ${i+1}: Waiting...`);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'wait-accounts.png'), fullPage: true });
    
    if (!accountsLoaded) {
      console.log('WARNING: Accounts did not load after 10 seconds');
    }
    
    // Try networks too
    console.log('\nTrying networks...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("network")', { force: true });
    
    console.log('Waiting for networks to load...');
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(500);
      
      const dialogText = await page.textContent('body');
      if (dialogText.includes('Instagram') || dialogText.includes('LinkedIn') || dialogText.includes('Facebook')) {
        console.log(`  Networks loaded at ${(i+1)*500}ms!`);
        break;
      }
      console.log(`  ${i+1}: Waiting...`);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'wait-networks.png'), fullPage: true });
    
    // Check full page text
    const fullText = await page.textContent('body');
    console.log('\n=== Networks/Accounts visible? ===');
    console.log('Contains Instagram:', fullText.includes('Instagram'));
    console.log('Contains LinkedIn:', fullText.includes('LinkedIn'));
    console.log('Contains jinayshah07:', fullText.includes('jinayshah07'));
    
    console.log('\nDone.');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'wait-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();