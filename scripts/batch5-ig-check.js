const { chromium } = require('playwright');

const brands = [
  { name: 'DEFKIDD', ig: 'defkidd.in', category: 'Clothing:Streetwear' },
  { name: 'Mynaah', ig: 'mynaah.in', category: 'Clothing:Ethnic' },
  { name: 'Jovira', ig: 'jovira.jewels', category: 'Jewelry:Silver' },
  { name: 'Silvra', ig: 'silvra.in', category: 'Jewelry:Silver' },
  { name: 'Reeva Silver', ig: 'reevasilver.in', category: 'Jewelry:Silver' },
  { name: 'Sixtyscent', ig: 'sixtyscent.store', category: 'Product:Candles' },
  { name: 'Alkimi Living', ig: 'alkimi.in', category: 'Product:Candles' },
  { name: 'Amoura', ig: 'myamoura.in', category: 'Product:Home Fragrance' },
  { name: 'FIFTH SENSE', ig: 'fifthsense.in', category: 'Product:Perfume' },
  { name: 'Velaqi', ig: 'velaqi', category: 'Product:Home Decor' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
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