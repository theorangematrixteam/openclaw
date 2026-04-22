"""
Run SAM3 crop workflow per individual mask.
When an image has 2+ subjects (e.g., 2 kids), SAM3 returns individual masks
but InpaintCropImproved merges them into one crop. This script:
1. Runs SAM3 to get the combined mask
2. Splits the combined mask into individual masks using connected components
3. Runs InpaintCropImproved separately for each individual mask
4. Saves each crop as a separate output
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
import numpy as np
from scipy.ndimage import label as scipy_label

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
    body = ("--" + boundary + "\r\n" + 'Content-Disposition: form-data; name="image"; filename="' + filename + '"\r\nContent-Type: image/png\r\n\r\n').encode() + image_data + ("\r\n--" + boundary + "--\r\n").encode()
    req = urllib.request.Request(f"{SERVER_URL}/upload/image", data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read()).get("name", filename)


def upload_pil_image(pil_image, filename):
    """Upload a PIL image to ComfyUI input dir."""
    buf = io.BytesIO()
    # Convert to RGB if needed (mask is grayscale, need to make it work with LoadImage)
    if pil_image.mode == "L":
        # Convert grayscale mask to RGB for LoadImage compatibility
        pil_image = pil_image.convert("RGB")
    pil_image.save(buf, format="PNG")
    image_data = buf.getvalue()
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


def make_inpaint_crop_workflow(image_filename, mask_filename):
    """Build InpaintCropImproved workflow using separate image + mask inputs."""
    return {
        "4": {
            "inputs": {"image": image_filename},
            "class_type": "LoadImage",
            "_meta": {"title": "Load Image"}
        },
        "5": {
            "inputs": {"image": mask_filename},
            "class_type": "LoadImage",
            "_meta": {"title": "Load Mask as Image"}
        },
        "6": {
            "inputs": {
                "channel": "red",
                "image": ["5", 0]
            },
            "class_type": "ImageToMask",
            "_meta": {"title": "Image to Mask"}
        },
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
                "mask": ["6", 0]
            },
            "class_type": "InpaintCropImproved",
            "_meta": {"title": "Inpaint Crop"}
        },
        "7": {
            "inputs": {"filename_prefix": "crop_kid", "images": ["3", 1]},
            "class_type": "SaveImage",
            "_meta": {"title": "Save Cropped Image"}
        },
        "9": {
            "inputs": {"mask": ["3", 2]},
            "class_type": "MaskPreview+",
            "_meta": {"title": "Mask Preview"}
        },
    }


def split_combined_mask(mask_pil):
    """Split a combined binary mask into individual masks using connected components."""
    mask_arr = np.array(mask_pil.convert("L"))
    # Threshold to binary
    binary = (mask_arr > 127).astype(np.int32)
    # Find connected components
    labeled, num_features = scipy_label(binary)
    
    individual_masks = []
    for i in range(1, num_features + 1):
        single = (labeled == i).astype(np.uint8) * 255
        mask_img = Image.fromarray(single, mode="L")
        individual_masks.append(mask_img)
    
    return individual_masks


def run(image_path, sam_prompt="tshirt and shorts"):
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    
    # === PASS 1: Run SAM3 to get masks ===
    print(f"[1/3] Running SAM3 segmentation ('{sam_prompt}')...")
    sam3_wf = {
        "4": {
            "inputs": {"image": "placeholder.png"},
            "class_type": "LoadImage",
            "_meta": {"title": "Load Image"}
        },
        "8": {
            "inputs": {
                "prompt": sam_prompt,
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
        "10": {
            "inputs": {"filename_prefix": "sam3_segmented", "images": ["8", 0]},
            "class_type": "SaveImage",
            "_meta": {"title": "Save SAM3 Segmented"}
        },
        "12": {
            "inputs": {"mask": ["8", 2]},
            "class_type": "MaskPreview+",
            "_meta": {"title": "Preview Combined Mask"}
        },
    }
    
    img_filename = upload_image(image_path)
    sam3_wf["4"]["inputs"]["image"] = img_filename
    
    client_id = uuid.uuid4().hex
    response = queue_prompt(sam3_wf, client_id)
    prompt_id = response.get("prompt_id")
    print(f"  Queued: {prompt_id[:8]}...")
    
    history = wait_for_completion(prompt_id)
    
    # Download SAM3 segmented overlay + combined mask
    combined_mask_pil = None
    for node_id, node_output in history.get("outputs", {}).items():
        if "images" in node_output:
            for img_info in node_output["images"]:
                fn = img_info.get("filename", "")
                img = download_image(fn, img_info.get("subfolder", ""), img_info.get("type", "output"))
                if "sam3_segmented" in fn:
                    out = os.path.join(OUTPUT_DIR, f"sam3_segmented_{base_name}.png")
                    img.save(out)
                    print(f"  OK {out}")
                elif "ComfyUI_temp" in fn:
                    # This is the mask preview from MaskPreview+
                    combined_mask_pil = img.convert("L")
    
    if combined_mask_pil is None:
        print("  ERROR: Could not download combined mask")
        return []
    
    # === PASS 2: Split mask into individual masks ===
    individual_masks = split_combined_mask(combined_mask_pil)
    print(f"[2/3] Found {len(individual_masks)} individual mask(s)")
    
    if len(individual_masks) == 0:
        print("  No masks found!")
        return []
    
    saved = []
    
    # === PASS 3: Run InpaintCrop for each individual mask ===
    for i, mask_pil in enumerate(individual_masks):
        kid_num = i + 1
        print(f"[3/3] Running InpaintCrop for mask {kid_num}/{len(individual_masks)}...")
        
        # Upload individual mask
        mask_fn = f"individual_mask_{kid_num}_{base_name}.png"
        mask_uploaded = upload_pil_image(mask_pil, mask_fn)
        
        # Build and run InpaintCrop workflow
        crop_wf = make_inpaint_crop_workflow(img_filename, mask_uploaded)
        
        client_id = uuid.uuid4().hex
        response = queue_prompt(crop_wf, client_id)
        prompt_id = response.get("prompt_id")
        print(f"  Queued: {prompt_id[:8]}...")
        
        history = wait_for_completion(prompt_id)
        
        # Download outputs
        for node_id, node_output in history.get("outputs", {}).items():
            if "images" in node_output:
                for img_info in node_output["images"]:
                    fn = img_info.get("filename", "")
                    try:
                        img = download_image(fn, img_info.get("subfolder", ""), img_info.get("type", "output"))
                        if "ComfyUI_temp" in fn:
                            # Mask preview
                            out = os.path.join(OUTPUT_DIR, f"mask_preview_kid{kid_num}_{base_name}.png")
                        elif "crop_kid" in fn:
                            # Cropped image
                            out = os.path.join(OUTPUT_DIR, f"crop_kid{kid_num}_{base_name}.png")
                        else:
                            out = os.path.join(OUTPUT_DIR, fn)
                        img.save(out)
                        print(f"  OK {out}")
                        saved.append(out)
                    except Exception as e:
                        print(f"  X {e}")
    
    return saved


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", "-i", required=True)
    parser.add_argument("--sam-prompt", "-s", default="tshirt and shorts")
    args = parser.parse_args()
    result = run(args.input, sam_prompt=args.sam_prompt)
    print(f"\nDone! {len(result)} images saved to {OUTPUT_DIR}")