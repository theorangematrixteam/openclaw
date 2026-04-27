const { chromium } = require('playwright');
const fs = require('fs');

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function humanScroll(page, pixels) {
  const steps = randomDelay(5, 10);
  const perStep = pixels / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, perStep + randomDelay(-20, 20));
    await sleep(randomDelay(50, 150));
  }
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
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // Patch webdriver detection
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

  const accounts = ['mobileeditingclub', 'marketingharry', 'roman.knox'];
  const results = {};

  for (const account of accounts) {
    console.log(`\n=== Searching ${account} ===`);
    try {
      await page.goto(`https://www.instagram.com/${account}/`, {
        timeout: 30000,
        waitUntil: 'networkidle'
      });
      await sleep(randomDelay(3000, 5000));

      // Scroll to load posts
      for (let i = 0; i < 3; i++) {
        await humanScroll(page, 800);
        await sleep(randomDelay(1000, 2000));
      }

      // Extract post data
      const posts = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
        return links.slice(0, 12).map(link => ({
          url: link.href,
          type: link.href.includes('/reel/') ? 'reel' : 'post'
        }));
      });

      results[account] = posts;
      console.log(`Found ${posts.length} posts`);

      // Click first post to get engagement
      if (posts.length > 0) {
        await page.goto(posts[0].url, { timeout: 30000, waitUntil: 'networkidle' });
        await sleep(randomDelay(2000, 4000));

        const engagement = await page.evaluate(() => {
          const likes = document.querySelector('span[class*="like"], section span');
          const caption = document.querySelector('h1, span[class*="caption"]');
          return {
            likesText: likes ? likes.textContent : 'N/A',
            captionPreview: caption ? caption.textContent.substring(0, 200) : 'N/A'
          };
        });

        results[account][0].engagement = engagement;
        console.log('First post engagement:', engagement.likesText);
      }

    } catch (e) {
      console.error(`Error with ${account}:`, e.message);
      results[account] = { error: e.message };
    }
  }

  // Save results
  fs.writeFileSync('viral-posts-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to viral-posts-results.json');

  await browser.close();
})();