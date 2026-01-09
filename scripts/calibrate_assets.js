import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSET_DIR = path.resolve(__dirname, '../public/assets');

async function getPixelColor(imageBuffer, width, x, y) {
    // Sharp provides raw buffer: [r, g, b, a, r, g, b, a...]
    // Index = (y * width + x) * 4
    if (x >= width) return null;
    const idx = (y * width + x) * 4;
    return {
        r: imageBuffer[idx],
        g: imageBuffer[idx + 1],
        b: imageBuffer[idx + 2],
        a: imageBuffer[idx + 3]
    };
}

async function calibrate() {
    console.log("--- Calibrating Assets ---");

    // 1. Forest (Expect: 32px Grid, 30px Content. Find Offset)
    try {
        const forestPath = path.join(ASSET_DIR, 'forest.png');
        const { data, info } = await sharp(forestPath).raw().toBuffer({ resolveWithObject: true });

        console.log(`[Forest] ${info.width}x${info.height}`);

        // Scan looking for the first "Green" pixel (Grass) near 0,0 and 32,32
        // We expect a white grid (R=255, G=255, B=255)

        let foundStart = false;
        let startX = 0;
        let startY = 0;

        // Scan purely the diagonal to find first non-white pixel
        for (let i = 0; i < 40; i++) {
            const px = await getPixelColor(data, info.width, i, i);
            const isWhite = px.r > 250 && px.g > 250 && px.b > 250;
            if (!isWhite) {
                console.log(`[Forest] First non-white pixel at ${i},${i} (RGBA: ${px.r},${px.g},${px.b},${px.a})`);
                startX = i;
                startY = i;
                foundStart = true;
                break;
            }
        }

        if (foundStart) {
            console.log(`[Forest] Candidate Offset: ${startX}`);
            // Verify if Stride 32 holds
            // If Offset is 1. Content is 1..30. 31 is Line. 32 is Line?
            // Check pixel at StartX + 32
            const nextPx = await getPixelColor(data, info.width, startX + 32, startY + 32);
            console.log(`[Forest] Pixel at Stride 32 (${startX + 32}): RGBA ${nextPx.r},${nextPx.g},${nextPx.b},${nextPx.a}`);
        }

    } catch (e) {
        console.error("[Forest] Error:", e.message);
    }

    // 2. Mage (Expect: 64px Grid. Find Offset)
    try {
        const magePath = path.join(ASSET_DIR, 'mage.png');
        const { data, info } = await sharp(magePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        console.log(`[Mage] ${info.width}x${info.height}`);

        // Check if 0,0 is transparent
        const p0 = await getPixelColor(data, info.width, 0, 0);
        console.log(`[Mage] Pixel 0,0: A=${p0.a}`);

        if (p0.a === 0) {
            // Find first non-transparent
            // Scan columns then rows
            let found = false;
            for (let y = 0; y < 64; y += 2) { // Step 2 for speed
                for (let x = 0; x < 64; x += 2) {
                    const px = await getPixelColor(data, info.width, x, y);
                    if (px.a > 0) {
                        console.log(`[Mage] First Content at ${x},${y}`);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        } else {
            console.log("[Mage] Content starts immediately at 0,0.");
        }

        // Check Stride 64
        // Check center of Tile 0 vs Tile 1
        // Tile 0 Center: 32, 32
        // Tile 1 Center: 96, 32
        const c0 = await getPixelColor(data, info.width, 32, 32);
        const c1 = await getPixelColor(data, info.width, 96, 32);
        console.log(`[Mage] Center Tile 0 (32,32) Alpha: ${c0.a}`);
        console.log(`[Mage] Center Tile 1 (96,32) Alpha: ${c1.a}`);

    } catch (e) {
        console.error("[Mage] Error:", e.message);
    }
}

calibrate();
