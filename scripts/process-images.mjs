// Installs AI-generated photos from ./incoming-images into ./public/images.
// Each file must be named after its slot (see docs/image-shot-list.md), e.g. incoming-images/api-materials.png
// Output: 2400×1350 WebP (16:9, smart crop), replacing the existing file of the same name.
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const IN = path.join(ROOT, "incoming-images");
const OUT = path.join(ROOT, "public", "images");
const WIDTH = 2400;
const HEIGHT = 1350;

const SLOTS = new Set([
  "hero-scientific-background",
  "hero-molecular-environment",
  "about-company",
  "api-materials",
  "pharmaceutical-raw-materials",
  "excipients-materials",
  "chemicals-solvents",
  "impurity-standards",
  "molecular-closeup",
  "quality-science-visual",
  "trust-documentation-visual",
  "reliability-logistics-visual",
  "supply-chain-editorial",
  "global-supply-network",
  "global-supply",
  "blog-hyderabad",
  "blog-impurity",
  "blog-supply-chain",
]);

if (!fs.existsSync(IN)) {
  fs.mkdirSync(IN);
  console.log(`Created ${path.relative(ROOT, IN)}/. Put the generated images there and run this again.`);
  process.exit(0);
}

const files = fs.readdirSync(IN).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
if (files.length === 0) {
  console.log("No images found in incoming-images/.");
  process.exit(0);
}

const done = new Set();
for (const file of files) {
  const slot = path.parse(file).name.toLowerCase();
  if (!SLOTS.has(slot)) {
    console.warn(`SKIP  ${file}: name doesn't match a slot in docs/image-shot-list.md`);
    continue;
  }
  const src = path.join(IN, file);
  const meta = await sharp(src).metadata();
  const dest = path.join(OUT, `${slot}.webp`);
  const info = await sharp(src)
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: 80, effort: 6, smartSubsample: true })
    .toFile(dest);
  const warn = (meta.width ?? 0) < 1920 ? `  (warning: source only ${meta.width}px wide, may look soft; upscale it first)` : "";
  console.log(`OK    ${slot}.webp  ${meta.width}×${meta.height} → ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB${warn}`);
  done.add(slot);
}

const missing = [...SLOTS].filter((s) => !done.has(s));
console.log(`\n${done.size} installed, ${missing.length} still using the old image${missing.length ? `: ${missing.join(", ")}` : ""}`);
