import os
import sys
from PIL import Image
from psd_tools import PSDImage

sys.stdout.reconfigure(encoding='utf-8')

psd_path = "C:/Users/huynh/Downloads/mầm.psd"
psd = PSDImage.open(psd_path)

full_img = psd.composite()
char_bbox = full_img.getbbox()
char_left, char_top, char_right, char_bottom = char_bbox
char_w = char_right - char_left # 433
char_h = char_bottom - char_top # 915

# Let's group layers and composite each anatomical part at high res, with bounding box relative to char_bbox:
layers_by_name = {layer.name: layer for layer in psd.descendants() if not layer.is_group() and layer.visible}

def composite_layers(layer_names):
    blank = Image.new("RGBA", (char_w, char_h), (0, 0, 0, 0))
    for name in layer_names:
        l = layers_by_name.get(name)
        if l and l.width > 0 and l.height > 0:
            c = l.composite()
            if c:
                ox = l.left - char_left
                oy = l.top - char_top
                blank.paste(c, (ox, oy), c)
    return blank

os.makedirs("assets/sprites/mam_parts", exist_ok=True)

# 1. Back Cloak
back_cloak = composite_layers(["Layer 15"])
# 2. Left Leg
left_leg = composite_layers(["Layer 16 Copy", "Layer 16 Copy 3", "Layer 16 Copy 2"])
# 3. Right Leg
right_leg = composite_layers(["Layer 16 Copy 4", "Layer 16 Copy 5", "Layer 16 Copy 6"])
# 4. Sprout Top
sprout_top = composite_layers(["Layer 9"])
# 5. Head & Face
head_face = composite_layers([
    "Layer 7", "Layer 8", "Layer 5 Copy", "Layer 4", "Layer 2", 
    "Layer 13", "Layer 14", "Layer 3", "Layer 4 Copy", "Layer 5", "Layer 6"
])
# 6. Left Cloak (Front)
left_cloak = composite_layers(["Layer 10"])
# 7. Right Cloak (Front)
right_cloak = composite_layers(["Layer 11"])

parts = {
    "back_cloak": back_cloak,
    "leg_left": left_leg,
    "leg_right": right_leg,
    "sprout_top": sprout_top,
    "head_face": head_face,
    "left_cloak": left_cloak,
    "right_cloak": right_cloak
}

# Crop each part tightly and record its local pivot and offset
part_info = {}
target_scale = 110.0 / char_h # ~0.12022

for part_name, img in parts.items():
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        # Scaled dimensions
        sw = max(2, int(cropped.width * target_scale))
        sh = max(2, int(cropped.height * target_scale))
        scaled = cropped.resize((sw, sh), Image.Resampling.LANCZOS)
        
        file_path = f"assets/sprites/mam_parts/{part_name}.png"
        scaled.save(file_path)
        
        # Center of this part relative to character base (bottom center)
        cx_rel = (bbox[0] + cropped.width / 2 - char_w / 2) * target_scale
        cy_rel = (bbox[1] + cropped.height / 2 - char_h) * target_scale
        
        part_info[part_name] = {
            "file": file_path,
            "x": round(cx_rel, 2),
            "y": round(cy_rel, 2),
            "w": sw,
            "h": sh,
            "orig_top": round((bbox[1] - char_h) * target_scale, 2),
            "orig_bottom": round((bbox[3] - char_h) * target_scale, 2)
        }
        print(f"Saved {part_name}: {sw}x{sh} at ({cx_rel:.1f}, {cy_rel:.1f})")

import json
print("\nPART CONFIG:")
print(json.dumps(part_info, indent=2))