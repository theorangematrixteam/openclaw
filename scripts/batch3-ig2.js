const { chromium } = require('playwright');

const handles = [
  { brand: 'Jewelry by Kiara', handle: 'jewelrybykiara' },
  { brand: 'Jewelry by Kiara v2', handle: 'kiara_jewelry' },
  { brand: 'Zaishree', handle: 'zaishree.official' },
  { brand: 'Zaishree v2', handle: 'zaishreejewellery' },
  { brand: 'Sunheri Flame', handle: 'sunheri_flame' },
  { brand: 'Sunheri Flame v2', handle: 'sunheriflame' },
  { brand: 'Windowsill', handle: 'windowsillcandles' },
  { brand: 'Windowsill v2', handle: 'windowsill.india' },
  { brand: 'Achisy', handle: 'achisy.official' },
  { brand: 'Achisy v2', handle: 'achisy_skincare' },
  { brand: 'Lavanta', handle: 'lavanta.naturals' },
  { brand: 'Coluxe', handle: 'coluxe.jewellery' },
  { brand: 'Coluxe v2', handle: 'coluxejewelry' },
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
        const followers = match ? match[1] : '?';
        console.log(`${item.brand} (@${item.handle}): ${followers} followers`);
      }
    } catch(e) {
      console.log(`${item.brand} (@${item.handle}): ERROR`);
    }
    await page.close();
  }
  
  await browser.close();
})();