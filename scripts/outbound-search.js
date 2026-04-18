const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  const brands = [
    { name: 'ONYA', query: 'ONYA jewelry India founder LinkedIn Instagram website' },
    { name: 'Lucira Jewelry', query: 'Lucira Jewelry India founder LinkedIn website Instagram' },
    { name: 'Coluxe', query: 'Coluxe jewellery India founder LinkedIn Instagram website' },
    { name: 'Sharmeeli', query: 'Sharmeeli ethnic wear India founder LinkedIn Instagram website' },
    { name: 'BLUORNG', query: 'BLUORNG streetwear India founder LinkedIn Instagram website' },
    { name: 'Karma Clothing', query: 'Karma Clothing shopkarma India founder LinkedIn Instagram' },
    { name: 'Loomkins', query: 'Loomkins kidswear India founder LinkedIn Instagram website' },
    { name: 'Laani', query: 'Laani personal care India founder LinkedIn Instagram website' },
    { name: 'Eternz', query: 'Eternz jewelry marketplace India founder LinkedIn website' },
    { name: 'Snitch', query: 'Snitch fashion India founder LinkedIn Instagram website' }
  ];

  for (const brand of brands) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(brand.query)}`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const links = await page.$$eval('a', anchors => 
        anchors.map(a => ({ href: a.href, text: a.textContent.trim() }))
          .filter(a => a.href.includes('http') && !a.href.includes('google.com') && a.text.length > 0)
          .slice(0, 10)
      );
      
      results.push({ brand: brand.name, links });
    } catch(e) {
      results.push({ brand: brand.name, error: e.message });
    }
    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();