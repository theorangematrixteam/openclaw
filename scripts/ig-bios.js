const { chromium } = require('playwright');

// Check BITCHN Instagram bio for founder names
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://www.instagram.com/bitchn.official/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const metaDesc = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
    const title = await page.title().catch(() => '');
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    
    console.log('Meta:', metaDesc);
    console.log('Title:', title);
    // Look for mentions of founder names in page content
    console.log('Body snippet:', bodyText.substring(0, 1000));
  } catch(e) {
    console.log('Error:', e.message.substring(0, 200));
  }
  
  // Also check Our Karma Clothing Instagram
  const page2 = await browser.newPage();
  try {
    await page2.goto('https://www.instagram.com/ourkarmaclothing/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(3000);
    
    const metaDesc = await page2.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
    console.log('\nOur Karma Meta:', metaDesc);
  } catch(e) {
    console.log('Our Karma Error:', e.message.substring(0, 200));
  }
  
  // Also check Label Kariya Instagram
  const page3 = await browser.newPage();
  try {
    await page3.goto('https://www.instagram.com/label.kariya/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page3.waitForTimeout(3000);
    
    const metaDesc = await page3.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
    console.log('\nLabel Kariya Meta:', metaDesc);
  } catch(e) {
    console.log('Label Kariya Error:', e.message.substring(0, 200));
  }
  
  await browser.close();
})();