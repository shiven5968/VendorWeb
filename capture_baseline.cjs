const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const edge = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
const dir = path.join(__dirname, 'baseline_screenshots');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const shots = [
  { name: 'baseline-desktop-landing.png', url: 'http://localhost:4173/', size: '1280,900' },
  { name: 'baseline-mobile-landing.png', url: 'http://localhost:4173/', size: '390,844' },
  { name: 'baseline-desktop-student-login.png', url: 'http://localhost:4173/student', size: '1280,900' },
  { name: 'baseline-mobile-student-login.png', url: 'http://localhost:4173/student', size: '390,844' },
  { name: 'baseline-desktop-warden-login.png', url: 'http://localhost:4173/warden', size: '1280,900' },
  { name: 'baseline-mobile-warden-login.png', url: 'http://localhost:4173/warden', size: '390,844' },
  { name: 'baseline-desktop-committee-login.png', url: 'http://localhost:4173/committee', size: '1280,900' }
];

for (const s of shots) {
  const outPath = path.join(dir, s.name);
  const cmd = `${edge} --headless=new --hide-scrollbars --window-size=${s.size} --screenshot="${outPath}" "${s.url}"`;
  console.log(`Capturing: ${s.name} from ${s.url} (${s.size})`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to capture ${s.name}:`, err.message);
  }
}

console.log('Finished capturing all baseline screenshots!');
