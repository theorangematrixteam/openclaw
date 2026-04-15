---
name: instagram-fetcher
description: "Fetch Instagram posts/reels for content reference analysis. Use when user shares an Instagram link and wants to analyze the content. Requires Apify API key stored in TOOLS.md."
version: 1.0.0
---

# Instagram Content Fetcher

Fetch Instagram post/reel content using Apify API for reference analysis.

## When to Use

- User shares an Instagram post/reel URL
- User wants to analyze a competitor's content
- User wants to save a reference to their library
- User says "analyze this post" or "save this reference"

## API Key

Stored in TOOLS.md under `API Keys > Apify`:
```
$env:APIFY_API_KEY
```

## How to Use

### For Specific Post/Reel URLs

Use Instagram Profile & Post / Reel Scraper (Actor ID: headlessagent/instagram-profile-post-reel-scraper):

```powershell
$headers = @{"Content-Type" = "application/json"}
$body = '{"postUrls": ["https://www.instagram.com/p/SHORTCODE/"], "reelUrls": ["https://www.instagram.com/reel/SHORTCODE/"]}'
Invoke-RestMethod -Uri "https://api.apify.com/v2/acts/headlessagent~instagram-profile-post-reel-scraper/runs?token=API_KEY" -Method POST -Headers $headers -Body $body
```

Response includes:
- `defaultDatasetId` — use this to fetch results

Fetch results:
```powershell
Start-Sleep -Seconds 45
Invoke-RestMethod -Uri "https://api.apify.com/v2/datasets/DATASET_ID/items?token=API_KEY" -Method GET
```

Note: This actor needs ~45 seconds to complete before fetching results.

### For Profile URLs

Same actor works for profiles:
```powershell
$body = '{"usernames": ["username"]}'
```

### For Profile/Account Overviews

Use Instagram Profile Scraper:

```powershell
$body = '{"usernames": ["username"]}'
Invoke-RestMethod -Uri "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=API_KEY" -Method POST -ContentType "application/json" -Body $body
```

Returns:
- Profile info (followers, bio, etc.)
- Latest 12 posts with captions, images, likes

## Response Fields

### Post Scraper Returns:
- `shortcode` — Post identifier
- `url` — Post URL
- `type` — Image, Video, or Carousel
- `caption` — Full caption text
- `hashtags` — Extracted hashtags
- `mentions` — Usernames mentioned
- `likesCount` — Like count
- `commentsCount` — Comment count
- `imageUrl` — Direct image URL
- `ownerUsername` — Author username
- `timestamp` — Post date

### Profile Scraper Returns:
- `username`, `fullName`, `biography`
- `followersCount`, `followsCount`, `postsCount`
- `latestPosts[]` — Array of recent posts
- `profilePicUrl` — Profile picture

## Workflow for Reference Analysis

1. **Receive Instagram URL** from user
2. **Call Apify API** to fetch post data
3. **Get image/video URL** from response
4. **Use gemma4:26b** (vision model) to analyze the visual:
   - Hook pattern (first 3 seconds)
   - Visual style (colors, framing, typography)
   - Content format
   - Pacing and structure
   - CTA type
   - Why it works
5. **Store in reference library:**
   - `clients/[client]-references/[date]-[topic].md`
6. **Update brand preferences:**
   - Add learnings to `clients/[client].md`

## Fallback Options

If Apify returns empty or fails:

1. **Notify user:** "⚠️ Apify API failed to fetch this post. [Error details if available]"
2. **Ask user to screenshot and upload** — Analyze image with gemma4:26b
3. **Ask user to describe** — Store description + link
4. **Web search about the creator** — Get context without the post

## Error Notification

**Always notify user if API fails:**

```
⚠️ [API Name] API failed: [Error message]

Falling back to: [Option you're using]

[Ask user what they want to do]
```

**Example:**
```
⚠️ Apify Instagram Post Scraper failed: Empty response for shortcode DG0NnOJuBqE

Options:
1. Screenshot the post and upload it
2. Describe what you see in the post
3. I can search for similar content from this creator

Which would you prefer?
```

## Cost & Limits

- **Free tier:** $5/month credit
- **Post scraper:** ~$3 per 1,000 posts
- **Profile scraper:** ~$2.60 per 1,000 profiles
- **Coverage:** ~1,500 posts or ~1,900 profiles per month free

## Limitations

- Cannot fetch from private accounts
- May fail for some posts (Instagram blocking)
- Video analysis limited to thumbnails (not full video)
- Reels need manual viewing for pacing/structure

## Example Usage

**User shares:** "https://www.instagram.com/reel/DG0NnOJuBqE/"

**Agent:**
1. Extract shortcode: `DG0NnOJuBqE`
2. Call Post Scraper API
3. Get image URL from response
4. Analyze with gemma4:26b
5. Create reference file with analysis
6. Reply: "Added to reference library. Key elements: [hook style], [visual approach], [CTA type]."

---

**Skill Dependencies:**
- Apify API key in TOOLS.md
- gemma4:26b for vision analysis
- Reference library structure in `clients/[client]-references/`