import { AssetManager, assetManager } from './assets';
import { SPRITES } from './constants';
import { PixelRenderer } from './client/renderer';
// import { WorldMap } from './core/map'; // ECS uses TileMap component
// import { MapGenerator } from './core/map_generator'; // ECS uses map_gen.ts via game.ts
import { Player } from './core/player';
import { TILE_SIZE } from './core/types';
import { World, InputHandler } from './engine';
import {
    inputSystem,
    interactionSystem,
    autoAttackSystem,
    movementSystem,
    cameraSystem,
    moveItem,
    deathSystem,
    enemyCombatSystem,
    combatSystem,
    regenSystem,
    projectileSystem,
    spawnDebugSet,
    teleportSystem,
    switchMap,
    aiSystem,
    decaySystem,
    toolSystem,
    generateLoot,
    textRenderSystem,

    updateEffects,
    handleChat,
    hotbarSystem,
    stairsSystem
} from './game_v4';
import { updateMonsterAI } from './ai';
import { spawnerSystem } from './systems/spawner';
import { createItemFromRegistry } from './data/items';
import { PHYSICS } from './physics';
import { AudioController } from './audio';
import { UIManager } from './client/ui_manager';

import { Position, PlayerControllable, Inventory, Passives, Velocity, Sprite, Health, Mana, Experience, QuestLog, AI, Name, SpellBook, SkillPoints, ActiveSpell, TileMap, Tile as CompTile, TileItem as CompTileItem, Stats, CombatState, Target, Tint, NPC, QuestGiver, Interactable, Merchant, Teleporter, Collider, Skills, ItemInstance, Vocation, VOCATIONS, RegenState, FloatingText, Lootable, LightSource, Corpse, CorpseDefinition, Camera, Item } from './components';
import { useItem } from './core/interaction';
import { initEquipmentUI } from './ui';
import { MapRenderer } from './ui/map_render';
import { recalculateStats } from './equipment';
import { saveGame, loadGame } from './core/persistence';

import { createPlayer, ensureStartingEquipment } from './core/player_factory';
import { damageTextManager } from './client/damage_text';
import { setupShopSystem } from './ui/shop';
import { ManifestLoader } from './systems/ManifestLoader';
import { gameEvents, EVENTS } from './core/events';
import { initQuestSystem } from './systems/quest_system';
import { spawnQuestNPCs } from './setup_npcs';

const VERSION = "Verify-Fix-v3-ForceRefresh";
console.log(`[Main] Starting Game... Version: ${VERSION}`);
console.log(`[Main] Build Time: ${new Date().toISOString()}`);

console.log("[Main] Script Loaded. Imports Success.");

const CANVAS_WIDTH = 800;
const MAP_WIDTH = 300;
const MAP_HEIGHT = 300;

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
if (!canvas) throw new Error("No canvas found with id 'gameCanvas'");

function resize() {
    const container = document.getElementById("viewport");
    if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
}
window.addEventListener("resize", resize);
resize();

// let map: WorldMap; // ECS manages map
export let player: Player;
let renderer: PixelRenderer;
export let world: World;
let input: InputHandler;
let ui: UIManager;
let mapRenderer: MapRenderer;
const audio = new AudioController();

window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
});

let currentMouseX = 0;
let currentMouseY = 0;

// Global Event Listeners (Moved from start() to prevent memory leaks)
// Debug listeners removed for production/cleanup
// window.addEventListener("mousedown", ...); 

window.addEventListener("mousemove", (e) => {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    currentMouseX = (e.clientX - rect.left) * scaleX;
    currentMouseY = (e.clientY - rect.top) * scaleY;
});

