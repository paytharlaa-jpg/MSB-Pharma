import os
import sys

PUBLIC_IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "images"))

# Logos to keep untouched
KEEP_LOGOS = {
    "logo-msb-pharmachem.png",
    "logo-msb-pharmachem-1024.png",
    "logo-pdf.png",
    "logo-transparent.png",
}

# 52 new unique images
sys_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(sys_path)
from scripts.build_all_images import IMAGES_MANIFEST

MANIFEST_FILENAMES = {item["filename"] for item in IMAGES_MANIFEST}
ALLOWED_FILES = KEEP_LOGOS.union(MANIFEST_FILENAMES)

deleted = []
kept = []

for fn in os.listdir(PUBLIC_IMAGES_DIR):
    full_path = os.path.join(PUBLIC_IMAGES_DIR, fn)
    if os.path.isfile(full_path):
        if fn not in ALLOWED_FILES:
            os.remove(full_path)
            deleted.append(fn)
        else:
            kept.append(fn)

print(f"Deleted {len(deleted)} old/deprecated files:")
for d in sorted(deleted):
    print(f"  - {d}")

print(f"\nRemaining valid files in public/images ({len(kept)} files):")
for k in sorted(kept):
    print(f"  + {k}")

