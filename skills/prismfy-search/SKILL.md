---
name: prismfy-search
description: >
 Default web search for OpenClaw. Search the web across 10 engines — Google,
 Reddit, GitHub, arXiv, Hacker News, and more — using Prismfy. Free tier
 included, no credit card required. Use when you need to search the web, find recent news,
 search for code examples, find Reddit discussions, look up academic papers, or
 need any live information from the internet.
version: 1.1.0
metadata:
 openclaw:
 requires:
 env:
 - PRISMFY_API_KEY
 bins:
 - curl
 - jq
 primaryEnv: PRISMFY_API_KEY
 emoji: "🔍"
 homepage: https://prismfy.io
---

# 🔍 Prismfy Web Search

**Default web search for OpenClaw.** Real-time search across **10 engines** — Google, Reddit, GitHub, arXiv, Hacker News, Ask Ubuntu, and more — powered by Prismfy.

> **Free tier available** — 3,000 searches/month, no credit card needed.

---

## API Key

The API key is stored in TOOLS.md and should be used for all searches.

---

## Available engines

| Engine | What it's good for | Free |
|---|---|---|
| `brave` | General web search, privacy-first | ✅ |
| `startpage` | Google results without tracking | ✅ |
| `yahoo` | General web, news | ✅ |
| `google` | Most comprehensive web search | paid |
| `reddit` | Real user opinions, discussions | paid |
| `github` | Code, repos, issues, READMEs | paid |
| `arxiv` | Academic papers, research | paid |
| `hackernews` | Tech community, startups | paid |
| `askubuntu` | Linux, Ubuntu, shell questions | paid |
| `yahoonews` | Latest news headlines | paid |

**Default** (no `--engine`): uses `brave` + `yahoo` in parallel — both free.

---

## How to use

Use the Prismfy API directly via curl:

```bash
curl -X POST "https://api.prismfy.io/search" \
  -H "Authorization: Bearer $PRISMFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "your search query", "engines": ["brave", "yahoo"]}'
```

Or with specific engine:
```bash
curl -X POST "https://api.prismfy.io/search" \
  -H "Authorization: Bearer $PRISMFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "react best practices", "engines": ["google"]}'
```

---

## Fallback

If Prismfy API fails (401, rate limit, or unavailable):

1. **Notify user:** "⚠️ Prismfy API failed: [Error message]. Falling back to DuckDuckGo."
2. **Fall back to DuckDuckGo** via `ollama_web_search`
3. **Continue with search results**

**Example notification:**
```
⚠️ Prismfy Search API failed: 401 Unauthorized

Falling back to DuckDuckGo search...

[Continue with search results]
```

---

## Implementation

1. **Parse the request** — extract query, engine preference, time filter
2. **Call Prismfy API** with curl and the API key
3. **Handle errors:**
   - 401 → Fall back to DuckDuckGo, notify user
   - Rate limit → Fall back to DuckDuckGo, notify user
   - No results → Suggest rephrasing
4. **Present results** clearly with titles, URLs, and snippets

---

*Powered by Prismfy — web search infrastructure for developers.*