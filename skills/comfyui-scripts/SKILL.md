---
name: comfyui-scripts
version: 1.0.0
description: Run ComfyUI image generation via pre-built Python scripts and workflow JSONs. Faster than building workflows from scratch each time.
---

# ComfyUI Scripts

Generate images by running pre-built Python scripts that talk to ComfyUI's API. No more rebuilding workflows from scratch — just pass a prompt.

## When to Use

- "Generate an image of [description]" (txt2img)
- "Run the Z-Image script with this prompt"
- "Generate multiple images with these prompts"
- "Create a batch of images from a prompts file"

## Architecture

Each workflow has two files:
1. **JSON workflow** — ComfyUI API format with node IDs, wired to our models
2. **Python script** — CLI tool that injects prompts/settings, queues to ComfyUI, downloads output

Scripts save to `Desktop\ComfyUi_Python_new\outputs\<workflow_name>/` — same structure as Jinay's original setup.

## Our ComfyUI Setup

- **Port:** 8000 (not default 8188)
- **GPU:** RTX 5090 (32GB VRAM)
- **Models:**
  - Diffusion: `z-image\z_image_turbo_bf16.safetensors`
  - Text encoder: `qwen_3_4b.safetensors` (type: lumina2)
  - VAE: `ae.safetensors`

## Available Scripts

### 1. Z-Image Turbo (txt2img)

**Location:** `comfyui-scripts/z_image_turbo.py`
**Workflow:** `comfyui-scripts/z_image_turbo.json`
**Output:** `Desktop\ComfyUi_Python_new\outputs\z_image_prompt_reader_outputs\`

**Usage:**
```bash
python comfyui-scripts/z_image_turbo.py --prompt "your prompt here"
python comfyui-scripts/z_image_turbo.py --prompt "prompt" --count 3
python comfyui-scripts/z_image_turbo.py --prompts-file prompts.json
```

**Options:**
| Flag | Default | Description |
|------|---------|-------------|
| `-p/--prompt` | — | Single prompt |
| `-f/--prompts-file` | — | JSON file with prompts (dict or list) |
| `-n/--count` | 1 | Images per prompt |
| `-W/--width` | 1152 | Image width |
| `-H/--height` | 1152 | Image height |
| `-s/--steps` | 9 | Sampling steps |
| `--cfg` | 1 | CFG scale |
| `--shift` | 3 | ModelSamplingAuraFlow shift |
| `--seed` | random | Fixed seed |
| `--prefix` | zimage | Output filename prefix |

**Workflow node map:**
| Node ID | Type | Purpose |
|---------|------|---------|
| 39 | CLIPLoader | qwen_3_4b, type lumina2 |
| 40 | VAELoader | ae.safetensors |
| 41 | EmptySD3LatentImage | Resolution |
| 42 | ConditioningZeroOut | Negative conditioning |
| 43 | VAEDecode | Decode latents |
| 44 | KSampler | res_multistep/simple/9steps/cfg1 |
| 45 | CLIPTextEncode | Prompt text |
| 46 | UNETLoader | z-image turbo |
| 47 | ModelSamplingAuraFlow | shift=3 |
| 148 | SaveImage | Output |

**Key learnings:**
- Must use UNETLoader + CLIPLoader(type=lumina2) — NOT CheckpointLoaderSimple
- Must use ConditioningZeroOut for negative — NOT empty CLIPTextEncode
- Must use ModelSamplingAuraFlow(shift=3) between UNETLoader and KSampler
- `ETN_SendImageWebSocket` is NOT installed — use SaveImage + HTTP polling instead
- Model path must use `z-image\` (hyphen) — underscores cause 400 errors

## Adding New Workflows

When adding a new workflow:
1. Build the workflow in ComfyUI UI and save it
2. Export as API format JSON to `comfyui-scripts/<name>.json`
3. Create a Python script `comfyui-scripts/<name>.py` following the pattern:
   - Load workflow JSON
   - Inject user inputs (prompt, seed, images) into correct node IDs
   - Queue via POST to `http://127.0.0.1:8000/prompt`
   - Poll `/history/{prompt_id}` until complete
   - Download from `/view?filename=...` and save to output dir
4. Set output dir to `Desktop\ComfyUi_Python_new\outputs\<workflow_name>/`
5. Test with `--prompt` before batch use

## Script Template Pattern

```python
# Core flow:
1. load_workflow(path) — read JSON
2. queue_prompt(workflow) — POST to /prompt
3. wait_for_completion(prompt_id) — poll /history
4. get_output_images(history) — parse output node
5. download_image(filename) — GET /view
6. Save to OUTPUT_DIR
```

## Python Dependencies

- `websocket-client` (installed)
- `Pillow` (installed)
- System Python at `C:\Users\openclaw.BILLION-DOLLAR-\AppData\Local\Programs\Python\Python312\`