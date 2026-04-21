const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Scrape Pranikas about page for founder info
  const page = await browser.newPage();
  try {
    await page.goto('https://pranikas.com/about/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    console.log('=== PRANIKAS ABOUT ===');
    console.log(text);
  } catch(e) {
    console.log('Pranikas about error:', e.message.substring(0, 80));
  }
  await page.close();
  
  // Scrape Srijanam for any contact info
  const page2 = await browser.newPage();
  try {
    await page2.goto('https://srijanam.com', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(3000);
    const text = await page2.evaluate(() => document.body.innerText.substring(0, 3000));
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const phones = text.match(/[\d]{10,}/g) || [];
    console.log('\n=== SRIJANAM ===');
    console.log('EMAILS:', emails.join(', '));
    console.log('PHONES:', phones.join(', '));
    console.log('TEXT:', text.substring(0, 500));
  } catch(e) {
    console.log('Srijanam error:', e.message.substring(0, 80));
  }
  await page2.close();
  
  // Scrape Aarnora Instagram bio for contact
  const page3 = await browser.newPage();
  try {
    await page3.goto('https://www.instagram.com/aarnorajewels/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page3.waitForTimeout(3000);
    const ogDesc = await page3.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
    console.log('\n=== AARNORA IG ===');
    console.log(ogDesc);
  } catch(e) {
    console.log('Aarnora IG error:', e.message.substring(0, 80));
  }
  await page3.close();
  
  await browser.close();
})();