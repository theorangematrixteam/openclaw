const { chromium } = require('playwright');

const handles = [
  { brand: 'DEFKIDD', handle: 'defkidd.official' },
  { brand: 'WearDuds', handle: 'wearduds' },
  { brand: 'BITCHN', handle: 'bitchn.official' },
  { brand: 'Lemonaed', handle: 'lemonaed.in' },
  { brand: 'Nishorama', handle: 'nishorama' },
  { brand: 'Blithe Wear', handle: 'blithewear' },
  { brand: 'Indus Clothing Co', handle: 'induscult' },
  { brand: 'Sharmeeli', handle: 'sharmeeli.in' },
  { brand: 'Whynaut', handle: 'whynaut.in' },
  { brand: 'Label Kariya', handle: 'label.kariya' },
  { brand: 'Our Karma Clothing', handle: 'ourkarmaclothing' },
  { brand: 'CHIA', handle: 'labelchia' },
  { brand: 'DUD', handle: 'dudcloset' },
  { brand: 'Swamini', handle: 'theswamini' },
  { brand: 'Zolo Label', handle: 'zololabel' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  for (const item of handles) {
    const page = await browser.newPage();
    try {
      await page.goto(`https://www.instagram.com/${item.handle}/`, { timeout: 20000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Try to get follower count from meta tags or page content
      const metaDesc = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');
      const title = await page.title().catch(() => '');
      const ogDesc = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
      
      // Extract follower count from description
      const descText = ogDesc || metaDesc || title;
      let followers = 'Not found';
      
      // Pattern: "X Followers, Y Following"
      const match = descText.match(/([\d,.]+[KkMm]?)\s*Followers/i) || descText.match(/([\d,.]+[KkMm]?)\s*follower/i);
      if (match) followers = match[1];
      
      results.push({ brand: item.brand, handle: item.handle, followers, desc: descText.substring(0, 200) });
      console.log(`${item.brand} (@${item.handle}): ${followers}`);
    } catch(e) {
      results.push({ brand: item.brand, handle: item.handle, followers: 'Error', error: e.message.substring(0, 100) });
      console.log(`${item.brand} (@${item.handle}): ERROR - ${e.message.substring(0, 80)}`);
    }
    await page.close();
  }
  
  await browser.close();
  console.log('\n--- FULL RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
})();