const https = require('https');

// List of candidate IG handles to check
const handles = [
  'hizbah.co', 'indkari.official', 'thefloralfusion.official',
  'tassyasilver', 'zaishreeofficial', 'zephyra.co.in',
  'amraanastore', 'ornatique_jewels', 'jiaarajewellery',
  'houseofaagor', 'vastralay101', 'dzayra.official',
  'reevasilver.in', 'zilvera.shop', 'leaclothingco'
];

async function checkHandle(handle) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.instagram.com',
      path: `/${handle}/`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Extract og:description
        const ogMatch = data.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (ogMatch) {
          resolve({ handle, found: true, desc: ogMatch[1] });
        } else {
          // Try title
          const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
          resolve({ handle, found: false, desc: titleMatch ? titleMatch[1] : 'No data' });
        }
      });
    });
    
    req.on('error', (e) => {
      resolve({ handle, found: false, desc: e.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ handle, found: false, desc: 'Timeout' });
    });
    
    req.end();
  });
}

(async () => {
  for (const h of handles) {
    const result = await checkHandle(h);
    if (result.found) {
      console.log(`✅ @${result.handle}: ${result.desc}`);
    } else {
      console.log(`❓ @${result.handle}: ${result.desc}`);
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
})();