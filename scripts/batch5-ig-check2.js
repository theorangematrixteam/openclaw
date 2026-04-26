const { chromium } = require('playwright');

const brands = [
  { name: 'DEFKIDD', ig: 'defkidd_' },
  { name: 'Mynaah', ig: 'mynaah.in' },
  { name: 'Jovira', ig: 'jovira.jewels' },
  { name: 'Silvra', ig: 'shopsilvra' },
  { name: 'Reeva Silver', ig: 'reevasilver.in' },
  { name: 'Sixtyscent', ig: 'sixtyscent.store' },
  { name: 'Alkimi Living', ig: 'alkimi.in' },
  { name: 'Amoura', ig: 'myamoura.in' },
  { name: 'FIFTH SENSE', ig: 'fifthsense.in' },
  { name: 'Velaqi', ig: 'velaqi' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  for (const brand of brands) {
    try {
      await page.goto(`https://www.instagram.com/${brand.ig}/`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const meta = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
      const followerMatch = meta.match(/([\d,]+(?:\.\d+)?[KMB]?)\s+followers?/i);
      const followerCount = followerMatch ? followerMatch[1] : 'Unknown';
      
      console.log(`${brand.name} (@${brand.ig}): ${followerCount} followers`);
    } catch(e) {
      console.log(`${brand.name} (@${brand.ig}): ERROR - ${e.message.substring(0, 80)}`);
    }
  }

  await browser.close();
})();