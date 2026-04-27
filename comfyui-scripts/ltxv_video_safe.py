"""
Safe LTXV Video Generation Workflow
Optimized for RTX 5090 (32GB VRAM) with crash prevention.

Features:
- Lower resolution to prevent OOM (960x544 = 16:9, still HD)
- Shorter duration (3s @ 24fps = 72 frames)
- Fixed MathExpression nodes with proper values input
- VRAM monitoring and auto-clear between runs
- Tiled VAE decode with conservative settings
"""

import json
import urllib.request
import urllib.error
import base64
import uuid
import time
import os
import sys
import io
import threading
import glob
import subprocess
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ================= CONFIG =================
SERVER_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKFLOW_FILE = os.path.join(SCRIPT_DIR, "ltxv_video_i2v_meera.json")

OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\ltxv_safe_outputs"

TIMEOUT = 1800  # 30 min for video
VRAM_THRESHOLD_GB = 28  # Stop if VRAM usage exceeds this
# =========================================

os.makedirs(OUTPUT_DIR, exist_ok=True)


def load_workflow(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_system_stats():
    try:
        req = urllib.request.Request(f"{SERVER_URL}/system_stats")
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read())
    except Exception as e:
        print(f"Could not get system stats: {e}")
        return None


def get_vram_usage_gb():
    stats = get_system_stats()
    if stats and "devices" in stats:
        for dev in stats["devices"]:
            if dev.get("type") == "cuda":
                total = dev.get("vram_total", 0) / (1024**3)
                free = dev.get("vram_free", 0) / (1024**3)
                return total - free
    return 0


