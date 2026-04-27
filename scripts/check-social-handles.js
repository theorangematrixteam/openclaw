const { chromium } = require('playwright');

// Check for Twitter/X and LinkedIn handles for a brand
// Usage: node check-social-handles.js <website>

const website = process.argv[2];

if (!website) {
  console.log('Usage: node check-social-handles.js <website>');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    console.log(`Checking ${website}...`);
    await page.goto(website, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const pageContent = await page.content();
    const pageText = await page.evaluate(() => document.body.innerText);
    
    // Check for Twitter/X
    const twitterMatch = pageContent.match(/twitter\.com\/([a-zA-Z0-9_]+)/) ||
                        pageContent.match(/x\.com\/([a-zA-Z0-9_]+)/) ||
                        pageContent.match(/href="[^"]*twitter\.com\/([^"?\/]+)/);
    
    // Check for LinkedIn
    const linkedinMatch = pageContent.match(/linkedin\.com\/company\/([a-zA-Z0-9-]+)/) ||
                         pageContent.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
    
    console.log('\nResults:');
    console.log(`  Twitter/X: ${twitterMatch ? twitterMatch[1] : 'Not found'}`);
    console.log(`  LinkedIn: ${linkedinMatch ? linkedinMatch[1] : 'Not found'}`);
    
  } catch(e) {
    console.log('Error:', e.message.substring(0, 100));
  } finally {
    await browser.close();
  }
})();
