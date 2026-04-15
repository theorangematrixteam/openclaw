# HEARTBEAT.md — Proactive Check Schedule

## Every heartbeat (rotate through these, don't do all every time):

1. **Emails** — Any urgent unread messages? (via gog)
2. **Client Status** — Any overdue or stuck items? (via client-tracker skill)
3. **Follow-ups** — Any approvals pending > 2 days? (via follow-up-engine skill)
4. **Calendar** — Any events in next 24h? (via gog)

## Alive Ping

If **Jinay's** message is the last message in any Discord channel, respond with:
- **What you're currently working on** (if mid-task)
- **Progress update** (how far along, ETA if applicable)
- **Or a quick acknowledgment** if you're idle

**Do NOT ping if YOUR message is the last one.** Only ping when Jinay is waiting on a response from you. Don't spam.

## If nothing needs attention → HEARTBEAT_OK

## When to alert Jinay:
- Urgent email from a client
- Content deadline missed
- Approval pending > 2 days
- Calendar event < 2h away

## When NOT to alert:
- Late night (23:00-08:00 IST) unless urgent
- Nothing new since last check
- Normal content progress