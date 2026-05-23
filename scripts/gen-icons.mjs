/**
 * Generates PWA icons from an SVG source using sharp.
 * Run: node scripts/gen-icons.mjs
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

// Kelane icon SVG — amber bg, white chef hat
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" rx="96" fill="#f59e0b"/>

  <!-- Chef hat (simplified, centred) -->
  <!-- Brim -->
  <rect x="136" y="320" width="240" height="44" rx="12" fill="white"/>
  <!-- Brim fold lines -->
  <rect x="136" y="350" width="240" height="14" rx="0" fill="rgba(0,0,0,0.06)"/>
  <!-- Main dome -->
  <ellipse cx="256" cy="228" rx="110" ry="115" fill="white"/>
  <!-- Left puff -->
  <circle cx="156" cy="250" r="62" fill="white"/>
  <!-- Right puff -->
  <circle cx="356" cy="250" r="62" fill="white"/>
  <!-- Top centre puff -->
  <circle cx="256" cy="148" r="72" fill="white"/>
</svg>`;

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f59e0b"/>
  <rect x="136" y="320" width="240" height="44" rx="12" fill="white"/>
  <rect x="136" y="350" width="240" height="14" rx="0" fill="rgba(0,0,0,0.06)"/>
  <ellipse cx="256" cy="228" rx="110" ry="115" fill="white"/>
  <circle cx="156" cy="250" r="62" fill="white"/>
  <circle cx="356" cy="250" r="62" fill="white"/>
  <circle cx="256" cy="148" r="72" fill="white"/>
</svg>`;

const sizes = [16, 32, 64, 180, 192, 512];

console.log("Generating icons…");
for (const size of sizes) {
  const outPath = path.join(publicDir, `icon-${size}.png`);
  await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`  ✓ icon-${size}.png`);
}

// Maskable icon (for Android adaptive icons — safe zone is inner 80%)
const maskablePath = path.join(publicDir, "icon-maskable-512.png");
await sharp(Buffer.from(maskableSvg))
  .resize(512, 512)
  .png()
  .toFile(maskablePath);
console.log("  ✓ icon-maskable-512.png");

// Also write the favicon.ico equivalent as a 32px PNG
const faviconPath = path.join(publicDir, "favicon.png");
await sharp(Buffer.from(svgIcon))
  .resize(32, 32)
  .png()
  .toFile(faviconPath);
console.log("  ✓ favicon.png");

// Save the SVG too (useful for Open Graph etc.)
writeFileSync(path.join(publicDir, "icon.svg"), svgIcon);
console.log("  ✓ icon.svg");

console.log("Done.");
