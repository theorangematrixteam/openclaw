const { chromium } = require('playwright');

const brands = [
  { brand: 'Lussora', ig: 'lussorafragrances', url: 'https://lussorafragrances.com' },
  { brand: 'Corall', ig: 'corall.in', url: 'https://www.corall.in' },
  { brand: 'Blushe', ig: 'blushe.in', url: 'https://blushe.in' },
  { brand: 'Velvetra', ig: 'velvetra.in', url: null },
  { brand: 'Zaishree', ig: 'zaishree.official', url: 'https://www.zaishree.com' },
  { brand: 'Windowsill', ig: 'windowsill.candles', url: 'https://windowsill.co.in' },
  { brand: 'Jewelry by Kiara', ig: 'jewelrybykiara', url: 'https://jewelrybykiara.com' },
  { brand: 'Sunheri Flame', ig: 'sunheriflame', url: 'https://sunheriflame.com' },
  { brand: 'LitPitara', ig: 'litpitara', url: 'https://litpitara.com' },
  { brand: 'Sixtyscent', ig: 'sixtyscent', url: 'https://sixtyscent.store' },
  { brand: 'Daili', ig: 'dailiskincare', url: 'https://dailiskincare.com' },
  { brand: 'Gharana Karigari', ig: 'gharanakarigaricompany', url: null },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const item of brands) {
    const results = { brand: item.brand, ig: 'SKIP', url: 'SKIP' };
    
    // Check Instagram
    if (item.ig) {
      const igPage = await browser.newPage();
      try {
        await igPage.goto(`https://www.instagram.com/${item.ig}/`, { timeout: 15000, waitUntil: 'domcontentloaded' });
        await igPage.waitForTimeout(2000);
        const ogDesc = await igPage.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
        if (ogDesc.includes("isn't available") || ogDesc === '') {
          results.ig = 'NOT FOUND';
        } else {
          const match = ogDesc.match(/([\d,.]+[KkMm]?)\s*Followers/i);
          results.ig = match ? match[1] : '?';
        }
      } catch(e) { results.ig = 'ERROR'; }
      await igPage.close();
    }
    
    // Check website
    if (item.url) {
      const webPage = await browser.newPage();
      try {
        await webPage.goto(item.url, { timeout: 10000, waitUntil: 'domcontentloaded' });
        await webPage.waitForTimeout(2000);
        // Check for contact page link
        const contactLink = await webPage.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          const contact = links.find(l => l.href?.includes('contact') || l.innerText?.toLowerCase().includes('contact'));
          return contact ? contact.href : 'none';
        });
        const emails = await webPage.evaluate(() => {
          const t = document.body?.innerText || '';
          const m = t.match(/[\w.-]+@[\w.-]+\.\w+/g);
          return m ? [...new Set(m)].slice(0, 3) : [];
        });
        const phones = await webPage.evaluate(() => {
          const t = document.body?.innerText || '';
          const m = t.match(/\+?[\d\s-]{10,}/g);
          return m ? [...new Set(m)].slice(0, 2) : [];
        });
        results.url = `LIVE | email: ${emails.join(', ') || 'none'} | phone: ${phones.join(', ') || 'none'} | contact: ${contactLink}`;
      } catch(e) { results.url = `DEAD`; }
      await webPage.close();
    }
    
    console.log(`${results.brand}: IG=${results.ig} | URL=${results.url}`);
  }
  
  await browser.close();
})();