
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

    const file = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/tibia_chest_tree_sheet_1768033177026.png';
    console.log(`\nAnalyzing ${file}...`);

    // Convert to ensure we have pixel data
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;

    let colScores = new Array(width).fill(0);
    let rowScores = new Array(height).fill(0);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Check for black grid lines (common in these gens)
            if (r < 50 && g < 50 && b < 50) {
                colScores[x]++;
                rowScores[y]++;
            }
        }
    }

    const thresholdH = height * 0.5;
    const thresholdW = width * 0.5;

    const gridCols = [];
    const gridRows = [];

    for (let x = 0; x < width; x++) if (colScores[x] > thresholdH) gridCols.push(x);
    for (let y = 0; y < height; y++) if (rowScores[y] > thresholdW) gridRows.push(y);

    const cleanCols = groupLines(gridCols);
    const cleanRows = groupLines(gridRows);

    console.log(`  Grid cols: ${cleanCols.slice(0, 10).join(', ')}...`);
    console.log(`  Grid rows: ${cleanRows.slice(0, 10).join(', ')}...`);

    if (cleanCols.length > 1) {
        const avgSpacingX = (cleanCols[cleanCols.length - 1] - cleanCols[0]) / (cleanCols.length - 1);
        console.log(`  Estimated Cell Width: ${Math.round(avgSpacingX)}`);
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
