
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/tibia_style_sheet_1768026469188.png';
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

async function extract() {
    console.log('Extracting Tibia Assets...');

    // 1. Knight Sheet (Top-Left 4x4 Grid = 512x512)
    // We expect 3 cols of knights, so 4th col might be walls. 
    // We pad or crop 384x512? Standardize expects to shrink to 128x128 (square).
    // Let's grab 512x512 to be safe for aspect ratio.
    await sharp(INPUT_PATH)
        .extract({ left: 0, top: 0, width: 512, height: 512 })
        .toFile(path.join(OUTPUT_DIR, 'standard_knight.png'));
    console.log('✓ Extracted Knight');

    // 2. Tree (Guessing Bottom Right - Col 6, Row 6 = 768, 768)
    // Actually, let's try Col 5, Row 5 (640, 640) just in case.
    // The previous grid log showed cols up to 896.
    // Let's grab a likely spot. 
    // Visual guess: Props on right.
    await sharp(INPUT_PATH)
        .extract({ left: 768, top: 640, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_tree.png'));
    console.log('✓ Extracted Tree');

    // 3. Chest (Top Right - Col 5, Row 0 = 640, 0)
    await sharp(INPUT_PATH)
        .extract({ left: 640, top: 0, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_chest.png'));
    console.log('✓ Extracted Chest');

    // 4. Large Rock (Col 5, Row 1 = 640, 128)
    await sharp(INPUT_PATH)
        .extract({ left: 640, top: 128, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_rock.png'));
    console.log('✓ Extracted Rock');

    // 5. Wall (Col 4, Row 0 = 512, 0) - Vertical Stone Face
    // We grab the top block.
    await sharp(INPUT_PATH)
        .extract({ left: 512, top: 0, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_wall.png'));
    console.log('✓ Extracted Wall');

    // 6. Marble Floor (Col 6, Row 0 = 768, 0)
    await sharp(INPUT_PATH)
        .extract({ left: 768, top: 0, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_marble.png'));
    console.log('✓ Extracted Marble');

    // 7. Grass Floor (Col 7, Row 0 = 896, 0)
    await sharp(INPUT_PATH)
        .extract({ left: 896, top: 0, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_grass.png'));
    console.log('✓ Extracted Grass');
}

extract().catch(console.error);
