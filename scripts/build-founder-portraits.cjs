const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processFounderPhotos() {
  const parthSrc = 'C:/Users/Parth Sharma/.gemini/antigravity/brain/9eb6780c-8819-4623-bfc6-869cf5247e98/.user_uploaded/media_1794334129110_f3222537.jpg';
  const shivSrc = 'C:/Users/Parth Sharma/.gemini/antigravity/brain/9eb6780c-8819-4623-bfc6-869cf5247e98/.user_uploaded/media_1794333247753_dbb73b2f.jpg';

  console.log('Processing founder photos with full torso & hands visible...');

  // Target aspect ratio: 3:4 (e.g. 1200 x 1600 or 1440 x 1920)
  // Target width 1200, target height 1600 (3:4 ratio)
  // For Parth: original 725 x 1024.
  // Crop vertically to capture from head (y ~ 50) down to hands & belt (y ~ 950).
  // 725 width x 966 height is 3:4 ratio!
  
  // Parth crop:
  // Let's take x=0, y=30, width=725, height=966 (3:4 ratio, includes hair, face, polo, crossed arms, hands!)
  const parthHighRes = await sharp(parthSrc)
    .extract({ left: 0, top: 30, width: 725, height: 966 })
    .resize(1200, 1600, {
      kernel: sharp.kernel.lanczos3
    })
    .sharpen({ sigma: 0.8, m1: 1.0, m2: 0.3 })
    .jpeg({ quality: 96 })
    .toBuffer();

  // Shivendra crop:
  // Original 728 x 1024.
  // 728 x 970 is 3:4 ratio. Top=25 captures hair down to crossed arms & hands!
  const shivHighRes = await sharp(shivSrc)
    .extract({ left: 0, top: 25, width: 728, height: 970 })
    .resize(1200, 1600, {
      kernel: sharp.kernel.lanczos3
    })
    .sharpen({ sigma: 0.8, m1: 1.0, m2: 0.3 })
    .jpeg({ quality: 96 })
    .toBuffer();

  // Save to public/founders
  const outDir = path.join(__dirname, '../public/founders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'parth_sharma.jpg'), parthHighRes);
  fs.writeFileSync(path.join(outDir, 'shivendra_pratap_singh.jpg'), shivHighRes);

  // Also update avatars
  const parthAvatar = await sharp(parthSrc)
    .extract({ left: 40, top: 50, width: 640, height: 800 })
    .resize(800, 1000, { kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 95 })
    .toBuffer();

  const shivAvatar = await sharp(shivSrc)
    .extract({ left: 40, top: 50, width: 640, height: 800 })
    .resize(800, 1000, { kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 95 })
    .toBuffer();

  fs.writeFileSync(path.join(outDir, 'parth_avatar_4k.jpg'), parthAvatar);
  fs.writeFileSync(path.join(outDir, 'shivendra_avatar_4k.jpg'), shivAvatar);

  console.log('✅ Successfully generated zoom-out executive founder portraits showing hands and full posture!');
}

processFounderPhotos().catch(err => {
  console.error('Error processing founder photos:', err);
  process.exit(1);
});
