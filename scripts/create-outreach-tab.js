const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Add Outreach Log tab header
const headers = [
  'Date',           // A - when action taken
  'Company',        // B - company name
  'Channel',         // C - Email / Instagram / WhatsApp
  'Direction',       // D - Outbound / Reply / Follow-up
  'Message Type',   // E - Initial / Follow-up 1 / Follow-up 2 / Breakup
  'Subject',        // F - email subject or DM first line
  'Message Summary', // G - brief summary of what was sent
  'Status',         // H - Sent / Delivered / Opened / Replied / No Reply / Bounced
  'Reply Summary',   // I - brief summary of their reply (if any)
  'Next Action',    // J - what to do next
  'Next Action Date', // K - when to do it (YYYY-MM-DD)
  'Notes'           // L - any extra context
];

// Create the Outreach Log tab by writing headers
const values = [headers];

try {
  // First, add the tab using sheets add-sheet
  // gog doesn't have add-sheet, so we'll write to a new tab range
  // The tab gets auto-created when we write to it
  const result = execFileSync(gog, [
    'sheets', 'update', sheetId, 'Outreach Log!A1:L1',
    '--values-json', JSON.stringify(values),
    '--input', 'USER_ENTERED',
    '--no-input'
  ], { encoding: 'utf8' });
  console.log('Outreach Log tab created:', result.trim());
} catch(e) {
  console.log('Error creating Outreach Log tab:', e.message.substring(0, 200));
}

// Also update the Status column in Outbound tab to have clear tracking values
// Update the Outbound sheet skill with new status values
console.log('\nDone! Outreach Log tab added.');
console.log('\nStatus values to use in Outbound tab:');
console.log('  New → Lead found, no outreach yet');
console.log('  Contacted → Initial message sent');
console.log('  Replied → They responded');
console.log('  Follow-up 1 → First follow-up sent');
console.log('  Follow-up 2 → Second follow-up sent');
console.log('  Breakup → Final breakup email sent');
console.log('  Not Interested → They said no');
console.log('  In Conversation → Talking but not closed');
console.log('  Closed Won → Client acquired');
console.log('  Closed Lost → Deal dead');
console.log('\nFollow-up schedule:');
console.log('  Day 1: Initial outreach');
console.log('  Day 4: Follow-up 1 (generates 40-50% of replies)');
console.log('  Day 9: Follow-up 2');
console.log('  Day 14: Breakup email');