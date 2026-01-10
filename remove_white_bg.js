
import sharp from 'sharp';

async function process() {
    const INPUT = 'public/sprites/knight_sheet.png';
    const OUTPUT = 'public/sprites/knight_sheet_transparent.png';

    console.log(`Processing ${INPUT}...`);

    const image = sharp(INPUT);
    const metadata = await image.metadata();

    const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });

    let pixelCount = 0;

    // Iterate pixels (r, g, b, alpha)
    for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check for pure white (or near white)
        if (r > 250 && g > 250 && b > 250) {
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
