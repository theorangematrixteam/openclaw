---
name: outbound-database
description: Find and verify potential client entries for the Orange Matrix outbound database in Google Sheets. Checks Instagram follower counts first, then scrapes website contact info, verifies all data, and adds clean entries. No blank fields allowed.
---

# Outbound Database Finding Skill

## Purpose
Find potential clients for Orange Matrix and add verified entries to the Outbound Google Sheet.

## Target Audience
Early-stage product brands (clothing, jewelry, D2C products) with **under 10k Instagram followers** that need content + social media presence but don't have in-house teams.

## Sheet Details
- **Sheet ID:** `1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ`
- **Tab 1:** `Outbound` — lead database
- **Tab 2:** `Outreach Log` — message tracking and follow-up scheduling

### Outbound Tab Columns (A-S):
  1. Category — `Clothing:Streetwear` / `Clothing:Ethnic` / `Jewelry:Silver` / `Product:Candles` / `Product:Perfume` etc.
  2. Company
  3. Industry (subcategory description)
  4. First Name
  5. Last Name
  6. Title
  7. Email
  8. Phone (NO + sign — Sheets interprets it as formula; use `91 XXXXXXXXXX`)
  9. LinkedIn
  10. Instagram
  11. Website
  12. Funding
  13. Why They Need Us
  14. Priority (High / Medium / Low)
  15. Status — `New` / `Contacted` / `Replied` / `Follow-up 1` / `Follow-up 2` / `Breakup` / `Not Interested` / `In Conversation` / `Closed Won` / `Closed Lost`
  16. Last Contacted — date of last outreach (YYYY-MM-DD)
  17. Next Step — what to do next
  18. Notes
  19. Source

### Outreach Log Tab Columns (A-L):
  1. Date — when action was taken (YYYY-MM-DD)
  2. Company
  3. Channel — Email / Instagram / WhatsApp
  4. Direction — Outbound / Reply / Follow-up
  5. Message Type — Initial / Follow-up 1 / Follow-up 2 / Breakup
  6. Subject — email subject or DM first line
  7. Message Summary — brief summary of what was sent
  8. Status — Sent / Delivered / Opened / Replied / No Reply / Bounced
  9. Reply Summary — brief summary of their reply (if any)
  10. Next Action — what to do next
  11. Next Action Date — when to follow up (YYYY-MM-DD)
  12. Notes

### Follow-up Schedule:
- **Day 1:** Initial outreach
- **Day 4:** Follow-up 1 (generates 40-50% of total replies)
- **Day 9:** Follow-up 2
- **Day 14:** Breakup email ("closing the loop")
- **Best sending:** Tue-Thu, 9-11 AM or 1-3 PM IST

## Strict Process (NO SHORTCUTS)

### Step 0: Bulk Screen (NEW — saves time)
Before deep-diving on any brand, do a quick bulk screen:
1. **IG liveness check** — load 10-15 candidate Instagram pages, extract follower counts
2. **Website liveness check** — load each candidate's website, check if it loads, grab any emails/phones visible on homepage
3. **Reject immediately** if: IG >10k followers, website dead, IG profile not found with multiple handle attempts
4. Only proceed to Steps 1-5 for brands that pass this screen

This prevents wasting 15+ minutes on brands that are dead or too big.

### Step 1: Find Candidate Brands
- Search for new/small brands in the target category
- Use web search to discover recently launched D2C brands
- Look for press coverage, D2C directories, startup news
- Also check brand websites for their actual Instagram link (handles often differ from brand name)

### Step 2: Instagram Follower Verification (MANDATORY FIRST)
- Use Playwright to scrape `instagram.com/{handle}` and read the `og:description` meta tag
- Extract follower count from the meta tag (format: "X Followers, Y Following, Z Posts")
- **If followers > 10,000 → REJECT. Do not proceed with this brand.**
- **If followers ≤ 10,000 → Proceed to Step 3**
- **If handle not found → check brand's website for their actual IG link** (handles often differ)
- **If 0 posts + low followers → likely dead account, reject**

### Step 3: Website Contact Scrape
- Fetch the brand's website and contact pages
- Check these pages for contact info:
  - `/pages/contact` or `/pages/contact-us`
  - `/policies/contact-information`
  - `/pages/about-us` or `/pages/about`
  - `/policies/privacy-policy` (often has business email)
  - `/policies/refund-policy` (sometimes has phone/email)
  - Footer of homepage (legal entity name, address, email)
- Extract: email, phone, founder name, legal entity, address
- **If website is down → note in the sheet but still add brand if IG is active**

### Step 4: Founder/Decision Maker Search
- Search LinkedIn for brand name + founder/CEO/owner
- Search web for "{brand name} founder" or "{brand name} owner India"
- If founder name found, try to find their LinkedIn profile
- If not found publicly, mark as TBD — but ONLY after genuine search effort

### Step 5: Cross-Verify All Data
- **Every field must be verified from a source** — no guessing
- Email must come from the brand's own website
- Phone must come from the brand's own website
- Follower count must come from Playwright Instagram scrape
- Founder name must come from LinkedIn, news article, or website about page
- If data cannot be verified, note what's missing and why

