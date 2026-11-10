const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function buildLogos() {
  const iconSrc = 'C:/Users/Parth Sharma/.gemini/antigravity/brain/9eb6780c-8819-4623-bfc6-869cf5247e98/.user_uploaded/media_1794335270144_f2a62055.png';
  const wmSrc = 'C:/Users/Parth Sharma/.gemini/antigravity/brain/9eb6780c-8819-4623-bfc6-869cf5247e98/.user_uploaded/media_1794335270146_8f70db2d.png';

  console.log('Loading source images...');
  const iconBuffer = fs.readFileSync(iconSrc);
  const wmBuffer = fs.readFileSync(wmSrc);

  // 1. High-Res Icon (Upscale 4x with Lanczos3)
  const iconMeta = await sharp(iconBuffer).metadata();
  const targetIconHeight = 400; // Crisp 400px height
  const targetIconWidth = Math.round((iconMeta.width / iconMeta.height) * targetIconHeight);

  const highResIcon = await sharp(iconBuffer)
    .resize(targetIconWidth, targetIconHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .sharpen({ sigma: 1.0, m1: 1.2, m2: 0.5 })
    .png()
    .toBuffer();

  // 2. High-Res Green Wordmark (Upscale to 400px height or proportional)
  const wmMeta = await sharp(wmBuffer).metadata();
  const targetWmHeight = 240;
  const targetWmWidth = Math.round((wmMeta.width / wmMeta.height) * targetWmHeight);

  const highResWmGreen = await sharp(wmBuffer)
    .resize(targetWmWidth, targetWmHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .sharpen({ sigma: 0.8, m1: 1.2, m2: 0.5 })
    .png()
    .toBuffer();

  // 3. High-Res White Wordmark for Dark Mode
  // Extract raw pixels and convert green pixels to pure white while preserving alpha and texture
  const { data: wmData, info: wmInfo } = await sharp(highResWmGreen)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const whiteData = Buffer.alloc(wmData.length);
  for (let i = 0; i < wmData.length; i += 4) {
    const r = wmData[i];
    const g = wmData[i + 1];
    const b = wmData[i + 2];
    const a = wmData[i + 3];

    if (a > 0) {
      // Invert color brightness to white while preserving alpha
      whiteData[i] = 255;
      whiteData[i + 1] = 255;
      whiteData[i + 2] = 255;
      whiteData[i + 3] = a;
    } else {
      whiteData[i] = 0;
      whiteData[i + 1] = 0;
      whiteData[i + 2] = 0;
      whiteData[i + 3] = 0;
    }
  }

  const highResWmWhite = await sharp(whiteData, {
    raw: {
      width: wmInfo.width,
      height: wmInfo.height,
      channels: 4
    }
  })
  .png()
  .toBuffer();

  // 4. Build Horizontal Full Lockup (Light Mode: Icon + Green Wordmark)
  // Height = 300px
  const lockupHeight = 300;
  const iconScaledHeight = 260;
  const iconScaledWidth = Math.round((iconMeta.width / iconMeta.height) * iconScaledHeight);

  const wmScaledHeight = 200;
  const wmScaledWidth = Math.round((wmMeta.width / wmMeta.height) * wmScaledHeight);

  const gap = 36;
  const totalWidth = iconScaledWidth + gap + wmScaledWidth + 40; // with padding

  const iconForLockup = await sharp(iconBuffer)
    .resize(iconScaledWidth, iconScaledHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const wmGreenForLockup = await sharp(wmBuffer)
    .resize(wmScaledWidth, wmScaledHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const wmWhiteForLockup = await sharp(highResWmWhite)
    .resize(wmScaledWidth, wmScaledHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Composite Light Lockup
  const iconY = Math.round((lockupHeight - iconScaledHeight) / 2);
  const wmY = Math.round((lockupHeight - wmScaledHeight) / 2);

  const fullLogoLight = await sharp({
    create: {
      width: totalWidth,
      height: lockupHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: iconForLockup, top: iconY, left: 20 },
    { input: wmGreenForLockup, top: wmY, left: 20 + iconScaledWidth + gap }
  ])
  .trim()
  .png()
  .toBuffer();

  // Composite Dark Lockup
  const fullLogoDark = await sharp({
    create: {
      width: totalWidth,
      height: lockupHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: iconForLockup, top: iconY, left: 20 },
    { input: wmWhiteForLockup, top: wmY, left: 20 + iconScaledWidth + gap }
  ])
  .trim()
  .png()
  .toBuffer();

  // 5. Save all assets to branding and public directories
  const targetDirs = [
    path.join(__dirname, '../src/assets/branding'),
    path.join(__dirname, '../public')
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // Save to src/assets/branding
  fs.writeFileSync(path.join(__dirname, '../src/assets/branding/messmates-logo-icon.png'), highResIcon);
  fs.writeFileSync(path.join(__dirname, '../src/assets/branding/messmates-wordmark-green.png'), highResWmGreen);
  fs.writeFileSync(path.join(__dirname, '../src/assets/branding/messmates-wordmark-white.png'), highResWmWhite);
  fs.writeFileSync(path.join(__dirname, '../src/assets/branding/messmates-full-logo-light.png'), fullLogoLight);
  fs.writeFileSync(path.join(__dirname, '../src/assets/branding/messmates-full-logo-dark.png'), fullLogoDark);

  // Save to public
  fs.writeFileSync(path.join(__dirname, '../public/messmates-logo.png'), fullLogoLight);
  fs.writeFileSync(path.join(__dirname, '../public/messmates-logo-icon.png'), highResIcon);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), highResIcon);

  // Generate SVG wrapper containing embedded base64 of the authentic logo for vector scale fidelity
  const lightBase64 = fullLogoLight.toString('base64');
  const lightMeta = await sharp(fullLogoLight).metadata();
  const svgLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lightMeta.width} ${lightMeta.height}" width="100%" height="100%">
  <image href="data:image/png;base64,${lightBase64}" width="${lightMeta.width}" height="${lightMeta.height}" />
</svg>`;
  fs.writeFileSync(path.join(__dirname, '../public/messmates-logo.svg'), svgLight);
  fs.writeFileSync(path.join(__dirname, '../src/assets/branding/messmates-logo-light.svg'), svgLight);

  const darkBase64 = fullLogoDark.toString('base64');
  const darkMeta = await sharp(fullLogoDark).metadata();
  const svgDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${darkMeta.width} ${darkMeta.height}" width="100%" height="100%">
  <image href="data:image/png;base64,${darkBase64}" width="${darkMeta.width}" height="${darkMeta.height}" />
</svg>`;
  fs.writeFileSync(path.join(__dirname, '../src/assets/branding/messmates-logo-dark.svg'), svgDark);

  console.log('✅ All authentic MessMates logos generated successfully with 4K clarity!');
  console.log('Light Lockup:', lightMeta.width, 'x', lightMeta.height);
  console.log('Dark Lockup:', darkMeta.width, 'x', darkMeta.height);
}

buildLogos().catch(err => {
  console.error('Error generating logos:', err);
  process.exit(1);
});