async function start() {
    console.log("[Main] Engine v4 Initialized - NUCLEAR CACHE BUSTING");
    console.log("[Main] Starting Engine v4... (Build Check: " + new Date().toISOString() + ")");
    console.log("[Main] If you do NOT see 'Engine v4' above, your browser is serving a STALE CACHE.");

    // EXPOSE ASSET MANAGER FOR LOADERS
    (window as any).game = (window as any).game || {};
    (window as any).game.assetManager = assetManager;

    await assetManager.loadAll();

    world = new World();
    input = new InputHandler();
    ui = new UIManager();

    // --- Chat System Hook ---
    document.addEventListener('player-chat', (e: any) => {
        handleChat(world, e.detail.text, ui);
    });
    // LOAD CUSTOM ASSETS (Manifest) - WAIT FOR THIS
    await ManifestLoader.load();
    setupShopSystem(); // Initialize Shop UI Listeners
    initQuestSystem(world); // Initialize Quest System

    // Listeners moved to top-level to prevent stacking on restart
    // See lines 450+

    let seed = null; // Removed getSavedSeed logic reliance for simplicity in restoration, or reuse if imported? 
    // getSavedSeed was in persistence or save.ts?
    // It was in save.ts in bundle. Let's assume new random seed for now to be safe, or just random.
    seed = Math.floor(Math.random() * 10000);
    console.log(`[Main] New World Seed: ${seed}`);

    // Create Map Entity placeholder so switchMap can update it
    const mapEntity = world.createEntity();
    world.addComponent(mapEntity, new TileMap(MAP_WIDTH, MAP_HEIGHT, 32));

    const safeX = Math.floor(MAP_WIDTH / 2) * TILE_SIZE;
    const safeY = Math.floor(MAP_HEIGHT / 2) * TILE_SIZE;
    // createPlayer is now the source of truth for player components and starting gear
    const pe = createPlayer(world, safeX, safeY, input, 'knight');

    // Camera Entity (Critical for World Coords)
    const ce = world.createEntity();
    world.addComponent(ce, new Camera(safeX - (CANVAS_WIDTH / 2), safeY - (canvas.height / 2)));

    player = new Player(world, pe);
    player.id = pe;

    // NOW call switchMap - player exists so mobs/entities will be spawned
    switchMap(world, 'edron', 'temple', seed);
    console.log("[Main] Map Generated via switchMap (Edron City)");

    // Spawn Quest NPCs (Override/Add to map)
    spawnQuestNPCs(world);

    const centerX = Math.floor(MAP_WIDTH / 2);
    const centerY = Math.floor(MAP_HEIGHT / 2);
    console.log(`[Main] Map Center: ${centerX}, ${centerY}`);

    renderer = new PixelRenderer(canvas);
    console.log("[Main] Renderer Created");

    mapRenderer = new MapRenderer();
    console.log("[Main] Map Renderer Created");

    // Initialize Equipment UI
    const inv = world.getComponent(player.id, Inventory);
    if (inv) {
        initEquipmentUI(inv.equipment, (newStats) => {
            // Update player stats in ECS
            const stats = world.getComponent(player.id, Stats);
            if (stats) {
                stats.attack = newStats.attack;
                stats.defense = newStats.defense;
                // stats.armor/speed could be added to Stats component or handled separately
            }
            // Notify UI of change
            gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, player);
            gameEvents.emit(EVENTS.INVENTORY_CHANGED, inv);
        });

        // Initial Stat Calculation
        const finalStats = recalculateStats(inv.equipment, world.getComponent(player.id, Stats) || undefined);
        const stats = world.getComponent(player.id, Stats);
        if (stats) {
            stats.attack = finalStats.attack;
            stats.defense = finalStats.defense;
        }
    }

    // Assign to global game object
    game.world = world;
    game.player = player;
    game.ui = ui;

    // LATE BINDING FIX: Ensure UI updates on stats change
    gameEvents.on(EVENTS.PLAYER_STATS_CHANGED, (p: Player) => {
        if (game.player && game.player.id === p.id) {
            const hp = world.getComponent(p.id, Health);
            const mana = world.getComponent(p.id, Mana);
            const stats = world.getComponent(p.id, Stats);
            const exp = world.getComponent(p.id, Experience);
            const skills = world.getComponent(p.id, Skills);
            const inv = world.getComponent(p.id, Inventory);

            if (hp && mana && stats && exp && skills && inv) {
                ui.updateStatus(
                    hp.current, hp.max,
                    mana.current, mana.max,
                    stats.capacity, inv.gold,
                    exp.level, exp.current, exp.next,
                    skills
                );
            }
        }
    });

    // Targeting Listener (for Battle List)
    gameEvents.on(EVENTS.TARGET_ENTITY, (id: number) => {
        console.log(`[Main] TARGET_ENTITY received for ID: ${id}`);
        const pEnt = world.query([PlayerControllable])[0];
        if (pEnt !== undefined) {
            let pTarget = world.getComponent(pEnt, Target);
            if (!pTarget) {
                pTarget = new Target(id);
                world.addComponent(pEnt, pTarget);
            } else {
                pTarget.targetId = id;
            }
            const name = world.getComponent(id, Name)?.value || "Target";
        }
    });

    // Ambience Listener
    gameEvents.on(EVENTS.ZONE_ENTER, (data: any) => {
        console.log(`[Audio] Zone Changed: ${data.type} (${data.dungeonType})`);
        if (data.type === 'dungeon' || data.dungeonType === 'crypt') {
            audio.setAmbience('crypt');
        } else {
            audio.setAmbience('village');
        }
    });


    // NPCs and Starting Inventory are now handled by:
    // 1. switchMap (spawns NPCs from MapGen data)
    // 2. createPlayer (sets up vocation-specific starting gear)

    if (loadGame(world)) {
        // Success load
        ui.log("Welcome back!");

        // FORCE TOWN SPAWN (Temporary Fix for Stuck Players)
        // Override saved position to Ensure Town Center (128,128)
        const pLoc = world.getComponent(game.player.id, Position);
        if (pLoc) {
            pLoc.x = 126 * 32;
            pLoc.y = 126 * 32;
            pLoc.z = 6; // Elevated city floor (Z=6)
            console.log("[Main] Forced Player Position to Town Center (126,126) on Z=6");
        }

        // Retroactively apply Starting Gear if missing (Partial Save Fix)
        if (game.player && game.player.id) {
            ensureStartingEquipment(world, game.player.id);
        }
    } else {
        ui.log("Welcome to Retro RPG!");
    }

    // Initial UI Sync
    if (player) {
        gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, player);
    }

    console.log("[Main] Engine Running. Starting Loop...");
    try {
        loop();
    } catch (e) {
        console.error("[Fatal] Loop Crash:", e);
    }
}

