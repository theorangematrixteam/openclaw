const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const headers = [['Date','Company','Channel','Direction','Message Type','Subject','Message Summary','Status','Reply Summary','Next Action','Next Action Date','Notes']];

try {
  const result = execFileSync(gog, [
    'sheets', 'append', sheetId, 'Outreach Log!A:L',
    '--values-json', JSON.stringify(headers),
    '--insert', 'INSERT_ROWS',
    '--no-input'
  ], { encoding: 'utf8' });
  console.log('Outreach Log tab created:', result.trim());
} catch(e) {
  console.log('Error:', e.message.substring(0, 200));
}