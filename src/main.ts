import { AssetManager, assetManager } from './assets';
import { SPRITES } from './constants';
import { PixelRenderer } from './client/renderer';
import { WorldMap } from './core/map';
import { MapGenerator } from './core/map_generator';
import { Player } from './core/player';
import { TILE_SIZE, Item, Tile } from './core/types';
import { World, InputHandler } from './engine';
import { inputSystem, interactionSystem, autoAttackSystem, movementSystem, cameraSystem, moveItem, deathSystem, enemyCombatSystem, projectileSystem, spawnDebugSet, createItemFromRegistry, uiInteractionSystem, teleportSystem, aiSystem, decaySystem, toolSystem } from './game';
import { PHYSICS } from './physics';
import { AudioController } from './audio';
import { UIManager } from './client/ui_manager';

import { Position, PlayerControllable, Inventory, Passives, Velocity, Sprite, Health, Mana, Experience, QuestLog, AI, Name, SpellBook, SkillPoints, ActiveSpell, TileMap, Tile as CompTile, TileItem as CompTileItem, Stats, CombatState, Target, Tint, NPC, QuestGiver, Interactable, Merchant, Teleporter, Collider, Skills, ItemInstance, Vocation, VOCATIONS, RegenState, FloatingText, Lootable, LightSource, Corpse } from './components';
import { useItem } from './core/interaction';
import { combatSystem } from './core/combat_system';
import { saveGame, loadGame } from './core/persistence';
import { regenSystem } from './core/regen_system';
import { damageTextManager } from './client/damage_text';

console.log("[Main] Script Loaded. Imports Success.");

const CANVAS_WIDTH = 800;
const MAP_WIDTH = 128;
const MAP_HEIGHT = 128;

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

let map: WorldMap;
let player: Player;
let renderer: PixelRenderer;
let world: World;
let input: InputHandler;
let ui: UIManager;
const audio = new AudioController();

window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
});

let currentMouseX = 0;
let currentMouseY = 0;