### Step 6: Write to Sheet
- Use `gog sheets append` via Node.js `execFileSync` (avoids shell quoting issues)
- **Phone numbers: NEVER include + sign** (use "91 XXXXXXXXXX" not "+91 XXXXXXXXXX")
- Apply all Data Quality Rules below BEFORE pushing

## Data Quality Rules (ENFORCED — learned from batch 1-3 cleanup)

1. **No bare "TBD"** — every TBD MUST include an explanation and next action
   - ✅ `TBD - No phone found on website; DM on Instagram`
   - ✅ `TBD - Brand just launched, no website yet; contact via SGBL Group`
   - ❌ `TBD`
   - ❌ `TBD - no LinkedIn found` (vague, no action)

2. **No emails in wrong fields** — emails go in Email column (G), never in Last Name (E) or Notes (R)
   - If founder name unknown but email found, put email in Email column, note in Notes: "Founder email likely X"

3. **Category format: Category:Subcategory** — always use this format
   - ✅ `Clothing:Streetwear`, `Jewelry:Silver`, `Product:Candles`, `Product:Perfume`
   - ❌ `Clothing`, `Jewelry`, `Product:Candles/Home Decor`

4. **Status must be "New"** for all fresh entries
   - ❌ "Not Contacted" (legacy value from batch 1)
   - ❌ "New" in wrong column (was leaking to Last Contacted)

5. **Phone format: "91 XXXXXXXXXX"** — no + sign, no country code prefix with +
   - ✅ `91 9717773719`
   - ❌ `+91 9717773719`
   - ❌ `917799000069` (hard to read without spaces)

6. **LinkedIn format** — URL preferred, but descriptive text is OK if no URL exists
   - ✅ `https://linkedin.com/in/shrutigochhwal`
   - ✅ `Registered as Corallista Lifestyle Pvt Ltd (CIN: U74999MH2022PTC387083)`
   - ❌ `TBD - SGBL Group LinkedIn: https://...` (put the URL directly or in Notes)

7. **Priority rules:**
   - **High** — brand has verified contact info AND clear need for our services
   - **Medium** — brand has some contact info, decent fit
   - **Low** — brand has minimal verifiable info (3+ TBD fields), weak contact options

8. **Flag suspicious claims in Notes** — e.g. "3L+ customers" but only 63 IG followers

9. **Instagram handle must be verified** — check it actually loads on Instagram; try brand website's IG link if handle guess fails

10. **No empty cells** — fill every column. If info not found, use "TBD - [reason]; [how to find]"

11. **Source column must list actual sources** — not just "web search"
    - ✅ `Website contact page + Instagram verification + ANI News article`
    - ❌ `Web search`

## Push Script Template

```javascript
const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const brands = [
  {
    category: 'Clothing:Streetwear',
    company: 'Brand Name',
    industry: 'Streetwear',
    firstName: 'John',
    lastName: 'Doe',
    title: 'Founder',
    email: 'contact@brand.com',
    phone: '91 9876543210',
    linkedin: 'https://linkedin.com/in/johndoe',
    instagram: 'https://www.instagram.com/brand/',
    website: 'https://brand.com',
    funding: 'Bootstrapped',
    whyNeedUs: '1,234 IG followers — needs content creation and social media management',
    priority: 'High',
    status: 'New',
    lastContacted: '',
    nextStep: 'Email contact@brand.com',
    notes: 'Based in City. Key detail. Follower count.',
    source: 'Website contact page + Instagram verification + LinkedIn search'
  }
];

for (const b of brands) {
  const values = [
    b.category, b.company, b.industry, b.firstName, b.lastName, b.title,
    b.email, b.phone, b.linkedin, b.instagram, b.website, b.funding,
    b.whyNeedUs, b.priority, b.status, b.lastContacted, b.nextStep, b.notes, b.source
  ];
  try {
    const result = execFileSync(gog, [
      'sheets', 'append', sheetId, 'Outbound!A:S',
      '--values-json', JSON.stringify([values]),
      '--insert', 'INSERT_ROWS',
      '--no-input'
    ], { encoding: 'utf8' });
    console.log(`✅ ${b.company} — ${result.trim()}`);
  } catch(e) {
    console.log(`❌ ${b.company} — ERROR: ${e.message.substring(0, 200)}`);
  }
}
```

## Common Pitfalls (learned from batches 1-3)

1. **Wrong IG handle** — always check brand's website for their actual IG link before guessing
2. **Dead websites** — run bulk URL liveness check first (Step 0) to avoid wasting time
3. **Shell quoting** — use `execFileSync` with `--values-json`, never pass JSON through shell
4. **Phone + sign** — Sheets interprets `+` as formula; always use `91 XXXXXXXXXX`
5. **0 posts on IG** — account is likely inactive even if followers exist; reject
6. **Inflated claims** — "3L+ customers" with 63 followers is a red flag; note in Notes
7. **Status column** — only "New" for fresh entries; don't use "Not Contacted"
8. **TBD without context** — always explain why and how to find the missing info

## Batch Sizes
- Default: 5 brands per batch (quality over quantity)
- Max: 10 brands if requested, but verification quality must not drop

## ICP Reference
Full ICP saved at: `memory/orange-matrix-icp.md`