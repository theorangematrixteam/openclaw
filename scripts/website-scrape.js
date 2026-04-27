const { chromium } = require('playwright');

// Scrape websites for contact info - top 10 candidates
const brands = [
  { name: 'Haus of Jawhar', url: 'https://hausofjawhar.com', ig: 'hausofjawhar', followers: 495, cat: 'Product:Perfume' },
  { name: 'ByAmoura', url: 'https://byamoura.com', ig: 'byamouraofficial', followers: 156, cat: 'Product:Candles' },
  { name: 'Hustle House', url: 'https://hustlehouse.in', ig: 'hustlehouse_india', followers: 292, cat: 'Clothing:Streetwear' },
  { name: 'Sioral', url: 'https://www.sioral.in', ig: 'sioral.in', followers: 4076, cat: 'Jewelry:Handmade' },
  { name: 'Candiluxxe', url: 'https://candiluxxe.com', ig: 'candiluxxe', followers: 99, cat: 'Product:Candles' },
  { name: 'Flicker and Fusion', url: 'https://www.flickerandfusion.com', ig: 'flickerandfusion', followers: 925, cat: 'Product:Candles' },
  { name: 'HuesByDrish', url: 'https://www.huesbydrish.com', ig: 'huesbydrish', followers: 1539, cat: 'Jewelry:Handmade' },
  { name: 'The Floral Fusion', url: 'https://thefloralfusion.com', ig: 'thefloralfusion', followers: 0, cat: 'Product:Candles' },
  { name: 'Itrāa Essence', url: 'https://itraaessence.com', ig: 'itraa.essence', followers: 0, cat: 'Product:Candles' },
  { name: 'Desiqlo', url: 'https://desiqlo.com', ig: 'desiqlo', followers: 1598, cat: 'Clothing:Ethnic' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  for (const b of brands) {
    const page = await browser.newPage();
    try {
      await page.goto(b.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Extract all text from page
      const pageText = await page.evaluate(() => document.body.innerText);
      
      // Look for email patterns
      const emailMatches = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const uniqueEmails = [...new Set(emailMatches)];
      
      // Look for phone patterns (Indian)
      const phoneMatches = pageText.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}/g) || [];
      const uniquePhones = [...new Set(phoneMatches)];
      
      // Look for WhatsApp
      const whatsappMatches = pageText.match(/whatsapp[:\s]+(\d+)/gi) || [];
      
      // Try to find contact page
      const contactLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="contact"], a[href*="about"], a[href*="privacy"]'));
        return links.map(l => ({ text: l.innerText.trim(), href: l.href }));
      });
      
      results.push({
        name: b.name,
        url: b.url,
        emails: uniqueEmails,
        phones: uniquePhones,
        whatsapp: whatsappMatches,
        contactLinks: contactLinks.slice(0, 5),
        title: await page.title(),
      });
      
      console.log(`\n=== ${b.name} ===`);
      console.log(`Title: ${await page.title()}`);
      console.log(`Emails: ${uniqueEmails.join(', ') || 'NONE'}`);
      console.log(`Phones: ${uniquePhones.join(', ') || 'NONE'}`);
      console.log(`Contact links: ${contactLinks.slice(0,3).map(c => c.href).join(', ')}`);
    } catch (e) {
      results.push({ name: b.name, error: e.message.substring(0, 100) });
      console.log(`\n=== ${b.name} === ERROR: ${e.message.substring(0, 100)}`);
    }
    await page.close();
  }
  
  await browser.close();
  
  // Save results
  const fs = require('fs');
  fs.writeFileSync('C:/Users/openclaw.BILLION-DOLLAR-/.openclaw/workspace/scripts/website-scrape-results.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to website-scrape-results.json');
})();