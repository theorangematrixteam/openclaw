const { chromium } = require('playwright');
const fs = require('fs');

// LinkedIn Comment Script
// Usage: node linkedin-comment.js <company-name> "<comment>"

const companyName = process.argv[2];
const comment = process.argv[3];

if (!companyName || !comment) {
  console.log('Usage: node linkedin-comment.js <company-name> "<comment>"');
  process.exit(1);
}

const COOKIES_PATH = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\linkedin-cookies.json';

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
    console.log('ERROR: No LinkedIn cookies found. Export from browser first.');
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
    // Search for company page
    console.log(`Searching for ${companyName}...`);
    await page.goto(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(companyName)}`, { 
      timeout: 20000, 
      waitUntil: 'domcontentloaded' 
    });
    await page.waitForTimeout(randomDelay(3000, 5000));

    // Click first company result
    const companyLink = await page.$('a[href*="/company/"]');
    if (!companyLink) {
      console.log('FAIL: Company not found');
      process.exit(1);
    }
    await companyLink.click();
    await page.waitForTimeout(randomDelay(3000, 5000));

    // Scroll to posts section
    await page.mouse.wheel(0, randomDelay(500, 1000));
    await page.waitForTimeout(randomDelay(1000, 2000));

    // Click first post
    const firstPost = await page.$('[data-testid="feed-shared-update-v2__commentary"]');
    if (!firstPost) {
      console.log('SKIP: No posts found — company may not be active on LinkedIn');
      process.exit(0);
    }

    // Click comment button
    const commentBtn = await page.$('button[aria-label*="Comment"]') ||
                       await page.$('button:has-text("Comment")');
    if (!commentBtn) {
      console.log('FAIL: No comment button found');
      process.exit(1);
    }
    await commentBtn.click();
    await page.waitForTimeout(randomDelay(2000, 4000));

    // Find comment input
    const commentInput = await page.$('[contenteditable="true"]') ||
                        await page.$('textarea');
    
    if (!commentInput) {
      console.log('FAIL: No comment input found');
      process.exit(1);
    }

    await commentInput.click();
    await page.waitForTimeout(randomDelay(500, 1000));

    // Type comment
    for (const char of comment) {
      await page.keyboard.press(char);
      await sleep(randomDelay(30, 100));
    }
    await page.waitForTimeout(randomDelay(500, 1000));

    // Post comment
    const postBtn = await page.$('button:has-text("Post")');
    if (postBtn) {
      await postBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(randomDelay(3000, 5000));
    console.log(`✅ Comment posted on ${companyName}'s LinkedIn post`);

  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();
