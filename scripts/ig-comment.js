// Instagram Comment Script
// Usage: node ig-comment.js <username> "<comment>"
// Note: Requires valid IG cookies from @theorangematrix

const { chromium } = require('playwright');
const fs = require('fs');

const username = process.argv[2];
const comment = process.argv[3];

if (!username || !comment) {
  console.log('Usage: node ig-comment.js <username> "<comment>"');
  process.exit(1);
}

const COOKIES_PATH = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json';

(async () => {
  let cookies;
  try {
    cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf8'));
  } catch(e) {
    console.log('ERROR: No IG cookies found. Need to re-login first.');
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
    // Go to their latest post
    await page.goto(`https://www.instagram.com/${username}/`, { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Click first post
    const firstPost = await page.$('a[href*="/p/"]');
    if (!firstPost) {
      console.log('FAIL: No posts found');
      process.exit(1);
    }
    await firstPost.click();
    await page.waitForTimeout(3000);

    // Find comment input
    const commentInput = await page.$('[aria-label="Add a comment…"]') ||
                        await page.$('[placeholder="Add a comment…"]') ||
                        await page.$('textarea');
    
    if (!commentInput) {
      console.log('FAIL: No comment input found');
      process.exit(1);
    }

    await commentInput.click();
    await page.waitForTimeout(500);
    await page.keyboard.type(comment, { delay: 30 });
    await page.waitForTimeout(500);

    // Post comment
    const postBtn = await page.$('button:has-text("Post")');
    if (postBtn) await postBtn.click();
    else await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);
    console.log(`✅ Commented on @${username}'s latest post`);

  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();
