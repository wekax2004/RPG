// src/main.ts
import { AssetManager, assetManager, SPRITES } from './assets';
import { PixelRenderer } from './client/renderer';
import { WorldMap } from './core/map';
import { Player } from './core/player';
import { TILE_SIZE, Item, Tile } from './core/types';
import { World, InputHandler } from './engine';
import { inputSystem, interactionSystem, createNPC, autoAttackSystem } from './game';
import { UIManager } from './ui';
import { Position, PlayerControllable, Inventory, Passives, Velocity, Sprite, Health, Mana, Experience, QuestLog, AI, Name, SpellBook, SkillPoints, ActiveSpell } from './components';
import { useItem } from './core/interaction';

// --- CONFIGURATION ---
export const CANVAS_WIDTH = 800;
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;

// --- INITIALIZATION ---
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) throw new Error("No canvas found with id 'gameCanvas'");

// 2. The Core Systems
let map: WorldMap;
let player: Player; // This is the "Visual" player (for Renderer)
let renderer: PixelRenderer;
export let world: World;
let input: InputHandler;
let ui: UIManager;

// --- THE GAME LOOP ---
let lastTime = Date.now();

function gameLoop() {
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // 1. Systems Update
    if (world && input) {
        // Core Systems
        inputSystem(world, input);
        interactionSystem(world, input, ui);
        autoAttackSystem(world, dt, ui); // NEW: Auto Combat

        // Sync ECS Position back to Visual Player
        // This ensures the Renderer (which uses 'player' class) sees the ECS movement
        const pEnt = world.query([PlayerControllable, Position])[0];
        if (pEnt !== undefined) {
            const pPos = world.getComponent(pEnt, Position)!;
            const pSprite = world.getComponent(pEnt, Sprite);
            // Sync Visual Player -> ECS Position (Trusting Legacy Tick for now)
            pPos.x = player.x * TILE_SIZE;
            pPos.y = player.y * TILE_SIZE;

            // Sync ECS Sprite -> Visual Player (Animation)
            if (pSprite) {
                player.spriteId = pSprite.uIndex;
                player.flipX = pSprite.flipX;
                player.frame = pSprite.frame;
            }
        }
    }

    // A. Logic Tick (Handles Visual Player Movement)
    player.tick(map, now);

    // B. Render
    renderer.draw(map, player);

    // Update Input State
    if (input) input.update();

    requestAnimationFrame(gameLoop);
}

// --- INPUT WIRING ---
// Legacy Player Control (Visual Player)
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    // Visual Player Control
    switch (e.key) {
        case 'w': case 'ArrowUp':
            player.queueMove(0, -1);
            player.spriteId = SPRITES.PLAYER_UP;
            player.flipX = false;
            break;
        case 's': case 'ArrowDown':
            player.queueMove(0, 1);
            player.spriteId = SPRITES.PLAYER_DOWN;
            player.flipX = false;
            break;
        case 'a': case 'ArrowLeft':
            player.queueMove(-1, 0);
            player.spriteId = SPRITES.PLAYER_LEFT;
            player.flipX = false; // No flip needed as we have a dedicated row
            break;
        case 'd': case 'ArrowRight':
            player.queueMove(1, 0);
            player.spriteId = SPRITES.PLAYER_RIGHT;
            player.flipX = false;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    // Legacy support if needed
});

// Context Menu (Right Click) -> Interaction
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scale = renderer.getScale();
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top) / scale;

    const screenWidth = canvas.width;
    const screenHeight = canvas.height;

    // Camera is centered on player
    const camX = Math.floor((player.x * TILE_SIZE) - (screenWidth / 2) + (TILE_SIZE / 2));
    const camY = Math.floor((player.y * TILE_SIZE) - (screenHeight / 2) + (TILE_SIZE / 2));

    const tileX = Math.floor((mx + camX) / TILE_SIZE);
    const tileY = Math.floor((my + camY) / TILE_SIZE);

    console.log(`Right Clicked Tile: ${tileX}, ${tileY}`);

    // MOUSE INSPECTOR: Log what is actually here
    if (map && tileX >= 0 && tileX < map.width && tileY >= 0 && tileY < map.height) {
        const tile = map.getTile(tileX, tileY);
        console.log(`[INSPECTOR] Tile at ${tileX},${tileY} contains:`);
        tile?.items.forEach((item, idx) => {
            console.log(`   - Item ${idx}: ID ${item.id} (Count: ${item.count})`);
        });
    }

    // Trigger Interaction
    const playerEntities = world.query([PlayerControllable]);
    const pEntity = playerEntities[0];
    if (typeof pEntity !== 'undefined') {
        const inv = world.getComponent(pEntity, Inventory);
        const passives = world.getComponent(pEntity, Passives);
        useItem(tileX, tileY, player, map, inv, passives);
    } else {
        useItem(tileX, tileY, player, map);
    }
});

// --- BOOTSTRAP ---
// --- BOOTSTRAP ---
import { generateOverworld } from './map_gen';
import { getSavedSeed } from './save';
import { RNG } from './rng';
import { loadGame, hasSave } from './save'; // Ensure loadGame is imported

