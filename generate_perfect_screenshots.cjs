const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const debugPort = 9222;
const dir = path.join(__dirname, 'new_screenshots');
const artifactDir = 'C:\\Users\\Parth Sharma\\.gemini\\antigravity\\brain\\9eb6780c-8819-4623-bfc6-869cf5247e98';

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const edge = spawn(edgePath, [
    '--headless=new',
    '--hide-scrollbars',
    `--remote-debugging-port=${debugPort}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await sleep(1200);
  const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
  let target = targets.find(t => t.type === 'page');
  if (!target) {
    target = await fetchJson(`http://127.0.0.1:${debugPort}/json/new?about:blank`);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let idCounter = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise(r => {
      const id = idCounter++;
      callbacks.set(id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  const shots = [
    {
      name: 'new-desktop-college-search.png',
      url: 'http://localhost:4173/',
      width: 1280,
      height: 900,
      mobile: false,
      clearStorage: true
    },
    {
      name: 'new-mobile-college-search.png',
      url: 'http://localhost:4173/',
      width: 390,
      height: 844,
      mobile: true,
      clearStorage: true
    },
    {
      name: 'new-desktop-pending-college.png',
      url: 'http://localhost:4173/?college=mmmut',
      width: 1280,
      height: 900,
      mobile: false
    },
    {
      name: 'new-desktop-abes-landing.png',
      url: 'http://localhost:4173/?college=abes_ec',
      width: 1280,
      height: 900,
      mobile: false
    },
    {
      name: 'new-desktop-abes-login.png',
      url: 'http://localhost:4173/student',
      width: 1280,
      height: 900,
      mobile: false
    },
    {
      name: 'new-mobile-abes-login.png',
      url: 'http://localhost:4173/student',
      width: 390,
      height: 844,
      mobile: true
    }
  ];

  for (const s of shots) {
    console.log(`Setting viewport: ${s.width}x${s.height} (mobile=${s.mobile})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: s.width,
      height: s.height,
      deviceScaleFactor: 1,
      mobile: s.mobile
    });

    console.log(`Navigating to ${s.url}...`);
    await send('Page.navigate', { url: s.url });

    // Wait for page hydration
    for (let i = 0; i < 25; i++) {
      await sleep(200);
      const evalCheck = await send('Runtime.evaluate', {
        expression: `(function() {
          const loading = document.body && document.body.innerText.includes('Loading your session');
          const hasMain = document.querySelector('h1, h2, h3, button, input');
          return !loading && !!hasMain;
        })()`
      });
      if (evalCheck?.result?.result?.value === true) break;
    }
    await sleep(400);

    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shotRes.result.data, 'base64');
    
    // Save to new_screenshots
    const localPath = path.join(dir, s.name);
    fs.writeFileSync(localPath, buffer);

    // Save copy to artifact directory
    const artifactPath = path.join(artifactDir, s.name);
    fs.writeFileSync(artifactPath, buffer);

    console.log(`Captured ${s.name}: ${buffer.length} bytes`);
  }

  ws.close();
  edge.kill();
  console.log('ALL SCREENSHOTS CAPTURED AND SAVED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
