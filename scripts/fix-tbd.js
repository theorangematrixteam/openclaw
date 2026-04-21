const { execFileSync } = require('child_process');

const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Issue 1: Status column duplication - rows 2-6 have both "Not Contacted" AND "New"
// The "Not Contacted" was in column P (Status), I wrote "New" there too but it seems
// to have created an extra column. Let me check: the old data had column P = "Not Contacted"
// and column Q = Last Contacted (empty). When I wrote "New" to P, it may have shifted.
// Actually looking at the output, row 2 has: P="Not Contacted", Q="New" 
// This means I wrote to the WRONG column. Let me fix.

// Wait - looking again at the raw output for row 2:
// P = "Not Contacted" (old value), then there's "New" which appears as an extra value
// Actually the columns are: ...Priority(N), Status(O), LastContacted(P), NextStep(Q)...
// No - let me recount from the header:
// A=Category, B=Company, C=Industry, D=FirstName, E=LastName, F=Title,
// G=Email, H=Phone, I=LinkedIn, J=Instagram, K=Website, L=Funding,
// M=WhyNeedUs, N=Priority, O=Status, P=LastContacted, Q=NextStep, R=Notes, S=Source

// So O=Status. I wrote "New" to column P (LastContacted) by mistake!
// That's why "Not Contacted" is still in O and "New" ended up in P.

// Fix: Write "New" to column O for rows 2-6, and clear P back to empty
const fixes = [];

// Rows 2-6: Fix Status (O) and clear Last Contacted (P) 
for (let row = 2; row <= 6; row++) {
  fixes.push({ row, col: 'O', value: 'New' }); // Status
  fixes.push({ row, col: 'P', value: '' }); // Last Contacted (clear the "New" that leaked here)
}

// Issue 2: TBD fields that need explanations instead of bare "TBD"
// Row 7 Aarnora: Email=TBD, Phone=TBD, LinkedIn has "TBD - ...", Website has "TBD - ..."
fixes.push({ row: 7, col: 'G', value: 'TBD - Brand just launched showroom, no website/email yet; DM @aarnorajewels on Instagram' });
fixes.push({ row: 7, col: 'H', value: 'TBD - Showroom on Sarojini Devi Rd, Secunderabad; call SGBL Group' });
fixes.push({ row: 7, col: 'I', value: 'https://in.linkedin.com/company/sgblgroup (parent company)' });
fixes.push({ row: 7, col: 'K', value: 'TBD - No website live yet; IG is primary presence' });

// Row 8 Pranikas: LinkedIn has "TBD - no LinkedIn found"
fixes.push({ row: 8, col: 'I', value: 'TBD - No public LinkedIn page found for founder or brand' });

// Row 10 Dandelion: Multiple TBD fields
fixes.push({ row: 10, col: 'G', value: 'TBD - No email found; Instagram-only brand, DM @dandelionjewels' });
fixes.push({ row: 10, col: 'H', value: 'TBD - No phone found anywhere' });
fixes.push({ row: 10, col: 'I', value: 'TBD - No LinkedIn presence' });
fixes.push({ row: 10, col: 'K', value: 'TBD - dandelionjewels.com Shopify store is down/inactive' });
fixes.push({ row: 10, col: 'L', value: 'TBD - No funding info found; no public company registration' });

// Row 11 Silvooshine: LinkedIn has "TBD - no LinkedIn found"
fixes.push({ row: 11, col: 'I', value: 'TBD - No LinkedIn presence found for brand or founder' });

// Row 13 Lussora: LinkedIn has "TBD - no LinkedIn found"
fixes.push({ row: 13, col: 'I', value: 'TBD - No LinkedIn presence found' });

// Row 14 Sunheri Flame: LinkedIn has "TBD - no LinkedIn found"
fixes.push({ row: 14, col: 'I', value: 'TBD - No LinkedIn presence found' });

// Row 15 Gharana Karigari: LinkedIn has "TBD - no LinkedIn found"
fixes.push({ row: 15, col: 'I', value: 'TBD - No LinkedIn presence found' });

// Row 16 Corall: Multiple TBD fields
fixes.push({ row: 16, col: 'G', value: 'TBD - Contact form only on website, no direct email' });
fixes.push({ row: 16, col: 'H', value: 'TBD - No phone found on website' });
fixes.push({ row: 16, col: 'I', value: 'Registered as Corallista Lifestyle Pvt Ltd (CIN: U74999MH2022PTC387083)' });

// Also fix empty Phone fields for rows 2,4,5 (batch 1 had empty phone)
fixes.push({ row: 2, col: 'H', value: 'TBD - Sisters keep contact private; email or DM only' });
fixes.push({ row: 4, col: 'H', value: 'TBD - No phone found; email or DM only' });
fixes.push({ row: 5, col: 'H', value: 'TBD - No phone found; email or DM only' });
fixes.push({ row: 6, col: 'H', value: 'TBD - No phone found; email or DM only' });

// Also fix empty LinkedIn for batch 1 rows
fixes.push({ row: 2, col: 'I', value: 'TBD - Sisters keep identities private; no public LinkedIn' });
fixes.push({ row: 4, col: 'I', value: 'TBD - No LinkedIn found for brand or founder' });
fixes.push({ row: 5, col: 'I', value: 'TBD - No LinkedIn found for brand or founder' });

for (const fix of fixes) {
  const range = `Outbound!${fix.col}${fix.row}`;
  try {
    const result = execFileSync(gog, [
      'sheets', 'update', sheetId, range,
      '--values-json', JSON.stringify([[fix.value]]),
      '--input', 'USER_ENTERED',
      '--no-input'
    ], { encoding: 'utf8' });
    console.log(`✅ ${range}: done`);
  } catch(e) {
    console.log(`❌ ${range}: ERROR - ${e.message.substring(0, 100)}`);
  }
}

console.log('\nAll TBD fields fixed!');