# Content Operating System Workflows

Step-by-step workflows for content creation and management.

---

## Workflow 1: Client Brief Intake

**Trigger:** Client sends new brief or requirements

**Steps:**

1. **Receive brief** — Client sends requirements via Discord/email/meeting
2. **Extract key info:**
   - Brand positioning
   - Target audience
   - Content goals (awareness, engagement, leads)
   - Tone/style preferences
   - Platforms (Instagram, LinkedIn, X, YouTube Shorts)
   - Quantity (posts per month)
3. **Store in client file** — Update `clients/[client-name].md`
4. **Confirm understanding** — Reply with summary: "Here's what I understood..."

**Agent Tasks:**
- Ask clarifying questions if brief is vague
- Suggest improvements based on past performance
- Flag if brief conflicts with brand positioning

---

## Workflow 2: Reference Research & Approval

**Trigger:** Content direction needs visual/story references

**Steps:**

1. **Understand content angle** — Read the content idea from plan sheet
2. **Search references** — Use Prismfy to find:
   - Instagram/Pinterest visual references
   - Competitor content
   - Trending formats in the niche
3. **Analyze references** — Extract:
   - Visual style (color grading, framing, typography)
   - Pacing/structure (hooks, transitions, CTAs)
   - Key elements to replicate
4. **Store references** — Create/append to `clients/[client]-references/[date-topic].md`
5. **Upload to Drive** — Add to `references/[client]/` folder with Sheet link
6. **Send for approval:**
   ```
   Here are the references for [content idea]:
   - Reference 1: [link] — [why this works]
   - Reference 2: [link] — [why this works]
   - Reference 3: [link] — [why this works]

   Key elements to replicate:
   - [element 1]
   - [element 2]

   Does this direction work for you?
   ```
7. **Wait for feedback** — Mark status as "Pending Approval" in sheet
8. **Revise or proceed** — Update references if needed, mark "Approved" when confirmed

