# MSB PHARMACHEM: AI image shot list

18 photo slots replace the current 1376×768 images. Keep the **file name** exactly as listed: the site already points at these names, so no code changes are needed.

## How to generate

**Target:** 16:9 landscape, **at least 2400 px wide** (2752×1536 or larger is ideal). Download the PNG/JPG at full resolution.

| Tool | Setting for full quality |
|---|---|
| Midjourney (best realism) | add `--ar 16:9 --style raw --v 7`, then **Upscale (Subtle)** → ~2900 px |
| Flux 1.1 Pro Ultra (e.g. on fal.ai / Replicate / Krea) | aspect 16:9 → 2752×1536 natively |
| Google Gemini / Imagen, ChatGPT | aspect 16:9, then upscale 2× with the free **Upscayl** desktop app |

Generate 2–4 variations per slot and keep the best. Reject anything with garbled text, fake logos, extra fingers, or unrealistic lab equipment.

**Add this style line to the end of every prompt** so the whole site looks like one photo shoot:

> photorealistic editorial commercial photography, modern clean pharmaceutical environment, cool white and deep navy blue tones with subtle green accents, soft diffused daylight, shallow depth of field, crisp detail, 16:9, no text, no labels, no logos, no watermark

## Slots

| # | Save as | Used on | Prompt (then add the style line) |
|---|---|---|---|
| 1 | `hero-scientific-background` | Login pages, social share image | Dark moody macro of laboratory glassware and pipette tips on a reflective bench, deep navy background with soft blue and green bokeh, lots of empty dark space on the left |
| 2 | `hero-molecular-environment` | Gallery header, molecule section backdrop | Abstract scientific scene: glowing translucent molecular structures floating in deep navy space, soft blue and green light, cinematic depth, large calm empty areas |
| 3 | `about-company` | About, gallery, homepage categories & story | Bright modern pharmaceutical quality-control laboratory interior, two chemists in white lab coats and safety glasses working at instruments, wide shot, glass partitions, organised benches |
| 4 | `api-materials` | Product journey, categories, gallery | Fine white pharmaceutical API powder in a glass petri dish with a stainless steel spatula on a lab bench, analytical balance softly blurred behind |
| 5 | `pharmaceutical-raw-materials` | Product journey, categories, timeline | Sealed white HDPE pharmaceutical drums and amber glass jars of crystalline raw materials neatly arranged in a clean storage room, batch tags without readable text |
| 6 | `excipients-materials` | Product journey, categories, gallery | Pharmaceutical excipient granules and white tablets spilling from a stainless steel scoop beside a tablet press, clean production setting |
| 7 | `chemicals-solvents` | Product journey, categories | Rows of amber and clear reagent bottles and solvent containers on a chemical-resistant shelf in a modern laboratory, orderly, cool light |
| 8 | `impurity-standards` | Several homepage sections, gallery | Close-up of small glass vials of reference standards in a white rack next to an HPLC autosampler tray, precise and clinical |
| 9 | `molecular-closeup` | Trust section, quality gallery | Macro photograph of sparkling crystalline pharmaceutical compound under a microscope light, blue and green highlights, extreme detail |
| 10 | `quality-science-visual` | Brand promise, About, gallery | QC analyst in a lab coat and gloves reviewing an HPLC chromatogram on a monitor beside the instrument, face partly turned away, modern lab |
| 11 | `trust-documentation-visual` | Compliance header, trust & timeline sections | Certificate-of-analysis style documents in a folder, a pen and a sealed sample bottle on a clean white desk, quality-assurance office, paper text unreadable |
| 12 | `reliability-logistics-visual` | Brand promise, trust section, gallery | Warehouse loading dock: pallets of sealed white pharmaceutical drums wrapped in film being loaded into a clean truck, early morning light |
| 13 | `supply-chain-editorial` | About, homepage story, timeline, gallery | Wide view of a modern pharmaceutical warehouse with tall racking, labelled drums and cartons, polished floor, forklift in the distance |
| 14 | `global-supply-network` | Global reach section, About | Air cargo terminal at dusk, wrapped pallets of pharmaceutical cargo beside a cargo aircraft, runway lights, deep blue sky |
| 15 | `global-supply` | Gallery (export) | Cargo aircraft being loaded with temperature-controlled pharmaceutical containers on an airport apron, blue hour |
| 16 | `blog-hyderabad` | Blog: Hyderabad pharma capital | Hyderabad HITEC City skyline at blue hour with modern glass office towers, wide cinematic view |
| 17 | `blog-impurity` | Blog: impurity standards | HPLC instrument in a modern analytical lab with a chromatogram on screen, vials in the autosampler, shallow depth of field |
| 18 | `blog-supply-chain` | Blog: supply-chain resilience | Long aisle of a pharmaceutical warehouse with stacked drums on pallets, a worker with a tablet doing inventory, cool light |

The three gallery artworks (`gallery-molecular-architecture`, `gallery-supply-network`, `gallery-quality-documentation`) are already high resolution and don't need replacing.

## Install

1. Put the files in the `incoming-images/` folder at the project root, named as above (any of `.png`, `.jpg`, `.jpeg`, `.webp`).
2. Run:

   ```bash
   node scripts/process-images.mjs
   ```

The script centre-crops each image to 16:9 (keeping the most important area in frame), resizes it to 2400×1350, saves an optimised WebP into `public/images/`, and warns about any image that is smaller than 1920 px wide.
