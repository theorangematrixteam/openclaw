const { chromium } = require('playwright');

// Scrape contact pages for the final 5 brands
const sites = [
  { brand: 'Windowsill', url: 'https://windowsill.co.in/pages/contact-us' },
  { brand: 'Corall', url: 'https://www.corall.in/pages/contact' },
  { brand: 'Lussora', url: 'https://lussorafragrances.com/contact-us/' },
  { brand: 'Sixtyscent', url: 'https://sixtyscent.store/contact/' },
  { brand: 'Sunheri Flame', url: 'https://sunheriflame.com/contact-us/' },
  { brand: 'Jewelry by Kiara', url: 'https://jewelrybykiara.com/pages/contact' },
  { brand: 'Gharana Karigari', url: null },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const site of sites) {
    if (!site.url) { console.log(`${site.brand}: SKIP (no URL)`); continue; }
    const page = await browser.newPage();
    try {
      await page.goto(site.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      const text = await page.evaluate(() => document.body?.innerText?.substring(0, 2000) || 'empty');
      const emails = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const m = t.match(/[\w.-]+@[\w.-]+\.\w+/g);
        return m ? [...new Set(m)].slice(0, 5) : [];
      });
      const phones = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const m = t.match(/\+?[\d\s-]{10,}/g);
        return m ? [...new Set(m)].slice(0, 3) : [];
      });
      // Founder info
      const founder = text.match(/(?:founder|founded by|created by|started by|owner)\s*:?\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i)?.[1] || 'TBD';
      
      console.log(`\n=== ${site.brand} ===`);
      console.log('Emails:', emails.join(', '));
      console.log('Phones:', phones.join(', '));
      console.log('Founder:', founder);
      console.log('Text (first 300):', text.substring(0, 300));
    } catch(e) {
      console.log(`${site.brand}: ERROR - ${e.message.substring(0, 60)}`);
    }
    await page.close();
  }
  
  await browser.close();
})();