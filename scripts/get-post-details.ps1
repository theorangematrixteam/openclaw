$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$PostId = "69d7a342fcf902f2723190b1"

$Query = @"
query {
  posts(input: { 
    organizationId: "69d77d1442ba4ea0ce155ed0"
    filter: { status: [scheduled] }
  }) {
    edges {
      node {
        id
        text
        channelId
        channelService
        dueAt
      }
    }
  }
}
"@

$Body = @{ query = $Query } | ConvertTo-Json -Depth 10

$Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body

foreach ($edge in $Response.data.posts.edges) {
    $post = $edge.node
    if ($post.id -eq $PostId) {
        Write-Host "=== Post Details ===" -ForegroundColor Cyan
        Write-Host "ID: $($post.id)"
        Write-Host "Channel: $($post.channelService) - $($post.channelId)"
        Write-Host ""
        Write-Host "Caption:" -ForegroundColor Yellow
        Write-Host $post.text
        Write-Host ""
        Write-Host "Due: $($post.dueAt)"
    }
}