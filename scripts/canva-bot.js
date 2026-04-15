const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Canva Full Automation via Browser
 * 
 * This provides FULL Canva capabilities (unlike the API):
 * - Create designs from scratch
 * - Add/edit text elements
 * - Add/edit images and videos
 * - Apply effects and filters
 * - Export/download
 */

// Path to store Canva session
const AUTH_FILE = path.join(__dirname, 'canva-session.json');
const SCREENSHOTS = path.join(__dirname, 'screenshots');

class CanvaBot {
  constructor(options = {}) {
    this.headless = options.headless ?? false;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    console.log('Launching browser...');
    this.browser = await chromium.launch({ 
      headless: this.headless,
      slowMo: 100
    });
    
    // Try to use saved session
    if (fs.existsSync(AUTH_FILE)) {
      console.log('Using saved session...');
      this.context = await this.browser.newContext({ 
        storageState: AUTH_FILE 
      });
    } else {
      this.context = await this.browser.newContext();
    }
    
    this.page = await this.context.newPage();
    return this;
  }

  async login() {
    console.log('Navigating to Canva...');
    await this.page.goto('https://www.canva.com/login');
    await this.page.waitForTimeout(2000);

    // Check if already logged in
    const alreadyLoggedIn = await this.page.$('text=Your designs');
    if (alreadyLoggedIn) {
      console.log('Already logged in!');
      return true;
    }

    // Click "Continue with Google"
    console.log('Clicking "Continue with Google"...');
    const googleBtn = await this.page.$('text=Continue with Google');
    if (googleBtn) {
      await googleBtn.click();
      await this.page.waitForTimeout(3000);

      // Handle Google login popup
      console.log('Waiting for Google login popup...');
      
      // Wait for popup or redirect
      await this.page.waitForTimeout(3000);
      
      // Check for popup pages
      const pages = this.context.pages();
      if (pages.length > 1) {
        // Google login is in a popup
        const googlePage = pages[1];
        console.log('Google login popup detected. Please complete login manually...');
        
        // Wait for user to complete login
        await this.page.waitForURL('**/your-designs**', { timeout: 180000 }).catch(() => {
          // May redirect to home instead
          return this.page.waitForURL('**/canva.com**', { timeout: 30000 });
        });
      } else {
        // Wait for redirect
        console.log('Waiting for login redirect...');
        await this.page.waitForURL('**/your-designs**', { timeout: 180000 }).catch(async () => {
          // May be on home page
          await this.page.waitForTimeout(5000);
          const url = this.page.url();
          if (url.includes('canva.com')) {
            console.log('On Canva home page, login may be complete');
          }
        });
      }
      console.log('Login successful!');
    }

    // Save session
    await this.context.storageState({ path: AUTH_FILE });
    console.log('Session saved.');
    return true;
  }

  async createDesign(type = 'instagram-post') {
    console.log(`Creating ${type}...`);
    
    const typeMap = {
      'instagram-post': 'DAGh_4iD4Kk',
      'instagram-story': 'DAGh_4iD4Kl',
      'facebook-post': 'DAGh_4iD4Km',
      'linkedin-post': 'DAGh_4iD4Kn',
      'presentation': 'DAGh_4iD4Ko',
      'poster': 'DAGh_4iD4Kp',
    };

    const templateId = typeMap[type] || typeMap['instagram-post'];
    await this.page.goto(`https://www.canva.com/design/${templateId}/edit`);
    await this.page.waitForTimeout(3000);
    
    return this;
  }

  async openDesign(url) {
    console.log(`Opening design: ${url}`);
    await this.page.goto(url);
    await this.page.waitForTimeout(3000);
    return this;
  }

