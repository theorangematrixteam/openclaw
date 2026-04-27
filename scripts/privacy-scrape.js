const { chromium } = require('playwright');

// Scrape privacy policy and footer for contact info
const brands = [
  { name: 'HuesByDrish', url: 'https://www.huesbydrish.com/policies/privacy-policy', ig: 'huesbydrish' },
  { name: 'The Floral Fusion', url: 'https://www.thefloralfusion.com/', ig: 'thefloralfusion' },
  { name: 'Itrāa Essence', url: 'https://itraaessence.com/policies/privacy-policy', ig: 'itraa.essence' },
  { name: 'ByAmoura', url: 'https://byamoura.com', ig: 'byamouraofficial' },
  { name: 'Flicker and Fusion', url: 'https://www.flickerandfusion.com', ig: 'flickerandfusion' },
  { name: 'Haus of Jawhar', url: 'https://hausofjawhar.com/pages/contact', ig: 'hausofjawhar' },
  { name: 'Sioral', url: 'https://www.sioral.in', ig: 'sioral.in' },
  { name: 'Desiqlo', url: 'https://desiqlo.com/pages/contact', ig: 'desiqlo' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const b of brands) {
    const page = await browser.newPage();
    try {
      await page.goto(b.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const pageText = await page.evaluate(() => document.body.innerText);
      
      const emailMatches = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const uniqueEmails = [...new Set(emailMatches)].filter(e => !e.includes('example.com') && !e.includes('gmail.com'));
      const allEmails = [...new Set(emailMatches)];
      
      const phoneMatches = pageText.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}/g) || [];
      const uniquePhones = [...new Set(phoneMatches)];
      
      // Extract founder name from about/privacy
      const founderMatch = pageText.match(/(?:founder|started by|created by|owner|director)[\s:]*([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
      
      console.log(`\n=== ${b.name} ===`);
      console.log(`All emails: ${allEmails.join(', ') || 'NONE'}`);
      console.log(`Filtered emails: ${uniqueEmails.join(', ') || 'NONE'}`);
      console.log(`Phones: ${uniquePhones.join(', ') || 'NONE'}`);
      if (founderMatch) console.log(`Founder: ${founderMatch[1]}`);
    } catch (e) {
      console.log(`\n=== ${b.name} === ERROR: ${e.message.substring(0, 100)}`);
    }
    await page.close();
  }
  
  await browser.close();
})();