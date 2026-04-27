const { chromium } = require('playwright');
const fs = require('fs');

// Check Instagram bios for email/contact info
const leads = [
  { row: 7, company: 'Aarnora', ig: 'aarnorajewels' },
  { row: 10, company: 'Dandelion Jewels', ig: 'dandelionjewels' },
  { row: 16, company: 'Corall', ig: 'corall.in' },
  { row: 18, company: 'Zalkari', ig: '_zalkari_' },
  { row: 19, company: 'Anvera', ig: 'anvera.international' },
  { row: 23, company: 'Suramyah', ig: 'suramyah.in' },
  { row: 25, company: 'Véora', ig: 'evoraindia' },
  { row: 26, company: 'KanakRiti', ig: '' },
  { row: 27, company: 'Hizbah', ig: 'hizbah.co' },
  { row: 28, company: 'House of Aagor', ig: 'houseofaagor' },
  { row: 29, company: 'Vastralay101', ig: 'vastralay101' },
  { row: 30, company: 'Ornatique', ig: 'ornatiquejewels' },
  { row: 31, company: 'The Floral Fusion', ig: 'thefloralfusion.official' },
  { row: 34, company: 'AMRAANA', ig: '' },
  { row: 36, company: 'Maison Avenoir', ig: 'maisonavenoir' },
  { row: 38, company: 'XyverLuxera', ig: 'xyverluxera' },
  { row: 42, company: 'Sterling Sutra', ig: 'silversutra.in' },
  { row: 45, company: 'Suramya By Saumya', ig: 'suramyabysaumya' },
  { row: 46, company: 'WearDuds', ig: 'wearduds' },
  { row: 61, company: 'Krimilo', ig: 'krimilo' },
  { row: 62, company: 'Suramyah', ig: 'suramyah.in' },
  { row: 63, company: 'ZEPHYRA', ig: 'zephyra.co.in' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  const results = [];
  
  for (const lead of leads) {
    if (!lead.ig) {
      console.log(`${lead.company}: No IG handle`);
      continue;
    }
    
    try {
      console.log(`Checking @${lead.ig}...`);
      await page.goto(`https://www.instagram.com/${lead.ig}/`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Get bio from meta description
      const meta = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
      
      // Check for email in bio
      const emailMatch = meta.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      
      // Check for WhatsApp link
      const waMatch = meta.match(/(https:\/\/wa\.me\/\d+|https:\/\/api\.whatsapp\.com\/send\?phone=\d+)/);
      
      // Check for website link
      const websiteMatch = meta.match(/(https?:\/\/[\w.-]+)/);
      
      if (emailMatch) {
        console.log(`  ✅ Email: ${emailMatch[1]}`);
        results.push({ row: lead.row, company: lead.company, email: emailMatch[1], source: 'IG bio' });
      } else if (waMatch) {
        console.log(`  📱 WhatsApp: ${waMatch[1]}`);
        results.push({ row: lead.row, company: lead.company, whatsapp: waMatch[1], source: 'IG bio' });
      } else if (websiteMatch) {
        console.log(`  🔗 Website: ${websiteMatch[1]}`);
        results.push({ row: lead.row, company: lead.company, website: websiteMatch[1], source: 'IG bio' });
      } else {
        console.log(`  ❌ No contact info in bio`);
      }
    } catch(e) {
      console.log(`  ❌ Error: ${e.message.substring(0, 80)}`);
    }
  }
  
  await browser.close();
  
  console.log('\n=== Summary ===');
  console.log(`Found contact for ${results.length}/${leads.length} leads`);
  for (const item of results) {
    console.log(`Row ${item.row}: ${item.company} - ${item.email || item.whatsapp || item.website} (${item.source})`);
  }
  
  fs.writeFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-contact-info.json', JSON.stringify(results, null, 2));
})();
