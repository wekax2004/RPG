
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df';
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

// Input Files
const GRASS = path.join(ARTIFACTS, 'tibia_grass_1768051841226.png');
const FLOWERS = path.join(ARTIFACTS, 'tibia_grass_flowers_1768051855516.png');
const PEBBLES = path.join(ARTIFACTS, 'tibia_grass_pebbles_1768051869229.png');
const WALL = path.join(ARTIFACTS, 'tibia_stone_wall_1768051883623.png');
const MARBLE = path.join(ARTIFACTS, 'tibia_marble_1768052168582.png');

async function stitchFloors() {
    console.log('Stitching Tibia Floor Strip (160x32)...');

    // Create blank canvas 160x32
    // [Grass 32][Flowers 32][Pebbles 32][Wall 32][Marble 32]

    // Resize ensures they are exactly 32x32
    const buffers = await Promise.all([GRASS, FLOWERS, PEBBLES, WALL, MARBLE].map(file =>
        sharp(file).resize(32, 32).toBuffer()
    ));

    await sharp({
        create: {
            width: 160, // 5 tiles * 32
            height: 32,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
        .composite([
            { input: buffers[0], left: 0, top: 0 },
            { input: buffers[1], left: 32, top: 0 },
            { input: buffers[2], left: 64, top: 0 },
            { input: buffers[3], left: 96, top: 0 },
            { input: buffers[4], left: 128, top: 0 }
        ])
        .toFile(path.join(OUTPUT_DIR, 'tibia_floors.png'));

    console.log('✓ Created public/sprites/tibia_floors.png');
}

stitchFloors().catch(console.error);