def clear_vram():
    """Clear ComfyUI VRAM cache."""
    try:
        req = urllib.request.Request(
            f"{SERVER_URL}/free",
            data=b'{"unload_models": true, "free_memory": true}',
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            print("VRAM cleared")
            return True
    except Exception as e:
        print(f"VRAM clear failed: {e}")
        return False


def queue_prompt(workflow, client_id):
    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")
    req = urllib.request.Request(
        f"{SERVER_URL}/prompt",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())


def collect_ws_images(client_id):
    import websocket
    images = []
    exec_done = threading.Event()

    def on_message(ws, message):
        if isinstance(message, bytes):
            if len(message) > 8:
                try:
                    img = Image.open(io.BytesIO(message[8:])).copy()
                    images.append(img)
                    print(f"  Received image via WebSocket ({len(images)})")
                except Exception:
                    try:
                        img = Image.open(io.BytesIO(message)).copy()
                        images.append(img)
                        print(f"  Received image via WebSocket (no header) ({len(images)})")
                    except Exception as e:
                        print(f"  WS binary parse error: {e}")
            else:
                try:
                    img = Image.open(io.BytesIO(message)).copy()
                    images.append(img)
                except Exception:
                    pass
        elif isinstance(message, str):
            data = json.loads(message)
            msg_type = data.get("type", "")
            msg_data = data.get("data", {})
            if msg_type == "execution_start":
                pid = msg_data.get("prompt_id")
                if pid:
                    print(f"  Execution started: {pid[:8]}...")
            elif msg_type == "executing":
                if msg_data.get("node") is None:
                    print("  Execution complete")
                    exec_done.set()
            elif msg_type == "execution_error":
                print(f"  Execution error: {msg_data}")
                exec_done.set()
            elif msg_type == "progress":
                val = msg_data.get("value", 0)
                mx = msg_data.get("max", 1)
                print(f"  Progress: {val}/{mx}", end="\r")

    def on_error(ws, error):
        print(f"  WS error: {error}")
        exec_done.set()

    ws_connected = threading.Event()

    def on_open(ws):
        print("  WebSocket connected")
        ws_connected.set()

    ws = websocket.WebSocketApp(
        f"{WS_URL}/ws?clientId={client_id}",
        on_message=on_message,
        on_open=on_open,
        on_error=on_error,
    )

    wst = threading.Thread(target=ws.run_forever, daemon=True)
    wst.start()

    if not ws_connected.wait(timeout=15):
        print("  X WS connection timeout")

    return ws, images, exec_done


def generate_video(prompt, width=960, height=544, duration=3, fps=24, seed=None):
    """Generate a video using safe LTXV settings."""
    
    # Check VRAM before starting
    vram_used = get_vram_usage_gb()
    print(f"VRAM usage before start: {vram_used:.1f} GB")
    if vram_used > VRAM_THRESHOLD_GB:
        print(f"VRAM too high ({vram_used:.1f}GB), clearing...")
        clear_vram()
        time.sleep(2)
    
    workflow = load_workflow(WORKFLOW_FILE)
    
    # Set prompt
    workflow["320:319"]["inputs"]["value"] = prompt
    
    # Set resolution (safer lower values)
    workflow["320:312"]["inputs"]["value"] = width
    workflow["320:299"]["inputs"]["value"] = height
    
    # Set duration and fps (separate int/float nodes for different node requirements)
    workflow["320:301"]["inputs"]["value"] = duration
    workflow["320:300"]["inputs"]["value"] = int(fps)
    workflow["320:300_float"]["inputs"]["value"] = float(fps)
    
    # Set seed
    if seed is None:
        seed = int(time.time() * 1000) % (2**32)
    # Update noise seed nodes
    workflow["320:276"]["inputs"]["noise_seed"] = seed
    workflow["320:277"]["inputs"]["noise_seed"] = seed + 1
    
    # Fix MathExpression nodes - removed, using direct values instead
    # Math nodes removed from simplified workflow
    
    print(f"\nGenerating: {prompt}")
    print(f"Resolution: {width}x{height}, Duration: {duration}s @ {fps}fps")
    print(f"Seed: {seed}")
    
    client_id = uuid.uuid4().hex
    ws, ws_images, exec_done = collect_ws_images(client_id)
    
    try:
        response = queue_prompt(workflow, client_id)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f"X HTTP {e.code}: {body[:500]}")
        ws.close()
        return []
    except Exception as e:
        print(f"X Queue error: {e}")
        ws.close()
        return []
    
    prompt_id = response.get("prompt_id")
    if not prompt_id:
        print("X No prompt_id returned")
        ws.close()
        return []
    
    print(f"Queued: {prompt_id[:8]}...")
    
    # Monitor VRAM during execution
    monitor_stop = threading.Event()
    def monitor_vram():
        while not monitor_stop.wait(5):
            used = get_vram_usage_gb()
            if used > VRAM_THRESHOLD_GB:
                print(f"\nWARNING: VRAM at {used:.1f}GB, approaching limit!")
    
    monitor_thread = threading.Thread(target=monitor_vram, daemon=True)
    monitor_thread.start()
    
    # Wait for completion
    exec_done.wait(timeout=TIMEOUT)
    monitor_stop.set()
    time.sleep(2)
    ws.close()
    
    # Save output
    saved_paths = []
    for i, img in enumerate(ws_images):
        output_file = os.path.join(OUTPUT_DIR, f"ltxv_safe_{seed}_{i}.png")
        img.save(output_file)
        print(f"OK {output_file}")
        saved_paths.append(output_file)
    
    if not saved_paths:
        print("! No images received via WebSocket")
    
    # Clear VRAM after generation
    clear_vram()
    
    return saved_paths


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Safe LTXV Video Generation")
    parser.add_argument("--prompt", "-p", type=str, required=True, help="Video prompt")
    parser.add_argument("--width", type=int, default=960, help="Width (default: 960)")
    parser.add_argument("--height", type=int, default=544, help="Height (default: 544)")
    parser.add_argument("--duration", type=int, default=3, help="Duration in seconds (default: 3)")
    parser.add_argument("--fps", type=int, default=24, help="FPS (default: 24)")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    
    args = parser.parse_args()
    
    generate_video(
        prompt=args.prompt,
        width=args.width,
        height=args.height,
        duration=args.duration,
        fps=args.fps,
        seed=args.seed
    )


if __name__ == "__main__":
    main()
