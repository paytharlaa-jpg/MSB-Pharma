Add-Type -AssemblyName System.Drawing
$logoPath = Join-Path $PSScriptRoot "logo\MSB_Pharmachem_Logo_10000px.jpg.jpeg"
$img = [System.Drawing.Image]::FromFile($logoPath)

function Resize-Image($src, $targetPath, $maxDim) {
    $ratio = [Math]::Min($maxDim / $src.Width, $maxDim / $src.Height)
    $newW = [int]($src.Width * $ratio)
    $newH = [int]($src.Height * $ratio)
    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $newW, $newH)
    $g.Dispose()
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created $targetPath ($newW x $newH)"
}

Resize-Image $img (Join-Path $PSScriptRoot "logo_preview_512.png") 512
Resize-Image $img (Join-Path $PSScriptRoot "logo_preview_1024.png") 1024
$img.Dispose()
