// Push complete Monorepo to https://github.com/lakshmidentalcare/lakshmidentalcare.github.io.git
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, 'backend', '.env');
let TOKEN = process.env.GITHUB_TOKEN;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GITHUB_TOKEN=["']?([^"'\r\n]+)["']?/);
  if (match && match[1]) {
    TOKEN = match[1].trim();
  }
}

if (!TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN not found in backend/.env');
  process.exit(1);
}

const git = require('./backend/node_modules/isomorphic-git');
const http = require('./backend/node_modules/isomorphic-git/http/node');

const dir = path.resolve('c:/Users/barat/OneDrive/Pictures/lakshmi-dental-care');
const TARGET_REMOTE_URL = 'https://github.com/lakshmidentalcare/lakshmidentalcare.github.io.git';

const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', '.git', 'scratch'];
const EXCLUDE_FILES = ['.env', '.env.local', 'github-push-all.js', 'push-to-root-github-io.js', 'github-push.js', 'cloudflared.exe', 'LAST-PUBLIC-URL.txt', 'ldc-deploy.zip', 'compress_logo.ps1', 'push-logo-api.js'];

function walkDir(baseDir, relDir = '') {
  const results = [];
  const full = path.join(baseDir, relDir);
  if (!fs.existsSync(full)) return results;
  const entries = fs.readdirSync(full, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
    if (EXCLUDE_DIRS.includes(entry.name)) continue;
    if (EXCLUDE_FILES.includes(entry.name)) continue;
    if (entry.name === 'logo.png' && relDir === '') continue;

    if (entry.isDirectory()) {
      results.push(...walkDir(baseDir, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

const customHttp = {
  request: (options) => {
    options.timeout = 180000;
    return http.request(options);
  }
};

async function main() {
  console.log(`\n🚀 Pushing to root user GitHub Pages repo (${TARGET_REMOTE_URL})...\n`);

  const gitDir = path.join(dir, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  console.log('Initializing git repository...');
  await git.init({ fs, dir, defaultBranch: 'main' });

  await git.setConfig({ fs, dir, path: 'user.name', value: 'Lakshmi Dental Care' });
  await git.setConfig({ fs, dir, path: 'user.email', value: 'admin@lakshmidental.com' });

  console.log('\nStaging clean files...');
  const files = walkDir(dir);
  let totalFiles = 0;
  for (const f of files) {
    await git.add({ fs, dir, filepath: f.replace(/\\/g, '/') });
    totalFiles++;
    if (totalFiles % 20 === 0) process.stdout.write('.');
  }
  console.log(`\n✓ Staged ${totalFiles} clean files`);

  console.log('\nCreating commit...');
  const sha = await git.commit({
    fs,
    dir,
    message: 'feat: deploy Lakshmi Dental Care OS to root https://lakshmidentalcare.github.io',
    author: {
      name: 'Lakshmi Dental Care',
      email: 'admin@lakshmidental.com',
    },
  });
  console.log(`✓ Committed: ${sha.slice(0, 8)}`);

  console.log('\nSetting remote...');
  try {
    await git.addRemote({ fs, dir, remote: 'origin', url: TARGET_REMOTE_URL });
  } catch {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
    await git.addRemote({ fs, dir, remote: 'origin', url: TARGET_REMOTE_URL });
  }

  console.log('\nPushing to GitHub...');
  await git.push({
    fs,
    http: customHttp,
    dir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({ username: TOKEN, password: 'x-oauth-basic' }),
    onProgress: (evt) => {
      if (evt.phase) process.stdout.write(`\r  ${evt.phase} ${evt.loaded || ''}/${evt.total || ''}   `);
    }
  });

  console.log('\n\n✅ Successfully pushed to lakshmidentalcare.github.io!');
}

main().catch(err => {
  console.error('\n❌ Push failed:', err.message);
  process.exit(1);
});
