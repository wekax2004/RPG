
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function scanTiles() {
    let sharp;
    try {
        sharp = (await import('sharp')).default;
    } catch (e) {
        console.error("Sharp not found");
        return;
    }

    const file = process.argv[2];
    if (!file) {
        console.error("Usage: node scan_tiles.js <file>");
        return;
    }

    console.log(`Scanning ${file}...`);
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    const tileSize = 32;
    const numTilesX = Math.floor(info.width / tileSize);
    const numTilesY = Math.floor(info.height / tileSize);

    console.log(`Image: ${info.width}x${info.height} (${numTilesX}x${numTilesY} tiles)`);
    console.log(`Searching for WATER candidates (B > R+20, B > G+20)...`);

    for (let j = 0; j < numTilesY; j++) {
        const sy = j * tileSize;
        for (let i = 0; i < numTilesX; i++) {
            const sx = i * tileSize;

            let rSum = 0, gSum = 0, bSum = 0, count = 0;

            for (let y = 0; y < tileSize; y++) {
                for (let x = 0; x < tileSize; x++) {
                    const idx = ((sy + y) * info.width + (sx + x)) * 4;
                    if (data[idx + 3] > 10) {
                        rSum += data[idx];
                        gSum += data[idx + 1];
                        bSum += data[idx + 2];
                        count++;
                    }
                }
            }

            if (count > 0) {
                const r = Math.round(rSum / count);
                const g = Math.round(gSum / count);
                const b = Math.round(bSum / count);

                // Blue Signature
                if (b > r + 30 && b > g + 30) {
                    console.log(`[MATCH WATER] Row:${j} Col:${i} (x:${sx}, y:${sy}): RGB(${r}, ${g}, ${b})`);
                }
            }
        }
    }
}

scanTiles();
