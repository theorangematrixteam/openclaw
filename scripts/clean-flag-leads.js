const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Rows with incomplete data (no valid email AND no valid phone)
const incompleteRows = [7, 10, 16, 18, 19, 23, 25, 26, 28, 29, 30, 31, 34, 36, 38, 42, 45, 46];

console.log('Cleaning incomplete leads — moving to "Needs Research" status...\n');

let cleaned = 0;
for (const row of incompleteRows) {
  try {
    // Update Priority to "Low" and Status to "Needs Research"
    execFileSync(gog, [
      'sheets', 'update', sheetId, `Outbound!N${row}`,
      '--values-json', JSON.stringify([['Low']]),
      '--input', 'USER_ENTERED', '--no-input'
    ], { encoding: 'utf8' });
    
    execFileSync(gog, [
      'sheets', 'update', sheetId, `Outbound!O${row}`,
      '--values-json', JSON.stringify([['Needs Research']]),
      '--input', 'USER_ENTERED', '--no-input'
    ], { encoding: 'utf8' });
    
    // Update Next Step
    execFileSync(gog, [
      'sheets', 'update', sheetId, `Outbound!Q${row}`,
      '--values-json', JSON.stringify([['Find email or phone before outreach']]),
      '--input', 'USER_ENTERED', '--no-input'
    ], { encoding: 'utf8' });
    
    console.log(`✅ Row ${row}: Flagged as Needs Research`);
    cleaned++;
  } catch(e) {
    console.log(`❌ Row ${row}: Failed — ${e.message.substring(0, 80)}`);
  }
}

console.log(`\nDone! ${cleaned}/${incompleteRows.length} leads cleaned and flagged.`);
