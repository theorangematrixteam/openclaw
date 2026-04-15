---
name: session-conclusion
description: "Handles session end workflow: summarize highlights, update memory files (today.md, history.md), sync to Obsidian vault, and commit to git backup. Use when user says 'bye sarah' or similar goodbye phrases."
---

# Session Conclusion Skill

When the user says goodbye ("bye sarah", "goodbye", "that's all for now", etc.), execute this workflow:

## Workflow

### 1. Summarize Session Highlights

Review the current session and identify:
- Key accomplishments
- Important decisions made
- Files created/modified
- Pending items for next session
- New learnings or corrections

### 2. Update Memory Files

**today.md** (workspace/memory/today.md):
- Replace content with session summary
- Include timestamp
- List key accomplishments
- Note any blockers or pending items

**history.md** (workspace/memory/history.md):
- Append condensed entry for today
- Format: `## YYYY-MM-DD — <One-line summary>`
- Bullet list of 3-5 key items max

### 3. Sync to Obsidian Vault

Sync relevant files to the Obsidian vault at:
`C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-workspace`

Copy:
- `workspace/memory/*.md` → `vault/memory/`
- `workspace/clients/*.md` → `vault/clients/`
- Any new reference files

### 4. Git Backup

Execute git commands to backup OpenClaw workspace:

```bash
cd C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace
git add -A
git commit -m "Session backup: YYYY-MM-DD HH:MM"
git push origin main
```

If no git repo exists, initialize one:
```bash
cd C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace
git init
git remote add origin <repo-url>
git add -A
git commit -m "Initial backup: YYYY-MM-DD"
git push -u origin main
```

## Memory File Format

### today.md Template
```markdown
# YYYY-MM-DD — Session Summary

## Accomplishments
- Item 1
- Item 2

## Decisions
- Decision made

## Files Modified
- path/to/file

## Pending
- Item for next session

## Learnings
- Any new learnings logged
```

### history.md Entry Format
```markdown
## YYYY-MM-DD — One-line summary

- Accomplishment 1
- Accomplishment 2
- Key decision or learning
```

## Goodbye Response

After completing the workflow, respond with:
```
Session wrapped up. ✅

**Summary:**
- <3 bullet points of what was done>

**Backup:** Committed to git
**Memory:** Updated today.md + history.md
**Obsidian:** Synced to vault

See you next time, Jinay.
```

## Notes

- Always run git commands from the workspace directory
- Keep history.md concise (don't duplicate everything)
- Don't commit secrets or sensitive data
- If git fails, note it but don't block the conclusion