param(
    [Parameter(Mandatory=$true)]
    [string]$ImageUrl
)

$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# theorangematrix Instagram channel - VERIFIED
$ChannelId = "69d79e06031bfa423ce655c2"

# Caption for workspace image
$Caption = "Your workspace says a lot about your brand.`n`nWe help brands look as good as their work. From social presence to visual identity, we craft every touchpoint.`n`nReady to level up? Let's talk.`n`n#OrangeMatrix #BrandAgency #CreativeStudio #WorkspaceGoals #BrandIdentity #AgencyLife"

# Schedule for 7 PM IST today (2026-04-09)
$ScheduledAt = "2026-04-09T13:30:00Z"

$Mutation = @"
mutation {
  createPost(input: {
    channelId: "$ChannelId"
    text: "$($Caption -replace '"', '\"' -replace "`n", "\\n")"
    assets: {
      images: [{ url: "$ImageUrl" }]
    }
    metadata: {
      instagram: { 
        type: post
        shouldShareToFeed: true
      }
    }
    mode: customScheduled
    schedulingType: automatic
    dueAt: "$ScheduledAt"
  }) {
    ... on PostActionSuccess {
      post {
        id
        text
        status
        dueAt
        channelService
        channelId
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

Write-Host "=== Scheduling Instagram Post ===" -ForegroundColor Cyan
Write-Host "Account: theorangematrix (Instagram)" -ForegroundColor Green
Write-Host "Channel ID: $ChannelId" -ForegroundColor Gray
Write-Host "Scheduled: 7:00 PM IST (13:30 UTC)"
Write-Host "Image: $ImageUrl"
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    if ($Response.data.createPost.post) {
        $post = $Response.data.createPost.post
        Write-Host "✅ Post scheduled successfully!" -ForegroundColor Green
        Write-Host "Post ID: $($post.id)"
        Write-Host "Channel: $($post.channelService) - $($post.channelId)"
        Write-Host "Status: $($post.status)"
        Write-Host "Scheduled: $($post.dueAt)"
        
        # Verify it's the correct channel
        if ($post.channelId -ne $ChannelId) {
            Write-Host "`n⚠️ WARNING: Channel ID mismatch!" -ForegroundColor Red
            Write-Host "Expected: $ChannelId" -ForegroundColor Yellow
            Write-Host "Got: $($post.channelId)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Error: $($Response.data.createPost.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}