Add-Type -AssemblyName System.IO.Compression.FileSystem
$xlsxPath = Join-Path $PSScriptRoot "About MSB Pharma\Porduct LIST.xlsx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)

# Get shared strings
$strings = @()
$ssEntry = $zip.GetEntry("xl/sharedStrings.xml")
if ($ssEntry) {
    $stream = $ssEntry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    foreach ($si in $xml.sst.si) {
        $strings += $si.t
        if (-not $si.t -and $si.r) {
            $strings += ($si.r | ForEach-Object { $_.t }) -join ""
        }
    }
}

# Get sheet1
$sheetEntry = $zip.GetEntry("xl/worksheets/sheet1.xml")
$sheetData = @()
if ($sheetEntry) {
    $stream = $sheetEntry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    foreach ($row in $xml.worksheet.sheetData.row) {
        $rowCells = @()
        foreach ($c in $row.c) {
            $val = $c.v
            if ($c.t -eq "s") {
                $idx = [int]$val
                $val = $strings[$idx]
            }
            $rowCells += "$($c.r): $val"
        }
        $sheetData += ($rowCells -join " | ")
    }
}

$zip.Dispose()
$out = $sheetData -join "`r`n"
Set-Content -Path (Join-Path $PSScriptRoot "extracted_products.txt") -Value $out -Encoding UTF8
Write-Output "Extracted $($sheetData.Count) rows"
