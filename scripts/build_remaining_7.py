import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import urllib.request
from PIL import Image
from scripts.build_all_images import (
    crop_to_aspect,
    apply_branding,
    PUBLIC_IMAGES_DIR,
    download_image
)

REMAINING_7 = [
    {
        "filename": "category-bulk-drugs.webp",
        "source": "photo-1584308666744-24d5c474f2ae", # pharma manufacturing production
        "aspect": (16, 9),
        "needs_branding": False,
    },
    {
        "filename": "journey-synthesis.webp",
        "source": "photo-1532094349884-543bc11b234d", # organic chemistry synthesis lab
        "aspect": (16, 9),
        "needs_branding": False,
    },
    {
        "filename": "journey-extraction.webp",
        "source": "photo-1527613426441-4da17471b66d", # precision chemical extraction & processing
        "aspect": (16, 9),
        "needs_branding": False,
    },
    {
        "filename": "timeline-climate-dispatch.webp",
        "source": "photo-1519003722824-194d4455a60c", # modern commercial refrigerated truck
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "truck",
        "position": "center_left",
        "scale": 0.25,
    },
    {
        "filename": "trust-molecular-rigor.webp",
        "source": "photo-1518152006812-edab29b069ac", # crystal molecular geometry
        "aspect": (16, 9),
        "needs_branding": False,
    },
    {
        "filename": "global-reach-freight.webp",
        "source": "photo-1436491865332-7a61a109cc05", # international air freight cargo plane
        "aspect": (16, 9),
        "needs_branding": True,
        "style": "air_cargo",
        "position": "bottom_right",
        "scale": 0.22,
    },
    {
        "filename": "gallery-quality-documentation.webp",
        "source": "photo-1450133064473-71024230f91b", # audit document verification
        "aspect": (4, 3),
        "needs_branding": False,
    },
]

def main():
    print("Building remaining 7 images...")
    for item in REMAINING_7:
        fn = item["filename"]
        out_path = os.path.join(PUBLIC_IMAGES_DIR, fn)
        print(f"Downloading {fn} from Unsplash ID {item['source']}...")
        img = download_image(item["source"])
        aspect_w, aspect_h = item["aspect"]
        img_cropped = crop_to_aspect(img, aspect_w, aspect_h)

        if max(img_cropped.size) > 1920:
            ratio = 1920 / max(img_cropped.size)
            new_size = (int(img_cropped.width * ratio), int(img_cropped.height * ratio))
            img_cropped = img_cropped.resize(new_size, Image.Resampling.LANCZOS)

        if item.get("needs_branding", False):
            img_final = apply_branding(
                img_cropped,
                style=item.get("style", "truck"),
                position=item.get("position", "auto"),
                scale=item.get("scale", 0.22)
            )
        else:
            img_final = img_cropped

        img_final.save(out_path, "WEBP", quality=92)
        print(f"  -> Saved {out_path} ({img_final.size[0]}x{img_final.size[1]})")

if __name__ == "__main__":
    main()
