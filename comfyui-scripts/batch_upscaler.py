"""Batch upscale the 8 kept Totsburg images."""
import subprocess
import sys
import os
import glob

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upscaler.py")
INPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\z_image_prompt_reader_outputs"
OUTPUT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\upscaled_images"

images = sorted(glob.glob(os.path.join(INPUT_DIR, "*.png")))
# Skip already upscaled
already_done = set(os.path.splitext(f)[0].replace("upscaled_", "") for f in os.listdir(OUTPUT_DIR) if f.startswith("upscaled_zimage"))

success = 0
failed = 0
skipped = 0

for img in images:
    base = os.path.splitext(os.path.basename(img))[0]
    out_name = f"upscaled_{base}.png"
    out_path = os.path.join(OUTPUT_DIR, out_name)
    
    if os.path.exists(out_path):
        print(f"SKIP (already exists): {os.path.basename(img)}")
        skipped += 1
        continue
    
    print(f"\nUpscaling: {os.path.basename(img)}")
    try:
        result = subprocess.run(
            [sys.executable, SCRIPT, "--input", img],
            capture_output=True, text=True, timeout=600, encoding='utf-8', errors='replace'
        )
        if result.returncode == 0 and "OK" in result.stdout:
            print(f"  Done")
            success += 1
        else:
            print(f"  Failed: {result.stdout[-300:] if result.stdout else result.stderr[-300:]}")
            failed += 1
    except subprocess.TimeoutExpired:
        print(f"  Timeout (10min)")
        failed += 1
    except Exception as e:
        print(f"  Error: {e}")
        failed += 1

print(f"\nBatch complete: {success} success, {failed} failed, {skipped} skipped")