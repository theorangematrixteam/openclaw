const { chromium } = require('playwright');

const handles = [
  'zicabella.in',       // Zica Bella streetwear
  'lunalantern.in',     // Luna Lantern candles
  'hausofjawhar',       // Haus of Jawhar perfume
  'taraiq.perfumes',    // Taraiq perfume
  'myamoura.in',        // Amoura candles
  'byamouraofficial',   // ByAmoura candles
  'desiqlo',            // Desiqlo ethnic wear
  'jiaarajewellery',    // Jiaara Jewellery
  'hizbah.co',          // already in sheet
  'krimilo',            // already in sheet
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  for (const handle of handles) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://instagram.com/${handle}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      // Try og:description meta tag
      const desc = await page.evaluate(() => {
        const meta = document.querySelector('meta[property="og:description"]');
        return meta ? meta.content : null;
      });
      results.push({ handle, desc });
      console.log(`${handle}: ${desc || 'NO META'}`);
    } catch (e) {
      results.push({ handle, error: e.message.substring(0, 100) });
      console.log(`${handle}: ERROR - ${e.message.substring(0, 100)}`);
    }
    await page.close();
  }
  
  await browser.close();
  console.log('\n--- RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
})();