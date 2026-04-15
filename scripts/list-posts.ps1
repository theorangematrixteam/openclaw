# Buffer - List Posts
# Usage: .\list-posts.ps1 [-Status "scheduled"] [-Limit 10]

param(
    [string]$Status = "scheduled",
    [int]$Limit = 10
)

$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# First get organization ID
$OrgQuery = 'query { account { organizations { id } } }'
$OrgBody = @{ query = $OrgQuery } | ConvertTo-Json

try {
    $OrgResponse = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $OrgBody
    $OrgId = $OrgResponse.data.account.organizations[0].id
    
    Write-Host "=== Buffer Posts (Status: $Status) ===" -ForegroundColor Cyan
    Write-Host ""
    
    $Query = @"
query {
  posts(input: { organizationId: "$OrgId" filter: { status: [$Status] } }) {
    edges {
      node {
        id
        text
        status
        dueAt
        channelService
        channelId
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
"@
    
    $Body = @{ query = $Query } | ConvertTo-Json -Depth 10
    
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    $Posts = $Response.data.posts.edges
    
    if ($Posts.Count -eq 0) {
        Write-Host "No $Status posts found." -ForegroundColor Yellow
    } else {
        $Count = [Math]::Min($Posts.Count, $Limit)
        
        for ($i = 0; $i -lt $Count; $i++) {
            $Post = $Posts[$i].node
            $Text = $Post.text.Substring(0, [Math]::Min(50, $Post.text.Length))
            Write-Host "[$($Post.channelService)] $Text..." -ForegroundColor White
            Write-Host "  ID: $($Post.id)" -ForegroundColor Gray
            Write-Host "  Status: $($Post.status)" -ForegroundColor Gray
            if ($Post.dueAt) {
                Write-Host "  Scheduled: $($Post.dueAt)" -ForegroundColor Cyan
            }
            Write-Host ""
        }
        
        if ($Posts.Count -gt $Limit) {
            Write-Host "... and $($Posts.Count - $Limit) more" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}