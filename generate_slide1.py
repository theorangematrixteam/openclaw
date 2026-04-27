import subprocess
import sys

# Generate the lifestyle model image matching the reference style
result = subprocess.run([
    sys.executable, "z_image_turbo.py",
    "--prompt", "Professional fashion editorial photograph of a South Asian female model wearing elegant gold jewelry rings, olive green linen outfit, shot from below looking up, blue clear sky background, bright natural daylight, sharp focus on hands and jewelry, clean minimal composition, high-end commercial photography, editorial style, ultra detailed skin texture, 8k quality",
    "--width", "1080",
    "--height", "1440",
    "--steps", "12",
    "--cfg", "1.5",
    "--prefix", "orange_matrix_slide1_model",
    "--count", "1"
], cwd=r"C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\skills\comfyui-scripts", capture_output=True, text=True)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr, file=sys.stderr)
sys.exit(result.returncode)
