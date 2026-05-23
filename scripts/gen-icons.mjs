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
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d93833" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chef-hat !size-6" aria-hidden="true">
  <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"></path>
  <path d="M6 17h12"></path>
  </svg>
`;

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
  await sharp(Buffer.from(svgIcon)).resize(size, size).png().toFile(outPath);
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
await sharp(Buffer.from(svgIcon)).resize(32, 32).png().toFile(faviconPath);
console.log("  ✓ favicon.png");

// Save the SVG too (useful for Open Graph etc.)
writeFileSync(path.join(publicDir, "icon.svg"), svgIcon);
console.log("  ✓ icon.svg");

console.log("Done.");
