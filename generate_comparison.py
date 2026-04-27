import subprocess
import sys

# Generate the first image from the reference post style
# "Nano Banana 2 vs GPT Image 2" — split comparison style
result = subprocess.run([
    sys.executable, "z_image_turbo.py",
    "--prompt", "Split-screen comparison layout, left side shows professional product photography of luxury watch on marble surface with studio lighting, right side shows AI-generated version of same watch with slight imperfections, both sides labeled at top with minimal white text banners, dark background, cinematic lighting, editorial photography style, high-end commercial aesthetic, 8k quality, ultra detailed",
    "--width", "1080",
    "--height", "1438",
    "--steps", "15",
    "--cfg", "1.5",
    "--prefix", "orange_comparison_slide1",
    "--count", "1"
], cwd=r"C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\skills\comfyui-scripts", capture_output=True, text=True)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr, file=sys.stderr)
sys.exit(result.returncode)
