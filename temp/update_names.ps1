$env:GOG_ACCOUNT = "theorangematrixteam@gmail.com"
$json = Get-Content "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp\totsburg_names.json" -Raw
gog sheets update "1ginVAfw7Fw7zRBJlP_vt9sK-7KFAbvBgy6BdXOSyzHc" "Sheet1!A5:A76" --values-json=$json --input=USER_ENTERED 2>&1