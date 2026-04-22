const { execFileSync } = require('child_process');
const { randomInt } = require('crypto');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const emails = [
  { row: 2, company: 'BITCHN', email: 'info@thebitchn.com', subject: 'your drops deserve more eyes', body: `Hey,

Came across BITCHN — the drops are sick. Got a real eye for this.

We're Orange Matrix — we handle content end to end for brands like yours. One team, so you never have to juggle multiple people or worry about what's going up next. You focus on making great product and growing the business, we make sure people see it.

Here's some of our work: theorangematrix.com

We'd love to make you a free sample reel for BITCHN — no strings at all. If it resonates, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 3, company: 'Sharmeeli', email: 'contact@sharmeeli.in', subject: 'your designs deserve more eyes', body: `Hey,

Came across Sharmeeli — the ethnic pieces are beautiful. Really clean work.

We're Orange Matrix — content end to end for brands like yours. One team handles shoots, reels, social strategy — everything. You focus on design and growing the business, we make sure people actually see it.

theorangematrix.com

We'd love to make you a free sample reel — no strings at all. If you vibe with it, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 4, company: 'Whynaut', email: 'whynaut04@gmail.com', subject: 'your fits deserve more eyes', body: `Hey,

Came across Whynaut — the Terra Luxe collection is clean. Streets need to see this.

We're Orange Matrix — content end to end. One team so you never juggle or worry about what's posting next. You focus on the product, we make sure people see it.

theorangematrix.com

Free sample reel for Whynaut — no strings at all. Resonates, we take it forward. Doesn't, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 5, company: 'Label Kariya', email: 'label.kariya@gmail.com', subject: 'your collection deserves more eyes', body: `Hey,

Came across Label Kariya — the ethnic fusion work is refreshing. Love the direction.

We're Orange Matrix — content end to end. One team, no juggling. You focus on the craft and growing the brand, we make sure people see it.

theorangematrix.com

We'd love to make you a free sample reel — no strings at all. If it resonates, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 6, company: 'Our Karma Clothing', email: 'contact@ourkarmaclothing.com', subject: 'your tees deserve more eyes', body: `Hey,

Came across Our Karma — the acid wash pieces stand out. Streets need to see more of this.

We're Orange Matrix — content end to end. One team, no juggling. You build the brand, we make sure people discover it.

theorangematrix.com

Free sample reel — no strings at all. If you vibe with it, we move forward. If not, no hard feelings.

Let us know?

Jinay
Orange Matrix` },
  { row: 12, company: 'Windowsill', email: 'enquiry@windowsill.co.in', subject: 'your candles deserve more eyes', body: `Hey,

Came across Windowsill — the beeswax candles are gorgeous. Really nice product.

We're Orange Matrix — content end to end. One team, no juggling. You focus on making great candles, we make sure people see them and want them.

theorangematrix.com

We'd love to create a free sample reel for Windowsill — no strings at all. If it resonates, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 8, company: 'Pranikas', email: 'support@pranikas.com', subject: 'your handlooms deserve more eyes', body: `Hey,

Came across Pranikas — the Northeast handloom collection is stunning. Love that you're putting weavers front and center.

We're Orange Matrix — content end to end. One team, no juggling. You focus on working with artisans and growing the brand, we make sure the world sees it.

theorangematrix.com

We'd love to make you a free sample reel — no strings at all. If it resonates, cool. If not, still rooting for you and the weavers.

Let us know?

Jinay
Orange Matrix` },
  { row: 9, company: 'Rihyaaz Fashions', email: 'rihyaaz.fashions@gmail.com', subject: 'your jamdanis deserve more eyes', body: `Hey,

Came across Rihyaaz — the Banarasi and Jamdani pieces are stunning. 21,000+ reviews and a Best Brand award — clearly doing something right.

We're Orange Matrix — content end to end. One team, no juggling. You focus on the craft, we make sure more people discover it.

theorangematrix.com

We'd love to make you a free sample reel — no strings at all. Resonates, we take it forward. Doesn't, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 13, company: 'Lussora', email: 'care.lussora@gmail.com', subject: 'your fragrances deserve more eyes', body: `Hey,

Came across Lussora — luxury perfume born in Delhi, that's fresh. Love the positioning.

We're Orange Matrix — content end to end. One team, no juggling. You focus on crafting the scents, we make sure people discover them.

theorangematrix.com

Free sample reel — no strings at all. If it resonates, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 14, company: 'Sunheri Flame', email: 'info@sunheriflame.com', subject: 'your candles deserve more eyes', body: `Hey,

Came across Sunheri Flame — handcrafted scented candles with real character. Love it.

We're Orange Matrix — content end to end. One team, no juggling. You focus on making beautiful candles, we make sure people find them.

theorangematrix.com

We'd love to make you a free sample reel — no strings at all. If it resonates, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 11, company: 'Silvooshine', email: 'care@silvooshine.com', subject: 'your silver deserves more eyes', body: `Hey,

Came across Silvooshine — 925 silver jewellery with that modern Indian edge. Nice range.

We're Orange Matrix — content end to end. One team, no juggling. You focus on designing beautiful pieces, we make sure people see them.

theorangematrix.com

Free sample reel — no strings at all. Resonates, we move forward. Doesn't, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
  { row: 15, company: 'Gharana Karigari Company', email: 'garvansh@batraventures.in', subject: 'your kurtis deserve more eyes', body: `Hey,

Came across Gharana Karigari — the ethnic sets are lovely. Real craft.

We're Orange Matrix — content end to end. One team, no juggling. You focus on the designs and growing the brand, we make sure more people discover it.

theorangematrix.com

We'd love to make you a free sample reel — no strings at all. If it resonates, cool. If not, still rooting for you.

Let us know?

Jinay
Orange Matrix` },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendAll() {
  let sent = 0;
  let failed = 0;
  const today = new Date().toISOString().split('T')[0];
  
  for (const lead of emails) {
    const gap = randomInt(10000, 30000); // 10-30 seconds
    console.log(`Sending to ${lead.company} (${lead.email})... [waiting ${Math.round(gap/1000)}s]`);
    
    if (sent > 0) {
      await sleep(gap);
    }
    
    try {
      const result = execFileSync(gog, [
        'gmail', 'send',
        '--to', lead.email,
        '--subject', lead.subject,
        '--body', lead.body,
        '--no-input'
      ], { encoding: 'utf8' });
      
      console.log(`✅ ${lead.company}: SENT (thread: ${result.trim()})`);
      sent++;
      
      // Log to Outreach Log
      const logValues = [[today, lead.company, 'Email', 'Outbound', 'Initial', lead.subject, `Draft #3 template with theorangematrix.com link`, 'Sent', '', 'Follow-up 1 on 2026-04-26', '2026-04-26', '']];
      try {
        execFileSync(gog, [
          'sheets', 'append', sheetId, 'Outreach Log!A:L',
          '--values-json', JSON.stringify(logValues),
          '--insert', 'INSERT_ROWS',
          '--no-input'
        ], { encoding: 'utf8' });
        console.log(`  Logged to Outreach Log`);
      } catch(e) {
        console.log(`  ⚠️ Log failed: ${e.message.substring(0, 80)}`);
      }
      
      // Update Status in Outbound tab
      try {
        execFileSync(gog, [
          'sheets', 'update', sheetId, `Outbound!O${lead.row}`, 
          '--values-json', JSON.stringify([['Contacted']]),
          '--input', 'USER_ENTERED',
          '--no-input'
        ], { encoding: 'utf8' });
        execFileSync(gog, [
          'sheets', 'update', sheetId, `Outbound!P${lead.row}`,
          '--values-json', JSON.stringify([[today]]),
          '--input', 'USER_ENTERED',
          '--no-input'
        ], { encoding: 'utf8' });
        console.log(`  Status updated to Contacted`);
      } catch(e) {
        console.log(`  ⚠️ Status update failed: ${e.message.substring(0, 80)}`);
      }
      
    } catch(e) {
      console.log(`❌ ${lead.company}: FAILED - ${e.message.substring(0, 150)}`);
      failed++;
    }
  }
  
  console.log(`\nDone! ${sent} sent, ${failed} failed out of ${emails.length} total.`);
}

sendAll();