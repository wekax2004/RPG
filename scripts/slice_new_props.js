
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/tibia_chest_tree_sheet_1768033177026.png';
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

async function extract() {
    console.log('Extracting New Tibia Props...');

    // 1. Chest (Assuming Top-Left, 128x128)
    // We want a tight crop if possible, but let's grab the cell first.
    await sharp(INPUT_PATH)
        .extract({ left: 0, top: 0, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_chest.png'));
    console.log('✓ Extracted Standard Chest (0,0)');

    // 2. Oak Tree (Assuming Slot 2, 128,0)
    await sharp(INPUT_PATH)
        .extract({ left: 128, top: 0, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_tree.png'));
    console.log('✓ Extracted Standard Tree (128,0)');

    // 3. Pine Tree (Assuming Slot 3, 256,0)
    // We can use this as a variation later or replacing "Rock" if we want, but let's stick to Oak for now.
    await sharp(INPUT_PATH)
        .extract({ left: 256, top: 0, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_pine.png'));
    console.log('✓ Extracted Pine Tree (256,0)');

}

extract().catch(console.error);
