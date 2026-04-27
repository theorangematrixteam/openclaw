const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const brands = [
  {
    category: 'Product:Perfume',
    company: 'Haus of Jawhar',
    industry: 'Luxury-Inspired Perfumes',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'support@hausofjawhar.com',
    phone: '91 7304508990',
    linkedin: 'TBD - No LinkedIn found for brand or founder',
    instagram: 'https://www.instagram.com/hausofjawhar/',
    website: 'https://hausofjawhar.com',
    funding: 'Bootstrapped',
    whyNeedUs: 'New perfume brand with only 495 IG followers — needs content creation and social media presence to build brand identity and drive sales',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email support@hausofjawhar.com',
    notes: '495 followers; 134 posts; luxury-inspired perfumes for him & her; based in India; Rs 649-699 price range; also has phone 91 7304508990',
    source: 'Website contact page + Instagram verification'
  },
  {
    category: 'Clothing:Streetwear',
    company: 'Hustle House',
    industry: 'Premium Streetwear & Apparel',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'hustlehouse.care@hustlehouse.in',
    phone: '91 9348005515',
    linkedin: 'TBD - No LinkedIn found for brand or founder',
    instagram: 'https://www.instagram.com/hustlehouse_india/',
    website: 'https://hustlehouse.in',
    funding: 'Bootstrapped',
    whyNeedUs: 'New streetwear brand with 292 IG followers — needs content creation and social media management to build presence in competitive market',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email hustlehouse.care@hustlehouse.in',
    notes: '292 followers; 31 posts; premium streetwear for hustlers; based in India; END OF SEASON SALE 40% OFF running',
    source: 'Website contact page + Instagram verification'
  },
  {
    category: 'Jewelry:Handmade',
    company: 'Sioral',
    industry: 'Anti Tarnish Everyday Jewellery',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'info.sioral@gmail.com',
    phone: '91 7904485525',
    linkedin: 'TBD - No LinkedIn found for brand or founder',
    instagram: 'https://www.instagram.com/sioral.in/',
    website: 'https://www.sioral.in',
    funding: 'Bootstrapped',
    whyNeedUs: 'Jewelry brand with 4,076 IG followers but needs professional content strategy and social media management to convert followers into customers',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email info.sioral@gmail.com or call 7904485525',
    notes: '4,076 followers; 337 posts; anti-tarnish everyday jewellery; based in India; phone 91 7904485525',
    source: 'Website contact page + Instagram verification'
  },
  {
    category: 'Jewelry:Handmade',
    company: 'With Love By Neelam',
    industry: 'Handcrafted Statement Jewellery',
    firstName: 'Neelam',
    lastName: 'TBD',
    title: 'Founder',
    email: 'withlovebyneelam@gmail.com',
    phone: '91 8587032224',
    linkedin: 'TBD - No LinkedIn found for founder',
    instagram: 'https://www.instagram.com/withlovebyneelam/',
    website: 'https://withlovebyneelam.co.in',
    funding: 'Bootstrapped',
    whyNeedUs: 'Small handmade jewelry brand with 359 IG followers — needs content creation and social media presence to grow beyond current reach',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email withlovebyneelam@gmail.com or DM on Instagram',
    notes: '359 followers; 99 posts; handcrafted statement jewellery; based in India; free shipping over INR 2500',
    source: 'Website contact page + Instagram verification'
  },
  {
    category: 'Jewelry:Handmade',
    company: 'Aanagha',
    industry: 'Handcrafted Indian Jewellery with Modern Soul',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'contact@aanagha.co',
    phone: '91 9070661515',
    linkedin: 'TBD - No LinkedIn found for brand or founder',
    instagram: 'https://www.instagram.com/aanagha.co/',
    website: 'https://aanagha.co',
    funding: 'Bootstrapped',
    whyNeedUs: 'Handcrafted jewelry brand with 1,096 IG followers — needs professional content strategy and social media management to scale presence',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email contact@aanagha.co or call 9070661515',
    notes: '1,096 followers; 287 posts; handcrafted Indian jewellery with modern design; free shipping across India; 20% off first order with WELCOME20; also phone 91 9055661515',
    source: 'Website contact page + Instagram verification'
  },
  {
    category: 'Jewelry:Handmade',
    company: 'HuesByDrish',
    industry: 'Handmade Jewellery, Art & Keepsakes',
    firstName: 'Drish',
    lastName: 'TBD',
    title: 'Founder',
    email: 'huesbydrish@gmail.com',
    phone: 'TBD - No phone found on website',
    linkedin: 'TBD - No LinkedIn found for founder',
    instagram: 'https://www.instagram.com/huesbydrish/',
    website: 'https://www.huesbydrish.com',
    funding: 'Bootstrapped',
    whyNeedUs: 'Handmade jewelry and art brand with 1,539 IG followers — needs content creation and social media strategy to build stronger brand presence',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email huesbydrish@gmail.com or DM on Instagram',
    notes: '1,539 followers; 401 posts; handmade jewellery in resin and art; mindful keepsakes; pan India free shipping above Rs 2500; also on Pinterest',
    source: 'Website + Instagram verification'
  },
  {
    category: 'Product:Candles',
    company: 'Itrāa Essence',
    industry: 'Premium Handcrafted Candles & Gifting',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'itraaessence@gmail.com',
    phone: 'TBD - No phone found on website',
    linkedin: 'TBD - No LinkedIn found for brand or founder',
    instagram: 'https://www.instagram.com/itraaessence/',
    website: 'https://itraaessence.com',
    funding: 'Bootstrapped',
    whyNeedUs: 'Premium handcrafted candle brand with 1,137 IG followers — needs content creation and social media management to build brand awareness and drive sales',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email itraaessence@gmail.com or DM on Instagram',
    notes: '1,137 followers; 74 posts; handcrafted design-led candles for gifting; loved across India; website has no phone number',
    source: 'Website contact page + Instagram verification'
  },
  {
    category: 'Product:Candles',
    company: 'Dream Lite',
    industry: 'Handcrafted Soy Wax Candles',
    firstName: 'Sayani',
    lastName: 'Chatterjee',
    title: 'Founder',
    email: 'sayanichatterj13@gmail.com',
    phone: '91 6289182109',
    linkedin: 'TBD - No LinkedIn found for founder',
    instagram: 'https://www.instagram.com/dreamlitecandles/',
    website: 'https://dream-lite.com',
    funding: 'Bootstrapped',
    whyNeedUs: 'Very small candle brand with 54 IG followers — needs content creation and social media presence from scratch to build brand identity',
    priority: 'Medium',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email sayanichatterj13@gmail.com',
    notes: '54 followers; 71 posts; handcrafted soy wax candles; based in India; 100% natural soy wax; also phones 91 9836936647 and 91 9997063134',
    source: 'Website contact page + Instagram verification'
  },
  {
    category: 'Product:Candles',
    company: 'Aroha By Aditi',
    industry: 'Premium Handcrafted Candles',
    firstName: 'Aditi',
    lastName: 'TBD',
    title: 'Founder',
    email: 'TBD - No email found on website; DM @arohabyaditi on Instagram',
    phone: 'TBD - No phone found on website',
    linkedin: 'TBD - No LinkedIn found for founder',
    instagram: 'https://www.instagram.com/arohabyaditi/',
    website: 'https://arohabyaditi.in',
    funding: 'Bootstrapped',
    whyNeedUs: 'New candle brand with only 97 IG followers — needs content creation and social media presence to establish brand identity',
    priority: 'Low',
    status: 'Needs Research',
    lastContacted: '',
    nextStep: 'DM @arohabyaditi on Instagram to find email',
    notes: '97 followers; 56 posts; premium handcrafted candles; based in India; no email or phone found on website',
    source: 'Website + Instagram verification'
  },
  {
    category: 'Product:Candles',
    company: 'Flicker & Fusion',
    industry: 'Handmade Scented Candles',
    firstName: 'TBD',
    lastName: 'TBD',
    title: 'Founder',
    email: 'TBD - Website timeout; DM @flickerandfusion on Instagram',
    phone: 'TBD - Website timeout; no phone found',
    linkedin: 'TBD - No LinkedIn found for brand or founder',
    instagram: 'https://www.instagram.com/flickerandfusion/',
    website: 'https://www.flickerandfusion.com',
    funding: 'Bootstrapped',
    whyNeedUs: 'Handmade candle brand with 925 IG followers — needs content strategy and social media management to grow beyond current reach',
    priority: 'Medium',
    status: 'Needs Research',
    lastContacted: '',
    nextStep: 'DM @flickerandfusion on Instagram to find email',
    notes: '925 followers; 144 posts; handmade scented candles; based in India; website times out; no contact info available yet',
    source: 'Instagram verification only - website timeout'
  }
];

let success = 0;
let failed = 0;

for (const b of brands) {
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
    success++;
  } catch(e) {
    console.log(`❌ ${b.company} — ERROR: ${e.message.substring(0, 200)}`);
    failed++;
  }
}

console.log(`\n=== SUMMARY: ${success} added, ${failed} failed ===`);
