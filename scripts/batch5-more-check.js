const { chromium } = require('playwright');

const brands = [
  { name: 'Krimilo', ig: 'krimilo', url: 'http://www.krimilo.com', category: 'Clothing:Ethnic' },
  { name: 'Suramyah', ig: 'suramyah.in', url: 'https://www.suramyah.in', category: 'Jewelry:Silver' },
  { name: 'ZEPHYRA', ig: 'zephyra.co.in', url: 'https://www.zephyra.co.in', category: 'Jewelry:Silver' },
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