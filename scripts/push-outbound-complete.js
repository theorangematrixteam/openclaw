const { execFileSync } = require('child_process');

// Update all 5 rows with complete verified data
const values = [
  // BITCHN - VERIFIED: 1,091 IG followers, email info@thebitchn.com from privacy policy, two sisters from about page
  ["Clothing","BITCHN","Streetwear","TBD","TBD","Co-Founders (Sisters)","info@thebitchn.com","","","https://instagram.com/bitchn.official","https://thebitchn.com","Bootstrapped","New streetwear by two sisters (1,091 IG followers); needs content to build presence","Medium","Not Contacted","","Email or DM","1,091 followers; limited drop model; premium Rs 2,990-4,490; sweatshirts, tees, denim; no phone found; sister duo keeps names private","IG follower check + Website privacy policy + About page"],
  // Sharmeeli - VERIFIED: 1,478 IG followers, phone +91 9717773719, email contact@sharmeeli.in, founder Shruti Gochhwal
  ["Clothing","Sharmeeli","Ethnic Wear","Shruti","Gochhwal","Founder","contact@sharmeeli.in","+91 9717773719","https://linkedin.com/in/shrutigochhwal","https://instagram.com/sharmeeli.in","https://sharmeeli.in","Bootstrapped","New D2C ethnic wear (1,478 IG followers); needs content and social buildout","High","Not Contacted","","Call or DM","1,478 followers; Forbes Asia 30 under 30; ex-Zappfresh co-founder; 9 Hauz Khas Village New Delhi; Amaltas Couture","IG follower check + Website contact page"],
  // Whynaut - VERIFIED: 941 IG followers, email whynaut04@gmail.com, founder Jatin Dubey from footer, Shivpuri MP
  ["Clothing","Whynaut","Streetwear","Jatin","Dubey","Founder","whynaut04@gmail.com","","","https://instagram.com/whynaut.in","https://whynaut.in","Bootstrapped","New streetwear for misfits (941 IG followers); needs content to build brand identity","Medium","Not Contacted","","Email or DM","941 followers; Krishna Ji Enterprises; Shivpuri MP 473551; Rs 1,399-2,799; Terra Luxe FW25 collection; no phone found","IG follower check + Website contact info page"],
  // Label Kariya - VERIFIED: 444 IG followers, email label.kariya@gmail.com, Bangalore, no founder name found publicly
  ["Clothing","Label Kariya","Ethnic Fusion","TBD","TBD","Founder","label.kariya@gmail.com","","","https://instagram.com/label.kariya","https://labelkariya.com","Bootstrapped","New ethnic fusion brand (444 IG followers); needs content to establish identity","Medium","Not Contacted","","Email or DM","444 followers; Bangalore based; mens and unisex collection; free shipping on first orders; no phone found; founder name not public","IG follower check + Website contact page"],
  // Our Karma Clothing - VERIFIED: 1,804 IG followers, email contact@ourkarmaclothing.com, founder Vivek Kumar from LinkedIn, Ghaziabad
  ["Clothing","Our Karma Clothing","Streetwear","Vivek","Kumar","Founder and CEO","contact@ourkarmaclothing.com","","https://linkedin.com/in/vivek-kumar-7779721a1","https://instagram.com/ourkarmaclothing","https://ourkarmaclothing.com","Bootstrapped","Indian streetwear brand (1,804 IG followers); needs content differentiation in crowded market","Medium","Not Contacted","","Email or DM","1,804 followers; GSTIN 09FYMPK1952C1ZA; Ghaziabad UP; acid wash and premium tees; WhatsApp available via FAQ","IG follower check + Website + LinkedIn"]
];

const jsonStr = JSON.stringify(values);
const result = execFileSync('gog', [
  'sheets', 'update',
  '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ',
  'Outbound!A2',
  '--values-json', jsonStr,
  '--input', 'USER_ENTERED'
], { encoding: 'utf8', timeout: 30000 });
console.log(result);