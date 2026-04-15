---
name: content-approval
description: Handle content approval via Google Sheets. Use when content needs client sign-off, when sharing the sheet with a client, or when checking approval status. Triggers on "send for approval", "share with client", "approval request", "check approvals".
---

# Content Approval via Sheets

## How It Works
Clients review and approve content directly in their Google Sheet. No emails needed.

## Approval Flow

1. **Create content** in client's plan sheet (Notch India, Proofit, etc.)
2. **Set Status** to "Ready for Review" or "To be shared by client"
3. **Share sheet** with client (if not already shared)
4. **Client reviews** — changes Status to "Approved" or leaves comments
5. **Sarah checks** — reads approval status from sheet during briefing/follow-up
6. **If approved** → move to scheduling

## What Sarah Does

### When Jinay says "send for approval" or "share with client":
- Confirm which client
- Ensure all content has Status = "Ready for Review" or "To be shared by client"
- Draft a short message to send alongside the sheet link
- **Double confirmation** before sending

### When checking approval status:
- Read client sheet
- List which posts are: Approved / Pending / Changes Needed
- Flag anything pending > 2 days for follow-up

### Follow-up message template (when nudging):
> Hey {Client}, just checking in on the {Month} content. Let us know if you need any changes!

## Sheet Status Values
- **Planned** → content idea exists
- **In Creation** → being designed/written
- **Ready for Review** / **To be shared by client** → awaiting client approval
- **Approved** → client signed off, ready to schedule
- **Changes Needed** → client wants edits

## Rules
- Never email content when a sheet exists — share the sheet
- Client sheets are the single source of truth for approval status
- If a client prefers email, adapt — but default is sheet