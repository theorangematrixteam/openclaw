---
name: daily-briefing
description: Generate a comprehensive morning briefing including emails, AI news, top 3 todos, client content status, and pending batches. Triggers on phrases like "morning briefing", "daily brief", "morning summary", or runs automatically via cron job.
---

# Daily Briefing Skill

Generate a concise, actionable morning briefing for Jinay. This is the FRIDAY-style daily check-in.

## What Goes Into the Briefing

### 1. Emails (existing)
- Use the gog skill to read inbox
- Summarize important/urgent emails
- Flag anything needing action

### 2. AI/Tech News (existing)
- Search for latest AI news
- 3-5 most relevant stories
- Brief summaries, not full articles

### 3. Top 3 Todos (NEW)
- Read `todo.json` from workspace
- Pick top 3 from Q1 (Do Now), then Q2 (Schedule) if Q1 has fewer than 3
- Show as numbered list with quadrant emoji

### 4. Client Content Status (NEW)
- Read each client's Google Sheet
- Check: how many posts due this week, any overdue items, pending approvals
- Keep it brief: client name + status line

### 5. Pending Batches (NEW)
- Read Core > Batches tab from the Orange Matrix Content Plan sheet
- Count pending batches
- Flag any stuck or overdue

## Format

```
☀️ **Morning Briefing — {date}**

📧 **Emails**
- {email summary, 2-3 lines}

🤖 **AI News**
- {news items, 3-5 bullets}

🎯 **Top 3 Today**
🔴 {Q1 task}
🔴 {Q1 task}
🟡 {Q2 task if needed}

📊 **Client Status**
- **Notch India**: {status line}
- **Proofit**: {status line}
- **{Client 3}**: {status line}

📋 **Pending Batches**: {count} pending

💡 *{One insight or recommendation based on the data}*
```

## Rules

- **Keep it short** — the whole briefing should fit on one phone screen
- **No markdown tables** — Discord doesn't render them well
- **Be direct** — skip filler words, just give the info
- **Use emojis** for section headers but don't overdo it
- **If something is urgent**, flag it with ⚠️
- **End with one actionable insight** — what should Jinay focus on today?
- **Never skip sections** — even if empty, show "No urgent emails" or "All clear"
- **Client sheet IDs** are in TOOLS.md