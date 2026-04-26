---
name: knowledge
description: Two-tier knowledge management system for agents. Global knowledge (shared across all agents) and private knowledge (scoped per-agent). Use when saving facts, preferences, learnings, or any information that should persist. When user says "remember this", "save this", "make it global", or any knowledge storage request. Also use when reading knowledge before tasks to avoid hallucination.
---

# Knowledge Skill

Two-tier knowledge system: **global** (shared) and **private** (per-agent).

## Directory Structure

```
knowledge/
├── global/              # All agents can read/write
│   ├── clients/         # Client profiles, brand guidelines, preferences
│   ├── systems/         # Tool configs, APIs, workflows, SOPs
│   ├── models/          # Model settings, prompts, taste profiles
│   └── facts/           # Verified facts, decisions, rules
└── private/             # Per-agent only
    └── {agent-id}/
        ├── context/     # Conversation-specific context
        ├── learnings/   # Things this agent learned
        └── preferences/ # User preferences noticed by this agent
```

## When to Save Knowledge

- **ALWAYS ask the user**: "Private or global?" before saving — unless they already specified
- User explicitly says "make it global" or "save for everyone" → **global**
- User explicitly says "private" or "just for you" → **private**
- If user doesn't specify → **ask first**, don't assume
- Agent discovers useful info → **private** first, propose global if broadly useful

## When to Read Knowledge

- Before client work → read `global/clients/{client}.md`
- Before tool/system tasks → read `global/systems/{system}.md`
- Before creative work → read `global/models/taste.md`
- At session start → read `private/{agent-id}/context/` for personalized context

## Rules

1. **Never read another agent's private folder** — prevents hallucination
2. **Global knowledge must be verified** — don't save assumptions as facts
3. **Private knowledge can be proposed for global** — if useful across agents
4. **Use kebab-case filenames** — e.g., `notch-india.md`, `comfyui-setup.md`
5. **Keep files focused** — one topic per file, not dumping grounds

## File Format

Each knowledge file starts with metadata:

```markdown
# {Title}

- **Scope**: global | private
- **Agent**: sarah (if private)
- **Created**: YYYY-MM-DD
- **Updated**: YYYY-MM-DD
- **Status**: verified | draft | deprecated

{Content}
```

## Writing Knowledge

When saving new knowledge:

1. Determine scope: global or private
2. Pick the right category folder
3. Check if file already exists → merge/update, don't duplicate
4. Write with metadata header
5. Keep it concise — facts, not essays

## Reading Knowledge

When reading knowledge:

1. Check global first for established facts
2. Then check private for personalized context
3. If conflicting info: global wins for facts, private wins for preferences
4. Never assume private knowledge from another agent