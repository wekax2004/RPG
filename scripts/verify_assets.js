import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSET_DIR = path.resolve(__dirname, '../public/assets');
const OUT_DIR = path.resolve(__dirname, '../brain/637641f7-63af-4de0-93f2-e7b824bc95df'); // Artifacts

const TARGETS = ['mage.png', 'knight.png', 'forest.png'];

async function verify() {
    console.log("--- Verifying Assets ---");
    for (const name of TARGETS) {
        const filePath = path.join(ASSET_DIR, name);
        if (!fs.existsSync(filePath)) {
            console.error(`Missing: ${name}`);
            continue;
        }

        try {
            const image = sharp(filePath);
            const metadata = await image.metadata();
            console.log(`[${name}] Width: ${metadata.width}, Height: ${metadata.height}`);

            // Generate Grid Overlay
            // We want to test the hypothesis of 64x64 vs 32x32 vs 128x128
            // We'll generate an SVG overlay with 64x64 red boxes and 32x32 blue dots
            // and save it to artifacts for visual inspection if needed, 
            // but primarily the Dimensions will tell us the stride.

            // If Width is 1024:
            // 32px stride = 32 cols
            // 64px stride = 16 cols
            // 128px stride = 8 cols hiding in large space?

            // Let's create a debug image with a 64px grid
            const gridSvg = `
            <svg width="${metadata.width}" height="${metadata.height}">
                <defs>
                    <pattern id="grid64" width="64" height="64" patternUnits="userSpaceOnUse">
                        <rect width="64" height="64" fill="none" stroke="red" stroke-width="2"/>
                    </pattern>
                    <pattern id="grid32" width="32" height="32" patternUnits="userSpaceOnUse">
                        <rect width="32" height="32" fill="none" stroke="blue" stroke-width="1" stroke-opacity="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid32)" />
                <rect width="100%" height="100%" fill="url(#grid64)" />
            </svg>
            `;

            const outPath = path.join(OUT_DIR, `debug_${name}`);
            await image
                .composite([{ input: Buffer.from(gridSvg), blend: 'over' }])
                .toFile(outPath);

            console.log(`Saved debug overlay: ${outPath}`);

        } catch (e) {
            console.error(`Error processing ${name}:`, e);
        }
    }
}

verify();
