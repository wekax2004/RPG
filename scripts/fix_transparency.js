
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPRITES_DIR = path.join(__dirname, '../public/sprites');

const ASSETS = [
    'tibia_tree.png',
    'tibia_chest.png',
    'tibia_rock.png'
];

async function fixTransparency() {
    console.log('Fixing transparency for Tibia assets...');

    for (const file of ASSETS) {
        const inputPath = path.join(SPRITES_DIR, file);
        if (!fs.existsSync(inputPath)) {
            console.error(`File not found: ${file}`);
            continue;
        }

        console.log(`Processing ${file}...`);

        try {
            // Get raw pixel data
            const { data, info } = await sharp(inputPath)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });

            const ft = 200; // More aggressive threshold (was 245)

            let pixelsChanged = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // If pixel is light enough (even if not pure white), make it transparent
                if (r >= ft && g >= ft && b >= ft) {
                    data[i + 3] = 0; // Transparent
                    pixelsChanged++;
                }
            }

            console.log(`  - Made ${pixelsChanged} pixels transparent.`);

            // Save back
            await sharp(data, {
                raw: {
                    width: info.width,
                    height: info.height,
                    channels: 4
                }
            })
                .png()
                .toFile(inputPath);

            console.log(`  - Saved ${file}`);

        } catch (err) {
            console.error(`Failed to process ${file}:`, err);
        }
    }
}

fixTransparency();
