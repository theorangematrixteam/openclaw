# Upload image to Imgur and get public URL
$ImagePath = "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\36.png"

# Read image as base64
$ImageBytes = [System.IO.File]::ReadAllBytes($ImagePath)
$Base64Image = [System.Convert]::ToBase64String($ImageBytes)

# Upload to Imgur (using public client ID - no auth needed for anonymous uploads)
$Headers = @{
    "Authorization" = "Client-ID 546c25a59c58ad7"
}

$Body = @{
    image = $Base64Image
    type = "base64"
} | ConvertTo-Json

Write-Host "Uploading image to Imgur..." -ForegroundColor Cyan

try {
    $Response = Invoke-RestMethod -Uri "https://api.imgur.com/3/upload" -Method POST -Headers $Headers -Body $Body
    
    if ($Response.success) {
        $ImageUrl = $Response.data.link
        Write-Host "✅ Image uploaded!" -ForegroundColor Green
        Write-Host "URL: $ImageUrl"
        
        # Save URL to file for next script
        $ImageUrl | Out-File -FilePath "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\image-url.txt" -NoNewline
        
        # Now schedule the Buffer post
        Write-Host "`nScheduling Buffer post..." -ForegroundColor Cyan
        
        & "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\scripts\schedule-buffer-post.ps1" -ImageUrl $ImageUrl
    } else {
        Write-Host "❌ Upload failed: $($Response.data.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}