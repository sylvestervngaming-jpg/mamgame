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

# Export at high-res 2.5x HD scale (target character height in texture = 275px, displayed at 110px in game)
# This gives razor-sharp 2.5x Retina resolution with zero blurriness!
HD_SCALE = 275.0 / char_h # ~0.30055

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

parts = {
    "back_cloak": composite_layers(["Layer 15"]),
    "leg_left": composite_layers(["Layer 16 Copy", "Layer 16 Copy 3", "Layer 16 Copy 2"]),
    "leg_right": composite_layers(["Layer 16 Copy 4", "Layer 16 Copy 5", "Layer 16 Copy 6"]),
    "sprout_top": composite_layers(["Layer 9"]),
    "head_face": composite_layers([
        "Layer 7", "Layer 8", "Layer 5 Copy", "Layer 4", "Layer 2", 
        "Layer 13", "Layer 14", "Layer 3", "Layer 4 Copy", "Layer 5", "Layer 6"
    ]),
    "left_cloak": composite_layers(["Layer 10"]),
    "right_cloak": composite_layers(["Layer 11"])
}

# In-game displayed height = 110px. The Container baseScale will be (110.0 / 275.0) = 0.40
GAME_HEIGHT = 110.0
GAME_SCALE = GAME_HEIGHT / char_h # 0.12022

part_info = {}

for part_name, img in parts.items():
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        # Scaled to HD resolution
        sw = max(4, int(cropped.width * HD_SCALE))
        sh = max(4, int(cropped.height * HD_SCALE))
        hd_scaled = cropped.resize((sw, sh), Image.Resampling.LANCZOS)
        
        file_path = f"assets/sprites/mam_parts/{part_name}.png"
        hd_scaled.save(file_path)
        
        # Position in GAME coordinates (where char bottom is 0)
        # Top-left of part relative to char_bbox center-bottom:
        x_in_game = (bbox[0] + cropped.width / 2 - char_w / 2) * GAME_SCALE
        y_in_game = (bbox[1] + cropped.height / 2 - char_h) * GAME_SCALE
        
        # Pivot point relative to char_bbox in game units:
        top_y_in_game = (bbox[1] - char_h) * GAME_SCALE
        bottom_y_in_game = (bbox[3] - char_h) * GAME_SCALE
        
        # In-game display width and height
        disp_w = cropped.width * GAME_SCALE
        disp_h = cropped.height * GAME_SCALE
        
        part_info[part_name] = {
            "x": round(x_in_game, 2),
            "y": round(y_in_game, 2),
            "top_y": round(top_y_in_game, 2),
            "bottom_y": round(bottom_y_in_game, 2),
            "disp_w": round(disp_w, 2),
            "disp_h": round(disp_h, 2),
            "hd_w": sw,
            "hd_h": sh
        }
        print(f"Exported HD {part_name}: {sw}x{sh} HD (in-game disp: {disp_w:.1f}x{disp_h:.1f}) at ({x_in_game:.1f}, {y_in_game:.1f})")

import json
print("\nHD PART MANIFEST:")
print(json.dumps(part_info, indent=2))