async function start() {
    console.log("[Main] Starting Engine... (Version: Visual Polish v3)");
    await assetManager.loadAll();

    world = new World();
    input = new InputHandler();
    ui = new UIManager();

    window.addEventListener("mousedown", (e) => {
        const target = e.target as HTMLElement;
        console.log(`[GlobalClick] Target: <${target.tagName} id="${target.id}" class="${target.className}"> at ${e.clientX},${e.clientY}`);
    }, true);

    window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        currentMouseX = (e.clientX - rect.left) * scaleX;
        currentMouseY = (e.clientY - rect.top) * scaleY;
    });

    let seed = null; // Removed getSavedSeed logic reliance for simplicity in restoration, or reuse if imported? 
    // getSavedSeed was in persistence or save.ts?
    // It was in save.ts in bundle. Let's assume new random seed for now to be safe, or just random.
    seed = Math.floor(Math.random() * 10000);
    console.log(`[Main] New World Seed: ${seed}`);

    map = new WorldMap(MAP_WIDTH, MAP_HEIGHT);
    const generator = new MapGenerator(map, seed);
    generator.generate();
    console.log("[Main] Map Generated via MapGenerator");

    const centerX = Math.floor(MAP_WIDTH / 2);
    const centerY = Math.floor(MAP_HEIGHT / 2);
    const centerIdx = centerY * MAP_WIDTH + centerX;
    console.log(`[Main] Map Center: ${centerX}, ${centerY}`);

    if (map.tiles[centerIdx]) {
        map.tiles[centerIdx].items = [new Item(16)];
    }
    const swordIdx = centerY * MAP_WIDTH + (centerX + 1);
    if (map.tiles[swordIdx]) {
        if (map.tiles[swordIdx].items.length === 0) map.tiles[swordIdx].addItem(new Item(16));
        map.tiles[swordIdx].addItem(new Item(2));
    }

    if (generator.teleporters) {
        generator.teleporters.forEach((t) => {
            const ent = world.createEntity();
            world.addComponent(ent, new Position(t.x * TILE_SIZE, t.y * TILE_SIZE));
            world.addComponent(ent, new Teleporter(t.tx, t.ty));
            world.addComponent(ent, new Collider(32, 32));
            console.log(`[Main] Spawned Teleporter at ${t.x},${t.y} -> ${t.tx},${t.ty}`);
        });
    }

    const mapEnt = world.createEntity();
    const mapComp = new TileMap(map.width, map.height, TILE_SIZE);
    mapComp.tiles = map.tiles.map((coreTile) => {
        const cTile = new CompTile(); // Was Tile2
        coreTile.items.forEach((it) => {
            cTile.add(it.id);
        });
        return cTile;
    });
    world.addComponent(mapEnt, mapComp);

    // Player Entity
    const pe = world.createEntity();
    world.addComponent(pe, new PlayerControllable()); // Was PlayerControllable2
    let safeX = Math.floor(MAP_WIDTH / 2) * TILE_SIZE;
    let safeY = Math.floor(MAP_HEIGHT / 2) * TILE_SIZE;
    if (map.tiles[centerIdx] && map.tiles[centerIdx].items.some((i) => PHYSICS.isSolid(i.id))) {
        safeX += TILE_SIZE;
    }
    world.addComponent(pe, new Position(safeX, safeY));
    world.addComponent(pe, new Velocity(0, 0));
    world.addComponent(pe, new Sprite(SPRITES.PLAYER));
    world.addComponent(pe, new Inventory());
    world.addComponent(pe, new Passives());
    world.addComponent(pe, new Health(100, 100));
    world.addComponent(pe, new Mana(50, 50));
    world.addComponent(pe, new Experience(0, 100, 1));
    world.addComponent(pe, new Skills());
    world.addComponent(pe, new QuestLog());
    const sb = new SpellBook();
    if (!sb.knownSpells.has("Fireball")) sb.knownSpells.set("Fireball", 1);
    world.addComponent(pe, sb);
    world.addComponent(pe, new ActiveSpell("adori flam"));
    world.addComponent(pe, new SkillPoints(0, 0));
    world.addComponent(pe, new Stats(10, 5, 1.5));
    world.addComponent(pe, new CombatState());
    world.addComponent(pe, new Target(null));
    world.addComponent(pe, new Vocation("Knight", 15, 5, 25));
    world.addComponent(pe, new RegenState());

    player = new Player(safeX / TILE_SIZE, safeY / TILE_SIZE);
    player.id = pe;

    renderer = new PixelRenderer(canvas);
    console.log("[Main] Renderer Created");

    // NPCs
    const townCX = 64;
    const townCY = 64;

    const merchant = world.createEntity();
    world.addComponent(merchant, new Position((townCX - 6) * TILE_SIZE, townCY * TILE_SIZE));
    world.addComponent(merchant, new Sprite(SPRITES.NPC_MERCHANT));
    world.addComponent(merchant, new Name("Gorn"));
    world.addComponent(merchant, new Interactable("Trade"));
    world.addComponent(merchant, new Merchant([SPRITES.POTION, SPRITES.TORCH, SPRITES.SHOVEL, SPRITES.CLUB]));
    world.addComponent(merchant, new NPC("merchant", ["Welcome to my Smithy!", "I sell only the essentials.", "You'll have to find better gear yourself."]));

    const healer = world.createEntity();
    world.addComponent(healer, new Position(townCX * TILE_SIZE, (townCY + 8) * TILE_SIZE));
    world.addComponent(healer, new Sprite(SPRITES.NPC_HEALER));
    world.addComponent(healer, new Name("Adana"));
    world.addComponent(healer, new Interactable("Heal"));
    world.addComponent(healer, new NPC("healer", ["Blessings upon you.", "Do you need healing?"]));

    const guide = world.createEntity();
    world.addComponent(guide, new Position((townCX + 6) * TILE_SIZE, townCY * TILE_SIZE));
    world.addComponent(guide, new Sprite(SPRITES.NPC_GUIDE));
    world.addComponent(guide, new Name("Oldrak"));
    world.addComponent(guide, new Interactable("Talk"));
    world.addComponent(guide, new NPC("guide", ["The Dragon Peak lies to the North.", "Beware the Orcs in the East.", "I have a task for you."]));
    world.addComponent(guide, new QuestGiver([
        {
            id: 1,
            name: "Orc Slayer",
            description: "Kill 5 Orcs in the Eastern Fortress.",
            type: "kill",
            target: "Orc",
            required: 5,
            reward: { gold: 100, xp: 200 }
        }
    ]));

    console.log("[Main] Spawning Mobs...");
    for (let i = 0; i < 50; i++) {
        let mx = 0, my = 0;
        let attempts = 0;
        while (attempts < 20) {
            mx = Math.floor(Math.random() * MAP_WIDTH);
            my = Math.floor(Math.random() * MAP_HEIGHT);
            const t = map.getTile(mx, my);
            if (t && !t.solid && t.baseId !== 13 && t.baseId !== 304) {
                break;
            }
            attempts++;
        }

        const e = world.createEntity();
        world.addComponent(e, new Position(mx * TILE_SIZE, my * TILE_SIZE));
        world.addComponent(e, new Health(50, 50));

        const distToPeak = Math.sqrt((mx - 64) ** 2 + (my - 19) ** 2);
        let mobName = "Unknown";

        if (distToPeak < 15) {
            world.addComponent(e, new Sprite(SPRITES.CUSTOM_DRAGON_HATCHLING));
            mobName = "Dragon Lord";
            world.addComponent(e, new Name("Dragon Lord"));
            world.addComponent(e, new Stats(20, 10, 2));
            world.addComponent(e, new Health(200, 200));
            world.addComponent(e, new Tint("#FF4444BA"));
        } else if (Math.random() < 0.3) {
            const roll = Math.random();
            if (roll < 0.6) {
                world.addComponent(e, new Sprite(SPRITES.DWARF_MINER));
                mobName = "Dwarf Miner";
                world.addComponent(e, new Name("Dwarf Miner"));
                // Tint removed for unique sprite visibility
            } else if (roll < 0.9) {
                world.addComponent(e, new Sprite(SPRITES.DWARF_GUARD));
                mobName = "Dwarf Guard";
                world.addComponent(e, new Name("Dwarf Guard"));
            } else {
                world.addComponent(e, new Sprite(SPRITES.DWARF_GEOMANCER));
                mobName = "Dwarf Geomancer";
                world.addComponent(e, new Name("Dwarf Geomancer"));
                // Tint removed
            }
        } else {
            const roll = Math.random();
            if (roll < 0.6) {
                world.addComponent(e, new Sprite(SPRITES.ORC_PEON));
                mobName = "Orc Peon";
                world.addComponent(e, new Name("Orc Peon"));
                world.addComponent(e, new Tint("#88AA8880"));
            } else if (roll < 0.9) {
                world.addComponent(e, new Sprite(SPRITES.ORC));
                mobName = "Orc Warrior";
                world.addComponent(e, new Name("Orc Warrior"));
            } else {
                world.addComponent(e, new Sprite(SPRITES.ORC_WARLORD));
                mobName = "Orc Warlord";
                world.addComponent(e, new Name("Orc Warlord"));
                world.addComponent(e, new Tint("#FF444480"));
            }
        }

        world.addComponent(e, new CombatState());
        world.addComponent(e, new Target(null));
        world.addComponent(e, new Skills());
        if (!world.getComponent(e, Stats)) {
            world.addComponent(e, new Stats(10, 2, 1));
        }
        world.addComponent(e, new AI(30, "melee", 40));

        // --- LOOT SYSTEM ---
        const lootItems: Item[] = [];
        // Gold (10-30 GP)
        if (Math.random() < 0.7) {
            lootItems.push(createItemFromRegistry(40, Math.floor(Math.random() * 20) + 1));
        }
        // Rare Loot based on mob?
        if (mobName.includes("Dragon")) {
            lootItems.push(createItemFromRegistry(SPRITES.GOLDEN_HELMET)); // Rare!
        }
        if (Math.random() < 0.1) {
            lootItems.push(createItemFromRegistry(SPRITES.POTION));
        }
        world.addComponent(e, new Lootable(lootItems));
    }

    const debugOrc = world.createEntity();
    world.addComponent(debugOrc, new Position(safeX + 64, safeY));
    world.addComponent(debugOrc, new Sprite(SPRITES.ORC));
    world.addComponent(debugOrc, new Health(100, 100));
    world.addComponent(debugOrc, new AI(30, "melee", 40));
    world.addComponent(debugOrc, new Name("Debug Orc"));
    world.addComponent(debugOrc, new Stats(8, 2, 0.8));
    world.addComponent(debugOrc, new Lootable([createItemFromRegistry(40, 50)]));

    // Initial Inventory (New Game)
    const inv = world.getComponent(pe, Inventory);
    inv.gold = 50;
    const backpackItem = createItemFromRegistry(SPRITES.BACKPACK);
    if (backpackItem) {
        const bagInst = new ItemInstance(backpackItem);
        inv.equip("backpack", bagInst);
        const sword = createItemFromRegistry(SPRITES.SWORD);
        const potion = createItemFromRegistry(SPRITES.POTION);
        if (sword) inv.addItem(sword);
        if (potion) inv.addItem(potion, 5);
        inv.addItem(createItemFromRegistry(210)); // Shovel (ID 210, not 124)
        inv.addItem(createItemFromRegistry(211)); // Rope (ID 211, not 65)
    }

    if (loadGame(world, ui)) {
        // Success load
        ui.log("Welcome back!", "#afa");
    } else {
        ui.log("Welcome to Retro RPG!", "#fff");
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
            uiInteractionSystem(world, ui, input, player, map, renderer);
            combatSystem(world);
            aiSystem(world, dt);
            regenSystem(world, dt);
            decaySystem(world, dt);
            toolSystem(world, input, ui);
            teleportSystem(world, ui);
            movementSystem(world, dt, audio);
            cameraSystem(world, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

            // Sync Player Object
            if (player && player.id !== undefined) {
                const pEnt = player.id; // Correct reference
                const pPos = world.getComponent(pEnt, Position);
                const pSprite = world.getComponent(pEnt, Sprite);
                const pHp = world.getComponent(pEnt, Health);
                if (pPos) {
                    player.x = pPos.x / TILE_SIZE;
                    player.y = pPos.y / TILE_SIZE;
                }
                const pInv = world.getComponent(pEnt, Inventory);
                if (pInv) {
                    player.gold = pInv.gold;
                    player.capacity = pInv.cap;
                }
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

window['game'] = game; // Expose

// Event Listeners for Shop/Action
document.addEventListener("shopBuy", (e: any) => {
    const { item, price } = e.detail;
    // ... (Simplified re-implementation or need full logic?)
    // The previous logic was good.
    const pEnt = world.query([PlayerControllable, Inventory])[0];
    if (pEnt !== undefined) {
        const inv = world.getComponent(pEnt, Inventory);
        if (inv.gold >= price) {
            inv.gold -= price;
            inv.addItem(item); // Note: Should probably clone item or create instance
            if (ui) ui.log(`Bought ${item.name}`, "#afa");
        }
    }
});

document.addEventListener("playerAction", (e: any) => {
    const { action, item, from, to, index, slot, fromBag } = e.detail;
    // console.log(`[Main] Player Action: ${action}`, e.detail);

    const pEnt = world.query([PlayerControllable, Inventory])[0];
    if (pEnt === undefined) return;
    const inv = world.getComponent(pEnt, Inventory);
    const hp = world.getComponent(pEnt, Health);
    const mana = world.getComponent(pEnt, Mana);

    if (action === "consume") {
        let consumed = false;
        let msg = "";

        const iName = item.name || "";
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
        } else if (item.type === "food" || iName.includes("Meat") || iName.includes("Ham")) {
            if (hp) {
                hp.current = Math.min(hp.current + 10, hp.max);
                msg = "Munch munch.";
                consumed = true;
                const pPos = world.getComponent(pEnt, Position);
                if (pPos) damageTextManager.addText(pPos.x, pPos.y - 32, "+10", "#00ff00");
            }
        }

        if (consumed) {
            if (ui.console) ui.console.addSystemMessage(msg);
            if (fromBag) {
                const bag = inv.getEquipped('backpack');
                if (bag && bag.contents) {
                    if (typeof index === 'number') {
                        const inst = bag.contents[index];
                        if (inst.count > 1) inst.count--;
                        else bag.contents.splice(index, 1);
                    }
                }
            }
            ui.updateEquipment(inv);
        }
    } else if (action === "moveItem") {
        let itemInst: ItemInstance | null = null;

        if (from.type === 'slot') {
            itemInst = inv.getEquipped(from.slot);
            if (itemInst) inv.unequip(from.slot);
        } else if (from.type === 'container') {
            const bag = inv.getEquipped('backpack');
            if (bag && bag.contents[from.index]) {
                itemInst = bag.contents[from.index];
                bag.contents.splice(from.index, 1);
            }
        }

        if (itemInst) {
            if (to.type === 'slot') {
                const existing = inv.getEquipped(to.slot);
                if (existing) {
                    if (from.type === 'slot') inv.equip(from.slot, existing);
                    else if (from.type === 'container') {
                        const bag = inv.getEquipped('backpack');
                        if (bag) bag.contents.splice(from.index, 0, existing);
                    }
                }
                inv.equip(to.slot, itemInst);
            }
            else if (to.type === 'container') {
                const bag = inv.getEquipped('backpack');
                if (bag) {
                    bag.contents.push(itemInst);
                } else {
                    if (from.type === 'slot') inv.equip(from.slot, itemInst);
                }
            }
        }
        ui.updateEquipment(inv);
    }
});

// Main Loop
let lastTime = performance.now();
function loop() {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    game.map = map;
    game.player = player;
    game.ui = ui;
    game.world = world;

    try {
        game.update(dt);
    } catch (e) {
        console.error("[Update Error]", e);
    }

    const renderEntities: any[] = [];
    const battleEntities: number[] = [];
    if (world) {
        // Get Player Target ID
        let targetId = -1;
        const pEnt = world.query([PlayerControllable, Target])[0];
        if (pEnt !== undefined) {
            const tComp = world.getComponent(pEnt, Target);
            if (tComp && tComp.entityId !== null) targetId = tComp.entityId;
        }

        const allEnts = world.query([Position, Sprite]);
        allEnts.forEach((eid) => {
            if (world.getComponent(eid, PlayerControllable)) return; // Skip player (drawn separately usually or handled)
            const pos = world.getComponent(eid, Position);
            const spr = world.getComponent(eid, Sprite);
            renderEntities.push({
                id: eid,
                x: pos.x,
                y: pos.y,
                spriteIndex: spr.uIndex,
                tint: world.getComponent(eid, Tint),
                name: world.getComponent(eid, Name)?.value,
                health: world.getComponent(eid, Health),
                isTarget: (eid === targetId) // Inject Target Flag
            });
            if (world.getComponent(eid, Name) && world.getComponent(eid, Health)) {
                battleEntities.push(eid);
            }
        });
    }

    try {
        renderer.draw(map, player, renderEntities, world);
    } catch (e) { /* ignore */ }

    if (ui && player) {
        ui.update(player, battleEntities, world, currentMouseX, currentMouseY);
        ui.updateBattleList(battleEntities, world, player);
        ui.renderMinimap(map, player);
        damageTextManager.update(dt);
    }

    input.update();
    requestAnimationFrame(loop);
}

start().catch(e => console.error(e));
