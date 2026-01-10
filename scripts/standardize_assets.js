
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_SPRITES = path.join(__dirname, '../public/sprites');

async function process() {
    console.log('Processing Assets... (Version 5 - Strict Component Compositing)');

    // 1. Knight (Preserve existing)
    if (fs.existsSync(path.join(PUBLIC_SPRITES, 'standard_knight.png'))) {
        try {
            const resizedKnight = await sharp(path.join(PUBLIC_SPRITES, 'standard_knight.png'))
                .resize(128, 128, { kernel: sharp.kernel.nearest })
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });

            const { data, info } = resizedKnight;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                if (r > 240 && g > 240 && b > 240) data[i + 3] = 0;
            }
            await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
                .toFile(path.join(PUBLIC_SPRITES, 'final_knight.png'));
            console.log('✓ Resized Knight');
        } catch (e) { console.error('Knight Error:', e.message); }
    }

    // 2. Tiles (Keep Seamless Grass Logic)
    try {
        const tilesPath = path.join(PUBLIC_SPRITES, 'standard_tiles_clean_v2.png');
        if (fs.existsSync(tilesPath)) {
            const tilesInput = sharp(tilesPath);
            const grassBuffer = await tilesInput.clone()
                .extract({ left: 8, top: 8, width: 16, height: 16 })
                .resize(32, 32, { kernel: sharp.kernel.nearest })
                .toBuffer();
            const fullSheet = await tilesInput.resize(96, 64, { kernel: sharp.kernel.nearest }).toBuffer();
            await sharp(fullSheet)
                .composite([{ input: grassBuffer, top: 0, left: 0 }])
                .toFile(path.join(PUBLIC_SPRITES, 'final_tiles.png'));
            console.log('✓ Created final_tiles.png');
        }
    } catch (e) { console.error('Tiles Error:', e.message); }

    // 3. Props (COMPOSITE FROM 5 INDIVIDUAL FILES)
    try {
        // Source Files
        const files = [
            'standard_tree.png',  // Col 0
            'standard_rock.png',  // Col 1
            'standard_bush.png',  // Col 2
            'standard_chest.png', // Col 3
            'standard_altar.png'  // Col 4
        ];

        // Target: 320x64 (5 Columns * 64px)
        const finalWidth = 320;
        const finalHeight = 64;
        const finalData = new Uint8ClampedArray(finalWidth * finalHeight * 4);

        for (let col = 0; col < files.length; col++) {
            const filePath = path.join(PUBLIC_SPRITES, files[col]);
            if (fs.existsSync(filePath)) {

                // Load & Resize to 64x64 strictly (High Res)
                // Use Lanczos3 for smooth downscaling
                // Use 'contain' to ensure WHOLE image fits (no cropping)
                const buffer = await sharp(filePath)
                    .resize(64, 64, {
                        kernel: sharp.kernel.lanczos3,
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .ensureAlpha()
                    .raw()
                    .toBuffer({ resolveWithObject: true });

                const { data, info } = buffer;

                // Copy to Final Grid at (col * 64, 0)
                const startX = col * 64;

                for (let y = 0; y < 64; y++) {
                    for (let x = 0; x < 64; x++) {
                        // Source Index (local 64x64)
                        const srcIdx = (y * 64 + x) * 4;

                        // Dest Index (global 320x64)
                        const destIdx = (y * finalWidth + (startX + x)) * 4;

                        const r = data[srcIdx];
                        const g = data[srcIdx + 1];
                        const b = data[srcIdx + 2];
                        let a = data[srcIdx + 3];

                        // FUZZY CHROMAL KEYING (Magenta #FF00FF)
                        // Distance from (255, 0, 255)
                        const dist = Math.sqrt(
                            (r - 255) ** 2 +
                            (g - 0) ** 2 +
                            (b - 255) ** 2
                        );

                        // Threshold: Increased to 150 to catch blending artifacts
                        if (dist < 150) {
                            a = 0;
                        }

                        // Secondary White Clean (artifacts)
                        if (r > 245 && g > 245 && b > 245) {
                            a = 0;
                        }

                        finalData[destIdx] = r;
                        finalData[destIdx + 1] = g;
                        finalData[destIdx + 2] = b;
                        finalData[destIdx + 3] = a;
                    }
                }
            } else {
                console.warn(`! Warning: Missing sprite source: ${files[col]}`);
            }
        }

        await sharp(finalData, { raw: { width: finalWidth, height: finalHeight, channels: 4 } })
            .toFile(path.join(PUBLIC_SPRITES, 'props.png'));

        console.log('✓ Created props.png from 5 distinct sources.');

    } catch (e) {
        console.error('x Failed to process Props:', e.message);
    }
}

process();
