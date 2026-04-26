# MEMORY.md — Long-Term Memory

## Who
- **Jinay** — Founder of Orange Matrix. Wants systems-first so the business runs without him. Blunt, fast, money-first.

## Active Clients
- **Notch India** — Women's fashion brand (soft launch Apr 21). Visual style: white architectural minimalist sets, editorial photography, quiet luxury.
- **Proofit** — Property inspection (Priyal is founder)
- **Orikai** — Startup (Yashvi is founder)
- **Totsburg** — Kidswear (Naman is client, catalogue in progress)
  - Visual rules: Caucasian subjects, torso clearance 80%+, outward-facing dynamics, interaction over action, contact shadows, fabric texture
  - ComfyUI `run_crop_per_mask.py` — per-subject masking for outfit swaps

## Key Systems
- **Buffer API** (GraphQL) — social media scheduling
- **Metricool** — analytics + free scheduling
- **ComfyUI** (port 8000) — local image generation (Z-Image workflow)
- **Canva MCP** — design creation
- **gog CLI** — Google Sheets, Calendar, Drive, Gmail
- **Apify** — Instagram scraping
- **Whisper.cpp** — local audio transcription

## ComfyUI Scripts
- `z_image_turbo.py` — txt2img with Z-Image
- `logo_paster.py` / `batch_logo_paster.py` — logo overlay (ETN WebSocket)
- `upscaler.py` / `batch_upscaler.py` — SeedVR2 upscale (ETN WebSocket)
- `run_crop_v2.py` — Jinay's image_crop workflow (SAM3 + InpaintCrop + MaskPreview+)
- `run_stitch.py` — Jinay's image_stitch workflow (SAM3 + Crop + Stitch)
- **Rule:** Never modify Jinay's workflows or add Z-Image to them. Use strictly as-is.
- **Rule:** Never download models/install nodes without asking Jinay first.

## Model Config
- **Kimi 2.6 (moonshotai/kimi-k2-0711)** — ALL tasks including vision. Multimodal model.
- Fallback: GLM-5.1 only if Kimi fails
- No local models, no gemma4, no other models

## Hiring
- **WorkIndia** listing active for Content Creator role
- **Internshala** listing active
- Hiring is open but not urgent — reviewing applications as they come

## Outbound Database
- 12 cold emails sent (Apr 22) to fashion brands
- Next follow-up batch: Apr 26
- IG DMs blocked — need to follow brands first from @theorangematrix

## Recurring
- Gog reauth every 6 days (cron set)
- Daily morning briefing at 10:30 AM IST
- Heartbeat every 10 min

## Outbound Autonomous System — APPROVED
**Jinay approved full autonomy on Apr 26:**
- **Outbound emails:** Auto-send without approval (was: require double confirmation)
- **Follow-ups:** Auto-personalize from sheet data and send on schedule
- **Reply handling:** Alert Jinay immediately when any lead replies
- **Tone:** Kind, respectful, human-sounding. NEVER automated-feeling
- **Must include in every email:** theorangematrix.com + phone number (91 7977147253)
- **Daily limit:** Max 30 emails/day (leads + follow-ups combined)
- **Schedule:** 11 AM IST daily — find 10 new leads, email them, follow up on old ones
- **Data quality:** Verify all emails are real before sending. No fake emails. Fill all sheet blanks.
- **Daily report:** Message #outbound Discord with what was done

**Status workflow:**
- New → Contacted (initial email sent)
- Contacted → Follow-up 1 (Day 4)
- Follow-up 1 → Follow-up 2 (Day 9)
- Follow-up 2 → Breakup (Day 14)
- Any reply → Replied → Alert Jinay
- Jinay handles replies manually

**Reply detection:** Check inbox for replies from lead emails. Alert immediately.
- This includes test messages — no exceptions
- Outbound email framework: Trigger→Problem→Solution→Proof→Ask, 50-125 words, free sample reel offer, one-stop solution pitch
- **48 Laws of Power for outreach/retention:** Never criticize prospect's current state, give before asking (Law 13), don't chase (Law 16), make it seem effortless (Law 30), friend tone not seller tone, remove all pressure, show don't tell, specificity builds trust
- Full psychology principles saved in memory/2026-04-21.md
- Email channels working: gog gmail send (instant), Instagram DM (cookie-based), WhatsApp (skipped — session doesn't persist)
- **Discord issue** (Apr 24) — Jinay flagged something wrong, asked about reinstalling
- **Discord #general channel ID:** 1489858409376514200 (guild: 1489858408919203861)
- **Push to Discord:** `openclaw message send --channel discord --target "channel:1489858409376514200" --message "<msg>"` — use for proactive alerts, not routine checks
- **Rule:** Push actionable items to Discord #general, not just webchat. Jinay wants systems that work without him checking.

## Knowledge System
- **Global knowledge**: `knowledge/global/` — shared across all agents (clients, systems, models, facts)
- **Private knowledge**: `knowledge/private/{agent-id}/` — per-agent only, prevents hallucination
- Default save location: private (when user says "remember this")
- Global save: when user says "make it global" or "save for everyone"
- See `knowledge/README.md` for full structure and rules