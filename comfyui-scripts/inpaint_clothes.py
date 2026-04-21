"""
Inpaint workflow for Totsburg kidswear - inpaints clothing on upscaled images.
Uses Z-Image model with InpaintCropImproved for masking.

Usage:
  python inpaint_clothes.py --input image.png --prompt "toddler boy wearing red t-shirt and white shorts"
  python inpaint_clothes.py --input image.png --prompt "white formal shirt and navy blue trousers" --mask-region top-half
"""

import json
import urllib.request
import urllib.parse
import urllib.error
import base64
import uuid
import time
import os
import sys
import io
import threading
from PIL import Image, ImageDraw
import numpy as np

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ================= CONFIG =================
SERVER_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\inpainted_images"
COMFYUI_INPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Documents\ComfyUI\input"

TIMEOUT = 600
# =========================================

os.makedirs(OUTPUT_DIR, exist_ok=True)


def load_workflow(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def upload_image(image_path, filename=None):
    if filename is None:
        filename = os.path.basename(image_path)
    with open(image_path, "rb") as f:
        image_data = f.read()
    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode() + image_data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{SERVER_URL}/upload/image",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read()).get("name", filename)


def upload_pil_image(pil_image, filename):
    buf = io.BytesIO()
    pil_image.save(buf, format="PNG")
    buf.seek(0)
    image_data = buf.read()
    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode() + image_data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{SERVER_URL}/upload/image",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read()).get("name", filename)


def create_clothing_mask(image_path, region="full"):
    """Create a mask for the clothing area of a standing toddler.
    region: 'full' (t-shirt + shorts), 'top' (t-shirt only), 'bottom' (shorts only)
    """
    img = Image.open(image_path)
    w, h = img.size

    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)

    if region == "top":
        # T-shirt area: roughly 15%-55% height, 20%-80% width
        draw.rectangle([int(w*0.20), int(h*0.15), int(w*0.80), int(h*0.55)], fill=255)
    elif region == "bottom":
        # Shorts area: roughly 50%-70% height, 25%-75% width
        draw.rectangle([int(w*0.25), int(h*0.50), int(w*0.75), int(h*0.70)], fill=255)
    else:  # full
        # T-shirt + shorts: 15%-70% height, 20%-80% width
        draw.rectangle([int(w*0.20), int(h*0.15), int(w*0.80), int(h*0.70)], fill=255)

    return mask


def queue_prompt(workflow, client_id):
    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")
    req = urllib.request.Request(
        f"{SERVER_URL}/prompt",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())


def wait_for_completion(prompt_id):
    start = time.time()
    while True:
        if time.time() - start > TIMEOUT:
            raise TimeoutError(f"Timed out after {TIMEOUT}s")
        try:
            req = urllib.request.Request(f"{SERVER_URL}/history/{prompt_id}")
            with urllib.request.urlopen(req, timeout=10) as resp:
                history = json.loads(resp.read())
        except Exception:
            time.sleep(2)
            continue
        if prompt_id in history:
            entry = history[prompt_id]
            status = entry.get("status", {})
            if status.get("status_str") == "error":
                raise RuntimeError(f"Execution error: {status}")
            if "outputs" in entry:
                return entry
        time.sleep(2)


def download_image(filename, subfolder="", img_type="output"):
    params = urllib.parse.urlencode({
        "filename": filename,
        "subfolder": subfolder,
        "type": img_type,
    })
    req = urllib.request.Request(f"{SERVER_URL}/view?{params}")
    with urllib.request.urlopen(req) as response:
        return Image.open(io.BytesIO(response.read())).copy()


