import sharp from 'sharp';
import fs from 'fs';

const INPUT = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/uploaded_image_1767966876099.png';
const OUT_DIR = './public/sprites';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function process() {
    console.log('Processing Assets...');

    // 1. Knight Sheet (Top Left 3x4 grid = 96x128)
    // Assuming the user's image aligns the sprites to the top-left
    await sharp(INPUT)
        .extract({ left: 0, top: 0, width: 96, height: 128 })
        .toFile(`${OUT_DIR}/knight_sheet.png`);
    console.log('Saved knight_sheet.png');

    // 2. Grass Tile (To the right of the knights)
    // The visual showed a big grass block. Let's start safely at x=128.
    // We only need one 32x32 tile.
    await sharp(INPUT)
        .extract({ left: 300, top: 100, width: 32, height: 32 }) // Trying to hit the middle of the "Green Patch"
        .toFile(`${OUT_DIR}/grass_tile.png`);
    console.log('Saved grass_tile.png (Guessing coordinates)');
}

process().catch(console.error);
