
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function detectGrid() {
    let sharp;
    try {
        sharp = (await import('sharp')).default;
    } catch (e) {
        console.error("Sharp not found");
        return;
    }

    const assetsDir = path.join(__dirname, 'public', 'assets');
    // We can verify the raw files or processed ones. The processed ones have no background but keep grid lines.
    // Let's check processed if available, else raw.
    // Actually, processed are in public/assets now (replaced).

    const files = ['dungeon.png', 'forest.png', 'knight.png', 'orc.png'];

    for (const file of files) {
        const inputPath = path.join(assetsDir, file);
        if (!fs.existsSync(inputPath)) continue;

        console.log(`\nAnalyzing ${file}...`);
        const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
        const { width, height } = info;

        // Detect vertical lines (grid cols)
        // We sum pixel darkness/alpha per column?
        // Grid lines are likely grey or black?
        // Or if background is transparent, they are the *only* thing in the gap?

        // Let's look for columns where many pixels are 'grid color'.
        // Or better: average brightness profile?

        // Simple approach: Check horizontal and vertical profiles of alpha/intensity.
        // The grid lines are continuous lines.

        let colScores = new Array(width).fill(0);
        let rowScores = new Array(height).fill(0);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];

                // If it's a visible pixel
                if (a > 10) {
                    // If it's grey-ish (grid line candidate)
                    if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
                        colScores[x]++;
                        rowScores[y]++;
                    }
                }
            }
        }

        // Find peaks in scores?
        // A grid line will have a high score (runs across the image).

        const thresholdH = height * 0.5; // continuous for 50% of height
        const thresholdW = width * 0.5;

        const gridCols = [];
        const gridRows = [];

        for (let x = 0; x < width; x++) if (colScores[x] > thresholdH) gridCols.push(x);
        for (let y = 0; y < height; y++) if (rowScores[y] > thresholdW) gridRows.push(y);

        // Group adjacent lines
        const cleanCols = groupLines(gridCols);
        const cleanRows = groupLines(gridRows);

        console.log(`  Potential Grid columns at: ${cleanCols.join(', ')}`);
        console.log(`  Potential Grid rows at: ${cleanRows.join(', ')}`);

        if (cleanCols.length > 1) {
            const avgSpacingX = (cleanCols[cleanCols.length - 1] - cleanCols[0]) / (cleanCols.length - 1);
            console.log(`  Estimated Cell Width: ${Math.round(avgSpacingX)}`);
        }

        if (cleanRows.length > 1) {
            const avgSpacingY = (cleanRows[cleanRows.length - 1] - cleanRows[0]) / (cleanRows.length - 1);
            console.log(`  Estimated Cell Height: ${Math.round(avgSpacingY)}`);
        }
    }
}

function groupLines(lines) {
    if (lines.length === 0) return [];
    const groups = [];
    let currentGroup = [lines[0]];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i] === lines[i - 1] + 1) {
            currentGroup.push(lines[i]);
        } else {
            groups.push(Math.floor(currentGroup.reduce((a, b) => a + b, 0) / currentGroup.length));
            currentGroup = [lines[i]];
        }
    }
    groups.push(Math.floor(currentGroup.reduce((a, b) => a + b, 0) / currentGroup.length));
    return groups;
}

detectGrid().catch(console.error);
