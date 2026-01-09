
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputDir = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df';
const outputDir = path.join(inputDir, 'processed');

async function fixSprites() {
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('_processed.png'));

    console.log(`Fixing ${files.length} sprites...`);

    for (const file of files) {
        const filePath = path.join(outputDir, file);
        console.log(`Analyzing: ${file}`);

        const image = sharp(filePath);
        const { width, height } = await image.metadata();

        const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        let maxGapSize = 0;
        let maxGapStart = 0;
        let currentGapStart = -1;

        const scanHeight = Math.floor(height * 0.6);

        for (let y = 0; y < scanHeight; y++) {
            let opaqueCount = 0;
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (data[idx + 3] > 100) {
                    opaqueCount++;
                }
            }

            // Treat as empty if:
            // 1. Very few pixels (Vertical grid lines only, < 10%)
            // 2. VERY MANY pixels (Horizontal separator line, > 90%)
            const rowIsEmpty = (opaqueCount < width * 0.1) || (opaqueCount > width * 0.9);

            if (rowIsEmpty) {
                if (currentGapStart === -1) currentGapStart = y;
            } else {
                if (currentGapStart !== -1) {
                    const gapSize = y - currentGapStart;

                    if (currentGapStart > 5) {
                        if (gapSize > maxGapSize) {
                            maxGapSize = gapSize;
                            maxGapStart = currentGapStart;
                        }
                    }
                    currentGapStart = -1;
                }
            }
        }

        if (currentGapStart !== -1 && currentGapStart > 5) {
            const gapSize = scanHeight - currentGapStart;
            if (gapSize > maxGapSize) {
                maxGapSize = gapSize;
                maxGapStart = currentGapStart;
            }
        }

        let cropY = 0;

        if (maxGapSize > 10) {
            cropY = maxGapStart + maxGapSize;
            console.log(`  Header detected? Gap of ${maxGapSize}px at Y=${maxGapStart}. Cropping top ${cropY} pixels.`);
        } else {
            console.log(`  No internal header gap found for ${file}.`);
            // Fallback for specific known problematic files
            if (file.includes('forest') || file.includes('items') || file.includes('knight')) {
                console.log("  -> Forcing fallback crop of 80px.");
                cropY = 80;
            }
        }

        if (cropY > 0) {
            await image
                .extract({ left: 0, top: cropY, width: width, height: height - cropY })
                .png()
                .toFile(filePath.replace('.png', '_fix.png'));

            fs.copyFileSync(filePath.replace('.png', '_fix.png'), filePath);
            fs.unlinkSync(filePath.replace('.png', '_fix.png'));
            console.log(`  ✓ Fixed ${file}`);
        } else {
            console.log("  Skipping.");
        }
    }
    console.log("Done.");
}

fixSprites().catch(console.error);
