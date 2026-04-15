---
name: obsidian
description: Work with Obsidian vaults (plain Markdown notes). Read, create, update, and search notes in the vault. Use when working with the Obsidian vault, syncing workspace content to Obsidian, or searching notes.
---

# Obsidian

Obsidian vault = a normal folder on disk. Our vault is at:
**C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-workspace**

## Vault Structure

- `memory/` — Daily notes and session memory
- `clients/` — Client profiles and references
- `projects/` — Project planning
- `references/` — Content references
- `.obsidian/` — Config (don't touch from scripts)

## How to Work with the Vault

Since obsidian-cli is macOS-only, we work directly with the Markdown files:

### Read a note
Use the `read` tool on any `.md` file in the vault path.

### Create a note
Use the `write` tool to create a new `.md` file in the appropriate vault subfolder.

### Update a note
Use the `edit` tool to make targeted changes to an existing note.

### Search notes
Use `exec` with PowerShell to search:
```powershell
Get-ChildItem "C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-workspace" -Recurse -Filter *.md | Select-String "query"
```

### Sync from workspace
When updating workspace files (MEMORY.md, memory/*.md, TOOLS.md, etc.), also update the corresponding files in the Obsidian vault so both stay in sync.

Key sync mappings:
- `workspace/MEMORY.md` → `openclaw-workspace/MEMORY.md`
- `workspace/memory/*.md` → `openclaw-workspace/memory/*.md`
- `workspace/TOOLS.md` → `openclaw-workspace/TOOLS.md`
- `workspace/USER.md` → `openclaw-workspace/USER.md`

### Sync to workspace
When making changes in Obsidian that should be reflected back:
- Read the Obsidian file
- Update the workspace equivalent

## Rules

- Always use `.md` extension for notes
- Use wikilinks `[[note name]]` for internal links (Obsidian format)
- Add YAML frontmatter with tags for categorization
- Don't modify `.obsidian/` config files
- Create notes in the appropriate subfolder (clients/, projects/, references/, memory/)
- Keep filenames lowercase with hyphens (e.g., `notch-india.md`)