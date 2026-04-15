const https = require('https');

const BUFFER_TOKEN = process.env.BUFFER_API_TOKEN;

const query = `
  query {
    account {
      email
      organizations {
        id
        name
        channels {
          id
          name
          service
          serviceUsername
        }
      }
    }
  }
`;

const body = JSON.stringify({ query });

const options = {
  hostname: 'api.buffer.com',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${BUFFER_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

console.log('Testing Buffer API...\n');
console.log('Endpoint: https://api.buffer.com');
console.log('Query:', query.trim());
console.log('\nSending request...\n');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    console.log('\nBody:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(body);
req.end();