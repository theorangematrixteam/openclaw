$sheetId = "1I_kzeojMYeNSTL6Os2NvXTH5ukSVmBx8JUx6nWZyb30"
$jsonFile = "$PSScriptRoot\proofit-linkedin-data.json"
$rawJson = Get-Content $jsonFile -Raw
$data = $rawJson | ConvertFrom-Json

# Mapping: JSON array indices to sheet rows
# JSON 0-18 = rows 2-20
# JSON 19 = row 21
# Row 22 is empty (skip)
# JSON 20-23 = rows 23-26

for ($i = 0; $i -lt $data.Count; $i++) {
    if ($i -le 19) {
        $row = $i + 2
    } else {
        $row = $i + 3  # Skip empty row 22
    }
    
    $caption = $data[$i][0]
    
    # Escape for JSON inside cmd /c double-quoted string
    # Need to escape: backslash -> \\, double quote -> \", newline -> \n, then wrap in cmd quotes
    $escaped = $caption -replace '\\', '\\' -replace '"', '\"' -replace "`r`n", "\n" -replace "`n", "\n"
    $jsonVal = "[[`"$escaped`"]]"
    
    # Need to escape for cmd /c: double quotes inside the outer quotes need backslash+quote
    $cmdJson = $jsonVal -replace '"', '\"'
    
    Write-Host "Updating row $row..."
    
    # Use cmd /c to avoid PowerShell quoting issues
    $cmdStr = "gog sheets update $sheetId proofit!L$row --values-json `"$cmdJson`" --input USER_ENTERED"
    $result = cmd /c $cmdStr 2>&1
    
    if ($result -match "Updated") {
        Write-Host "  OK: Row $row"
    } else {
        Write-Host "  ERROR row ${row}: $result"
    }
    
    Start-Sleep -Milliseconds 300
}

Write-Host "`nDone!"