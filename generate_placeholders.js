import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TILE_SIZE = 32;
const OUTPUT_DIR = './public/sprites';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Define Sheets
const sheets = [
    {
        name: 'knight_sheet.png',
        width: 96, height: 32,
        baseColor: '#3fb950',
        label: 'PLY',
        grid: true
    },
    {
        name: 'world_tiles.png',
        width: 128, height: 160, // Enough for Col 2, Row 4 (Wall)
        baseColor: '#2dba4e',
        label: 'TILE',
        grid: true,
        // Specific overrides for key positions
        // Grass: Col 1, Row 0 (x=32, y=0)
        // Wall: Col 2, Row 4 (x=64, y=128)
        items: [
            { col: 1, row: 0, color: '#2dba4e', text: 'GRS' },
            { col: 2, row: 4, color: '#6e7681', text: 'WAL' }
        ]
    },
    {
        name: 'monsters.png',
        width: 64, height: 64,
        baseColor: '#d73a49',
        label: 'MOB',
        grid: true,
        items: [
            { col: 0, row: 1, color: '#d73a49', text: 'ORC' }
        ]
    }
];

async function generateSheet(sheet) {
    let internalContent = '';

    // Default Background
    internalContent += `<rect x="0" y="0" width="${sheet.width}" height="${sheet.height}" fill="#111" />`;

    // Draw Grid Cells
    const cols = Math.floor(sheet.width / TILE_SIZE);
    const rows = Math.floor(sheet.height / TILE_SIZE);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            // Check specific item override
            const item = sheet.items?.find(i => i.col === c && i.row === r);
            const color = item ? item.color : sheet.baseColor;
            const text = item ? item.text : ((c === 0 && r === 0) ? sheet.label : '');

            // Cell Rect
            internalContent += `<rect x="${x}" y="${y}" width="${TILE_SIZE}" height="${TILE_SIZE}" fill="${color}" stroke="black" stroke-width="1"/>`;

            // Text
            if (text) {
                internalContent += `<text x="${x + TILE_SIZE / 2}" y="${y + TILE_SIZE / 2 + 4}" font-size="10" font-family="Arial" fill="white" text-anchor="middle" font-weight="bold">${text}</text>`;
            }
        }
    }

    const svg = `
    <svg width="${sheet.width}" height="${sheet.height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
        ${internalContent}
    </svg>`;

    const buffer = Buffer.from(svg);
    await sharp(buffer)
        .png()
        .toFile(path.join(OUTPUT_DIR, sheet.name));

    console.log(`Generated Sheet: ${sheet.name}`);
}

async function run() {
    for (const s of sheets) {
        await generateSheet(s);
    }
    console.log("All spritesheets generated in public/sprites/");
}

run().catch(console.error);
