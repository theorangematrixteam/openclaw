$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$OrgId = "69d77d1442ba4ea0ce155ed0"
$TargetChannel = "69d79e06031bfa423ce655c2"  # theorangematrix Instagram

$Query = @"
query {
  posts(input: { 
    organizationId: "$OrgId" 
    filter: { status: [scheduled] }
  }) {
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
  }
}
"@

$Body = @{ query = $Query } | ConvertTo-Json -Depth 10

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    Write-Host "=== Scheduled Posts ===" -ForegroundColor Cyan
    Write-Host "Target: theorangematrix Instagram (ID: $TargetChannel)"
    Write-Host ""
    
    foreach ($edge in $Response.data.posts.edges) {
        $post = $edge.node
        $isTarget = $post.channelId -eq $TargetChannel
        
        Write-Host "[$($post.channelService)] $($post.channelId)" -ForegroundColor $(if ($isTarget) { "Green" } else { "Yellow" })
        if ($isTarget) { Write-Host "  ✅ THIS IS theorangematrix" -ForegroundColor Green }
        Write-Host "  Text: $($post.text.Substring(0, [Math]::Min(50, $post.text.Length)))..."
        Write-Host "  Scheduled: $($post.dueAt)"
        Write-Host ""
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}