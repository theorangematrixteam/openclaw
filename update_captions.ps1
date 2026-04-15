# PowerShell script to update Proofit captions
$sheetId = "1I_kzeojMYeNSTL6Os2NvXTH5ukSVmBx8JUx6nWZyb30"

# Define all captions as an array of objects
$captions = @(
    @{row=3; text="Brokers show the good.`nWe show the truth.`n`n3 hidden issues that could cost you lakhs.`nDon't sign until you know.`n`n#Proofit #PropertyInspection #HomeBuying #RealEstateIndia #HiddenDefects #SmartInvesting"},
    @{row=4; text="Paint bubbles. Damp patches. Musty smell.`nThese aren't minor issues — they're warnings.`n`nSwipe to learn the 5 signs your new flat is hiding problems.`n`n#Proofit #HomeInspection #LeakageDetection #PropertyBuying #RealEstateTips"},
    @{row=5; text="A fresh coat of paint can hide a lot.`nCracks. Dampness. Faulty wiring.`n`nWhat you see isn't what you get.`nGet it inspected first.`n`n#Proofit #PropertyInspection #HomeBuyingTips #RealEstateIndia #SmartBuying"},
    @{row=6; text="Older buildings have stories.`nSome are expensive ones.`n`nEvery layer of paint hides repair history.`nKnow what you're walking into.`n`n#Proofit #HeritageBuildings #PropertyInspection #RealEstateIndia"},
    @{row=7; text="Trusting timelines blindly.`nSkipping technical checks.`nPaying before verification.`nIgnoring damp signs.`n`n4 mistakes that cost homebuyers dearly.`nSave this.`n`n#Proofit #HomeBuying #PossessionDay #RealEstateTips"},
    @{row=8; text="Photos. Defect evidence. Risk ratings.`nRepair priorities. Clarity.`n`nA Proofit report gives you answers,`nnot just a checklist.`n`n#Proofit #PropertyInspection #SnaggingReport #HomeBuying"},
    @{row=9; text="Heat. Humidity. Hidden stress.`nSummer reveals what monsoon will worsen.`n`nBubbling paint. Musty smells. Expanding damp.`nInspect now or repair later.`n`n#Proofit #SummerInspection #PreMonsoon #PropertyCare"},
    @{row=10; text="One damp patch.`nThermal scan.`nHidden pipe leak.`nProblem found.`n`nThis is how real detection works.`nNo guesswork. Just proof.`n`n#Proofit #DampDetection #ThermalInspection #PropertyCare"},
    @{row=11; text="Before you sign:`n`n1. Has there been any seepage?`n2. When was the wiring last checked?`n3. What repairs have been done?`n`nAsk. Then inspect.`n`n#Proofit #ResaleFlat #HomeBuyingTips #PropertyInspection"},
    @{row=12; text="Looks perfect.`nHides a leak.`nCosts you later.`n`nWould you spot the defect before it drains your wallet?`n`n#Proofit #PropertyInspection #HiddenDefects #SmartBuying"},
    @{row=13; text="Dry walls today.`nDry ceilings tomorrow.`n`nSummer is the best time to find weak waterproofing`nbefore monsoon exposes it.`n`n#Proofit #PreMonsoon #Waterproofing #PropertyCare"},
    @{row=14; text="₹5,000 inspection.`nOr ₹2 lakh in repairs?`n`nDetect early. Spend smart.`nHidden water damage doesn't fix itself.`n`n#Proofit #PropertyInspection #CostSavings #HomeMaintenance"},
    @{row=15; text="Wall condition.`nCeiling lines.`nElectrical points.`nDamp zones.`nBathroom risks.`n`nIn 10 minutes, we already know where to look.`n`n#Proofit #InspectionProcess #PropertyCare"},
    @{row=16; text="5 issues that appear before the rains:`n`nSeepage paths.`nTerrace failures.`nBathroom leaks.`nHidden damp.`nElectrical risks.`n`nSave this for monsoon prep.`n`n#Proofit #PreMonsoon #HomeInspection"},
    @{row=17; text="Good workmanship shows up in the finish.`nBad workmanship shows up after handover.`n`nUneven floors. Rushed plumbing. Concealed defects.`nVerify before you accept.`n`n#Proofit #LabourDay #QualityCheck #PropertyInspection"},
    @{row=18; text="Beautiful interiors.`nPolished floors.`nHidden damp behind the paint.`n`nDon't fall for the finish.`nInspect the foundation.`n`n#Proofit #PropertyInspection #HomeBuying #SmartInvesting"},
    @{row=19; text="New home. Same fire risks.`n`nOverloaded circuits.`nPoor wiring connections.`nHidden hotspots.`n`nYou can't see them.`nWe can.`n`n#Proofit #ElectricalSafety #FireSafety #HomeInspection"},
    @{row=20; text="Blind trust is expensive.`nInformed decisions are priceless.`n`nKnow what you're buying.`nKnow what you're fixing.`nKnow what you're avoiding.`n`n#Proofit #PropertyInspection #SmartBuying"},
    @{row=21; text="Paint looks clean.`nWalls feel dry.`nBut dampness hides.`nAnd wiring heats.`n`n3 defects most buyers miss.`nUntil it's too late.`n`n#Proofit #PropertyInspection #HiddenDefects #HomeBuying"},
    @{row=22; text="Dampness. Mould. Musty air.`nYour family breathes what your walls hide.`n`nInspection isn't just about property.`nIt's about health.`n`n#Proofit #WorldAsthmaDay #IndoorAirQuality #HealthyHome"},
    @{row=23; text="A small red flag today.`nA five-figure repair tomorrow.`n`nCracks that spread.`nDampness that rots.`nWiring that sparks.`n`nInspect early. Save money.`n`n#Proofit #HomeInspection #PreventiveCare"},
    @{row=24; text="Walls. Terrace. Bathrooms. Ceilings.`n`nMonsoon will test them all.`nSmart homeowners check first.`n`nBook before the rains arrive.`n`n#Proofit #PreMonsoon #HomeInspection #PropertyCare"},
    @{row=25; text="A damp smell.`nPaint bubbles. Yellow patches.`n`nYour home is already warning you.`nListen before it spreads.`n`n#Proofit #Dampness #PropertyInspection #HomeCare"}
)

foreach ($cap in $captions) {
    $range = "proofit!K$($cap.row)"
    $json = "[[`"$($cap.text -replace '"', '\"' -replace '`n', '\n')`"]]"
    Write-Host "Updating row $($cap.row)..."
    gog sheets update $sheetId $range --values-json $json --input USER_ENTERED --no-input
}

Write-Host "Done!"