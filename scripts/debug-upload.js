const { chromium } = require('playwright');
const path = require('path');

/**
 * Postoria Scheduler - DEBUG IMAGE UPLOAD
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const imagePath = path.join(__dirname, 'post-image.jpg');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  try {
    console.log('Opening Posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('New post...');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(3000);
    
    // Get dialog structure before upload
    console.log('\n=== BEFORE UPLOAD ===');
    const dialogBefore = await page.$('[role="dialog"]');
    if (dialogBefore) {
      const html = await dialogBefore.evaluate(el => el.innerHTML.slice(0, 2000));
      console.log('Dialog contains file input:', html.includes('type="file"'));
      console.log('Dialog contains browse:', html.toLowerCase().includes('browse'));
    }
    
    // Find and interact with file input
    console.log('\n=== UPLOADING ===');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // Get file input details
      const accept = await fileInput.getAttribute('accept');
      const multiple = await fileInput.getAttribute('multiple');
      console.log('File input accept:', accept);
      console.log('File input multiple:', multiple);
      
      // Upload file
      await fileInput.setInputFiles(imagePath);
      console.log('File selected');
    }
    
    // Wait and observe
    console.log('\n=== WAITING FOR UPLOAD ===');
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      
      // Check for upload progress
      const progress = await page.$('[class*="progress"], [class*="loading"], [class*="upload"]');
      const preview = await page.$('img');
      const error = await page.$('[class*="error"], [class*="failed"]');
      
      if (preview) {
        console.log(`  ${i+1}s: Image preview found!`);
        break;
      }
      if (error) {
        const errorText = await error.textContent();
        console.log(`  ${i+1}s: ERROR:`, errorText);
        break;
      }
      if (progress) {
        console.log(`  ${i+1}s: Upload in progress...`);
      } else {
        console.log(`  ${i+1}s: Waiting...`);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, `upload-debug-${String(i+1).padStart(2, '0')}.png`), 
        fullPage: true 
      });
    }
    
    console.log('\n=== AFTER UPLOAD ===');
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-debug-final.png'), fullPage: true });
    
    // Check if image is visible
    const img = await page.$('img');
    console.log('Image element found:', !!img);
    
    // Check dialog content
    const dialogAfter = await page.$('[role="dialog"]');
    if (dialogAfter) {
      const text = await dialogAfter.textContent();
      console.log('Dialog contains "Drag & Drop":', text.includes('Drag'));
      console.log('Dialog contains "Browse":', text.includes('Browse'));
    }
    
    console.log('\nDone. Check screenshots.');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-debug-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();