---
name: postoria
description: "Schedule social media posts via Postoria using Playwright browser automation. Use when user wants to schedule content, check scheduled posts, or manage social accounts on Postoria."
version: 1.2.0
---

# Postoria Scheduler

Schedule posts to Instagram, Facebook, LinkedIn, and other platforms via Postoria web app using Playwright browser automation.

## When to Use

- User wants to schedule a post to social media
- User wants to check scheduled posts
- User wants to connect social accounts
- User says "schedule this" or "post to Instagram"

## Credentials

Stored in TOOLS.md under `API Keys > Postoria`:
- Email: `theorangematrixteam@gmail.com`
- Password: `OrangematrixPostoria123`

## Auth State

After first login, auth state is saved to:
`scripts/postoria-auth.json`

This allows reusing the session without re-logging in.

## Connected Accounts (5)

| Platform | Account |
|----------|---------|
| Instagram | The Orange Matrix |
| Pinterest | (connected) |
| LinkedIn | (2 accounts) |
| X (Twitter) | (1 account) |

## UI Structure (Discovered)

### Post Dialog Elements:
1. **Networks button** - "0 networks" (click to open selector)
2. **Accounts button** - "0 accounts" (click to open selector)
3. **File input** - for image/video upload
4. **Caption textarea** - for post text
5. **"Publish at" input** - text field, placeholder: "MM/DD/YYYY hh:mm aa"
6. **Action buttons** - "Close & keep as draft" and "Publish now"/"Schedule"

### Key Findings:
- Button shows "Publish now" by default
- Button changes to "Schedule" when date/time is filled correctly
- Date format: `MM/DD/YYYY hh:mm aa` (e.g., "04/07/2026 10:35 AM")
- Must dispatch `input` and `change` events on date field for button to update
- Use `force: true` on clicks due to overlay issues
- Account selector shows "The Orange Matrix" with email

## Current Status

**Working:**
- Login with saved session
- Navigate to Posts
- Click New to open dialog
- Select Networks > Instagram
- Select Accounts > theorangematrix
- Set schedule time (MM/DD/YYYY hh:mm aa format)
- Add caption
- Button changes to "Schedule" when time is set
- Schedule button click works

**NOT Working:**
- Image upload fails (file selected but never completes uploading)
- Upload shows progress bar but never finishes (waited 90+ seconds)
- Posts appear in Drafts, not Scheduled

**Possible causes:**
1. Postoria detecting automation and blocking uploads
2. Network/firewall issue
3. Need different upload method (maybe click Browse button first)

## Manual Workflow (from user)

1. Open Posts page
2. Click New
3. Enter date FIRST
4. Upload image (wait for completion)
5. Add caption
6. Click Networks > Instagram
7. Click Accounts > theorangematrix
8. Click "Schedule 1 post"
9. Click Close

## Successful Workflow (Partial)

```javascript
// 1. Navigate to Posts
await page.goto('https://app.postoria.io/posts');

// 2. Click New
await page.click('button:has-text("New")');

// 3. Open account selector
await page.click('button:has-text("account")', { force: true });

// 4. Click on Instagram account (look for "The Orange Matrix")
// TODO: Verify this actually selects the account

// 5. Close selector
await page.keyboard.press('Escape');

// 6. Upload image
const fileInput = await page.$('input[type="file"]');
await fileInput.setInputFiles(imagePath);

// 7. Add caption
const textarea = await page.$('[role="dialog"] textarea');
await textarea.fill(caption, { force: true });

// 8. Set schedule time
const dateInput = await page.$('input[placeholder*="MM/DD/YYYY"]');
await dateInput.fill('04/07/2026 10:35 AM', { force: true });
await dateInput.evaluate(el => {
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.keyboard.press('Enter');

// 9. Click Schedule (button changes from "Publish now")
await page.click('button:has-text("Schedule")', { force: true });
```

## Troubleshooting

- Check if dialog shows "1 networks 1 accounts" (accounts selected)
- Check if image is uploaded
- Check if caption is filled
- Check if date format is correct
- If dialog doesn't close after Schedule, look for validation errors

## Next Steps for Development

1. Debug account selection - verify "1 accounts" shows after selection
2. Check for hidden validation errors in dialog
3. Try without account selection - maybe default account is used
4. Check if Postoria requires additional setup for scheduling