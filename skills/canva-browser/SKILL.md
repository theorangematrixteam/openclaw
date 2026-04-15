# Canva Automation Skill (Browser-Based)

Full Canva automation via browser (Playwright) - can do everything you can do manually.

## Capabilities

Unlike the official Canva API, browser automation can:
- Create designs from scratch
- Add/edit text elements
- Add/edit images and videos
- Apply effects and filters
- Use all Canva features

## Setup

### Option 1: Use CanvaAutomationSuite (Python/Selenium)

```bash
# Clone the repo
git clone https://github.com/lukagoguadze2/CanvaAutomationSuite
cd CanvaAutomationSuite

# Install dependencies
pip install undetected-chromedriver selenium beautifulsoup4

# Run
python CanvaBot.py
```

### Option 2: Create Playwright-based Skill

Build our own automation using the existing Playwright setup.

## Files

- `scripts/canva-bot.py` - Python automation script
- `scripts/canva-session.json` - Saved browser session

## Requirements

- Canva account (Google login)
- Chrome/Chromium browser

## Workflow

1. Login to Canva (via Google)
2. Open or create design
3. Modify elements (text, images)
4. Export/download

## Status

- [ ] Install CanvaAutomationSuite
- [ ] Configure Google account for login
- [ ] Create Playwright equivalent
- [ ] Test basic operations