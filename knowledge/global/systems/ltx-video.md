# LTX 2.3 Video Generation Setup

- **Scope**: global
- **Agent**: sarah
- **Created**: 2026-04-25
- **Updated**: 2026-04-25
- **Status**: verified

## Models Location
- Checkpoint: `Documents\ComfyUI\models\checkpoints\ltx-2.3-22b-dev-fp8.safetensors`
- Text encoder: `Documents\ComfyUI\models\text_encoders\gemma_3_12B_it_fp4_mixed.safetensors`
- Tokenizer: `Documents\ComfyUI\models\text_encoders\tokenizer.model`
- Distilled LoRA: `Documents\ComfyUI\models\loras\ltx\ltx-2.3-22b-distilled-lora-384.safetensors`
- Abliterated LoRA: `Documents\ComfyUI\models\loras\ltx\gemma-3-12b-it-abliterated_lora_rank64_bf16.safetensors`
- Spatial upscaler: `Documents\ComfyUI\models\latent_upscale_models\ltx-2.3-spatial-upscaler-x2-1.1.safetensors`

## Key Nodes (API)
- `LTXAVTextEncoderLoader` — loads Gemma text encoder WITH checkpoint (required, CLIPLoader doesn't work)
- `LoraLoader` — loads abliterated Gemma LoRA (improves prompt understanding)
- `LoraLoaderModelOnly` — loads distilled LoRA (speed boost, some quality tradeoff)
- `TextGenerateLTX2Prompt` — prompt enhancer (highly recommended)
- `LTXVConditioning` — wraps positive/negative conditioning with frame_rate
- `CFGGuider` — takes MODEL (not conditioning), positive, negative, CFG
- `EmptyLTXVLatentVideo` — creates empty latent (width, height, length, batch_size)
- `LTXVConcatAVLatent` / `LTXVSeparateAVLatent` — for audio+video latent
- `LTXVAudioVAELoader` — loads audio VAE from checkpoint
- `LTXVEmptyLatentAudio` — creates empty audio latent
- `SamplerCustomAdvanced` — takes noise, guider, sampler, sigmas, latent
- `ManualSigmas` — ONLY for refinement pass (not full generation!)
- `BasicScheduler` — generates sigmas for full generation (use with karras)
- `VAEDecodeTiled` — decodes video latent to frames
- `LTXVLatentUpsampler` — spatial upscale 2x (needs `LatentUpscaleModelLoader`)

## T2V Pipeline (Working)
Best results so far: v8/v11 approach
1. `CheckpointLoaderSimple` → load fp8 checkpoint
2. `LTXAVTextEncoderLoader` → load Gemma text encoder
3. `LoraLoader` → load abliterated Gemma LoRA
4. `TextGenerateLTX2Prompt` → enhance prompt
5. `CLIPTextEncode` × 2 → positive + negative
6. `LTXVConditioning` → wrap with frame_rate
7. `CFGGuider` → model + conditioning + CFG
8. `EmptyLTXVLatentVideo` + `LTXVConcatAVLatent` → build latent
9. `SamplerCustomAdvanced` with `BasicScheduler(karras, 25-30 steps)` → sample
10. `LTXVSeparateAVLatent` → split audio/video
11. `VAEDecodeTiled` → decode
12. `CreateVideo` + `SaveVideo`

## Settings That Work
- CFG: 3-4 (lower = more creative, higher = more prompt adherence)
- Sampler: dpmpp_2m_sde + karras scheduler
- Steps: 25-30 (without distilled LoRA), 8-9 with manual sigmas (with distilled LoRA)
- Resolution: 768×512 (native), upscale with spatial upscaler for 1536×1024
- Prompt enhancer: ON (TextGenerateLTX2Prompt)
- Abliterated LoRA: ON (strength 1)

## Settings That DON'T Work
- `CLIPLoader` with `type: "ltxv"` — produces wrong embedding dimensions
- `ManualSigmas` for full generation — produces noise (only for refinement)
- KSampler (generic) — works but SamplerCustomAdvanced is better
- 2-stage upscale pipeline — amplifies artifacts, makes output worse
- Resolution below 768×512 — produces garbage
- CFG above 8 — oversaturated, neon colors
- Without prompt enhancer — model hallucinates less coherent scenes

## QC Results (gemma4:e4b)
- v5 (768×512, KSampler, CFG 8): garbage, wrong nodes
- v6 (ManualSigmas, CFG 4): noise — sigmas are for refinement only
- v7 (BasicScheduler, CFG 4, distilled LoRA): blurry, soft
- v8 (no distilled LoRA, CFG 3, 30 steps): foggy/hazy, 7/10
- v9 (2-stage upscale): oversaturated, color bleeding, 2/10
- v10 (no distilled LoRA, karras, 30 steps): foggy, 7/10
- v11 (distilled LoRA 0.3, karras, 25 steps, CFG 4): grainy/film-like, 7/10
- v12 (manual sigmas at 768): noise (same as v6)

## Render Times (RTX 5090)
- 768×512, 3 sec, 25-30 steps: ~60-140s
- 768×512 + spatial upscale 2x + refinement: ~210s