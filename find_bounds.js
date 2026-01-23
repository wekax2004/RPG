
import sharp from 'sharp';
import path from 'path';

const imagePath = 'public/tiles/edron/lamp_post.png';

async function analyze() {
    try {
        const { data, info } = await sharp(imagePath)
            .raw()
            .toBuffer({ resolveWithObject: true });

        const getPixel = (x, y) => {
            const idx = (y * info.width + x) * info.channels;
            return {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2],
                a: info.channels === 4 ? data[idx + 3] : 255
            };
        };

        console.log(`Image: ${info.width}x${info.height}, Channels: ${info.channels}`);

        console.log('Top-Left (0,0):', getPixel(0, 0));
        console.log('Top-Right (1023,0):', getPixel(1023, 0));
        console.log('Bottom-Left (0,1023):', getPixel(0, 1023));
        console.log('Bottom-Right (1023,1023):', getPixel(1023, 1023));
        console.log('Center (512,512):', getPixel(512, 512));

        // Scan for non-dark content (custom threshold)
        const THRESHOLD = 80; // aggressively ignore dark gray
        let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
        let count = 0;

        for (let y = 0; y < info.height; y++) {
            for (let x = 0; x < info.width; x++) {
                const p = getPixel(x, y);
                if (p.r > THRESHOLD || p.g > THRESHOLD || p.b > THRESHOLD) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    count++;
                }
            }
        }

        if (count > 0) {
            console.log(`Content found (>${THRESHOLD}):`);
            console.log(`Bounds: x=[${minX}, ${maxX}], y=[${minY}, ${maxY}]`);
            console.log(`Width: ${maxX - minX + 1}, Height: ${maxY - minY + 1}`);
            console.log(`Center of content: ${Math.floor((minX + maxX) / 2)}, ${Math.floor((minY + maxY) / 2)}`);
        } else {
            console.log(`No content found above threshold ${THRESHOLD}`);
        }

    } catch (err) {
        console.error(err);
    }
}

analyze();
