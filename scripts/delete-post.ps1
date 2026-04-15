# Buffer - Delete Post
# Usage: .\delete-post.ps1 -PostId "xxx"

param(
    [Parameter(Mandatory=$true)]
    [string]$PostId
)

$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$Mutation = "mutation {
  deletePost(input: { id: `"$PostId`" }) {
    ... on DeletePostSuccess {
      id
    }
    ... on VoidMutationError {
      message
    }
  }
}"

$Body = @{ query = $Mutation } | ConvertTo-Json

Write-Host "=== Deleting Buffer Post ===" -ForegroundColor Cyan
Write-Host "Post ID: $PostId"
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    if ($Response.data.deletePost.id) {
        Write-Host "✅ Post deleted successfully!" -ForegroundColor Green
        Write-Host "ID: $($Response.data.deletePost.id)"
    } else {
        Write-Host "❌ Error: $($Response.data.deletePost.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}