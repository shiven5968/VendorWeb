const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const BRANDING_DIR = path.join(ROOT, 'src/assets/branding');
const PUBLIC_DIR = path.join(ROOT, 'public');

const USER_WM_SRC = path.join(PUBLIC_DIR, 'messmates-logo.png');
const USER_ICON_SRC = path.join(PUBLIC_DIR, 'icon-192.png');
const HIGHRES_ICON_SRC = path.join(BRANDING_DIR, 'messmates-logo-icon-tight.png');

const BRAND_PINE = '#013e1d';
const BRAND_EMERALD = '#10b981';
const BRAND_WHITE = '#ffffff';

function marchingSquares(field, w, h, iso = 127.5) {
  const segs = [];
  const val = (x, y) => field[y * w + x];

  function interp(x1, y1, v1, x2, y2, v2) {
    const dv = v2 - v1;
    const t = Math.abs(dv) < 1e-6 ? 0.5 : (iso - v1) / dv;
    const tc = Math.max(0.001, Math.min(0.999, t));
    return [x1 + tc * (x2 - x1), y1 + tc * (y2 - y1)];
  }

  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const v0 = val(x, y);
      const v1 = val(x + 1, y);
      const v2 = val(x + 1, y + 1);
      const v3 = val(x, y + 1);

      const c = (v0 >= iso ? 8 : 0) | (v1 >= iso ? 4 : 0) | (v2 >= iso ? 2 : 0) | (v3 >= iso ? 1 : 0);
      if (c === 0 || c === 15) continue;

      const pt = (e) => {
        if (e === 0) return interp(x, y, v0, x + 1, y, v1);
        if (e === 1) return interp(x + 1, y, v1, x + 1, y + 1, v2);
        if (e === 2) return interp(x, y + 1, v3, x + 1, y + 1, v2);
        return interp(x, y, v0, x, y + 1, v3);
      };
      const key = (e) => {
        if (e === 0) return `h:${x},${y}`;
        if (e === 1) return `v:${x + 1},${y}`;
        if (e === 2) return `h:${x},${y + 1}`;
        return `v:${x},${y}`;
      };
      const addPair = (eA, eB) => {
        segs.push({ k1: key(eA), p1: pt(eA), k2: key(eB), p2: pt(eB) });
      };

      switch (c) {
        case 1:  addPair(3, 2); break;
        case 2:  addPair(2, 1); break;
        case 3:  addPair(3, 1); break;
        case 4:  addPair(0, 1); break;
        case 5: {
          const avg = (v0 + v1 + v2 + v3) * 0.25;
          if (avg >= iso) { addPair(3, 0); addPair(2, 1); }
          else            { addPair(3, 2); addPair(0, 1); }
          break;
        }
        case 6:  addPair(0, 2); break;
        case 7:  addPair(3, 0); break;
        case 8:  addPair(3, 0); break;
        case 9:  addPair(0, 2); break;
        case 10: {
          const avg = (v0 + v1 + v2 + v3) * 0.25;
          if (avg >= iso) { addPair(0, 1); addPair(3, 2); }
          else            { addPair(3, 0); addPair(2, 1); }
          break;
        }
        case 11: addPair(0, 1); break;
        case 12: addPair(3, 1); break;
        case 13: addPair(2, 1); break;
        case 14: addPair(3, 2); break;
      }
    }
  }

  const adj = new Map();
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (!adj.has(s.k1)) adj.set(s.k1, []);
    if (!adj.has(s.k2)) adj.set(s.k2, []);
    adj.get(s.k1).push(i);
    adj.get(s.k2).push(i);
  }

  const used = new Uint8Array(segs.length);
  const loops = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const pts = [segs[i].p1, segs[i].p2];
    const startKey = segs[i].k1;
    let curKey = segs[i].k2;

    while (curKey !== startKey) {
      const cand = adj.get(curKey);
      let nextIdx = -1;
      for (const idx of cand) {
        if (!used[idx]) { nextIdx = idx; break; }
      }
      if (nextIdx === -1) break;
      used[nextIdx] = 1;
      const ns = segs[nextIdx];
      if (ns.k1 === curKey) {
        pts.push(ns.p2);
        curKey = ns.k2;
      } else {
        pts.push(ns.p1);
        curKey = ns.k1;
      }
    }
    if (pts.length >= 3) loops.push(pts);
  }
  return loops;
}

