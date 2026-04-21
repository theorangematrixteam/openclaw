"""
SeedVR2 Upscaler - Uses Jinay's original ComfyUI workflow (upscaler.json)
Receives output via WebSocket (ETN_SendImageWebSocket).

Usage:
  python upscaler.py --input image.png
  python upscaler.py --input image.png --resolution 4096
  python upscaler.py --batch --input-dir ./images
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
WORKFLOW_FILE = os.path.join(SCRIPT_DIR, "upscaler.json")

OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\upscaled_images"

TIMEOUT = 600  # 10 min per image for upscaling
# =========================================

os.makedirs(OUTPUT_DIR, exist_ok=True)


def load_workflow(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def image_to_base64(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


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
    """Connect WebSocket, collect ETN_SendImageWebSocket images."""
    import websocket

    images = []
    exec_done = threading.Event()

    def on_message(ws, message):
        if isinstance(message, bytes):
            # 8-byte header from ComfyUI binary events
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


def upscale(image_path, resolution=4096):
    """Run upscaler workflow on a single image."""
    workflow = load_workflow(WORKFLOW_FILE)

    # Encode input image as base64 for ETN_LoadImageBase64 (node 23)
    print("Encoding input image...")
    b64 = image_to_base64(image_path)
    workflow["23"]["inputs"]["image"] = b64

    # Set resolution (node 10 - SeedVR2VideoUpscaler)
    workflow["10"]["inputs"]["resolution"] = resolution

    # Start WebSocket listener
    client_id = uuid.uuid4().hex
    print("Connecting WebSocket...")
    ws, ws_images, exec_done = collect_ws_images(client_id)

    # Queue
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

    # Wait for completion
    exec_done.wait(timeout=TIMEOUT)
    time.sleep(2)  # extra margin for late binary messages
    ws.close()

    # Save WebSocket images
    saved_paths = []
    for i, img in enumerate(ws_images):
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        output_file = os.path.join(OUTPUT_DIR, f"upscaled_{base_name}.png")
        img.save(output_file)
        print(f"OK {output_file}")
        saved_paths.append(output_file)

    if not saved_paths:
        print("! No images received via WebSocket")

    return saved_paths


def batch_upscale(input_dir, resolution=4096, pattern="*.png"):
    """Upscale all matching images in a directory."""
    images = sorted(glob.glob(os.path.join(input_dir, pattern)))
    print(f"Found {len(images)} images in {input_dir}")

    success = 0
    failed = 0
    for i, img in enumerate(images, 1):
        name = os.path.basename(img)
        print(f"\n[{i}/{len(images)}] Upscaling: {name}")
        try:
            result = upscale(img, resolution=resolution)
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
    parser = argparse.ArgumentParser(description="SeedVR2 Upscaler - Jinay's original workflow")
    parser.add_argument("--input", "-i", type=str, help="Path to single image")
    parser.add_argument("--batch", action="store_true", help="Batch mode: upscale all images in --input-dir")
    parser.add_argument("--input-dir", type=str, help="Directory for batch mode")
    parser.add_argument("--resolution", type=int, default=4096, help="Target resolution (default: 4096)")

    args = parser.parse_args()

    if args.batch:
        if not args.input_dir:
            print("Error: --input-dir required for batch mode")
            sys.exit(1)
        batch_upscale(args.input_dir, resolution=args.resolution)
    elif args.input:
        if not os.path.exists(args.input):
            print(f"Error: Image not found: {args.input}")
            sys.exit(1)
        upscale(args.input, resolution=args.resolution)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()