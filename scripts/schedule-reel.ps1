$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# theorangematrix Instagram channel
$ChannelId = "69d79e06031bfa423ce655c2"

# Schedule for 7 PM IST today (2026-04-10)
$ScheduledAt = "2026-04-10T13:30:00Z"

# Video URL already uploaded
$VideoUrl = "https://litter.catbox.moe/uzpged.mp4"

Write-Host "Video URL: $VideoUrl" -ForegroundColor Green

# Caption
$CaptionText = "Step inside a piece of history.\n\nThis stunning heritage property showcases everything we look for during a Proofit inspection - grand architecture, intricate detailing, and spaces that tell a story.\n\nFrom the soaring arches to the ornate doorways, every corner speaks of craftsmanship that is rare to find today.\n\nSwipe through to see why heritage properties need specialized inspection - and how Proofit ensures your investment is protected.\n\n#Proofit #HeritageProperty #PropertyInspection #RealEstate #Architecture #HistoricBuildings #HomeInspection"

$Mutation = @"
mutation {
  createPost(input: {
    channelId: "$ChannelId"
    text: "$CaptionText"
    assets: {
      videos: [{ url: "$VideoUrl" }]
    }
    metadata: {
      instagram: { 
        type: reel
        shouldShareToFeed: false
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

Write-Host "`nScheduling Instagram Reel..." -ForegroundColor Cyan
Write-Host "Account: theorangematrix (Instagram)" -ForegroundColor Green
Write-Host "Scheduled: 7:00 PM IST"
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    if ($Response.data.createPost.post) {
        $post = $Response.data.createPost.post
        Write-Host "SUCCESS Reel scheduled!" -ForegroundColor Green
        Write-Host "Post ID: $($post.id)"
        Write-Host "Channel: $($post.channelService) - $($post.channelId)"
        Write-Host "Status: $($post.status)"
        Write-Host "Scheduled: $($post.dueAt)"
    } else {
        Write-Host "FAILED Error: $($Response.data.createPost.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}