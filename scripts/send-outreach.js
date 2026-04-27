const { execFileSync } = require('child_process');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';

const today = '2026-04-27';

// Leads with verified email to send initial outreach
const leads = [
  {
    company: 'Haus of Jawhar',
    email: 'support@hausofjawhar.com',
    subject: 'your fragrances deserve more eyes',
    product: 'fragrances',
    website: 'hausofjawhar.com',
  },
  {
    company: 'Hustle House',
    email: 'hustlehouse.care@hustlehouse.in',
    subject: 'your drops deserve more eyes',
    product: 'drops',
    website: 'hustlehouse.in',
  },
  {
    company: 'Sioral',
    email: 'info.sioral@gmail.com',
    subject: 'your pieces deserve more eyes',
    product: 'pieces',
    website: 'sioral.in',
  },
  {
    company: 'With Love By Neelam',
    email: 'withlovebyneelam@gmail.com',
    subject: 'your designs deserve more eyes',
    product: 'designs',
    website: 'withlovebyneelam.co.in',
  },
  {
    company: 'Aanagha',
    email: 'contact@aanagha.co',
    subject: 'your jewellery deserves more eyes',
    product: 'jewellery',
    website: 'aanagha.co',
  },
  {
    company: 'HuesByDrish',
    email: 'huesbydrish@gmail.com',
    subject: 'your pieces deserve more eyes',
    product: 'pieces',
    website: 'huesbydrish.com',
  },
  {
    company: 'Itrāa Essence',
    email: 'itraaessence@gmail.com',
    subject: 'your candles deserve more eyes',
    product: 'candles',
    website: 'itraaessence.com',
  },
  {
    company: 'Dream Lite',
    email: 'sayanichatterj13@gmail.com',
    subject: 'your candles deserve more eyes',
    product: 'candles',
    website: 'dream-lite.com',
  },
];

function getEmailBody(lead) {
  return `Hey,

Came across ${lead.company} — the ${lead.product} look great.

We're Orange Matrix — we handle content end to end for product brands. One team for everything: visuals, social, creative direction. You focus on making great product, we make sure people see it.

Check us out: https://theorangematrix.com

We'd love to make you a free sample reel — no strings. If it resonates, cool. If not, still rooting for you.

Want to chat? Reply here or WhatsApp: 91 7977147253

Jinay
Orange Matrix`;
}

let sent = 0;
let failed = 0;
const logEntries = [];

for (const lead of leads) {
  const body = getEmailBody(lead);
  try {
    execFileSync(gog, [
      'gmail', 'send',
      '--account', 'theorangematrixteam@gmail.com',
      '--to', lead.email,
      '--subject', lead.subject,
      '--body', body,
      '--no-input'
    ], { encoding: 'utf8' });
    console.log(`✅ Sent to ${lead.company} (${lead.email})`);
    sent++;
    
    logEntries.push({
      date: today,
      company: lead.company,
      channel: 'Email',
      direction: 'Outbound',
      messageType: 'Initial',
      subject: lead.subject,
      messageSummary: 'Initial with theorangematrix.com and 91 7977147253',
      status: 'Sent',
      replySummary: '',
      nextAction: `Follow-up 1 on ${getFutureDate(4)}`,
      nextActionDate: getFutureDate(4),
      notes: '',
    });
  } catch (e) {
    console.log(`❌ Failed to send to ${lead.company}: ${e.message.substring(0, 200)}`);
    failed++;
  }
}

function getFutureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

console.log(`\n=== SENT: ${sent}, FAILED: ${failed} ===`);

// Log entries to Outreach Log sheet
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';
for (const entry of logEntries) {
  const values = [
    entry.date, entry.company, entry.channel, entry.direction,
    entry.messageType, entry.subject, entry.messageSummary,
    entry.status, entry.replySummary, entry.nextAction,
    entry.nextActionDate, entry.notes
  ];
  try {
    execFileSync(gog, [
      'sheets', 'append', sheetId, "'Outreach Log'!A:L",
      '--values-json', JSON.stringify([values]),
      '--insert', 'INSERT_ROWS',
      '--no-input'
    ], { encoding: 'utf8' });
    console.log(`✅ Logged: ${entry.company}`);
  } catch (e) {
    console.log(`❌ Log failed: ${entry.company} — ${e.message.substring(0, 100)}`);
  }
}
