import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import numpy as np

def apply_msb_branding(image_path, output_path, style="truck", position="auto", scale=0.22):
    """
    Applies the authentic MSB PHARMACHEM branding logo to an image.
    style: 'truck', 'container', 'box', 'overlay'
    position: 'auto', 'center', 'center_left', 'center_right', 'bottom_right', 'top_left'
    scale: relative width of the logo badge to the image width
    """
    base_img = Image.open(image_path).convert("RGBA")
    w, h = base_img.size

    # Load logo
    logo_path = os.path.join(os.path.dirname(__file__), "..", "public", "icons", "logo-msb-pharmachem.png")
    if not os.path.exists(logo_path):
        logo_path = os.path.join(os.path.dirname(__file__), "..", "public", "images", "logo-msb-pharmachem.png")
    
    logo = Image.open(logo_path).convert("RGBA")

    # Target logo width
    target_w = int(w * scale)
    aspect = logo.height / logo.width
    target_h = int(target_w * aspect)
    logo_resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Create a refined corporate plaque / decal badge for seamless realistic placement on vehicles/containers/crates
    padding_x = int(target_w * 0.12)
    padding_y = int(target_h * 0.12)
    badge_w = target_w + padding_x * 2
    badge_h = target_h + padding_y * 2
    corner_radius = int(badge_h * 0.14)

    # Badge background: clean pristine white with subtle border and shadow
    badge = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    
    # White rounded rectangle with crisp slate border
    draw.rounded_rectangle(
        [(0, 0), (badge_w - 1, badge_h - 1)],
        radius=corner_radius,
        fill=(255, 255, 255, 245),
        outline=(210, 220, 235, 255),
        width=max(2, int(w * 0.002))
    )

    # Paste logo onto badge
    badge.paste(logo_resized, (padding_x, padding_y), logo_resized)

    # Subtle drop shadow
    shadow_pad = int(badge_h * 0.1)
    shadow_img = Image.new("RGBA", (badge_w + shadow_pad * 2, badge_h + shadow_pad * 2), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.rounded_rectangle(
        [(shadow_pad, shadow_pad + 4), (shadow_pad + badge_w, shadow_pad + badge_h + 4)],
        radius=corner_radius,
        fill=(0, 20, 50, 90)
    )
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=max(3, int(w * 0.005))))
    shadow_img.paste(badge, (shadow_pad, shadow_pad), badge)

    full_badge = shadow_img
    fb_w, fb_h = full_badge.size

    # Determine position
    if position == "center":
        x = (w - fb_w) // 2
        y = (h - fb_h) // 2
    elif position == "center_left":
        x = int(w * 0.10)
        y = (h - fb_h) // 2
    elif position == "center_right":
        x = int(w * 0.65)
        y = (h - fb_h) // 2
    elif position == "bottom_right":
        x = w - fb_w - int(w * 0.05)
        y = h - fb_h - int(h * 0.07)
    elif position == "bottom_left":
        x = int(w * 0.05)
        y = h - fb_h - int(h * 0.07)
    elif position == "top_left":
        x = int(w * 0.05)
        y = int(h * 0.07)
    elif position == "top_right":
        x = w - fb_w - int(w * 0.05)
        y = int(h * 0.07)
    else: # auto based on style
        if style == "truck":
            # Typically centered-left or center on the truck cargo body
            x = int(w * 0.22)
            y = int(h * 0.32)
        elif style == "container":
            # On the shipping container face
            x = int(w * 0.25)
            y = int(h * 0.35)
        elif style == "air_cargo":
            x = int(w * 0.20)
            y = int(h * 0.40)
        elif style == "warehouse":
            x = int(w * 0.15)
            y = int(h * 0.42)
        else:
            x = w - fb_w - int(w * 0.05)
            y = h - fb_h - int(h * 0.07)

    # Ensure bounds
    x = max(0, min(x, w - fb_w))
    y = max(0, min(y, h - fb_h))

    # Composite
    base_img.alpha_composite(full_badge, (x, y))

    # Convert to RGB (or keep RGBA if needed, WebP supports both)
    final_img = base_img.convert("RGB")
    final_img.save(output_path, "WEBP", quality=92)
    print(f"Branded image successfully saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python brand_image.py <input_img> <output_webp> [style] [position] [scale]")
        sys.exit(1)
    
    inp = sys.argv[1]
    out = sys.argv[2]
    st = sys.argv[3] if len(sys.argv) > 3 else "truck"
    pos = sys.argv[4] if len(sys.argv) > 4 else "auto"
    sc = float(sys.argv[5]) if len(sys.argv) > 5 else 0.22

    apply_msb_branding(inp, out, style=st, position=pos, scale=sc)

