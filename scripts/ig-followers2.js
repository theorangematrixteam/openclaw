const { chromium } = require('playwright');

const handles = [
  { brand: 'Zaishree', handle: 'zaishreejewelry' },
  { brand: 'Silvooshine', handle: 'silvooshine' },
  { brand: 'Zephyra', handle: 'zephyra.co.in' },
  { brand: 'Dolache', handle: 'dolache.skin' },
  { brand: 'HOOR Naturals', handle: 'hoornaturals' },
  { brand: 'Velaqi', handle: 'velaqi' },
  { brand: 'DUD', handle: 'dudcloset' },
  { brand: 'Label CHIA', handle: 'chia.label' },
  { brand: 'Aarnora', handle: 'aarnorajewels' },
  { brand: 'The Sass Bar', handle: 'thesassbar' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const item of handles) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://www.instagram.com/${item.handle}/`, { timeout: 20000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const ogDesc = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
      let followers = 'Not found';
      const match = ogDesc.match(/([\d,.]+[KkMm]?)\s*Followers/i) || ogDesc.match(/([\d,.]+[KkMm]?)\s*follower/i);
      if (match) followers = match[1];
      
      const available = !ogDesc.includes("isn't available");
      console.log(`${item.brand} (@${item.handle}): ${available ? followers : 'PROFILE NOT FOUND'} | ${ogDesc.substring(0, 100)}`);
    } catch(e) {
      console.log(`${item.brand} (@${item.handle}): ERROR - ${e.message.substring(0, 60)}`);
    }
    await page.close();
  }
  
  await browser.close();
})();