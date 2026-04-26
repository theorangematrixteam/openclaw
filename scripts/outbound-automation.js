const { execFileSync } = require('child_process');
const { randomInt } = require('crypto');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const ORANGE_WEBSITE = 'theorangematrix.com';
const ORANGE_PHONE = '91 7977147253';

// Status flow: New → Contacted → Follow-up 1 → Follow-up 2 → Breakup
// Day 1: Initial, Day 4: Follow-up 1, Day 9: Follow-up 2, Day 14: Breakup

function getFollowUpTemplate(lead, day) {
  const { company, firstName, category, whyTheyNeedUs } = lead;
  
  if (day === 'followup1') {
    return {
      subject: `quick follow — ${company}`,
      body: `Hey ${firstName || ''},

Just bumping this up in case it got buried. Sent a note a few days ago about helping ${company} with content — happy to make you a free sample reel so you can see the quality before deciding anything.

No pressure at all. If now isn't the right time, I get it — just wanted to make sure you saw it.

theorangematrix.com | ${ORANGE_PHONE}

Cheers,
Jinay, Orange Matrix`
    };
  }
  
  if (day === 'followup2') {
    return {
      subject: `one last thing — ${company}`,
      body: `Hey ${firstName || ''},

One last nudge — would love to create that free sample reel for ${company}. Takes us a day to put together, no strings attached.

If timing isn't right, totally fine. Just drop me a line when it makes sense.

theorangematrix.com | ${ORANGE_PHONE}

Best,
Jinay, Orange Matrix`
    };
  }
  
  if (day === 'breakup') {
    return {
      subject: `closing the loop — ${company}`,
      body: `Hey ${firstName || ''},

I don't want to keep emailing if this isn't a fit — no point in being that person.

If content ever becomes a priority for ${company}, you know where to find us.

theorangematrix.com | ${ORANGE_PHONE}

Wishing you all the best,
Jinay, Orange Matrix`
    };
  }
  
  return null;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check for replies from leads
function checkReplies() {
  // Get all lead emails
  const result = execFileSync(gog, [
    'sheets', 'get', sheetId, 'Outbound!G2:G1000',
    '--json', '--no-input'
  ], { encoding: 'utf8' });
  const data = JSON.parse(result);
  const emails = (data.values || []).map(r => r[0]).filter(e => e && e.includes('@'));
  
  if (emails.length === 0) return [];
  
  // Build Gmail search query for replies from these emails
  const emailQuery = emails.map(e => `from:${e}`).join(' OR ');
  const query = `(${emailQuery}) newer_than:1d`;
  
  try {
    const searchResult = execFileSync(gog, [
      'gmail', 'search', query,
      '--max', '50', '--json', '--no-input'
    ], { encoding: 'utf8' });
    const threads = JSON.parse(searchResult);
    return threads.threads || [];
  } catch(e) {
    console.log('Reply check failed:', e.message.substring(0, 100));
    return [];
  }
}

// Send follow-up to a lead
function sendFollowUp(lead, day, row) {
  const template = getFollowUpTemplate(lead, day);
  if (!template || !lead.email || !lead.email.includes('@')) {
    console.log(`Skip ${lead.company}: no template or invalid email`);
    return false;
  }
  
  try {
    const result = execFileSync(gog, [
      'gmail', 'send',
      '--to', lead.email,
      '--subject', template.subject,
      '--body', template.body,
      '--no-input'
    ], { encoding: 'utf8' });
    
    console.log(`✅ ${lead.company}: ${day} sent`);
    
    // Log to Outreach Log
    const today = new Date().toISOString().split('T')[0];
    const logValues = [[
      today, lead.company, 'Email', 'Outbound', 
      day === 'followup1' ? 'Follow-up 1' : day === 'followup2' ? 'Follow-up 2' : 'Breakup',
      template.subject, `${day} template with ${ORANGE_WEBSITE} link`, 'Sent', '', '', '', ''
    ]];
    
    try {
      execFileSync(gog, [
        'sheets', 'append', sheetId, 'Outreach Log!A:L',
        '--values-json', JSON.stringify(logValues),
        '--insert', 'INSERT_ROWS', '--no-input'
      ], { encoding: 'utf8' });
    } catch(e) {}
    
    // Update status in Outbound sheet
    const newStatus = day === 'followup1' ? 'Follow-up 1' : day === 'followup2' ? 'Follow-up 2' : 'Breakup';
    try {
      execFileSync(gog, [
        'sheets', 'update', sheetId, `Outbound!O${row}`,
        '--values-json', JSON.stringify([[newStatus]]),
        '--input', 'USER_ENTERED', '--no-input'
      ], { encoding: 'utf8' });
      execFileSync(gog, [
        'sheets', 'update', sheetId, `Outbound!P${row}`,
        '--values-json', JSON.stringify([[today]]),
        '--input', 'USER_ENTERED', '--no-input'
      ], { encoding: 'utf8' });
    } catch(e) {}
    
    return true;
  } catch(e) {
    console.log(`❌ ${lead.company}: ${day} failed — ${e.message.substring(0, 100)}`);
    return false;
  }
}

// Get leads that need follow-ups
function getLeadsNeedingFollowUp() {
  const result = execFileSync(gog, [
    'sheets', 'get', sheetId, 'Outbound!A2:S100',
    '--json', '--no-input'
  ], { encoding: 'utf8' });
  
  const data = JSON.parse(result);
  const rows = data.values || [];
  const today = new Date();
  const leads = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const status = row[14] || 'New';
    const lastContacted = row[15] || '';
    const company = row[1] || '';
    const email = row[6] || '';
    const firstName = row[3] || '';
    const category = row[0] || '';
    const why = row[12] || '';
    
    if (!lastContacted || !email || !email.includes('@')) continue;
    
    const lastDate = new Date(lastContacted);
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    let day = null;
    if (status === 'Contacted' && daysSince >= 4) day = 'followup1';
    else if (status === 'Follow-up 1' && daysSince >= 5) day = 'followup2';
    else if (status === 'Follow-up 2' && daysSince >= 5) day = 'breakup';
    
    if (day) {
      leads.push({ row: i + 2, company, email, firstName, category, whyTheyNeedUs: why, day, daysSince });
    }
  }
  
  return leads;
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  let totalSent = 0;
  let repliesFound = [];
  
  console.log(`=== Outbound Follow-up Run: ${today} ===\n`);
  
  // Step 1: Check for replies
  console.log('Checking for replies...');
  repliesFound = checkReplies();
  if (repliesFound.length > 0) {
    console.log(`🚨 ${repliesFound.length} REPLIES FOUND:`);
    for (const thread of repliesFound) {
      console.log(`  - ${thread.from}: "${thread.subject}"`);
    }
  } else {
    console.log('No replies found.');
  }
  console.log('');
  
  // Step 2: Send follow-ups
  const followUps = getLeadsNeedingFollowUp();
  console.log(`${followUps.length} leads need follow-up today:`);
  for (const lead of followUps) {
    console.log(`  ${lead.company}: ${lead.day} (${lead.daysSince} days since last contact)`);
  }
  console.log('');
  
  for (const lead of followUps) {
    if (totalSent >= 30) {
      console.log('Hit 30 email limit. Stopping.');
      break;
    }
    
    const gap = randomInt(10000, 30000); // 10-30s gap
    if (totalSent > 0) await sleep(gap);
    
    const leadData = {
      company: lead.company,
      email: lead.email,
      firstName: lead.firstName,
      category: lead.category,
      whyTheyNeedUs: lead.whyTheyNeedUs
    };
    
    if (sendFollowUp(leadData, lead.day, lead.row)) {
      totalSent++;
    }
  }
  
  // Summary
  console.log(`\n=== Done ===`);
  console.log(`Follow-ups sent: ${totalSent}`);
  console.log(`Replies found: ${repliesFound.length}`);
  
  // Push to Discord
  if (totalSent > 0 || repliesFound.length > 0) {
    const msg = `📧 Outbound Update (${today})\n• ${totalSent} follow-ups sent\n• ${repliesFound.length} replies found${repliesFound.length > 0 ? '\n• ' + repliesFound.map(r => r.from).join(', ') : ''}\nSheet: https://docs.google.com/spreadsheets/d/${sheetId}`;
    try {
      execFileSync('openclaw', [
        'message', 'send',
        '--channel', 'discord',
        '--target', 'channel:1492494467205304411',
        '--message', msg
      ], { encoding: 'utf8' });
    } catch(e) {
      console.log('Discord push failed:', e.message.substring(0, 100));
    }
  }
}

main();