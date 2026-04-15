# Analyze video using FFmpeg scene detection + gemma4:26b

param(
    [string]$VideoPath,
    [int]$MaxFrames = 5,
    [double]$SceneThreshold = 0.3
)

$ErrorActionPreference = "Continue"

# Validate input
if (-not (Test-Path $VideoPath)) {
    Write-Host "ERROR: Video file not found: $VideoPath" -ForegroundColor Red
    exit 1
}

$VideoName = [System.IO.Path]::GetFileNameWithoutExtension($VideoPath)
$TempDir = [System.IO.Path]::GetDirectoryName($VideoPath)
$KeyFramesDir = Join-Path $TempDir "keyframes_$VideoName"

# Create temp directory for keyframes
if (-not (Test-Path $KeyFramesDir)) {
    New-Item -ItemType Directory -Path $KeyFramesDir -Force | Out-Null
}

Write-Host "=== Video Analysis with Scene Detection ===" -ForegroundColor Cyan
Write-Host "Video: $VideoName"
Write-Host "Scene threshold: $SceneThreshold"
Write-Host "Max frames: $MaxFrames"
Write-Host ""

# Step 1: Extract keyframes using scene detection
Write-Host "Step 1: Extracting keyframes..." -ForegroundColor Cyan

$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

$OutputPattern = "$KeyFramesDir\frame_%03d.png"

# Use ffmpeg directly
$FFmpegCmd = "ffmpeg -y -i `"$VideoPath`" -vf `"select='gt(scene,$SceneThreshold)'`" -vsync vfr -frames:v $MaxFrames `"$OutputPattern`""
Invoke-Expression $FFmpegCmd | Out-Null

# Check if frames were extracted
$Frames = Get-ChildItem -Path $KeyFramesDir -Filter "*.png" | Sort-Object Name

if ($Frames.Count -eq 0) {
    Write-Host "No scene changes detected. Using evenly spaced frames..." -ForegroundColor Yellow
    
    # Fallback: evenly spaced frames
    $FallbackCmd = "ffmpeg -y -i `"$VideoPath`" -vf `"select='not(mod(n\,60))'`" -vsync vfr -frames:v $MaxFrames `"$OutputPattern`""
    Invoke-Expression $FallbackCmd | Out-Null
    
    $Frames = Get-ChildItem -Path $KeyFramesDir -Filter "*.png" | Sort-Object Name
}

if ($Frames.Count -eq 0) {
    Write-Host "ERROR: Could not extract any frames" -ForegroundColor Red
    exit 1
}

Write-Host "Extracted $($Frames.Count) keyframes" -ForegroundColor Green

# Step 2: Analyze each keyframe with gemma4:26b
Write-Host "`nStep 2: Analyzing frames with gemma4:26b..." -ForegroundColor Cyan

$Descriptions = @()
$FrameNum = 0

foreach ($Frame in $Frames) {
    $FrameNum++
    Write-Host "  Analyzing frame $FrameNum/$($Frames.Count)..." -ForegroundColor Gray
    
    try {
        # Convert to base64
        $ImageBytes = [System.IO.File]::ReadAllBytes($Frame.FullName)
        $Base64Image = [System.Convert]::ToBase64String($ImageBytes)
        
        # Call Ollama API
        $Body = @{
            model = "gemma4:26b"
            prompt = "Describe this image in detail. What objects, people, settings, and TEXT are visible? Be specific about any text overlays. Keep description concise but complete."
            images = @($Base64Image)
            stream = $false
        } | ConvertTo-Json -Depth 10
        
        $Response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method POST -Body $Body -ContentType "application/json" -TimeoutSec 60
        
        $Description = $Response.response
        $Descriptions += [PSCustomObject]@{
            Frame = $Frame.Name
            Description = $Description
        }
        
        Write-Host "    Done" -ForegroundColor DarkGray
        
    } catch {
        Write-Host "    ERROR: $_" -ForegroundColor Red
        $Descriptions += [PSCustomObject]@{
            Frame = $Frame.Name
            Description = "ERROR: Failed to analyze"
        }
    }
}

# Step 3: Generate summary and caption
Write-Host "`nStep 3: Generating caption..." -ForegroundColor Cyan

# Combine descriptions
$AllDescriptions = $Descriptions | ForEach-Object { "$($_.Frame): $($_.Description)" }
$CombinedText = $AllDescriptions -join "`n`n"

# Ask model for caption
$CaptionPrompt = "Based on these frame descriptions from a video, write a short summary of what the video is about and suggest an engaging Instagram caption (with hashtags) for this content:`n`n$CombinedText"

$CaptionBody = @{
    model = "gemma4:26b"
    prompt = $CaptionPrompt
    stream = $false
} | ConvertTo-Json -Depth 10

try {
    $CaptionResponse = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method POST -Body $CaptionBody -ContentType "application/json" -TimeoutSec 60
    $Caption = $CaptionResponse.response
} catch {
    Write-Host "ERROR generating caption: $_" -ForegroundColor Red
    $Caption = "Failed to generate caption"
}

# Output results
Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
Write-Host "`nFrame Descriptions:" -ForegroundColor Yellow
foreach ($Desc in $Descriptions) {
    Write-Host "`n[$($Desc.Frame)]" -ForegroundColor White
    Write-Host $Desc.Description -ForegroundColor Gray
}

Write-Host "`n`nSuggested Caption:" -ForegroundColor Yellow
Write-Host $Caption -ForegroundColor Green

# Save results
$Output = @{
    video = $VideoName
    frames = $Descriptions
    caption = $Caption
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

$OutputPath = Join-Path $TempDir "analysis_$VideoName.json"
$Output | ConvertTo-Json -Depth 10 | Out-File $OutputPath -Encoding UTF8

Write-Host "`nAnalysis saved to: $OutputPath" -ForegroundColor Green