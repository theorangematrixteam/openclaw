---
name: client-tracker
description: Quick status check of all client content operations. Use when checking client status, what's due, what's overdue, what needs approval, or summarizing client health for briefings. Triggers on "client status", "client check", "what's pending", "client overview".
---

# Client Tracker Skill

Quick status check of all Orange Matrix clients. Designed for the daily briefing and on-demand checks.

## How It Works

1. Read the `content tracker` tab from the Core sheet
2. Read the `batches` tab from the Core sheet
3. Summarize each client in one line

## Output Format

For each client:
```
**{Client Name}**: {X} posts this week · {Y} pending approval · {Z} overdue · Status: {🟢 On Track | 🟡 At Risk | 🔴 Behind}
```

For batches:
```
**Batches**: {X} pending · {Y} in progress · {Z} completed this month
```

## Status Signals

- 🟢 On Track — nothing overdue, approvals flowing
- 🟡 At Risk — 1-2 items overdue or pending approval > 2 days
- 🔴 Behind — multiple overdue items or stalled approvals

## Rules

- **One line per client** — never more
- **No tables** — bullet list only
- **Counts only** — don't list individual posts
- **Flag problems** — overdue and stuck items get ⚠️
- **Sheet IDs** are in TOOLS.md

## Integration with Daily Briefing

This skill is called by the daily-briefing skill as part of the "Client Status" section. It can also be called independently when Jinay asks "what's the status on clients?" or "what's pending?"