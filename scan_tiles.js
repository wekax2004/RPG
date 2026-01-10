
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TILES_PATH = path.join(__dirname, 'public/sprites/final_tiles.png');

async function scanEdges() {
    console.log(`Scanning Edges of ${TILES_PATH}...`);
    try {
        const { data, info } = await sharp(TILES_PATH)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const width = info.width;

        const checkPixel = (x, y) => {
            const idx = (y * width + x) * 4;
            return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
        };

        // Check Tile 0 (Grass) Boundaries (0,0 to 32,32)
        console.log("--- Tile 0 (Grass) Edge Check ---");
        // Right Edge (x=31)
        let rightEdgeVars = 0;
        for (let y = 0; y < 32; y++) {
            const p = checkPixel(31, y);
            const pNext = checkPixel(32, y); // Start of next tile (Flower)
            // Just comparing to see if there's a 'fading' line
        }

        // Bottom Edge (y=31)
        console.log("Bottom Row (y=31) vs Next Row (y=32):");
        for (let x = 10; x < 20; x++) { // Sample center
            const p = checkPixel(x, 31);
            const pNext = checkPixel(x, 32);
            console.log(`x=${x}: [${p}] vs [${pNext}]`);
        }

    } catch (e) {
        console.error(e);
    }
}

scanEdges();