function polyArea(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  }
  return a * 0.5;
}

function simplifyClosed(pts, eps) {
  if (pts.length <= 4) return pts;
  let i0 = 0, maxD = -1;
  const pStart = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pStart[0], dy = pts[i][1] - pStart[1];
    const d = dx * dx + dy * dy;
    if (d > maxD) { maxD = d; i0 = i; }
  }
  const chain1 = pts.slice(0, i0 + 1);
  const chain2 = pts.slice(i0).concat([pts[0]]);

  function dp(arr) {
    if (arr.length <= 2) return arr;
    const a = arr[0], b = arr[arr.length - 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    let maxDist = -1, idx = -1;
    for (let i = 1; i < arr.length - 1; i++) {
      const p = arr[i];
      const dist = len < 1e-9
        ? Math.hypot(p[0] - a[0], p[1] - a[1])
        : Math.abs(dy * (p[0] - a[0]) - dx * (p[1] - a[1])) / len;
      if (dist > maxDist) { maxDist = dist; idx = i; }
    }
    if (maxDist > eps) {
      return dp(arr.slice(0, idx + 1)).slice(0, -1).concat(dp(arr.slice(idx)));
    }
    return [a, b];
  }

  const out = dp(chain1).slice(0, -1).concat(dp(chain2).slice(0, -1));
  return out.length >= 3 ? out : pts;
}

function smoothNonCorners(pts, iterations = 2, cornerDeg = 38) {
  let cur = pts.map(p => [...p]);
  const n = cur.length;
  if (n < 5) return { pts: cur, isCorner: new Uint8Array(n).fill(1) };

  const isCorner = new Uint8Array(n);
  const cosThresh = Math.cos((cornerDeg * Math.PI) / 180);
  for (let i = 0; i < n; i++) {
    const prev = cur[(i - 1 + n) % n];
    const curr = cur[i];
    const next = cur[(i + 1) % n];
    const v1x = curr[0] - prev[0], v1y = curr[1] - prev[1];
    const v2x = next[0] - curr[0], v2y = next[1] - curr[1];
    const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
    if (l1 > 1e-6 && l2 > 1e-6) {
      if ((v1x * v2x + v1y * v2y) / (l1 * l2) < cosThresh) isCorner[i] = 1;
    }
  }

  for (let it = 0; it < iterations; it++) {
    cur = cur.map((p, i) => {
      if (isCorner[i]) return [...p];
      const prev = cur[(i - 1 + n) % n];
      const next = cur[(i + 1) % n];
      return [
        0.22 * prev[0] + 0.56 * p[0] + 0.22 * next[0],
        0.22 * prev[1] + 0.56 * p[1] + 0.22 * next[1]
      ];
    });
  }
  return { pts: cur, isCorner };
}

function loopToSvgPath(pts, isCorner, scale = 1, offX = 0, offY = 0, prec = 2) {
  const n = pts.length;
  if (n < 3) return '';
  const fx = (v) => Number(((v * scale) - offX).toFixed(prec));
  const fy = (v) => Number(((v * scale) - offY).toFixed(prec));
  const mid = (a, b) => [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5];

  let hasCorner = false;
  for (let i = 0; i < n; i++) if (isCorner[i]) { hasCorner = true; break; }

  if (!hasCorner) {
    const m0 = mid(pts[n - 1], pts[0]);
    let d = `M${fx(m0[0])} ${fy(m0[1])}`;
    for (let i = 0; i < n; i++) {
      const m = mid(pts[i], pts[(i + 1) % n]);
      d += `Q${fx(pts[i][0])} ${fy(pts[i][1])} ${fx(m[0])} ${fy(m[1])}`;
    }
    return d + 'Z';
  }

  let startIdx = 0;
  for (let i = 0; i < n; i++) if (isCorner[i]) { startIdx = i; break; }

  let d = `M${fx(pts[startIdx][0])} ${fy(pts[startIdx][1])}`;
  for (let k = 1; k <= n; k++) {
    const idx = (startIdx + k) % n;
    const prev = pts[(idx - 1 + n) % n];
    const curr = pts[idx];
    const next = pts[(idx + 1) % n];

    if (isCorner[idx]) {
      d += `L${fx(curr[0])} ${fy(curr[1])}`;
    } else {
      if (isCorner[(idx - 1 + n) % n]) {
        const mIn = mid(prev, curr);
        d += `L${fx(mIn[0])} ${fy(mIn[1])}`;
      }
      const mOut = mid(curr, next);
      d += `Q${fx(curr[0])} ${fy(curr[1])} ${fx(mOut[0])} ${fy(mOut[1])}`;
    }
  }
  return d + 'Z';
}

