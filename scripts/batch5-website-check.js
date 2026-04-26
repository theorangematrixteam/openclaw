const { chromium } = require('playwright');

const brands = [
  { name: 'DEFKIDD', ig: 'defkidd.in', url: 'https://defkidd.in', category: 'Clothing:Streetwear' },
  { name: 'Mynaah', ig: 'mynaah.in', category: 'Clothing:Ethnic' },
  { name: 'Jovira', ig: 'jovira.jewels', url: 'https://jovira.in', category: 'Jewelry:Silver' },
  { name: 'Silvra', ig: 'silvra.in', url: 'https://silvra.in', category: 'Jewelry:Silver' },
  { name: 'Reeva Silver', ig: 'reevasilver.in', url: 'https://reevasilver.in', category: 'Jewelry:Silver' },
  { name: 'Sixtyscent', ig: 'sixtyscent.store', url: 'https://sixtyscent.store', category: 'Product:Candles' },
  { name: 'Alkimi Living', ig: 'alkimi.in', url: 'https://alkimi.in', category: 'Product:Candles' },
  { name: 'Amoura', ig: 'myamoura.in', url: 'https://myamoura.in', category: 'Product:Home Fragrance' },
  { name: 'FIFTH SENSE', ig: 'fifthsense.in', category: 'Product:Perfume' },
  { name: 'Velaqi', ig: 'velaqi', category: 'Product:Home Decor' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  for (const brand of brands) {
    if (brand.url) {
      try {
        await page.goto(brand.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        
        // Look for Instagram link on page
        const pageContent = await page.content();
        const igMatch = pageContent.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
        if (igMatch) {
          console.log(`${brand.name}: Website shows IG @${igMatch[1]}`);
        } else {
          // Check for contact info
          const bodyText = await page.evaluate(() => document.body.innerText);
          const emailMatch = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const phoneMatch = bodyText.match(/\+?91[\s-]?\d{10}/);
          console.log(`${brand.name}: Email: ${emailMatch ? emailMatch[0] : 'none'}, Phone: ${phoneMatch ? phoneMatch[0] : 'none'}`);
        }
      } catch(e) {
        console.log(`${brand.name}: Website error - ${e.message.substring(0, 80)}`);
      }
    }
  }

  await browser.close();
})();