def inpaint(image_path, prompt, region="full", seed=None):
    """Inpaint clothing area on an image using Z-Image."""
    if seed is None:
        seed = int(time.time()) % 2**31

    # Create mask
    print("Creating clothing mask...")
    mask = create_clothing_mask(image_path, region=region)

    # Upload image and mask
    print("Uploading image and mask...")
    img_filename = upload_image(image_path)
    mask_filename = upload_pil_image(mask, f"mask_{os.path.splitext(os.path.basename(image_path))[0]}.png")

    # Build workflow
    workflow = {
        # Load original image
        "4": {
            "inputs": {"image": img_filename},
            "class_type": "LoadImage",
            "_meta": {"title": "Load Image"}
        },
        # Load mask
        "9": {
            "inputs": {"image": mask_filename, "channel": "red"},
            "class_type": "LoadImageMask",
            "_meta": {"title": "Load Mask"}
        },
        # Crop around mask for inpainting
        "3": {
            "inputs": {
                "image": ["4", 0],
                "mask": ["9", 0],
                "downscale_algorithm": "lanczos",
                "upscale_algorithm": "lanczos",
                "preresize": False,
                "preresize_mode": "ensure minimum resolution",
                "preresize_min_width": 1024,
                "preresize_min_height": 1024,
                "preresize_max_width": 16384,
                "preresize_max_height": 16384,
                "mask_fill_holes": True,
                "mask_expand_pixels": 16,
                "mask_invert": False,
                "mask_blend_pixels": 32,
                "mask_hipass_filter": 0.1,
                "extend_for_outpainting": False,
                "extend_up_factor": 1.0,
                "extend_down_factor": 1.0,
                "extend_left_factor": 1.0,
                "extend_right_factor": 1.0,
                "context_from_mask_extend_factor": 1.2,
                "output_resize_to_target_size": False,
                "output_target_width": 1024,
                "output_target_height": 1024,
                "output_padding": "32",
                "device_mode": "gpu (much faster)"
            },
            "class_type": "InpaintCropImproved",
            "_meta": {"title": "Inpaint Crop"}
        },
        # Z-Image model
        "46": {
            "inputs": {
                "unet_name": "z-image\\z_image_turbo_bf16.safetensors",
                "weight_dtype": "default"
            },
            "class_type": "UNETLoader",
            "_meta": {"title": "Load Diffusion Model"}
        },
        "47": {
            "inputs": {
                "shift": 3,
                "model": ["46", 0]
            },
            "class_type": "ModelSamplingAuraFlow",
            "_meta": {"title": "ModelSamplingAuraFlow"}
        },
        "39": {
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "lumina2",
                "device": "default"
            },
            "class_type": "CLIPLoader",
            "_meta": {"title": "Load CLIP"}
        },
        "40": {
            "inputs": {
                "vae_name": "ae.safetensors"
            },
            "class_type": "VAELoader",
            "_meta": {"title": "Load VAE"}
        },
        # Positive prompt
        "45": {
            "inputs": {
                "text": prompt,
                "clip": ["39", 0]
            },
            "class_type": "CLIPTextEncode",
            "_meta": {"title": "Positive Prompt"}
        },
        # Negative (zero out)
        "42": {
            "inputs": {
                "conditioning": ["45", 0]
            },
            "class_type": "ConditioningZeroOut",
            "_meta": {"title": "Negative (ZeroOut)"}
        },
        # VAE Encode the cropped image
        "50": {
            "inputs": {
                "pixels": ["3", 1],
                "vae": ["40", 0]
            },
            "class_type": "VAEEncode",
            "_meta": {"title": "VAE Encode"}
        },
        # Set latent noise mask from the cropped mask
        "51": {
            "inputs": {
                "samples": ["50", 0],
                "mask": ["3", 2]
            },
            "class_type": "SetLatentNoiseMask",
            "_meta": {"title": "Set Latent Noise Mask"}
        },
        # KSampler
        "44": {
            "inputs": {
                "seed": seed,
                "steps": 9,
                "cfg": 1.0,
                "sampler_name": "res_multistep",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["47", 0],
                "positive": ["45", 0],
                "negative": ["42", 0],
                "latent_image": ["51", 0]
            },
            "class_type": "KSampler",
            "_meta": {"title": "KSampler"}
        },
        # VAE Decode
        "43": {
            "inputs": {
                "samples": ["44", 0],
                "vae": ["40", 0]
            },
            "class_type": "VAEDecode",
            "_meta": {"title": "VAE Decode"}
        },
        # Stitch back
        "5": {
            "inputs": {
                "stitcher": ["3", 0],
                "inpainted_image": ["43", 0]
            },
            "class_type": "InpaintStitchImproved",
            "_meta": {"title": "Inpaint Stitch"}
        },
        # Save
        "148": {
            "inputs": {
                "filename_prefix": "inpainted",
                "images": ["5", 0]
            },
            "class_type": "SaveImage",
            "_meta": {"title": "Save Image"}
        }
    }

    # Queue
    print(f"Queueing inpaint workflow (seed={seed})...")
    try:
        response = queue_prompt(workflow, uuid.uuid4().hex)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f"X HTTP {e.code}: {body[:500]}")
        return []
    except Exception as e:
        print(f"X Queue error: {e}")
        return []

    prompt_id = response.get("prompt_id")
    if not prompt_id:
        print("X No prompt_id")
        return []

    print(f"Queued: {prompt_id[:8]}...")

    try:
        history = wait_for_completion(prompt_id)
    except TimeoutError:
        print("X Timed out")
        return []
    except RuntimeError as e:
        print(f"X {e}")
        return []

    # Get output
    saved_paths = []
    for node_id, node_output in history.get("outputs", {}).items():
        if "images" in node_output:
            for img_info in node_output["images"]:
                try:
                    img = download_image(
                        img_info["filename"],
                        img_info.get("subfolder", ""),
                        img_info.get("type", "output"),
                    )
                    base_name = os.path.splitext(os.path.basename(image_path))[0]
                    output_file = os.path.join(OUTPUT_DIR, f"inpainted_{base_name}.png")
                    img.save(output_file)
                    print(f"OK {output_file}")
                    saved_paths.append(output_file)
                except Exception as e:
                    print(f"X Download failed: {e}")

    return saved_paths


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Inpaint clothing on Totsburg images")
    parser.add_argument("--input", "-i", type=str, required=True, help="Path to input image")
    parser.add_argument("--prompt", "-p", type=str, default="cute South Asian toddler boy 1 year old wearing red t-shirt and blue shorts on pure white studio background, bright even studio lighting, professional product photography",
                        help="Prompt for inpainting")
    parser.add_argument("--region", "-r", type=str, default="full",
                        choices=["full", "top", "bottom"],
                        help="Mask region: full (t-shirt+shorts), top (t-shirt only), bottom (shorts only)")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Image not found: {args.input}")
        sys.exit(1)

    print(f"Input: {args.input}")
    print(f"Prompt: {args.prompt}")
    print(f"Region: {args.region}")

    result = inpaint(args.input, args.prompt, region=args.region, seed=args.seed)
    print(f"\nDone! {len(result)} images saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()