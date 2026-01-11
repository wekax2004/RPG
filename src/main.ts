// src/main.ts
import { AssetManager, assetManager, SPRITES } from './assets';
import { PixelRenderer } from './client/renderer';
import { WorldMap } from './core/map';
import { Player } from './core/player';
import { TILE_SIZE, Item, Tile } from './core/types';
import { World, InputHandler } from './engine';
// 1. Import moveItem
import { inputSystem, interactionSystem, createNPC, autoAttackSystem, movementSystem, cameraSystem, moveItem, deathSystem, enemyCombatSystem, projectileSystem, spawnDebugSet } from './game';


import { PHYSICS } from './physics';
import { AudioController } from './audio';
import { UIManager } from './client/ui_manager';
import { Position, PlayerControllable, Inventory, Passives, Velocity, Sprite, Health, Mana, Experience, QuestLog, AI, Name, SpellBook, SkillPoints, ActiveSpell, TileMap, Tile as CompTile, TileItem as CompTileItem, Stats, CombatState, Target } from './components';
import { useItem } from './core/interaction';
import { combatSystem } from './core/combat_system';
import { damageTextManager } from './client/damage_text';

// --- CONFIGURATION ---
export const CANVAS_WIDTH = 800;
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;

// --- INITIALIZATION ---
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) throw new Error("No canvas found with id 'gameCanvas'");

// 1. Resize Logic (Flexbox Support)
function resize() {
    const container = document.getElementById('viewport');
    if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
}
window.addEventListener('resize', resize);
resize(); // Call once at startup

// 2. The Core Systems
let map: WorldMap;
let player: Player; // This is the "Visual" player (for Renderer)
let renderer: PixelRenderer;
export let world: World;
let input: InputHandler;
let ui: UIManager;

// --- THE GAME LOOP ---
let lastTime = Date.now();
const audio = new AudioController();

