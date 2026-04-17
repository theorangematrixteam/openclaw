"""
Z-Image Turbo txt2img generator
Adapted for Orange Matrix ComfyUI setup (port 8000, RTX 5090)

Usage:
  python z_image_turbo.py --prompt "your prompt here"
  python z_image_turbo.py --prompt "your prompt" --count 3
  python z_image_turbo.py --prompts-file prompts.json
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
from random import randint

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ================= CONFIG =================
SERVER_URL = "http://127.0.0.1:8000"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKFLOW_FILE = os.path.join(SCRIPT_DIR, "z_image_turbo.json")

COMFYUI_OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Documents\ComfyUI\output"
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\z_image_prompt_reader_outputs"

DEFAULT_WIDTH = 1152
DEFAULT_HEIGHT = 1152
DEFAULT_COUNT = 1
DEFAULT_STEPS = 9
DEFAULT_CFG = 1
DEFAULT_SHIFT = 3
POLL_INTERVAL = 2
TIMEOUT = 300
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
    """Poll /history until execution finishes."""
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
    """Extract image filenames from completed execution."""
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
    """Download image from ComfyUI /view endpoint."""
    params = urllib.parse.urlencode({
        "filename": filename,
        "subfolder": subfolder,
        "type": img_type,
    })
    req = urllib.request.Request(f"{SERVER_URL}/view?{params}")
    with urllib.request.urlopen(req) as resp:
        return Image.open(io.BytesIO(resp.read())).copy()


def generate(prompt_text, count=1, width=DEFAULT_WIDTH, height=DEFAULT_HEIGHT,
             steps=DEFAULT_STEPS, cfg=DEFAULT_CFG, shift=DEFAULT_SHIFT,
             seed=None, filename_prefix="zimage"):
    """Generate images with Z-Image Turbo. Saves to OUTPUT_DIR."""
    saved_paths = []

    base_workflow = load_workflow(WORKFLOW_FILE)

    # Inject settings
    base_workflow["45"]["inputs"]["text"] = prompt_text
    base_workflow["41"]["inputs"]["width"] = width
    base_workflow["41"]["inputs"]["height"] = height
    base_workflow["44"]["inputs"]["steps"] = steps
    base_workflow["44"]["inputs"]["cfg"] = cfg
    base_workflow["47"]["inputs"]["shift"] = shift
    base_workflow["148"]["inputs"]["filename_prefix"] = filename_prefix

    for i in range(1, count + 1):
        workflow = copy.deepcopy(base_workflow)

        use_seed = seed if seed is not None else randint(0, 2**63 - 1)
        workflow["44"]["inputs"]["seed"] = use_seed

        print(f"[{i}/{count}] Generating seed={use_seed}...")

        try:
            response = queue_prompt(workflow)
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='replace')
            print(f"  X HTTP {e.code}: {body[:300]}")
            continue
        except Exception as e:
            print(f"  X Queue error: {e}")
            continue

        prompt_id = response.get("prompt_id")
        if not prompt_id:
            print("  X No prompt_id returned")
            continue

        # Wait for execution
        try:
            history_entry = wait_for_completion(prompt_id)
        except TimeoutError:
            print(f"  X Timed out")
            continue
        except RuntimeError as e:
            print(f"  X {e}")
            continue

        # Get output images from ComfyUI
        images_info = get_output_images(history_entry)
        if not images_info:
            print("  X No output images found")
            continue

        for img_info in images_info:
            try:
                img = download_image(img_info["filename"], img_info.get("subfolder", ""), img_info.get("type", "output"))
                safe_prompt = "".join(c if c.isalnum() else "_" for c in prompt_text[:30]).strip("_")
                filename = f"{filename_prefix}_{safe_prompt}_{use_seed}.png"
                output_path = os.path.join(OUTPUT_DIR, filename)
                img.save(output_path)
                print(f"  OK {output_path}")
                saved_paths.append(output_path)
            except Exception as e:
                print(f"  X Download failed: {e}")

    return saved_paths


def load_prompts_file(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):
        return list(data.values())
    return list(data)


def main():
    parser = argparse.ArgumentParser(description="Z-Image Turbo txt2img generator")
    parser.add_argument("--prompt", "-p", type=str, help="Single prompt to generate")
    parser.add_argument("--prompts-file", "-f", type=str, help="JSON file with prompts")
    parser.add_argument("--count", "-n", type=int, default=DEFAULT_COUNT, help="Images per prompt")
    parser.add_argument("--width", "-W", type=int, default=DEFAULT_WIDTH)
    parser.add_argument("--height", "-H", type=int, default=DEFAULT_HEIGHT)
    parser.add_argument("--steps", "-s", type=int, default=DEFAULT_STEPS)
    parser.add_argument("--cfg", type=float, default=DEFAULT_CFG)
    parser.add_argument("--shift", type=float, default=DEFAULT_SHIFT)
    parser.add_argument("--seed", type=int, default=None, help="Fixed seed (random if omitted)")
    parser.add_argument("--prefix", type=str, default="zimage", help="Output filename prefix")

    args = parser.parse_args()

    prompts = []
    if args.prompt:
        prompts.append(args.prompt)
    if args.prompts_file:
        prompts.extend(load_prompts_file(args.prompts_file))

    if not prompts:
        print("Error: Provide --prompt or --prompts-file")
        parser.print_help()
        sys.exit(1)

    all_saved = []
    for idx, prompt_text in enumerate(prompts, 1):
        print(f"\n{'='*50}")
        print(f"Prompt {idx}/{len(prompts)}: {prompt_text[:80]}...")
        print(f"{'='*50}")
        saved = generate(
            prompt_text,
            count=args.count,
            width=args.width,
            height=args.height,
            steps=args.steps,
            cfg=args.cfg,
            shift=args.shift,
            seed=args.seed,
            filename_prefix=args.prefix,
        )
        all_saved.extend(saved)

    print(f"\nDone! {len(all_saved)} images saved to {OUTPUT_DIR}")
    for p in all_saved:
        print(f"  -> {p}")


if __name__ == "__main__":
    main()