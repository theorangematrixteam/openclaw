const { execFileSync } = require('child_process');
const fs = require('fs');
const { randomInt } = require('crypto');

const { getComment } = require('./ig-comment-templates');

const handles = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-handles.json', 'utf8'));

// Skip BITCHN (already commented)
const remaining = handles.filter(h => h.handle !== 'bitchn.official');

console.log(`Commenting on ${remaining.length} leads...`);
console.log('Max 10 per batch to avoid rate limits\n');

const batch = remaining.slice(0, 10);

for (const lead of batch) {
  const comment = getComment(lead.company, lead.category);
  console.log(`\n${lead.company} (@${lead.handle}):`);
  console.log(`  "${comment}"`);
  
  const gap = randomInt(15000, 30000); // 15-30 second gap
  console.log(`  Waiting ${Math.round(gap/1000)}s...`);
  
  try {
    execFileSync('node', [
      'C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\ig-comment-stealth.js',
      lead.handle,
      comment
    ], { encoding: 'utf8', timeout: 60000 });
    console.log(`  ✅ Comment posted`);
  } catch(e) {
    console.log(`  ❌ Failed: ${e.message.substring(0, 100)}`);
  }
  
  if (batch.indexOf(lead) < batch.length - 1) {
    // Sleep between comments
    const start = Date.now();
    while (Date.now() - start < gap) {
      // Busy wait to keep process alive
    }
  }
}

console.log(`\nDone! Commented on ${batch.length} leads.`);
console.log(`${remaining.length - batch.length} remaining for next batch.`);
