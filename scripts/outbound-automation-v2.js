const { execFileSync } = require('child_process');
const { randomInt } = require('crypto');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const ORANGE_WEBSITE = 'theorangematrix.com';
const ORANGE_PHONE = '91 7977147253';

function getInitialTemplate(lead) {
  const { company, firstName, category, whyTheyNeedUs } = lead;
  
  // Extract product type from category or why they need us
  let productType = 'products';
  if (category.includes('Streetwear')) productType = 'drops';
  else if (category.includes('Ethnic')) productType = 'designs';
  else if (category.includes('Jewelry')) productType = 'pieces';
  else if (category.includes('Candle')) productType = 'candles';
  else if (category.includes('Perfume')) productType = 'fragrances';
  
  // Extract specific detail from whyTheyNeedUs if available
  let specific = '';
  if (whyTheyNeedUs) {
    const match = whyTheyNeedUs.match(/(?:the|their)\s+([\w\s]+?)(?:\s+(?:are|is|stand out|look|collection))/i);
    if (match) specific = match[1];
  }
  
  const subject = `your ${productType} deserve more eyes`;
  
  let opener = `Hey ${firstName || ''},\n\nCame across ${company}`;
  if (specific) {
    opener += ` — the ${specific.trim()} are really nice`;
  } else {
    opener += ` — looks like you're building something real`;
  }
  opener += `.\n`;
  
  const body = `${opener}
We're Orange Matrix — we handle content end to end for brands like yours. One team, so you never have to juggle multiple people or worry about what's going up next. You focus on making great ${productType} and growing the business, we make sure people see it.

${ORANGE_WEBSITE} | ${ORANGE_PHONE}

We'd love to make you a free sample reel for ${company} — no strings at all. If it resonates, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix`;

  return { subject, body };
}

