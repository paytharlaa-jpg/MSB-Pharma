Add-Type -AssemblyName System.Drawing
$logoPath = Join-Path $PSScriptRoot "logo\MSB_Pharmachem_Logo_10000px.jpg.jpeg"
$img = [System.Drawing.Image]::FromFile($logoPath)
Write-Output "Dimensions: $($img.Width) x $($img.Height)"
$img.Dispose()
