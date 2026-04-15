const { execSync } = require('child_process');
const fs = require('fs');

const sheetId = "1I_kzeojMYeNSTL6Os2NvXTH5ukSVmBx8JUx6nWZyb30";

const captions = [
  {row: 3, text: `Brokers show the good.
We show the truth.

3 hidden issues that could cost you lakhs.
Don't sign until you know.

#Proofit #PropertyInspection #HomeBuying #RealEstateIndia #HiddenDefects #SmartInvesting`},
  {row: 4, text: `Paint bubbles. Damp patches. Musty smell.
These aren't minor issues — they're warnings.

Swipe to learn the 5 signs your new flat is hiding problems.

#Proofit #HomeInspection #LeakageDetection #PropertyBuying #RealEstateTips`},
  {row: 5, text: `A fresh coat of paint can hide a lot.
Cracks. Dampness. Faulty wiring.

What you see isn't what you get.
Get it inspected first.

#Proofit #PropertyInspection #HomeBuyingTips #RealEstateIndia #SmartBuying`},
  {row: 6, text: `Older buildings have stories.
Some are expensive ones.

Every layer of paint hides repair history.
Know what you're walking into.

#Proofit #HeritageBuildings #PropertyInspection #RealEstateIndia`},
  {row: 7, text: `Trusting timelines blindly.
Skipping technical checks.
Paying before verification.
Ignoring damp signs.

4 mistakes that cost homebuyers dearly.
Save this.

#Proofit #HomeBuying #PossessionDay #RealEstateTips`},
  {row: 8, text: `Photos. Defect evidence. Risk ratings.
Repair priorities. Clarity.

A Proofit report gives you answers,
not just a checklist.

#Proofit #PropertyInspection #SnaggingReport #HomeBuying`},
  {row: 9, text: `Heat. Humidity. Hidden stress.
Summer reveals what monsoon will worsen.

Bubbling paint. Musty smells. Expanding damp.
Inspect now or repair later.

#Proofit #SummerInspection #PreMonsoon #PropertyCare`},
  {row: 10, text: `One damp patch.
Thermal scan.
Hidden pipe leak.
Problem found.

This is how real detection works.
No guesswork. Just proof.

#Proofit #DampDetection #ThermalInspection #PropertyCare`},
  {row: 11, text: `Before you sign:

1. Has there been any seepage?
2. When was the wiring last checked?
3. What repairs have been done?

Ask. Then inspect.

#Proofit #ResaleFlat #HomeBuyingTips #PropertyInspection`},
  {row: 12, text: `Looks perfect.
Hides a leak.
Costs you later.

Would you spot the defect before it drains your wallet?

#Proofit #PropertyInspection #HiddenDefects #SmartBuying`},
  {row: 13, text: `Dry walls today.
Dry ceilings tomorrow.

Summer is the best time to find weak waterproofing
before monsoon exposes it.

#Proofit #PreMonsoon #Waterproofing #PropertyCare`},
  {row: 14, text: `₹5,000 inspection.
Or ₹2 lakh in repairs?

Detect early. Spend smart.
Hidden water damage doesn't fix itself.

#Proofit #PropertyInspection #CostSavings #HomeMaintenance`},
  {row: 15, text: `Wall condition.
Ceiling lines.
Electrical points.
Damp zones.
Bathroom risks.

In 10 minutes, we already know where to look.

#Proofit #InspectionProcess #PropertyCare`},
  {row: 16, text: `5 issues that appear before the rains:

Seepage paths.
Terrace failures.
Bathroom leaks.
Hidden damp.
Electrical risks.

Save this for monsoon prep.

#Proofit #PreMonsoon #HomeInspection`},
  {row: 17, text: `Good workmanship shows up in the finish.
Bad workmanship shows up after handover.

Uneven floors. Rushed plumbing. Concealed defects.
Verify before you accept.

#Proofit #LabourDay #QualityCheck #PropertyInspection`},
  {row: 18, text: `Beautiful interiors.
Polished floors.
Hidden damp behind the paint.

Don't fall for the finish.
Inspect the foundation.

#Proofit #PropertyInspection #HomeBuying #SmartInvesting`},
  {row: 19, text: `New home. Same fire risks.

Overloaded circuits.
Poor wiring connections.
Hidden hotspots.

You can't see them.
We can.

#Proofit #ElectricalSafety #FireSafety #HomeInspection`},
  {row: 20, text: `Blind trust is expensive.
Informed decisions are priceless.

Know what you're buying.
Know what you're fixing.
Know what you're avoiding.

#Proofit #PropertyInspection #SmartBuying`},
  {row: 21, text: `Paint looks clean.
Walls feel dry.
But dampness hides.
And wiring heats.

3 defects most buyers miss.
Until it's too late.

#Proofit #PropertyInspection #HiddenDefects #HomeBuying`},
  {row: 22, text: `Dampness. Mould. Musty air.
Your family breathes what your walls hide.

Inspection isn't just about property.
It's about health.

#Proofit #WorldAsthmaDay #IndoorAirQuality #HealthyHome`},
  {row: 23, text: `A small red flag today.
A five-figure repair tomorrow.

Cracks that spread.
Dampness that rots.
Wiring that sparks.

Inspect early. Save money.

#Proofit #HomeInspection #PreventiveCare`},
  {row: 24, text: `Walls. Terrace. Bathrooms. Ceilings.

Monsoon will test them all.
Smart homeowners check first.

Book before the rains arrive.

#Proofit #PreMonsoon #HomeInspection #PropertyCare`},
  {row: 25, text: `A damp smell.
Paint bubbles. Yellow patches.

Your home is already warning you.
Listen before it spreads.

#Proofit #Dampness #PropertyInspection #HomeCare`}
];

for (const cap of captions) {
  const range = `proofit!K${cap.row}`;
  const values = [[cap.text]];
  const jsonStr = JSON.stringify(values);
  fs.writeFileSync('temp_values.json', jsonStr);
  
  console.log(`Updating row ${cap.row}...`);
  const cmd = `gog sheets update ${sheetId} "${range}" --values-json "$(cat temp_values.json)" --input USER_ENTERED --no-input`;
  
  try {
    execSync(cmd, { shell: 'bash', stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed on row ${cap.row}`);
  }
}

console.log('Done!');