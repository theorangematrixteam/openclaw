const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Zephyra.co.in - scrape homepage for contact
  const page = await browser.newPage();
  try {
    await page.goto('https://www.zephyra.co.in', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const phones = text.match(/[\d]{10,}/g) || [];
    console.log('=== ZEPHYRA ===');
    console.log('EMAILS:', [...new Set(emails)].join(', '));
    console.log('PHONES:', [...new Set(phones)].join(', '));
    console.log('TEXT (first 800):', text.substring(0, 800));
  } catch(e) {
    console.log('Zephyra error:', e.message.substring(0, 80));
  }
  await page.close();
  
  // Dandelion Jewels Instagram bio for contact
  const page2 = await browser.newPage();
  try {
    await page2.goto('https://www.instagram.com/dandelionjewels/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(3000);
    const ogDesc = await page2.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
    console.log('\n=== DANDELION IG ===');
    console.log(ogDesc);
  } catch(e) {
    console.log('Dandelion IG error:', e.message.substring(0, 80));
  }
  await page2.close();
  
  // Aarnora Instagram - check bio for email/phone
  const page3 = await browser.newPage();
  try {
    await page3.goto('https://www.instagram.com/aarnorajewels/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page3.waitForTimeout(3000);
    const bodyText = await page3.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('\n=== AARNORA IG BODY ===');
    console.log(bodyText.substring(0, 500));
  } catch(e) {
    console.log('Aarnora IG error:', e.message.substring(0, 80));
  }
  await page3.close();
  
  await browser.close();
})();