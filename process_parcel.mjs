
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/home/.gemini/antigravity/brain/e4165951-9c49-45e9-b7fa-5face25b532c/pixel_art_parcel_sprite_1768125130328.png';
const outputPath = 'public/sprites/parcel.png';

async function process() {
    try {
        const { data, info } = await sharp(inputPath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Iterate pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Threshold for white (e.g. > 240)
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // Set Alpha to 0
            }
        }

        await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .png()
            .toFile(outputPath);

        console.log('Processed parcel.png successfully.');
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

process();
