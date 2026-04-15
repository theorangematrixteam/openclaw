$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Test creating a simple post
$Mutation = @'
mutation {
  createPost(input: {
    channelId: "69d79e06031bfa423ce655c2"
    text: "Test post from Buffer API - hello world! 🚀"
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

Write-Host "=== Creating Test Post on Orange Matrix Instagram ===" -ForegroundColor Cyan
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