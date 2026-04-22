# Schedule all remaining Proofit X posts via Buffer API
# Skips reels, only does posts/carousels that have Drive assets

$Token = $env:BUFFER_API_TOKEN
$ChannelId = "69d77de4031bfa423ce5c359"
$ApiUrl = "https://api.buffer.com"

function Schedule-BufferPost {
    param(
        [string]$Text,
        [string]$DueAt,
        [string[]]$ImageIds
    )
    
    # Share all images publicly
    foreach ($id in $ImageIds) {
        gog drive share $id --to anyone --role reader -y 2>&1 | Out-Null
    }
    
    # Build image array
    $images = @()
    foreach ($id in $ImageIds) {
        $images += "{ url: `"https://drive.google.com/thumbnail?id=$id&sz=w1000`" }"
    }
    $imagesStr = $images -join ",`n        "
    
    # Build mutation - escape quotes and newlines properly
    $escapedText = $Text -replace '"', '\"' -replace "`r`n", "\n" -replace "`n", "\n"
    
    $mutation = "mutation {`n  createPost(input: {`n    channelId: `"$ChannelId`"`n    text: `"$escapedText`"`n    mode: customScheduled`n    schedulingType: automatic`n    dueAt: `"$DueAt`"`n    assets: {`n      images: [`n        $imagesStr`n      ]`n    }`n  }) {`n    ... on PostActionSuccess {`n      post { id text status dueAt }`n    }`n    ... on InvalidInputError { message }`n  }`n}"
    
    $mutationFile = "$env:TEMP\buffer-mutation.graphql"
    [System.IO.File]::WriteAllText($mutationFile, $mutation)
    
    $query = [System.IO.File]::ReadAllText($mutationFile)
    $Headers = @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" }
    $Body = @{ query = $query } | ConvertTo-Json -Depth 10
    
    try {
        $Response = Invoke-RestMethod -Uri $ApiUrl -Method POST -Headers $Headers -Body $Body -TimeoutSec 120
        return $Response
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) { Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red }
        return $null
    }
}

# Apr 27 - carousel (4 slides: 26, 27, 28, 29)
Write-Host "Scheduling Apr 27..."
$result = Schedule-BufferPost `
    -Text "Dry walls today.`nDry ceilings tomorrow.`n`nSummer is the best time to find weak waterproofing before monsoon exposes it.`n`n#Proofit #PreMonsoon #Waterproofing #PropertyCare" `
    -DueAt "2026-04-27T13:30:00Z" `
    -ImageIds @("11VvM1PMiKMj644RfWIm2HX-9BhA9HY-g", "1gI8rO3Wzq1aCNZ-2ks67X_QhQa4v9f2e", "1FIqwlOryNhWRvy5pLJ9iihh_OwFjo_zL", "1GdlUEZBns2JaG5q0nTo08neanWzvYGTY")
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# Apr 30 - carousel (Fear) - folder: 1abJa2EY7Hr8G7hQvm2BaP7p6jSCnJAQC
Write-Host "Scheduling Apr 30..."
# First get the folder contents
$folder30 = gog drive search "'1abJa2EY7Hr8G7hQvm2BaP7p6jSCnJAQC' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files30 = $folder30.files | Sort-Object name
Write-Host "  Files in Apr 30 folder:"
$files30 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids30 = ($files30 | Where-Object { $_.name -ne "proofit.png" } | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "5 issues that appear before the rains:`n`nSeepage paths.`nTerrace failures.`nBathroom leaks.`nHidden damp.`nElectrical risks.`n`nSave this for monsoon prep.`n`n#Proofit #PreMonsoon #HomeInspection" `
    -DueAt "2026-04-30T13:30:00Z" `
    -ImageIds $ids30
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# May 1 - post (Labour Day) - folder: 1CHfBCeWgbxjqLRKdm_0VErSHW9E30LSd
Write-Host "Scheduling May 1..."
$folder51 = gog drive search "'1CHfBCeWgbxjqLRKdm_0VErSHW9E30LSd' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files51 = $folder51.files | Sort-Object name
Write-Host "  Files in May 1 folder:"
$files51 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids51 = ($files51 | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "Good workmanship shows up in the finish.`nBad workmanship shows up after handover.`n`nUneven floors. Rushed plumbing. Concealed defects.`nVerify before you accept.`n`n#Proofit #LabourDay #QualityCheck #PropertyInspection" `
    -DueAt "2026-05-01T13:30:00Z" `
    -ImageIds $ids51
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# May 4 - carousel (Firefighters Day) - folder: 1cRrX5gjyKHTkISTt-_TaoIpSAvFNsMHB
Write-Host "Scheduling May 4..."
$folder54 = gog drive search "'1cRrX5gjyKHTkISTt-_TaoIpSAvFNsMHB' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files54 = $folder54.files | Sort-Object name
Write-Host "  Files in May 4 folder:"
$files54 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids54 = ($files54 | Where-Object { $_.name -ne "proofit.png" } | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "New home. Same fire risks.`n`nOverloaded circuits.`nPoor wiring connections.`nHidden hotspots.`n`nYou can't see them.`nWe can.`n`n#Proofit #ElectricalSafety #FireSafety #HomeInspection" `
    -DueAt "2026-05-04T13:30:00Z" `
    -ImageIds $ids54
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# May 5 - post (Proof) - folder: 1wLfBXYbbS6KvRfK1pFQ9ape2l_JGGiXg
Write-Host "Scheduling May 5..."
$folder55 = gog drive search "'1wLfBXYbbS6KvRfK1pFQ9ape2l_JGGiXg' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files55 = $folder55.files | Sort-Object name
Write-Host "  Files in May 5 folder:"
$files55 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids55 = ($files55 | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "Blind trust is expensive.`nInformed decisions are not.`n`nKnow what you're buying. Know what you're fixing. Know what you're avoiding.`n`nThat is what a proper inspection gives you. Not a checklist. Not a formality. Actual clarity.`n`nReal confidence comes from knowing, not guessing.`n`n#Proofit #PropertyInspection #SmartBuying #HomeInspection" `
    -DueAt "2026-05-05T13:30:00Z" `
    -ImageIds $ids55
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# May 7 - carousel (Asthma Day) - folder: 1c7cPOyyPoiodhyrfk2ZKRlQriFZCvd-7
Write-Host "Scheduling May 7..."
$folder57 = gog drive search "'1c7cPOyyPoiodhyrfk2ZKRlQriFZCvd-7' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files57 = $folder57.files | Sort-Object name
Write-Host "  Files in May 7 folder:"
$files57 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids57 = ($files57 | Where-Object { $_.name -ne "proofit.png" } | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "Your family breathes what your walls hide.`n`nDampness leads to mould. Mould produces spores. Spores circulate through the air inside your home.`n`nOn World Asthma Day, this is worth knowing: property inspection is not just about structural damage. It is about the air quality inside your home.`n`nInspection is not just about property. It is about the people living in it.`n`n#Proofit #WorldAsthmaDay #AirQuality #HomeInspection" `
    -DueAt "2026-05-07T13:30:00Z" `
    -ImageIds $ids57
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# May 8 - post (Red Cross Day) - folder: 17OMGVgiclAKEFZZMjkdyp1wbHv6rV3FR
Write-Host "Scheduling May 8..."
$folder58 = gog drive search "'17OMGVgiclAKEFZZMjkdyp1wbHv6rV3FR' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files58 = $folder58.files | Sort-Object name
Write-Host "  Files in May 8 folder:"
$files58 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids58 = ($files58 | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "A small red flag today. A five-figure repair bill tomorrow.`n`nCracks that spread slowly. Dampness that rots the structure from inside. Wiring that overheats in walls where nobody checks.`n`nThese are not dramatic failures. They are quiet ones. They grow while you aren't looking.`n`nInspect early. Save money.`n`n#Proofit #HomeInspection #PropertyCare #SmartBuying" `
    -DueAt "2026-05-08T13:30:00Z" `
    -ImageIds $ids58
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# May 11 - post (Fear) - no folder named "11 may" exists, check
Write-Host "Scheduling May 11..."
$folder511 = gog drive search "'1jTXT3ZQPN_YGax4m7qk_NsOJmLabZ5yk' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files511 = $folder511.files | Sort-Object name
Write-Host "  Files in May 11 folder:"
$files511 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids511 = ($files511 | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "If your home smells damp, it is already telling you something.`n`nMusty smell. Paint bubbles. Yellow patches that keep coming back after you repaint.`n`nThese are not minor issues. They are warnings.`n`nThe cost of finding out now is a fraction of the cost of repairing later.`n`n#Proofit #HomeInspection #DampDetection #PropertyCare" `
    -DueAt "2026-05-11T13:30:00Z" `
    -ImageIds $ids511
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# May 14 - carousel (Fear) - folder: 1GlGj0uHWahQu0yn7PA92GlMHqnmC1xUQ
Write-Host "Scheduling May 14..."
$folder514 = gog drive search "'1GlGj0uHWahQu0yn7PA92GlMHqnmC1xUQ' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files514 = $folder514.files | Sort-Object name
Write-Host "  Files in May 14 folder:"
$files514 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids514 = ($files514 | Where-Object { $_.name -ne "proofit.png" } | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "5 warning signs your new flat has hidden leakage.`n`nPaint bubbles. Damp patches. Musty smell. Water marks on ceilings. Peeling wallpaper.`n`nTogether they tell a story: water is getting in somewhere and it is not getting out.`n`nThe earlier you catch it, the cheaper it is to fix.`n`n#Proofit #HomeInspection #LeakageDetection #PropertyBuying" `
    -DueAt "2026-05-14T13:30:00Z" `
    -ImageIds $ids514
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Start-Sleep -Seconds 2

# May 15 - post (Education) - folder: 10vmDhNc1VFtsXyzBsfFY5X6I4dVNBN_D
Write-Host "Scheduling May 15..."
$folder515 = gog drive search "'10vmDhNc1VFtsXyzBsfFY5X6I4dVNBN_D' in parents" --max 20 --json 2>&1 | ConvertFrom-Json
$files515 = $folder515.files | Sort-Object name
Write-Host "  Files in May 15 folder:"
$files515 | ForEach-Object { Write-Host "    $($_.name) ($($_.id))" }
$ids515 = ($files515 | Sort-Object name).id

$result = Schedule-BufferPost `
    -Text "A fresh coat of paint can hide a lot.`n`nCracks underneath that were filled instead of fixed. Dampness that was covered rather than resolved. Faulty wiring behind switches that look new and clean.`n`nWhat you see is what the seller wants you to see. What you can't see is what you're actually paying for.`n`nGet it inspected before you commit.`n`n#Proofit #PropertyInspection #HomeBuyingTips #RealEstateIndia" `
    -DueAt "2026-05-15T13:30:00Z" `
    -ImageIds $ids515
if ($result) { Write-Host "  OK: $($result.data.createPost.post.id)" }

Write-Host "`nAll done!"