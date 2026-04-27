const { chromium } = require('playwright');
const fs = require('fs');

// Twitter/X Comment Script
// Usage: node twitter-comment.js <username> "<comment>"

const username = process.argv[2];
const comment = process.argv[3];

if (!username || !comment) {
  console.log('Usage: node twitter-comment.js <username> "<comment>"');
  process.exit(1);
}

const COOKIES_PATH = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\twitter-cookies.json';

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  let cookies;
  try {
    cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf8'));
  } catch(e) {
    console.log('ERROR: No Twitter cookies found.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    console.log(`Navigating to @${username}...`);
    await page.goto(`https://x.com/${username}`, { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(randomDelay(2000, 4000));

    // Click first tweet
    const firstTweet = await page.$('article[data-testid="tweet"]');
    if (!firstTweet) {
      console.log('FAIL: No tweets found');
      process.exit(1);
    }

    // Click reply button
    const replyBtn = await firstTweet.$('[data-testid="reply"]');
    if (!replyBtn) {
      console.log('FAIL: No reply button found');
      process.exit(1);
    }
    await replyBtn.click();
    await page.waitForTimeout(randomDelay(2000, 4000));

    // Find comment input
    const commentInput = await page.$('[data-testid="tweetTextarea_0"]') ||
                        await page.$('[contenteditable="true"]');
    
    if (!commentInput) {
      console.log('FAIL: No comment input found');
      process.exit(1);
    }

    await commentInput.click();
    await page.waitForTimeout(randomDelay(500, 1000));

    // Type comment with human-like delays
    for (const char of comment) {
      await page.keyboard.press(char);
      await sleep(randomDelay(30, 100));
    }
    await page.waitForTimeout(randomDelay(500, 1000));

    // Post comment
    const postBtn = await page.$('[data-testid="tweetButton"]');
    if (postBtn) {
      await postBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(randomDelay(3000, 5000));
    console.log(`✅ Comment posted on @${username}'s latest tweet`);

  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();