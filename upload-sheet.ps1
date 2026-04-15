$csv = Import-Csv "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\orange-matrix-plan.csv"

# Build JSON array manually
$json = "["
$first = $true

foreach ($row in $csv) {
    if (-not $first) { $json += "," }
    $first = $false

    $json += @"
[$(ConvertTo-Json $row.Date),$(ConvertTo-Json $row.Day),$(ConvertTo-Json $row.'Special day'),$(ConvertTo-Json $row.'Content Type'),$(ConvertTo-Json $row.Bucket),$(ConvertTo-Json $row.Status),$(ConvertTo-Json $row.'Topic / Hook'),$(ConvertTo-Json $row.Reference),$(ConvertTo-Json $row.'Concept / Objectives'),$(ConvertTo-Json $row.CTA),$(ConvertTo-Json $row.Platform)]
"@
}

$json += "]"

# Write to temp file and use it
$json | Out-File -FilePath "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp-data.json" -Encoding utf8

# Now upload
gog sheets update "1aCPqWjfgWqCY24zhnwchKzq1HfIOIK0yEgSmbOmTJu4" "Sheet1!A1:K25" --values-json (Get-Content -Raw "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp-data.json") --input USER_ENTERED