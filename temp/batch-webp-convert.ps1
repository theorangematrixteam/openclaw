$env:GOG_ACCOUNT = "theorangematrixteam@gmail.com"
$srcFolder = "1_OW0AjMbkPtSClNC9DSICnNntX_WGUkf"
$dstFolder = "1NfoeAXLJRQX0IphLe7IFnlxWB1__ErSA"
$tempDir = "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\totsburg_webp"
$webpDir = "$tempDir\webp"

New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
New-Item -ItemType Directory -Path $webpDir -Force | Out-Null

# Get file list
$files = (gog drive ls --parent $srcFolder --json 2>&1 | ConvertFrom-Json).files | Where-Object { $_.mimeType -match "image" }

$total = $files.Count
$done = 0
$failed = 0

foreach ($file in $files) {
    $done++
    $name = $file.name
    $id = $file.id
    $webpName = [System.IO.Path]::GetFileNameWithoutExtension($name) + ".webp"
    $localPng = Join-Path $tempDir $name
    $localWebp = Join-Path $webpDir $webpName
    
    Write-Output "[$done/$total] Processing: $name"
    
    try {
        # Download
        gog drive download $id --out $localPng 2>&1 | Out-Null
        
        # Convert to webp
        ffmpeg -i $localPng -quality 90 -y $localWebp 2>$null
        
        # Upload
        $result = gog drive upload $localWebp --parent $dstFolder 2>&1
        Write-Output "  -> Uploaded: $webpName"
        
        # Cleanup local files
        Remove-Item $localPng -Force -ErrorAction SilentlyContinue
        Remove-Item $localWebp -Force -ErrorAction SilentlyContinue
    }
    catch {
        $failed++
        Write-Output "  -> FAILED: $name"
    }
}

Write-Output ""
Write-Output "=== DONE ==="
Write-Output "Converted: $($done - $failed)/$total"
Write-Output "Failed: $failed"