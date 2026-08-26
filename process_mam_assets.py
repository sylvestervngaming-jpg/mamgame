import os
import sys
from PIL import Image
from psd_tools import PSDImage

sys.stdout.reconfigure(encoding='utf-8')

psd_path = "C:/Users/huynh/Downloads/mầm.psd"
psd = PSDImage.open(psd_path)

# Full composite image
full_img = psd.composite()

# Find bounding box of non-transparent pixels
bbox = full_img.getbbox()
print("Character Bounding Box in PSD:", bbox)

cropped = full_img.crop(bbox)
print(f"Cropped Character Size: {cropped.width}x{cropped.height}")

os.makedirs("assets/sprites/player", exist_ok=True)

# Save high-res master sprite
cropped.save("assets/sprites/player/mam_master.png")

# Scale nicely to in-game heights (e.g. 160px height, preserving aspect ratio)
target_height = 160
ratio = target_height / cropped.height
target_width = int(cropped.width * ratio)
scaled_idle = cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)
scaled_idle.save("assets/sprites/player/mam_idle.png")
print(f"Saved scaled player sprite: {target_width}x{target_height} at assets/sprites/player/mam_idle.png")

# Also export individual key groups/layers with relative offsets
print("\nExporting individual sub-layers relative to character center...")
cx = bbox[0] + (bbox[2] - bbox[0]) / 2
bottom_y = bbox[3]

for i, layer in enumerate(psd.descendants()):
    if not layer.is_group() and layer.visible and layer.width > 0 and layer.height > 0:
        l_img = layer.composite()
        if l_img:
            l_bbox = layer.bbox
            rel_x = l_bbox[0] - bbox[0]
            rel_y = l_bbox[1] - bbox[1]
            safe_name = f"part_{i}_{layer.name}.png"
            # save
            try:
                l_img.save(f"assets/sprites/player/{safe_name}")
            except:
                pass

print("Finished asset preparation!")