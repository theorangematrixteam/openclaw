const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Try Dandelion Jewels IG page for bio/contact
  const page = await browser.newPage();
  try {
    await page.goto('https://www.instagram.com/dandelionjewels/', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    // Get all link/anchor elements that might contain contact
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.map(a => ({ href: a.href, text: a.innerText.substring(0, 50) }));
    });
    
    // Get page source for any email/phone in bio
    const html = await page.evaluate(() => document.documentElement.innerHTML.substring(0, 5000));
    const emails = html.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const phones = html.match(/[\d]{10,}/g) || [];
    
    console.log('=== DANDELION JEWELS ===');
    console.log('Emails:', [...new Set(emails)].join(', '));
    console.log('Phones:', [...new Set(phones)].join(', '));
    console.log('Links:', JSON.stringify(links.filter(l => l.href.includes('mailto') || l.href.includes('tel') || l.href.includes('dandelion')), null, 2));
  } catch(e) {
    console.log('Dandelion error:', e.message.substring(0, 80));
  }
  await page.close();
  
  await browser.close();
})();