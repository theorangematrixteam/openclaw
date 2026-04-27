# OpenClaw Reinstall — Step by Step

## Before you start

- Backup is at: `Desktop\openclaw-backup-2026-04-27`
- This guide is at: `Desktop\REINSTALL-GUIDE.md`
- Read each step before pasting

---

## Step 1: Verify backup exists

```powershell
Test-Path "C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-backup-2026-04-27"
```

Should return `True`. If `False`, stop here.

---

## Step 2: Stop OpenClaw

```powershell
openclaw gateway stop
```

Wait 3 seconds.

---

## Step 3: Save your config

```powershell
New-Item -ItemType Directory -Path "C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-backup-configs" -Force
Copy-Item "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\openclaw.json" "C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-backup-configs\" -Force
```

---

## Step 4: Uninstall OpenClaw

```powershell
npm uninstall -g openclaw
```

Wait for completion.

---

## Step 5: Clear npm cache

```powershell
npm cache clean --force
```

---

## Step 6: Reinstall OpenClaw

```powershell
npm install -g openclaw@latest
```

Wait 1-2 minutes.

---

## Step 7: Start briefly to create fresh config

```powershell
openclaw gateway start
```

Wait 5 seconds, then:

```powershell
openclaw gateway stop
```

Wait 2 seconds.

---

## Step 8: Restore your config

```powershell
Copy-Item "C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-backup-configs\openclaw.json" "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\" -Force
```

---

## Step 9: Restore workspace files

```powershell
$backupDir = "C:\Users\openclaw.BILLION-DOLLAR-\Desktop\openclaw-backup-2026-04-27"
$workspaceDest = "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace"
$files = Get-ChildItem -Path $backupDir -File -Recurse
$count = 0
foreach ($file in $files) {
    $relPath = $file.FullName.Substring($backupDir.Length + 1)
    $destPath = Join-Path $workspaceDest $relPath
    $destDir = Split-Path -Parent $destPath
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $file.FullName $destPath -Force
    $count++
}
Write-Host "Restored $count files"
```

---

## Step 10: Start OpenClaw

```powershell
openclaw gateway start
```

---

## After reconnect

Ask me to view an image.

If images still fail, run this and restart:

```powershell
npm install --os=win32 --cpu=x64 sharp -g
openclaw gateway stop
openclaw gateway start
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm not found` | Add Node to PATH: `$env:Path += ";C:\Program Files\nodejs"` |
| `permission denied` | Run PowerShell as Administrator |
| `openclaw command not found` | Run `npx openclaw gateway start` instead |
| Gateway won't start | Check `openclaw gateway status` for errors |

---

Generated: 2026-04-27 17:51 IST
