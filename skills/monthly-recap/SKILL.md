---
name: monthly-recap
description: Generate a monthly recap report for clients using Google Docs. Use when creating end-of-month reports, client summaries, or performance overviews. Triggers on "monthly recap", "monthly report", "end of month report", "client report".
---

# Monthly Recap Report Skill

Generate a monthly recap for each client using Google Docs and share the link.

## How It Works

1. Read client's plan sheet for the month
2. Read content tracker for posted/scheduled counts
3. Read batches for invoice/payment status
4. Create a Google Doc with the recap
5. Share link with Jinay for review

## Report Structure

```
# {Client Name} — {Month} {Year} Recap

## 📊 Content Performance
- Total posts: {X}
- Posted: {Y}
- Scheduled: {Z}
- Platforms: Instagram, LinkedIn, etc.

## ✅ What We Did
- {Bullet list of key content pieces and topics}

## 📋 Approval Status
- Approved: {X} posts
- Pending: {X} posts
- Changes needed: {X} posts

## 💰 Financials
- Invoice: ₹{X}
- Status: {Paid/Pending}

## 🔜 Next Month Preview
- Upcoming themes/topics
- Any changes to strategy

---
Prepared by Orange Matrix
```

## Rules
- Use `gog docs export` or create via Google Docs API
- Share link with Jinay first — **double confirmation** before sharing with client
- Keep it clean and professional
- One report per client per month
- Generate on the last day or first day of each month