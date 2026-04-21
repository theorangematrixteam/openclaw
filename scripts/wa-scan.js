const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false }); // VISIBLE so Jinay can scan QR
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com/', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    console.log('========================================');
    console.log('SCAN THE QR CODE ON SCREEN WITH YOUR PHONE');
    console.log('WhatsApp > Settings > Linked Devices > Link a device');
    console.log('Waiting 120 seconds for QR scan...');
    console.log('========================================');
    
    // Wait up to 120 seconds for QR scan
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(5000);
      const url = page.url();
      const text = await page.evaluate(() => document.body.innerText.substring(0, 200));
      
      // Check if we're logged in (URL changes or chat list appears)
      if (text.includes('Chat') || text.includes('Search') || text.includes('Filters') || !text.includes('Scan')) {
        console.log('LOGGED IN! Saving session...');
        await context.storageState({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\wa-cookies.json' });
        console.log('Session saved to wa-cookies.json');
        
        // Test: try navigating to a chat
        console.log('Session is active. Ready for messaging.');
        break;
      }
      
      console.log(`Waiting... (${(i+1)*5}s elapsed)`);
    }
    
    // Final check
    const finalText = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('Final page state:', finalText.substring(0, 200));
    
    // Keep browser open for a bit more so Jinay can see result
    console.log('Keeping browser open for 10 more seconds...');
    await page.waitForTimeout(10000);
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();