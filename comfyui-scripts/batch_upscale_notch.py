"""Batch upscale + webp conversion for Notch India generated images."""

import subprocess
import os
import sys

src_dir = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\z_image_gen"
upscale_dir = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\notch india outfits\upscaled"
webp_dir = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\notch india outfits\webp"
upscale_script = r"C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\comfyui-scripts\upscaler.py"

os.makedirs(upscale_dir, exist_ok=True)
os.makedirs(webp_dir, exist_ok=True)

# Get the outfit files (renamed ones)
files = sorted([f for f in os.listdir(src_dir) if f.startswith("outfit") and f.endswith(".png")])
print(f"Found {len(files)} images to upscale")

# Step 1: Upscale all via SeedVR2
for i, f in enumerate(files, 1):
    path = os.path.join(src_dir, f)
    print(f"\n[{i}/{len(files)}] Upscaling {f}...")
    result = subprocess.run(
        [sys.executable, upscale_script, "--input", path],
        capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"ERROR: {result.stderr[:300]}")

# Step 2: Convert upscaled to webp
from PIL import Image

upscaled_files = sorted([f for f in os.listdir(upscale_dir) if f.endswith(".png")])
print(f"\nConverting {len(upscaled_files)} upscaled images to webp...")

for f in upscaled_files:
    src = os.path.join(upscale_dir, f)
    dst = os.path.join(webp_dir, f.replace(".png", ".webp"))
    img = Image.open(src).convert("RGB")
    img.save(dst, "WEBP", quality=90, method=6)
    print(f"  {f} -> {os.path.basename(dst)}")

print(f"\nDone! Upscaled: {upscale_dir}\nWebP: {webp_dir}")