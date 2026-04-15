const { chromium } = require('playwright');
const path = require('path');

// Just test the upload

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const imagePath = path.join(__dirname, 'test-image.jpg');
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('Opening Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('New post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    // Just upload - nothing else
    console.log('Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    console.log('File input found:', !!fileInput);
    
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      console.log('File selected, waiting 90 seconds...');
    }
    
    // Wait 90 seconds
    await page.waitForTimeout(90000);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-test-90s.png'), fullPage: true });
    
    console.log('Done. Check screenshot.');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-test-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();