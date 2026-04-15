# Buffer - Create Post
# Usage: .\create-post.ps1 -ChannelId "xxx" -Text "Post text" [-ImageUrl "url"] [-Type "post/story/reel"]

param(
    [Parameter(Mandatory=$true)]
    [string]$ChannelId,
    
    [Parameter(Mandatory=$true)]
    [string]$Text,
    
    [string]$ImageUrl,
    
    [ValidateSet("post", "story", "reel")]
    [string]$Type = "post",
    
    [string]$ScheduledAt  # ISO 8601: 2026-04-10T10:00:00Z
)

$Token = $env:BUFFER_API_TOKEN
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Build mutation based on parameters
$AssetsJson = ""
$MetadataJson = ""

if ($ImageUrl) {
    $AssetsJson = "assets: { images: [{ url: `"$ImageUrl`" }] },"
}

# For Instagram, we need to specify type
if ($Type -and $Type -ne "post") {
    $MetadataJson = "metadata: { instagram: { type: `"$Type`" } },"
}

$Mode = if ($ScheduledAt) { "customScheduled" } else { "addToQueue" }
$DueAtJson = if ($ScheduledAt) { "dueAt: `"$ScheduledAt`"," } else { "" }

$Mutation = @"
mutation CreatePost {
  createPost(input: {
    channelId: "$ChannelId"
    text: "$Text"
    $AssetsJson
    $MetadataJson
    $DueAtJson
    mode: $Mode
    schedulingType: automatic
  }) {
    ... on PostActionSuccess {
      post {
        id
        text
        status
        dueAt
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
"@

$Body = @{ query = $Mutation } | ConvertTo-Json -Depth 10

Write-Host "=== Creating Buffer Post ===" -ForegroundColor Cyan
Write-Host "Channel: $ChannelId"
Write-Host "Text: $Text"
if ($ImageUrl) { Write-Host "Image: $ImageUrl" }
if ($Type -ne "post") { Write-Host "Type: $Type" }
if ($ScheduledAt) { Write-Host "Scheduled: $ScheduledAt" }
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
    
    if ($Response.data.createPost.post) {
        Write-Host "✅ Post created successfully!" -ForegroundColor Green
        $Response.data.createPost.post | ConvertTo-Json -Depth 10
    } else {
        Write-Host "❌ Error: $($Response.data.createPost.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}