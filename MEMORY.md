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
- Primary: **GLM-5.1 (cloud)** — all tasks
- Vision: **gemma4:30b cloud** — vision only
- No local models for now

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

## Important
- Never restart gateway without Jinay's permission
- Never send emails without double confirmation
- Always read everything in full — no skimming
- Money-first: revenue tasks always prioritized
- **Never send emails without double confirmation**
- **NEVER send any outbound message (email, DM, WhatsApp) without drafting first and getting Jinay's explicit approval**
- This includes test messages — no exceptions
- Outbound email framework: Trigger→Problem→Solution→Proof→Ask, 50-125 words, free sample reel offer, one-stop solution pitch
- **48 Laws of Power for outreach/retention:** Never criticize prospect's current state, give before asking (Law 13), don't chase (Law 16), make it seem effortless (Law 30), friend tone not seller tone, remove all pressure, show don't tell, specificity builds trust
- Full psychology principles saved in memory/2026-04-21.md
- Email channels working: gog gmail send (instant), Instagram DM (cookie-based), WhatsApp (skipped — session doesn't persist)
- **Discord issue** (Apr 24) — Jinay flagged something wrong, asked about reinstalling