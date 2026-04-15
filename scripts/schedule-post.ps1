# Buffer - Schedule Post
# Usage: .\schedule-post.ps1 -ChannelId "xxx" -Text "Post text" -Time "2026-04-10T10:00:00Z" [-ImageUrl "url"]

param(
    [Parameter(Mandatory=$true)]
    [string]$ChannelId,
    
    [Parameter(Mandatory=$true)]
    [string]$Text,
    
    [Parameter(Mandatory=$true)]
    [string]$Time,  # ISO 8601 format
    
    [string]$ImageUrl,
    
    [ValidateSet("post", "story", "reel")]
    [string]$Type = "post"
)

# Call create-post with scheduled time
& "$PSScriptRoot\create-post.ps1" -ChannelId $ChannelId -Text $Text -ScheduledAt $Time -ImageUrl $ImageUrl -Type $Type