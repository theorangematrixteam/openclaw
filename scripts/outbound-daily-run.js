const { execFileSync } = require('child_process');
const { randomInt } = require('crypto');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const ORANGE_WEBSITE = 'theorangematrix.com';
const ORANGE_PHONE = '91 7977147253';
const MAX_DAILY_EMAILS = 30;
const MAX_DAILY_COMMENTS = 10;

function cleanEmail(email) {
  if (!email || typeof email !== 'string') return '';
  if (email.toLowerCase().startsWith('tbd')) {
    const emailMatch = email.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) return emailMatch[1];
    return '';
  }
  const emails = email.split(/\s*[/|]\s*|\s+or\s+/i);
  for (const e of emails) {
    const cleaned = e.trim();
    if (cleaned.includes('@') && cleaned.includes('.')) return cleaned;
  }
  return '';
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getInitialTemplate(lead) {
  const { company, firstName, category } = lead;
  let productType = 'products';
  if (category.includes('Streetwear')) productType = 'drops';
  else if (category.includes('Ethnic')) productType = 'designs';
  else if (category.includes('Jewelry')) productType = 'pieces';
  else if (category.includes('Candle')) productType = 'candles';
  else if (category.includes('Perfume')) productType = 'fragrances';
  
  const greeting = firstName ? `Hey ${firstName},` : `Hey,`;
  
  const subject = `your ${productType} deserve more eyes`;
  const body = `${greeting}

Came across ${company} — looks like you're building something real.

We're Orange Matrix — we handle content end to end for brands like yours. One team, so you never have to juggle multiple people or worry about what's going up next. You focus on making great ${productType} and growing the business, we make sure people see it.

${ORANGE_WEBSITE} | ${ORANGE_PHONE}

We'd love to make you a free creative visual for ${company} — no strings at all. If it resonates, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix`;
  return { subject, body };
}

function getFollowUpTemplate(lead, day) {
  const { company, firstName } = lead;
  
  if (day === 'followup1') {
    const greeting = firstName ? `Hey ${firstName},` : `Hey,`;
    return {
      subject: `quick follow — ${company}`,
      body: `${greeting}

Just bumping this up in case it got buried. Sent a note a few days ago about helping ${company} with content — happy to make you a free creative visual so you can see the quality before deciding anything.

No pressure at all. If now isn't the right time, I get it — just wanted to make sure you saw it.

${ORANGE_WEBSITE} | ${ORANGE_PHONE}

Cheers,
Jinay, Orange Matrix`
    };
  }
  
  if (day === 'followup2') {
    const greeting = firstName ? `Hey ${firstName},` : `Hey,`;
    return {
      subject: `one last thing — ${company}`,
      body: `${greeting}

One last nudge — would love to create that free creative visual for ${company}. Takes us a day to put together, no strings attached.

If timing isn't right, totally fine. Just drop me a line when it makes sense.

${ORANGE_WEBSITE} | ${ORANGE_PHONE}

Best,
Jinay, Orange Matrix`
    };
  }
  
  if (day === 'breakup') {
    const greeting = firstName ? `Hey ${firstName},` : `Hey,`;
    return {
      subject: `closing the loop — ${company}`,
      body: `${greeting}

I don't want to keep emailing if this isn't a fit — no point in being that person.

If content ever becomes a priority for ${company}, you know where to find us.

${ORANGE_WEBSITE} | ${ORANGE_PHONE}

Wishing you all the best,
Jinay, Orange Matrix`
    };
  }
  return null;
}

function checkEmailReplies() {
  console.log('\n📧 Checking for email replies...');
  const result = execFileSync(gog, [
    'sheets', 'get', sheetId, 'Outbound!G2:G63',
    '--json', '--no-input'
  ], { encoding: 'utf8' });
  
  const data = JSON.parse(result);
  const rows = data.values || [];
  const emails = rows.map(r => r[0]).filter(e => e && e.includes('@') && !e.includes('TBD'));
  
  if (emails.length === 0) {
    console.log('No lead emails to check');
    return [];
  }
  
  const emailQuery = emails.slice(0, 20).map(e => `from:${e}`).join(' OR ');
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

function sendEmail(lead, template, row, isInitial = false, day = '') {
  if (!template || !lead.email) {
    console.log(`Skip ${lead.company}: no template or invalid email`);
    return false;
  }
  
  try {
    execFileSync(gog, [
      'gmail', 'send',
      '--to', lead.email,
      '--subject', template.subject,
      '--body', template.body,
      '--no-input'
    ], { encoding: 'utf8' });
    
    const today = new Date().toISOString().split('T')[0];
    const msgType = isInitial ? 'Initial' : (day === 'followup1' ? 'Follow-up 1' : day === 'followup2' ? 'Follow-up 2' : 'Breakup');
    
    console.log(`✅ ${lead.company}: ${msgType} sent`);
    
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
    
    const newStatus = isInitial ? 'Contacted' : (day === 'followup1' ? 'Follow-up 1' : day === 'followup2' ? 'Follow-up 2' : 'Breakup');
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
    console.log(`❌ ${lead.company}: ${isInitial ? 'Initial' : day} failed — ${e.message.substring(0, 100)}`);
    return false;
  }
}

function getFutureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

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
    const rawEmail = row[6] || '';
    const email = cleanEmail(rawEmail);
    const firstName = row[3] || '';
    const category = row[0] || '';
    
    if (!lastContacted || !email) continue;
    
    const lastDate = new Date(lastContacted);
    if (isNaN(lastDate)) continue;
    
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    let day = null;
    if (status === 'Contacted' && daysSince >= 4) day = 'followup1';
    else if (status === 'Follow-up 1' && daysSince >= 5) day = 'followup2';
    else if (status === 'Follow-up 2' && daysSince >= 5) day = 'breakup';
    
    if (day) {
      leads.push({ row: i + 2, company, email, firstName, category, day, daysSince });
    }
  }
  
  return leads;
}

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
      const rawEmail = row[6] || '';
      const email = cleanEmail(rawEmail);
      if (email) {
        leads.push({
          row: i + 2,
          company: row[1] || '',
          email: email,
          firstName: row[3] || '',
          category: row[0] || ''
        });
      }
    }
  }
  
  return leads;
}

