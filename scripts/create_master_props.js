
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_SPRITES = path.join(__dirname, '../public/sprites');
const OUTPUT_FILE = path.join(PUBLIC_SPRITES, 'master_props.png');

async function createMasterProps() {
    console.log('Building Master Props Sheet (Strict Layout)...');

    const width = 96; // 3 columns * 32
    const height = 64; // Max height
    const canvas = Buffer.alloc(width * height * 4); // RGBA

    // 1. Tree (col 0, 32x64)
    // Source: standard_tree_classic.png (Restored)
    const treePath = path.join(PUBLIC_SPRITES, 'standard_tree_classic.png');
    let treeBuffer;
    if (fs.existsSync(treePath)) {
        treeBuffer = await sharp(treePath)
            .resize(32, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .ensureAlpha()
            .toBuffer();
    } else {
        console.error('Missing standard_tree_classic.png');
        process.exit(1);
    }

    // 2. Rock (col 1, 32x32, y=32)
    // Source: standard_rock.png (User said this looks like a Chest)
    const rockPath = path.join(PUBLIC_SPRITES, 'standard_rock.png');
    let rockBuffer = await sharp(rockPath)
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .ensureAlpha()
        .toBuffer();

    // 3. Chest (col 2, 32x32, y=32)
    // Reuse Rock Buffer since Rock IS Chest
    let chestBuffer = rockBuffer;

    // Composite
    await sharp({
        create: {
            width: width,
            height: height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
        .composite([
            { input: treeBuffer, top: 0, left: 0 },
            { input: rockBuffer, top: 32, left: 32 },
            { input: chestBuffer, top: 32, left: 64 }
        ])
        .toFile(OUTPUT_FILE);

    console.log(`✓ Created master_props.png at ${OUTPUT_FILE}`);
}

createMasterProps().catch(console.error);
