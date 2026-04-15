$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# First, let's just get account info
$Body = @{
    query = "query { account { email } }"
} | ConvertTo-Json

Write-Host "=== Testing Buffer API ==="
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    Write-Host "Account: "
    $Response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_"
}

# Now get organizations
Write-Host ""
Write-Host "=== Organizations ==="
$Body2 = @{
    query = "query { account { organizations { id name } } }"
} | ConvertTo-Json

try {
    $Response2 = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body2
    $Response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_"
}

# Get channels
Write-Host ""
Write-Host "=== Channels ==="
$Body3 = @{
    query = "query { account { organizations { channels { id name service } } } }"
} | ConvertTo-Json

try {
    $Response3 = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body3
    $Response3 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_"
}