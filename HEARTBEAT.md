# HEARTBEAT.md — Proactive Check Schedule

## Session Memory Save (every heartbeat)

**ALWAYS do this first on every heartbeat:**
- Append key progress/events from this session to `memory/YYYY-MM-DD.md`
- Keep it brief — what was done, decisions made, files created/modified
- This prevents data loss from context compaction
- **Also save MEMORY.md if any significant rules or context changed this session**

---

## Every heartbeat (rotate through these, don't do all every time):

1. **Emails** — Any urgent unread messages? (via gog)
2. **Client Status** — Any overdue or stuck items? (via client-tracker skill)
3. **Follow-ups** — Any approvals pending > 2 days? (via follow-up-engine skill)
4. **Calendar** — Any events in next 24h? (via gog)
5. **OpenClaw Updates** — Check `npm view openclaw version` vs `npm list -g openclaw`. If newer version available, alert Jinay but do NOT auto-update (requires gateway restart).
6. **Push to Discord** — If any actionable items found during heartbeat, push them to Discord #general using:
   `openclaw message send --channel discord --target "channel:1489858409376514200" --message "<message>"`
   Don't push routine "nothing found" updates — only push when there's something Jinay needs to see.

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

**Also push these alerts to Discord #general** using the command above. Don't just keep them in webchat.

## When NOT to alert:
- Late night (23:00-08:00 IST) unless urgent
- Nothing new since last check
- Normal content progress