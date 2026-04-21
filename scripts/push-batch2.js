const { execFileSync } = require('child_process');
const path = require('path');

const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';
const tab = 'Outbound';

const brands = [
  {
    category: 'Jewelry',
    company: 'Aarnora',
    industry: 'Silver Jewellery (92.5 Fine Silver)',
    firstName: 'Saahil',
    lastName: 'Guptaa',
    title: 'Founder',
    email: 'TBD — no website/email found yet; brand just launched showroom Apr 2026',
    phone: 'TBD — no phone found; showroom on Sarojini Devi Rd, Secunderabad',
    linkedin: 'TBD — SGBL Group LinkedIn: https://in.linkedin.com/company/sgblgroup',
    instagram: 'https://www.instagram.com/aarnorajewels/',
    website: 'TBD — no website live yet',
    funding: 'Backed by SGBL Group (est. 1999); just launched first flagship showroom',
    whyNeedUs: 'New brand just opened first showroom — needs strong social media presence and content strategy to build awareness and drive footfall',
    priority: 'High',
    status: 'New',
    lastContacted: '',
    nextStep: 'Find email/phone via SGBL Group or direct DM on Instagram',
    notes: 'Launched showroom in Secunderabad (Apr 20, 2026) inaugurated by Nidhhi Agerwal. 77% exchange policy. 2,334 IG followers.',
    source: 'ANI News + Blogarama article about showroom launch; Instagram verification'
  },
  {
    category: 'Clothing',
    company: 'Pranikas (Pranika\'s Fashion House)',
    industry: 'Ethnic Wear (Sarees, Suits, Handloom)',
    firstName: 'TBD',
    lastName: '(nikkonika@gmail.com likely founder)',
    title: 'Founder',
    email: 'support@pranikas.com / info@pranikas.com',
    phone: '91 9433997184',
    linkedin: 'TBD — no LinkedIn found',
    instagram: 'https://www.instagram.com/pranikas.shop/',
    website: 'https://pranikas.com',
    funding: 'Bootstrapped; founded 2019',
    whyNeedUs: 'Small ethnic wear brand from Assam — needs content creation and social media management to reach wider audience beyond Northeast',
    priority: 'High',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email support@pranikas.com or DM on Instagram; find founder name',
    notes: 'Based in Guwahati, Assam. Focus on Northeast handloom & weavers. Also on TikTok. 2,095 IG followers.',
    source: 'Website footer contact info; Instagram verification; pranikas.com'
  },
  {
    category: 'Clothing',
    company: 'Rihyaaz Fashions',
    industry: 'Ethnic Wear (Sarees, Suits, Jamdani, Banarasi)',
    firstName: 'Debjani',
    lastName: 'Ghosh',
    title: 'Founder & Creative Director',
    email: 'rihyaaz.fashions@gmail.com',
    phone: '91 8902955633',
    linkedin: 'TBD — no LinkedIn found',
    instagram: 'https://www.instagram.com/rihyaaz.fashion/',
    website: 'https://www.rihyaaz.com',
    funding: 'Bootstrapped; women-led brand',
    whyNeedUs: '5,460 followers but 1,607 posts — creating content but needs better strategy and professional social media management to scale beyond Kolkata',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email rihyaaz.fashions@gmail.com or call 8902955633',
    notes: 'Based in Kolkata (8 Mall Road). 21,247 verified reviews on site. Won "Best Brand" and "Pride of Bharat" awards. Also does menswear and couple collection.',
    source: 'Website contact page; Instagram verification; rihyaaz.com'
  },
  {
    category: 'Jewelry',
    company: 'Dandelion Jewels',
    industry: 'Jewellery (Handmade/Artisan)',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'TBD — no website or email found; Instagram-only presence',
    phone: 'TBD — no phone found',
    linkedin: 'TBD — no LinkedIn found',
    instagram: 'https://www.instagram.com/dandelionjewels/',
    website: 'TBD — dandelionjewels.com Shopify store appears down',
    funding: 'TBD — no funding info found',
    whyNeedUs: 'Small jewelry brand with only Instagram presence (910 followers, 56 posts) — desperately needs website, content, and social media strategy',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'DM on Instagram to find contact info; check if Shopify store is being rebuilt',
    notes: '910 IG followers. Shopify store (ID 92596568366) appears inactive. No other web presence found.',
    source: 'Instagram verification; Shopify store URL found in search results'
  },
  {
    category: 'Jewelry',
    company: 'Silvooshine',
    industry: 'Silver Jewellery (925 Sterling Silver)',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'care@silvooshine.com',
    phone: '91 8373925926',
    linkedin: 'TBD — no LinkedIn found',
    instagram: 'https://www.instagram.com/silvooshine/',
    website: 'https://silvooshine.com',
    funding: 'Bootstrapped; Delhi-based',
    whyNeedUs: 'Only 63 IG followers with 15 posts — has website and products but zero social media presence. Classic case of needing content + social management from scratch.',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email care@silvooshine.com or call/WhatsApp 8373925926',
    notes: 'Based in Dwarka, Delhi (Plot 719, Sector 26). Claims 3L+ customers — likely inflated. Website is functional with products listed. Free shipping above 1499.',
    source: 'Website contact page; Instagram verification; silvooshine.com'
  }
];

// Get current row count first
let startRow;
try {
  const result = execFileSync(gog, ['sheets', 'values', 'get', '--sheet', sheetId, '--range', `${tab}!A:A`], { encoding: 'utf8' });
  const rows = result.trim().split('\n').filter(r => r.trim());
  startRow = rows.length + 1;
  console.log(`Current rows: ${rows.length}, starting at row ${startRow}`);
} catch(e) {
  console.log('Error getting row count, defaulting to row 7:', e.message.substring(0, 100));
  startRow = 7;
}

for (let i = 0; i < brands.length; i++) {
  const b = brands[i];
  const row = startRow + i;
  
  const values = [
    b.category,
    b.company,
    b.industry,
    b.firstName,
    b.lastName,
    b.title,
    b.email,
    b.phone,
    b.linkedin,
    b.instagram,
    b.website,
    b.funding,
    b.whyNeedUs,
    b.priority,
    b.status,
    b.lastContacted,
    b.nextStep,
    b.notes,
    b.source
  ];
  
  const jsonData = JSON.stringify(values);
  const range = `${tab}!A${row}:S${row}`;
  
  try {
    const result = execFileSync(gog, ['sheets', 'values', 'update', '--sheet', sheetId, '--range', range, '--values-json', jsonData], { encoding: 'utf8' });
    console.log(`✅ Row ${row}: ${b.company} — ${result.trim()}`);
  } catch(e) {
    console.log(`❌ Row ${row}: ${b.company} — ERROR: ${e.message.substring(0, 200)}`);
  }
}

console.log('\nDone! 5 brands pushed to outbound sheet.');