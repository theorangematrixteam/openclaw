const { execFileSync } = require('child_process');

const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const brands = [
  {
    category: 'Product:Candles',
    company: 'Windowsill',
    industry: 'Home Fragrance (Beeswax Candles)',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'enquiry@windowsill.co.in',
    phone: '91 8263915801',
    linkedin: 'https://www.linkedin.com/company/windowsill-store/',
    instagram: 'https://www.instagram.com/windowsill.store/',
    website: 'https://windowsill.co.in',
    funding: 'Bootstrapped',
    whyNeedUs: '3822 IG followers with 932 posts but low engagement potential — needs professional content strategy and social media management to scale beyond current reach',
    priority: 'High',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email enquiry@windowsill.co.in or DM on Instagram',
    notes: 'Beeswax candles and home fragrance brand. Has wholesale program. Also on Facebook and LinkedIn. Phone: +91 8263915801.',
    source: 'Website contact page; Instagram verification; windowsill.co.in'
  },
  {
    category: 'Product:Perfume',
    company: 'Lussora',
    industry: 'Luxury Perfume/Fragrance',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'care.lussora@gmail.com',
    phone: '91 8787755119',
    linkedin: 'TBD - no LinkedIn found',
    instagram: 'https://www.instagram.com/lussora_/',
    website: 'https://lussorafragrances.com',
    funding: 'Bootstrapped; born in New Delhi',
    whyNeedUs: 'Only 196 IG followers with 61 posts — brand new perfume brand that needs content creation and social media presence from scratch',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email care.lussora@gmail.com or call 8787755119',
    notes: 'Luxury perfume brand born in New Delhi. Also has phone 91 8595462936. April Luxe Sale running. 196 IG followers.',
    source: 'Website contact page; Instagram verification; lussorafragrances.com'
  },
  {
    category: 'Product:Candles',
    company: 'Sunheri Flame',
    industry: 'Handcrafted Candles and Home Decor',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'info@sunheriflame.com / sunheriflame@gmail.com',
    phone: '91 9315978719',
    linkedin: 'TBD - no LinkedIn found',
    instagram: 'https://www.instagram.com/sunheri_flame/',
    website: 'https://sunheriflame.com',
    funding: 'Bootstrapped; Delhi-based',
    whyNeedUs: '269 IG followers — small candle brand with products but zero social media strategy. Needs content creation and brand presence building.',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email info@sunheriflame.com or call 9315978719',
    notes: 'Based in Nagal Raya New Delhi. Handcrafted scented candles and decorative candles. Also has email sunehariflame@gmail.com.',
    source: 'Website contact page; Instagram verification; sunheriflame.com'
  },
  {
    category: 'Clothing',
    company: 'Gharana Karigari Company',
    industry: 'Ethnic Wear (Kurtis Sets)',
    firstName: 'TBD',
    lastName: '(garvansh@batraventures.in likely founder)',
    title: 'Founder',
    email: 'garvansh@batraventures.in',
    phone: '91 8630065665',
    linkedin: 'TBD - no LinkedIn found',
    instagram: 'https://www.instagram.com/gharanakarigaricompany/',
    website: 'https://gharanakarigaricompany.com',
    funding: 'Bootstrapped; operated under Batraventures',
    whyNeedUs: '620 IG followers with 142 posts — ethnic wear brand with products but needs stronger content and social media management to grow beyond local market',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email garvansh@batraventures.in or call 8630065665',
    notes: 'Based in Rudrapur Uttarakhand (D-15 Hari Mandir Gali). Operates under Batraventures. Ethnic kurtis and wedding sets. Free shipping above 999.',
    source: 'Website contact page; Instagram verification; gharanakarigaricompany.com'
  },
  {
    category: 'Clothing',
    company: 'Corall',
    industry: 'Women Fashion (Shirts Tops Dresses)',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'TBD - contact form only on website',
    phone: 'TBD - no phone found on website',
    linkedin: 'TBD - registered as Corallista Lifestyle Private Limited (CIN: U74999MH2022PTC387083)',
    instagram: 'https://www.instagram.com/corall.in/',
    website: 'https://www.corall.in',
    funding: 'Registered company (incorporated Jul 2022); Maharashtra',
    whyNeedUs: 'Only 350 IG followers with 129 posts — has registered company and product line but minimal social presence. Needs content and social media management.',
    priority: 'Low',
    status: 'New',
    lastContacted: '',
    nextStep: 'DM on Instagram or find founder via company registration (Corallista Lifestyle Pvt Ltd)',
    notes: 'Registered as Corallista Lifestyle Private Limited. Incorporated Jul 20 2022 in Maharashtra. Women fashion brand focusing on effortless style. 350 IG followers.',
    source: 'Website; Instagram verification; mycorporateinfo.com company registration'
  }
];

for (let i = 0; i < brands.length; i++) {
  const b = brands[i];
  const values = [
    b.category, b.company, b.industry, b.firstName, b.lastName, b.title,
    b.email, b.phone, b.linkedin, b.instagram, b.website, b.funding,
    b.whyNeedUs, b.priority, b.status, b.lastContacted, b.nextStep, b.notes, b.source
  ];
  
  try {
    const result = execFileSync(gog, [
      'sheets', 'append', sheetId, 'Outbound!A:S',
      '--values-json', JSON.stringify([values]),
      '--insert', 'INSERT_ROWS',
      '--no-input'
    ], { encoding: 'utf8' });
    console.log(`✅ ${b.company} — ${result.trim()}`);
  } catch(e) {
    console.log(`❌ ${b.company} — ERROR: ${e.message.substring(0, 200)}`);
  }
}

console.log('\nBatch 3 done!');