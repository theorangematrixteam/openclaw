---
name: buffer
version: 1.0.0
description: Schedule and manage social media posts via Buffer API. Create posts for Instagram, Twitter, LinkedIn, Facebook, Pinterest, and more.
---

# Buffer Skill

Schedule posts to social media via Buffer's GraphQL API. Much more reliable than browser automation.

## When to Use

- "Schedule an Instagram post for [client]"
- "Post to Twitter/X"
- "Create a draft post"
- "List scheduled posts"
- "What's scheduled this week?"

## Prerequisites

- Buffer API token stored in TOOLS.md under `### Buffer (Social Media Scheduler)`
- Connected channels in Buffer account

## API Details

- **Endpoint:** `https://api.buffer.com`
- **Auth:** Bearer token in Authorization header
- **Format:** GraphQL

## Channels

Use `list-channels` to get current channels. As of last update:

| Service | Name | Channel ID |
|---------|------|------------|
| Instagram | proofitcompany | `69d77da0031bfa423ce5c25d` |
| Twitter | proofitcompany | `69d77de4031bfa423ce5c359` |
| Instagram | theorangematrix | `69d79e06031bfa423ce655c2` |

## Scripts

### list-channels.ps1

List all connected channels.

```powershell
.\scripts\buffer-api.ps1 -Query "query { account { organizations { channels { id name service } } } }"
```

### create-post.ps1

Create a post (text-only for Twitter, requires image for Instagram).

```powershell
# Twitter post
.\scripts\create-post.ps1 -ChannelId "69d77de4031bfa423ce5c359" -Text "Hello world! #testing"

# Instagram post (requires image)
.\scripts\create-post.ps1 -ChannelId "69d79e06031bfa423ce655c2" -Text "Caption here" -ImageUrl "https://example.com/image.jpg"
```

### schedule-post.ps1

Schedule a post for a specific time.

```powershell
.\scripts\schedule-post.ps1 -ChannelId "69d77de4031bfa423ce5c359" -Text "Scheduled post" -ScheduledAt "2026-04-10T10:00:00Z"
```

## Usage Examples

### List Channels

```powershell
$Token = "YOUR_TOKEN"
$Headers = @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" }
$Body = '{ "query": "query { account { organizations { channels { id name service } } } }" }'
Invoke-RestMethod -Uri "https://api.buffer.com" -Method POST -Headers $Headers -Body $Body
```

### Create Twitter Post

```powershell
$Mutation = 'mutation {
  createPost(input: {
    channelId: "CHANNEL_ID"
    text: "Your tweet here #hashtag"
    mode: addToQueue
    schedulingType: automatic
  }) {
    ... on PostActionSuccess {
      post { id text status }
    }
    ... on InvalidInputError { message }
  }
}'
```

### Create Instagram Post (with image)

```powershell
$Mutation = 'mutation {
  createPost(input: {
    channelId: "INSTAGRAM_CHANNEL_ID"
    text: "Your caption here"
    mode: addToQueue
    schedulingType: automatic
    assets: {
      images: [{ url: "https://example.com/image.jpg" }]
    }
    metadata: {
      instagram: { type: "post" }
    }
  }) {
    ... on PostActionSuccess {
      post { id text status }
    }
    ... on InvalidInputError { message }
  }
}'
```

### Schedule Post for Specific Time

```powershell
$Mutation = 'mutation {
  createPost(input: {
    channelId: "CHANNEL_ID"
    text: "Scheduled post"
    mode: customScheduled
    schedulingType: automatic
    dueAt: "2026-04-10T10:00:00Z"
  }) {
    ... on PostActionSuccess {
      post { id text status dueAt }
    }
  }
}'
```

### List Scheduled Posts

```powershell
$Query = 'query {
  posts(input: { organizationId: "ORG_ID" filter: { status: ["scheduled"] } }) {
    edges {
      node { id text status dueAt channelService }
    }
  }
}'
```

## Post Types by Service

| Service | Supported Types |
|---------|-----------------|
| Instagram | `post`, `story`, `reel` |
| Twitter | `post` (thread supported) |
| LinkedIn | `post` |
| Facebook | `post`, `story`, `reel` |
| Pinterest | `pin` (requires board) |
| TikTok | `post` |
| YouTube | `video` |

## Rate Limits

Buffer API has standard rate limits. For bulk scheduling:
- Space requests by ~1 second
- Max 100 posts per day per channel (check your plan)

## Error Handling

Common errors:
- `InvalidInputError` - Missing required fields (image for Instagram, board for Pinterest)
- `UnauthorizedError` - Invalid/expired token
- `LimitReachedError` - Posting limit reached

## Files

- `skills/buffer/SKILL.md` - This file
- `scripts/buffer-api.ps1` - Generic API helper
- `scripts/buffer-create-test.ps1` - Test post creation
- `scripts/buffer-twitter-test.ps1` - Twitter-specific test

## Notes

- Instagram requires at least one image/video
- Instagram requires specifying `type` (post/story/reel)
- Twitter doesn't require images
- Emoji encoding may need special handling
- Use `schedulingType: automatic` for direct publishing
- Use `schedulingType: notification` for reminder-based publishing (Instagram/TikTok)