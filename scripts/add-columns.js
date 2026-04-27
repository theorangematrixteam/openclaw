const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Add Twitter/X and LinkedIn URL columns
const headers = [['Twitter/X', 'LinkedIn URL']];

try {
  const result = execFileSync(gog, [
    'sheets', 'update', sheetId, 'Outbound!T1:U1',
    '--values-json', JSON.stringify(headers),
    '--input', 'USER_ENTERED',
    '--no-input'
  ], { encoding: 'utf8' });
  console.log('Columns added:', result.trim());
} catch(e) {
  console.log('Error:', e.message.substring(0, 200));
}
