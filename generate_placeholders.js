import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TILE_SIZE = 32;
// Vite serves public/ as root, so we check/create public/sprites
const OUTPUT_DIR = './public/sprites';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sprites = [
    { name: 'player_knight.png', color: '#FF0000', text: 'KNT' },
    { name: 'player_mage.png', color: '#0000FF', text: 'MAGE' },
    { name: 'player_ranger.png', color: '#00FF00', text: 'RNG' },
    { name: 'enemy_orc.png', color: '#556B2F', text: 'ORC' },
    { name: 'tile_grass.png', color: '#90EE90', text: '' },
    { name: 'tile_wall.png', color: '#808080', text: '#' },
];

async function generateSprite(sprite) {
    // SVG Template
    const svg = `
    <svg width="${TILE_SIZE}" height="${TILE_SIZE}" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${TILE_SIZE}" height="${TILE_SIZE}" fill="${sprite.color}" stroke="black" stroke-width="2"/>
        ${sprite.text ? `<text x="${TILE_SIZE / 2}" y="${TILE_SIZE / 2 + 4}" font-size="10" font-family="Arial" fill="white" text-anchor="middle" font-weight="bold">${sprite.text}</text>` : ''}
    </svg>`;

    const buffer = Buffer.from(svg);
    await sharp(buffer)
        .png()
        .toFile(path.join(OUTPUT_DIR, sprite.name));

    console.log(`Generated: ${sprite.name}`);
}

async function run() {
    for (const s of sprites) {
        await generateSprite(s);
    }
    console.log("All placeholders generated in public/sprites/");
}

run().catch(console.error);
