# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260406-001] correction

**Logged**: 2026-04-06T14:23:00+05:30
**Priority**: high
**Status**: pending
**Area**: content

### Summary
Reference finding for content planning returns irrelevant or superficial results when searching general terms

### Details
When tasked with finding visual references for "heritage building inspection" content, the sub-agent returned generic Instagram reels that only matched the word "heritage" without being truly relevant to the content concept. The references were not useful for guiding actual content creation.

### Suggested Action
- Improve reference finding workflow with more specific search queries
- Add brand/style matching criteria before searching
- Require sub-agent to validate relevance before returning references
- Consider searching for specific visual styles (e.g., "building inspection storytelling", "property reveal transitions") rather than topic keywords alone

### Metadata
- Source: user_feedback
- Related Files: clients/proofit-references/apr18-heritage-inspection.md
- Tags: reference-finding, content-planning, sub-agent

---