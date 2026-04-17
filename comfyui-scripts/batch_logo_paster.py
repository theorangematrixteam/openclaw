"""Batch logo paster - run logo_paster.py for all images in a folder."""
import subprocess
import os
import sys
import glob

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(SCRIPT_DIR, "logo_paster.py")
OUTFIT_DIR = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\outfits"
LOGO = r"C:\Users\openclaw.BILLION-DOLLAR-\Documents\ComfyUI\input\logo.png"

# Fix Windows encoding for console output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

images = sorted(glob.glob(os.path.join(OUTFIT_DIR, "*.png")))
print(f"Found {len(images)} images")

success = 0
failed = 0
for i, img in enumerate(images, 1):
    name = os.path.basename(img)
    print(f"[{i}/{len(images)}] Processing: {name}")
    try:
        result = subprocess.run(
            [sys.executable, SCRIPT, "--base", img, "--logo", LOGO, "--x", "3000", "--y", "0", "--width", "1024", "--height", "1024"],
            capture_output=True, text=True, timeout=120, encoding='utf-8', errors='replace'
        )
        if result.returncode == 0 and "OK" in result.stdout:
            print(f"  Done")
            success += 1
        else:
            print(f"  Failed: {result.stdout[-200:] if result.stdout else result.stderr[-200:]}")
            failed += 1
    except subprocess.TimeoutExpired:
        print(f"  Timeout")
        failed += 1
    except Exception as e:
        print(f"  Error: {e}")
        failed += 1

print(f"\nBatch complete: {success} success, {failed} failed")