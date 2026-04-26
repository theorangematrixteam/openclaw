const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const result = execFileSync(gog, [
  'sheets', 'get', sheetId, 'Outbound!A2:S50',
  '--json', '--no-input'
], { encoding: 'utf8' });

const data = JSON.parse(result);
const rows = data.values || [];

console.log('Lead Verification Report:');
console.log('==========================\n');

let verified = 0;
let incomplete = 0;

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const rowNum = i + 2;
  const company = row[1] || '';
  const email = row[6] || '';
  const phone = row[7] || '';
  const ig = row[9] || '';
  const status = row[14] || 'New';
  
  const hasEmail = email && email.includes('@') && !email.includes('TBD');
  const hasPhone = phone && !phone.includes('TBD') && phone.startsWith('91');
  const hasIG = ig && ig.includes('instagram');
  
  const isVerified = hasEmail || hasPhone;
  
  if (isVerified) verified++;
  else incomplete++;
  
  console.log(`Row ${rowNum}: ${company}`);
  console.log(`  Email: ${hasEmail ? '✅' : '❌'} ${email.substring(0, 40)}`);
  console.log(`  Phone: ${hasPhone ? '✅' : '❌'} ${phone.substring(0, 30)}`);
  console.log(`  IG: ${hasIG ? '✅' : '❌'} ${ig.substring(0, 50)}`);
  console.log(`  Status: ${status}`);
  console.log(`  Verified: ${isVerified ? 'YES' : 'NO - NEEDS WORK'}`);
  console.log('');
}

console.log(`\n==========================`);
console.log(`Total leads: ${rows.length}`);
console.log(`Verified (have email/phone): ${verified}`);
console.log(`Incomplete (need contact info): ${incomplete}`);
console.log(`Contacted: ${rows.filter(r => r[14] === 'Contacted').length}`);
console.log(`Follow-up 1: ${rows.filter(r => r[14] === 'Follow-up 1').length}`);