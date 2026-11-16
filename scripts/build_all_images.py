import os
import sys
import urllib.request
import urllib.parse
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

PUBLIC_IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "images"))
LOCAL_ARTIFACT_DIR = r"C:\Users\Abhiram\.gemini\antigravity\brain\06049fb2-3f96-49dc-89bd-51aea358c8f0"
LOGO_PATH = os.path.join(PUBLIC_IMAGES_DIR, "logo-msb-pharmachem.png")

def get_msb_badge(target_w, target_h):
    """Creates a photorealistic, sharp corporate plaque with MSB PHARMACHEM logo."""
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_w = target_w
    aspect = logo.height / logo.width
    logo_h = int(logo_w * aspect)
    logo_resized = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)

    pad_x = int(logo_w * 0.12)
    pad_y = int(logo_h * 0.12)
    badge_w = logo_w + pad_x * 2
    badge_h = logo_h + pad_y * 2
    corner_r = int(badge_h * 0.14)

    badge = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    draw.rounded_rectangle(
        [(0, 0), (badge_w - 1, badge_h - 1)],
        radius=corner_r,
        fill=(255, 255, 255, 248),
        outline=(200, 215, 235, 255),
        width=max(2, int(badge_w * 0.008))
    )
    badge.paste(logo_resized, (pad_x, pad_y), logo_resized)

    # Shadow
    shadow_pad = int(badge_h * 0.08)
    shadow_img = Image.new("RGBA", (badge_w + shadow_pad * 2, badge_h + shadow_pad * 2), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_img)
    sdraw.rounded_rectangle(
        [(shadow_pad, shadow_pad + 3), (shadow_pad + badge_w, shadow_pad + badge_h + 3)],
        radius=corner_r,
        fill=(0, 20, 50, 95)
    )
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=max(3, int(badge_h * 0.06))))
    shadow_img.paste(badge, (shadow_pad, shadow_pad), badge)
    return shadow_img

def apply_branding(img, style="truck", position="auto", scale=0.22):
    base_img = img.convert("RGBA")
    w, h = base_img.size
    target_logo_w = int(w * scale)
    badge = get_msb_badge(target_logo_w, int(target_logo_w * 0.8))
    bw, bh = badge.size

    if position == "auto":
        if style == "truck":
            x = int(w * 0.22)
            y = int(h * 0.32)
        elif style == "container":
            x = int(w * 0.25)
            y = int(h * 0.35)
        elif style == "air_cargo":
            x = int(w * 0.20)
            y = int(h * 0.40)
        elif style == "warehouse":
            x = int(w * 0.15)
            y = int(h * 0.45)
        else:
            x = w - bw - int(w * 0.05)
            y = h - bh - int(h * 0.07)
    elif position == "bottom_right":
        x = w - bw - int(w * 0.05)
        y = h - bh - int(h * 0.07)
    elif position == "bottom_left":
        x = int(w * 0.05)
        y = h - bh - int(h * 0.07)
    elif position == "top_left":
        x = int(w * 0.05)
        y = int(h * 0.07)
    elif position == "top_right":
        x = w - bw - int(w * 0.05)
        y = int(h * 0.07)
    else:
        x = int(w * 0.20)
        y = int(h * 0.35)

    x = max(0, min(x, w - bw))
    y = max(0, min(y, h - bh))
    base_img.alpha_composite(badge, (x, y))
    return base_img.convert("RGB")

def download_image(url_or_id):
    if url_or_id.startswith("http"):
        url = url_or_id
    else:
        url = f"https://images.unsplash.com/{url_or_id}?auto=format&fit=crop&w=1600&q=88"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return Image.open(resp).convert("RGB")

def crop_to_aspect(img, aspect_w, aspect_h):
    w, h = img.size
    target_ratio = aspect_w / aspect_h
    current_ratio = w / h

    if current_ratio > target_ratio:
        # Image is wider than target: crop width
        new_w = int(h * target_ratio)
        offset = (w - new_w) // 2
        return img.crop((offset, 0, offset + new_w, h))
    else:
        # Image is taller than target: crop height
        new_h = int(w / target_ratio)
        offset = (h - new_h) // 2
        return img.crop((0, offset, w, offset + new_h))

