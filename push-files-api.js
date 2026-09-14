const fs = require('fs');
const path = require('path');
const https = require('https');

// Read TOKEN from backend/.env
const envPath = path.join(__dirname, 'backend', '.env');
let TOKEN = process.env.GITHUB_TOKEN;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GITHUB_TOKEN=["']?([^"'\r\n]+)["']?/);
  if (match && match[1]) TOKEN = match[1].trim();
}

if (!TOKEN) {
  console.error('❌ GITHUB_TOKEN missing');
  process.exit(1);
}

const OWNER = 'lakshmidentalcare';
const REPO = 'lakshmi-dental-care-backend';

const FILES_TO_PUSH = [
  'frontend/src/utils/patientUtils.ts',
  'frontend/src/app/(dashboard)/patients/page.tsx',
  'frontend/src/app/(dashboard)/dashboard/page.tsx',
  'backend/src/patients/patients.service.ts',
  'frontend/src/app/(dashboard)/prescriptions/page.tsx',
  'frontend/src/app/api/sync/route.ts',
  'frontend/src/utils/cloudSync.ts',
  'frontend/src/app/(dashboard)/settings/page.tsx',
  'frontend/src/app/(dashboard)/doctors/page.tsx',
  'frontend/src/app/(dashboard)/reports/page.tsx',
  'frontend/src/app/(dashboard)/treatments/page.tsx',
  'frontend/src/app/(dashboard)/billing/page.tsx',
  'frontend/src/app/(dashboard)/appointments/page.tsx',
  'frontend/src/components/layout/Header.tsx',
  'frontend/src/components/layout/Sidebar.tsx',
  'frontend/src/lib/auth.ts'
];

async function getFileSha(filePath) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${filePath}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.sha || null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

async function uploadFile(filePath) {
  const absolutePath = path.join(__dirname, filePath);
  if (!fs.existsSync(absolutePath)) return;

  const content = fs.readFileSync(absolutePath, 'utf8');
  const contentBase64 = Buffer.from(content, 'utf8').toString('base64');
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    const sha = await getFileSha(filePath);

    let bodyObj = {
      message: `feat: update ${path.basename(filePath)} for 100% persistent cloud DB sync`,
      content: contentBase64,
      branch: 'main'
    };
    if (sha) bodyObj.sha = sha;

    const bodyData = JSON.stringify(bodyObj);

    const success = await new Promise((resolve) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${OWNER}/${REPO}/contents/${filePath}`,
        method: 'PUT',
        headers: {
          'User-Agent': 'Node.js',
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`✓ Updated ${filePath}`);
            resolve(true);
          } else {
            console.error(`Status ${res.statusCode} on attempt ${attempt} for ${filePath}`);
            resolve(false);
          }
        });
      });

      req.on('error', () => resolve(false));
      req.write(bodyData);
      req.end();
    });

    if (success) return;
    await new Promise(r => setTimeout(r, 600));
  }
  console.error(`❌ Failed ${filePath} after 3 attempts`);
}

async function main() {
  console.log('\n🚀 Starting GitHub REST API Push for persistent cloud DB sync...\n');
  for (const f of FILES_TO_PUSH) {
    await uploadFile(f);
  }
  console.log('\n✅ All files successfully pushed to GitHub!\n');
}

main();
