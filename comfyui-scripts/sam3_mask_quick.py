"""Quick SAM3 mask-only runner."""
import json, urllib.request, urllib.parse, urllib.error, uuid, time, os, io
from PIL import Image

SERVER_URL = "http://127.0.0.1:8000"
WORKFLOW = r"C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\comfyui-scripts\sam3_mask_only.json"
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\masked"
IMG_PATH = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\upscaled_images\upscaled_zimage_South_Asian_toddler_boy_1_year_7409342354318584961.png"

with open(WORKFLOW, "r") as f:
    workflow = json.load(f)

# Upload
with open(IMG_PATH, "rb") as f:
    img_data = f.read()
boundary = uuid.uuid4().hex
body = ("--" + boundary + "\r\n" + 'Content-Disposition: form-data; name="image"; filename="img.png"\r\nContent-Type: image/png\r\n\r\n').encode() + img_data + ("\r\n--" + boundary + "--\r\n").encode()
req = urllib.request.Request(f"{SERVER_URL}/upload/image", data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
with urllib.request.urlopen(req) as resp:
    img_name = json.loads(resp.read())["name"]
workflow["4"]["inputs"]["image"] = img_name

# Queue
client_id = uuid.uuid4().hex
payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")
req = urllib.request.Request(f"{SERVER_URL}/prompt", data=payload, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read())
prompt_id = result.get("prompt_id")
print(f"Queued: {prompt_id[:8]}...")

# Wait
os.makedirs(OUTPUT_DIR, exist_ok=True)
start = time.time()
while time.time() - start < 600:
    try:
        req = urllib.request.Request(f"{SERVER_URL}/history/{prompt_id}")
        with urllib.request.urlopen(req, timeout=10) as resp:
            history = json.loads(resp.read())
        if prompt_id in history:
            entry = history[prompt_id]
            if "outputs" in entry:
                for nid, nout in entry["outputs"].items():
                    if "images" in nout:
                        for img_info in nout["images"]:
                            fn = img_info["filename"]
                            params = urllib.parse.urlencode({"filename": fn, "subfolder": img_info.get("subfolder",""), "type": img_info.get("type","output")})
                            req2 = urllib.request.Request(f"{SERVER_URL}/view?{params}")
                            with urllib.request.urlopen(req2) as resp2:
                                img = Image.open(io.BytesIO(resp2.read())).copy()
                            base = os.path.splitext(os.path.basename(IMG_PATH))[0]
                            if "segmented" in fn:
                                out = os.path.join(OUTPUT_DIR, f"mask_segmented_{base}.png")
                            elif "mask" in fn:
                                out = os.path.join(OUTPUT_DIR, f"mask_raw_{base}.png")
                            else:
                                out = os.path.join(OUTPUT_DIR, f"{fn}")
                            img.save(out)
                            print(f"OK {out}")
                break
    except Exception:
        pass
    time.sleep(2)
print("Done")