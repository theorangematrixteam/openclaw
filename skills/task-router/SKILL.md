# Task Router Skill

Routes tasks to the appropriate model based on task type, not failure.

## Routing Table

| Tier | Model | Task Types |
|------|-------|------------|
| **Light** | `qwen3.5:9b` | Read, lookup, simple queries |
| **Medium** | `gemma4:26b` | Execute, edit, multi-step operations |
| **Heavy** | `glm-5:cloud` | Build, plan, create, reason |

## Task Classification

### LIGHT — Use `qwen3.5:9b`

**Characteristics:** No thinking required, straightforward operations

**Task types:**
- Reading files (any file type)
- History/memory lookups
- Listing files, directories
- Cron job management (create, list, delete)
- Simple queries ("what's the weather?", "what time is it?")
- Formatting text
- Copy/move/rename operations
- Status checks
- Simple web searches (lookup facts)
- Sending pre-written messages
- Basic calculations

**Spawn pattern:**
```
sessions_spawn(
  model="ollama/qwen3.5:9b",
  runtime="subagent",
  mode="run",
  task="<task description>"
)
```

### MEDIUM — Use `gemma4:26b`

**Characteristics:** Requires execution, coordination, moderate complexity

**Task types:**
- File edits (single or multiple)
- Multi-step tool operations
- Running commands/scripts
- Git operations (commit, push, pull)
- Installing packages
- Code modifications
- Spreadsheet operations
- API calls with logic
- Task orchestration
- Testing changes
- Debugging with file access

**Spawn pattern:**
```
sessions_spawn(
  model="ollama/gemma4:26b",
  runtime="subagent",
  mode="run",
  task="<task description>"
)
```

### HEAVY — Use `glm-5:cloud`

**Characteristics:** Requires thinking, creativity, complex reasoning

**Task types:**
- Building new features/systems
- Strategic planning
- Complex problem solving
- Architecture decisions
- Content creation (posts, articles, plans)
- Deep analysis
- Multi-system integration
- Research synthesis
- Complex debugging (figuring out WHY)
- Creative work
- Long-form writing

**Spawn pattern:**
```
sessions_spawn(
  model="ollama/glm-5:cloud",
  runtime="subagent",
  mode="run",
  task="<task description>"
)
```

## Decision Flow

```
1. Receive task
2. Classify: Is this READ, EXECUTE, or BUILD?
   - READ-only → LIGHT (qwen3.5:9b)
   - EXECUTE/change → MEDIUM (26b)
   - BUILD/think → HEAVY (cloud)
3. Spawn sub-agent with appropriate model
4. Return result
```

## Quick Reference

| Verb | Tier |
|------|------|
| Read, list, get, check, show | Light |
| Edit, run, create file, install, commit | Medium |
| Build, plan, design, analyze, write content | Heavy |

## Fallback Chain

The fallback chain remains active for failures:
- `qwen3.5:9b` → `gemma4:26b` → `glm-5:cloud`

This is automatic — if a model fails/times out, the next one takes over.

## Notes

- Light tasks save tokens and are faster
- Heavy tasks use cloud credits but get best reasoning
- When in doubt, classify UP (better to over-provision than under)
- Reading files to analyze them → Heavy (analysis, not just reading)