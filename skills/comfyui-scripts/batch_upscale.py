"""
Batch upscale images using SeedVR2 via ComfyUI API (port 8000).
Uses LoadImage + SaveImage instead of ETN WebSocket nodes.
Usage: python batch_upscale.py --input-dir <dir> --output-dir <dir>
"""
import json, urllib.request, time, os, sys, io, base64
from PIL import Image

SERVER = "http://127.0.0.1:8000"
INPUT_DIR = None  # Will be set from ComfyUI config

def upload_image(image_path, filename=None):
    """Upload an image to ComfyUI's input directory."""
    if filename is None:
        filename = os.path.basename(image_path)
    
    with open(image_path, "rb") as f:
        img_data = f.read()
    
    # Use multipart form upload
    boundary = "----FormBoundary7MA4YWxkTrZu0gW"
    body = f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{filename}\"\r\nContent-Type: image/png\r\n\r\n".encode()
    body += img_data
    body += f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"overwrite\"\r\n\r\n1\r\n--{boundary}--\r\n".encode()
    
    req = urllib.request.Request(
        f"{SERVER}/upload/image",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        return result.get("name", filename)

def build_upscale_workflow(image_filename):
    """Build SeedVR2 upscale workflow using LoadImage + SaveImage."""
    return {
        "10": {
            "inputs": {
                "seed": 42,
                "resolution": 4096,
                "max_resolution": 4096,
                "batch_size": 1,
                "uniform_batch_size": False,
                "color_correction": "lab",
                "temporal_overlap": 0,
                "prepend_frames": 0,
                "input_noise_scale": 0,
                "latent_noise_scale": 0,
                "offload_device": "cpu",
                "enable_debug": False,
                "image": ["25", 0],
                "dit": ["14", 0],
                "vae": ["13", 0]
            },
            "class_type": "SeedVR2VideoUpscaler",
            "_meta": {"title": "SeedVR2 Video Upscaler (v2.5.24)"}
        },
        "13": {
            "inputs": {
                "model": "ema_vae_fp16.safetensors",
                "device": "cuda:0",
                "encode_tiled": True,
                "encode_tile_size": 1024,
                "encode_tile_overlap": 128,
                "decode_tiled": True,
                "decode_tile_size": 1024,
                "decode_tile_overlap": 128,
                "tile_debug": "false",
                "offload_device": "cpu",
                "cache_model": False
            },
            "class_type": "SeedVR2LoadVAEModel",
            "_meta": {"title": "SeedVR2 (Down)Load VAE Model"}
        },
        "14": {
            "inputs": {
                "model": "seedvr2_ema_7b_sharp_fp16.safetensors",
                "device": "cuda:0",
                "blocks_to_swap": 36,
                "swap_io_components": False,
                "offload_device": "cpu",
                "cache_model": False,
                "attention_mode": "sdpa"
            },
            "class_type": "SeedVR2LoadDiTModel",
            "_meta": {"title": "SeedVR2 (Down)Load DiT Model"}
        },
        "23": {
            "inputs": {
                "image": image_filename
            },
            "class_type": "LoadImage",
            "_meta": {"title": "Load Image"}
        },
        "25": {
            "inputs": {
                "image": ["23", 0]
            },
            "class_type": "SplitImageWithAlpha",
            "_meta": {"title": "Split Image with Alpha"}
        },
        "148": {
            "inputs": {
                "images": ["10", 0],
                "filename_prefix": "upscaled_arun"
            },
            "class_type": "SaveImage",
            "_meta": {"title": "Save Image"}
        }
    }

def queue_prompt(workflow):
    data = json.dumps({"prompt": workflow}).encode("utf-8")
    req = urllib.request.Request(f"{SERVER}/prompt", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def wait_for_completion(prompt_id, timeout=600):
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(f"{SERVER}/history/{prompt_id}")
            with urllib.request.urlopen(req) as resp:
                history = json.loads(resp.read())
            if prompt_id in history:
                outputs = history[prompt_id].get("outputs", {})
                for node_id, node_out in outputs.items():
                    if "images" in node_out:
                        return node_out["images"]
                # If status exists but no images, check for error
                status = history[prompt_id].get("status", {})
                if status.get("status_str") == "error":
                    msgs = status.get("messages", [])
                    print(f"  Error: {msgs}")
                    return None
        except Exception:
            pass
        time.sleep(3)
    return None

def download_image(filename, subfolder=""):
    url = f"{SERVER}/view?filename={filename}"
    if subfolder:
        url += f"&subfolder={subfolder}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return Image.open(io.BytesIO(resp.read()))

def upscale_image(image_path, output_dir):
    basename = os.path.splitext(os.path.basename(image_path))[0]
    
    # Upload to ComfyUI input
    print(f"  Uploading to ComfyUI...")
    uploaded_name = upload_image(image_path)
    print(f"  Uploaded as: {uploaded_name}")
    
    # Build workflow
    workflow = build_upscale_workflow(uploaded_name)
    
    # Queue
    result = queue_prompt(workflow)
    prompt_id = result.get("prompt_id")
    if not prompt_id:
        print(f"  X Failed to queue")
        return False
    
    print(f"  Queued: {prompt_id}")
    
    # Wait for completion (SeedVR2 is slow, allow 10 min per image)
    images = wait_for_completion(prompt_id, timeout=600)
    if not images:
        print(f"  X Failed or timeout")
        return False
    
    # Download and save
    for i, img_info in enumerate(images):
        filename = img_info["filename"]
        subfolder = img_info.get("subfolder", "")
        img = download_image(filename, subfolder)
        out_name = f"{basename}_upscaled.png" if i == 0 else f"{basename}_upscaled_{i}.png"
        out_path = os.path.join(output_dir, out_name)
        img.save(out_path, "PNG")
        print(f"  Saved: {out_path} ({img.size[0]}x{img.size[1]})")
    
    return True

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--output-dir", default=None)
    args = parser.parse_args()
    
    input_dir = args.input_dir
    output_dir = args.output_dir or os.path.join(input_dir, "upscaled")
    os.makedirs(output_dir, exist_ok=True)
    
    files = sorted([f for f in os.listdir(input_dir) if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))])
    # Skip already upscaled
    files = [f for f in files if "_upscaled" not in f]
    
    print(f"Found {len(files)} images to upscale")
    
    success = 0
    failed = 0
    for f in files:
        input_path = os.path.join(input_dir, f)
        print(f"\nUpscaling: {f}")
        try:
            if upscale_image(input_path, output_dir):
                success += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  X Error: {e}")
            failed += 1
    
    print(f"\nDone! Success: {success}, Failed: {failed}")
    print(f"Output: {output_dir}")

if __name__ == "__main__":
    main()