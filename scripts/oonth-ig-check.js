const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://instagram.com/oonthstudio', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const desc = await page.evaluate(() => {
      const meta = document.querySelector('meta[property="og:description"]');
      return meta ? meta.content : null;
    });
    console.log('Oonth IG:', desc);
  } catch (e) {
    console.log('Error:', e.message.substring(0, 100));
  }
  await browser.close();
})();