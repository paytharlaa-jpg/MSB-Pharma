Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = Join-Path $PSScriptRoot "About MSB Pharma\MSB_PHARMACHEM_About_Us_v2.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$xmlDoc = [xml]$xml
$text = ($xmlDoc.document.body.p | ForEach-Object { $_.InnerText }) -join "`r`n"
Set-Content -Path (Join-Path $PSScriptRoot "extracted_about_us.txt") -Value $text -Encoding UTF8
Write-Output "Extracted length: $($text.Length)"
