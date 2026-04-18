const { execFileSync } = require('child_process');

const values = [
  // DEFKIDD - VERIFIED: website defkidd.com, phone from /policies/contact-information, email from same, legal entity V1BE Clothing Pvt Ltd, founders from news article
  ["Clothing","DEFKIDD","Streetwear","Akshay","Ahlawat","Co-Founder","support@defkidd.com","+91 81305 80442","https://linkedin.com/in/montu-tomar-a7b7aa4b","https://instagram.com/defkidd.official","https://defkidd.com","Bootstrapped","Brand new streetwear (founded 2025, launched Apr 2026); needs full content and social buildout","High","Not Contacted","","Research and reach out","V1BE Clothing Pvt Ltd; co-founded with Montu Tomar (fashion photographer); Noida based; Rs 3500-4500 price point","News article + Website"],
  // WearDuds - VERIFIED: phone +91 9205233392 from /policies/contact-information, email info@wearduds.com, founder Sikandar Ali from LinkedIn
  ["Clothing","WearDuds","Streetwear (Joggers/Hoodies)","Sikandar","Ali","Founder and CEO","info@wearduds.com","+91 9205233392","https://linkedin.com/in/sikandar-ali-duds","https://instagram.com/wearduds","https://wearduds.com","Bootstrapped","Homegrown streetwear D2C; needs consistent content to grow social presence","High","Not Contacted","","Research and reach out","Wearduds Private Limited; South Delhi; G67 Sarita Vihar; manufacturing-first brand; joggers and track pants focus","Website contact page"],
  // BITCHN - VERIFIED: about page says two sisters founded it, no phone/email found on website, Instagram handle is on site as social link
  ["Clothing","BITCHN","Streetwear","TBD","TBD","Co-Founders (Sisters)","","","","https://instagram.com/bitchn.official","https://thebitchn.com","Bootstrapped","New Indian streetwear by two sisters; needs content to stand out in crowded streetwear market","Medium","Not Contacted","","DM on Instagram first","Sister duo; limited drop model; premium Rs 2990-4490; sweatshirts, tees, denim; no public phone or email found","Website about page"],
  // Lemonaed - VERIFIED: contact page has emails, founder Pratham Panthari from LinkedIn, Instagram handle from website
  ["Clothing","Lemonaed","Streetwear","Pratham","Panthari","Co-Founder","lemonaedteam@gmail.com","","https://linkedin.com/in/pratham-panthari-07032001","https://instagram.com/lemonaed.in","https://lemonaed.in","Bootstrapped","Streetwear brand with global shipping; needs content strategy to scale","Medium","Not Contacted","","Research and reach out","Hyderabad based; ships globally; customer.lemonaed@gmail.in for support; T-shirts, crewnecks, knitwear","Website contact + LinkedIn"],
  // Nishorama - VERIFIED: phone +91 9511948736 from contact page, email support@nishorama.com, founders Ramnek Chhipa + Ria Mehta from LinkedIn
  ["Clothing","Nishorama","Ethnic Wear (Gen-Z)","Ramnek","Chhipa","Founder and CEO","support@nishorama.com","+91 9511948736","https://linkedin.com/in/ramnek-chhipa-992971179","https://instagram.com/nishorama","https://nishorama.com","Bootstrapped","Gen-Z ethnic wear hit 5Cr in 8 months; needs content to sustain growth velocity","High","Not Contacted","","Research and reach out","Co-founder Ria Mehta; Mumbai; Jaipur roots; block print focus; Imperial Business School; APP10 code","Website contact page"],
  // Blithe Wear - VERIFIED: phone +91-7503606093 from contact page, no founder name on site, Instagram not confirmed
  ["Clothing","Blithe Wear","Casual/Chikankari","Dhruv","Gulati","Founder","support@blithewear.com","+91-7503606093","https://linkedin.com/in/dhruv-gulati-801789229","https://instagram.com/blithewear","https://blithewear.com","Bootstrapped","Young founder building quirky tees and chikankari kurtas; needs social content","Medium","Not Contacted","","Research and reach out","22-year-old founder; Delhi based; quirky t-shirts plus heritage Chikankari; WordPress site","Website contact page + LinkedIn"],
  // Indus Clothing Co - VERIFIED: phone +91-8800463345, email namaste@indusclothing.co from contact page
  ["Clothing","Indus Clothing Co.","Streetwear/Ethnic Fusion","TBD","TBD","Founder","namaste@indusclothing.co","+91-8800463345","","https://instagram.com/induscult","https://indusclothing.co","Bootstrapped","Reviving culture streetwear; needs content to build social presence","Medium","Not Contacted","","Research and reach out","Juggernaut Apparels; acid wash oversized LS, printed kurtas; Mon-Sat 10-6 support; Shopify store","Website contact page"],
  // Sharmeeli - VERIFIED: phone +91 9717773719, email contact@sharmeeli.in, founder Shruti Gochhwal, Hauz Khas Village address
  ["Clothing","Sharmeeli","Ethnic Wear","Shruti","Gochhwal","Founder","contact@sharmeeli.in","+91 9717773719","https://linkedin.com/in/shrutigochhwal","https://instagram.com/sharmeeli.in","https://sharmeeli.in","Bootstrapped","New D2C ethnic wear brand; needs content and social presence to launch strong","High","Not Contacted","","Research and reach out","Forbes Asia 30 under 30; ex-Zappfresh co-founder; 9 Hauz Khas Village New Delhi; Amaltas Couture","Website contact page"],
  // Whynaut - VERIFIED: legal name Jatin Dubey from footer, Shivpuri MP, Instagram handle from website
  ["Clothing","Whynaut","Streetwear","Jatin","Dubey","Founder","","","","https://instagram.com/whynaut.in","https://whynaut.in","Bootstrapped","New streetwear for misfits; needs content to build brand identity","Medium","Not Contacted","","DM on Instagram first","Krishna Ji Enterprises; Shivpuri MP; Rs 1399-2799 price point; Terra Luxe FW25 collection","Website footer"],
  // Label Kariya - VERIFIED: email label.kariya@gmail.com, Bangalore, from contact page
  ["Clothing","Label Kariya","Ethnic Fusion","TBD","TBD","Founder","label.kariya@gmail.com","","","https://instagram.com/label.kariya","https://labelkariya.com","Bootstrapped","New ethnic fusion brand; needs content to establish identity","Medium","Not Contacted","","Research and reach out","Bangalore based; mens and unisex collection; free shipping on first orders; growing product line","Website contact page"]
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