**Agent Tasks:**
- Use gemma4:26b for vision analysis (has image understanding)
- Log learnings if references are rejected (what didn't work)
- Store approved references for reuse

---

## Workflow 3: Monthly Content Planning

**Trigger:** Start of new month or client onboarding

**Steps:**

1. **Review client file** — Read `clients/[client-name].md` for positioning, tone, goals
2. **Check special days** — Search for relevant dates, holidays, events in the month
3. **Research competitors** — Find what's working in their niche
4. **Create content pillars:**
   - Define 3-4 buckets (e.g., Education, BTS, Case Studies, Proof)
   - Allocate posts across pillars based on goals
5. **Draft plan in Sheets:**
   - Date | Day | Type | Bucket | Status | Topic | Concept (Reasoning) | CTA | Platforms
   - Fill all dates with content ideas
6. **Generate content ideas:**
   - Each post has: Hook → Concept → CTA
   - Strategic reasoning for why this content
7. **Review internally** — Check for:
   - Variety in content types
   - Balanced pillars
   - Clear CTAs
   - Platform-appropriate formats
8. **Send for approval:**
   ```
   Here's the content plan for [month]:
   - [X] posts across [platforms]
   - Pillars: [list]
   - Key highlights: [notable content]

   [Link to sheet]

   Let me know if you want to adjust anything.
   ```
9. **Update based on feedback** — Mark "Approved" when confirmed

**Agent Tasks:**
- Use content-planner skill for research and ideation
- Reference past high-performing content
- Suggest A/B test opportunities

---

## Workflow 4: Content Creation

**Trigger:** Plan approved, content needs to be created

**Steps:**

1. **Pull approved plan** — Read content details from Sheet
2. **Gather assets:**
   - Images/video from client Drive
   - Reference files
   - Brand assets (logo, colors, fonts)
3. **Create content:**
   - **Visual:** Design in Canva/Figma, or note specs for designer
   - **Caption:** Write hook, body, CTA, hashtags
   - **Video:** Script, shot list, or edit notes
4. **Save to Drive:**
   - `clients/[client]/content/[month]/[date-topic]/`
   - Clear naming: `YYYY-MM-DD_platform_topic_v1.ext`
5. **Update sheet status:**
   - Status: "Created" → Link to Drive folder
6. **Send for approval:**
   ```
   Content ready for [date] [platform]:

   - [Link to Drive folder]

   Caption:
   [caption text]

   Let me know if any changes needed.
   ```
7. **Wait for feedback** — Status: "Pending Approval"
8. **Revise if needed** — Status: "Revising" → Upload v2
9. **Mark approved** — Status: "Ready to Schedule"

**Agent Tasks:**
- Check if all assets exist before creating
- Flag if client hasn't provided required materials
- Store approved captions for tone consistency

---

## Workflow 5: Approval & Feedback

**Trigger:** Content sent to client, awaiting response

**Steps:**

1. **Track pending approvals** — Check sheet for "Pending Approval" status
2. **Follow up if needed:**
   - After 48 hours: Gentle reminder
   - After 72 hours: Urgent reminder
3. **Receive feedback:**
   - **Approved:** Mark "Ready to Schedule"
   - **Revisions:** Mark "Revising", note feedback, update content
   - **Rejected:** Mark "Blocked", ask for clarification
4. **Log feedback:**
   - Store in `clients/[client]/feedback/[date].md`
   - Note patterns (e.g., "client always wants more CTAs")
5. **Update content** — Apply changes, re-upload, send for re-approval

**Agent Tasks:**
- Track approval aging in content tracker
- Suggest follow-up cadence based on client patterns
- Learn client preferences from feedback history

---

## Workflow 6: Scheduling

**Trigger:** Content approved, ready to post

**Steps:**

1. **Check status** — Content must be "Ready to Schedule"
2. **Verify content:**
   - Caption finalized
   - Hashtags appropriate
   - Visual uploaded
   - CTA clear
3. **Schedule on platform:**
   - **Instagram:** Meta Business Suite or Buffer
   - **LinkedIn:** Native scheduler or Buffer
   - **X:** Native scheduler or Buffer
   - **YouTube Shorts:** YouTube Studio
4. **Update sheet status:**
   - Status: "Scheduled"
   - Add scheduled time/date
   - Add post link if available
5. **Confirm to client:**
   ```
   [Content] scheduled for [platform]:
   - Date: [scheduled date]
   - Time: [scheduled time]
   - Link: [if available]
   ```
6. **Post-publish check:**
   - Verify post went live
   - Monitor initial engagement
   - Note performance for future reference

**Agent Tasks:**
- Check optimal posting times for each platform
- Track scheduled vs actual publish
- Flag if scheduling fails

---

## Status Codes

| Status | Meaning |
|--------|---------|
| `Brief` | Content idea captured, needs development |
| `References Pending` | Waiting for reference approval |
| `References Approved` | References confirmed, can create |
| `Creating` | Content in production |
| `Created` | Content ready, pending client review |
| `Pending Approval` | Sent to client, waiting |
| `Revising` | Client requested changes |
| `Ready to Schedule` | Approved, awaiting schedule |
| `Scheduled` | Scheduled on platform |
| `Published` | Live on platform |
| `Blocked` | Needs client input or assets |

---

## File Structure

```
clients/
├── [client-name].md          # Brand positioning, tone, goals
├── [client]-references/
│   ├── [date]-[topic].md     # Reference analysis
│   └── ...
├── [client]-feedback/
│   └── [date].md             # Client feedback logs
└── ...

Drive/
├── references/
│   └── [client]/
│       └── [content-id]/     # Reference images/videos
├── content/
│   └── [client]/
│       └── [month]/
│           └── [date-topic]/ # Final content files
└── ...
```

---

## Agent Responsibilities

**What I can do:**
- Read/write to Sheets
- Search for references (Prismfy)
- Analyze references (gemma4:26b)
- Create/update client files
- Track status in content tracker
- Remind about pending approvals
- Log feedback patterns

**What I need from you:**
- Client briefs and updates
- Approval/feedback responses
- Access to content files (Drive)
- Platform scheduling permissions (future)

**Future (ComfyUI):**
- Generate visuals from prompts
- Create variations for A/B testing
- Auto-resize for different platforms