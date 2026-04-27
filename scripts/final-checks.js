const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Check Oonth website for IG link
  const oonthPage = await browser.newPage();
  try {
    await oonthPage.goto('https://www.oonth.in', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const links = await oonthPage.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="instagram"]')).map(a => a.href);
    });
    console.log('Oonth IG links:', links);
  } catch (e) {
    console.log('Oonth website error:', e.message.substring(0, 100));
  }
  await oonthPage.close();
  
  // Check Flicker and Fusion with longer timeout
  const flickerPage = await browser.newPage();
  try {
    await flickerPage.goto('https://www.flickerandfusion.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const pageText = await flickerPage.evaluate(() => document.body.innerText);
    const emails = [...new Set(pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])];
    const phones = [...new Set(pageText.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}/g) || [])];
    console.log('Flicker emails:', emails);
    console.log('Flicker phones:', phones);
  } catch (e) {
    console.log('Flicker error:', e.message.substring(0, 100));
  }
  await flickerPage.close();
  
  // Check Aroha By Aditi website
  const arohaPage = await browser.newPage();
  try {
    await arohaPage.goto('https://arohabyaditi.in', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const pageText = await arohaPage.evaluate(() => document.body.innerText);
    const emails = [...new Set(pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])];
    const phones = [...new Set(pageText.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}/g) || [])];
    console.log('Aroha emails:', emails);
    console.log('Aroha phones:', phones);
  } catch (e) {
    console.log('Aroha error:', e.message.substring(0, 100));
  }
  await arohaPage.close();
  
  // Check more Oonth IG handles
  const oonthHandles = ['oonthjewels', 'oonth_jewelry', 'oonth_india', 'weareoonth'];
  for (const h of oonthHandles) {
    const p = await browser.newPage();
    try {
      await p.goto(`https://instagram.com/${h}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const desc = await p.evaluate(() => {
        const meta = document.querySelector('meta[property="og:description"]');
        return meta ? meta.content : null;
      });
      console.log(`Oonth ${h}: ${desc || 'NO META'}`);
    } catch (e) {
      console.log(`Oonth ${h}: ERROR`);
    }
    await p.close();
  }
  
  await browser.close();
})();