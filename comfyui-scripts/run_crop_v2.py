"""
Run Jinay's image_crop workflow + save SAM3 mask separately.
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
import copy
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SERVER_URL = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\masked"
TIMEOUT = 600

os.makedirs(OUTPUT_DIR, exist_ok=True)

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
        "_meta": {"title": "Preview Cropped Image"}
    },
    "8": {
        "inputs": {
            "prompt": "bikini",
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
    },
    # Save SAM3 segmented overlay
    "10": {
        "inputs": {"filename_prefix": "sam3_segmented", "images": ["8", 0]},
        "class_type": "SaveImage",
        "_meta": {"title": "Save SAM3 Segmented"}
    },
    # MaskPreview+ for cropped mask
    "9": {
        "inputs": {"mask": ["3", 2]},
        "class_type": "MaskPreview+",
        "_meta": {"title": "Mask Preview"}
    },
    # Save cropped mask preview
    "11": {
        "inputs": {"filename_prefix": "mask_preview", "images": ["9", 0]},
        "class_type": "SaveImage",
        "_meta": {"title": "Save Mask Preview"}
    },
}


def upload_image(image_path, filename=None):
    if filename is None:
        filename = os.path.basename(image_path)
    with open(image_path, "rb") as f:
        image_data = f.read()
    boundary = uuid.uuid4().hex
    body = ("--" + boundary + "\r\n" + 'Content-Disposition: form-data; name="image"; filename="' + filename + '"\r\nContent-Type: image/png\r\n\r\n').encode() + image_data + ("\r\n--" + boundary + "--\r\n").encode()
    req = urllib.request.Request(f"{SERVER_URL}/upload/image", data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read()).get("name", filename)


def queue_prompt(workflow, client_id):
    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")
    req = urllib.request.Request(f"{SERVER_URL}/prompt", data=payload, headers={"Content-Type": "application/json"})
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
    params = urllib.parse.urlencode({"filename": filename, "subfolder": subfolder, "type": img_type})
    req = urllib.request.Request(f"{SERVER_URL}/view?{params}")
    with urllib.request.urlopen(req) as response:
        return Image.open(io.BytesIO(response.read())).copy()


def run(image_path, sam_prompt="bikini"):
    workflow = copy.deepcopy(WORKFLOW_TEMPLATE)
    
    img_filename = upload_image(image_path)
    workflow["4"]["inputs"]["image"] = img_filename
    workflow["8"]["inputs"]["prompt"] = sam_prompt
    
    print(f"Running image crop (SAM3: '{sam_prompt}')...")
    client_id = uuid.uuid4().hex
    response = queue_prompt(workflow, client_id)
    prompt_id = response.get("prompt_id")
    print(f"Queued: {prompt_id[:8]}...")
    
    history = wait_for_completion(prompt_id)
    
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    saved = []
    for node_id, node_output in history.get("outputs", {}).items():
        if "images" in node_output:
            for img_info in node_output["images"]:
                fn = img_info.get("filename", "")
                try:
                    img = download_image(fn, img_info.get("subfolder", ""), img_info.get("type", "output"))
                    if "segmented" in fn or node_id == "10":
                        out = os.path.join(OUTPUT_DIR, f"sam3_segmented_{base_name}.png")
                    elif "mask_preview" in fn or node_id == "11":
                        out = os.path.join(OUTPUT_DIR, f"mask_preview_{base_name}.png")
                    elif "sam3_mask" in fn:
                        out = os.path.join(OUTPUT_DIR, f"sam3_mask_{base_name}.png")
                    elif node_id == "7":
                        out = os.path.join(OUTPUT_DIR, f"crop_{base_name}.png")
                    else:
                        out = os.path.join(OUTPUT_DIR, f"{fn}")
                    img.save(out)
                    print(f"OK {out}")
                    saved.append(out)
                except Exception as e:
                    print(f"X {e}")
    return saved


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", "-i", required=True)
    parser.add_argument("--sam-prompt", "-s", default="bikini")
    args = parser.parse_args()
    result = run(args.input, sam_prompt=args.sam_prompt)
    print(f"\nDone! {len(result)} images saved to {OUTPUT_DIR}")