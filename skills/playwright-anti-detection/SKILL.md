# Anti-Detection Browser Automation with Playwright

Techniques learned from successfully automating Instagram, Twitter/X, and LinkedIn without triggering bot detection.

## Core Principles

The key to avoiding automation detection is to **behave like a human**, not a script.

## 1. Headed Browser (Not Headless)

```javascript
// ❌ BAD: Headless mode is easily detected
const browser = await chromium.launch({ headless: true });

// ✅ GOOD: Headed browser looks human
const browser = await chromium.launch({ headless: false });
```

For background automation, use a hidden desktop or VNC.

## 2. Patch navigator.webdriver

```javascript
// Critical: Remove the automation flag
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 }
});

const page = await context.newPage();

await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined
  });
});
```

This is the #1 detection method. Instagram, Twitter, and LinkedIn all check this.

## 3. Human-Like Mouse Movements

```javascript
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function humanLikeMouseMove(page, x, y) {
  // Move in a slight curve, not straight lines
  const steps = randomDelay(3, 8);
  const startX = randomDelay(100, 300);
  const startY = randomDelay(100, 300);
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (x - startX) * progress + randomDelay(-10, 10);
    const currentY = startY + (y - startY) * progress + randomDelay(-10, 10);
    await page.mouse.move(currentX, currentY);
    await page.waitForTimeout(randomDelay(20, 80));
  }
}
```

## 4. Random Delays Between Actions

```javascript
// ❌ BAD: Instant actions
await page.click('button');
await page.fill('input', 'text');

// ✅ GOOD: Variable delays
await page.click('button');
await page.waitForTimeout(randomDelay(2000, 4000));
await page.fill('input', 'text');
await page.waitForTimeout(randomDelay(1000, 2000));
```

## 5. Human-Like Typing

```javascript
async function typeHumanLike(page, text) {
  for (const char of text) {
    await page.keyboard.press(char);
    await page.waitForTimeout(randomDelay(30, 120));
  }
}

// Usage
await typeHumanLike(page, 'Hello, this looks amazing!');
```

## 6. Custom Browser Args

```javascript
const browser = await chromium.launch({
  headless: false,
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    '--window-size=1280,720',
    '--start-maximized'
  ]
});
```

## 7. Find Exact Button Text

```javascript
// ❌ BAD: Generic selector may match wrong button
await page.click('button:has-text("Post")');

// ✅ GOOD: Loop all buttons to find exact text match
const buttons = await page.$$('button');
for (const btn of buttons) {
  const text = await btn.textContent();
  if (text && text.trim() === 'Post') {
    await btn.click();
    break;
  }
}
```

## 8. Realistic Viewport & User Agent

```javascript
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});
```

## 9. Scroll Naturally

```javascript
async function humanScroll(page, pixels) {
  const steps = randomDelay(5, 10);
  const perStep = pixels / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, perStep + randomDelay(-20, 20));
    await page.waitForTimeout(randomDelay(50, 150));
  }
}
```

## 10. Handle Popups Gracefully

```javascript
page.on('dialog', async dialog => {
  console.log('Dialog:', dialog.message());
  await dialog.accept();
});
```

## Complete Anti-Detection Template

```javascript
const { chromium } = require('playwright');

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const browser = await chromium.launch({
    headless: false, // IMPORTANT
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  // Patch webdriver detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
  });

  // Add cookies if available
  // await context.addCookies(cookies);

  try {
    await page.goto('https://instagram.com', { 
      timeout: 20000, 
      waitUntil: 'domcontentloaded' 
    });
    
    await sleep(randomDelay(2000, 4000));

    // Your automation here
    // Use randomDelay() between every action
    // Use typeHumanLike() for text input
    // Use humanScroll() for scrolling
    // Use humanLikeMouseMove() for mouse movements

  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
```

## Platform-Specific Notes

### Instagram
- **Critical:** `navigator.webdriver` patch
- **Critical:** Headed browser
- **Critical:** Exact button text matching (avoid "Share Post")
- Emojis work fine
- Rate limit: ~10 comments/hour safely

### Twitter/X
- **Critical:** No emojis in `keyboard.press()` — breaks script
- **Critical:** Short comments (280 char limit)
- Use `@handle` in comment text
- Rate limit: ~10 tweets/hour safely

### LinkedIn
- **Critical:** Cookies need `sameSite` fix (`unspecified` → `Lax`, `no_restriction` → `None`)
- Most small brands don't post — script should skip gracefully
- Professional tone needed
- Rate limit: ~10 comments/hour safely

## Key Takeaways

1. **Never use headless mode** for social media
2. **Always patch `navigator.webdriver`**
3. **Add random delays** between every action
4. **Type like a human** (variable speed, not instant)
5. **Move mouse in curves**, not straight lines
6. **Match exact button text**, not partial selectors
7. **Handle errors gracefully** — skip if element not found
8. **Respect rate limits** — 10 actions/hour per platform max

## Common Mistakes

- ❌ Using `page.type()` instead of `keyboard.press()` with delays
- ❌ Using `headless: true`
- ❌ Forgetting `navigator.webdriver` patch
- ❌ Using generic selectors like `button:has-text("Post")`
- ❌ No delays between actions
- ❌ Straight-line mouse movements
- ❌ Not handling popups/dialogs

## Resources

- [Playwright Docs](https://playwright.dev)
- [Instagram Automation Guide](https://github.com/davidteather/instagram-scraper)
- [Bot Detection Research](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