function gameLoop() {
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // 1. Systems Update
    if (world && input) {
        // Core Systems
        inputSystem(world, input);
        interactionSystem(world, input, ui);

        // COMBAT SYSTEMS
        autoAttackSystem(world, dt, ui); // Player Auto Attack
        projectileSystem(world, dt, ui, audio); // Projectiles
        enemyCombatSystem(world, dt, ui, audio); // Enemy Melee
        deathSystem(world, ui); // Handle Deaths (Respawn)

        // FIXED: Call Movement & Camera Systems (Was missing!)
        // audio needed for movementSystem footstep sounds
        // const audio = new AudioController(); // Simple init per frame (should be outside loop ideally, but safe for now given AudioController is likely class-based singleton or stateless enough)
        movementSystem(world, dt, audio);
        cameraSystem(world, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

        // Sync ECS Position back to Visual Player
        // This ensures the Renderer (which uses 'player' class) sees the ECS movement
        const pEnt = world.query([PlayerControllable, Position])[0];
        if (pEnt !== undefined) {
            const pPos = world.getComponent(pEnt, Position)!;
            const pSprite = world.getComponent(pEnt, Sprite);
            // Sync Visual Player -> ECS Position (Trusting Legacy Tick for now)
            // FIXED: Sync ECS -> Visual Player (ECS is Authority)
            player.x = pPos.x / TILE_SIZE;
            player.y = pPos.y / TILE_SIZE;

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
// --- INPUT WIRING ---
// Legacy Player Control removed in favor of ECS InputSystem
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }
});

// Sync Logic Update in gameLoop (lines 52-53)
// pPos.x = player.x * TILE_SIZE; -> REMOVED


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

    // 2. ECS Setup (Before Map)
    world = new World();
    input = new InputHandler(); // Self-attaches listeners
    ui = new UIManager();
    // ui.update(player); // Initial sync? Need player first.

    // 3. Build World (Deterministic)
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

    // CRITICAL: Add Map to ECS for Movement System
    const mapEnt = world.createEntity();
    const mapComp = new TileMap(map.width, map.height, TILE_SIZE);

    // Convert Core Tiles (types.ts) to Component Tiles (components.ts)
    mapComp.tiles = map.tiles.map(coreTile => {
        const cTile = new CompTile();
        // CoreTile items might be objects? coreTile.items: Item[]
        // CompTile items: TileItem[] (id, count)
        // Check Core Tile implementation. Assuming coreTile.items has .id
        coreTile.items.forEach(it => {
            cTile.add(it.id);
        });
        return cTile;
    });

    world.addComponent(mapEnt, mapComp);

    console.log("[Main] Map Converted & Loaded.");

    // 3. ECS Setup (Moved Up)

    // Create ECS Player
    const pe = world.createEntity();
    world.addComponent(pe, new PlayerControllable());
    // FIXED: Find a safe spawn point (first floor tile)
    let safeX = Math.floor(MAP_WIDTH / 2) * TILE_SIZE;
    let safeY = Math.floor(MAP_HEIGHT / 2) * TILE_SIZE;

    if (genResult && genResult.tiles) { // FIXED: Access tiles directly
        const { tiles, width } = genResult;
        // Search for a valid floor tile near center, spiraling out or just linear scan
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];

            // ROBUST CHECK: Is this tile solid?
            let isSolid = false;
            const itemIds = [];
            for (const item of tile.items) {
                itemIds.push(item.id);
                if (PHYSICS.isSolid(item.id)) {
                    isSolid = true;
                    // Don't break immediately so we can see all items in debug if needed
                    // but for perf we should. For debugging now, let's capture IDs.
                }
            }

            if (!isSolid) {
                // Try to find one not on the very edge (skip first few rows)
                if (i > width * 3) {
                    safeX = (i % width) * TILE_SIZE;
                    safeY = Math.floor(i / width) * TILE_SIZE;
                    console.log(`[Spawn] Found Safe Spot at ${safeX},${safeY} (Index ${i}). Tile Items: [${itemIds.join(', ')}]`);
                    break;
                }
            }
        }
    }

    world.addComponent(pe, new Position(safeX, safeY));
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
    world.addComponent(pe, new SkillPoints(0, 0));
    world.addComponent(pe, new Stats(10, 5, 1.5)); // Attack: 10, Def: 5, Spd: 1.5
    world.addComponent(pe, new CombatState());
    world.addComponent(pe, new Target(null));
    console.log("[Main] ECS Player Created.");

    // 4. Create Visual Player
    player = new Player(safeX / TILE_SIZE, safeY / TILE_SIZE);
    player.id = pe; // Link ECS ID
    console.log("[Main] Visual Player Created.");

    // 5. Create Renderer
    renderer = new PixelRenderer(canvas);
    console.log("[Main] Renderer Created.");

    // 6. Spawn Map Entities (Enemies/NPCs)
    if (genResult.entities) {
        console.log(`[Main] Spawning ${genResult.entities.length} Entities...`);
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
    } else {
        console.log("[Main] No entities in map generation.");
    }

    // DEBUG: Force Spawn an Orc NEAR the safe spot
    const debugOrc = world.createEntity();
    world.addComponent(debugOrc, new Position(safeX + 64, safeY)); // 2 tiles right
    world.addComponent(debugOrc, new Sprite(9)); // ORC
    world.addComponent(debugOrc, new Health(100, 100));
    world.addComponent(debugOrc, new AI(30, 'melee', 40));
    world.addComponent(debugOrc, new AI(30, 'melee', 40));
    world.addComponent(debugOrc, new Name("Debug Orc"));
    world.addComponent(debugOrc, new Stats(8, 2, 0.8)); // Weak Orc
    console.log(`[Main] Spawning Debug Orc at ${safeX + 64}, ${safeY}`);

    // 6b. Test NPCs (Keep existing)
    createNPC(world, 10, 10, "Hello", "Villager");
    console.log("[Main] NPC Created.");

    // 7. Load Save if exists

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

    // 8. Game Wrapper (Bridge to User's Architecture Request)
    const game = {
        update: (dt: number) => {
            if (world && input) {
                // RUN SYSTEMS
                inputSystem(world, input); // Set Velocity from Input (NOW WORKING)
                interactionSystem(world, input, ui);
                // autoAttackSystem(world, dt, ui); // Legacy
                combatSystem(world); // New Combat System

                // Movement & Physics
                movementSystem(world, dt, audio);
                cameraSystem(world, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

                // SYNC: ECS Authority -> Visual Player
                if (pe !== undefined && player) {
                    const pPos = world.getComponent(pe, Position);
                    const pSprite = world.getComponent(pe, Sprite);
                    const pHp = world.getComponent(pe, Health);
                    const pMana = world.getComponent(pe, Mana);
                    const pXp = world.getComponent(pe, Experience);
                    const pInv = world.getComponent(pe, Inventory);

                    if (pPos) {
                        player.x = pPos.x / TILE_SIZE;
                        player.y = pPos.y / TILE_SIZE;
                    }
                    if (pSprite) {
                        player.spriteId = pSprite.uIndex;
                        player.frame = pSprite.frame;
                        player.direction = pSprite.direction;
                    }

                    // Sync Stats
                    if (pHp) { player.hp = pHp.current; player.maxHp = pHp.max; }
                    if (pMana) { player.mana = pMana.current; player.maxMana = pMana.max; }
                    if (pXp) { player.xp = pXp.current; player.nextXp = pXp.next; player.level = pXp.level; }
                    if (pXp) { player.xp = pXp.current; player.nextXp = pXp.next; player.level = pXp.level; }
                    if (pInv) { player.gold = pInv.gold; player.capacity = pInv.cap; }

                    // Sync Visual Target -> ECS Target (User clicks UI -> Player.targetId -> ECS Logic)
                    const pTarget = world.getComponent(pe, Target);
                    if (pTarget) {
                        // 1. Validate Visual Target Existence/Health
                        if (player.targetId !== null) {
                            const tHealth = world.getComponent(player.targetId, Health);
                            // If target doesn't exist or is dead, clear visual target
                            if (!tHealth || tHealth.current <= 0) {
                                player.targetId = null;
                            }
                        }

                        // 2. Sync State: Visual -> ECS
                        // This ensures that if we validly clicked something, the ECS knows.
                        // If we cleared it (or it died), ECS gets null.
                        if (pTarget.targetId !== player.targetId) {
                            pTarget.targetId = player.targetId;
                        }
                    }
                }

                // Calc Camera
                const screenWidth = canvas.width;
                const screenHeight = canvas.height;
                game.camera = {
                    x: Math.floor((player.x * TILE_SIZE) - (screenWidth / 2) + (TILE_SIZE / 2)),
                    y: Math.floor((player.y * TILE_SIZE) - (screenHeight / 2) + (TILE_SIZE / 2))
                };
            }
        },
        map: map,
        player: player,
        camera: { x: 0, y: 0 },
        // EXPOSED FOR DRAG & DROP
        world: world,
        ui: ui,
        input: input,
        moveItem: moveItem,
        spawnDebugSet: () => spawnDebugSet(world, ui),
        getItemAt: (source: any) => {
            if (source.type === 'ground') {
                const tile = map.getTile(source.x, source.y);
                if (tile && tile.items.length > 0) {
                    const item = tile.items[tile.items.length - 1];
                    if (item.id !== 0) return item;
                    // Try input below player if stacked?
                    if (tile.items.length > 1) return tile.items[tile.items.length - 2];
                }
            } else if (source.type === 'slot') {
                // Needs Inventory Component Access
                // We can get it from the Player Entity in World
                const pEnt = world.query([PlayerControllable, Inventory])[0];
                if (pEnt !== undefined) {
                    const inv = world.getComponent(pEnt, Inventory)!;
                    const slotName = source.id.replace('slot-', '');
                    const equipped = inv.getEquipped(slotName);
                    if (equipped) return equipped.item;
                }
            }
            return null;
        }
    };

    // EXPOSE FOR DEBUG/CONSOLE
    (window as any).game = game;

    // --- DEBUG LISTENER (Requested by User) ---
    window.addEventListener('keydown', (e) => {
        // Press 'P' to Spawn Debug Items
        if (e.code === 'KeyP') {
            console.log("[Debug] Spawning Set...");
            game.spawnDebugSet();
        }
    });

    // --- MOUSE LISTENERS ---
    if (canvas) {
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // Look
            const m = input.getMouseWorldCoordinates(game.camera);
            const tile = map.getTile(m.x, m.y);

            if (tile) {
                // Find top item
                const topItem = tile.items[tile.items.length - 1];
                if (topItem) {
                    if (topItem.id === 0) {
                        ui.log("You see yourself.");
                    } else if (topItem.id === 17 || topItem.id === 20 || topItem.id === 21) {
                        ui.log("You see a wall.");
                    } else {
                        ui.log(`You see item ID ${topItem.id}.`);
                    }
                } else {
                    ui.log("You see nothing.");
                }
            } else {
                ui.log("You see the void.");
            }
        });
    }

    // --- THE GAME LOOP (CLEAN) ---
    let lastTime = Date.now();

    function loop() {
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // 1. UPDATE
        game.update(dt);

        // 2. RENDER
        // 2. RENDER
        const m = input.getMouseWorldCoordinates(game.camera);

        // Prep Visible Entities for Renderer & Battle List
        // We need to query POSITION + SPRITE + NAME (for battle list) + HEALTH (for alive check)
        // Renderer needs {x,y,sprite,id}
        // UI needs {id} (it queries components internally if we pass world, OR we pass enriched objects)
        // UI Manager `updateBattleList` takes `entities: Entity[], world: World, player: Player`
        // Renderer `draw` takes `visibleEntities: any[], world: any`

        const renderEntities: any[] = [];
        const battleEntities: number[] = [];

        if (world) {
            const allEnts = world.query([Position, Sprite]);
            // DEBUG: Log entity count every 2 seconds
            if (Date.now() % 2000 < 20) {
                console.log('[Main] Entity Query: Found', allEnts.length, 'entities with Position+Sprite');
            }
            allEnts.forEach(eid => {
                // Skip Player (handled separately in Renderer for now, though ideally merged)
                // Start with skipping player controllable
                // We can check if it has PlayerControllable
                if (world.getComponent(eid, PlayerControllable)) return;

                const pos = world.getComponent(eid, Position)!;
                const spr = world.getComponent(eid, Sprite)!;

                // Frustum Cull? Or just pass all? Start with all.
                renderEntities.push({
                    id: eid,
                    x: pos.x,
                    y: pos.y,
                    spriteIndex: spr.uIndex // Note: uIndex is the sprite ID
                });

                // For Battle List, we need Name + Health
                if (world.getComponent(eid, Name) && world.getComponent(eid, Health)) {
                    battleEntities.push(eid);
                }
            });
        }

        // DEBUG: Log render entity count periodically
        if (Date.now() % 2000 < 20) {
            console.log('[Main] Render Entities:', renderEntities.length, 'Battle Entities:', battleEntities.length);
            if (renderEntities.length > 0) {
                console.log('[Main] First Render Entity:', JSON.stringify(renderEntities[0]));
            }
        }

        renderer.draw(game.map, game.player, renderEntities, world);

        ui.update(game.player);
        ui.updateBattleList(battleEntities, world, game.player);
        // ui.update(game.player); // REMOVED DUPLICATE
        // ui.updateBattleList(battleEntities, world, game.player); // REMOVED DUPLICATE
        ui.renderMinimap(game.map, game.player);
        damageTextManager.update(dt);

        // 3. REPEAT
        requestAnimationFrame(loop);
    }


    console.log("[Main] Engine Running.");
    loop();
} // Close start() function

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
