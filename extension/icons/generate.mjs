/**
 * Generates PNG icons for the Chrome extension from icon.svg.
 * Uses the sharp package from the parent Kelane project — no extra installs needed.
 *
 * Usage (run from the extension/ directory or project root):
 *   node extension/icons/generate.mjs
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");

// Resolve sharp from the parent project
const sharpPath = resolve(root, "node_modules/sharp/lib/index.js");
if (!existsSync(sharpPath)) {
  console.error("❌  sharp not found. Run `npm install` in the Kelane project root first.");
  process.exit(1);
}

const { default: sharp } = await import(sharpPath);

const svgPath = resolve(__dirname, "icon.svg");
const svgBuffer = readFileSync(svgPath);

const SIZES = [16, 48, 128];

for (const size of SIZES) {
  const outPath = resolve(__dirname, `icon-${size}.png`);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓  icon-${size}.png`);
}

console.log("\nDone! Load the extension/ folder as an unpacked extension in Chrome.");
