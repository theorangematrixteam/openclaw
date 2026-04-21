const { chromium } = require('playwright');

const handles = [
  { brand: 'Lussora', handle: 'lussora_' },
  { brand: 'Windowsill', handle: 'windowsill.store' },
  { brand: 'Sixtyscent', handle: 'sixtyscent.store' },
  { brand: 'Zaishree', handle: 'zaishreestore' },
  { brand: 'LitPitara', handle: 'litpitara' },
  { brand: 'Corall', handle: 'corall.in' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const item of handles) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://www.instagram.com/${item.handle}/`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);
      const ogDesc = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
      if (ogDesc.includes("isn't available") || ogDesc === '') {
        console.log(`${item.brand} (@${item.handle}): NOT FOUND`);
      } else {
        const match = ogDesc.match(/([\d,.]+[KkMm]?)\s*Followers/i);
        console.log(`${item.brand} (@${item.handle}): ${match ? match[1] : '?'} | ${ogDesc.substring(0, 100)}`);
      }
    } catch(e) {
      console.log(`${item.brand} (@${item.handle}): ERROR`);
    }
    await page.close();
  }
  
  await browser.close();
})();