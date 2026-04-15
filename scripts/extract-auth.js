const { chromium } = require('playwright');
const path = require('path');

/**
 * Direct GraphQL API approach
 */

(async () => {
  const authPath = path.join(__dirname, 'postoria-auth.json');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  
  // Capture the GraphQL mutation for creating a post
  let createPostMutation = null;
  
  page.on('request', req => {
    if (req.url().includes('graphql') && req.method() === 'POST') {
      const postData = req.postData();
      if (postData && postData.includes('createPost')) {
        createPostMutation = postData;
        console.log('\n=== CREATE POST MUTATION ===');
        console.log(postData);
      }
    }
  });
  
  try {
    console.log('Loading Posts page...');
    await page.goto('https://app.postoria.io/posts', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Try to extract cookies from the session
    const cookies = await context.cookies();
    console.log('\n=== COOKIES ===');
    cookies.forEach(c => {
      if (c.name.includes('session') || c.name.includes('token') || c.name.includes('auth')) {
        console.log(`${c.name}: ${c.value.slice(0, 50)}...`);
      }
    });
    
    // Get localStorage
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key.includes('token') || key.includes('auth') || key.includes('user')) {
          items[key] = window.localStorage.getItem(key);
        }
      }
      return items;
    });
    
    console.log('\n=== LOCAL STORAGE ===');
    console.log(JSON.stringify(localStorage, null, 2));
    
    // Click New to see the mutation
    console.log('\n=== Clicking New to capture mutation ===');
    await page.click('button:has-text("New")');
    await page.waitForTimeout(5000);
    
    console.log('\nDone.');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();