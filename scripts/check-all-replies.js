const { execFileSync } = require('child_process');

console.log('=== Checking All Replies ===\n');

// Check Gmail replies
console.log('1. Checking Gmail for email replies...');
try {
  execFileSync('node', ['C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\check-gmail-replies.js'], { 
    encoding: 'utf8', 
    timeout: 30000,
    stdio: 'inherit'
  });
} catch(e) {
  console.log('Gmail check failed:', e.message.substring(0, 100));
}

console.log('\n2. Checking Instagram for comment replies...');
try {
  execFileSync('node', ['C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\check-ig-replies.js'], { 
    encoding: 'utf8', 
    timeout: 30000,
    stdio: 'inherit'
  });
} catch(e) {
  console.log('IG check failed:', e.message.substring(0, 100));
}

console.log('\n=== Done ===');
console.log('Run this script every few hours to catch replies');