function measureLoops(processed, scale) {
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const { pts } of processed) {
    for (const [x, y] of pts) {
      const sx = x * scale, sy = y * scale;
      if (sx < minX) minX = sx;
      if (sy < minY) minY = sy;
      if (sx > maxX) maxX = sx;
      if (sy > maxY) maxY = sy;
    }
  }
  return { minX, minY, maxX, maxY };
}

async function traceIconVector() {
  const src = fs.existsSync(HIGHRES_ICON_SRC) ? HIGHRES_ICON_SRC : USER_ICON_SRC;
  const step1 = await sharp(src).trim().ensureAlpha().png().toBuffer();
  const { data, info } = await sharp(step1)
    .extend({ top: 6, bottom: 6, left: 6, right: 6, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width, h = info.height;
  const field = new Uint8Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i], b = data[i + 2], a = data[i + 3];
    if (a === 0) { field[p] = 0; continue; }
    let cutCoverage = 255;
    if (r > 6 || b > 34) {
      const t = (r - 1) / (217 - 1);
      cutCoverage = Math.max(0, Math.min(255, Math.round((1 - t) * 255)));
    }
    field[p] = Math.min(a, cutCoverage);
  }

  const loops = marchingSquares(field, w, h, 127.5);
  const processed = [];
  for (const loop of loops) {
    if (Math.abs(polyArea(loop)) < 25) continue;
    const simp = simplifyClosed(loop, 0.45);
    processed.push(smoothNonCorners(simp, 2, 36));
  }
  const { minX, minY, maxX, maxY } = measureLoops(processed, 1);
  const vbW = Number((maxX - minX).toFixed(2));
  const vbH = Number((maxY - minY).toFixed(2));
  const d = processed.map(({ pts, isCorner }) => loopToSvgPath(pts, isCorner, 1, minX, minY, 2)).join(' ');
  return { d, width: vbW, height: vbH };
}

