# Upload 3 images and schedule as Instagram carousel
$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# theorangematrix Instagram channel
$ChannelId = "69d79e06031bfa423ce655c2"

# Schedule for 7 PM IST today
$ScheduledAt = "2026-04-09T13:30:00Z"

# Upload images to litterbox
Write-Host "Uploading images..." -ForegroundColor Cyan

$ImageUrls = @()
$Images = @("carousel-1.png", "carousel-2.png", "carousel-3.png")

foreach ($Img in $Images) {
    $ImagePath = "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\$Img"
    Write-Host "  Uploading $Img..." -ForegroundColor Gray
    
    $Result = & curl.exe -s -X POST -F "reqtype=fileupload" -F "time=24h" -F "fileToUpload=@$ImagePath" https://litterbox.catbox.moe/resources/internals/api.php
    
    if ($Result -match "^https://") {
        $Url = $Result.Trim()
        $ImageUrls += $Url
        Write-Host "    OK $Url" -ForegroundColor Green
    } else {
        Write-Host "    FAILED Upload failed for $Img" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nAll images uploaded. Creating carousel post..." -ForegroundColor Cyan

# Build images JSON for carousel (3 images)
$ImagesJson = "{ url: `"$($ImageUrls[0])`" }, { url: `"$($ImageUrls[1])`" }, { url: `"$($ImageUrls[2])`" }"

# Caption - escaped properly
$CaptionText = "Every scroll-stopping post starts with understanding the brand.\n\nWhen we take on a new client, we do not just create content - we craft their visual identity from the ground up.\n\nThis carousel? We designed it to showcase how a cohesive feed tells a story. Swipe through to see how we build brand narratives that convert.\n\nWant us to do this for your brand? Lets talk.\n\n#OrangeMatrix #BrandStrategy #ContentCreation #SocialMediaAgency #VisualIdentity #CarouselDesign"

$Mutation = @"
mutation {
  createPost(input: {
    channelId: "$ChannelId"
    text: "$CaptionText"
    assets: {
      images: [$ImagesJson]
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

Write-Host ""
Write-Host "=== Scheduling Instagram Carousel ===" -ForegroundColor Cyan
Write-Host "Account: theorangematrix (Instagram)" -ForegroundColor Green
Write-Host "Images: $($ImageUrls.Count) slides"
Write-Host "Scheduled: 7:00 PM IST"
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    if ($Response.data.createPost.post) {
        $post = $Response.data.createPost.post
        Write-Host "SUCCESS Carousel scheduled!" -ForegroundColor Green
        Write-Host "Post ID: $($post.id)"
        Write-Host "Channel: $($post.channelService) - $($post.channelId)"
        Write-Host "Status: $($post.status)"
        Write-Host "Scheduled: $($post.dueAt)"
        
        if ($post.channelId -ne $ChannelId) {
            Write-Host "`nWARNING Channel ID mismatch!" -ForegroundColor Red
        }
    } else {
        Write-Host "FAILED Error: $($Response.data.createPost.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}