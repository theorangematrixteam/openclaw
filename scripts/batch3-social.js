const { chromium } = require('playwright');

const sites = [
  { brand: 'Lussora', url: 'https://lussorafragrances.com' },
  { brand: 'Sunheri Flame', url: 'https://sunheriflame.com' },
  { brand: 'Windowsill', url: 'https://windowsill.co.in' },
  { brand: 'LitPitara', url: 'https://litpitara.com' },
  { brand: 'Corall', url: 'https://www.corall.in' },
  { brand: 'Sixtyscent', url: 'https://sixtyscent.store' },
  { brand: 'Zaishree', url: 'https://www.zaishree.com' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const site of sites) {
    const page = await browser.newPage();
    try {
      await page.goto(site.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Find Instagram link
      const igLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const ig = links.find(l => l.href?.includes('instagram.com'));
        return ig ? ig.href : 'not found';
      });
      
      // Find all social links
      const socialLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links
          .filter(l => l.href?.includes('instagram.com') || l.href?.includes('facebook.com') || l.href?.includes('linkedin.com') || l.href?.includes('twitter.com'))
          .map(l => l.href);
      });
      
      console.log(`${site.brand}: IG=${igLink} | All social: ${[...new Set(socialLinks)].join(', ')}`);
    } catch(e) {
      console.log(`${site.brand}: ERROR`);
    }
    await page.close();
  }
  
  await browser.close();
})();