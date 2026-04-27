const { chromium } = require('playwright');

const handles = [
  'itraa.essence',       // Itraa Essence candles
  'candiluxxe',         // Candiluxxe candles
  'thefloralfusion',    // The Floral Fusion
  'flickerandfusion',   // Flicker & Fusion
  'jenniandjanki',      // Jenni and Janki jewelry
  'qlumsi',             // Qlumsi jewelry
  'antrakshjewellery',  // Antraksh jewelry
  'huesbydrish',        // HuesByDrish jewelry
  'hausofjawhar',       // Haus of Jawhar (re-check)
  'byamouraofficial',   // ByAmoura (re-check)
  'sioral.in',          // Sioral (re-check)
  'hustlehouse_india',  // Hustle House (re-check)
  'srika.luxe',         // Srika Luxe (re-check)
  'cococandle',         // Cococandle (re-check)
  'desiqlo',            // Desiqlo (re-check)
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