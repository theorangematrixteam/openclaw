const { chromium } = require('playwright');

const brands = [
  // Check IG + website for new candidates
  { name: 'With Love By Neelam', ig: 'withlovebyneelam', url: 'https://withlovebyneelam.co.in', cat: 'Jewelry:Handmade' },
  { name: 'Oonth', ig: 'oonth.in', url: 'https://www.oonth.in', cat: 'Jewelry:Handmade' },
  { name: 'Aanagha', ig: 'aanagha.co', url: 'https://aanagha.co', cat: 'Jewelry:Handmade' },
  { name: 'Lolo Creation', ig: 'lolocreation', url: 'https://lolocreation.com', cat: 'Jewelry:Handmade' },
  { name: 'Twaynez Jhumka', ig: 'twaynezjhumka', url: 'https://twaynezjhumka.com', cat: 'Jewelry:Handmade' },
  { name: 'Aroha By Aditi', ig: 'arohabyaditi', url: 'https://arohabyaditi.in', cat: 'Product:Candles' },
  { name: 'The Ved Aura', ig: 'thevedaura', url: 'https://thevedaura.com', cat: 'Product:Candles' },
  { name: 'Flamin Candles', ig: 'flamincandles', url: 'https://flamincandles.com', cat: 'Product:Candles' },
  { name: 'Dream Lite', ig: 'dreamlite.candles', url: 'https://dream-lite.com', cat: 'Product:Candles' },
  { name: 'Flicker and Fusion', ig: 'flickerandfusion', url: 'https://www.flickerandfusion.com', cat: 'Product:Candles' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  for (const b of brands) {
    const result = { name: b.name, ig: b.ig, url: b.url, cat: b.cat };
    
    // Check IG
    const igPage = await browser.newPage();
    try {
      await igPage.goto(`https://instagram.com/${b.ig}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const desc = await igPage.evaluate(() => {
        const meta = document.querySelector('meta[property="og:description"]');
        return meta ? meta.content : null;
      });
      result.igDesc = desc;
      console.log(`${b.name} IG: ${desc || 'NO META'}`);
    } catch (e) {
      result.igError = e.message.substring(0, 50);
      console.log(`${b.name} IG: ERROR`);
    }
    await igPage.close();
    
    // Check website
    const webPage = await browser.newPage();
    try {
      await webPage.goto(b.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const pageText = await webPage.evaluate(() => document.body.innerText);
      
      const emailMatches = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      result.emails = [...new Set(emailMatches)].filter(e => !e.includes('example.com'));
      
      const phoneMatches = pageText.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}/g) || [];
      result.phones = [...new Set(phoneMatches)];
      
      console.log(`  Website emails: ${result.emails.join(', ') || 'NONE'}`);
      console.log(`  Website phones: ${result.phones.join(', ') || 'NONE'}`);
    } catch (e) {
      result.webError = e.message.substring(0, 50);
      console.log(`  Website: ERROR`);
    }
    await webPage.close();
    
    results.push(result);
  }
  
  await browser.close();
  
  const fs = require('fs');
  fs.writeFileSync('C:/Users/openclaw.BILLION-DOLLAR-/.openclaw/workspace/scripts/candidates-results.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to candidates-results.json');
})();