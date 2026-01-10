
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_SPRITES = path.join(__dirname, '../public/sprites');

function encode(filename) {
    const filePath = path.join(PUBLIC_SPRITES, filename);
    if (fs.existsSync(filePath)) {
        const bitmap = fs.readFileSync(filePath);
        return `data:image/png;base64,${bitmap.toString('base64')}`;
    }
    return null;
}

const tree = encode('tree.png');
const chest = encode('chest.png');
const rock = encode('rock.png');

console.log('--- TREE ---');
console.log(tree);
console.log('--- CHEST ---');
console.log(chest);
console.log('--- ROCK ---');
console.log(rock);
