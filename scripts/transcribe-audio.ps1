# Transcribe audio file using whisper.cpp
# Usage: .\transcribe-audio.ps1 -AudioFile "path\to\audio.ogg"

param(
    [Parameter(Mandatory=$true)]
    [string]$AudioFile
)

$whisperPath = "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\tools\whisper"
$whisperExe = "$whisperPath\Release\whisper-cli.exe"
$whisperModel = "$whisperPath\ggml-base.en.bin"
$tempWav = "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\media\inbound\temp_audio.wav"

# Load PATH for ffmpeg
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Convert to WAV if needed
Write-Host "Converting audio to WAV format..." -ForegroundColor Cyan
& ffmpeg -y -i $AudioFile -ar 16000 -ac 1 -c:a pcm_s16le $tempWav 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error converting audio file" -ForegroundColor Red
    exit 1
}

# Transcribe
Write-Host "Transcribing..." -ForegroundColor Cyan
$output = & $whisperExe --model $whisperModel --file $tempWav --output-txt 2>&1

# Extract transcription from output
$transcription = $output | Select-String -Pattern '\[\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\]\s+(.+)' | ForEach-Object { $_.Matches.Groups[1].Value }

# Clean up
Remove-Item $tempWav -ErrorAction SilentlyContinue
Remove-Item "$tempWav.txt" -ErrorAction SilentlyContinue

# Output result
$transcription