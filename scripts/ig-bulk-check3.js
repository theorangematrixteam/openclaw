const { chromium } = require('playwright');

const handles = [
  'zica.bella',         // Zica Bella alt
  'luminaura.candles',  // Luminaura
  'luminaura_candles',  // Luminaura alt
  'luminaura.in',       // Luminaura alt 2
  'hustlehouse_india',  // Hustle House
  'solairebyzero',      // Solaire by Zero
  'selinta.jewellery',  // SELINTA
  'selintajewelry',     // SELINTA alt
  'sioral.in',          // Sioral
  'sioral_jewellery',   // Sioral alt
  'silverfied.in',      // Silverfied
  'silverfied_',        // Silverfied alt
  'alcorandmizar',      // Alcor & Mizar
  'houseofaura.candles',// House of Aura
  'houseofauracandles', // House of Aura alt
  'vritika.houseofaura',// House of Aura alt 2
  'desiqlo.official',   // Desiqlo alt
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