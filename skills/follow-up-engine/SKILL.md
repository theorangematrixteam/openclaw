---
name: follow-up-engine
description: Track pending approvals, overdue items, and follow-up reminders. Use when checking what needs chasing, what approvals are stuck, sending reminders, or when the daily briefing needs follow-up alerts. Triggers on "follow up", "remind", "approval pending", "what's stuck", "chase".
---

# Follow-up Engine Skill

Track and flag items that need attention or action from others. This is FRIDAY's nudge system.

## What Gets Tracked

1. **Pending approvals** — client hasn't approved content yet
2. **Overdue items** — past due date, not posted
3. **Stuck items** — in progress > 3 days with no movement
4. **Unpaid invoices** — batches marked invoiced but not paid

## How It Works

1. Read `content tracker` tab from Core sheet
2. Read `batches` tab from Core sheet
3. Filter for items needing action from others
4. Flag anything meeting criteria above

## Output Format

```
🔔 **Follow-ups Needed**
- Notch: 3 posts pending approval (sent 2 days ago)
- Proofit: April batch payment overdue by 5 days
⚠️ **Stuck**: Proofit carousel draft — no movement in 4 days
```

If everything is clear:
```
✅ No follow-ups needed right now.
```

## Follow-up Thresholds

- **Approval pending > 2 days** → flag for nudge
- **Overdue > 1 day** → flag as overdue
- **No movement > 3 days** → flag as stuck
- **Invoice unpaid > 7 days past due** → flag as overdue

## Proactive Action

When the daily briefing detects follow-ups, it should:
1. List them in the briefing
2. Suggest one action: "Nudge {client} on {X}"

## Integration

- Called by daily-briefing skill as part of morning check
- Can be called independently: "what's stuck?", "any follow-ups?"
- Sheet IDs in TOOLS.md