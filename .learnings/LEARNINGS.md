# LEARNINGS

## Buffer + Drive Image Scheduling (2026-04-22)

**Mistake:** Downloaded images from Drive, then re-uploaded them back to the same folder, creating duplicates.

**Lesson:** When scheduling Buffer posts with images from Drive:
1. Do NOT download and re-upload. Use the original Drive file IDs directly.
2. Make the original files publicly accessible (`gog drive share <id> --to anyone --role reader`)
3. Use Google Drive thumbnail URLs for Buffer: `https://drive.google.com/thumbnail?id=<FILE_ID>&sz=w1000`
4. If files aren't already public, share them — don't duplicate them.

**Buffer Free Tier Limit:**
- Max 10 posts total per channel (scheduled + sent)
- Only 8 scheduled slots available if 2 are already sent
- Posts beyond the limit are **silently rejected** — no error, just empty response
- Fix: wait for slots to open as posts get sent, or upgrade plan

**Correct workflow:**
1. Find the date folder in Drive
2. List files and get their IDs
3. Share files publicly if not already
4. Use thumbnail URLs in Buffer GraphQL mutation
5. Never download-then-re-upload

## Buffer GraphQL API (2026-04-22)

- Use `\n` for newlines in text field, NOT PowerShell backtick-n
- Write mutation to a .graphql file, then read with `[System.IO.File]::ReadAllText()` to avoid PowerShell quoting issues
- `InvalidInputError` fragment does NOT have `fields` — only `message`
- `deletePost` uses `input: { id: "..." }` not `postId`
- Twitter/X supports up to 4 images in `assets.images` array
- Google Drive `lh3.googleusercontent.com/d/<ID>` URLs sometimes timeout — use `drive.google.com/thumbnail?id=<ID>&sz=w1000` instead
- `mode: customScheduled` + `dueAt` for specific time scheduling
- 7 PM IST = 13:30 UTC