/**
 * Sprite Post-Processor Script
 * Applies the "Magic Fix" to AI-generated sprites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function processSprites() {
    let sharp;
    try {
        sharp = (await import('sharp')).default;
    } catch (e) {
        console.log('Installing sharp library...');
        execSync('npm install sharp', { stdio: 'inherit', cwd: __dirname });
        sharp = (await import('sharp')).default;
    }

    const inputDir = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df';
    const outputDir = path.join(inputDir, 'processed');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(inputDir).filter(f =>
        f.endsWith('.png') &&
        (f.includes('sprites') || f.includes('tiles') || f.includes('environment') || f.includes('items'))
    );

    console.log(`Found ${files.length} sprite files to process:\n`);

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace('.png', '_processed.png'));

        console.log(`Processing: ${file}`);

        try {
            const metadata = await sharp(inputPath).metadata();
            const { width, height } = metadata;

            // Step 1: Ensure alpha channel exists
            let image = sharp(inputPath).ensureAlpha();

            // Get raw pixel data  
            const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

            // Remove white/near-white background
            const tolerance = 30;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
                    data[i + 3] = 0; // Set alpha to 0
                }
            }

            // Step 2 & 3: Resize down then up (Nearest Neighbor)
            const halfW = Math.floor(width / 2);
            const halfH = Math.floor(height / 2);

            await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
                .resize(halfW, halfH, { kernel: 'nearest' })
                .resize(halfW * 2, halfH * 2, { kernel: 'nearest' })
                .png()
                .toFile(outputPath);

            console.log(`  ✓ Saved: ${path.basename(outputPath)}`);

        } catch (err) {
            console.log(`  ✗ Error: ${err.message}`);
        }
    }

    console.log(`\n✅ Done! Processed files saved to:\n${outputDir}`);
}

processSprites().catch(console.error);
