#!/usr/bin/env node
// Push outbound data via gog CLI using child_process to avoid shell quoting issues
const { execSync } = require('child_process');
const fs = require('fs');

const values = [
  ["ONYA","Jewelry (Lab-Grown Diamonds)","Himani","Yadav","Founder & CEO","himani@onyadiamonds.com","+91 80735 22403","https://linkedin.com/in/himaniy","https://instagram.com/onyadiamonds","https://onyadiamonds.com","Pre-Seed (Rs 5.5 Cr)","New lab-grown diamond brand needs content strategy and social presence to compete with established players","High","Not Contacted","","Research & reach out","Ex-IIT Guwahati, ex-Ola/InMobi; HSR Bengaluru store; omni-channel play","D2C Insider"],
  ["Lucira Jewelry","Jewelry (Lab-Grown Diamonds)","Rupesh","Jain","Founder","info@lucirajewelry.com","","https://linkedin.com/in/rupeshjain85","https://instagram.com/lucirajewelry","https://lucirajewelry.com","Seed ($5.5M)","Funded jewelry brand scaling fast; needs strong content & social to match growth velocity","High","Not Contacted","","Research & reach out","Ex-Founder at Candere; Mumbai based; co-founder Vandana Jain; Blume Ventures backed","D2C Insider"],
  ["Coluxe","Jewelry (Fine Jewellery)","Priyanka","Gill","Founder","hello@coluxe.com","","https://linkedin.com/in/priyankagill","https://instagram.com/coluxe.club","https://coluxe.com","Friends & Family","Newly launched fine jewellery brand needs full content & social buildout from scratch","High","Not Contacted","","Research & reach out","Lab-grown diamond + gemstone focus; just finished F&F round; Delhi based","D2C Insider"],
  ["Sharmeeli","Ethnic Wear (Clothing)","Shruti","Gochhwal","Founder","hello@sharmeeli.in","","https://linkedin.com/in/shrutigochhwal","https://instagram.com/sharmeeli.in","https://sharmeeli.in","Bootstrapped","New D2C ethnic wear brand needs content & social presence to launch strong","Medium","Not Contacted","","Research & reach out","Forbes Asia 30 under 30; ex-Zappfresh co-founder; Delhi based","Sahyadri Startups"],
  ["BLUORNG","Streetwear (Clothing)","Siddhant","Sabharwal","Co-Founder","support@bluorng.com","","https://linkedin.com/in/siddhant-sabharwal-419747175","https://instagram.com/bluorng","https://bluorng.com","Bootstrapped (Revenue-funded)","Growing streetwear brand with 5 stores; needs consistent content to match retail expansion","High","Not Contacted","","Research & reach out","Founded 2019; 21 employees; Delhi NCR; 5 retail stores incl Ambience Mall Gurgaon","Indian Retailer"],
  ["Our Karma Clothing","Streetwear (Clothing)","Kamlesh","Khatri","Founder & CEO","contact@ourkarmaclothing.com","","https://linkedin.com/in/kamlesh-khatri-0262605b","https://instagram.com/ourkarmaclothing","https://ourkarmaclothing.com","Bootstrapped","Emerging streetwear brand needs content differentiation in crowded market","Medium","Not Contacted","","Research & reach out","Pushkar/Ajmer based; 22 years in clothing; acid wash & premium tees focus","LinkedIn"],
  ["Loomkins","Kidswear (Clothing + Toys)","Tanvi","Bhardwaj","Co-Founder","hello@loomkins.com","","https://linkedin.com/in/tanvi-bhardwaj-1871b121","https://instagram.com/loomkins","https://loomkins.com","Bootstrapped","New premium kidswear brand needs content to establish category positioning","Medium","Not Contacted","","Research & reach out","Forbes 30 under 30; ex-MishiPay co-founder; Delhi based; kidswear + plush toy combo","D2C Insider"],
  ["Laani","Personal Care (D2C)","TBD","TBD","Founder","hello@withyoulaani.com","","https://linkedin.com/company/laani","https://instagram.com/withyoulaani","https://withyoulaani.com","Pre-Seed (Rs 9.1 Cr)","Freshly funded personal care brand needs content & social strategy to launch","High","Not Contacted","","Research & reach out","V3 Ventures + Saama Capital backed; pre-seed; new age personal care for modern India","D2C Insider"],
  ["Eternz","Jewelry Marketplace","Arthi","Ramalingam","Founder & CEO","hello@eternz.com","","https://linkedin.com/in/arthi-ramalingam","https://instagram.com/eternz","https://eternz.com","Pre-Series A","Jewelry marketplace needs brand content and vendor storytelling to stand out","Medium","Not Contacted","","Research & reach out","2X founder; Bengaluru based; curated jewelry + watch marketplace; pre-series A funded","D2C Insider"],
  ["Snitch","Fast Fashion (Clothing)","Siddharth","Dungarwal","Founder & CEO","careers@snitch.co.in","","https://linkedin.com/in/siddharthrdungarwal","https://instagram.com/snitch.co.in","https://snitch.com","Bootstrapped (Revenue-funded)","Scale-stage brand (100Cr+ revenue) needs high-volume content production to match pace","High","Not Contacted","","Research & reach out","Shark Tank India S2 all-shark deal; 100Cr+ ARR; 5 offline stores; mens fast fashion; Bangalore","Startup Pedia"]
];

// Write to temp file, then use file content via stdin
const tmpFile = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\outbound-values.json';
fs.writeFileSync(tmpFile, JSON.stringify(values));

// Try using gog with file-based approach
const jsonStr = JSON.stringify(values);
const escapedJson = jsonStr.replace(/"/g, '\\"');

try {
  const result = execSync(
    `gog sheets append 1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ "Outbound!A2" --values-json "${escapedJson}" --insert INSERT_ROWS`,
    { encoding: 'utf8', timeout: 30000, shell: 'cmd.exe' }
  );
  console.log(result);
} catch(e) {
  console.error('Failed:', e.stderr || e.message);
}