"""Batch run_crop_v2 for all upscaled Totsburg images."""

import subprocess
import os
import sys

upscaled_dir = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\upscaled_images"
script = r"C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\comfyui-scripts\run_crop_v2.py"

images = sorted([f for f in os.listdir(upscaled_dir) if f.startswith("upscaled_zimage_") and f.endswith(".png")])
# Skip the first one already done
already_done = "upscaled_zimage_cute_South_Asian_toddler_boy_1_42.png"
todo = [f for f in images if f != already_done]

print(f"Processing {len(todo)} images...")
for i, img in enumerate(todo, 1):
    path = os.path.join(upscaled_dir, img)
    print(f"\n[{i}/{len(todo)}] {img}")
    result = subprocess.run(
        [sys.executable, script, "--input", path, "--sam-prompt", "tshirt and shorts"],
        capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"ERROR: {result.stderr[:300]}")

print(f"\nAll done! {len(todo)} images processed.")