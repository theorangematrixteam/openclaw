$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$PostId = "69d7a517ed26015d8d93dfc5"

$Mutation = @"
mutation {
  deletePost(input: { id: "$PostId" }) {
    ... on DeletePostSuccess {
      id
    }
    ... on VoidMutationError {
      message
    }
  }
}
"@

$Body = @{ query = $Mutation } | ConvertTo-Json -Depth 10

Write-Host "Deleting post $PostId..." -ForegroundColor Cyan

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    if ($Response.data.deletePost.id) {
        Write-Host "✅ Post deleted" -ForegroundColor Green
    } else {
        Write-Host "❌ Delete failed: $($Response.data.deletePost.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}