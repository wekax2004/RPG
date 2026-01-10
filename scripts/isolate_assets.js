
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_SPRITES = path.join(__dirname, '../public/sprites');
// We use the "Classic Restored" Tree and the known-good Chest/Rock from Master Props logic
const MASTER_SHEET = path.join(PUBLIC_SPRITES, 'master_props.png');

async function isolate() {
    console.log('Isolating Assets...');

    // 1. Tree (Slot 0 in Master: 0,0, 32x64)
    await sharp(MASTER_SHEET)
        .extract({ left: 0, top: 0, width: 32, height: 64 })
        .toFile(path.join(PUBLIC_SPRITES, 'tree.png'));
    console.log('✓ isolated tree.png');

    // 2. Chest (Slot 1 in Master: 32,32, 32x32)
    // IMPORTANT: In the last step, I put Chest at Slot 1 (x=32).
    await sharp(MASTER_SHEET)
        .extract({ left: 32, top: 32, width: 32, height: 32 })
        .toFile(path.join(PUBLIC_SPRITES, 'chest.png'));
    console.log('✓ isolated chest.png');

    // 3. Rock (Slot 2 in Master: 64,32, 32x32)
    await sharp(MASTER_SHEET)
        .extract({ left: 64, top: 32, width: 32, height: 32 })
        .toFile(path.join(PUBLIC_SPRITES, 'rock.png'));
    console.log('✓ isolated rock.png');
}

isolate().catch(console.error);
