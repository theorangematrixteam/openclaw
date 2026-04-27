const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Get all lead emails
const result = execFileSync(gog, [
  'sheets', 'get', sheetId, 'Outbound!G2:G63',
  '--json', '--no-input'
], { encoding: 'utf8' });

const data = JSON.parse(result);
const rows = data.values || [];
const emails = rows.map(r => r[0]).filter(e => e && e.includes('@') && !e.includes('TBD'));

if (emails.length === 0) {
  console.log('No lead emails found');
  process.exit(0);
}

// Build search query for replies from these emails
const emailQuery = emails.slice(0, 20).map(e => `from:${e}`).join(' OR ');
const query = `(${emailQuery}) newer_than:1d`;

console.log('Checking for email replies from leads...\n');

try {
  const searchResult = execFileSync(gog, [
    'gmail', 'search', query,
    '--max', '50', '--json', '--no-input'
  ], { encoding: 'utf8' });
  
  const threads = JSON.parse(searchResult);
  
  if (threads.threads && threads.threads.length > 0) {
    console.log(`🚨 ${threads.threads.length} REPLIES FOUND:\n`);
    for (const thread of threads.threads) {
      console.log(`From: ${thread.from}`);
      console.log(`Subject: ${thread.subject}`);
      console.log(`Date: ${thread.date}`);
      console.log('---');
    }
  } else {
    console.log('✅ No new replies from leads');
  }
} catch(e) {
  console.log('Error checking emails:', e.message.substring(0, 100));
}
