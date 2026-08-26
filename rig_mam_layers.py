import os
import sys
from PIL import Image
from psd_tools import PSDImage

sys.stdout.reconfigure(encoding='utf-8')

psd_path = "C:/Users/huynh/Downloads/mầm.psd"
psd = PSDImage.open(psd_path)

# Character total bounding box
full_img = psd.composite()
char_bbox = full_img.getbbox() # (611, 89, 1044, 1004) -> width: 433, height: 915
char_left, char_top, char_right, char_bottom = char_bbox
char_w = char_right - char_left
char_h = char_bottom - char_top
char_cx = char_left + char_w / 2 # ~827.5
char_base_y = char_bottom # 1004

print(f"Char BBox: {char_bbox}, Dimensions: {char_w}x{char_h}, CenterX: {char_cx}, BaseY: {char_base_y}")

# Target scale in game: Height = 110px
target_scale = 110.0 / char_h
print(f"Target Scale Factor: {target_scale:.5f}")

os.makedirs("assets/sprites/mam_rig", exist_ok=True)

# Key body parts we need to isolate and save
# Let's inspect each visible layer and composite them into clean functional parts:
# 1. Back Cloak (Layer 15)
# 2. Left Leg (Layer 16 Copy, Copy 3, Copy 2)
# 3. Right Leg (Layer 16 Copy 4, Copy 5, Copy 6)
# 4. Head & Face (Folder 1 / Layer 9, Layer 8, Layer 7, Layer 5 Copy, Layer 3, Layer 4 Copy, Layer 5, Layer 6, Layer 14, Layer 13)
# 5. Sprout / Leaf Antenna (Layer 9)
# 6. Left Cloak (Layer 10)
# 7. Right Cloak (Layer 11)

part_manifest = {}

for layer in psd.descendants():
    if not layer.is_group() and layer.visible and layer.width > 0 and layer.height > 0:
        l_bbox = layer.bbox
        # relative offset from char center (X) and char bottom (Y)
        rel_x = (l_bbox[0] + layer.width / 2 - char_cx) * target_scale
        rel_y = (l_bbox[1] + layer.height / 2 - char_base_y) * target_scale
        scaled_w = max(2, int(layer.width * target_scale))
        scaled_h = max(2, int(layer.height * target_scale))
        
        img = layer.composite()
        if img:
            scaled_img = img.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)
            safe_name = "".join(c for c in layer.name if c.isalnum() or c in ('_', '-')).strip()
            out_file = f"assets/sprites/mam_rig/{layer.layer_id}_{safe_name}.png"
            scaled_img.save(out_file)
            part_manifest[layer.name] = {
                "file": out_file,
                "x": round(rel_x, 2),
                "y": round(rel_y, 2),
                "w": scaled_w,
                "h": scaled_h,
                "layer_id": layer.layer_id
            }

print("Processed Layers Manifest:")
import json
print(json.dumps(part_manifest, indent=2))