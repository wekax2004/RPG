
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

async function createDebugTree() {
    console.log('Creating Debug Tree (Green Rect)...');

    // Create a 32x64 green rectangle
    await sharp({
        create: {
            width: 32,
            height: 64,
            channels: 4,
            background: { r: 0, g: 255, b: 0, alpha: 255 }
        }
    })
        .toFile(path.join(OUTPUT_DIR, 'tree_debug.png'));

    console.log('✓ Created tree_debug.png');
}

createDebugTree().catch(console.error);