async function sendIGComments() {
  console.log('\n📱 Sending IG comments (max 10)...');
  
  const fs = require('fs');
  const { getComment } = require('./ig-comment-templates');
  
  try {
    const handles = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-handles.json', 'utf8'));
    // Filter out already commented (bitchn.official)
    const remaining = handles.filter(h => h.handle !== 'bitchn.official');
    const batch = remaining.slice(0, MAX_DAILY_COMMENTS);
    
    let sent = 0;
    for (const lead of batch) {
      const comment = getComment(lead.company, lead.category);
      
      try {
        execFileSync('node', [
          'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-comment-stealth.js',
          lead.handle,
          comment
        ], { encoding: 'utf8', timeout: 60000 });
        console.log(`  ✅ ${lead.company}: Comment posted`);
        sent++;
      } catch(e) {
        console.log(`  ❌ ${lead.company}: ${e.message.substring(0, 80)}`);
      }
      
      if (batch.indexOf(lead) < batch.length - 1) {
        const gap = randomInt(15000, 30000);
        await sleep(gap);
      }
    }
    
    console.log(`Done! ${sent}/${batch.length} comments posted.`);
    return sent;
  } catch(e) {
    console.log('IG comment error:', e.message.substring(0, 100));
    return 0;
  }
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  let totalSent = 0;
  let initialCount = 0;
  let followUpCount = 0;
  
  console.log(`=== Outbound Daily Run: ${today} ===\n`);
  
  // Step 1: Check for replies
  console.log('=== STEP 1: Check Replies ===');
  const replies = checkEmailReplies();
  
  if (replies.length > 0) {
    console.log(`\n🚨 ${replies.length} REPLIES FOUND:`);
    for (const reply of replies) {
      console.log(`  - ${reply.from}: "${reply.subject}"`);
    }
    console.log('\n⚠️  ALERT JINAY: Leads have replied! Check Gmail and respond manually.');
  } else {
    console.log('✅ No replies from leads yet');
  }
  
  // Step 2: Send follow-ups
  console.log('\n=== STEP 2: Send Follow-ups ===');
  const followUps = getLeadsNeedingFollowUp();
  console.log(`${followUps.length} leads need follow-up`);
  
  for (const lead of followUps) {
    if (totalSent >= MAX_DAILY_EMAILS) {
      console.log(`Hit ${MAX_DAILY_EMAILS} email limit`);
      break;
    }
    
    const gap = randomInt(10000, 30000);
    if (totalSent > 0) await sleep(gap);
    
    const template = getFollowUpTemplate(lead, lead.day);
    if (sendEmail(lead, template, lead.row, false, lead.day)) {
      totalSent++;
      followUpCount++;
    }
  }
  
  // Step 3: Send initial emails
  console.log('\n=== STEP 3: Send Initial Emails ===');
  const remainingQuota = MAX_DAILY_EMAILS - totalSent;
  console.log(`${remainingQuota} slots remaining`);
  
  const newLeads = getNewLeads();
  const leadsToEmail = newLeads.slice(0, remainingQuota);
  
  for (const lead of leadsToEmail) {
    if (totalSent >= MAX_DAILY_EMAILS) break;
    
    const gap = randomInt(10000, 30000);
    if (totalSent > 0) await sleep(gap);
    
    const template = getInitialTemplate(lead);
    if (sendEmail(lead, template, lead.row, true)) {
      totalSent++;
      initialCount++;
    }
  }
  
  // Step 4: Send IG comments
  console.log('\n=== STEP 4: Send IG Comments ===');
  const commentsSent = await sendIGComments();
  
  // Summary
  console.log(`\n=== Daily Report (${today}) ===`);
  console.log(`📧 Emails: ${totalSent}/${MAX_DAILY_EMAILS} (${followUpCount} follow-ups, ${initialCount} initial)`);
  console.log(`📱 IG Comments: ${commentsSent}/${MAX_DAILY_COMMENTS}`);
  console.log(`🚨 Replies: ${replies.length}`);
  console.log(`📊 Remaining new leads: ${newLeads.length - initialCount}`);
  console.log(`📋 Sheet: https://docs.google.com/spreadsheets/d/${sheetId}`);
  
  // Push to Discord
  const msg = `📧 Outbound Daily Report (${today})\n\n✅ ${totalSent} emails sent (${followUpCount} follow-ups, ${initialCount} initial)\n📱 ${commentsSent} IG comments posted\n${replies.length > 0 ? `🚨 ${replies.length} REPLIES FOUND — check Gmail!\n` : '✅ No replies yet\n'}📋 Sheet: https://docs.google.com/spreadsheets/d/${sheetId}`;
  
  console.log('\nDiscord report:');
  console.log(msg);
}

main();
