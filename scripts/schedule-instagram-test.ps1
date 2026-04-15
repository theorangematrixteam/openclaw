$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Orange Matrix Instagram channel
$ChannelId = "69d79e06031bfa423ce655c2"

# Caption
$Caption = "Your workspace says a lot about your brand.`n`nWe help brands look as good as their work. From social presence to visual identity, we craft every touchpoint.`n`nReady to level up? Let's talk.`n`n#OrangeMatrix #BrandAgency #CreativeStudio #WorkspaceGoals #BrandIdentity #AgencyLife"

# Schedule for 7 PM IST today
$ScheduledAt = "2026-04-09T13:30:00Z"

# Public Google Drive image URL
$ImageUrl = "https://drive.google.com/uc?export=download&id=1-38zEpyn70uHjPbTCawTqWC4Vq4zfzls"

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

Write-Host "=== Scheduling Instagram Post for Orange Matrix ===" -ForegroundColor Cyan
Write-Host "Channel: theorangematrix (Instagram)"
Write-Host "Scheduled: 7:00 PM IST"
Write-Host "Image URL: $ImageUrl"
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    if ($Response.data.createPost.post) {
        Write-Host "`n✅ Post scheduled successfully!" -ForegroundColor Green
        Write-Host "Post ID: $($Response.data.createPost.post.id)"
        Write-Host "Status: $($Response.data.createPost.post.status)"
        Write-Host "Scheduled: $($Response.data.createPost.post.dueAt)"
    } else {
        Write-Host "`n❌ Error: $($Response.data.createPost.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}