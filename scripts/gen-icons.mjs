/**
 * Generates PWA icons from an SVG source using sharp.
 * Run: node scripts/gen-icons.mjs
 *
 * Produces:
 *   public/icon-{16,32,64,180,192,512}.png  — regular icons (rounded bg)
 *   public/icon.png                          — alias for 512px
 *   public/icon-maskable-512.png             — full-bleed, flame in safe zone
 *   public/favicon.png                       — 32px
 *   public/icon.svg                          — source SVG (synced from here)
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

// ── Regular icon ────────────────────────────────────────────────────────────
// Dark background with iOS/Android-style rounded corners.
// Lucide Flame icon scaled to ~62% and centered — ~19% padding on each side.
// Stroke-width 2.1 compensates for the 0.62× scale (≈ original 2 visually).
const svgIcon = `\
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
  <rect width="24" height="24" rx="5.4" fill="#150404"/>
  <g transform="translate(4.56, 4.56) scale(0.62)"
     stroke="white" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.11-.76-2.04-1.79-2.39L10 11.5c0 0-1.5-2-1.5-4.5 0 0-2 1.5-2 4.5 0 .75.13 1.5.37 2.17"/>
    <path d="M12 2C6 8 4 13 4 17a8 8 0 0 0 16 0c0-5.33-4-10.67-8-15z"/>
  </g>
</svg>`;

// ── Maskable icon ────────────────────────────────────────────────────────────
// Full-bleed background — the system applies its own mask shape (circle, squircle, etc.).
// Flame scaled to ~50% so it sits safely inside the mandatory 80% safe zone.
// Slightly thicker stroke (2.4) to keep weight visually consistent at smaller scale.
const maskableSvg = `\
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
  <rect width="24" height="24" fill="#150404"/>
  <g transform="translate(6, 6) scale(0.5)"
     stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.11-.76-2.04-1.79-2.39L10 11.5c0 0-1.5-2-1.5-4.5 0 0-2 1.5-2 4.5 0 .75.13 1.5.37 2.17"/>
    <path d="M12 2C6 8 4 13 4 17a8 8 0 0 0 16 0c0-5.33-4-10.67-8-15z"/>
  </g>
</svg>`;

// ── Generate ─────────────────────────────────────────────────────────────────
console.log("Generating icons…");

const sizes = [16, 32, 64, 180, 192, 512];
for (const size of sizes) {
  const outPath = path.join(publicDir, `icon-${size}.png`);
  await sharp(Buffer.from(svgIcon)).resize(size, size).png().toFile(outPath);
  console.log(`  ✓ icon-${size}.png`);
}

// Generic icon.png (same as 512)
await sharp(Buffer.from(svgIcon))
  .resize(512, 512)
  .png()
  .toFile(path.join(publicDir, "icon.png"));
console.log("  ✓ icon.png");

// Maskable icon
await sharp(Buffer.from(maskableSvg))
  .resize(512, 512)
  .png()
  .toFile(path.join(publicDir, "icon-maskable-512.png"));
console.log("  ✓ icon-maskable-512.png");

// Favicon (32px)
await sharp(Buffer.from(svgIcon))
  .resize(32, 32)
  .png()
  .toFile(path.join(publicDir, "favicon.png"));
console.log("  ✓ favicon.png");

// Keep icon.svg in sync with the source defined here
writeFileSync(path.join(publicDir, "icon.svg"), svgIcon);
console.log("  ✓ icon.svg");

console.log("Done.");
