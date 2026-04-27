const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-cookies.json', 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    console.log('Opening BITCHN profile...');
    await page.goto('https://www.instagram.com/bitchn.official/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Take screenshot of profile
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-profile.png' });
    console.log('Screenshot saved: ig-profile.png');
    
    // Click first post
    const firstPost = await page.$('a[href*="/p/"]');
    if (!firstPost) {
      console.log('FAIL: No posts found');
      await browser.close();
      return;
    }
    await firstPost.click();
    await page.waitForTimeout(3000);
    
    // Screenshot of post
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-post.png' });
    console.log('Screenshot saved: ig-post.png');
    
    // Find comment input
    const commentInput = await page.$('[aria-label="Add a comment…"]') ||
                        await page.$('[placeholder="Add a comment…"]') ||
                        await page.$('textarea');
    
    if (!commentInput) {
      console.log('FAIL: No comment input found');
      // Take screenshot to debug
      await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-debug.png' });
      console.log('Debug screenshot saved: ig-debug.png');
      await browser.close();
      return;
    }

    console.log('Found comment input, typing...');
    await commentInput.click();
    await page.waitForTimeout(500);
    const comment = "The quality here is next level. BITCHN is doing something special — we'd love to create a reel for you. Reach out if interested.";
    await page.keyboard.type(comment, { delay: 30 });
    await page.waitForTimeout(500);

    // Post comment
    const postBtn = await page.$('button:has-text("Post")');
    if (postBtn) {
      console.log('Clicking Post button...');
      await postBtn.click();
    } else {
      console.log('Pressing Enter...');
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(3000);
    
    // Screenshot after posting
    await page.screenshot({ path: 'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-after-post.png' });
    console.log('Screenshot saved: ig-after-post.png');
    
    console.log('Done!');

  } catch(e) {
    console.log('ERROR:', e.message.substring(0, 200));
  } finally {
    await browser.close();
  }
})();
