const { chromium } = require('playwright');

const brands = [
  { name: 'Bakwaas Wears', ig: 'bakwaaswears', url: 'https://www.bakwaaswears.com', category: 'Clothing:Streetwear' },
  { name: 'Grayace', ig: 'grayace.in', url: 'https://grayace.in', category: 'Clothing:Streetwear' },
  { name: 'Luna Lantern', ig: 'lunalantern.com', url: 'https://lunalantern.com', category: 'Product:Candles' },
  { name: 'Alcor & Mizar', ig: 'alcorandmizar', category: 'Product:Candles' },
  { name: 'Essence & Elixir', ig: 'essenceandelixir', category: 'Product:Candles' },
  { name: 'House of Chikankari', ig: 'houseofchikankari.in', category: 'Clothing:Ethnic' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  for (const brand of brands) {
    try {
      // Check Instagram
      await page.goto(`https://www.instagram.com/${brand.ig}/`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const meta = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
      const followerMatch = meta.match(/([\d,]+(?:\.\d+)?[KMB]?)\s+followers?/i);
      const followerCount = followerMatch ? followerMatch[1] : 'Unknown';
      
      let contactInfo = '';
      
      // Check website for email/phone
      if (brand.url) {
        try {
          await page.goto(brand.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(3000);
          const bodyText = await page.evaluate(() => document.body.innerText);
          const emailMatch = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const phoneMatch = bodyText.match(/\+?91[\s-]?\d{10}/);
          contactInfo = `Email: ${emailMatch ? emailMatch[0] : 'none'}, Phone: ${phoneMatch ? phoneMatch[0] : 'none'}`;
        } catch(e) {}
      }
      
      console.log(`${brand.name} (@${brand.ig}): ${followerCount} followers | ${contactInfo}`);
    } catch(e) {
      console.log(`${brand.name} (@${brand.ig}): ERROR - ${e.message.substring(0, 80)}`);
    }
  }

  await browser.close();
})();