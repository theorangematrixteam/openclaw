"""
Logo Paster - Places a logo on images using ComfyUI
Adapted for Orange Matrix ComfyUI setup (port 8000)

Usage:
  python logo_paster.py --base outfit_1.png --logo logo.png
  python logo_paster.py --base outfit_1.png --logo logo.png --x 3072 --y 0 --size 1024
  python logo_paster.py --batch --input-dir input_images --output-dir output

The logo's alpha channel is used as mask so only the logo graphic (not the background) is pasted.
"""

import json
import urllib.request
import urllib.parse
import urllib.error
from PIL import Image
import io
import os
import sys
import copy
import argparse
import time

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ================= CONFIG =================
SERVER_URL = "http://127.0.0.1:8000"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKFLOW_FILE = os.path.join(SCRIPT_DIR, "logo_paster.json")

COMFYUI_INPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Documents\ComfyUI\input"
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\logo_paster"

POLL_INTERVAL = 2
TIMEOUT = 120
# =========================================

os.makedirs(OUTPUT_DIR, exist_ok=True)


def load_workflow(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def queue_prompt(workflow):
    payload = json.dumps({"prompt": workflow}).encode("utf-8")
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
            time.sleep(POLL_INTERVAL)
            continue
        if prompt_id in history:
            entry = history[prompt_id]
            status = entry.get("status", {})
            if status.get("status_str") == "error":
                raise RuntimeError(f"Execution error: {status}")
            if "outputs" in entry:
                return entry
        time.sleep(POLL_INTERVAL)


def get_output_images(history_entry):
    outputs = history_entry.get("outputs", {})
    images = []
    for node_id, node_output in outputs.items():
        if "images" in node_output:
            for img in node_output["images"]:
                images.append({
                    "filename": img["filename"],
                    "subfolder": img.get("subfolder", ""),
                    "type": img.get("type", "output"),
                })
    return images


def download_image(filename, subfolder="", img_type="output"):
    params = urllib.parse.urlencode({
        "filename": filename,
        "subfolder": subfolder,
        "type": img_type,
    })
    req = urllib.request.Request(f"{SERVER_URL}/view?{params}")
    with urllib.request.urlopen(req) as response:
        return Image.open(io.BytesIO(response.read())).copy()


def upload_image(image_path, filename=None):
    """Upload an image to ComfyUI's input directory via API."""
    if filename is None:
        filename = os.path.basename(image_path)
    with open(image_path, "rb") as f:
        image_data = f.read()
    import uuid
    # Use the upload endpoint
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
        result = json.loads(response.read())
    return result.get("name", filename)


def generate(base_image, logo_image, x=3072, y=0, logo_size=1024, filename_prefix="logo_pasted"):
    """Paste logo onto base image and save result."""
    # Upload images to ComfyUI
    base_filename = upload_image(base_image)
    logo_filename = upload_image(logo_image)

    workflow = load_workflow(WORKFLOW_FILE)

    # Inject image filenames
    workflow["7"]["inputs"]["image"] = base_filename
    workflow["2"]["inputs"]["image"] = logo_filename

    # Scale logo
    workflow["10"]["inputs"]["width"] = logo_size
    workflow["10"]["inputs"]["height"] = logo_size
    workflow["14"]["inputs"]["width"] = logo_size
    workflow["14"]["inputs"]["height"] = logo_size

    # Position
    workflow["3"]["inputs"]["x"] = x
    workflow["3"]["inputs"]["y"] = y

    # Output prefix
    workflow["148"]["inputs"]["filename_prefix"] = filename_prefix

    try:
        response = queue_prompt(workflow)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f"X HTTP {e.code}: {body[:300]}")
        return []
    except Exception as e:
        print(f"X Queue error: {e}")
        return []

    prompt_id = response.get("prompt_id")
    if not prompt_id:
        print("X No prompt_id returned")
        return []

    try:
        history_entry = wait_for_completion(prompt_id)
    except TimeoutError:
        print(f"X Timed out")
        return []
    except RuntimeError as e:
        print(f"X {e}")
        return []

    images_info = get_output_images(history_entry)
    if not images_info:
        print("X No output images found")
        return []

    saved_paths = []
    for img_info in images_info:
        try:
            img = download_image(img_info["filename"], img_info.get("subfolder", ""), img_info.get("type", "output"))
            base_name = os.path.splitext(os.path.basename(base_image))[0]
            output_file = os.path.join(OUTPUT_DIR, f"{filename_prefix}_{base_name}.png")
            img.save(output_file)
            print(f"OK {output_file}")
            saved_paths.append(output_file)
        except Exception as e:
            print(f"X Download failed: {e}")

    return saved_paths


def main():
    parser = argparse.ArgumentParser(description="Logo Paster - paste logo onto images")
    parser.add_argument("--base", "-b", type=str, required=True, help="Path to base image")
    parser.add_argument("--logo", "-l", type=str, required=True, help="Path to logo image (with alpha)")
    parser.add_argument("--x", type=int, default=3072, help="X offset for logo (default: top-right for 4096px image)")
    parser.add_argument("--y", type=int, default=0, help="Y offset for logo (default: 0)")
    parser.add_argument("--size", type=int, default=1024, help="Logo size in pixels (default: 1024)")
    parser.add_argument("--prefix", type=str, default="logo_pasted", help="Output filename prefix")

    args = parser.parse_args()

    if not os.path.exists(args.base):
        print(f"Error: Base image not found: {args.base}")
        sys.exit(1)
    if not os.path.exists(args.logo):
        print(f"Error: Logo image not found: {args.logo}")
        sys.exit(1)

    print(f"Base: {args.base}")
    print(f"Logo: {args.logo}")
    print(f"Position: ({args.x}, {args.y}), Size: {args.size}x{args.size}")

    saved = generate(args.base, args.logo, x=args.x, y=args.y, logo_size=args.size, filename_prefix=args.prefix)

    print(f"\nDone! {len(saved)} images saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()