"""
Run Jinay's image_crop workflow exactly as-is.
SAM3 segments → InpaintCropImproved crops → PreviewImage

Usage:
  python run_crop.py --input image.png
  python run_crop.py --input image.png --sam-prompt "shirt shorts"
"""

import json
import urllib.request
import urllib.parse
import urllib.error
import uuid
import time
import os
import sys
import io
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SERVER_URL = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\masked"
TIMEOUT = 600

os.makedirs(OUTPUT_DIR, exist_ok=True)


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


# Jinay's exact image_crop workflow
WORKFLOW_TEMPLATE = {
    "3": {
        "inputs": {
            "downscale_algorithm": "lanczos",
            "upscale_algorithm": "lanczos",
            "preresize": False,
            "preresize_mode": "ensure minimum resolution",
            "preresize_min_width": 1024,
            "preresize_min_height": 1024,
            "preresize_max_width": 16384,
            "preresize_max_height": 16384,
            "mask_fill_holes": True,
            "mask_expand_pixels": 512,
            "mask_invert": False,
            "mask_blend_pixels": 64,
            "mask_hipass_filter": 0.1,
            "extend_for_outpainting": False,
            "extend_up_factor": 1,
            "extend_down_factor": 1,
            "extend_left_factor": 1,
            "extend_right_factor": 1,
            "context_from_mask_extend_factor": 1,
            "output_resize_to_target_size": True,
            "output_target_width": 1080,
            "output_target_height": 1920,
            "output_padding": "0",
            "device_mode": "gpu (much faster)",
            "image": ["4", 0],
            "mask": ["8", 1]
        },
        "class_type": "InpaintCropImproved",
        "_meta": {"title": "Inpaint Crop"}
    },
    "4": {
        "inputs": {"image": "placeholder.png"},
        "class_type": "LoadImage",
        "_meta": {"title": "Load Image"}
    },
    "7": {
        "inputs": {"images": ["3", 1]},
        "class_type": "PreviewImage",
        "_meta": {"title": "Preview Image"}
    },
    "8": {
        "inputs": {
            "prompt": "shirt shorts clothing",
            "threshold": 0.5,
            "min_width_pixels": 0,
            "min_height_pixels": 0,
            "use_video_model": False,
            "unload_after_run": False,
            "object_ids": "",
            "image": ["4", 0]
        },
        "class_type": "SAM3Segmentation",
        "_meta": {"title": "SAM3 Segmentation"}
    }
}


def run_crop(image_path, sam_prompt="shirt shorts clothing"):
    """Run Jinay's image_crop workflow exactly."""
    import copy
    workflow = copy.deepcopy(WORKFLOW_TEMPLATE)
    
    # Upload image
    img_filename = upload_image(image_path)
    workflow["4"]["inputs"]["image"] = img_filename
    workflow["8"]["inputs"]["prompt"] = sam_prompt
    
    # Queue
    print(f"Running image crop (SAM3: '{sam_prompt}')...")
    client_id = uuid.uuid4().hex
    try:
        response = queue_prompt(workflow, client_id)
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
    except Exception as e:
        print(f"X Failed: {e}")
        return []
    
    # Get outputs
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
                    # Node 7 is PreviewImage of cropped image
                    if node_id == "7":
                        out = os.path.join(OUTPUT_DIR, f"crop_{base_name}.png")
                    else:
                        out = os.path.join(OUTPUT_DIR, f"out_{base_name}.png")
                    img.save(out)
                    print(f"OK {out}")
                    saved_paths.append(out)
                except Exception as e:
                    print(f"X Download failed: {e}")
    
    return saved_paths


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Run Jinay's image_crop workflow")
    parser.add_argument("--input", "-i", type=str, required=True, help="Path to input image")
    parser.add_argument("--sam-prompt", "-s", type=str, default="shirt shorts clothing", help="SAM3 prompt")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"Error: Image not found: {args.input}")
        sys.exit(1)
    
    result = run_crop(args.input, sam_prompt=args.sam_prompt)
    print(f"\nDone! {len(result)} images saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()