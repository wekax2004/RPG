
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLASSIC_SHEET = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/tibia_style_sheet_1768026469188.png';
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

async function extractLegacy() {
    console.log('Extracting Legacy Assets...');

    // 1. Tree (768, 640) - Known Good
    // The previous tree was 32x64 in master props, so we resize 128x128 -> 32x64 (contain)
    await sharp(CLASSIC_SHEET)
        .extract({ left: 768, top: 640, width: 128, height: 128 })
        .resize(32, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(OUTPUT_DIR, 'tree.png'));
    console.log('✓ Replaced tree.png');

    // 2. Chest (640, 640) - Need to verify if this is chest
    // User liked "Standard Rock" as chest. "Standard Rock" was from slot 2?
    // Let's assume the Classic Sheet Layout:
    // Row 5 (640): [Grass, Grass, Grass, ... Rock? Chest?]
    // Let's try to grab a few candidates and verify visually if I could... but I can't.
    // I will extract what SHOULD be the chest.
    // Based on previous generation:
    // Knight (0,0)
    // Wall (0,128)
    // ...
    // Let's Try:
    // Chest: 640, 640
    await sharp(CLASSIC_SHEET)
        .extract({ left: 640, top: 640, width: 128, height: 128 })
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(OUTPUT_DIR, 'chest.png'));
    console.log('✓ Replaced chest.png');

    // 3. Rock (512, 640)
    await sharp(CLASSIC_SHEET)
        .extract({ left: 512, top: 640, width: 128, height: 128 })
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(OUTPUT_DIR, 'rock.png'));
    console.log('✓ Replaced rock.png');
}

extractLegacy().catch(console.error);
