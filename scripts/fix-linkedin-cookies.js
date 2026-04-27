const fs = require('fs');

// Fix LinkedIn cookie sameSite values for Playwright compatibility
const cookies = JSON.parse(fs.readFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\linkedin-cookies.json', 'utf8'));

for (const cookie of cookies) {
  // Fix sameSite values
  if (cookie.sameSite === 'unspecified') cookie.sameSite = 'Lax';
  if (cookie.sameSite === 'no_restriction') cookie.sameSite = 'None';
}

fs.writeFileSync('C:\\Users\\openclaw.BILLION-DOLLAR-\\.openclaw\\workspace\\scripts\\linkedin-cookies.json', JSON.stringify(cookies, null, 2));
console.log('Cookies fixed:', cookies.length);
