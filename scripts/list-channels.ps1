# Buffer - List Channels
# Usage: .\list-channels.ps1

$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$Query = 'query { account { organizations { id name channels { id name service } } } }'

$Body = @{ query = $Query } | ConvertTo-Json

Write-Host "=== Buffer Channels ===" -ForegroundColor Cyan
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    foreach ($org in $Response.data.account.organizations) {
        Write-Host "Organization: $($org.name)" -ForegroundColor Yellow
        Write-Host "ID: $($org.id)"
        Write-Host ""
        
        foreach ($channel in $org.channels) {
            Write-Host "  [$($channel.service)] $($channel.name)" -ForegroundColor White
            Write-Host "  ID: $($channel.id)" -ForegroundColor Gray
            Write-Host ""
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}