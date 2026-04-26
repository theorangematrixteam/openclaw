const { chromium } = require('playwright');

const candidates = [
  { name: 'Hizbah', handle: 'hizbah.official' },
  { name: 'Vastralay101', handle: 'vastralay101' },
  { name: 'Indkari', handle: 'indkari' },
  { name: 'House of Aagor', handle: 'houseofaagor' },
  { name: 'Ornatique', handle: 'ornatique_jewels' },
  { name: 'Jiaara Jewellery', handle: 'jiaarajewellery' },
  { name: 'Zaishree', handle: 'zaishree_jewellery' },
  { name: 'Zephyra', handle: 'zephyra.co.in' },
  { name: 'AMRAANA', handle: 'amraanastore' },
  { name: 'The Floral Fusion', handle: 'thefloralfusion' },
  { name: 'Tassya Silver', handle: 'tassyasilver' },
  { name: 'DZAYRA', handle: 'dzayra.official' },
  { name: 'Lea Clothing Co', handle: 'leaclothingco' },
  { name: 'House of Jewels', handle: 'houseofjewels.byvinaya' },
  { name: 'Reeva Silver', handle: 'reevasilver.in' },
  { name: 'Zilvera', handle: 'zilvera.shop' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  
  for (const c of candidates) {
    const page = await context.newPage();
    try {
      await page.goto(`https://www.instagram.com/${c.handle}/`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Try og:description meta tag
      let desc = await page.evaluate(() => {
        const meta = document.querySelector('meta[property="og:description"]');
        return meta ? meta.getAttribute('content') : null;
      });
      
      // Also try the title
      let title = await page.evaluate(() => document.title);
      
      if (desc) {
        console.log(`✅ ${c.name} (@${c.handle}): ${desc}`);
      } else if (title && title !== 'Instagram') {
        console.log(`⚠️ ${c.name} (@${c.handle}): No og:description, title="${title}"`);
      } else {
        // Try alternate handles
        console.log(`❓ ${c.name} (@${c.handle}): Could not get follower info. Title="${title}"`);
      }
    } catch (e) {
      console.log(`❌ ${c.name} (@${c.handle}): Error - ${e.message.substring(0, 100)}`);
    }
    await page.close();
  }
  
  await browser.close();
})();