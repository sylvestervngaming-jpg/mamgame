import os
import sys
import glob
from psd_tools import PSDImage

sys.stdout.reconfigure(encoding='utf-8')

psd_files = glob.glob("C:/Users/huynh/Downloads/*.psd")
print("Found PSD files count:", len(psd_files))

if psd_files:
    psd_path = psd_files[0]
    psd = PSDImage.open(psd_path)
    print(f"PSD Size: {psd.width}x{psd.height}")

    os.makedirs("assets/sprites/mam_layers", exist_ok=True)

    print("\n--- LAYER LIST ---")
    for i, layer in enumerate(psd.descendants()):
        print(f"Layer {i}: '{layer.name}', Visible: {layer.visible}, Size: {layer.width}x{layer.height}, Offset: ({layer.left}, {layer.top}), IsGroup: {layer.is_group()}")
        if not layer.is_group() and layer.width > 0 and layer.height > 0:
            safe_name = f"layer_{i}"
            img = layer.composite()
            if img:
                out_path = f"assets/sprites/mam_layers/{i}_{layer.name}.png"
                try:
                    img.save(out_path)
                    print(f"  -> Exported: {out_path}")
                except Exception as e:
                    fallback_path = f"assets/sprites/mam_layers/{i}_layer.png"
                    img.save(fallback_path)
                    print(f"  -> Exported fallback: {fallback_path}")

    # Also composite full image
    full_img = psd.composite()
    full_img.save("assets/sprites/mam_full_preview.png")
    print("\nExported full preview to assets/sprites/mam_full_preview.png successfully!")