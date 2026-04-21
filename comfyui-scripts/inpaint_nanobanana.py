"""
Nano Banana Inpainter - SAM3 mask + InpaintCrop + Z-Image + InpaintStitch
Uses Jinay's nano banana workflow structure with SAM3 for automatic masking.

Usage:
  python inpaint_nanobanana.py --input image.png --prompt "toddler wearing red t-shirt and blue shorts"
  python inpaint_nanobanana.py --input image.png --prompt "white formal shirt" --sam-prompt "shirt"
  python inpaint_nanobanana.py --batch --input-dir ./upscaled --prompt "red t-shirt and blue shorts"
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
import glob
import subprocess
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ================= CONFIG =================
SERVER_URL = "http://127.0.0.1:8000"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKFLOW_FILE = os.path.join(SCRIPT_DIR, "inpaint_nanobanana.json")

OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\masked"
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


def inpaint(image_path, prompt, sam_prompt="shirt shorts clothing", seed=42):
    """Run full inpaint pipeline: SAM3 mask → crop → Z-Image inpaint → stitch."""
    workflow = load_workflow(WORKFLOW_FILE)

    # Upload image
    print("Uploading image...")
    img_filename = upload_image(image_path)
    workflow["4"]["inputs"]["image"] = img_filename

    # Set prompts
    workflow["45"]["inputs"]["text"] = prompt
    workflow["20"]["inputs"]["prompt"] = sam_prompt
    workflow["44"]["inputs"]["seed"] = seed

    # Queue
    print(f"Queueing inpaint (SAM3 prompt: '{sam_prompt}', seed: {seed})...")
    client_id = uuid.uuid4().hex
    try:
        response = queue_prompt(workflow, client_id)
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

    # Get all output images
    saved_paths = []
    for node_id, node_output in history.get("outputs", {}).items():
        if "images" in node_output:
            for img_info in node_output["images"]:
                if img_info.get("source") == "websocket":
                    continue
                try:
                    img = download_image(
                        img_info["filename"],
                        img_info.get("subfolder", ""),
                        img_info.get("type", "output"),
                    )
                    base_name = os.path.splitext(os.path.basename(image_path))[0]
                    prefix = img_info.get("filename", "").split("_")[0]
                    if "inpainted" in img_info.get("filename", ""):
                        output_file = os.path.join(OUTPUT_DIR, f"inpaint_{base_name}.png")
                    elif "mask" in img_info.get("filename", ""):
                        output_file = os.path.join(OUTPUT_DIR, f"mask_{base_name}.png")
                    else:
                        output_file = os.path.join(OUTPUT_DIR, f"{prefix}_{base_name}.png")
                    img.save(output_file)
                    print(f"OK {output_file}")
                    saved_paths.append(output_file)
                except Exception as e:
                    print(f"X Download failed: {e}")

    return saved_paths


def batch_inpaint(input_dir, prompt, sam_prompt="shirt shorts clothing", pattern="*.png"):
    images = sorted(glob.glob(os.path.join(input_dir, pattern)))
    print(f"Found {len(images)} images")

    success = 0
    failed = 0
    for i, img in enumerate(images, 1):
        name = os.path.basename(img)
        print(f"\n[{i}/{len(images)}] {name}")
        try:
            result = inpaint(img, prompt, sam_prompt=sam_prompt)
            if result:
                success += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  X Error: {e}")
            failed += 1

    print(f"\nBatch complete: {success} success, {failed} failed")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Nano Banana Inpainter - SAM3 + Z-Image")
    parser.add_argument("--input", "-i", type=str, help="Path to single image")
    parser.add_argument("--batch", action="store_true", help="Batch mode")
    parser.add_argument("--input-dir", type=str, help="Directory for batch mode")
    parser.add_argument("--prompt", "-p", type=str, required=True, help="Inpaint prompt")
    parser.add_argument("--sam-prompt", "-s", type=str, default="shirt shorts clothing", help="SAM3 segmentation prompt")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")

    args = parser.parse_args()

    if args.batch:
        if not args.input_dir:
            print("Error: --input-dir required for batch mode")
            sys.exit(1)
        batch_inpaint(args.input_dir, args.prompt, sam_prompt=args.sam_prompt)
    elif args.input:
        if not os.path.exists(args.input):
            print(f"Error: Image not found: {args.input}")
            sys.exit(1)
        inpaint(args.input, args.prompt, sam_prompt=args.sam_prompt, seed=args.seed)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()