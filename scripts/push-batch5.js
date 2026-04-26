const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Verified leads from Batch 5 (Apr 26)
// All IG counts verified via meta tag check
const leads = [
  ['Clothing:Streetwear', 'DEFKIDD', 'Contemporary Streetwear', 'Akshay', 'Ahlawat', 'Co-Founder', 'TBD - No email found on website yet; DM @defkidd_ on Instagram', 'TBD - No phone found', 'TBD - No LinkedIn found for founder', 'https://instagram.com/defkidd_', 'https://defkidd.in', 'Bootstrapped', 'New streetwear brand (344 IG followers); launched 2025; needs content to build brand identity', 'Medium', 'New', '', 'Find email via website contact form or DM on Instagram', 'Founded 2025 by Akshay Ahlawat and Montu Tomar; contemporary clothing label celebrating self-expression', 'Website + Passionateinmarketing article'],
  ['Clothing:Ethnic', 'Mynaah', 'Ethnic Wear (Handcrafted)', 'TBD', 'TBD', 'Founder', 'TBD - No email found; DM @mynaah.in on Instagram', 'TBD - No phone found', 'TBD - No LinkedIn found', 'https://instagram.com/mynaah.in', 'TBD - No website found yet', 'Bootstrapped; founded 2024', 'Small handcrafted ethnic wear brand (7,215 IG followers); 236 LinkedIn followers; needs social media presence and content', 'Medium', 'New', '', 'Find email via Instagram DM or website once launched', 'Handcrafted by artisans of India; minimal classic sustainable; founded 2024', 'LinkedIn + Instagram verification'],
  ['Jewelry:Silver', 'Silvra', 'Silver Jewellery (925 Sterling)', 'TBD', 'TBD', 'Founder', 'care@silvra.in', '91 8802246181', 'TBD - No LinkedIn found', 'https://instagram.com/shopsilvra', 'https://silvra.in', 'Bootstrapped', 'New silver jewellery brand (34 IG followers); needs content and social media from scratch', 'Medium', 'New', '', 'Email care@silvra.in or call 8802246181', 'Premium handcrafted pure silver jewellery; 925 sterling silver; 35% off + free shipping offer', 'Website + Instagram verification'],
  ['Jewelry:Silver', 'Reeva Silver', 'Silver Jewellery (925 Hallmarked)', 'TBD', 'TBD', 'Founder', 'TBD - No email found on website; DM @reevasilver.in', 'TBD - No phone found', 'TBD - No LinkedIn found', 'https://instagram.com/reevasilver.in', 'https://reevasilver.in', 'Bootstrapped', 'Small silver jewellery brand (122 IG followers); needs content and social strategy', 'Medium', 'New', '', 'Find email via website contact form or DM on Instagram', 'Pure 925 hallmarked silver; COD available; 7 day easy returns', 'Website + Instagram verification'],
  ['Product:Candles', 'Sixtyscent', 'Soy Scented Candles', 'TBD', 'TBD', 'Founder', 'TBD - No email found on website; DM @sixtyscent.store', 'TBD - No phone found', 'TBD - No LinkedIn found', 'https://instagram.com/sixtyscent.store', 'https://sixtyscent.store', 'Bootstrapped', 'Handcrafted soy scented candle brand (174 IG followers); needs content and social presence', 'Medium', 'New', '', 'Find email via website contact form or DM on Instagram', 'Mood memory scent; handcrafted soy candles from India; made to calm and comfort', 'Website + Instagram verification'],
  ['Product:Candles', 'Alkimi Living', 'Luxury Scented Candles', 'TBD', 'TBD', 'Founder', 'TBD - No email found; DM @alkimi.in on Instagram', 'TBD - No phone found', 'TBD - No LinkedIn found', 'https://instagram.com/alkimi.in', 'https://alkimi.in', 'Bootstrapped', 'Luxury scented candle brand (1,022 IG followers); needs content strategy and social growth', 'Medium', 'New', '', 'Find email via website contact page or DM on Instagram', 'Handcrafted luxury scented candles; home fragrance; Alkimi Journal blog', 'Website + Instagram verification'],
  ['Clothing:Streetwear', 'Bakwaas Wears', 'Streetwear (Bold T-shirts)', 'TBD', 'TBD', 'Founder', 'helpbakwaaswears@gmail.com', 'TBD - No phone found', 'TBD - No LinkedIn found', 'https://instagram.com/bakwaaswears', 'https://www.bakwaaswears.com', 'Bootstrapped', 'Bold streetwear brand (0 IG followers but website active); needs content and social presence', 'Medium', 'New', '', 'Email helpbakwaaswears@gmail.com', 'Affordable premium tshirts under Rs 999; bold streetwear that challenges the ordinary', 'Website + Instagram verification'],
  ['Clothing:Ethnic', 'Krimilo', 'Affordable Luxury Clothing', 'TBD', 'TBD', 'Founder', 'TBD - No email found on website; DM @krimilo on Instagram', 'TBD - No phone found', 'TBD - No LinkedIn found', 'https://instagram.com/krimilo', 'http://www.krimilo.com', 'Bootstrapped', 'Homegrown affordable luxury clothing (1 IG follower); needs content and social presence from scratch', 'Medium', 'New', '', 'Find email via website contact form or DM on Instagram', 'Designed to hug natural curves; ethnic wear and co-ord sets; Amethyst Glow Sharara Set Rs 2,829', 'Website + Instagram verification'],
  ['Jewelry:Silver', 'Suramyah', 'Silver Jewellery (Daily Wear)', 'TBD', 'TBD', 'Founder', 'TBD - No email found on website; DM @suramyah.in on Instagram', 'TBD - No phone found', 'TBD - No LinkedIn found', 'https://instagram.com/suramyah.in', 'https://www.suramyah.in', 'Bootstrapped', 'Daily wear silver jewellery (487 IG followers); needs content strategy and social growth', 'Medium', 'New', '', 'Find email via website contact form or DM on Instagram', 'Free shipping on all orders; lifetime warranty; 350+ loving customers; dangling nosepins', 'Website + Instagram verification'],
  ['Jewelry:Silver', 'ZEPHYRA', 'Minimal Luxury Jewelry', 'TBD', 'TBD', 'Founder', 'TBD - No email found on website; DM @zephyra.co.in on Instagram', 'TBD - No phone found', 'TBD - No LinkedIn found', 'https://instagram.com/zephyra.co.in', 'https://www.zephyra.co.in', 'Bootstrapped', 'Minimal luxury jewelry brand (1,634 IG followers); needs content to scale presence', 'Medium', 'New', '', 'Find email via website contact form or DM on Instagram', 'Minimal but make it luxe — jewelry that elevates every outfit', 'Website + Instagram verification'],
];

let pushed = 0;
for (const lead of leads) {
  try {
    execFileSync(gog, [
      'sheets', 'append', sheetId, 'Outbound!A:S',
      '--values-json', JSON.stringify([lead]),
      '--insert', 'INSERT_ROWS', '--no-input'
    ], { encoding: 'utf8' });
    pushed++;
    console.log(`✅ ${lead[1]}: Pushed (row ${pushed + 16})`);
  } catch(e) {
    console.log(`❌ ${lead[1]}: Failed - ${e.message.substring(0, 80)}`);
  }
}

console.log(`\nDone! ${pushed}/${leads.length} leads pushed.`);
