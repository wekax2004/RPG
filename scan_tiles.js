
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function scanTiles() {
    let sharp;
    try {
        sharp = (await import('sharp')).default;
    } catch (e) {
        console.error("Sharp not found");
        return;
    }

    // We scan 'forest.png' (32x32 grid) and 'dungeon.png' (32x32 grid)
    const sheets = [
        { name: 'forest.png', tileSize: 32 },
        { name: 'dungeon.png', tileSize: 32 }
    ];

    const inputDir = path.join(__dirname, 'public', 'assets', 'processed'); // Use processed

    for (const sheet of sheets) {
        const inputPath = path.join(inputDir, sheet.name);
        if (!fs.existsSync(inputPath)) continue;

        console.log(`\nScanning ${sheet.name}...`);
        const image = sharp(inputPath);
        const { width, height } = await image.metadata();
        const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

        const cols = Math.floor(width / sheet.tileSize);
        const rows = Math.floor(height / sheet.tileSize);

        let bestGreen = { score: -1, col: 0, row: 0 };
        let bestGrey = { score: -1, col: 0, row: 0 };
        let bestBrown = { score: -1, col: 0, row: 0 };

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Sample pixels in this tile
                let rSum = 0, gSum = 0, bSum = 0, count = 0;

                // Scan center 16x16 to avoid edges
                const startX = c * sheet.tileSize + 8;
                const startY = r * sheet.tileSize + 8;

                for (let y = startY; y < startY + 16; y++) {
                    for (let x = startX; x < startX + 16; x++) {
                        const idx = (y * width + x) * 4;
                        // Check alpha
                        if (data[idx + 3] > 200) {
                            rSum += data[idx];
                            gSum += data[idx + 1];
                            bSum += data[idx + 2];
                            count++;
                        }
                    }
                }

                if (count > 100) { // Enough pixels
                    const avgR = rSum / count;
                    const avgG = gSum / count;
                    const avgB = bSum / count;

                    // Green Score: High G, Low R/B
                    const greenScore = avgG - (avgR + avgB) / 2;
                    if (greenScore > bestGreen.score) {
                        bestGreen = { score: greenScore, col: c, row: r };
                    }

                    // Grey Score: Low variance, moderate brightness
                    const variance = Math.abs(avgR - avgG) + Math.abs(avgG - avgB) + Math.abs(avgB - avgR);
                    if (variance < 20 && avgG > 50 && avgG < 200) {
                        // Prefer lighter grey?
                        const score = 1000 - variance; // lower var is better
                        if (score > bestGrey.score) {
                            bestGrey = { score, col: c, row: r };
                        }
                    }

                    // Brown Score: R > G > B
                    if (avgR > avgG && avgG > avgB) {
                        const score = (avgR - avgG) + (avgG - avgB);
                        if (score > bestBrown.score) {
                            bestBrown = { score, col: c, row: r };
                        }
                    }
                }
            }
        }

        console.log(`  Best Green (Grass?): col=${bestGreen.col}, row=${bestGreen.row}`);
        console.log(`  Best Grey (Floor/Wall?): col=${bestGrey.col}, row=${bestGrey.row}`);
        console.log(`  Best Brown (Dirt/Wood?): col=${bestBrown.col}, row=${bestBrown.row}`);
    }
}

scanTiles().catch(console.error);