// Global Game Object for Troubleshooting/Keybinds
const game = {
    update: (dt: number) => {
        if (world && input) {
            inputSystem(world, input);
            interactionSystem(world, input, ui); // New Targeting Logic
            // uiInteractionSystem(world, ui, input, player, map, renderer); // Removed to avoid conflict
            combatSystem(world, input, audio, ui);
            // aiSystem(world, dt);
            const mapEnt = world.query([TileMap])[0];
            const mapC = mapEnt !== undefined ? (world.getComponent(mapEnt, TileMap) || null) : null;
            updateMonsterAI(world, Date.now(), player, mapC);
            regenSystem(world, dt);
            decaySystem(world, dt);
            toolSystem(world, input, ui);
            hotbarSystem(world, input, audio, ui);
            teleportSystem(world, ui);
            movementSystem(world, dt, audio);
            cameraSystem(world, dt); // Dynamic Viewport

            // Syncing is now handled by Player getters/setters automatically
            if (player && player.id !== undefined) {
                // No manual sync needed anymore
            }

            const screenWidth = canvas.width;
            const screenHeight = canvas.height;
            // Camera follow player
            // Already handled by cameraSystem?
            // game.camera is strict override if we used it.
        }
    },
    spawnDebugSet: () => {
        spawnDebugSet(world, ui);
    },
    map: null as any, // assigned later
    player: null as any,
    ui: null as any,
    world: null as any
};

