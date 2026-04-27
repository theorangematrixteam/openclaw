import subprocess
import sys

# Run the z_image_turbo script with our prompt
result = subprocess.run([
    sys.executable, "z_image_turbo.py",
    "--prompt", "A professional product photography studio setup split composition. Left side: expensive traditional photography studio with lights, backdrops, crew, equipment, busy and cluttered. Right side: clean minimal workspace with a single sleek monitor displaying an AI-generated product image of a luxury perfume bottle on white background. Dramatic lighting contrast. Dark charcoal and warm orange accent tones. Cinematic, editorial, high-end commercial photography style. Ultra sharp, 8k quality.",
    "--width", "1152",
    "--height", "1536",
    "--steps", "12",
    "--cfg", "1.5",
    "--prefix", "orange_hook_slide",
    "--count", "1"
], cwd=r"C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\skills\comfyui-scripts", capture_output=True, text=True)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr, file=sys.stderr)
sys.exit(result.returncode)
