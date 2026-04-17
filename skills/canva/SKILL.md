---
name: canva
version: 2.0.0
description: Create, export, and manage Canva designs via MCP. Generate AI images with ComfyUI, upload to Canva, and build complete design pipelines.
---

# Canva + ComfyUI Design Pipeline

Create, export, and manage Canva designs. Generate AI images locally via ComfyUI, upload to Canva, and build complete content pipelines.

## When to Use

- "Create an Instagram post about [topic]"
- "Generate an image of [description] and make a Canva design"
- "Export my Canva design as PNG/PDF"
- "Upload this image to Canva"
- "Resize a design for different platforms"
- "List my Canva designs/folders"

## Setup (Already Done)

### Canva MCP
- Configured in `openclaw.json` under `mcp.servers`
- OAuth authorized — works directly from OpenClaw
- **Canva Pro** (₹799/mo) required for "Generate design" feature

### ComfyUI MCP
- Configured in `openclaw.json` under `mcp.servers`
- ComfyUI Desktop running on port **8000**
- Model: **Z Image Turbo** (z_image_turbo_bf16.safetensors)
- Output saves to `C:\Users\USER\Desktop\comfyui_new\output`
- Fetch images via API: `GET /view?filename=<name>`

## Available Canva Tools

| Tool | What It Does |
|------|-------------|
| `generate-design` | AI-generate designs from a prompt (needs Canva Pro) |
| `search-designs` | Search existing designs by keyword |
| `get-design` | Get design details (title, URL, thumbnail) |
| `get-design-content` | Read text content of a design |
| `get-design-pages` | List pages in a presentation |
| `export-design` | Export as PNG/JPG/PDF/MP4 |
| `get-export-formats` | Check which formats a design supports |
| `create-folder` | Create a folder in Canva |
| `move-item-to-folder` | Move designs/folders |
| `list-folder-items` | List contents of a folder |
| `upload-asset-from-url` | Upload an image from URL |
| `comment-on-design` | Add comment to a design |
| `list-comments` | Get comments on a design |
| `resize-design` | Resize design for different platforms |
| `search-folders` | Search folders by name |
| `import-design-from-url` | Import from URL (PDF, PPTX, etc.) |

## ComfyUI Tools

| Tool | What It Does |
|------|-------------|
| `enqueue_workflow` | Run a ComfyUI workflow |
| `get_job_status` | Check if generation is done |
| `get_history` | Get execution results |
| `list_output_images` | List generated images |
| `upload_image` | Upload image to ComfyUI input dir |
| `list_local_models` | List installed models |
| `create_workflow` | Create workflow from template |
| `modify_workflow` | Modify an existing workflow |
| `validate_workflow` | Validate without running |
| `get_node_info` | Get available node types |
| `get_system_stats` | GPU/VRAM info |

## Z Image Turbo Workflow (Working)

The tested and working txt2img workflow for Z Image Turbo:

```json
{
  "11": {"class_type": "ModelSamplingAuraFlow", "inputs": {"model": ["28", 0], "shift": 3}},
  "13": {"class_type": "EmptySD3LatentImage", "inputs": {"batch_size": 1, "height": 1344, "width": 1088}},
  "27": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["30", 0], "text": "YOUR PROMPT HERE"}},
  "28": {"class_type": "UNETLoader", "inputs": {"unet_name": "z-image\\z_image_turbo_bf16.safetensors", "weight_dtype": "default"}},
  "29": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
  "3": {"class_type": "KSampler", "inputs": {"cfg": 1, "denoise": 1, "latent_image": ["13", 0], "model": ["11", 0], "negative": ["33", 0], "positive": ["27", 0], "sampler_name": "res_multistep", "scheduler": "simple", "seed": 42, "steps": 9}},
  "30": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_3_4b.safetensors", "device": "default", "type": "lumina2"}},
  "33": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["27", 0]}},
  "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["29", 0]}},
  "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "SarahGen", "images": ["8", 0]}}
}
```

### Settings
- **Steps**: 9 (turbo model, fast)
- **CFG**: 1
- **Sampler**: res_multistep / simple
- **Resolution**: 1088x1344 (9:16 portrait, 2MP) — change via ResolutionSelector or EmptySD3LatentImage
- **Generation time**: ~6s with cached models, ~52s cold start (RTX 5090)

### Fetching Generated Images
ComfyUI Desktop saves to a different user's directory. Fetch via API:
```
GET http://localhost:8000/view?filename=SarahGen_00001_.png
```
Save to workspace: `C:\Users\openclaw.BILLION-DOLLAR-\Documents\ComfyUI\output\`

## Common Pipelines

### 1. AI Image → Canva Design
1. Generate image with ComfyUI (enqueue Z Image Turbo workflow)
2. Fetch image via API
3. Upload to Canva with `upload-asset-from-url` or use in `generate-design`

### 2. Canva Design → Export
1. `get-export-formats` to check supported formats
2. `export-design` as PNG/PDF
3. Share download URL

### 3. Batch Content Generation
1. Generate multiple images via ComfyUI (change seed each time)
2. Upload all to Canva
3. Create designs using each image
4. Export for social media

## Other Available Workflows

| Workflow | Description |
|----------|-------------|
| `image_z_image_turbo_fun_union_controlnet.json` | Z Image with ControlNet |
| `klein t2i.json` | FLUX Klein text-to-image |
| `Klein Inpaint.json` | FLUX Klein inpainting |
| `nano banana.json` | Lightweight model |
| `seedvr2 upscaler.json` | Video upscaling |
| `video_ltx2_3_i2v.json` | Image-to-video |

## Notes

- ComfyUI Desktop output dir is `C:\Users\USER\Desktop\comfyui_new\output` (different Windows user, not directly accessible)
- Always fetch images via API (`/view?filename=`) and save to accessible path
- Don't install packages in ComfyUI's venv without asking Jinay first
- `flash-attn` can't be built on this machine (CUDA 12.8 vs torch 13.0 mismatch) — Z Image works without it