async function traceWordmarkVector() {
  const src = fs.existsSync(USER_WM_SRC)
    ? USER_WM_SRC
    : path.join(BRANDING_DIR, 'messmates-wordmark-green.png');

  const pad = 6;
  const trimmedPng = await sharp(src).trim().ensureAlpha().png().toBuffer();
  const paddedPng = await sharp(trimmedPng)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true });

  const scale = 6;
  const targetW = paddedPng.info.width * scale;
  const targetH = paddedPng.info.height * scale;

  const { data: field, info } = await sharp(paddedPng.data)
    .extractChannel('alpha')
    .toColourspace('b-w')
    .resize(targetW, targetH, { kernel: sharp.kernel.mitchell, fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const outerLoops = marchingSquares(field, info.width, info.height, 126);
  const processed = [];
  for (const loop of outerLoops) {
    const area = Math.abs(polyArea(loop));
    if (area < 900) continue;
    const simp = simplifyClosed(loop, 1.05);
    processed.push(smoothNonCorners(simp, 2, 38));
  }

  const detailLoops = marchingSquares(field, info.width, info.height, 170);
  for (const loop of detailLoops) {
    const area = Math.abs(polyArea(loop));
    if (area >= 850 || area < 16) continue;
    const simp = simplifyClosed(loop, 0.7);
    processed.push(smoothNonCorners(simp, 1, 52));
  }

  const { minX, minY, maxX, maxY } = measureLoops(processed, 1 / scale);
  const vbW = Number((maxX - minX).toFixed(2));
  const vbH = Number((maxY - minY).toFixed(2));
  const d = processed.map(({ pts, isCorner }) => loopToSvgPath(pts, isCorner, 1 / scale, minX, minY, 2)).join(' ');
  return { d, width: vbW, height: vbH };
}

function makeStandaloneSvg(d, width, height, fill) {
  // Normalize intrinsic pixel size (height=240) while preserving exact viewBox coordinates so max-h/max-w CSS never under-sizes or squishes
  const outH = 240;
  const outW = Number(((width / height) * outH).toFixed(2));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${outW}" height="${outH}" fill="none">
  <path fill="${fill}" fill-rule="evenodd" d="${d}" />
</svg>`;
}

function makeLockupSvg(iconVec, wmVec, iconFill, wmFill) {
  // Proportional horizontal lockup
  const targetH = 240;
  const iconH = 212;
  const iconScale = iconH / iconVec.height;
  const iconW = iconVec.width * iconScale;
  const wmH = 162;
  const wmScale = wmH / wmVec.height;
  const wmW = wmVec.width * wmScale;
  const gap = 48;
  const padX = 4;
  const totalW = Number((padX * 2 + iconW + gap + wmW).toFixed(2));
  const iconY = Number(((targetH - iconH) / 2).toFixed(2));
  const wmY = Number(((targetH - wmH) / 2 + 2).toFixed(2));
  const wmX = Number((padX + iconW + gap).toFixed(2));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${targetH}" width="${totalW}" height="${targetH}" fill="none">
  <g transform="translate(${padX}, ${iconY}) scale(${iconScale.toFixed(6)})">
    <path fill="${iconFill}" fill-rule="evenodd" d="${iconVec.d}" />
  </g>
  <g transform="translate(${wmX}, ${wmY}) scale(${wmScale.toFixed(6)})">
    <path fill="${wmFill}" fill-rule="evenodd" d="${wmVec.d}" />
  </g>
</svg>`;
}

function makeFaviconSvg(iconVec) {
  // Crisp white rounded squircle badge with authentic #013e1d vector icon (readable on both light & dark browser tabs)
  const size = 100;
  const inner = 72;
  const s = inner / Math.max(iconVec.width, iconVec.height);
  const w = iconVec.width * s;
  const h = iconVec.height * s;
  const ox = Number(((size - w) / 2).toFixed(2));
  const oy = Number(((size - h) / 2).toFixed(2));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" fill="none">
  <rect x="2" y="2" width="96" height="96" rx="22" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
  <g transform="translate(${ox}, ${oy}) scale(${s.toFixed(6)})">
    <path fill="${BRAND_PINE}" fill-rule="evenodd" d="${iconVec.d}" />
  </g>
</svg>`;
}

async function rasterizeSvg(svgStr, outPath, targetWidth, background = null) {
  // Replace root width/height in SVG string with high-DPI target dimensions for razor-sharp librsvg rendering
  const matchW = svgStr.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const vbW = parseFloat(matchW[1]);
  const vbH = parseFloat(matchW[2]);
  const targetHeight = Math.max(1, Math.round((vbH / vbW) * targetWidth));

  const scaledSvg = svgStr
    .replace(/width="[\d.]+"/, `width="${targetWidth}"`)
    .replace(/height="[\d.]+"/, `height="${targetHeight}"`);

  let img = sharp(Buffer.from(scaledSvg));
  if (background) {
    img = img.flatten({ background });
  }
  await img.png({ compressionLevel: 9 }).toFile(outPath);
}

async function main() {
  fs.mkdirSync(BRANDING_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  console.log('Tracing pure vector contours from original MessMates assets...');
  const iconVec = await traceIconVector();
  const wmVec = await traceWordmarkVector();

  // 1. Standalone Pure Vector SVGs
  const iconPineSvg = makeStandaloneSvg(iconVec.d, iconVec.width, iconVec.height, BRAND_PINE);
  const iconEmeraldSvg = makeStandaloneSvg(iconVec.d, iconVec.width, iconVec.height, BRAND_EMERALD);
  const iconWhiteSvg = makeStandaloneSvg(iconVec.d, iconVec.width, iconVec.height, BRAND_WHITE);

  const wmPineSvg = makeStandaloneSvg(wmVec.d, wmVec.width, wmVec.height, BRAND_PINE);
  const wmEmeraldSvg = makeStandaloneSvg(wmVec.d, wmVec.width, wmVec.height, BRAND_EMERALD);
  const wmWhiteSvg = makeStandaloneSvg(wmVec.d, wmVec.width, wmVec.height, BRAND_WHITE);

  // 2. Horizontal Pure Vector Lockup SVGs
  const lockupLightSvg = makeLockupSvg(iconVec, wmVec, BRAND_PINE, BRAND_PINE);
  const lockupDarkSvg = makeLockupSvg(iconVec, wmVec, BRAND_EMERALD, BRAND_WHITE);
  const faviconSvg = makeFaviconSvg(iconVec);

  fs.writeFileSync(path.join(BRANDING_DIR, 'messmates-icon.svg'), iconPineSvg);
  fs.writeFileSync(path.join(BRANDING_DIR, 'messmates-icon-emerald.svg'), iconEmeraldSvg);
  fs.writeFileSync(path.join(BRANDING_DIR, 'messmates-icon-white.svg'), iconWhiteSvg);
  fs.writeFileSync(path.join(BRANDING_DIR, 'messmates-wordmark-green.svg'), wmPineSvg);
  fs.writeFileSync(path.join(BRANDING_DIR, 'messmates-wordmark-emerald.svg'), wmEmeraldSvg);
  fs.writeFileSync(path.join(BRANDING_DIR, 'messmates-wordmark-white.svg'), wmWhiteSvg);
  fs.writeFileSync(path.join(BRANDING_DIR, 'messmates-logo-light.svg'), lockupLightSvg);
  fs.writeFileSync(path.join(BRANDING_DIR, 'messmates-logo-dark.svg'), lockupDarkSvg);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'messmates-logo.svg'), lockupLightSvg);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), faviconSvg);

  // 3. Vector-Rasterized 4K PNGs (razor sharp edges with zero upscaled pixel artifacts!)
  await rasterizeSvg(iconPineSvg, path.join(BRANDING_DIR, 'messmates-logo-icon.png'), 1024);
  await rasterizeSvg(iconEmeraldSvg, path.join(BRANDING_DIR, 'messmates-logo-icon-emerald.png'), 1024);
  await rasterizeSvg(iconWhiteSvg, path.join(BRANDING_DIR, 'messmates-logo-icon-white.png'), 1024);

  await rasterizeSvg(wmPineSvg, path.join(BRANDING_DIR, 'messmates-wordmark-green.png'), 2400);
  await rasterizeSvg(wmEmeraldSvg, path.join(BRANDING_DIR, 'messmates-wordmark-emerald.png'), 2400);
  await rasterizeSvg(wmWhiteSvg, path.join(BRANDING_DIR, 'messmates-wordmark-white.png'), 2400);

  await rasterizeSvg(lockupLightSvg, path.join(BRANDING_DIR, 'messmates-full-logo-light.png'), 2800);
  await rasterizeSvg(lockupDarkSvg, path.join(BRANDING_DIR, 'messmates-full-logo-dark.png'), 2800);

  // 4. Public / PWA / Favicon PNGs
  await rasterizeSvg(lockupLightSvg, path.join(PUBLIC_DIR, 'messmates-logo.png'), 2800);
  await rasterizeSvg(iconPineSvg, path.join(PUBLIC_DIR, 'messmates-logo-icon.png'), 1024);

  // Square transparent 1024x1024 icon
  const sqTransparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1024" height="1024" fill="none">
    <g transform="translate(${((100 - 82) / 2).toFixed(2)}, ${((100 - (82 * iconVec.height / iconVec.width)) / 2).toFixed(2)}) scale(${(82 / iconVec.width).toFixed(6)})">
      <path fill="${BRAND_PINE}" fill-rule="evenodd" d="${iconVec.d}" />
    </g>
  </svg>`;
  await sharp(Buffer.from(sqTransparentSvg)).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC_DIR, 'messmates-icon.png'));

  // Crisp favicons & PWA icons
  await rasterizeSvg(faviconSvg, path.join(PUBLIC_DIR, 'favicon-32.png'), 32);
  await rasterizeSvg(faviconSvg, path.join(PUBLIC_DIR, 'favicon-64.png'), 64);
  await rasterizeSvg(faviconSvg, path.join(PUBLIC_DIR, 'favicon.png'), 64);

  // Solid white background for Android/iOS touch icons (prevents black background on apple-touch-icon)
  await rasterizeSvg(faviconSvg, path.join(PUBLIC_DIR, 'icon-192.png'), 192, { r: 255, g: 255, b: 255 });
  await rasterizeSvg(faviconSvg, path.join(PUBLIC_DIR, 'icon-512.png'), 512, { r: 255, g: 255, b: 255 });

  console.log('Generated all pure vector SVGs and 4K vector-rasterized PNGs successfully!');
}

main().catch((err) => {
  console.error('Error building authentic logos:', err);
  process.exit(1);
});
