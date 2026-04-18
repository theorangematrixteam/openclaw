const { execFileSync } = require('child_process');

const values = [
  // BITCHN - VERIFIED: 1,091 IG followers (Playwright), about page says two sisters, no phone/email/LinkedIn on site
  ["Clothing","BITCHN","Streetwear","TBD","TBD","Co-Founders (Sisters)","","","","https://instagram.com/bitchn.official","https://thebitchn.com","Bootstrapped","New streetwear by two sisters (1,091 IG followers); needs content to build presence","Medium","Not Contacted","","DM on Instagram","1,091 followers; limited drop model; premium Rs 2,990-4,490; sweatshirts, tees, denim; no public phone or email","IG follower check + Website"],
  // Sharmeeli - VERIFIED: 1,478 IG followers, phone +91 9717773719, email contact@sharmeeli.in, founder Shruti Gochhwal from website
  ["Clothing","Sharmeeli","Ethnic Wear","Shruti","Gochhwal","Founder","contact@sharmeeli.in","+91 9717773719","https://linkedin.com/in/shrutigochhwal","https://instagram.com/sharmeeli.in","https://sharmeeli.in","Bootstrapped","New D2C ethnic wear (1,478 IG followers); needs content and social buildout","High","Not Contacted","","Call or DM","1,478 followers; Forbes Asia 30 under 30; ex-Zappfresh co-founder; 9 Hauz Khas Village New Delhi; Amaltas Couture","IG follower check + Website contact page"],
  // Whynaut - VERIFIED: 941 IG followers, legal name Jatin Dubey from footer, Shivpuri MP
  ["Clothing","Whynaut","Streetwear","Jatin","Dubey","Founder","","","","https://instagram.com/whynaut.in","https://whynaut.in","Bootstrapped","New streetwear for misfits (941 IG followers); needs content to build brand identity","Medium","Not Contacted","","DM on Instagram","941 followers; Krishna Ji Enterprises; Shivpuri MP; Rs 1,399-2,799; Terra Luxe FW25 collection; no phone found","IG follower check + Website footer"],
  // Label Kariya - VERIFIED: 444 IG followers, email label.kariya@gmail.com, Bangalore
  ["Clothing","Label Kariya","Ethnic Fusion","TBD","TBD","Founder","label.kariya@gmail.com","","","https://instagram.com/label.kariya","https://labelkariya.com","Bootstrapped","New ethnic fusion brand (444 IG followers); needs content to establish identity","Medium","Not Contacted","","Email first","444 followers; Bangalore based; mens and unisex collection; free shipping on first orders; no phone found","IG follower check + Website contact page"],
  // Our Karma Clothing - VERIFIED: 1,804 IG followers, email contact@ourkarmaclothing.com, GSTIN 09FYMPK1952C1ZA
  ["Clothing","Our Karma Clothing","Streetwear","TBD","TBD","Founder","contact@ourkarmaclothing.com","","","https://instagram.com/ourkarmaclothing","https://ourkarmaclothing.com","Bootstrapped","Indian streetwear brand (1,804 IG followers); needs content differentiation in crowded market","Medium","Not Contacted","","Email or WhatsApp","1,804 followers; GSTIN 09FYMPK1952C1ZA; acid wash and premium tees focus; WhatsApp available via FAQ","IG follower check + Website"]
];

const jsonStr = JSON.stringify(values);
const result = execFileSync('gog', [
  'sheets', 'append',
  '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ',
  'Outbound!A2',
  '--values-json', jsonStr,
  '--insert', 'INSERT_ROWS'
], { encoding: 'utf8', timeout: 30000 });
console.log(result);