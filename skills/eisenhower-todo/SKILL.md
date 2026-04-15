---
name: eisenhower-todo
description: Manage a personal todo list using the Eisenhower Matrix (Do Now / Schedule / Delegate / Eliminate). Use when adding tasks, marking tasks done, listing todos, prioritizing work, getting top priorities for the day, or cleaning up completed items. Triggers on phrases like "new task", "add todo", "mark done", "what's on my list", "top priorities", "prioritize", "task list", "todos".
---

# Eisenhower Todo Skill

Manage tasks using the Eisenhower Matrix — separating urgency from importance so founders focus on what actually moves the needle.

## Matrix Quadrants

| Quadrant | Urgent | Important | Action |
|----------|--------|-----------|--------|
| **Q1 — Do Now** | ✅ | ✅ | Do immediately |
| **Q2 — Schedule** | ❌ | ✅ | Plan time for it |
| **Q3 — Delegate** | ✅ | ❌ | Hand off or batch |
| **Q4 — Eliminate** | ❌ | ❌ | Drop it |

## Data Store

All tasks live in a single JSON file: `todo.json` in the workspace root.

### Schema

```json
{
  "tasks": [
    {
      "id": "T001",
      "text": "Finalize Notch content calendar",
      "quadrant": 1,
      "quadrant_label": "Do Now",
      "created": "2026-04-11T05:30:00+05:30",
      "due": null,
      "done": false,
      "done_at": null,
      "tags": ["client:notch", "content"],
      "notes": ""
    }
  ],
  "counter": 1
}
```

### Fields

- `id`: Auto-incrementing (T001, T002…)
- `text`: The task description
- `quadrant`: 1 (Do Now), 2 (Schedule), 3 (Delegate), 4 (Eliminate)
- `quadrant_label`: Human-readable label
- `created`: ISO timestamp
- `due`: Optional due date (ISO date string)
- `done`: Boolean
- `done_at`: ISO timestamp when marked done
- `tags`: Array of strings for filtering (e.g., "client:notch", "content", "ops")
- `notes`: Optional extra context

## Operations

### Adding a Task

1. **Natural language detection** — recognize a task from context without requiring keywords like "new task" or "add todo". If the user describes something they need to do, plan to do, or want done, treat it as a task.
2. If the user specifies the quadrant or urgency/importance, use that
3. If not specified, **ask**: "Where does this land?" with brief options:
   - 🔴 "Urgent + Important → Do Now"
   - 🟡 "Important, not urgent → Schedule"
   - 🔵 "Urgent, not important → Delegate"
   - ⚪ "Neither → Eliminate"
4. Create the task in `todo.json` with the assigned quadrant
5. Confirm with a short message showing the quadrant and task ID

**Batch adding**: If user lists multiple tasks, add them all. Ask for quadrant once per group if not specified, or let user label each.

### Marking Done

1. User says "done T003" or "mark done finalize Notch calendar" or "completed the email task"
2. Find the task by ID or by matching text
3. Set `done: true` and `done_at` to current timestamp
4. Confirm briefly

### Listing Tasks

1. User says "what's on my list" or "show todos" or "task list"
2. Read `todo.json`
3. Display **only open tasks**, grouped by quadrant:
   - 🔴 **Do Now** (Q1)
   - 🟡 **Schedule** (Q2)
   - 🔵 **Delegate** (Q3)
   - ⚪ **Eliminate** (Q4)
4. Show task ID, text, and due date (if set)
5. Keep output concise — bullet list, no tables (Discord-friendly)

### Top Priorities

1. User says "top 3 for today" or "what should I focus on"
2. Read `todo.json`, filter open tasks
3. Return top 3 from Q1 first, then Q2 if Q1 has fewer than 3
4. Format as a short numbered list

### Reprioritizing

1. User says "move T002 to schedule" or "this isn't urgent"
2. Update the quadrant and quadrant_label
3. Confirm the change

### Cleanup

1. User says "clean up" or "archive done"
2. Remove all tasks where `done: true` and `done_at` is older than 7 days
3. Report how many were removed

### Tag Filtering

1. User says "show client:notch tasks" or "content todos"
2. Filter by matching tag
3. Display grouped by quadrant

## Morning Brief Integration

When generating the daily morning summary (cron job), include a "Top 3 Today" section:
1. Read `todo.json`
2. Pick top 3 open tasks: Q1 first, then Q2
3. If a task has a `due` date matching today or earlier, prioritize it higher
4. Format as a brief numbered list

## Rules

- **No tables in Discord** — use bullet lists with emoji quadrant markers
- **Keep confirmations short** — 1-2 lines max
- **Auto-assign quadrant** only if the user explicitly states urgency/importance; otherwise ask
- **Never delete tasks** unless user says "eliminate" — marking done preserves history
- **Be consistent with IDs** — always reference tasks by ID in follow-up messages
- **Respect the matrix** — if a task seems like it's in the wrong quadrant, suggest a move but don't force it