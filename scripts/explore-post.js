const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  
  const context = await browser.newContext({
    storageState: authPath
  });
  const page = await context.newPage();
  
  try {
    console.log('Navigating to Postoria...');
    await page.goto('https://app.postoria.io/', { waitUntil: 'domcontentloaded' });
    
    // Wait for app to load
    await page.waitForTimeout(8000);
    
    // Get full HTML structure
    const html = await page.content();
    fs.writeFileSync(path.join(__dirname, 'page-source.html'), html);
    console.log('Saved page source to page-source.html');
    console.log('HTML length:', html.length);
    
    // Get all elements
    const allElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const result = {
        buttons: [],
        links: [],
        inputs: [],
        divs: []
      };
      
      elements.forEach(el => {
        const tag = el.tagName.toLowerCase();
        const text = el.textContent?.trim().slice(0, 50);
        const className = el.className?.toString();
        
        if (tag === 'button') {
          result.buttons.push({ text, className: className?.slice(0, 50) });
        } else if (tag === 'a') {
          result.links.push({ text, href: el.getAttribute('href') });
        } else if (tag === 'input') {
          result.inputs.push({ type: el.type, placeholder: el.placeholder });
        }
      });
      
      return result;
    });
    
    console.log('\nButtons:', allElements.buttons.length);
    allElements.buttons.forEach((b, i) => console.log(`  ${i}: "${b.text}" (${b.className})`));
    
    console.log('\nLinks:', allElements.links.length);
    allElements.links.forEach((l, i) => console.log(`  ${i}: "${l.text}" -> ${l.href}`));
    
    console.log('\nInputs:', allElements.inputs.length);
    allElements.inputs.forEach((inp, i) => console.log(`  ${i}: ${inp.type} "${inp.placeholder}"`));
    
    // Look for any clickable area
    const clickAreas = await page.$$('div[onclick], div[role="button"], span[role="button"]');
    console.log('\nClick areas:', clickAreas.length);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'full-page.png'), 
      fullPage: true 
    });
    
    // Try to find create post by navigating directly
    console.log('\nTrying direct URL to posts...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'posts-page.png'), 
      fullPage: true 
    });
    
    const postsHtml = await page.content();
    fs.writeFileSync(path.join(__dirname, 'posts-source.html'), postsHtml);
    console.log('Saved posts page source');
    
    // Wait
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'error.png'), 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();