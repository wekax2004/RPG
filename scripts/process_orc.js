
import sharp from 'sharp';
import path from 'path';

async function process() {
    const INPUT = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/orc_sprite_new_1768080592896.png';
    const OUTPUT = 'public/sprites/orc_new.png';

    console.log(`Processing ${INPUT}...`);

    const image = sharp(INPUT);
    const metadata = await image.metadata();

    const { data, info } = await image
        .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }) // Ensure 32x32
        .raw()
        .toBuffer({ resolveWithObject: true });

    let pixelCount = 0;

    // Iterate pixels (r, g, b, alpha)
    for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check for pure white (or near white)
        if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Set Alpha to 0
            pixelCount++;
        }
    }

    console.log(`Made ${pixelCount} pixels transparent.`);

    await sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: info.channels
        }
    })
        .png()
        .toFile(OUTPUT);

    console.log(`Saved to ${OUTPUT}`);
}

process().catch(err => console.error(err));
