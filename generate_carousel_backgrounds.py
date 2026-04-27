import subprocess
import sys
import time

# 7 prompts for clean background images (no text)
prompts = [
    # Slide 1: Hook — dramatic model shot
    "Professional fashion editorial photograph, South Asian female model wearing elegant gold jewelry, olive green linen outfit, shot from below looking up, bright blue clear sky background, natural daylight, sharp focus on face and jewelry, clean minimal composition, high-end Vogue style commercial photography, ultra detailed, 8k quality",
    
    # Slide 2: AI Product Shoots — studio vibe
    "Professional product photography, luxury perfume bottle on white marble surface, soft studio lighting, minimal shadows, clean white background, high-end commercial style, ultra sharp, 8k",
    
    # Slide 3: Content Calendar — lifestyle
    "Fashion editorial, South Asian model holding smartphone showing content calendar app, bright modern office with plants, natural window light, clean minimal aesthetic, lifestyle photography, 8k",
    
    # Slide 4: Brand Identity — moody
    "Luxury brand flat lay, gold jewelry rings, watch, perfume bottle on black velvet, dramatic side lighting, dark moody aesthetic, high-end commercial photography, ultra detailed textures, 8k",
    
    # Slide 5: Social Management — behind the scenes
    "Creative workspace, laptop showing Instagram feed, coffee cup, notebooks, aesthetic desk setup, bright natural light, plants in background, minimal clean style, lifestyle photography, 8k",
    
    # Slide 6: Performance Analytics — data meets fashion
    "Modern minimal interior, large screen showing analytics graphs, fashion mannequin in background, soft ambient lighting, clean tech aesthetic, editorial photography, 8k",
    
    # Slide 7: CTA — call to action vibe
    "Fashion model silhouette against sunset sky, golden hour lighting, ocean horizon, dramatic clouds, aspirational lifestyle aesthetic, cinematic, 8k quality"
]

output_dir = r"C:\Users\openclaw.BILLION-DOLLAR-\Desktop\ComfyUi_Python_new\outputs\z_image_prompt_reader_outputs"

for i, prompt in enumerate(prompts, 1):
    print(f"\n{'='*50}")
    print(f"Generating Slide {i}/7...")
    print(f"{'='*50}")
    
    result = subprocess.run([
        sys.executable, "z_image_turbo.py",
        "--prompt", prompt,
        "--width", "1080",
        "--height", "1350",
        "--steps", "12",
        "--cfg", "1.5",
        "--prefix", f"carousel_bg_{i}",
        "--count", "1"
    ], cwd=r"C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\skills\comfyui-scripts", capture_output=True, text=True)
    
    print(result.stdout)
    if result.stderr and "error" in result.stderr.lower():
        print("STDERR:", result.stderr)
    
    time.sleep(2)  # Brief pause between generations

print("\n" + "="*50)
print("All 7 backgrounds generated!")
print(f"Location: {output_dir}")
print("="*50)
