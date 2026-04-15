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

## Content Tracker

- **Master Tracker:** https://docs.google.com/spreadsheets/d/1r88lan_EraSgY0vkZiDEJ8DCctubtMFzmbplLimw550/edit
- **Overview tab:** All clients summary
- **Sync:** Read from individual client sheets, update Overview

---

Add whatever helps you do your job. This is your cheat sheet.