# DEFINITION OF ALL 52 UNIQUE IMAGES
IMAGES_MANIFEST = [
    # 1. Auth Hero
    {
        "filename": "auth-secure-laboratory.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "auth_secure_laboratory_1794853490504.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 2. About Page Hero
    {
        "filename": "about-hero-facility.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "about_hero_facility_1794853526797.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 3. About Page Quality Lab
    {
        "filename": "about-quality-lab.webp",
        "source_type": "unsplash",
        "source": "photo-1582719478250-c89cae4dc85b",
        "aspect": (4, 3),
        "needs_branding": False,
    },
    # 4. About Page Warehouse & Logistics [BRANDED]
    {
        "filename": "about-warehouse-logistics.webp",
        "source_type": "unsplash",
        "source": "photo-1586528116311-ad8dd3c8310d",
        "aspect": (1, 1),
        "needs_branding": True,
        "style": "warehouse",
        "position": "bottom_right",
        "scale": 0.28,
    },
    # 5. About Page Global Reach [BRANDED]
    {
        "filename": "about-global-network.webp",
        "source_type": "unsplash",
        "source": "photo-1494412574643-ff11b0a5c1c3",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "container",
        "position": "bottom_right",
        "scale": 0.22,
    },
    # 6. Compliance Page Hero
    {
        "filename": "compliance-hero-dossier.webp",
        "source_type": "unsplash",
        "source": "photo-1454165804606-c3d57bc86b40",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 7. Brand Promise Quality
    {
        "filename": "brand-promise-quality.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "test_gen_1794853174071.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 8. Brand Promise Reliability [BRANDED]
    {
        "filename": "brand-promise-reliability.webp",
        "source_type": "unsplash",
        "source": "photo-1519003722824-194d4455a60c",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "truck",
        "position": "center_left",
        "scale": 0.26,
    },
    # 9. Brand Promise Trust
    {
        "filename": "brand-promise-trust.webp",
        "source_type": "unsplash",
        "source": "photo-1584362917165-526a968579e8",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 10. Category APIs
    {
        "filename": "category-apis.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "category_apis_1794853492198.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 11. Category Raw Materials
    {
        "filename": "category-raw-materials.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "category_raw_materials_1794853507968.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 12. Category Excipients
    {
        "filename": "category-excipients.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "category_excipients_1794853526584.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 13. Category Chemicals & Solvents
    {
        "filename": "category-chemicals.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "test_batch_2_1794853313878.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 14. Category Impurity Standards
    {
        "filename": "category-impurities.webp",
        "source_type": "unsplash",
        "source": "photo-1512069772995-ec65ed45afd6",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 15. Category Bulk Drugs
    {
        "filename": "category-bulk-drugs.webp",
        "source_type": "url",
        "source": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Biopharmaceutical_Manufacturing.jpg/1920px-Biopharmaceutical_Manufacturing.jpg",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 16. Journey 01 - Raw Sourcing
    {
        "filename": "journey-sourcing.webp",
        "source_type": "unsplash",
        "source": "photo-1563170351-be82bc888aa4",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 17. Journey 02 - Synthesis
    {
        "filename": "journey-synthesis.webp",
        "source_type": "url",
        "source": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Distillation_apparatus_with_round_bottom_flask.jpg/1920px-Distillation_apparatus_with_round_bottom_flask.jpg",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 18. Journey 03 - Formulation
    {
        "filename": "journey-formulation.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "test_batch_1_1794853299043.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 19. Journey 04 - Extraction
    {
        "filename": "journey-extraction.webp",
        "source_type": "url",
        "source": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Rotary_evaporator_in_chemistry_lab.jpg/1920px-Rotary_evaporator_in_chemistry_lab.jpg",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 20. Journey 05 - Certification
    {
        "filename": "journey-certification.webp",
        "source_type": "unsplash",
        "source": "photo-1514733670139-4d87a1941d55",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 21. Reverse Molecular Architecture
    {
        "filename": "reverse-molecular-architecture.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "reverse_molecular_architecture_1794853500614.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 22. Reverse API Stability
    {
        "filename": "reverse-api-stability.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "reverse_api_stability_1794853509456.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 23. Reverse Chromatographic Resolution
    {
        "filename": "reverse-chromatographic-resolution.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "reverse_chromatographic_resolution_1794853519729.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 24. Reverse Audited Dossiers
    {
        "filename": "reverse-audited-dossiers.webp",
        "source_type": "local",
        "source": os.path.join(LOCAL_ARTIFACT_DIR, "reverse_audited_dossiers_1794853527838.jpg"),
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 25. Reverse Cold-Chain Dispatch [BRANDED]
    {
        "filename": "reverse-coldchain-dispatch.webp",
        "source_type": "unsplash",
        "source": "photo-1542296332-2e4473faf563",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "air_cargo",
        "position": "bottom_right",
        "scale": 0.22,
    },
    # 26. Story Kukatpally Hub [BRANDED]
    {
        "filename": "story-kukatpally-hub.webp",
        "source_type": "unsplash",
        "source": "photo-1587293852726-70cdb56c2866",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "warehouse",
        "position": "bottom_right",
        "scale": 0.24,
    },
    # 27. Story Quality Desk
    {
        "filename": "story-quality-desk.webp",
        "source_type": "unsplash",
        "source": "photo-1551836022-d5d88e9218df",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 28. Timeline 01 - Vendor Qualification
    {
        "filename": "timeline-vendor-qualification.webp",
        "source_type": "unsplash",
        "source": "photo-1581093806997-124204d9fa9d",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 29. Timeline 02 - Analytical Testing
    {
        "filename": "timeline-analytical-testing.webp",
        "source_type": "url",
        "source": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Spektrofotometr2.jpg/1920px-Spektrofotometr2.jpg",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 30. Timeline 03 - Regulatory Documentation
    {
        "filename": "timeline-regulatory-documentation.webp",
        "source_type": "unsplash",
        "source": "photo-1450133064473-71024230f91b",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 31. Timeline 04 - Climate-Controlled Dispatch [BRANDED]
    {
        "filename": "timeline-climate-dispatch.webp",
        "source_type": "url",
        "source": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Mercedes_Benz_Actros_with_refrigerated_semitrailer_in_Poland.jpg/1920px-Mercedes_Benz_Actros_with_refrigerated_semitrailer_in_Poland.jpg",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "truck",
        "position": "center_right",
        "scale": 0.22,
    },
    # 32. Trust Values 01 - Molecular Rigor
    {
        "filename": "trust-molecular-rigor.webp",
        "source_type": "url",
        "source": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Scanning_electron_microscope_image_of_paracetamol_crystals.jpg/1920px-Scanning_electron_microscope_image_of_paracetamol_crystals.jpg",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 33. Trust Values 02 - Resilient Inventory [BRANDED]
    {
        "filename": "trust-resilient-inventory.webp",
        "source_type": "unsplash",
        "source": "photo-1553413077-190dd305871c",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "warehouse",
        "position": "bottom_right",
        "scale": 0.24,
    },
    # 34. Trust Values 03 - Auditable Dossiers
    {
        "filename": "trust-auditable-dossiers.webp",
        "source_type": "unsplash",
        "source": "photo-1455390582262-044cdead277a",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 35. Global Reach Freight [BRANDED]
    {
        "filename": "global-reach-freight.webp",
        "source_type": "url",
        "source": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Volga-Dnepr_loading_in_Leipzig.jpg/1920px-Volga-Dnepr_loading_in_Leipzig.jpg",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "air_cargo",
        "position": "bottom_right",
        "scale": 0.22,
    },
    # 36. Hero Molecular Environment Background Fallback
    {
        "filename": "hero-molecular-environment.webp",
        "source_type": "unsplash",
        "source": "photo-1507668077129-56e32842fceb",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 37. Gallery Hero Facility
    {
        "filename": "gallery-hero-facility.webp",
        "source_type": "unsplash",
        "source": "photo-1486406146926-c627a92ad1ab",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 38. Gallery Item 1 - Molecular Architecture
    {
        "filename": "gallery-molecular-architecture.webp",
        "source_type": "unsplash",
        "source": "photo-1530497610245-94d3c16cda28",
        "aspect": (4, 3),
        "needs_branding": False,
    },
    # 39. Gallery Item 2 - Quality Control
    {
        "filename": "gallery-quality-control.webp",
        "source_type": "unsplash",
        "source": "photo-1579154204601-01588f351e67",
        "aspect": (3, 4),
        "needs_branding": False,
    },
    # 40. Gallery Item 3 - Hyderabad Supply Network [BRANDED]
    {
        "filename": "gallery-supply-network.webp",
        "source_type": "unsplash",
        "source": "photo-1601584115197-04ecc0da31d7",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "truck",
        "position": "bottom_right",
        "scale": 0.22,
    },
    # 41. Gallery Item 4 - Organised Warehousing [BRANDED]
    {
        "filename": "gallery-warehousing.webp",
        "source_type": "unsplash",
        "source": "photo-1580674684081-7617fbf3d745",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "warehouse",
        "position": "bottom_right",
        "scale": 0.24,
    },
    # 42. Gallery Item 5 - Quality Documentation
    {
        "filename": "gallery-quality-documentation.webp",
        "source_type": "url",
        "source": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Document_verification_with_magnifying_glass_and_official_stamp.jpg/1920px-Document_verification_with_magnifying_glass_and_official_stamp.jpg",
        "aspect": (4, 3),
        "needs_branding": False,
    },
    # 43. Gallery Item 6 - APIs
    {
        "filename": "gallery-api-materials.webp",
        "source_type": "unsplash",
        "source": "photo-1576086213369-97a306d36557",
        "aspect": (3, 4),
        "needs_branding": False,
    },
    # 44. Gallery Item 7 - Air Freight & Export Dispatch [BRANDED]
    {
        "filename": "gallery-export-dispatch.webp",
        "source_type": "unsplash",
        "source": "photo-1559297434-fae8a1916a79",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "air_cargo",
        "position": "bottom_right",
        "scale": 0.22,
    },
    # 45. Gallery Item 8 - Reliable Logistics [BRANDED]
    {
        "filename": "gallery-reliable-logistics.webp",
        "source_type": "unsplash",
        "source": "photo-1526367790999-0150786686a2",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "truck",
        "position": "bottom_right",
        "scale": 0.24,
    },
    # 46. Gallery Item 9 - Laboratory Precision
    {
        "filename": "gallery-laboratory-precision.webp",
        "source_type": "unsplash",
        "source": "photo-1581093588401-fbb62a02f120",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 47. Gallery Item 10 - Impurity Reference Standards
    {
        "filename": "gallery-impurity-standards.webp",
        "source_type": "unsplash",
        "source": "photo-1582719508461-905c673771fd",
        "aspect": (3, 4),
        "needs_branding": False,
    },
    # 48. Gallery Item 11 - Excipients for Formulation
    {
        "filename": "gallery-excipients.webp",
        "source_type": "unsplash",
        "source": "photo-1584017911766-d451b3d0e843",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 49. Gallery Item 12 - Molecular Close-up
    {
        "filename": "gallery-molecular-closeup.webp",
        "source_type": "unsplash",
        "source": "photo-1618005182384-a83a8bd57fbe",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 50. Blog 1 - Supply Chain Resilience [BRANDED]
    {
        "filename": "blog-supply-chain.webp",
        "source_type": "unsplash",
        "source": "photo-1578575437130-527eed3abbec",
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "container",
        "position": "bottom_right",
        "scale": 0.22,
    },
    # 51. Blog 2 - Impurity Standards
    {
        "filename": "blog-impurity.webp",
        "source_type": "unsplash",
        "source": "photo-1532187863486-abf9dbad1b69",
        "aspect": (16, 9),
        "needs_branding": False,
    },
    # 52. Blog 3 - Hyderabad Pharma Capital
    {
        "filename": "blog-hyderabad.webp",
        "source_type": "unsplash",
        "source": "photo-1570168007204-dfb528c6958f",
        "aspect": (16, 9),
        "needs_branding": False,
    },
]

def main():
    print(f"Starting build for {len(IMAGES_MANIFEST)} unique images...")
    os.makedirs(PUBLIC_IMAGES_DIR, exist_ok=True)

    success_count = 0
    for idx, item in enumerate(IMAGES_MANIFEST, 1):
        fn = item["filename"]
        out_path = os.path.join(PUBLIC_IMAGES_DIR, fn)
        print(f"[{idx}/{len(IMAGES_MANIFEST)}] Processing {fn}...")

        try:
            # 1. Load image
            if item["source_type"] == "local":
                if not os.path.exists(item["source"]):
                    raise FileNotFoundError(f"Local file not found: {item['source']}")
                img = Image.open(item["source"]).convert("RGB")
            else:
                img = download_image(item["source"])

            # 2. Crop to target aspect ratio
            aspect_w, aspect_h = item["aspect"]
            img_cropped = crop_to_aspect(img, aspect_w, aspect_h)

            # Resize if oversized (standardize max dimension to 1920px for high performance & crispness)
            max_dim = 1920
            if max(img_cropped.size) > max_dim:
                ratio = max_dim / max(img_cropped.size)
                new_size = (int(img_cropped.width * ratio), int(img_cropped.height * ratio))
                img_cropped = img_cropped.resize(new_size, Image.Resampling.LANCZOS)

            # 3. Apply MSB Branding if needed
            if item.get("needs_branding", False):
                style = item.get("style", "truck")
                pos = item.get("position", "auto")
                scale = item.get("scale", 0.22)
                img_final = apply_branding(img_cropped, style=style, position=pos, scale=scale)
            else:
                img_final = img_cropped

            # 4. Save as WebP
            img_final.save(out_path, "WEBP", quality=92)
            print(f"  -> Successfully generated {out_path} ({img_final.size[0]}x{img_final.size[1]})")
            success_count += 1
        except Exception as e:
            print(f"  ERROR processing {fn}: {e}")

    print(f"\n==========================================")
    print(f"Image generation completed: {success_count}/{len(IMAGES_MANIFEST)} succeeded.")
    print(f"==========================================")

if __name__ == "__main__":
    main()

