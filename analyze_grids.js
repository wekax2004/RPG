
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = './public/assets';

async function analyzeSprites() {
    const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.png'));

    console.log("Analyzing sprite grids...");
    const configs = {};

    for (const file of files) {
        if (file === 'sprites.png' || file === 'sprites_v2.png') continue; // Skip originals

        const filePath = path.join(assetsDir, file);
        const image = sharp(filePath);
        const { width, height } = await image.metadata();
        const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        // 1. Detect Top/Left Offset (First non-transparent pixel)
        // Actually, we want the first *relevant* pixel.
        // Headers are often text. We realized text has different color or shape?
        // Let's simplified: Find the "Content Box".

        let minX = width, minY = height, maxX = 0, maxY = 0;
        let hasContent = false;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] > 100) { // Visible pixel
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    hasContent = true;
                }
            }
        }

        if (!hasContent) {
            console.log(`[${file}] Empty image?`);
            continue;
        }

        // HEURISTIC:
        // Text is often at the very top/left.
        // The *Grid* usually starts after some gap.
        // Let's assume the user was right about "25px" or similar.
        // We will output the bounds we found.

        console.log(`[${file}] Bounds: x=${minX}, y=${minY}, w=${maxX - minX}, h=${maxY - minY}`);

        // Try to guess Tile Size from the bounds or periodic gaps.
        // Knight: Found at ~50,50? 

        configs[file] = {
            src: file,
            boundX: minX,
            boundY: minY,
            width: width,
            height: height
        };
    }

    console.log("Analysis Complete. Configs:");
    console.log(JSON.stringify(configs, null, 2));
}

analyzeSprites().catch(console.error);
