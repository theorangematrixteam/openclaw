$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$PostId = "69d87f9ff5eaa5a1600165f4"

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

Write-Host "Deleting reel post $PostId..." -ForegroundColor Cyan

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    if ($Response.data.deletePost.id) {
        Write-Host "✅ Reel post deleted" -ForegroundColor Green
    } else {
        Write-Host "❌ Delete failed: $($Response.data.deletePost.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}