const { chromium } = require('playwright');

// Scrape contact pages for missing info
const brands = [
  { name: 'Hustle House', contactUrl: 'https://hustlehouse.in/pages/contact-us', aboutUrl: 'https://hustlehouse.in/pages/about-us' },
  { name: 'Candiluxxe', contactUrl: 'https://candiluxxe.com/contact/', aboutUrl: 'https://candiluxxe.com/about-us/' },
  { name: 'HuesByDrish', contactUrl: 'https://www.huesbydrish.com/pages/contact', aboutUrl: 'https://www.huesbydrish.com/pages/about-us' },
  { name: 'The Floral Fusion', contactUrl: 'https://www.thefloralfusion.com/contact/', aboutUrl: 'https://www.thefloralfusion.com/' },
  { name: 'Itrāa Essence', contactUrl: 'https://itraaessence.com/pages/contact', aboutUrl: 'https://itraaessence.com/' },
  { name: 'ByAmoura', contactUrl: 'https://byamoura.com', aboutUrl: 'https://byamoura.com' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const b of brands) {
    for (const urlType of ['contactUrl', 'aboutUrl']) {
      const url = b[urlType];
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const pageText = await page.evaluate(() => document.body.innerText);
        
        const emailMatches = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        const uniqueEmails = [...new Set(emailMatches)];
        
        const phoneMatches = pageText.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}/g) || [];
        const uniquePhones = [...new Set(phoneMatches)];
        
        console.log(`\n=== ${b.name} [${urlType}] ===`);
        console.log(`URL: ${url}`);
        console.log(`Emails: ${uniqueEmails.join(', ') || 'NONE'}`);
        console.log(`Phones: ${uniquePhones.join(', ') || 'NONE'}`);
        console.log(`Title: ${await page.title()}`);
        
        // Also extract founder info if on about page
        if (urlType === 'aboutUrl') {
          const founderMatch = pageText.match(/(?:founder|started by|created by|established by)[\s\w]+/i);
          if (founderMatch) console.log(`Founder hint: ${founderMatch[0]}`);
        }
      } catch (e) {
        console.log(`\n=== ${b.name} [${urlType}] === ERROR: ${e.message.substring(0, 100)}`);
      }
      await page.close();
    }
  }
  
  await browser.close();
})();