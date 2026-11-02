const fs = require('fs');
const path = require('path');

const iconPath = path.resolve('src/assets/branding/messmates-logo-icon.png');
const wmGreenPath = path.resolve('src/assets/branding/messmates-wordmark-green.png');
const wmWhitePath = path.resolve('src/assets/branding/messmates-wordmark-white.png');

const iconBase64 = fs.readFileSync(iconPath).toString('base64');
const wmGreenBase64 = fs.readFileSync(wmGreenPath).toString('base64');
const wmWhiteBase64 = fs.readFileSync(wmWhitePath).toString('base64');

// 1. Favicon / Icon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${iconBase64}" width="512" height="512" />
</svg>`;

fs.writeFileSync('public/favicon.svg', faviconSvg);
fs.writeFileSync('src/assets/branding/messmates-icon.svg', faviconSvg);

// 2. Full Horizontal Logo Light SVG
const fullLogoLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 220" width="100%" height="100%">
  <!-- Official MessMates Logo: Cloche & Mates Icon + Distressed Brand Typography -->
  <g transform="translate(10, 15)">
    <image href="data:image/png;base64,${iconBase64}" width="190" height="190" />
  </g>
  <g transform="translate(230, 55)">
    <image href="data:image/png;base64,${wmGreenBase64}" width="660" height="110" />
  </g>
</svg>`;

fs.writeFileSync('src/assets/branding/messmates-logo-light.svg', fullLogoLightSvg);
fs.writeFileSync('public/messmates-logo.svg', fullLogoLightSvg);

// 3. Full Horizontal Logo Dark SVG
const fullLogoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 220" width="100%" height="100%">
  <!-- Official MessMates Logo: Cloche & Mates Icon + White Brand Typography -->
  <g transform="translate(10, 15)">
    <image href="data:image/png;base64,${iconBase64}" width="190" height="190" />
  </g>
  <g transform="translate(230, 55)">
    <image href="data:image/png;base64,${wmWhiteBase64}" width="660" height="110" />
  </g>
</svg>`;

fs.writeFileSync('src/assets/branding/messmates-logo-dark.svg', fullLogoDarkSvg);

console.log('All SVG assets generated successfully!');
