const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // headed first time for QR scan
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com/', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    // Check if we need to scan QR code
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Page text:', pageText.substring(0, 300));
    
    // Save session state
    await context.storageState({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\wa-session.json' });
    console.log('Session saved');
    
    // Check if already logged in
    const isLoggedIn = !pageText.includes('Scan') && !pageText.includes('QR');
    console.log('Logged in:', isLoggedIn);
    
    if (isLoggedIn) {
      console.log('Already logged in to WhatsApp Web!');
    } else {
      console.log('Need to scan QR code. Waiting 60 seconds for manual scan...');
      await page.waitForTimeout(60000);
      
      // Re-check after scan
      const afterText = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log('After scan:', afterText.substring(0, 200));
      
      // Save session again
      await context.storageState({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\wa-session.json' });
      console.log('Session saved after scan');
    }
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();