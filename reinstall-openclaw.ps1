# OpenClaw Reinstall Script — Preserves All Data
# Run this in PowerShell after OpenClaw gateway is stopped

$ErrorActionPreference = "Stop"

Write-Host "=== OpenClaw Reinstall with Data Preservation ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify backup
$backupDir = "C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-backup-2026-04-27"
if (-not (Test-Path $backupDir)) {
    Write-Host "ERROR: Backup not found at $backupDir" -ForegroundColor Red
    exit 1
}
Write-Host "Step 1: Backup verified" -ForegroundColor Green

# Step 2: Stop OpenClaw
Write-Host "Step 2: Stopping OpenClaw..." -ForegroundColor Yellow
openclaw gateway stop
Start-Sleep -Seconds 3

# Step 3: Save configs
Write-Host "Step 3: Saving configs..." -ForegroundColor Yellow
$backupConfigDir = "C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-backup-configs"
New-Item -ItemType Directory -Path $backupConfigDir -Force | Out-Null
Copy-Item "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\openclaw.json" "$backupConfigDir\" -Force -ErrorAction SilentlyContinue
Write-Host "  Configs saved" -ForegroundColor Green

# Step 4: Uninstall
Write-Host "Step 4: Uninstalling..." -ForegroundColor Yellow
npm uninstall -g openclaw
Write-Host "  Done" -ForegroundColor Green

# Step 5: Clear cache
Write-Host "Step 5: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "  Done" -ForegroundColor Green

# Step 6: Reinstall
Write-Host "Step 6: Installing OpenClaw..." -ForegroundColor Yellow
npm install -g openclaw@latest
Write-Host "  Done" -ForegroundColor Green

# Step 7: Start briefly to create fresh config
Write-Host "Step 7: Starting briefly..." -ForegroundColor Yellow
openclaw gateway start
Start-Sleep -Seconds 5
openclaw gateway stop
Start-Sleep -Seconds 2
Write-Host "  Fresh config created" -ForegroundColor Green

# Step 8: Restore configs
Write-Host "Step 8: Restoring configs..." -ForegroundColor Yellow
Copy-Item "$backupConfigDir\openclaw.json" "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\" -Force -ErrorAction SilentlyContinue
Write-Host "  Configs restored" -ForegroundColor Green

# Step 9: Restore workspace
Write-Host "Step 9: Restoring workspace..." -ForegroundColor Yellow
$workspaceDest = "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace"
$files = Get-ChildItem -Path $backupDir -File -Recurse
$count = 0
foreach ($file in $files) {
    $relPath = $file.FullName.Substring($backupDir.Length + 1)
    $destPath = Join-Path $workspaceDest $relPath
    $destDir = Split-Path -Parent $destPath
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $file.FullName $destPath -Force
    $count++
}
Write-Host "  Restored $count files" -ForegroundColor Green

# Step 10: Start
Write-Host "Step 10: Starting OpenClaw..." -ForegroundColor Yellow
openclaw gateway start
Write-Host "  Started" -ForegroundColor Green

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
Write-Host "Reconnect and test image viewer" -ForegroundColor White
