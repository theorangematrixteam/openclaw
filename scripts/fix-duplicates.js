const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Remove duplicate rows — keep first occurrence, delete rest
// DEFKIDD appears at row 20, 47, 54 — keep 20, delete 47+54
// Mynaah appears at row 48, 55 — keep 48, delete 55
// Silvra appears at row 49, 56 — keep 49, delete 56
// Reeva Silver appears at row 50, 57 — keep 50, delete 57
// Sixtyscent appears at row 44, 51, 58 — keep 44, delete 51+58
// Alkimi Living appears at row 52, 59 — keep 52, delete 59
// Bakwaas Wears appears at row 53, 60 — keep 53, delete 60

const rowsToDelete = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];

for (const row of rowsToDelete.reverse()) { // delete from bottom up
  try {
    // Google Sheets API doesn't have simple row delete via gog CLI
    // Instead, clear the row content
    execFileSync(gog, [
      'sheets', 'clear', sheetId, `Outbound!A${row}:S${row}`,
      '--no-input'
    ], { encoding: 'utf8' });
    console.log(`Cleared row ${row}`);
  } catch(e) {
    console.log(`Failed to clear row ${row}: ${e.message.substring(0, 80)}`);
  }
}

console.log('Done removing duplicates');
