"""
Logo Paster - Uses Jinay's original ComfyUI workflow (logo_paster.json)
Receives output via WebSocket (ETN_SendImageWebSocket).

Usage:
  python logo_paster.py --base outfit_1.png --logo logo.png
  python logo_paster.py --base outfit_1.png --logo logo.png --x 3000 --y 0 --width 1024 --height 1024
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
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ================= CONFIG =================
SERVER_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKFLOW_FILE = os.path.join(SCRIPT_DIR, "logo_paster.json")

COMFYUI_INPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Documents\ComfyUI\input"
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\logo_paster"

TIMEOUT = 120
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


def wait_for_completion_http(prompt_id):
    """Poll /history/{prompt_id} until done."""
    start = time.time()
    while True:
        if time.time() - start > TIMEOUT:
            raise TimeoutError(f"Timed out after {TIMEOUT}s")
        try:
            req = urllib.request.Request(f"{SERVER_URL}/history/{prompt_id}")
            with urllib.request.urlopen(req, timeout=10) as resp:
                history = json.loads(resp.read())
        except Exception:
            time.sleep(1)
            continue
        if prompt_id in history:
            entry = history[prompt_id]
            status = entry.get("status", {})
            if status.get("status_str") == "error":
                raise RuntimeError(f"Execution error: {status}")
            if "outputs" in entry:
                return entry
        time.sleep(1)


def collect_ws_images(client_id):
    """Connect WebSocket, queue prompt, collect ETN_SendImageWebSocket images."""
    import websocket

    images = []
    prompt_id_holder = [None]
    exec_done = threading.Event()

    def on_message(ws, message):
        if isinstance(message, bytes):
            # Binary image from ETN_SendImageWebSocket
            # Format: 8-byte header (4 bytes event type + 4 bytes format) + image data
            try:
                if len(message) > 8:
                    # Strip the 8-byte header used by ComfyUI binary events
                    header = message[:8]
                    image_data = message[8:]
                    try:
                        img = Image.open(io.BytesIO(image_data)).copy()
                        images.append(img)
                        print(f"  Received image via WebSocket ({len(images)})")
                    except Exception:
                        # Try without stripping header
                        img = Image.open(io.BytesIO(message)).copy()
                        images.append(img)
                        print(f"  Received image via WebSocket (no header) ({len(images)})")
                else:
                    img = Image.open(io.BytesIO(message)).copy()
                    images.append(img)
                    print(f"  Received image via WebSocket ({len(images)})")
            except Exception as e:
                print(f"  WS binary parse error: {e}")
        elif isinstance(message, str):
            data = json.loads(message)
            msg_type = data.get("type", "")
            msg_data = data.get("data", {})

            if msg_type == "execution_start":
                pid = msg_data.get("prompt_id")
                if pid:
                    prompt_id_holder[0] = pid
                    print(f"  Execution started: {pid[:8]}...")

            elif msg_type == "executing":
                if msg_data.get("node") is None:
                    print("  Execution complete")
                    exec_done.set()

            elif msg_type == "execution_error":
                print(f"  Execution error: {msg_data}")
                exec_done.set()

            elif msg_type == "execution_cached":
                pass  # silent

    def on_error(ws, error):
        print(f"  WS error: {error}")
        exec_done.set()

    def on_close(ws, close_status, close_msg):
        pass

    ws_connected = threading.Event()

    def on_open_inner(ws):
        print("  WebSocket connected")
        ws_connected.set()

    ws = websocket.WebSocketApp(
        f"{WS_URL}/ws?clientId={client_id}",
        on_message=on_message,
        on_open=on_open_inner,
        on_error=on_error,
        on_close=on_close,
    )

    wst = threading.Thread(target=ws.run_forever, daemon=True)
    wst.start()

    # Wait for WS to be fully connected
    if not ws_connected.wait(timeout=10):
        print("  X WS connection timeout")

    return ws, images, prompt_id_holder, exec_done


def generate(base_image, logo_image, x=3000, y=0, logo_width=1024, logo_height=1024):
    """Run the original logo_paster workflow and collect output via WebSocket."""
    workflow = load_workflow(WORKFLOW_FILE)

    # Encode base image as base64 for ETN_LoadImageBase64 (node 7)
    print("Encoding base image...")
    b64 = image_to_base64(base_image)
    workflow["7"]["inputs"]["image"] = b64

    # Copy logo to ComfyUI input dir for LoadImage (node 2)
    logo_filename = os.path.basename(logo_image)
    dest = os.path.join(COMFYUI_INPUT_DIR, logo_filename)
    if os.path.abspath(logo_image) != os.path.abspath(dest):
        import shutil
        shutil.copy2(logo_image, dest)
    workflow["2"]["inputs"]["image"] = logo_filename

    # Set overlay params (node 3 - Image Overlay)
    workflow["3"]["inputs"]["x_offset"] = x
    workflow["3"]["inputs"]["y_offset"] = y
    workflow["3"]["inputs"]["width"] = logo_width
    workflow["3"]["inputs"]["height"] = logo_height

    # Start WebSocket listener
    client_id = uuid.uuid4().hex
    print("Connecting WebSocket...")
    ws, ws_images, pid_holder, exec_done = collect_ws_images(client_id)

    # Queue the prompt
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

    # Wait for execution to complete (via WS signal or HTTP polling)
    exec_done.wait(timeout=TIMEOUT)
    time.sleep(1)  # extra margin for late binary messages

    ws.close()

    # Use WebSocket-collected images
    saved_paths = []
    if ws_images:
        for i, img in enumerate(ws_images):
            base_name = os.path.splitext(os.path.basename(base_image))[0]
            output_file = os.path.join(OUTPUT_DIR, f"logo_pasted_{base_name}.png")
            img.save(output_file)
            print(f"OK {output_file}")
            saved_paths.append(output_file)
    else:
        # Fallback: check /history for any saved images
        print("! No WS images. Checking /history...")
        try:
            entry = wait_for_completion_http(prompt_id)
            for node_id, node_output in entry.get("outputs", {}).items():
                for img_info in node_output.get("images", []):
                    if "filename" in img_info:
                        from urllib.parse import urlencode
                        params = urlencode({
                            "filename": img_info["filename"],
                            "subfolder": img_info.get("subfolder", ""),
                            "type": img_info.get("type", "output"),
                        })
                        req = urllib.request.Request(f"{SERVER_URL}/view?{params}")
                        with urllib.request.urlopen(req) as resp:
                            img = Image.open(io.BytesIO(resp.read())).copy()
                        base_name = os.path.splitext(os.path.basename(base_image))[0]
                        output_file = os.path.join(OUTPUT_DIR, f"logo_pasted_{base_name}.png")
                        img.save(output_file)
                        print(f"OK (history) {output_file}")
                        saved_paths.append(output_file)
        except Exception as e:
            print(f"X Fallback failed: {e}")

    return saved_paths


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Logo Paster - Jinay's original workflow")
    parser.add_argument("--base", "-b", type=str, required=True, help="Path to base/outfit image")
    parser.add_argument("--logo", "-l", type=str, required=True, help="Path to logo image (with alpha)")
    parser.add_argument("--x", type=int, default=3000, help="X offset (default: 3000)")
    parser.add_argument("--y", type=int, default=0, help="Y offset (default: 0)")
    parser.add_argument("--width", type=int, default=1024, help="Logo width (default: 1024)")
    parser.add_argument("--height", type=int, default=1024, help="Logo height (default: 1024)")

    args = parser.parse_args()

    if not os.path.exists(args.base):
        print(f"Error: Base image not found: {args.base}")
        sys.exit(1)
    if not os.path.exists(args.logo):
        print(f"Error: Logo image not found: {args.logo}")
        sys.exit(1)

    print(f"Base: {args.base}")
    print(f"Logo: {args.logo}")
    print(f"Position: ({args.x}, {args.y}) | Size: {args.width}x{args.height}")

    saved = generate(args.base, args.logo, x=args.x, y=args.y,
                     logo_width=args.width, logo_height=args.height)

    print(f"\nDone! {len(saved)} images saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()