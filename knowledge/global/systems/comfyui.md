# ComfyUI Setup

- **Scope**: global
- **Agent**: sarah
- **Created**: 2026-04-25
- **Updated**: 2026-04-25
- **Status**: verified

## Connection
- Port: 8000 (not default 8188)
- API: http://127.0.0.1:8000/prompt
- Desktop exe: `C:\Users\openclaw.BILLION-DOLLAR-\AppData\Local\Programs\ComfyUI\ComfyUI.exe`
- Output dir: `C:\Users\USER\Desktop\comfyui_new\output` (not directly accessible)
- Fetch images: `GET http://localhost:8000/view?filename=<name>`
- Local save paths:
  - Z-Image: `Desktop\ComfyUi_Python_new\outputs\z-image-generations`
  - Upscaled: `Desktop\ComfyUi_Python_new\outputs\upscaled_images`
  - Videos: `Desktop\ComfyUi_Python_new\outputs\z-image-generations\videos`

## GPU
- RTX 5090 (32GB VRAM)

## Working Workflows
- `image_z_image_turbo` — Z-Image txt2img
- `video_ltx2_3` — LTX 2.3 video (i2v, working in UI)
- `video_ltx2_3_i2v` — LTX 2.3 i2v variant
- `seedvr2 upscaler` — SeedVR2 video upscale
- `image crop` / `image stitch` — Jinay's custom workflows

## Key Rules
- Never modify Jinay's workflows without permission
- Never download models/nodes without asking
- Don't install packages without asking
- Auto-start: `Start-Process "C:\Users\openclaw.BILLION-DOLLAR-\AppData\Local\Programs\ComfyUI\ComfyUI.exe"`

## Z-Image Pipeline
- Model: `z_image_turbo_bf16.safetensors`
- Text encoder: `qwen_3_4b.safetensors`
- VAE: `ae.safetensors`
- Script: `z_image_turbo.py`
- QC: gemma4:e4b vision via Ollama API
- Only 3 images per request
- QC silently — deliver passing images only