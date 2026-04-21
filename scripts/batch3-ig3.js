const { chromium } = require('playwright');

const handles = [
  { brand: 'Lussora', handle: 'lussora.fragrances' },
  { brand: 'Lussora v2', handle: 'lussorafragrances' },
  { brand: 'Lussora v3', handle: 'lussora_official' },
  { brand: 'Sunheri Flame', handle: 'sunheriflame' },
  { brand: 'Windowsill', handle: 'windowsill_india' },
  { brand: 'Zaishree', handle: 'zaishree_jewels' },
  { brand: 'Daili', handle: 'daili.skincare' },
  { brand: 'Coluxe', handle: 'coluxe.in' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const item of handles) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://www.instagram.com/${item.handle}/`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      const ogDesc = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
      if (ogDesc.includes("isn't available") || ogDesc === '') {
        console.log(`${item.brand} (@${item.handle}): NOT FOUND`);
      } else {
        const match = ogDesc.match(/([\d,.]+[KkMm]?)\s*Followers/i);
        console.log(`${item.brand} (@${item.handle}): ${match ? match[1] : '?'} followers`);
      }
    } catch(e) {
      console.log(`${item.brand} (@${item.handle}): ERROR`);
    }
    await page.close();
  }
  
  await browser.close();
})();