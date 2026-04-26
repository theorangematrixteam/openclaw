# Knowledge System

Two-tier knowledge storage for agents. Prevents hallucination and keeps knowledge scoped.

## Structure

```
knowledge/
├── global/          # Shared across ALL agents
│   ├── clients/    # Client profiles, preferences, brand guidelines
│   ├── systems/    # Tools, APIs, workflows, SOPs
│   ├── models/     # Model configs, prompts, taste profiles
│   └── facts/      # Verified facts, decisions, rules
└── private/        # Per-agent private knowledge
    └── {agent-id}/ # Each agent gets its own folder
        ├── context/  # Conversation-specific context
        ├── learnings/ # Things this agent learned
        └── preferences/ # User preferences this agent knows
```

## Rules

### Global Knowledge (`knowledge/global/`)
- **Who can write**: Any agent, when user says "make it global" or "save for everyone"
- **Who can read**: All agents
- **What goes here**: Client info, tool configs, brand guidelines, SOPs, verified facts, decisions
- **Format**: Markdown files, organized by category
- **Naming**: `kebab-case.md` (e.g., `notch-india.md`, `comfyui-setup.md`)

### Private Knowledge (`knowledge/private/{agent-id}/`)
- **Who can write**: Only the specific agent (auto-created per agent)
- **Who can read**: Only the specific agent
- **What goes here**: Conversation context, personal learnings, user preferences noticed during chats, task-specific knowledge
- **Format**: Markdown files, organized by category
- **Naming**: `kebab-case.md` (e.g., `learnings.md`, `user-preferences.md`)

## Usage

When saving knowledge:
1. User says "remember this" or "save this" → save to **private** by default
2. User says "make it global" or "save for everyone" → save to **global**
3. Agent discovers something useful → save to **private** first, propose global if broadly useful

When reading knowledge:
1. Always check **global/** first for established facts
2. Then check **private/{agent-id}/** for personalized context
3. Never assume private knowledge from another agent — that prevents hallucination

## Migration

Existing knowledge in `memory/`, `MEMORY.md`, `TOOLS.md`, and client files should be migrated:
- General facts → `knowledge/global/facts/`
- Client info → `knowledge/global/clients/`
- Tool/system configs → `knowledge/global/systems/`
- Model/taste configs → `knowledge/global/models/`
- Personal conversation context → `knowledge/private/sarah/` (main agent)