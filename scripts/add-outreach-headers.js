const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const headers = [['Date','Company','Channel','Direction','Message Type','Subject','Message Summary','Status','Reply Summary','Next Action','Next Action Date','Notes']];

try {
  const result = execFileSync(gog, [
    'sheets', 'update', sheetId, 'Outreach Log!A1:L1',
    '--values-json', JSON.stringify(headers),
    '--input', 'USER_ENTERED',
    '--no-input'
  ], { encoding: 'utf8' });
  console.log('Headers written:', result.trim());
} catch(e) {
  console.log('Error:', e.message.substring(0, 200));
}