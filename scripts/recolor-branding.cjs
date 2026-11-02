const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconPath = 'C:/Users/Parth Sharma/.gemini/antigravity/brain/9eb6780c-8819-4623-bfc6-869cf5247e98/.user_uploaded/media_1793656326080_cc48a776.png';
const wordmarkPath = 'C:/Users/Parth Sharma/.gemini/antigravity/brain/9eb6780c-8819-4623-bfc6-869cf5247e98/.user_uploaded/media_1793656326080_7254536b.png';

async function recolorImage(inputPath, targetRGB, outputPath, scaleFactor = 4) {
  // targetRGB is [r, g, b]
  const img = sharp(inputPath);
  const meta = await img.metadata();
  
  // High quality upscale with Lanczos3 for crispness
  const upscaled = await img
    .resize(meta.width * scaleFactor, meta.height * scaleFactor, {
      kernel: 'lanczos3'
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = upscaled;
  const outData = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) {
      outData[i] = 0;
      outData[i + 1] = 0;
      outData[i + 2] = 0;
      outData[i + 3] = 0;
      continue;
    }

    // Preserve edge antialiasing: original alpha scaled
    outData[i] = targetRGB[0];
    outData[i + 1] = targetRGB[1];
    outData[i + 2] = targetRGB[2];
    outData[i + 3] = a;
  }

  await sharp(outData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

  console.log(`Generated: ${outputPath} (${info.width}x${info.height})`);
}

async function main() {
  const brandingDir = 'src/assets/branding';
  const publicDir = 'public';

  // Website theme emerald colors:
  // Primary emerald-600: [5, 150, 105] (#059669) - matches the exact brand buttons & headers
  // Dark mode emerald-400 / 500: [16, 185, 129] (#10b981) or [52, 211, 153] (#34d399)
  // Pure white for dark mode contrast: [255, 255, 255]
  const emerald600 = [5, 150, 105];   // #059669 - Website's main green
  const emerald500 = [16, 185, 129];  // #10b981 - Vibrant emerald
  const white = [255, 255, 255];      // #ffffff - Pure white

  // 1. Recolor Icon
  await recolorImage(iconPath, emerald600, path.join(brandingDir, 'messmates-logo-icon.png'), 4);
  await recolorImage(iconPath, emerald500, path.join(brandingDir, 'messmates-logo-icon-emerald.png'), 4);
  await recolorImage(iconPath, white, path.join(brandingDir, 'messmates-logo-icon-white.png'), 4);

  // 2. Recolor Wordmark
  await recolorImage(wordmarkPath, emerald600, path.join(brandingDir, 'messmates-wordmark-green.png'), 4);
  await recolorImage(wordmarkPath, emerald500, path.join(brandingDir, 'messmates-wordmark-emerald.png'), 4);
  await recolorImage(wordmarkPath, white, path.join(brandingDir, 'messmates-wordmark-white.png'), 4);

  // 3. Create Square Favicons & App Icons from the recolored icon
  const iconSource = path.join(brandingDir, 'messmates-logo-icon.png');
  const iconMeta = await sharp(iconSource).metadata();
  
  // Create padded square (512x512)
  const maxDim = Math.max(iconMeta.width, iconMeta.height);
  const padH = Math.round((maxDim - iconMeta.width) / 2) + 20;
  const padV = Math.round((maxDim - iconMeta.height) / 2) + 20;

  const squareIconBuffer = await sharp(iconSource)
    .extend({
      top: padV,
      bottom: padV,
      left: padH,
      right: padH,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  await sharp(squareIconBuffer).resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(squareIconBuffer).resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(squareIconBuffer).resize(64, 64).toFile(path.join(publicDir, 'favicon-64.png'));
  await sharp(squareIconBuffer).resize(32, 32).toFile(path.join(publicDir, 'favicon-32.png'));
  await sharp(squareIconBuffer).resize(32, 32).toFile(path.join(publicDir, 'favicon.png'));
  await sharp(squareIconBuffer).resize(512, 512).toFile(path.join(publicDir, 'messmates-icon.png'));

  // 4. Combined horizontal lockup (Icon + Wordmark side by side)
  const wmMeta = await sharp(path.join(brandingDir, 'messmates-wordmark-green.png')).metadata();
  const targetH = Math.round(wmMeta.height * 1.1); // Wordmark height ~316px, icon ~347px
  
  const scaledIconBuffer = await sharp(iconSource)
    .resize(null, targetH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  const scaledIconMeta = await sharp(scaledIconBuffer).metadata();

  const gap = Math.round(targetH * 0.18); // proportional gap between icon and wordmark
  const totalW = scaledIconMeta.width + gap + wmMeta.width;
  const totalH = Math.max(scaledIconMeta.height, wmMeta.height);

  // Light combined lockup (emerald-600)
  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: scaledIconBuffer, top: Math.round((totalH - scaledIconMeta.height) / 2), left: 0 },
    { input: path.join(brandingDir, 'messmates-wordmark-green.png'), top: Math.round((totalH - wmMeta.height) / 2), left: scaledIconMeta.width + gap }
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(brandingDir, 'messmates-full-logo-light.png'));

  // Dark combined lockup (emerald icon + white wordmark)
  const wmWhiteMeta = await sharp(path.join(brandingDir, 'messmates-wordmark-white.png')).metadata();
  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: scaledIconBuffer, top: Math.round((totalH - scaledIconMeta.height) / 2), left: 0 },
    { input: path.join(brandingDir, 'messmates-wordmark-white.png'), top: Math.round((totalH - wmWhiteMeta.height) / 2), left: scaledIconMeta.width + gap }
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(brandingDir, 'messmates-full-logo-dark.png'));

  // Copy light combined to public/messmates-logo.png
  await sharp(path.join(brandingDir, 'messmates-full-logo-light.png')).toFile(path.join(publicDir, 'messmates-logo.png'));

  // 5. Generate high-quality SVG favicon
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <defs>
    <linearGradient id="emGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <!-- Background rounded soft squircle -->
  <rect width="100" height="100" rx="24" fill="url(#emGrad)" />
  <!-- Embedded crisp icon in white -->
  <g transform="translate(14, 14) scale(0.66)" fill="#ffffff">
    <!-- Top Cloche Dome -->
    <path d="M 54.5 12 C 54.5 9.5 52.5 7.5 50 7.5 C 47.5 7.5 45.5 9.5 45.5 12 C 45.5 13.5 46.2 14.8 47.4 15.6 C 33.2 17.5 22.2 27.5 20.3 40.5 L 79.7 40.5 C 77.8 27.5 66.8 17.5 52.6 15.6 C 53.8 14.8 54.5 13.5 54.5 12 Z" />
    <path d="M 18 43.5 L 82 43.5 C 83.5 43.5 84.5 45 84 46.5 L 81 50 C 80.5 50.8 79.5 51.5 78.5 51.5 L 21.5 51.5 C 20.5 51.5 19.5 50.8 19 50 L 16 46.5 C 15.5 45 16.5 43.5 18 43.5 Z" />
    <!-- Left Wing with Fork Cutout -->
    <path d="M 5 28 L 5 95 C 5 97.8 7.2 100 10 100 L 46 100 C 47.5 100 48.8 99 49.5 97.5 C 51.5 93 51 82 45 68 C 39 54 44 42 47 38 L 47 36 C 45 34 32 28 5 28 Z M 27.5 54 C 28.5 54 29 55 29 56 L 29 70 C 29 73 27 75 25 76 L 25 90 C 25 91 24 92 23 92 C 22 92 21 91 21 90 L 21 76 C 19 75 17 73 17 70 L 17 56 C 17 55 17.5 54 18.5 54 C 19.5 54 20 55 20 56 L 20 66 L 21.5 66 L 21.5 56 C 21.5 55 22 54 23 54 C 24 54 24.5 55 24.5 56 L 24.5 66 L 26 66 L 26 56 C 26 55 26.5 54 27.5 54 Z" />
    <!-- Right Wing with Spoon Cutout -->
    <path d="M 95 28 L 95 95 C 95 97.8 92.8 100 90 100 L 54 100 C 52.5 100 51.2 99 50.5 97.5 C 48.5 93 49 82 55 68 C 61 54 56 42 53 38 L 53 36 C 55 34 68 28 95 28 Z M 73 54 C 77.5 54 81 59 81 65 C 81 70 78 74 75 75.5 L 75 90 C 75 91 74 92 73 92 C 72 92 71 91 71 90 L 71 75.5 C 68 74 65 70 65 65 C 65 59 68.5 54 73 54 Z" />
  </g>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon, 'utf8');

  console.log('All branding assets generated and synchronized with website emerald color!');
}

main().catch(console.error);