async function start() {
    console.log("[Main] Starting Engine...");

    if (assetManager.load) await assetManager.load();

    // 2. Build World (Deterministic)
    let seed = getSavedSeed();
    if (seed === null) {
        seed = Math.floor(Math.random() * 10000);
        console.log(`[Main] New World Seed: ${seed}`);
    } else {
        console.log(`[Main] Loading World Seed: ${seed}`);
    }

    // Use Advanced Map Generator
    const genResult = generateOverworld(MAP_WIDTH, MAP_HEIGHT, seed);

    map = new WorldMap(MAP_WIDTH, MAP_HEIGHT);
    // Convert Gen Tiles (Component-style) to Core Tiles
    map.tiles = []; // Clear default

    for (const genTile of genResult.tiles) {
        // genTile is component-style: { items: [{id: 16}, {id: 18}] } (TileItem)
        // Core Tile expects: new Tile(groundId)

        // Find ground (first item)
        const groundId = genTile.items.length > 0 ? genTile.items[0].id : 0;
        const coreTile = new Tile(groundId);

        // Add remaining items
        for (let i = 1; i < genTile.items.length; i++) {
            coreTile.addItem(new Item(genTile.items[i].id));
        }

        map.tiles.push(coreTile);
    }
    console.log("[Main] Map Converted & Loaded.");

    // 3. ECS Setup
    world = new World();
    input = new InputHandler(); // Self-attaches listeners
    ui = new UIManager();

    // Create ECS Player
    const pe = world.createEntity();
    world.addComponent(pe, new PlayerControllable());
    world.addComponent(pe, new Position(0, 0)); // Will be overwritten
    world.addComponent(pe, new Velocity(0, 0));
    world.addComponent(pe, new Sprite(0));
    world.addComponent(pe, new Inventory());
    world.addComponent(pe, new Passives());
    world.addComponent(pe, new Health(100, 100));
    world.addComponent(pe, new Mana(50, 50));
    world.addComponent(pe, new Experience(0, 100, 1));
    world.addComponent(pe, new QuestLog());
    const sb = new SpellBook();
    if (!sb.knownSpells.has("Fireball")) sb.knownSpells.set("Fireball", 1);
    world.addComponent(pe, sb);
    world.addComponent(pe, new ActiveSpell("adori flam"));
    world.addComponent(pe, new SkillPoints(0, 0));

    // 4. Create Visual Player
    player = new Player(Math.floor(MAP_WIDTH / 2), Math.floor(MAP_HEIGHT / 2));

    // 5. Create Renderer
    renderer = new PixelRenderer(canvas);

    // 6. Spawn Map Entities (Enemies/NPCs)
    for (const ent of genResult.entities) {
        if (ent.type === 'enemy') {
            const e = world.createEntity();
            world.addComponent(e, new Position(ent.x, ent.y));
            world.addComponent(e, new Health(50, 50));
            // Sprite mapping needed for 'enemyType'? 
            // MapGen uses 9 for Orc. 
            // assets.ts maps 9 to... wait. 9 is not mapped in assets.ts?
            // Let's assume standard enemy sprite for now.
            world.addComponent(e, new Sprite(SPRITES.ORC || 120)); // Fallback
            world.addComponent(e, new AI(30, 'melee', 40));
            world.addComponent(e, new Name("Orc"));
        }
    }

    // 6b. Test NPCs (Keep existing)
    createNPC(world, 10, 10, "Hello", "Villager");

    // 7. Load Save if exists
    if (hasSave()) {
        if (loadGame(world, ui)) {
            // Sync Visual Player to Loaded Pos
            const pPos = world.getComponent(pe, Position)!;
            player.x = pPos.x / TILE_SIZE;
            player.y = pPos.y / TILE_SIZE;
            console.log("[Main] Save Loaded.");
        }
    } else {
        // Sync Initial Pos (Center)
        const pPos = world.getComponent(pe, Position)!;
        pPos.x = player.x * TILE_SIZE;
        pPos.y = player.y * TILE_SIZE;

        // Give starter gear
        const inv = world.getComponent(pe, Inventory)!;
        inv.gold = 50;
    }

    // FORCE DEBUG REMOVED

    console.log("[Main] Engine Running.");
    gameLoop();
}

start();

// --- DEBUG TOOL ---
const DEBUG_SHEET = 'world_tiles';
window.addEventListener('keydown', (e) => {
    if (!e.shiftKey) return;
    const config = assetManager.getSheetConfig(DEBUG_SHEET);
    if (!config) return;
    const step = 1;
    if (e.key === 'ArrowUp') config.offsetY -= step;
    if (e.key === 'ArrowDown') config.offsetY += step;
    if (e.key === 'ArrowLeft') config.offsetX -= step;
    if (e.key === 'ArrowRight') config.offsetX += step;
    if (e.key === 'w' || e.key === 'W') if (config.stride) config.stride += 1;
    if (e.key === 's' || e.key === 'S') if (config.stride) config.stride -= 1;
    assetManager.rebuildCache();
});
