const { chromium } = require('playwright');

const handles = [
  { brand: 'Zaishree', handle: 'zaishreejewellery' },
  { brand: 'Dolache', handle: 'dolache.official' },
  { brand: 'Dandelion Jewels', handle: 'dandelionjewels' },
  { brand: 'Aarnora', handle: 'aarnorajewels' },
  { brand: 'Sushmita Todi Jewelry', handle: 'zaishree_jewellery' },
  { brand: 'Rubans', handle: 'rubans_accessories' },
  { brand: 'Zephyra', handle: 'zephyra.co.in' },
  { brand: 'Silvooshine', handle: 'silvooshine' },
  { brand: 'DUD', handle: 'dudcloset' },
  { brand: 'HOOR Naturals', handle: 'hoornaturals' },
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
      const available = !ogDesc.includes("isn't available") && !ogDesc.includes("isn't available");
      const match = ogDesc.match(/([\d,.]+[KkMm]?)\s*Followers/i);
      if (match) followers = match[1];
      
      if (ogDesc.includes("isn't available") || ogDesc === '') {
        console.log(`${item.brand} (@${item.handle}): PROFILE NOT FOUND`);
      } else {
        console.log(`${item.brand} (@${item.handle}): ${followers} followers | ${ogDesc.substring(0, 120)}`);
      }
    } catch(e) {
      console.log(`${item.brand} (@${item.handle}): ERROR - ${e.message.substring(0, 60)}`);
    }
    await page.close();
  }
  
  await browser.close();
})();