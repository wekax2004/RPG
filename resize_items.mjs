
import sharp from 'sharp';

const input = 'public/assets/items.png';
const output = 'public/assets/items_fixed.png'; // Temp output

async function process() {
    await sharp(input)
        .resize(64, 64, { fit: 'fill' }) // Force squeeze into 2x2 grid (64px total width/height)
        .toFile(output);
    console.log("Resized to 64x64.");
}
process();