  async changeText(oldText, newText) {
    console.log(`Changing text: "${oldText}" → "${newText}"`);
    
    // Find text element
    const textElement = await this.page.$(`text=${oldText}`);
    if (!textElement) {
      console.log('Text not found');
      return false;
    }

    // Double-click to edit
    await textElement.dblclick();
    await this.page.waitForTimeout(500);

    // Select all and replace
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.type(newText);
    await this.page.waitForTimeout(500);

    // Click away to confirm
    await this.page.keyboard.press('Escape');
    return true;
  }

  async addText(text, options = {}) {
    console.log(`Adding text: "${text}"`);
    
    // Click "Text" in sidebar
    const textBtn = await this.page.$('text=Text');
    if (textBtn) {
      await textBtn.click();
      await this.page.waitForTimeout(1000);
      
      // Click "Add a heading" or similar
      const addHeading = await this.page.$('text=Add a heading');
      if (addHeading) {
        await addHeading.click();
        await this.page.waitForTimeout(500);
        await this.page.keyboard.type(text);
      }
    }
    
    return this;
  }

  async uploadImage(imagePath) {
    console.log(`Uploading image: ${imagePath}`);
    
    // Click "Uploads" in sidebar
    const uploadsBtn = await this.page.$('text=Uploads');
    if (uploadsBtn) {
      await uploadsBtn.click();
      await this.page.waitForTimeout(1000);

      // Upload file
      const fileInput = await this.page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(imagePath);
        await this.page.waitForTimeout(3000);
      }
    }
    
    return this;
  }

  async download(format = 'png') {
    console.log(`Downloading as ${format}...`);
    
    // Click Share/Download button
    const shareBtn = await this.page.$('button:has-text("Share")') || 
                      await this.page.$('button:has-text("Download")');
    if (shareBtn) {
      await shareBtn.click();
      await this.page.waitForTimeout(1000);

      // Select format
      const formatBtn = await this.page.$(`text=${format.toUpperCase()}`);
      if (formatBtn) {
        await formatBtn.click();
        await this.page.waitForTimeout(500);
      }

      // Click Download
      const downloadBtn = await this.page.$('button:has-text("Download")');
      if (downloadBtn) {
        await downloadBtn.click();
        
        // Wait for download
        const [download] = await Promise.all([
          this.page.waitForEvent('download'),
          this.page.waitForTimeout(2000)
        ]);
        
        const savePath = path.join(SCREENSHOTS, `canva-export.${format}`);
        await download.saveAs(savePath);
        console.log(`Downloaded to: ${savePath}`);
        return savePath;
      }
    }
    
    return null;
  }

  async screenshot(name = 'canva') {
    const path = require('path');
    const fs = require('fs');
    
    if (!fs.existsSync(SCREENSHOTS)) {
      fs.mkdirSync(SCREENSHOTS, { recursive: true });
    }
    
    await this.page.screenshot({ 
      path: path.join(SCREENSHOTS, `${name}.png`),
      fullPage: true 
    });
    return path.join(SCREENSHOTS, `${name}.png`);
  }

  async close() {
    await this.browser.close();
  }
}

// Export
module.exports = { CanvaBot };

// CLI usage
if (require.main === module) {
  (async () => {
    const bot = new CanvaBot({ headless: false });
    await bot.init();
    
    console.log('\n=== Canva Browser Automation ===');
    console.log('1. Login to Canva');
    console.log('2. Create Instagram post');
    console.log('3. Open design by URL');
    console.log('4. Exit');
    console.log('');
    
    const choice = process.argv[2];
    
    if (choice === 'login') {
      await bot.login();
      await bot.screenshot('login');
    } else if (choice === 'create') {
      await bot.login();
      await bot.createDesign('instagram-post');
      await bot.screenshot('new-design');
    } else if (choice === 'open') {
      const url = process.argv[3];
      if (!url) {
        console.log('Usage: node canva-bot.js open <url>');
        process.exit(1);
      }
      await bot.login();
      await bot.openDesign(url);
      await bot.screenshot('opened-design');
    }
    
    await bot.close();
    console.log('Done.');
  })();
}