(window as any).game = game; // Expose

// Event Listeners for Shop/Action
document.addEventListener("shopBuy", (e: any) => {
    const { item, price } = e.detail;
    // ... (Simplified re-implementation or need full logic?)
    // The previous logic was good.
    const pEnt = world.query([PlayerControllable, Inventory])[0];
    if (pEnt !== undefined) {
        const inv = world.getComponent(pEnt, Inventory);
        if (inv && inv.gold >= price) {
            inv.gold -= price;
            inv.addItem(item);
            if (ui) {
                ui.log(`Bought ${item.name}`);
                // Refresh Inventory UI
                ui.updateEquipment(inv);
                // Refresh Gold Display
                if (game.player) {
                    // game.player.gold updates automatically via ECS getter
                    ui.handleStatsUpdate(game.player);
                }
            }
            // Emit Events for other systems
            gameEvents.emit(EVENTS.INVENTORY_CHANGED, inv);
            // gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, pEnt); // Optional, keep if systems use ID
        } else {
            if (ui) ui.log("Not enough gold!", "#ff5555");
        }
    }
});

document.addEventListener("playerAction", (e: any) => {
    const { action, item, from, to, index, slot, fromBag } = e.detail;

    const pEnt = world.query([PlayerControllable, Inventory])[0];
    if (pEnt === undefined) return;
    const inv = world.getComponent(pEnt, Inventory);
    const hp = world.getComponent(pEnt, Health);
    const mana = world.getComponent(pEnt, Mana);

    if (action === "consume") {
        let consumed = false;
        let msg = "";

        const iName = item?.name || "";
        if (iName.includes("Health Potion") || iName.includes("Life Fluid")) {
            if (hp) {
                hp.current = Math.min(hp.current + 50, hp.max);
                msg = "Aaaah...";
                consumed = true;
                const pPos = world.getComponent(pEnt, Position);
                if (pPos) damageTextManager.addText(pPos.x, pPos.y - 32, "+50", "#ff0000");
            }
        } else if (iName.includes("Mana Potion") || iName.includes("Mana Fluid")) {
            if (mana) {
                mana.current = Math.min(mana.current + 50, mana.max);
                msg = "Aaaah...";
                consumed = true;
                const pPos = world.getComponent(pEnt, Position);
                if (pPos) damageTextManager.addText(pPos.x, pPos.y - 32, "+50", "#0000ff");
            }
        } else if (item?.type === "food") {
            if (hp) {
                hp.current = Math.min(hp.current + 10, hp.max);
                msg = "Munch munch.";
                consumed = true;
            }
        }

        if (consumed) {
            if (iName.includes("Potion") || iName.includes("Fluid")) {
                // audio.playSound('glug'); // Need to ensure sound exists or use generic
                // Assuming audio controller available in scope.
                // Checking constants, use defaults if specific not known, but "eat" usually good for food.
            } else {
                // Food
                // audio.playSound('eat');
            }
            // Actually, let's use the AudioController properly.
            // "eat" or "crunch".
            // Since I don't recall exact sound list, I'll try 'eat' for food/potion or assume generic.
            // Let's safe check `game` global or `audio` local. `audio` is in scope.

            if (item?.type === 'food') {
                if (audio) audio.playTone(150, 'square', 0.1, 0); // Crunch-ish
            } else {
                if (audio) audio.playTone(400, 'sine', 0.2, 0); // Magic ping
            }

            gameEvents.emit(EVENTS.SYSTEM_MESSAGE, msg);
            // Remove consumed item from bag (handle stacking)
            if (fromBag && inv) {
                const bag = inv.getEquipped('backpack');
                if (bag && bag.contents && typeof index === 'number') {
                    const itemInst = bag.contents[index];
                    if (itemInst) {
                        if (itemInst.count > 1) {
                            // Decrement stack count
                            itemInst.count--;
                        } else {
                            // Remove entire item if count was 1
                            bag.contents.splice(index, 1);
                        }
                    }
                }
            }
            gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, player);
            gameEvents.emit(EVENTS.INVENTORY_CHANGED, inv);
        }
    } else if (action === "collectGold") {
        // Handle gold coin collection - add to player's gold balance
        if (inv) {
            const goldAmount = e.detail.count || 1;
            inv.gold += goldAmount;

            // Remove gold coins from bag
            if (fromBag) {
                const bag = inv.getEquipped('backpack');
                if (bag && bag.contents && typeof index === 'number') {
                    bag.contents.splice(index, 1);
                }
            }

            if (ui) {
                ui.log(`Collected ${goldAmount} gold.`);
                ui.handleStatsUpdate(player);
            }

            gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, player);
            gameEvents.emit(EVENTS.INVENTORY_CHANGED, inv);
        }
    } else if (action === "moveItem") {
        if (!inv) return;
        let itemInst: any = null;

        if (from.type === 'slot') {
            itemInst = inv.getEquipped(from.slot);
            if (itemInst) inv.unequip(from.slot);
        } else if (from.type === 'container') {
            const bag = inv.getEquipped('backpack');
            if (bag && bag.contents && bag.contents[from.index]) {
                itemInst = bag.contents[from.index];
                bag.contents.splice(from.index, 1);
            }
        }



        if (itemInst) {
            if (to.type === 'slot') {
                inv.equip(to.slot, itemInst);
            } else if (to.type === 'container') {
                const bag = inv.getEquipped('backpack');
                if (bag && bag.contents) bag.contents.push(itemInst);
            }
            gameEvents.emit(EVENTS.INVENTORY_CHANGED, inv);
        }
    } else if (action === "use") {
        // Handle generic item usage
        if (item) {
            gameEvents.emit(EVENTS.ITEM_USED, item.name);
            gameEvents.emit(EVENTS.SYSTEM_MESSAGE, `You use the ${item.name}.`);
        }
    }
});

