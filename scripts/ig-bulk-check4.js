const { chromium } = require('playwright');

const handles = [
  'hausofjawhar',       // Haus of Jawhar (already confirmed: 495) - verify website contact
  'hustlehouse_india',  // Hustle House (already confirmed: 292) - verify website contact
  'byamouraofficial',   // ByAmoura (already confirmed: 156) - verify website contact
  'sioral.in',          // Sioral (already confirmed: 4,076) - verify website contact
  'alcorandmizar',      // Alcor & Mizar (8 followers - verify if real brand)
  'cococandle',         // Cococandle (301 followers)
  'srika.luxe',         // Srika Luxe (0 followers)
  'theindiancandleco',  // The Indian Candle Co (41 followers)
  'houseofaura.candles',// House of Aura candles
  'luminaura.candles',  // Luminaura
  'luminaura.in',       // Luminaura alt
  'houseofauracandles', // House of Aura alt
  'vritika.houseofaura',// House of Aura alt 2
  'desiqlo.official',   // Desiqlo alt
  'myamoura.in',        // Amoura Original
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  for (const handle of handles) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://instagram.com/${handle}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
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
