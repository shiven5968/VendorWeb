const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const qrDir = path.join(__dirname, 'src', 'assets', 'qr');
const artifactDir = 'C:\\Users\\Parth Sharma\\.gemini\\antigravity\\brain\\9eb6780c-8819-4623-bfc6-869cf5247e98';

if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

// Production URL that students will scan on dining tables
// Opens directly into the live meal rating window
const targetUrl = 'https://messmates.tech/?action=rate';

async function generate() {
  console.log(`Generating QR code for: ${targetUrl}`);

  // 1. High Resolution PNG
  const pngPath = path.join(qrDir, 'messmates_rate_qr.png');
  await QRCode.toFile(pngPath, targetUrl, {
    width: 1024,
    margin: 2,
    color: {
      dark: '#064e3b', // Deep forest green
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });
  console.log(`Saved PNG QR code: ${pngPath}`);

  // 2. Scalable Vector SVG
  const svgPath = path.join(qrDir, 'messmates_rate_qr.svg');
  const svgString = await QRCode.toString(targetUrl, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#064e3b',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });
  fs.writeFileSync(svgPath, svgString);
  console.log(`Saved SVG QR code: ${svgPath}`);

  // 3. Base64 data URL for printable standee
  const dataUrl = await QRCode.toDataURL(targetUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: '#064e3b',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // 4. Create Printable Dining Table Standee HTML
  const standeeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MessMates — Live Meal Rating Scanner</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .standee-card {
      width: 380px;
      background: #ffffff;
      border-radius: 28px;
      padding: 32px 28px;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(6, 78, 59, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.2);
      border: 3px solid #10b981;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 900;
      color: #064e3b;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }
    .tagline {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #059669;
      background: #ecfdf5;
      padding: 4px 12px;
      border-radius: 999px;
      display: inline-block;
      margin-bottom: 20px;
    }
    .heading {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.25;
      margin-bottom: 6px;
    }
    .subtext {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .qr-container {
      background: #f8fafc;
      padding: 16px;
      border-radius: 24px;
      border: 2px dashed #cbd5e1;
      display: inline-block;
      margin-bottom: 20px;
    }
    .qr-img {
      width: 240px;
      height: 240px;
      display: block;
      border-radius: 12px;
    }
    .reward-pill {
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
      padding: 10px 18px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
      margin-bottom: 16px;
    }
    .footer-note {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
    }
    @media print {
      body { background: white; padding: 0; }
      .standee-card { box-shadow: none; border-width: 2px; }
    }
  </style>
</head>
<body>
  <div class="standee-card">
    <div class="brand">
      <span>🍽️ MESSMATES</span>
    </div>
    <br>
    <div class="tagline">Official Dining Hall Scanner</div>
    <h1 class="heading">How Was Your Meal?</h1>
    <p class="subtext">Scan with your phone to instantly rate today's live meal.</p>
    
    <div class="qr-container">
      <img src="${dataUrl}" alt="Scan to Rate Meal" class="qr-img">
    </div>

    <div class="reward-pill">
      <span>⭐</span>
      <span>Earn +1 Health Point per Review</span>
    </div>

    <p class="footer-note">Direct Live Rating Window • messmates.tech</p>
  </div>
</body>
</html>`;

  const standeePath = path.join(qrDir, 'messmates_table_rating_qr.html');
  fs.writeFileSync(standeePath, standeeHtml);
  console.log(`Saved Standee HTML: ${standeePath}`);

  // 5. Copy files to artifact dir for download/view
  fs.copyFileSync(pngPath, path.join(artifactDir, 'messmates_rate_qr.png'));
  fs.copyFileSync(svgPath, path.join(artifactDir, 'messmates_rate_qr.svg'));
  fs.copyFileSync(standeePath, path.join(artifactDir, 'messmates_table_rating_qr.html'));
  console.log('Copied all QR assets to artifact directory!');
}

generate().catch(console.error);
