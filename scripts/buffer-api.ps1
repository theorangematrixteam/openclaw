# Buffer API Helper
# Usage: .\buffer-api.ps1 -Query "query { ... }" [-Mutation]

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    
    [switch]$Mutation
)

# Get token from TOOLS.md or use cached value
$Token = $env:BUFFER_API_TOKEN

$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$Body = @{ query = $Query } | ConvertTo-Json -Depth 10

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    return $Response
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        $ErrorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Details: $($ErrorDetails.errors.message -join ', ')"
    }
    return $null
}