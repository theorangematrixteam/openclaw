$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Test creating a Twitter post (doesn't require image)
$Mutation = @'
mutation {
  createPost(input: {
    channelId: "69d77de4031bfa423ce5c359"
    text: "Test post from Buffer API - hello world! 🚀 #testing"
    mode: addToQueue
    schedulingType: automatic
  }) {
    ... on PostActionSuccess {
      post {
        id
        text
        status
        channelService
        createdAt
      }
    }
    ... on InvalidInputError {
      message
    }
    ... on UnauthorizedError {
      message
    }
    ... on LimitReachedError {
      message
    }
    ... on UnexpectedError {
      message
    }
  }
}
'@

$Body = @{ query = $Mutation } | ConvertTo-Json -Depth 10

Write-Host "=== Creating Test Post on Proofit Twitter ===" -ForegroundColor Cyan
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    Write-Host "Success!" -ForegroundColor Green
    $Response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}