// src/main.ts
import { WorldMap } from './core/map';
import { Player } from './core/player';
import { PixelRenderer } from './client/renderer';
import { AssetManager } from './assets'; // reusing your existing asset loader
import { TILE_SIZE } from './core/types';

// --- CONFIGURATION ---
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;

// --- INITIALIZATION ---
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) throw new Error("No canvas found with id 'gameCanvas'");

// 1. The Assets
// We reuse your existing manager to load sprites
export const assetManager = new AssetManager();

// 2. The Core Systems
let map: WorldMap;
let player: Player;
let renderer: PixelRenderer;

// --- THE GAME LOOP ---
function gameLoop() {
    const now = Date.now();

    // A. Logic Tick
    // Try to execute the player's queued action (if movement delay is over)
    player.tick(map, now);

    // B. Render
    // We pass the player to the renderer so it knows where to center the camera
    renderer.draw(map, player);

    requestAnimationFrame(gameLoop);
}

// --- INPUT WIRING ---
// Connect Keyboard -> Player Action Queue
window.addEventListener('keydown', (e) => {
    // Prevent scrolling with arrows
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    // Map Keys to Directions
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            player.queueMove(0, -1); // North
            player.spriteId = 900; // PLAYER_BACK
            player.flipX = false;
            break;
        case 's':
        case 'ArrowDown':
            player.queueMove(0, 1);  // South
            player.spriteId = 0;   // PLAYER (Front)
            player.flipX = false;
            break;
        case 'a':
        case 'ArrowLeft':
            player.queueMove(-1, 0); // West
            player.spriteId = 901; // PLAYER_SIDE
            player.flipX = true;   // Flip for Left
            break;
        case 'd':
        case 'ArrowRight':
            player.queueMove(1, 0);  // East
            player.spriteId = 901; // PLAYER_SIDE
            player.flipX = false;  // No Flip for Right
            break;
    }
});

// Key Up to clear queue -> stops movement
window.addEventListener('keyup', (e) => {
    // Simple logic: if key release matches queue, stop.
    // Real engines use a stack of keys, but this is fine for Phase 6.
    switch (e.key) {
        case 'w': case 'ArrowUp':
            if (player.queuedDy === -1) player.queueMove(0, 0);
            break;
        case 's': case 'ArrowDown':
            if (player.queuedDy === 1) player.queueMove(0, 0);
            break;
        case 'a': case 'ArrowLeft':
            if (player.queuedDx === -1) player.queueMove(0, 0);
            break;
        case 'd': case 'ArrowRight':
            if (player.queuedDx === 1) player.queueMove(0, 0);
            break;
    }
});


// --- MOUSE WIRING (Right Click) ---
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    // 1. Calculate Grid Coordinates
    // (This logic depends on your Renderer's camera offset)
    const rect = canvas.getBoundingClientRect();
    const scale = renderer.getScale(); // Assuming your renderer handles scale

    // Get mouse relative to canvas
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top) / scale;

    // Convert to World Grid Coordinates
    // (We need the camera position from the renderer - calculated same way as in draw())
    const screenWidth = canvas.width;
    const screenHeight = canvas.height;
    const camX = Math.floor((player.x * TILE_SIZE) - (screenWidth / 2) + (TILE_SIZE / 2));
    const camY = Math.floor((player.y * TILE_SIZE) - (screenHeight / 2) + (TILE_SIZE / 2));

    const tileX = Math.floor((mx + camX) / TILE_SIZE);
    const tileY = Math.floor((my + camY) / TILE_SIZE);

    console.log(`Right Clicked Tile: ${tileX}, ${tileY}`);

    // 2. Trigger Interaction
    // interactionSystem.useItem(tileX, tileY, player, map);
    // (Importing execute script helper if we had it exposed, or for now just log)
    // To match prompt 5's interaction.ts usage:
    // useItem(tileX, tileY, player, map);

    // Since import wasn't in the provided code block, I will strictly follow the provided block
    // BUT I will add the import to make it work as requested in Phase 5 prompt context.
    // Actually, Phase 6 code block commented out the interaction line. I'll adhere to that.
});

// --- BOOTSTRAP ---
async function start() {
    console.log("[Main] Starting Engine...");

    // 1. Load Graphics
    if (assetManager.load) await assetManager.load();

    // 2. Build World
    map = new WorldMap(MAP_WIDTH, MAP_HEIGHT);
    map.generateSimpleMap(); // The test method you wrote in Phase 2

    // 3. Create Player (Center of Map)
    player = new Player(Math.floor(MAP_WIDTH / 2), Math.floor(MAP_HEIGHT / 2));

    // 4. Create Renderer
    renderer = new PixelRenderer(canvas);

    // 5. Start!
    console.log("[Main] Engine Running.");
    gameLoop();
}

start();

// --- SPRITE SLIDER TOOL (Debug) ---
// Use SHIFT + Arrow Keys / W / S to tune offsets
const DEBUG_SHEET = 'world_tiles';

window.addEventListener('keydown', (e) => {
    if (!e.shiftKey) return;

    const config = assetManager.getSheetConfig(DEBUG_SHEET);
    if (!config) return;

    let changed = false;

    // Offsets
    if (e.key === 'ArrowUp') { config.offsetY -= 1; changed = true; }
    if (e.key === 'ArrowDown') { config.offsetY += 1; changed = true; }
    if (e.key === 'ArrowLeft') { config.offsetX -= 1; changed = true; }
    if (e.key === 'ArrowRight') { config.offsetX += 1; changed = true; }

    // Stride
    if (config.stride === undefined) config.stride = 32;
    if (e.key === 'w' || e.key === 'W') { config.stride += 1; changed = true; }
    if (e.key === 's' || e.key === 'S') { config.stride -= 1; changed = true; }

    if (changed) {
        e.preventDefault();
        assetManager.rebuildCache();
        console.clear();
        console.log(`[Sprite Tool] Sheet: ${DEBUG_SHEET} | Stride: ${config.stride} | Offset: ${config.offsetX}, ${config.offsetY}`);
        console.log(`COPY: this.sheetConfigs.set('${DEBUG_SHEET}', { tileSize: 32, stride: ${config.stride}, offsetX: ${config.offsetX}, offsetY: ${config.offsetY} });`);
    }
});
