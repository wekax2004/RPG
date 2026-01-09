
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

    const inputDir = path.join(__dirname, 'public', 'assets');
    const outputDir = path.join(inputDir, 'processed');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Explicit list of files we want to fix
    const targetFiles = [
        'knight.png',
        'mage.png',
        'orc.png',
        'skeleton.png',
        'wolf.png',
        'forest.png',
        'dungeon.png',
        'items.png'
    ];

    console.log(`Scanning ${inputDir} for target files...`);

    for (const file of targetFiles) {
        const inputPath = path.join(inputDir, file);
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping missing file: ${file}`);
            continue;
        }

        const outputPath = path.join(outputDir, file);
        console.log(`Processing: ${file}`);

        try {
            const image = sharp(inputPath).ensureAlpha();
            const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

            // Remove white background and light gray grid lines
            // White: ~255, 255, 255
            // Grid: Likely around 200-240 gray? Or check specifically.
            // Let's use a broader tolerance for "light" pixels to be safe, 
            // since our sprites are usually colorful/darker.

            const tolerance = 40; // Strictness for white
            const grayThreshold = 200; // Anything brighter than this might be background/grid if it's gray-ish

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Check for white background
                const isWhite = r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance;

                // Check for light gray grid lines (approx equal RGB, high brightness)
                // We want to be careful not to erase light colored sprite parts (like white armor highlight)
                // But grid lines are usually single pixel and specific color.
                // For now, let's just kill the white background.

                if (isWhite) {
                    data[i + 3] = 0; // Alpha 0
                }
            }

            // Save processed file
            // We skip the resizing for now to preserve detail, unless we really want that retro look immediately.
            // The previous script did resize. Let's keep it 1:1 for now to debugging indices first.
            await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
                .png()
                .toFile(outputPath);

            console.log(`  ✓ Saved to: ${outputPath}`);

        } catch (err) {
            console.log(`  ✗ Error processing ${file}: ${err.message}`);
        }
    }

    console.log(`\n✅ Done! Check ${outputDir}`);
}

processSprites().catch(console.error);
