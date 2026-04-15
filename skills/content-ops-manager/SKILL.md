---
name: content-ops-manager
description: Manage monthly content operations for recurring clients using Google Sheets. Use when reviewing client plan sheets, syncing work into the internal master tracker, identifying bottlenecks, deciding what should be created next, spotting items waiting on approval, cleaning the active queue, or maintaining the content tracker and archive tabs in the Core sheet.
---

# Content Ops Manager

Use this skill to run Orange Matrix monthly content operations without overbuilding.

## System to manage

Maintain three layers only:

1. **Client plan sheets** — client-facing monthly plan and approval view
2. **Core / content tracker** — internal live queue for active work only
3. **Core / batches** — batch, project, invoice, and payment tracking

Do not merge all three concerns into one sheet.

## Current source sheets

Recurring client planning sheets currently include:

- `Notch India`
- `Proofit month plan` (tab: `proofit`)

Internal operations sheet:

- `Core` spreadsheet
  - `content tracker`
  - `content archive`
  - `batches`

## What the live tracker is for

Treat `content tracker` as the working queue.

It should focus only on items that still need action.
Keep approved/done items out of the live queue when possible.
Move completed or no-longer-actionable items to `content archive`.

## Content tracker schema

Use these columns:

- Client
- Month
- Post Date
- Platform
- Content Type
- Bucket
- Topic / Hook
- Status
- Creation Owner
- Draft Link
- Approval Status
- Scheduled Status
- Posted Status
- Notes

## Canonical statuses

Use these values consistently.

### Status

- Planned
- In Creation
- Ready for Review
- Approved
- Scheduled
- Posted

### Approval Status

- Pending
- Approved
- Changes Needed

### Scheduled Status

- Not Scheduled
- Scheduled

### Posted Status

- Not Posted
- Posted

Do not invent new status labels unless the user explicitly changes the workflow.

## Operating rules

- Prefer simple systems over clever systems.
- Keep the client-facing sheet separate from the internal queue.
- Keep one master tracker for all clients.
- Track each content piece individually, not only batches.
- Use `Proofit` structure as the quality baseline when improving client plan sheets.
- If a row is already fully approved/done and no action is needed, move it out of the live queue.
- Preserve links, dates, and client-specific topics when syncing.

## Default workflow

When asked to manage content ops:

1. Read the relevant client plan sheet(s)
2. Read `Core` tabs that matter (`content tracker`, `content archive`, `batches`)
3. Identify active work, blocked work, and approval dependencies
4. Update the live tracker if the task explicitly requires sync/cleanup
5. Report only the useful output:
   - what needs creation now
   - what is blocked
   - what needs approval
   - what is overdue or unscheduled

## What to optimize for

Optimize for:

- clarity
- low founder overhead
- fewer missed items
- fast visibility into next actions

Do not optimize for:

- fancy dashboards
- unnecessary complexity
- duplicate sheets
- client-visible internal operations

## When asked “what should we do next?”

Default to one best next action, not multiple options.

For this system, that usually means one of:

- clean the active queue
- sync a client plan into the tracker
- identify what should be created next
- identify what is waiting for approval
- identify what should be scheduled next

## References

If you need the Orange Matrix operating logic, read:

- `references/workflow.md`
- `references/sheet-map.md`
