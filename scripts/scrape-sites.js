const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  const sites = [
    { brand: 'Dandelion Jewels', url: 'https://dandelionjewels.com' },
    { brand: 'Zephyra', url: 'https://www.zephyra.co.in' },
    { brand: 'Pranikas', url: 'https://pranikas.com' },
    { brand: 'Srijanam', url: 'https://srijanam.com' },
    { brand: 'Aarnora', url: 'https://aarnorajewels.com' },
  ];
  
  for (const site of sites) {
    const page = await browser.newPage();
    try {
      await page.goto(site.url, { timeout: 20000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Get all text content
      const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
      
      // Also check footer specifically
      const footer = await page.evaluate(() => {
        const f = document.querySelector('footer');
        return f ? f.innerText.substring(0, 1000) : 'No footer found';
      });
      
      console.log(`\n=== ${site.brand} (${site.url}) ===`);
      console.log('FOOTER:', footer);
      
      // Look for email/phone patterns in the text
      const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
      const phones = text.match(/\+?[\d\s-]{10,}/g) || [];
      console.log('EMAILS:', [...new Set(emails)].join(', '));
      console.log('PHONES:', [...new Set(phones)].join(', '));
    } catch(e) {
      console.log(`\n=== ${site.brand} === ERROR: ${e.message.substring(0, 80)}`);
    }
    await page.close();
  }
  
  await browser.close();
})();