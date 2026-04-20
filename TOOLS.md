# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## API Keys

### Prismfy Search
- **API Key:** `$env:PRISMFY_API_KEY` (set as Windows user env var)
- **Usage:** Default web search (fallback: DuckDuckGo via ollama_web_search)
- **Homepage:** https://prismfy.io

### Apify (Instagram Scraper)
- **API Key:** `$env:APIFY_API_KEY` (set as Windows user env var)
- **Usage:** Fetch Instagram posts/reels for reference analysis
- **Actors:**
  - Post Scraper: `leadsbrary~instagram-post-scraper` (for specific post URLs)
  - Profile Scraper: `apify~instagram-profile-scraper` (for account overviews)
- **Free tier:** $5/month credit (~1,500 posts or ~1,900 profiles)

### Buffer (Social Media Scheduler)
- **API Token:** `$env:BUFFER_API_TOKEN` (set as Windows user env var)
- **API Endpoint:** `https://api.buffer.com`
- **Usage:** Schedule posts to Instagram, Facebook, LinkedIn, X, Pinterest
- **Docs:** https://developers.buffer.com

### Postoria (Social Media Scheduler) - BACKUP
- **URL:** https://app.postoria.io/
- **Email:** theorangematrixteam@gmail.com
- **Password:** OrangematrixPostoria123
- **Usage:** Schedule posts to Instagram, Facebook, LinkedIn, etc.
- **Plan:** Free (10 accounts, 50 posts/month)

---

## Git Backup

- **Repo:** https://github.com/theorangematrixteam/openclaw
- **Branch:** main
- **Local:** C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace

---

## Obsidian Vault

- **Path:** C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-workspace
- **Structure:**
  - memory/ — Daily notes and session memory
  - clients/ — Client profiles and references
  - projects/ — Project planning
  - references/ — Content references

---

## Google Sheets (via gog)

- **Orange Matrix Content Plan:** 1aCPqWjfgWqCY24zhnwchKzq1HfIOIK0yEgSmbOmTJu4
- **Notch India Plan:** 1B5yYr7COjW_2gtfiehB_QZdzCw8-8BB1Yb5OMqo76w4
- **Proofit Plan:** 1I_kzeojMYeNSTL6Os2NvXTH5ukSVmBx8JUx6nWZyb30

---

## Clients Folder

- **Drive Folder:** clients/ (1i00PuNbLQCnedpPbEvPLChO-8SlYSW2y)
- **Notch India References Sheet:** 1ZXHMy97kHNKrfOCg2ySJowSspFESTWhZ3ujfl13cGDo
- **Proofit References Sheet:** 1UoJFFo50hKri9mh8FV6G8A2M-bKJY_xAIrI8jO3s6eM

---

## Client Retention & Management System

- **Sheet ID:** 1qRMC8GQ4tl10zRSfFg4imRQ0URqYKSnvdTP-mfxLIrI
- **URL:** https://docs.google.com/spreadsheets/d/1qRMC8GQ4tl10zRSfFg4imRQ0URqYKSnvdTP-mfxLIrI/edit
- **Tabs:** Client Database, Payment Tracker, Health Monitor, Delivery Log, Follow-up Queue, Lifecycle Tracker, Communication Log
- **Sync:** Reads from Core sheet Clients tab + Money Manager

---

## Content Tracker

- **Master Tracker:** https://docs.google.com/spreadsheets/d/1r88lan_EraSgY0vkZiDEJ8DCctubtMFzmbplLimw550/edit
- **Overview tab:** All clients summary
- **Sync:** Read from individual client sheets, update Overview

---

## ComfyUI (Local Image Generation)

- **Port:** 8000 (not default 8188)
- **GPU:** RTX 5090 (32GB VRAM)
- **MCP:** Configured in openclaw.json under `mcp.servers.ComfyUI`
- **Skill:** `skills/canva/SKILL.md` has full working workflow + all tools
- **Models:**
  - `z_image_turbo_bf16.safetensors` (diffusion_models/z-image/)
  - `qwen_3_4b.safetensors` (text_encoders/)
  - `ae.safetensors` (vae/)
- **Output dir:** `C:\Users\USER\Desktop\comfyui_new\output` (not directly accessible)
- **Fetch images via API:** `GET http://localhost:8000/view?filename=<name>` then save locally
- **Save locally to:** `C:\Users\openclaw.BILLION-DOLLAR-\Documents\ComfyUI\output\`
- **Cold start:** ~52s | **Cached models:** ~6-28s per image
- **Known issue:** `flash-attn` can't build (CUDA 12.8 vs torch 13.0) — models work without it
- **Don't install packages without asking Jinay**
- **Save Z-Image outputs to:** `Desktop\ComfyUi_Python_new\outputs\z-image-generations`
- **Save upscaled images to:** `Desktop\ComfyUi_Python_new\outputs\upscaled_images`
- **QC pipeline:** qwen3.5:9b vision model reviews images for disfigurement, text artifacts, weird clothing
- **Taste profile:** `memory/jinay-visual-taste.md` — always reference before generating
- **Auto-start ComfyUI:** `Start-Process "C:\Users\openclaw.BILLION-DOLLAR-\AppData\Local\Programs\ComfyUI\ComfyUI.exe"`

## Canva (Design Platform)

- **MCP:** Configured in openclaw.json under `mcp.servers.Canva`
- **OAuth:** Already authorized
- **Canva Pro** (₹799/mo) required for "Generate design" feature
- **Skill:** `skills/canva/SKILL.md` has all tools and workflows
- **Folder:** "Orange Matrix" created in root
- **Full pipeline:** ComfyUI generates image → upload to Canva → create/export design