# Buffer API - Schedule Post
param(
    [Parameter(Mandatory=$true)]
    [string]$ChannelId,
    
    [Parameter(Mandatory=$true)]
    [string]$Text,
    
    [string]$ScheduledAt  # ISO 8601 format: 2024-01-15T10:00:00Z
)

$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Build the mutation
$Mutation = @"
mutation CreatePost {
  createPost(input: {
    channelId: "$ChannelId"
    text: "$Text"
    $(if ($ScheduledAt) { "dueAt: `"$ScheduledAt`"" })
    mode: $(if ($ScheduledAt) { "customScheduled" } else { "addToQueue" })
    schedulingType: automatic
  }) {
    ... on PostActionSuccess {
      post {
        id
        text
        status
        dueAt
        channelService
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
"@

$Body = @{ query = $Mutation } | ConvertTo-Json -Depth 10

Write-Host "=== Creating Buffer Post ===" -ForegroundColor Cyan
Write-Host "Channel: $ChannelId"
Write-Host "Text: $Text"
if ($ScheduledAt) { Write-Host "Scheduled: $ScheduledAt" }
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    $Response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}