// Use curl equivalent via PowerShell
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const BUFFER_TOKEN = process.env.BUFFER_API_TOKEN;

const query = `query { account { email } }`;

async function testBuffer() {
  console.log('Testing Buffer API via curl...\n');
  
  // Use curl from PowerShell
  const curlCmd = `curl -s -X POST "https://api.buffer.com" -H "Content-Type: application/json" -H "Authorization: Bearer ${BUFFER_TOKEN}" -d '{\"query\": \"query { account { email } }\"}'`;
  
  try {
    const { stdout, stderr } = await execPromise(`powershell -Command "${curlCmd.replace(/"/g, '\\"')}"`);
    console.log('Response:', stdout);
    if (stderr) console.log('Stderr:', stderr);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBuffer();