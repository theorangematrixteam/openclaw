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
- **Tab:** `Outbound`
- **Columns (A-S):**
  1. Category — Clothing / Jewelry / Product:subcategory
  2. Company
  3. Industry (subcategory)
  4. First Name
  5. Last Name
  6. Title
  7. Email
  8. Phone (NO + sign — Sheets interprets it as formula)
  9. LinkedIn
  10. Instagram
  11. Website
  12. Funding
  13. Why They Need Us
  14. Priority (High / Medium / Low)
  15. Status
  16. Last Contacted
  17. Next Step
  18. Notes
  19. Source

## Strict Process (NO SHORTCUTS)

### Step 1: Find Candidate Brands
- Search for new/small brands in the target category
- Use web search to discover recently launched D2C brands
- Look for press coverage, D2C directories, startup news

### Step 2: Instagram Follower Verification (MANDATORY FIRST)
- Use Playwright to scrape `instagram.com/{handle}` and read the `og:description` meta tag
- Extract follower count from the meta tag (format: "X Followers, Y Following, Z Posts")
- **If followers > 10,000 → REJECT. Do not proceed with this brand.**
- **If followers ≤ 10,000 → Proceed to Step 3**

### Step 3: Website Contact Scrape
- Fetch the brand's website
- Check these pages for contact info:
  - `/pages/contact` or `/pages/contact-us`
  - `/policies/contact-information`
  - `/pages/about-us` or `/pages/about`
  - `/policies/privacy-policy` (often has business email)
  - `/policies/refund-policy` (sometimes has phone/email)
  - Footer of homepage (legal entity name, address, email)
- Extract: email, phone, founder name, legal entity, address

### Step 4: Founder/Decision Maker Search
- Search LinkedIn for brand name + founder/CEO/owner
- Search web for "{brand name} founder" or "{brand name} owner India"
- If founder name found, try to find their LinkedIn profile
- If not found publicly, mark as "TBD" in first/last name — but ONLY after genuine search effort

### Step 5: Cross-Verify All Data
- **Every field must be verified from a source** — no guessing
- Email must come from the brand's own website
- Phone must come from the brand's own website
- Follower count must come from Playwright Instagram scrape
- Founder name must come from LinkedIn, news article, or website about page
- If data cannot be verified, note what's missing and why in Notes column

### Step 6: Write to Sheet
- Use `gog sheets append` or `gog sheets update` via Node.js `execFileSync` (avoids shell quoting issues)
- **Phone numbers: NEVER include + sign** (use "91 XXXXXXXXXX" not "+91 XXXXXXXXXX")
- **No blank fields** — if info genuinely not found, put "Not found" or "TBD" with explanation in Notes
- Status should always be "Not Contacted" for new entries
- Next Step should always be "Research and reach out" or specific outreach method

## Data Quality Rules

1. **Instagram handle must be verified** — check it actually loads on Instagram
2. **Follower count must be actual** — from Playwright scrape, not estimated
3. **Email must be from the brand's website** — not guessed from patterns
4. **Phone must be from the brand's website** — not from random directories
5. **Founder name must have a source** — LinkedIn, news article, or website
6. **No hallucinated data** — if you can't find it, say so in Notes
7. **No + sign in phone numbers** — breaks Google Sheets formulas
8. **No empty cells** — fill every column, even if just "TBD" with explanation

## Example Verified Entry
```
Category: Clothing
Company: Sharmeeli
Industry: Ethnic Wear
First Name: Shruti
Last Name: Gochhwal
Title: Founder
Email: contact@sharmeeli.in
Phone: 91 9717773719
LinkedIn: https://linkedin.com/in/shrutigochhwal
Instagram: https://instagram.com/sharmeeli.in
Website: https://sharmeeli.in
Funding: Bootstrapped
Why They Need Us: New D2C ethnic wear (1,478 IG followers); needs content and social buildout
Priority: High
Status: Not Contacted
Last Contacted: (blank for new)
Next Step: Call or DM
Notes: 1,478 followers; Forbes Asia 30 under 30; ex-Zappfresh co-founder; 9 Hauz Khas Village New Delhi
Source: IG follower check + Website contact page
```

## Batch Sizes
- Default: 5 brands per batch (quality over quantity)
- Max: 10 brands if requested, but verification quality must not drop

## ICP Reference
Full ICP saved at: `memory/orange-matrix-icp.md`