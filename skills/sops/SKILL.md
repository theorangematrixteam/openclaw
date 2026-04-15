---
name: sops
description: Standard Operating Procedures for Orange Matrix. Use when onboarding new team members, repeating a process, or checking how something should be done. Triggers on "SOP", "process", "workflow", "how do we", "standard operating procedure".
---

# Orange Matrix — Standard Operating Procedures

---

## SOP-001: New Client Onboarding

1. Collect brand brief (name, niche, audience, goals, competitors, CTAs)
2. Create client Google Sheet with tabs: Plan, References, Batches, Notes
3. Set Plan tab headers: Date, Day, Special day, Content Type, Bucket, Status, Topic/Hook, Concept and Objectives, Post Angle, CTA, Caption
4. Fill References tab with competitor/inspiration links
5. Generate first month's content plan using marketing principles
6. Add client to Content Tracker Overview sheet
7. Create client note in Obsidian vault (`clients/client-name.md`)
8. Share sheet with client
9. Send welcome message with approval workflow explanation
10. Get Jinay's confirmation before sending anything to client

---

## SOP-002: Monthly Content Planning

1. Read client's previous month performance (what worked, what didn't)
2. Check for seasonal moments, special days, cultural events
3. Map content buckets to funnel stages (TOFU, MOFU, BOFU)
4. Plan mix: Reels for reach, Carousels for saves, Posts for engagement
5. Apply 3-second hook rule to every reel
6. Write captions using AIDA or PAS framework
7. Include specific CTAs per post
8. Fill the client's Plan sheet with all content
9. Set Status to "Ready for Review" or "Planned"
10. Get Jinay's approval, then share with client for sign-off

---

## SOP-003: Content Creation

1. Check Plan sheet for content due this week
2. For each post:
   a. Read the Concept and Objectives column
   b. Check References tab for inspiration links
   c. Create visual/draft
   d. Write final caption
   e. Update Status column
3. If client needs to provide assets (photos, videos), mark "To be shared by client"
4. Once all pieces are ready, update Status to "Ready for Review"
5. Notify Jinay before sending to client

---

## SOP-004: Client Approval

1. Content goes to client via shared Google Sheet (not email)
2. Client reviews and updates Status column:
   - "Approved" = ready to schedule
   - "Changes Needed" = revise and resubmit
   - "To be shared by client" = waiting on client assets
3. Sarah checks approval status during heartbeat/daily briefing
4. If approval pending > 2 days, follow up via nudge message
5. Once approved, move to scheduling

---

## SOP-005: Scheduling & Publishing

1. Check Plan sheet for approved content
2. Schedule using Buffer (primary) or Postoria (backup)
3. Update Status to "Scheduled" with date
4. After publishing, update Status to "Published"
5. Update Content Tracker Overview with counts

---

## SOP-006: Monthly Recap Report

1. On last day or first day of month, generate recap
2. Use the monthly-recap skill (spawns sub-agent with marketing knowledge)
3. Pull data from client's Plan sheet and Content Tracker
4. Create Google Doc with humanized writing (use Humanizer skill)
5. Share link with Jinay for review
6. Double confirmation before sharing with client

---

## SOP-007: Daily Briefing (10:30 AM IST)

Automated via cron. Briefing includes:
1. Weather for the day
2. Calendar events (next 24h)
3. Emails needing attention
4. Client status overview (from Content Tracker)
5. Pending approvals or overdue items
6. Todo list (Eisenhower Matrix priorities)
7. Any content due today

---

## SOP-008: Heartbeat Checks

Every heartbeat, rotate through:
1. Emails — any urgent unread?
2. Client status — any overdue or stuck items?
3. Follow-ups — approvals pending > 2 days?
4. Calendar — events in next 24h?

Alert Jinay only when:
- Urgent email from client
- Content deadline missed
- Approval pending > 2 days
- Calendar event < 2h away

Stay quiet when nothing needs attention.

---

## SOP-009: Financial Tracking

1. When a batch/project is agreed, add to client's Batches tab:
   - Batch name, deliverables, amount, invoice date, payment status
2. Update Content Tracker Overview with totals
3. Follow up on unpaid invoices > 7 days past due
4. Monthly recap includes financial summary

---

## SOP-010: Adding a New Skill

1. Create `skills/skill-name/SKILL.md` with frontmatter (name, description)
2. Write clear trigger conditions ("Use when...")
3. Document the process step by step
4. Test the skill with real data
5. Update TOOLS.md if the skill references specific tools/APIs
6. Sync SKILL.md to Obsidian vault