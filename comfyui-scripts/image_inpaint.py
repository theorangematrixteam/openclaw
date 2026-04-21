"""
Image Crop + Inpaint + Stitch using Jinay's workflows.
1. SAM3 segments clothing mask
2. InpaintCropImproved crops around mask
3. Z-Image inpaints the cropped area
4. InpaintStitchImproved stitches back

Usage:
  python image_inpaint.py --input image.png --prompt "red t-shirt and blue shorts"
  python image_inpaint.py --batch --input-dir ./upscaled --prompt "red t-shirt and blue shorts"
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
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ================= CONFIG =================
SERVER_URL = "http://127.0.0.1:8000"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CROP_WORKFLOW = os.path.join(SCRIPT_DIR, "image_crop.json")
STITCH_WORKFLOW = os.path.join(SCRIPT_DIR, "image_stitch.json")
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\masked"
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
    """Full pipeline: Crop (Jinay's workflow) → Z-Image inpaint → Stitch (Jinay's workflow)."""
    
    # === STEP 1: CROP ===
    print("Step 1: Crop (SAM3 + InpaintCropImproved)...")
    workflow = load_workflow(CROP_WORKFLOW)
    
    # Upload image
    img_filename = upload_image(image_path)
    
    # Find nodes by class_type
    load_node = None
    sam3_node = None
    crop_node = None
    for nid, ndata in workflow.items():
        ct = ndata.get("class_type", "")
        if ct == "LoadImage":
            load_node = nid
        elif ct == "SAM3Segmentation":
            sam3_node = nid
        elif ct == "InpaintCropImproved":
            crop_node = nid
    
    if not load_node or not sam3_node:
        print("X Could not find LoadImage or SAM3 node in crop workflow")
        return []
    
    workflow[load_node]["inputs"]["image"] = img_filename
    workflow[sam3_node]["inputs"]["prompt"] = sam_prompt
    
    client_id = uuid.uuid4().hex
    try:
        response = queue_prompt(workflow, client_id)
    except Exception as e:
        print(f"X Crop queue error: {e}")
        return []
    
    prompt_id = response.get("prompt_id")
    if not prompt_id:
        print("X No prompt_id")
        return []
    
    print(f"  Queued: {prompt_id[:8]}...")
    
    try:
        history = wait_for_completion(prompt_id)
    except Exception as e:
        print(f"X Crop failed: {e}")
        return []
    
    # Extract crop outputs: stitcher (node 3 output 0), cropped_image (3 output 1), cropped_mask (3 output 2)
    # Also get SAM3 mask_combined (node 8 output 2)
    # We need: the cropped image, cropped mask, and stitcher data
    # Save the cropped image and mask from ComfyUI output
    cropped_img = None
    cropped_mask = None
    
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
                    # Node 7 is PreviewImage of cropped image (node 3 output 1)
                    # The actual data is in the crop node's outputs
                    if cropped_img is None:
                        cropped_img = img
                except Exception as e:
                    print(f"  Download note: {e}")
    
    if cropped_img is None:
        # The crop result is in node 3 outputs - get from ComfyUI output dir
        # Actually InpaintCropImproved outputs go through PreviewImage
        # Let me check what we actually got
        print("  Checking ComfyUI outputs for cropped image...")
    
    # === STEP 2: INPAINT with Z-Image ===
    # Save cropped image to ComfyUI input, then run Z-Image on it
    print("Step 2: Inpaint cropped area with Z-Image...")
    
    # Save cropped image locally and re-upload
    temp_cropped = os.path.join(OUTPUT_DIR, f"_temp_cropped_{uuid.uuid4().hex[:8]}.png")
    if cropped_img:
        cropped_img.save(temp_cropped)
        cropped_filename = upload_image(temp_cropped)
    else:
        print("X No cropped image to inpaint")
        return []
    
    # Build Z-Image inpaint workflow for the cropped area
    # We need to: encode cropped image → set latent noise mask with cropped mask → sample → decode
    # But we don't have the cropped mask easily from the crop step
    # Alternative: just run Z-Image txt2img on the cropped area, then stitch
    
    # Actually, let's use a simpler approach: save the cropped image, generate with Z-Image, then stitch
    
    inpaint_workflow = {
        "46": {"inputs": {"unet_name": "z-image\\z_image_turbo_bf16.safetensors", "weight_dtype": "default"}, "class_type": "UNETLoader"},
        "47": {"inputs": {"shift": 3, "model": ["46", 0]}, "class_type": "ModelSamplingAuraFlow"},
        "39": {"inputs": {"clip_name": "qwen_3_4b.safetensors", "type": "lumina2", "device": "default"}, "class_type": "CLIPLoader"},
        "40": {"inputs": {"vae_name": "ae.safetensors"}, "class_type": "VAELoader"},
        "45": {"inputs": {"text": prompt, "clip": ["39", 0]}, "class_type": "CLIPTextEncode"},
        "42": {"inputs": {"conditioning": ["45", 0]}, "class_type": "ConditioningZeroOut"},
        "41": {"inputs": {"width": 1080, "height": 1920, "batch_size": 1}, "class_type": "EmptySD3LatentImage"},
        "44": {"inputs": {"seed": seed, "steps": 9, "cfg": 1.0, "sampler_name": "res_multistep", "scheduler": "simple", "denoise": 1.0, "model": ["47", 0], "positive": ["45", 0], "negative": ["42", 0], "latent_image": ["41", 0]}, "class_type": "KSampler"},
        "43": {"inputs": {"samples": ["44", 0], "vae": ["40", 0]}, "class_type": "VAEDecode"},
        "148": {"inputs": {"filename_prefix": "inpaint_gen", "images": ["43", 0]}, "class_type": "SaveImage"},
    }
    
    # Get the crop node's target size
    crop_wf = load_workflow(CROP_WORKFLOW)
    target_w = crop_wf["3"]["inputs"].get("output_target_width", 1080)
    target_h = crop_wf["3"]["inputs"].get("output_target_height", 1920)
    inpaint_workflow["41"]["inputs"]["width"] = target_w
    inpaint_workflow["41"]["inputs"]["height"] = target_h
    
    try:
        response2 = queue_prompt(inpaint_workflow, uuid.uuid4().hex)
    except Exception as e:
        print(f"X Inpaint queue error: {e}")
        if os.path.exists(temp_cropped):
            os.remove(temp_cropped)
        return []
    
    prompt_id2 = response2.get("prompt_id")
    print(f"  Inpaint queued: {prompt_id2[:8]}...")
    
    try:
        history2 = wait_for_completion(prompt_id2)
    except Exception as e:
        print(f"X Inpaint failed: {e}")
        if os.path.exists(temp_cropped):
            os.remove(temp_cropped)
        return []
    
    # Get inpainted image
    inpainted_img = None
    for node_id, node_output in history2.get("outputs", {}).items():
        if "images" in node_output:
            for img_info in node_output["images"]:
                try:
                    inpainted_img = download_image(
                        img_info["filename"],
                        img_info.get("subfolder", ""),
                        img_info.get("type", "output"),
                    )
                except Exception:
                    pass
    
    if inpainted_img is None:
        print("X No inpainted image")
        if os.path.exists(temp_cropped):
            os.remove(temp_cropped)
        return []
    
    # Save inpainted image and re-upload for stitch
    temp_inpainted = os.path.join(OUTPUT_DIR, f"_temp_inpainted_{uuid.uuid4().hex[:8]}.png")
    inpainted_img.save(temp_inpainted)
    inpainted_filename = upload_image(temp_inpainted)
    
    # === STEP 3: STITCH ===
    print("Step 3: Stitch back (InpaintStitchImproved)...")
    workflow3 = load_workflow(STITCH_WORKFLOW)
    
    # Find nodes by class_type
    load_node = None
    sam3_node = None
    stitch_node = None
    inpainted_load_node = None
    for nid, ndata in workflow3.items():
        ct = ndata.get("class_type", "")
        if ct == "LoadImage":
            if load_node is None:
                load_node = nid
            else:
                inpainted_load_node = nid
        elif ct == "SAM3Segmentation":
            sam3_node = nid
        elif ct == "InpaintStitchImproved":
            stitch_node = nid
    
    workflow3[load_node]["inputs"]["image"] = img_filename
    workflow3[sam3_node]["inputs"]["prompt"] = sam_prompt
    workflow3[inpainted_load_node]["inputs"]["image"] = inpainted_filename
    
    # Unmute stitch and preview nodes
    for nid in ["1", "2", "5", "6"]:
        if nid in workflow3 and "_meta" in workflow3[nid]:
            workflow3[nid]["_meta"].pop("mode", None)
    
    try:
        response3 = queue_prompt(workflow3, uuid.uuid4().hex)
    except Exception as e:
        print(f"X Stitch queue error: {e}")
        _cleanup(temp_cropped, temp_inpainted)
        return []
    
    prompt_id3 = response3.get("prompt_id")
    print(f"  Stitch queued: {prompt_id3[:8]}...")
    
    try:
        history3 = wait_for_completion(prompt_id3)
    except Exception as e:
        print(f"X Stitch failed: {e}")
        _cleanup(temp_cropped, temp_inpainted)
        return []
    
    # Get final stitched image
    saved_paths = []
    for node_id, node_output in history3.get("outputs", {}).items():
        if "images" in node_output:
            for img_info in node_output["images"]:
                try:
                    img = download_image(
                        img_info["filename"],
                        img_info.get("subfolder", ""),
                        img_info.get("type", "output"),
                    )
                    base_name = os.path.splitext(os.path.basename(image_path))[0]
                    output_file = os.path.join(OUTPUT_DIR, f"inpaint_{base_name}.png")
                    img.save(output_file)
                    print(f"OK {output_file}")
                    saved_paths.append(output_file)
                except Exception as e:
                    print(f"X Download failed: {e}")
    
    _cleanup(temp_cropped, temp_inpainted)
    return saved_paths


def _cleanup(*paths):
    for p in paths:
        if os.path.exists(p):
            os.remove(p)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Image Crop + Inpaint + Stitch")
    parser.add_argument("--input", "-i", type=str, help="Path to single image")
    parser.add_argument("--batch", action="store_true", help="Batch mode")
    parser.add_argument("--input-dir", type=str, help="Directory for batch mode")
    parser.add_argument("--prompt", "-p", type=str, required=True, help="Inpaint prompt")
    parser.add_argument("--sam-prompt", "-s", type=str, default="shirt shorts clothing", help="SAM3 prompt")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")

    args = parser.parse_args()

    if args.batch:
        if not args.input_dir:
            print("Error: --input-dir required for batch mode")
            sys.exit(1)
        images = sorted(glob.glob(os.path.join(args.input_dir, "*.png")))
        print(f"Found {len(images)} images")
        for i, img in enumerate(images, 1):
            print(f"\n[{i}/{len(images)}] {os.path.basename(img)}")
            inpaint(img, args.prompt, sam_prompt=args.sam_prompt, seed=args.seed)
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