
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
        // 2. World Tiles (Grass, Flowers, Pebbles, Wall, Floor)
        // We will construct this from our extracted standard assets
        // Row 0: Grass (0), FlowerGrass (1), PebbleGrass (2), Wall (3), Marble (4)
        // We simulate variations for Flowers/Pebbles by compositing or just reusing Grass for now.
        try {
            const tilesFiles = [
                'standard_grass.png',  // 0: Grass
                'standard_grass.png',  // 1: Flower (Placeholder)
                'standard_grass.png',  // 2: Pebble (Placeholder)
                'standard_wall.png',   // 3: Wall
                'standard_marble.png'  // 4: Marble
            ];

            const finalTilesWidth = 32 * 5; // 5 columns
            const finalTilesHeight = 32;
            const finalTilesData = new Uint8ClampedArray(finalTilesWidth * finalTilesHeight * 4);

            for (let col = 0; col < tilesFiles.length; col++) {
                const filePath = path.join(PUBLIC_SPRITES, tilesFiles[col]);
                if (fs.existsSync(filePath)) {

                    // Load & Resize to 32x32 strictly
                    const buffer = await sharp(filePath)
                        .resize(32, 32, {
                            fit: 'cover', // Tiles should fill the square
                            position: 'center'
                        })
                        .ensureAlpha()
                        .raw()
                        .toBuffer({ resolveWithObject: true });

                    const { data, info } = buffer;

                    // Copy to Final Grid at (col * 32, 0)
                    const startX = col * 32;

                    for (let y = 0; y < 32; y++) {
                        for (let x = 0; x < 32; x++) {
                            const srcIdx = (y * 32 + x) * 4;
                            const destIdx = (y * finalTilesWidth + (startX + x)) * 4;

                            // No chroma key for full tiles usually, but let's prevent bleeding? 
                            // Actually tiles should be solid.
                            finalTilesData[destIdx] = data[srcIdx];
                            finalTilesData[destIdx + 1] = data[srcIdx + 1];
                            finalTilesData[destIdx + 2] = data[srcIdx + 2];
                            finalTilesData[destIdx + 3] = data[srcIdx + 3];

                            for (let col = 0; col < files.length; col++) {
                                const filePath = path.join(PUBLIC_SPRITES, files[col]);
                                if (fs.existsSync(filePath)) {

                                    // Load & Resize to 64x64 strictly (High Res)
                                    // Use Lanczos3 for smooth downscaling
                                    // Use 'contain' to ensure WHOLE image fits (no cropping)
                                    // Load & Resize
                                    let pipeline = sharp(filePath);

                                    // Special Case: Chest (Needs to be 32x32 centered in 64x64)
                                    if (files[col].includes('chest')) {
                                        pipeline = pipeline.resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                                            .extend({ top: 16, bottom: 16, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } });
                                    } else {
                                        // Standard Prop: 64x64 (Tree, Rock)
                                        pipeline = pipeline.resize(64, 64, {
                                            kernel: sharp.kernel.lanczos3,
                                            fit: 'contain',
                                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                                        });
                                    }

                                    const buffer = await pipeline
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
                        }
                    }
                } else {
                    console.warn(`! Warning: Missing tile source: ${tilesFiles[col]}`);
                }
            }
            await sharp(finalTilesData, { raw: { width: finalTilesWidth, height: finalTilesHeight, channels: 4 } })
                .toFile(path.join(PUBLIC_SPRITES, 'tiles.png'));
            console.log('✓ Created tiles.png from 5 distinct sources.');
        } catch (e) {
            console.error('x Failed to process Tiles:', e.message);
        }
    } catch (e) { console.error('Tiles Error:', e.message); }


    // 3. Props (Packed Strip: 32px wide x 64px tall slots)
    try {
        const files = [
            'standard_tree.png',  // Slot 0
            'standard_chest.png', // Slot 1
            'standard_rock.png',  // Slot 2
            'standard_bush.png'   // Slot 3
        ];

        // Layout: Each prop gets a 32x64 slot.
        // Tree: Resized to 32x64 (Tall).
        // Chest/Rock/Bush: Resized to 32x32, placed at bottom (y=32).

        const slotWidth = 32;
        const slotHeight = 64;
        const finalWidth = slotWidth * files.length;
        const finalHeight = slotHeight;

        // Create blank canvas
        const finalData = new Uint8ClampedArray(finalWidth * finalHeight * 4);

        for (let col = 0; col < files.length; col++) {
            const filePath = path.join(PUBLIC_SPRITES, files[col]);
            if (fs.existsSync(filePath)) {
                let buffer;
                let targetY = 0; // Default top

                if (files[col].includes('tree')) {
                    // Tree: 32x64
                    buffer = await sharp(filePath)
                        .resize(32, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .ensureAlpha()
                        .raw()
                        .toBuffer({ resolveWithObject: true });
                    targetY = 0;
                } else {
                    // Chest/Rock/Bush: 32x32 (Bottom Aligned in 32x64 slot)
                    // Do NOT extend. Keep as 32x32.
                    buffer = await sharp(filePath)
                        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .ensureAlpha()
                        .raw()
                        .toBuffer({ resolveWithObject: true });
                    targetY = 32; // Place at bottom half of the slot
                }

                const { data, info } = buffer;

                // Copy to Final Strip
                const startX = col * slotWidth;

                for (let y = 0; y < info.height; y++) {
                    for (let x = 0; x < info.width; x++) {
                        const srcIdx = (y * info.width + x) * 4;
                        const destIdx = ((y + targetY) * finalWidth + (startX + x)) * 4;

                        // Simple copy with chroma key logic
                        const r = data[srcIdx];
                        const g = data[srcIdx + 1];
                        const b = data[srcIdx + 2];
                        let a = data[srcIdx + 3];

                        // Magenta key
                        if (r > 240 && g < 10 && b > 240) a = 0;
                        if (r > 245 && g > 245 && b > 245) a = 0; // White clean

                        finalData[destIdx] = r;
                        finalData[destIdx + 1] = g;
                        finalData[destIdx + 2] = b;
                        finalData[destIdx + 3] = a;
                    }
                }
            }
        }

        await sharp(finalData, { raw: { width: finalWidth, height: finalHeight, channels: 4 } })
            .toFile(path.join(PUBLIC_SPRITES, 'props.png'));
        console.log('✓ Created props.png (Packed Strip)');
    } catch (e) {
        console.error('Props Error:', e);
    }
}

process();