function getFollowUpTemplate(lead, day) {
  const { company, firstName } = lead;
  
  if (day === 'followup1') {
    return {
      subject: `quick follow — ${company}`,
      body: `Hey ${firstName || ''},

Just bumping this up in case it got buried. Sent a note a few days ago about helping ${company} with content — happy to make you a free sample reel so you can see the quality before deciding anything.

No pressure at all. If now isn't the right time, I get it — just wanted to make sure you saw it.

${ORANGE_WEBSITE} | ${ORANGE_PHONE}

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

${ORANGE_WEBSITE} | ${ORANGE_PHONE}

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

${ORANGE_WEBSITE} | ${ORANGE_PHONE}

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
function checkReplies(leads) {
  if (!leads || leads.length === 0) return [];
  
  const emails = leads.map(l => l.email).filter(e => e && e.includes('@'));
  if (emails.length === 0) return [];
  
  const emailQuery = emails.map(e => `from:${e}`).join(' OR ');
  const query = `(${emailQuery}) newer_than:1d -subject:Undelivered -subject:bounce`;
  
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

// Send email to a lead
function sendEmail(lead, template, row, isInitial = false) {
  if (!template || !lead.email || !lead.email.includes('@')) {
    console.log(`Skip ${lead.company}: no template or invalid email`);
    return false;
  }
  
  // Check for bounce from previous send
  if (!isInitial) {
    try {
      const bounceCheck = execFileSync(gog, [
        'gmail', 'search',
        `to:${lead.email} OR from:${lead.email} subject:(Undelivered OR failed OR bounce) newer_than:5d`,
        '--max', '5', '--json', '--no-input'
      ], { encoding: 'utf8' });
      const bounces = JSON.parse(bounceCheck);
      if (bounces.threads && bounces.threads.length > 0) {
        console.log(`⚠️ ${lead.company}: Previous email bounced. Skipping.`);
        return false;
      }
    } catch(e) {}
  }
  
  try {
    const result = execFileSync(gog, [
      'gmail', 'send',
      '--to', lead.email,
      '--subject', template.subject,
      '--body', template.body,
      '--no-input'
    ], { encoding: 'utf8' });
    
    const today = new Date().toISOString().split('T')[0];
    const msgType = isInitial ? 'Initial' : (lead.day === 'followup1' ? 'Follow-up 1' : lead.day === 'followup2' ? 'Follow-up 2' : 'Breakup');
    
    console.log(`✅ ${lead.company}: ${msgType} sent`);
    
    // Log to Outreach Log
    const logValues = [[
      today, lead.company, 'Email', 'Outbound', 
      msgType, template.subject, 
      `${msgType} with ${ORANGE_WEBSITE}`, 'Sent', '', 
      isInitial ? 'Follow-up 1 on ' + getFutureDate(4) : '',
      isInitial ? getFutureDate(4) : '',
      ''
    ]];
    
    try {
      execFileSync(gog, [
        'sheets', 'append', sheetId, 'Outreach Log!A:L',
        '--values-json', JSON.stringify(logValues),
        '--insert', 'INSERT_ROWS', '--no-input'
      ], { encoding: 'utf8' });
    } catch(e) {}
    
    // Update status in Outbound sheet
    const newStatus = isInitial ? 'Contacted' : (lead.day === 'followup1' ? 'Follow-up 1' : lead.day === 'followup2' ? 'Follow-up 2' : 'Breakup');
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
    console.log(`❌ ${lead.company}: ${isInitial ? 'Initial' : lead.day} failed — ${e.message.substring(0, 100)}`);
    return false;
  }
}

function getFutureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Get leads that need follow-ups
function getLeadsNeedingFollowUp() {
  const result = execFileSync(gog, [
    'sheets', 'get', sheetId, 'Outbound!A2:S200',
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
    if (isNaN(lastDate)) continue;
    
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

// Get new leads (status = New)
function getNewLeads() {
  const result = execFileSync(gog, [
    'sheets', 'get', sheetId, 'Outbound!A2:S200',
    '--json', '--no-input'
  ], { encoding: 'utf8' });
  
  const data = JSON.parse(result);
  const rows = data.values || [];
  const leads = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const status = row[14] || 'New';
    
    if (status === 'New') {
      leads.push({
        row: i + 2,
        company: row[1] || '',
        email: row[6] || '',
        firstName: row[3] || '',
        category: row[0] || '',
        whyTheyNeedUs: row[12] || ''
      });
    }
  }
  
  return leads;
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  let totalSent = 0;
  let initialCount = 0;
  let followUpCount = 0;
  let repliesFound = [];
  
  console.log(`=== Outbound Automation Run: ${today} ===\n`);
  
  // Step 1: Check for replies from all contacted leads
  console.log('Step 1: Checking for replies...');
  const allLeads = getNewLeads().concat(getLeadsNeedingFollowUp());
  repliesFound = checkReplies(allLeads);
  if (repliesFound.length > 0) {
    console.log(`🚨 ${repliesFound.length} REPLIES FOUND:`);
    for (const thread of repliesFound) {
      console.log(`  - ${thread.from}: "${thread.subject}"`);
    }
  } else {
    console.log('No replies found.');
  }
  console.log('');
  
  // Step 2: Send initial emails to new leads
  console.log('Step 2: Sending initial emails to new leads...');
  const newLeads = getNewLeads();
  console.log(`${newLeads.length} new leads found.`);
  
  for (const lead of newLeads) {
    if (totalSent >= 30) {
      console.log('Hit 30 email limit. Stopping.');
      break;
    }
    
    const gap = randomInt(10000, 30000); // 10-30s gap
    if (totalSent > 0) await sleep(gap);
    
    const template = getInitialTemplate(lead);
    if (sendEmail(lead, template, lead.row, true)) {
      totalSent++;
      initialCount++;
    }
  }
  console.log('');
  
  // Step 3: Send follow-ups to old leads
  console.log('Step 3: Sending follow-ups...');
  const followUps = getLeadsNeedingFollowUp();
  console.log(`${followUps.length} leads need follow-up today.`);
  
  for (const lead of followUps) {
    if (totalSent >= 30) {
      console.log('Hit 30 email limit. Stopping follow-ups.');
      break;
    }
    
    const gap = randomInt(10000, 30000); // 10-30s gap
    if (totalSent > 0) await sleep(gap);
    
    const template = getFollowUpTemplate(lead, lead.day);
    if (sendEmail(lead, template, lead.row, false)) {
      totalSent++;
      followUpCount++;
    }
  }
  
  // Summary
  console.log(`\n=== Done ===`);
  console.log(`Total emails sent: ${totalSent}`);
  console.log(`  Initial: ${initialCount}`);
  console.log(`  Follow-ups: ${followUpCount}`);
  console.log(`Replies found: ${repliesFound.length}`);
  
  // Push to Discord
  const msg = `📧 Outbound Daily Report (${today})\n\n✅ ${totalSent} emails sent (${initialCount} initial, ${followUpCount} follow-ups)\n${repliesFound.length > 0 ? `🚨 ${repliesFound.length} replies from leads:\n` + repliesFound.map(r => `• ${r.from}: "${r.subject}"`).join('\n') : '✅ No replies yet'}\n\nSheet: https://docs.google.com/spreadsheets/d/${sheetId}`;
  
  console.log('\nDiscord report:');
  console.log(msg);
  
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

main();