const { chromium } = require('playwright');
const fs = require('fs');

// Leads that need email discovery
const leads = [
  { row: 7, company: 'Aarnora', website: 'https://sgblgroup.com', ig: 'aarnorajewels' },
  { row: 10, company: 'Dandelion Jewels', website: '', ig: 'dandelionjewels' },
  { row: 16, company: 'Corall', website: 'https://www.corall.in', ig: 'corall.in' },
  { row: 18, company: 'Zalkari', website: 'https://zalkari.com', ig: '_zalkari_' },
  { row: 19, company: 'Anvera', website: 'https://www.anvera.international', ig: 'anvera.international' },
  { row: 23, company: 'Suramyah', website: 'https://www.suramyah.in', ig: 'suramyah.in' },
  { row: 25, company: 'Véora', website: 'https://itsveora.com', ig: 'evoraindia' },
  { row: 26, company: 'KanakRiti', website: 'https://kanakriti.com', ig: '' },
  { row: 27, company: 'Hizbah', website: 'https://hizbah.com', ig: 'hizbah.co' },
  { row: 28, company: 'House of Aagor', website: 'https://houseofaagor.com', ig: 'houseofaagor' },
  { row: 29, company: 'Vastralay101', website: 'https://vastralay101.com', ig: 'vastralay101' },
  { row: 30, company: 'Ornatique', website: 'https://ornatique.in', ig: 'ornatiquejewels' },
  { row: 31, company: 'The Floral Fusion', website: 'https://thefloralfusion.in', ig: 'thefloralfusion.official' },
  { row: 34, company: 'AMRAANA', website: 'https://amraana.com', ig: '' },
  { row: 36, company: 'Maison Avenoir', website: 'https://maisonavenoir.com', ig: 'maisonavenoir' },
  { row: 38, company: 'XyverLuxera', website: 'https://xyverluxera.com', ig: 'xyverluxera' },
  { row: 42, company: 'Sterling Sutra', website: 'https://silversutra.in', ig: 'silversutra.in' },
  { row: 45, company: 'Suramya By Saumya', website: 'https://suramyabysaumya.com', ig: 'suramyabysaumya' },
  { row: 46, company: 'WearDuds', website: 'https://wearduds.com', ig: 'wearduds' },
  { row: 61, company: 'Krimilo', website: 'http://www.krimilo.com', ig: 'krimilo' },
  { row: 62, company: 'Suramyah', website: 'https://www.suramyah.in', ig: 'suramyah.in' },
  { row: 63, company: 'ZEPHYRA', website: 'https://www.zephyra.co.in', ig: 'zephyra.co.in' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  const foundEmails = [];
  
  for (const lead of leads) {
    if (!lead.website) {
      console.log(`${lead.company}: No website to check`);
      continue;
    }
    
    try {
      console.log(`Checking ${lead.company}...`);
      await page.goto(lead.website, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Get page content
      const bodyText = await page.evaluate(() => document.body.innerText);
      
      // Search for email patterns
      const emailMatches = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      
      // Filter out common false positives
      const validEmails = emailMatches ? emailMatches.filter(e => 
        !e.includes('example') && 
        !e.includes('test@') && 
        !e.includes('admin@') &&
        !e.includes('info@') === false && // keep info@
        !e.includes('support@') === false && // keep support@
        !e.includes('gmail.com') === false && // keep gmail
        !e.includes('sentry') &&
        !e.includes('wixpress') &&
        !e.includes('mailgun') &&
        !e.includes('sendgrid') &&
        !e.includes('google.com') &&
        !e.includes('facebook.com') &&
        !e.includes('instagram.com') &&
        !e.includes('shopify.com') &&
        e.includes('.')
      ) : [];
      
      // Remove duplicates
      const uniqueEmails = [...new Set(validEmails)];
      
      if (uniqueEmails.length > 0) {
        console.log(`  ✅ Found: ${uniqueEmails.join(', ')}`);
        foundEmails.push({ row: lead.row, company: lead.company, emails: uniqueEmails });
      } else {
        console.log(`  ❌ No email found`);
      }
    } catch(e) {
      console.log(`  ❌ Error: ${e.message.substring(0, 80)}`);
    }
  }
  
  await browser.close();
  
  console.log('\n=== Summary ===');
  console.log(`Found emails for ${foundEmails.length}/${leads.length} leads`);
  for (const item of foundEmails) {
    console.log(`Row ${item.row}: ${item.company} - ${item.emails.join(', ')}`);
  }
  
  // Save results
  fs.writeFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\found-emails.json', JSON.stringify(foundEmails, null, 2));
})();
