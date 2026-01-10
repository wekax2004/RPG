
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The Original Sheet (Known Good Tree)
const CLASSIC_SHEET = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/tibia_style_sheet_1768026469188.png';
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

async function restore() {
    console.log('Restoring Classic Tree...');

    // Extract from 768, 640 (128x128)
    await sharp(CLASSIC_SHEET)
        .extract({ left: 768, top: 640, width: 128, height: 128 })
        .toFile(path.join(OUTPUT_DIR, 'standard_tree_classic.png'));

    console.log('✓ Restored standard_tree_classic.png');
}

restore().catch(console.error);
