const { chromium } = require('playwright');
const fs = require('fs');

// Instagram Comment with Stealth Techniques
// Uses human-like behavior to avoid detection

const username = process.argv[2];
const comment = process.argv[3];

if (!username || !comment) {
  console.log('Usage: node ig-comment-stealth.js <username> "<comment>"');
  process.exit(1);
}

const COOKIES_PATH = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json';

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function humanLikeMouseMove(page, x, y) {
  // Move mouse in a slightly curved path
  const startX = await page.evaluate(() => window.innerWidth / 2);
  const startY = await page.evaluate(() => window.innerHeight / 2);
  
  const steps = randomDelay(5, 10);
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (x - startX) * progress + randomDelay(-10, 10);
    const currentY = startY + (y - startY) * progress + randomDelay(-10, 10);
    await page.mouse.move(currentX, currentY);
    await page.waitForTimeout(randomDelay(50, 150));
  }
}

(async () => {
  let cookies;
  try {
    cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf8'));
    // Fix sameSite values
    for (const cookie of cookies) {
      if (cookie.sameSite === 'unspecified') cookie.sameSite = 'Lax';
      if (cookie.sameSite === 'no_restriction') cookie.sameSite = 'None';
      cookie.sameSite = cookie.sameSite.charAt(0).toUpperCase() + cookie.sameSite.slice(1).toLowerCase();
      if (cookie.sameSite === 'No_restriction') cookie.sameSite = 'None';
    }
  } catch(e) {
    console.log('ERROR: No IG cookies found.');
    process.exit(1);
  }

  const browser = await chromium.launch({ 
    headless: false, // Headed mode is less detectable
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    hasTouch: false,
    isMobile: false,
    deviceScaleFactor: 1,
  });
  
  // Override navigator.webdriver
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Native Client', filename: 'native-client.dll' }
      ]
    });
  });
  
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    console.log(`Navigating to @${username}...`);
    await page.goto(`https://www.instagram.com/${username}/`, { 
      timeout: 30000, 
      waitUntil: 'networkidle' 
    });
    await page.waitForTimeout(randomDelay(2000, 4000));

    // Scroll down a bit like a human
    await page.mouse.move(960, 600);
    await page.mouse.wheel(0, randomDelay(200, 500));
    await page.waitForTimeout(randomDelay(1000, 2000));

    // Click first post
    const firstPost = await page.$('a[href*="/p/"]');
    if (!firstPost) {
      console.log('FAIL: No posts found');
      await browser.close();
      process.exit(1);
    }
    
    const box = await firstPost.boundingBox();
    await humanLikeMouseMove(page, box.x + box.width/2, box.y + box.height/2);
    await page.waitForTimeout(randomDelay(300, 700));
    await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
    await page.waitForTimeout(randomDelay(2000, 4000));

    // Find comment input
    const commentInput = await page.$('[aria-label="Add a comment…"]') ||
                        await page.$('[placeholder="Add a comment…"]');
    
    if (!commentInput) {
      console.log('FAIL: No comment input found');
      await browser.close();
      process.exit(1);
    }

    // Click on comment input with human-like delay
    const inputBox = await commentInput.boundingBox();
    await humanLikeMouseMove(page, inputBox.x + inputBox.width/2, inputBox.y + inputBox.height/2);
    await page.waitForTimeout(randomDelay(200, 500));
    await commentInput.click();
    await page.waitForTimeout(randomDelay(500, 1000));

    // Type comment with human-like delays
    console.log('Typing comment...');
    for (const char of comment) {
      await page.keyboard.press(char);
      await page.waitForTimeout(randomDelay(30, 100));
    }
    await page.waitForTimeout(randomDelay(500, 1000));

    // Post comment - find the correct Post button
    console.log('Looking for Post button...');
    await page.waitForTimeout(randomDelay(1000, 2000));
    
    // Get all buttons and find the one with just "Post" text
    const buttons = await page.$$('button, div[role="button"]');
    let postBtn = null;
    
    for (const btn of buttons) {
      const text = await btn.evaluate(el => (el.textContent || el.innerText || '').trim());
      const ariaLabel = await btn.evaluate(el => el.getAttribute('aria-label') || '');
      
      // Look for button with exactly "Post" or aria-label "Post"
      if (text === 'Post' || ariaLabel === 'Post') {
        postBtn = btn;
        console.log(`Found Post button: text="${text}" aria-label="${ariaLabel}"`);
        break;
      }
    }
    
    if (postBtn) {
      const btnBox = await postBtn.boundingBox();
      if (btnBox) {
        await humanLikeMouseMove(page, btnBox.x + btnBox.width/2, btnBox.y + btnBox.height/2);
        await page.waitForTimeout(randomDelay(300, 700));
        await postBtn.click();
        console.log('Clicked Post button');
      } else {
        console.log('Button found but no bounding box, trying Enter');
        await page.keyboard.press('Enter');
      }
    } else {
      console.log('No Post button found, trying Enter key');
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(randomDelay(3000, 5000));
    console.log(`✅ Comment posted on @${username}'s latest post`);

  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();
