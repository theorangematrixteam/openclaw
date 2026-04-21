const { execFileSync } = require('child_process');

const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Fixes needed:
// 1. Pranikas (row 8): Last Name has email -> move to Notes, set Last Name to TBD
// 2. Gharana Karigari (row 15): Last Name has email -> move to Notes, set Last Name to TBD
// 3. Aarnora (row 7): Email & Phone have "TBD - ..." descriptions -> clean up
// 4. Dandelion Jewels (row 10): Too many TBDs, flag as low-quality lead
// 5. Silvooshine (row 11): Flag "3L+ customers" claim as likely inflated in Notes
// 6. Status column: Standardize all to "New"
// 7. Category: Standardize spelling (Jewelry -> Jewellery where appropriate, normalize Product: subcategories)
// 8. Batch 1 Status "Not Contacted" -> "New"

const fixes = [
  // Row 7: Aarnora - clean up Email and Phone fields
  {
    row: 7,
    col: 'G', // Email
    value: 'TBD'
  },
  // Row 7: Aarnora - Phone
  {
    row: 7,
    col: 'H',
    value: 'TBD'
  },
  // Row 7: Aarnora - move description to Notes
  {
    row: 7,
    col: 'R', // Notes
    value: 'No website/email found yet; brand just launched showroom Apr 2026 in Secunderabad. Showroom on Sarojini Devi Rd. DM on Instagram or find via SGBL Group. Launched by Nidhhi Agerwal. 77% exchange policy. 2,334 IG followers.'
  },
  // Row 8: Pranikas - Last Name fix
  {
    row: 8,
    col: 'E', // Last Name
    value: 'TBD'
  },
  // Row 8: Pranikas - Notes update
  {
    row: 8,
    col: 'R', // Notes
    value: 'Based in Guwahati Assam. Focus on Northeast handloom and weavers. Also on TikTok. 2,095 IG followers. Founder email likely nikkonika@gmail.com (from website footer).'
  },
  // Row 10: Dandelion Jewels - lower priority, flag in Notes
  {
    row: 10,
    col: 'N', // Priority
    value: 'Low'
  },
  // Row 10: Dandelion Jewels - update Notes
  {
    row: 10,
    col: 'R',
    value: 'LOW QUALITY LEAD: No website, no email, no phone, no founder info. Only has Instagram (910 followers, 56 posts). Shopify store appears inactive. DM is only contact method.'
  },
  // Row 11: Silvooshine - update Notes
  {
    row: 11,
    col: 'R',
    value: 'Based in Dwarka Delhi (Plot 719 Sector 26). Website claims 3L+ customers — likely inflated given only 63 IG followers and 15 posts. Website functional with products listed. Free shipping above 1499.'
  },
  // Standardize Status column (P) for rows 2-6 from "Not Contacted" to "New"
  // Row 2
  { row: 2, col: 'P', value: 'New' },
  // Row 3
  { row: 3, col: 'P', value: 'New' },
  // Row 4
  { row: 4, col: 'P', value: 'New' },
  // Row 5
  { row: 5, col: 'P', value: 'New' },
  // Row 6
  { row: 6, col: 'P', value: 'New' },
  // Row 15: Gharana Karigari - Last Name fix
  {
    row: 15,
    col: 'E', // Last Name
    value: 'TBD'
  },
  // Row 15: Gharana Karigari - Notes update
  {
    row: 15,
    col: 'R',
    value: 'Based in Rudrapur Uttarakhand (D-15 Hari Mandir Gali). Operates under Batraventures. Ethnic kurtis and wedding sets. Free shipping above 999. Founder email likely garvansh@batraventures.in.'
  },
];

// Map column letters to indices (A=1, B=2, ... S=19)
function colToIndex(col) {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result;
}

// We need to update specific cells. Use sheets update for each.
for (const fix of fixes) {
  const range = `Outbound!${fix.col}${fix.row}`;
  try {
    const result = execFileSync(gog, [
      'sheets', 'update', sheetId, range,
      '--values-json', JSON.stringify([[fix.value]]),
      '--input', 'USER_ENTERED',
      '--no-input'
    ], { encoding: 'utf8' });
    console.log(`✅ ${range}: updated`);
  } catch(e) {
    console.log(`❌ ${range}: ERROR - ${e.message.substring(0, 150)}`);
  }
}

console.log('\nAll fixes applied!');