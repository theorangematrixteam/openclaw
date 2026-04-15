# Upload image using curl.exe
$ImagePath = "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\1.png"

Write-Host "Uploading image..." -ForegroundColor Cyan

# Try litterbox (temporary catbox)
Write-Host "Using litterbox.catbox.moe..." -ForegroundColor Gray
$Result = & curl.exe -s -X POST -F "reqtype=fileupload" -F "time=24h" -F "fileToUpload=@$ImagePath" https://litterbox.catbox.moe/resources/internals/api.php

if ($Result -match "^https://") {
    $ImageUrl = $Result.Trim()
    Write-Host "✅ Image uploaded!" -ForegroundColor Green
    Write-Host "URL: $ImageUrl"
    
    & "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\scripts\schedule-buffer-post.ps1" -ImageUrl $ImageUrl
} else {
    Write-Host "❌ Upload failed" -ForegroundColor Red
    Write-Host "Response: $Result"
}