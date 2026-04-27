const { chromium } = require('playwright');
const fs = require('fs');

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1280,720'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
  });

  // Load cookies
  const cookiesPath = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json';
  if (fs.existsSync(cookiesPath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
    await context.addCookies(cookies);
    console.log('Cookies loaded');
  }

  try {
    await page.goto('https://www.instagram.com/mobileeditingclub/p/DXnAfxaDZ0C/', {
      timeout: 30000,
      waitUntil: 'networkidle'
    });
    await sleep(randomDelay(3000, 5000));

    // Extract post data
    const postData = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt
      }));
      
      const caption = document.querySelector('h1, div[class*="caption"]')?.textContent || '';
      const likes = document.querySelector('span[class*="like"]')?.textContent || '';
      
      return { images, caption, likes };
    });

    fs.writeFileSync('post-data.json', JSON.stringify(postData, null, 2));
    console.log('Post data saved to post-data.json');

  } catch (e) {
    console.error('Error:', e.message);
  }

  await browser.close();
})();