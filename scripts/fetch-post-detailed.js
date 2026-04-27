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
    await sleep(randomDelay(5000, 8000));

    // Take screenshot
    await page.screenshot({ path: 'post-screenshot.png', fullPage: true });
    console.log('Screenshot saved to post-screenshot.png');

    // Extract detailed post data
    const postData = await page.evaluate(() => {
      // Get main image/video
      const mainMedia = document.querySelector('img[alt*="photo"], video');
      const mediaUrl = mainMedia ? mainMedia.src : null;
      
      // Get caption
      const captionEl = document.querySelector('h1, div[class*="caption"] div span, article div span');
      const caption = captionEl ? captionEl.textContent : '';
      
      // Get likes
      const likesEl = document.querySelector('section span[class*="like"], div[role="button"] span');
      const likes = likesEl ? likesEl.textContent : '';
      
      // Get comments count
      const commentsEl = document.querySelector('a[href*="comments"] span, div[role="button"] span');
      const comments = commentsEl ? commentsEl.textContent : '';
      
      // Get date
      const timeEl = document.querySelector('time');
      const date = timeEl ? timeEl.getAttribute('datetime') : '';
      
      // Get hashtags
      const hashtags = Array.from(document.querySelectorAll('a[href*="/explore/tags/"]')).map(a => a.textContent);
      
      return { mediaUrl, caption, likes, comments, date, hashtags };
    });

    fs.writeFileSync('post-detailed.json', JSON.stringify(postData, null, 2));
    console.log('Post data saved to post-detailed.json');
    console.log('Post data:', JSON.stringify(postData, null, 2));

  } catch (e) {
    console.error('Error:', e.message);
  }

  await browser.close();
})();