
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df';
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

// Optimization: COMPLETE FOREST SET (Darker Grass & Continuous Wall + Matching Props)
const WALL_SRC = path.join(ARTIFACTS, 'tibia_wall_continuous_1768054852802.png');
const GRASS_SRC = path.join(ARTIFACTS, 'tibia_grass_darker_seamless_1768054838672.png');
const TREE_SRC = path.join(ARTIFACTS, 'tibia_tree_forest_1768054972047.png');
const ROCK_SRC = path.join(ARTIFACTS, 'tibia_rock_forest_1768054989146.png');
const CHEST_SRC = path.join(ARTIFACTS, 'tibia_chest_forest_1768055006565.png');
const FLOWERS_SRC = path.join(ARTIFACTS, 'tibia_forest_flowers_1768055038040.png');
const PEBBLES_SRC = path.join(ARTIFACTS, 'tibia_forest_pebbles_1768055051345.png');

async function processElement(src, name, w, h, fitType = 'fill', removeBg = false) {
    try {
        let image = sharp(src).ensureAlpha();

        if (removeBg) {
            const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

            // Chroma Key: Sample Top-Left Pixel
            const r0 = data[0];
            const g0 = data[1];
            const b0 = data[2];
            const threshold = 15; // Strict match

            let cleared = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (Math.abs(r - r0) < threshold &&
                    Math.abs(g - g0) < threshold &&
                    Math.abs(b - b0) < threshold) {
                    data[i + 3] = 0; // Set Alpha to 0
                    cleared++;
                }
            }
            console.log(`[${name}] Removed background (${cleared} pixels).`);
            image = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
        }

        await image
            .resize(w, h, { fit: fitType, background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(path.join(OUTPUT_DIR, name));

        console.log(`[${name}] Deployed.`);
    } catch (err) {
        console.error(`Error processing ${name}:`, err);
    }
}

async function processAssets() {
    console.log('Processing Full Forest Asset Set (With BG Removal)...');

    // 1. World Tiles (Backgrounds -> No Transparency Needed)
    await processElement(WALL_SRC, 'wall.png', 32, 64, 'fill', false);
    await processElement(GRASS_SRC, 'grass.png', 32, 32, 'fill', false);
    await processElement(FLOWERS_SRC, 'grass_flowers.png', 32, 32, 'fill', false);
    await processElement(PEBBLES_SRC, 'grass_pebbles.png', 32, 32, 'fill', false);

    // 2. Props (Needs Transparency!)
    // We pass true to remove the generated background color
    await processElement(TREE_SRC, 'tree.png', 32, 64, 'contain', true);
    await processElement(ROCK_SRC, 'rock.png', 32, 32, 'contain', true);
    await processElement(CHEST_SRC, 'chest.png', 32, 32, 'contain', true);
}

processAssets().catch(console.error);
