import os
import sys
import math
from PIL import Image, ImageChops

sys.stdout.reconfigure(encoding='utf-8')

master_path = "assets/sprites/player/mam_master.png"
master = Image.open(master_path).convert("RGBA")

# Base dimensions for each frame in sheet
FRAME_W = 96
FRAME_H = 128

# Let's create an idle sheet (8 frames)
# Frame dimensions: FRAME_W x FRAME_H, sheet width = FRAME_W * 8, height = FRAME_H
idle_sheet = Image.new("RGBA", (FRAME_W * 8, FRAME_H), (0, 0, 0, 0))

# Resize master to fit frame nicely (character height around 106px)
base_char_h = 106
scale = base_char_h / master.height
base_char_w = int(master.width * scale) # ~50px
scaled_base = master.resize((base_char_w, base_char_h), Image.Resampling.LANCZOS)

for i in range(8):
    t = i / 8.0
    # Breathing: subtle height stretch and width contraction
    breath_y = math.sin(t * math.pi * 2) * 3.5
    breath_x = -breath_y * 0.4
    
    cur_w = int(base_char_w + breath_x)
    cur_h = int(base_char_h + breath_y)
    
    frame_img = scaled_base.resize((cur_w, cur_h), Image.Resampling.LANCZOS)
    
    # Slight tilt of sprout/body
    angle = math.sin(t * math.pi * 2) * 1.8
    frame_rotated = frame_img.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    
    # Paste centered at bottom of frame (leaving 6px ground margin)
    paste_x = (i * FRAME_W) + (FRAME_W - frame_rotated.width) // 2
    paste_y = (FRAME_H - 6) - frame_rotated.height
    idle_sheet.paste(frame_rotated, (paste_x, paste_y), frame_rotated)

idle_sheet.save("assets/sprites/player/mam_anim_idle.png")
idle_sheet.save("assets/sprites/mam_anim_idle.png")
print("Exported mam_anim_idle.png (8 frames)")

# Let's create a RUN sheet (8 frames) with alternating foot strides & cloak sway & bounce
run_sheet = Image.new("RGBA", (FRAME_W * 8, FRAME_H), (0, 0, 0, 0))

for i in range(8):
    t = i / 8.0
    # Step bounce (2 steps per cycle: bounce twice)
    bounce_y = abs(math.sin(t * math.pi * 2)) * 6.0
    
    # Forward lean
    lean_angle = -7.0 + math.sin(t * math.pi * 2) * 2.5
    
    # Leg stride squash/stretch
    cur_w = int(base_char_w + math.cos(t * math.pi * 2) * 3.0)
    cur_h = int(base_char_h - bounce_y * 0.5)
    
    frame_img = scaled_base.resize((cur_w, cur_h), Image.Resampling.LANCZOS)
    frame_rotated = frame_img.rotate(lean_angle, resample=Image.Resampling.BICUBIC, expand=True)
    
    paste_x = (i * FRAME_W) + (FRAME_W - frame_rotated.width) // 2
    # Lift off ground during stride peak
    paste_y = (FRAME_H - 6 - int(bounce_y)) - frame_rotated.height
    run_sheet.paste(frame_rotated, (paste_x, paste_y), frame_rotated)

run_sheet.save("assets/sprites/player/mam_anim_run.png")
run_sheet.save("assets/sprites/mam_anim_run.png")
print("Exported mam_anim_run.png (8 frames)")

# Let's create a JUMP sheet (6 frames: Takeoff, Ascend, Apex, Descend, Pre-land, Land-Squash)
jump_sheet = Image.new("RGBA", (FRAME_W * 6, FRAME_H), (0, 0, 0, 0))

jump_configs = [
    # 0: Takeoff (compression before leap)
    {"w": base_char_w + 6, "h": base_char_h - 12, "angle": 0, "off_y": 0},
    # 1: Ascend (stretched tall, legs tucked up)
    {"w": base_char_w - 6, "h": base_char_h + 14, "angle": -3, "off_y": -14},
    # 2: Apex (floating in mid air)
    {"w": base_char_w - 2, "h": base_char_h + 8, "angle": 0, "off_y": -16},
    # 3: Descend (falling down, cloak billowing)
    {"w": base_char_w + 3, "h": base_char_h + 2, "angle": 3, "off_y": -8},
    # 4: Pre-land (extended feet)
    {"w": base_char_w - 2, "h": base_char_h + 6, "angle": 0, "off_y": -2},
    # 5: Land Squash (impact compression)
    {"w": base_char_w + 12, "h": base_char_h - 18, "angle": 0, "off_y": 0},
]

for i, cfg in enumerate(jump_configs):
    frame_img = scaled_base.resize((cfg["w"], cfg["h"]), Image.Resampling.LANCZOS)
    frame_rotated = frame_img.rotate(cfg["angle"], resample=Image.Resampling.BICUBIC, expand=True)
    paste_x = (i * FRAME_W) + (FRAME_W - frame_rotated.width) // 2
    paste_y = (FRAME_H - 6 + cfg["off_y"]) - frame_rotated.height
    jump_sheet.paste(frame_rotated, (paste_x, paste_y), frame_rotated)

jump_sheet.save("assets/sprites/player/mam_anim_jump.png")
jump_sheet.save("assets/sprites/mam_anim_jump.png")
print("Exported mam_anim_jump.png (6 frames)")