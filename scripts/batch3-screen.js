const { chromium } = require('playwright');

const brands = [
  { brand: 'Jewelry by Kiara', ig: 'jewelry_by_kiara', url: 'https://jewelrybykiara.com' },
  { brand: 'Zaishree', ig: 'zaishree_jewellery', url: 'https://www.zaishree.com' },
  { brand: 'Lavanta Naturals', ig: 'lavantanaturals', url: 'https://lavantanaturals.com' },
  { brand: 'Achisy', ig: 'achisy', url: 'https://achisy.com' },
  { brand: 'Daili Skincare', ig: 'dailiskincare', url: 'https://dailiskincare.com' },
  { brand: 'Sunheri Flame', ig: 'sunheriflame', url: 'https://sunheriflame.com' },
  { brand: 'Windowsill', ig: 'windowsill.co.in', url: 'https://windowsill.co.in' },
  { brand: 'LitPitara', ig: 'litpitara', url: 'https://litpitara.com' },
  { brand: 'Luna Lantern', ig: 'lunalantern', url: 'https://lunalantern.com' },
  { brand: 'Sixtyscent', ig: 'sixtyscent', url: 'https://sixtyscent.store' },
  { brand: 'Gharana Karigari', ig: 'gharanakarigaricompany', url: null },
  { brand: 'Coluxe', ig: 'coluxe.jewelry', url: 'https://coluxe.in' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const item of brands) {
    const results = { brand: item.brand, ig: 'SKIP', url: 'SKIP' };
    
    // Check Instagram
    const igPage = await browser.newPage();
    try {
      await igPage.goto(`https://www.instagram.com/${item.ig}/`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await igPage.waitForTimeout(2000);
      const ogDesc = await igPage.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
      if (ogDesc.includes("isn't available") || ogDesc === '') {
        results.ig = 'NOT FOUND';
      } else {
        const match = ogDesc.match(/([\d,.]+[KkMm]?)\s*Followers/i);
        const followers = match ? match[1] : '?';
        const over10k = match && (followers.includes('K') && parseFloat(followers) >= 10 || followers.includes('M'));
        results.ig = over10k ? `OVER 10K (${followers})` : `${followers}`;
      }
    } catch(e) {
      results.ig = 'ERROR';
    }
    await igPage.close();
    
    // Check website
    if (item.url) {
      const webPage = await browser.newPage();
      try {
        const resp = await webPage.goto(item.url, { timeout: 10000, waitUntil: 'domcontentloaded' });
        await webPage.waitForTimeout(2000);
        const text = await webPage.evaluate(() => document.body?.innerText?.substring(0, 200) || 'empty');
        const emails = await webPage.evaluate(() => {
          const t = document.body?.innerText || '';
          const m = t.match(/[\w.-]+@[\w.-]+\.\w+/g);
          return m ? [...new Set(m)].slice(0, 3) : [];
        });
        const phones = await webPage.evaluate(() => {
          const t = document.body?.innerText || '';
          const m = t.match(/[\d]{10,}/g);
          return m ? [...new Set(m)].slice(0, 2) : [];
        });
        results.url = `LIVE | emails: ${emails.join(', ') || 'none'} | phones: ${phones.join(', ') || 'none'}`;
      } catch(e) {
        results.url = `DEAD (${e.message.substring(0, 40)})`;
      }
      await webPage.close();
    }
    
    console.log(`${results.brand}: IG=${results.ig} | URL=${results.url}`);
  }
  
  await browser.close();
})();