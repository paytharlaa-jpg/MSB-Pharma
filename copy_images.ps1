$srcDir = "C:\Users\Abhiram\.gemini\antigravity-ide\brain\c1ea7653-aafd-4c22-8c4d-ee7d66f5c026"
Copy-Item (Join-Path $srcDir "hero_scientific_bg_1792654712091.jpg") "public\images\hero-scientific-background.webp" -Force
Copy-Item (Join-Path $srcDir "pharma_qc_lab_1792654732543.jpg") "public\images\about-company.webp" -Force
Copy-Item (Join-Path $srcDir "global_pharma_supply_1792654755884.jpg") "public\images\global-supply.webp" -Force

Copy-Item (Join-Path $srcDir "global_pharma_supply_1792654755884.jpg") "public\images\blog-supply-chain.webp" -Force
Copy-Item (Join-Path $srcDir "pharma_qc_lab_1792654732543.jpg") "public\images\blog-impurity.webp" -Force
Copy-Item (Join-Path $srcDir "hero_scientific_bg_1792654712091.jpg") "public\images\blog-hyderabad.webp" -Force

Write-Output "Assets successfully placed in public/images/"
