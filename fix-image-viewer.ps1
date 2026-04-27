# Fix OpenClaw Image Viewer (sharp module)
# Run this in PowerShell as the openclaw user
# Requires: OpenClaw gateway stopped first

$ErrorActionPreference = "Stop"

Write-Host "=== OpenClaw Image Viewer Fix ===" -ForegroundColor Cyan
Write-Host ""

# Paths
$openclawSharp = "C:\Users\openclaw.BILLION-DOLLAR-\AppData\Roaming\npm\node_modules\openclaw\node_modules\@img\sharp-win32-x64\lib\sharp-win32-x64.node"
$globalSharp = "C:\Users\openclaw.BILLION-DOLLAR-\AppData\Roaming\npm\node_modules\sharp\node_modules\@img\sharp-win32-x64\lib\sharp-win32-x64.node"

# Step 1: Check if OpenClaw is running
Write-Host "Step 1: Checking OpenClaw status..." -ForegroundColor Yellow
try {
    $status = openclaw gateway status 2>$null
    if ($status -match "running|active") {
        Write-Host "  WARNING: OpenClaw is running. Stop it first:" -ForegroundColor Red
        Write-Host "  openclaw gateway stop" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "  OpenClaw not running (good)" -ForegroundColor Green
}

# Step 2: Check files exist
Write-Host "Step 2: Checking sharp binaries..." -ForegroundColor Yellow
if (-not (Test-Path $openclawSharp)) {
    Write-Host "  ERROR: OpenClaw sharp binary not found at:" -ForegroundColor Red
    Write-Host "  $openclawSharp" -ForegroundColor White
    exit 1
}
if (-not (Test-Path $globalSharp)) {
    Write-Host "  ERROR: Global sharp binary not found at:" -ForegroundColor Red
    Write-Host "  $globalSharp" -ForegroundColor White
    Write-Host "  Run: npm install -g sharp" -ForegroundColor Cyan
    exit 1
}

$oldFile = Get-Item $openclawSharp
$newFile = Get-Item $globalSharp

Write-Host "  OpenClaw binary: $($oldFile.LastWriteTime) ($($oldFile.Length) bytes)" -ForegroundColor Gray
Write-Host "  Global binary:   $($newFile.LastWriteTime) ($($newFile.Length) bytes)" -ForegroundColor Gray

# Step 3: Backup old binary
Write-Host "Step 3: Backing up old binary..." -ForegroundColor Yellow
$backup = "$openclawSharp.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $openclawSharp $backup -Force
Write-Host "  Backup saved to: $backup" -ForegroundColor Green

# Step 4: Replace binary
Write-Host "Step 4: Replacing binary..." -ForegroundColor Yellow
Copy-Item $globalSharp $openclawSharp -Force
$updatedFile = Get-Item $openclawSharp
Write-Host "  Done. New timestamp: $($updatedFile.LastWriteTime)" -ForegroundColor Green

# Step 5: Verify with Node
Write-Host "Step 5: Testing sharp module..." -ForegroundColor Yellow
$testResult = node -e "try { require('sharp'); console.log('OK'); } catch(e) { console.log('FAIL:', e.message); }" 2>&1
if ($testResult -eq "OK") {
    Write-Host "  Sharp loads successfully!" -ForegroundColor Green
} else {
    Write-Host "  Sharp still failing. Trying rebuild..." -ForegroundColor Red
    Write-Host "  Running: npm rebuild sharp --verbose" -ForegroundColor Cyan
    
    Set-Location "C:\Users\openclaw.BILLION-DOLLAR-\AppData\Roaming\npm\node_modules\openclaw"
    npm rebuild sharp --verbose
    
    $testResult2 = node -e "try { require('sharp'); console.log('OK'); } catch(e) { console.log('FAIL:', e.message); }" 2>&1
    if ($testResult2 -eq "OK") {
        Write-Host "  Rebuild successful!" -ForegroundColor Green
    } else {
        Write-Host "  REBUILD FAILED. Full error:" -ForegroundColor Red
        Write-Host $testResult2
        exit 1
    }
}

# Step 6: Instructions
Write-Host ""
Write-Host "=== Fix Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Start OpenClaw: openclaw gateway start" -ForegroundColor Yellow
Write-Host "2. Reconnect and ask me to view an image" -ForegroundColor Yellow
Write-Host ""
Write-Host "If images still don't load after restart," -ForegroundColor Gray
Write-Host "the issue may require a full OpenClaw reinstall." -ForegroundColor Gray
