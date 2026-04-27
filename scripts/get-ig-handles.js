const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Get all leads with IG handles
const result = execFileSync(gog, [
  'sheets', 'get', sheetId, 'Outbound!A2:S63',
  '--json', '--no-input'
], { encoding: 'utf8' });

const data = JSON.parse(result);
const rows = data.values || [];

const igHandles = [];
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const status = row[14] || 'New';
  const ig = row[9] || '';
  
  if (ig && ig.includes('instagram.com')) {
    // Extract handle from URL
    const match = ig.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
    if (match) {
      igHandles.push({
        row: i + 2,
        company: row[1] || '',
        handle: match[1],
        category: row[0] || ''
      });
    }
  }
}

console.log(`Found ${igHandles.length} leads with IG handles`);
console.log('\nFirst 10:');
for (const lead of igHandles.slice(0, 10)) {
  console.log(`  ${lead.company} (@${lead.handle}) - ${lead.category}`);
}

// Save for batch commenting
const fs = require('fs');
fs.writeFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-handles.json', JSON.stringify(igHandles, null, 2));
console.log('\nSaved to ig-handles.json');
