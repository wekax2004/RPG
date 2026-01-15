
import fs from 'fs';
import https from 'https';
import path from 'path';

const TARGET_DIR = path.join(process.cwd(), 'public', 'sprites');
const FILES = [
    'otsp_creatures_01.png',
    'otsp_equipment_01.png',
    'otsp_walls_01.png',
    'otsp_tiles_01.png'
];

const URL_CANDIDATES = [
    // Proven likely by search:
    'https://raw.githubusercontent.com/peonso/opentibia_sprite_pack/master/sprite_sheets',
    'https://raw.githubusercontent.com/peonso/opentibia_sprite_pack/main/sprite_sheets',
    // Fallbacks
    'https://raw.githubusercontent.com/peonso/opentibia_sprite_pack/master',
    'https://raw.githubusercontent.com/peonso/opentibia_sprite_pack/main',
];

// Ensure directory exists
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

function download(url, dest) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => resolve(true));
                });
            } else {
                file.close();
                fs.unlink(dest, () => { });
                resolve(false);
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            resolve(false);
        });
    });
}

async function processFile(filename) {
    console.log(`Processing ${filename}...`);
    for (const base of URL_CANDIDATES) {
        const url = `${base}/${filename}`;
        const success = await download(url, path.join(TARGET_DIR, filename));
        if (success) {
            console.log(`[SUCCESS] Downloaded ${filename} from ${base}`);
            return;
        }
    }
    console.error(`[FAILED] Could not find ${filename}`);
}

async function run() {
    for (const file of FILES) {
        await processFile(file);
    }
}

run();
