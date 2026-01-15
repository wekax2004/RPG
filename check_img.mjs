
import sharp from 'sharp';

const path = 'public/assets/items.png';

async function check() {
    try {
        const metadata = await sharp(path).metadata();
        console.log(`Dimensions: ${metadata.width}x${metadata.height}`);
    } catch (e) {
        console.error(e);
    }
}
check();
