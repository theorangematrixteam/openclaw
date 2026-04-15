---
name: content-tracker
description: "Master content tracker. Use to check status of all client content, find pending items, and sync with individual client sheets."
---

# Content Tracker Skill

Central hub for tracking content status across all clients.

## Master Sheet Structure

**Sheet:** "Orange Matrix - Content Tracker"

Tabs:
- `Overview` — All clients summary
- `Notch India` — Synced from Notch India plan
- `Proofit` — Synced from Proofit plan
- `Orange Matrix` — Synced from Orange Matrix plan
- `Pending` — Items needing attention

## Overview Tab Columns

| Column | Description |
|--------|-------------|
| Client | Client name |
| Posts This Month | Total posts planned |
| Approved | Count of approved posts |
| Pending Approval | Count awaiting approval |
| Scheduled | Count scheduled |
| Published | Count live |
| Last Updated | Timestamp |

## Status Check Workflow

When user asks for status:

1. Read Overview tab
2. Identify bottlenecks (high pending approval, low scheduled)
3. Check Pending tab for items > 48 hours old
4. Present summary:
   ```
   📊 **Content Status Overview**

   **Notch India:** 5 approved | 2 pending | 0 scheduled
   **Proofit:** 3 approved | 4 pending | 1 scheduled
   **Orange Matrix:** 8 approved | 0 pending | 4 scheduled

   ⚠️ **Needs Attention:**
   - Notch India: 2 items pending approval > 48h
   - Proofit: 4 items pending approval

   **Suggested Actions:**
   - Follow up with Notch India on pending items
   - Check Proofit references approved?
   ```

## Sync Workflow

Sync individual client sheets to master tracker:

1. Read client plan sheet
2. Count by status
3. Update Overview tab
4. Add pending items to Pending tab
5. Note last updated timestamp

## Pending Tab Columns

| Column | Description |
|--------|-------------|
| Client | Client name |
| Content ID | Date + Topic |
| Status | Current status |
| Days Pending | Days in current status |
| Blocked By | What's blocking (if any) |
| Next Action | Suggested next step |

## Status Priority

| Priority | Status | Action |
|----------|--------|--------|
| 🔴 High | Blocked | Needs immediate attention |
| 🟠 Medium | Pending Approval > 48h | Follow up |
| 🟡 Low | Pending Approval < 48h | Wait |
| 🟢 Good | Ready to Schedule | Schedule when ready |
| ✅ Done | Published | Archive |