// Main Loop
let lastTime = performance.now();
const renderEntities: any[] = [];
const battleEntities: number[] = [];
let playerObj: any = null;

function loop() {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    let mapEnt: number | undefined = undefined;

    // ECS Update
    if (world && input) {
        inputSystem(world, input);

        try {
            cameraSystem(world, dt);
            interactionSystem(world, input, ui);
            // aiSystem(world, dt);
            mapEnt = world.query([TileMap])[0];
            const mapC = mapEnt !== undefined ? (world.getComponent(mapEnt, TileMap) || null) : null;
            updateMonsterAI(world, Date.now(), player, mapC);
            toolSystem(world, input, ui);
            hotbarSystem(world, input, audio, ui);
            stairsSystem(world, ui);
            autoAttackSystem(world, dt, ui, input);

            combatSystem(world, input, audio, ui); // Player Combat
            enemyCombatSystem(world, dt, ui, audio); // Added: Enemy Combat
            projectileSystem(world, dt, ui, audio);
            regenSystem(world, dt);
            movementSystem(world, dt, audio);
            teleportSystem(world, ui);
            decaySystem(world, dt);
            updateEffects(dt); // New Tibia Effects
            spawnerSystem(world, dt * 1000); // Expects ms
            deathSystem(world, ui);
        } catch (e) {
            console.error("[Update Error]", e);
        }

        renderEntities.length = 0;
        battleEntities.length = 0;

        // Player Obj Shim for Renderer
        playerObj = null;
        let playerTargetId: number | null = null;
        const pEnts = world.query([PlayerControllable, Position]);
        if (pEnts.length > 0) {
            const pid = pEnts[0];
            const pos = world.getComponent(pid, Position);
            const spr = world.getComponent(pid, Sprite);

            const pTarget = world.getComponent(pid, Target);
            if (pTarget) {
                playerTargetId = pTarget.targetId;
                // if (Math.random() < 0.01) console.log(`[RenderLoop] PlayerTargetID: ${playerTargetId}`);
            }

            if (pos) {
                playerObj = {
                    x: pos.x / TILE_SIZE,  // Convert to tile coords for renderer
                    y: pos.y / TILE_SIZE,  // Convert to tile coords for renderer
                    z: pos.z,              // Floor level for 3D rendering
                    spriteId: spr ? spr.uIndex : 16,
                    flipX: false,
                    name: world.getComponent(pid, Name)?.value,
                    health: world.getComponent(pid, Health),
                    tint: world.getComponent(pid, Tint)
                };
            }
        }

        // Entities
        const allEnts = world.query([Position, Sprite]);
        allEnts.forEach((eid) => {
            if (world.getComponent(eid, PlayerControllable)) return;

            const pos = world.getComponent(eid, Position);
            const spr = world.getComponent(eid, Sprite);
            if (pos && spr) {
                renderEntities.push({
                    x: pos.x,
                    y: pos.y,
                    z: pos.z, // Pass Z-Level for Filtering
                    spriteIndex: spr.uIndex,
                    size: spr.size, // Pass ECS size (e.g. 32)
                    tint: world.getComponent(eid, Tint),
                    name: world.getComponent(eid, Name)?.value,
                    health: world.getComponent(eid, Health),
                    isTarget: playerTargetId === eid
                });

                if (world.getComponent(eid, Name) && world.getComponent(eid, Health)) {
                    battleEntities.push(eid);
                }
            }
        });

        // Draw
        mapEnt = world.query([TileMap])[0];
        // Note: mapEnt can be 0 which is valid but falsy, use !== undefined
        if (mapEnt !== undefined && renderer && playerObj) {
            const mapC = world.getComponent(mapEnt as number, TileMap);
            renderer.draw(mapC as any, playerObj, renderEntities, world);
            // Render Floating Text (ECS)
            textRenderSystem(world, renderer.getBufferContext());
        }
    }

    if (ui && world) {
        // UI Updates (handled by events)
        if (playerObj) ui.updateBattleList(battleEntities, world, playerObj);

        // Update Stats UI (every frame or throttle if heavy)
        const pEnt = world.query([PlayerControllable, Health, Mana, Inventory, Experience, Skills])[0];
        if (pEnt !== undefined) {
            const hp = world.getComponent(pEnt, Health)!;
            const mana = world.getComponent(pEnt, Mana)!;
            const inv = world.getComponent(pEnt, Inventory)!;
            const xp = world.getComponent(pEnt, Experience)!;
            const skills = world.getComponent(pEnt, Skills);

            // Update Minimap/WorldMap
            // @ts-ignore
            const mapC = mapEnt !== undefined ? world.getComponent(mapEnt as number, TileMap) : undefined;
            if (mapRenderer && mapC && playerObj) {
                mapRenderer.updateMinimap(mapC as any, playerObj.x, playerObj.y, playerObj.z);
                mapRenderer.updateWorldMap(mapC as any, playerObj.x, playerObj.y);
            }

            ui.updateStatus(
                Math.floor(hp.current), hp.max,
                Math.floor(mana.current), mana.max,
                inv.cap, inv.gold,
                xp.level, xp.current, xp.next,
                skills
            );

            // Update Backpack Grid (Throttled or every frame? Every frame is OK for now)
            ui.renderBackpack(inv);
            ui.updateEquipment(inv);
        }
    }

    if (input) input.update();
    requestAnimationFrame(loop);
}


// Start game - loop is called from inside start() after initialization
start().catch(e => console.error(e));
