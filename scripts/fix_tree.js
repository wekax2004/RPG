
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/tibia_chest_tree_sheet_1768033177026.png';
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

async function fixTree() {
    console.log('Fixing Standard Tree Extraction...');

    // The user saw the chest lid (probably top of chest from col 0) in the tree file.
    // This implies we extracted from 0,0 or similar.

    // TREE is likely at 128,0 (Column 1).
    // Let's extract huge chunks to be sure.

    // 1. Extract Standard Tree (128, 0)
    await sharp(INPUT_PATH)
        .extract({ left: 128, top: 0, width: 128, height: 128 }) // Standard 128 cell
        .toFile(path.join(OUTPUT_DIR, 'standard_tree.png'));
    console.log('✓ Re-Extracted standard_tree.png (128,0)');

    // 2. Extract Standard Chest (0, 0)
    await sharp(INPUT_PATH)
        .extract({ left: 0, top: 0, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_chest.png'));
    console.log('✓ Re-Extracted standard_chest.png (0,0)');

}

fixTree().catch(console.error);
