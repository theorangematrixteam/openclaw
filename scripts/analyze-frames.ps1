# Use Ollama API to analyze images with gemma4:26b
$Frames = @(
    "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\frame_1.png",
    "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\frame_2.png",
    "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\frame_3.png",
    "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\frame_4.png",
    "C:\\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\frame_5.png",
    "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\frame_6.png",
    "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\frame_7.png",
    "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\frame_8.png"
)

$Descriptions = @()

foreach ($Frame in $Frames) {
    $FrameName = [System.IO.Path]::GetFileName($Frame)
    Write-Host "Analyzing $FrameName..." -ForegroundColor Cyan
    
    # Convert image to base64
    $ImageBytes = [System.IO.File]::ReadAllBytes($Frame)
    $Base64Image = [System.Convert]::ToBase64String($ImageBytes)
    
    # Call Ollama API
    $Body = @{
        model = "gemma4:26b"
        prompt = "Describe this image in detail. What do you see? What text is visible? What is the setting? Be specific and accurate."
        images = @($Base64Image)
        stream = $false
    } | ConvertTo-Json -Depth 10
    
    try {
        $Response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method POST -Body $Body -ContentType "application/json"
        $Description = $Response.response
        $Descriptions += $Description
        Write-Host "  $Description" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== REEL SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total frames analyzed: $($Descriptions.Count)"

# Save descriptions to file
$Output = @{
    frames = $Frames | ForEach-Object { [System.IO.Path]::GetFileName($_) }
    descriptions = $Descriptions
}

$Output | ConvertTo-Json -Depth 10 | Out-File "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\reel-analysis.json"

Write-Host "`nAnalysis saved to reel-analysis.json" -ForegroundColor Green