const { chromium } = require('playwright');

const handles = [
  { brand: 'Jovira', handle: 'jovirajewels' },
  { brand: 'Ayona', handle: 'ayonajewels' },
  { brand: 'Ayona', handle: 'ayona.in' },
  { brand: 'Jovira', handle: 'jovira_jewels' },
  { brand: 'Dandelion Jewels', handle: 'dandelionjewels' },
  { brand: 'Bhangi by Nilja', handle: 'bhangibyniljakbaby' },
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
      const match = ogDesc.match(/([\d,.]+[KkMm]?)\s*Followers/i);
      if (match) followers = match[1];
      
      if (ogDesc.includes("isn't available") || ogDesc === '') {
        console.log(`${item.brand} (@${item.handle}): PROFILE NOT FOUND`);
      } else {
        console.log(`${item.brand} (@${item.handle}): ${followers} | ${ogDesc.substring(0, 120)}`);
      }
    } catch(e) {
      console.log(`${item.brand} (@${item.handle}): ERROR`);
    }
    await page.close();
  }
  
  await browser.close();
})();