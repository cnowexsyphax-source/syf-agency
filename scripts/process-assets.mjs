// Builds logo variants from the official SYF AGENCY logo without altering shapes.
// Alpha is derived from the red channel (blue bg ≈ R0, white glyphs ≈ R245).
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = 'assets-src/syf-logo-original.jpg';
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const alphaAt = (x, y) => {
  const r = data[(y * W + x) * C];
  return Math.max(0, Math.min(255, Math.round(((r - 25) / (240 - 25)) * 255)));
};

function bbox(y0, y1) {
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) {
    if (alphaAt(x, y) > 128) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  return { minX, minY, maxX, maxY };
}

// skip the 4px top border artefact
const mark = bbox(6, 740);   // SYF / AGENCY lockup
const full = bbox(6, 840);   // including MARKETING DIGITAL tagline
console.log({ W, H, mark, full });

async function variant(box, rgb, out, pad = 6) {
  const x0 = Math.max(0, box.minX - pad), y0 = Math.max(0, box.minY - pad);
  const w = Math.min(W, box.maxX + pad) - x0, h = Math.min(H, box.maxY + pad) - y0;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    buf[i] = rgb[0]; buf[i + 1] = rgb[1]; buf[i + 2] = rgb[2];
    buf[i + 3] = alphaAt(x0 + x, y0 + y);
  }
  const img = sharp(buf, { raw: { width: w, height: h, channels: 4 } });
  await img.clone().png({ compressionLevel: 9 }).toFile(`public/logo/${out}.png`);
  await img.clone().webp({ quality: 92, alphaQuality: 100 }).toFile(`public/logo/${out}.webp`);
  return { w, h };
}

const sizes = {
  markLight: await variant(mark, [255, 255, 255], 'syf-mark-white'),
  markDark: await variant(mark, [6, 21, 46], 'syf-mark-night'),
  fullLight: await variant(full, [255, 255, 255], 'syf-full-white'),
  fullDark: await variant(full, [6, 21, 46], 'syf-full-night'),
};
fs.writeFileSync('public/logo/sizes.json', JSON.stringify(sizes, null, 2));

// Favicon / app icons: original logo on its blue square (no reshaping).
const orig = sharp(SRC).extract({ left: 0, top: 6, width: W, height: H - 6 }).resize(1024, 1024);
await orig.clone().resize(512, 512).png().toFile('public/icon-512.png');
await orig.clone().resize(192, 192).png().toFile('public/icon-192.png');
await orig.clone().resize(180, 180).png().toFile('public/apple-touch-icon.png');
await orig.clone().resize(48, 48).png().toFile('public/favicon-48.png');
await orig.clone().resize(32, 32).png().toFile('public/favicon-32.png');
console.log(sizes);

// Project screenshots → responsive WebP + AVIF
for (const [file, out, widths] of [
  ['assets-src/gourmet-desktop.png', 'gourmet-desktop', [960, 1600, 2400]],
  ['assets-src/gourmet-mobile.png', 'gourmet-mobile', [400, 780]],
]) {
  for (const w of widths) {
    await sharp(file).resize({ width: w }).webp({ quality: 80 }).toFile(`public/images/${out}-${w}.webp`);
    await sharp(file).resize({ width: w }).avif({ quality: 55 }).toFile(`public/images/${out}-${w}.avif`);
  }
}

// Open Graph image (1200x630): night background, official logo, slogan
const ogLogo = await sharp('public/logo/syf-full-white.png').resize({ width: 520 }).toBuffer();
const ogSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="g" cx="78%" cy="40%" r="60%"><stop offset="0" stop-color="#0750B5"/><stop offset="1" stop-color="#06152E" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="#080B12"/><rect width="1200" height="630" fill="url(#g)"/>
  <text x="80" y="520" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="44" fill="#FFFFFF" letter-spacing="1">WE BUILD DIGITAL EXPERIENCES.</text>
  <text x="80" y="566" font-family="Helvetica Neue, Arial, sans-serif" font-size="22" fill="#E8EDF5" fill-opacity="0.7" letter-spacing="4">ALGIERS, ALGERIA</text>
</svg>`);
await sharp(ogSvg).composite([{ input: ogLogo, left: 80, top: 90 }]).jpeg({ quality: 86 }).toFile('public/og-image.jpg');
console.log('images done');
