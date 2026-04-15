---
name: content-ops
description: "Content operations trigger. Use when user asks for help with content, references, planning, creation, or scheduling. Detects intent and routes to the correct workflow automatically."
---

# Content Operations Skill

Automatically detect content-related requests and route to the correct workflow.

## Trigger Phrases

Activate this skill when user says anything like:

- "help me with content"
- "find references for..."
- "create content for..."
- "plan this month's content"
- "schedule this post"
- "what's the status of..."
- "I need references"
- "client brief"
- "content plan"
- "upload to drive"
- "waiting for approval"
- "mark as approved"

## Intent Detection

When a content-related request is detected, identify the workflow:

| Intent | Keywords | Workflow |
|--------|----------|----------|
| Brief/Onboard | "brief", "new client", "onboard", "requirements" | Client Brief Intake |
| References | "references", "inspiration", "examples", "find", "visual direction" | Reference Research |
| Planning | "plan", "month", "calendar", "content ideas", "schedule plan" | Monthly Planning |
| Creation | "create", "make", "design", "write", "caption" | Content Creation |
| Approval | "approve", "feedback", "revisions", "client said" | Approval & Feedback |
| Scheduling | "schedule", "post", "publish", "go live" | Scheduling |
| Status | "status", "where is", "pending", "update" | Status Check |

## Workflow Routing

### 1. Brief Intake

When: User shares new client info or asks to understand requirements

Do:
- Read `clients/[client-name].md` if exists
- Ask clarifying questions about:
  - Brand positioning
  - Target audience
  - Content goals
  - Platforms
  - Quantity
- Create/update client file
- Confirm understanding

### 2. Reference Research

When: User asks for references, inspiration, or visual direction

Do:
- Read the content idea from the plan sheet
- Use Prismfy search + gemma4:26b for vision analysis
- Find 3-5 relevant references
- Create reference file in `clients/[client]-references/[topic].md`
- Upload to Drive if needed
- Present references with analysis
- Ask: "Does this direction work for you?"

### 3. Monthly Planning

When: User asks for content plan or month planning

Do:
- Read client positioning from `clients/[client-name].md`
- Search for relevant dates/events in the month
- Research competitor content
- Generate content ideas across pillars
- Create/update plan in Sheets
- Present summary with link
- Ask for approval

### 4. Content Creation

When: User asks to create content or finalize posts

Do:
- Read approved plan from Sheets
- Check for required assets
- Create content specs or caption
- Save to Drive folder
- Update sheet status to "Created"
- Send for approval

### 5. Approval & Feedback

When: User shares client feedback or approval status

Do:
- Parse feedback type (approved, revisions, rejected)
- Update sheet status accordingly
- If revisions: note feedback, ask for clarification if needed
- If approved: mark "Ready to Schedule"
- Log feedback patterns in `clients/[client]-feedback/`

### 6. Scheduling

When: User asks to schedule or post content

Do:
- Verify status is "Ready to Schedule"
- Check optimal posting times
- Update status to "Scheduled"
- Confirm scheduled date/time

### 7. Status Check

When: User asks about status or pending items

Do:
- Read content tracker sheet
- List items by status (pending approval, in progress, scheduled)
- Highlight items needing attention
- Suggest next actions

## Context Loading

Before any content workflow:

1. **Read client file:** `clients/[client-name].md`
2. **Read current plan:** From respective sheet
3. **Check status:** Content tracker for pending items
4. **Read recent feedback:** `clients/[client]-feedback/` for patterns

---

## Reference Collection Workflow

### Trigger
When user shares an Instagram link/reel in a client's reference channel:
- Orange Matrix → `#orange-matrix` channel
- Notch India → `#notch-india` channel
- Proofit → `#proofit` channel

### Process
1. **Detect shared content** — Instagram URL in client reference channel
2. **Analyze the content** — Use `gemma4:26b` (vision model) to see and analyze:
   - Hook pattern (first 3 seconds)
   - Visual style (colors, framing, typography)
   - Content format (reel, carousel, static)
   - Pacing and structure
   - CTA type
   - Why it works (emotional hook, transformation, education)
3. **Store reference:** `clients/[client]-references/[date]-[topic].md`
4. **Update brand preferences:** `clients/[client].md` — add new learnings to reference section
5. **Confirm:** Reply with brief analysis and "Added to [client] reference library"

**Note:** GLM-5 Cloud cannot see images/video. Always use gemma4:26b for visual analysis tasks.

### Reference File Format
```markdown
# [Date] - [Topic/Account]

**Source:** Instagram URL
**Account:** @username
**Format:** Reel / Carousel / Static

## Hook
[First 3 seconds - what grabbed attention]

## Visual Style
- Colors: [palette used]
- Framing: [composition style]
- Typography: [font style, text overlay approach]

## Structure
[Pacing breakdown - hook, context, demo, payoff, CTA]

## Why It Works
[What makes this effective]

## Apply to [Client]
[How to adapt this for client's brand]
```

### Brand Preferences Update
After each reference, update client file with:
- New hook patterns discovered
- Visual elements to replicate
- CTA styles that work
- Notes on what user gravitates toward

## Response Format

When triggering a workflow:

```
📋 **[Workflow Name]**

**Client:** [Client name]
**Status:** [Current status]

[Workflow-specific details]

[Ask clarifying question or confirm next step]
```

## Example Interactions

**User:** "help me with content for notch india"
**Agent:**
```
📋 **Content Operations - Notch India**

What do you need?
1. References for existing content ideas
2. Create new content plan
3. Check status of pending items
4. Something else
```

**User:** "find references for the heritage building reel"
**Agent:** (Triggers Reference Research workflow)
- Reads Apr 18 content from Notch India plan
- Searches for heritage building inspection references
- Analyzes with gemma4:26b
- Presents references with visual analysis

**User:** "client approved the soft launch reel"
**Agent:** (Triggers Approval workflow)
- Updates Apr 15 status to "Ready to Schedule"
- Asks: "Want me to schedule it? If so, which platform and when?"