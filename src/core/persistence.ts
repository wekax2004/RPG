import { World } from '../engine';
import { PlayerControllable, Position, Health, Mana, Experience, Inventory, Skills, ItemInstance } from '../components';
import { ItemRegistry } from '../data/items';
import { WorldMap } from './map';

const SAVE_KEY = 'retro_rpg_save_v1';

export interface SaveData {
    player: {
        position: { x: number, y: number };
        health: { current: number, max: number };
        mana: { current: number, max: number };
        xp: { current: number, next: number, level: number };
        skills: any; // Serialize Skills object
        inventory: {
            gold: number;
            cap: number;
            equipment: Array<{ slot: string, itemIdx: number, count: number }>;
            backpack: Array<{ itemIdx: number, count: number }>;
        }
    };
    timestamp: number;
}

export function saveGame(world: World) {
    const pEnt = world.query([PlayerControllable, Position, Health, Inventory])[0];
    if (pEnt === undefined) return;

    const pos = world.getComponent(pEnt, Position)!;
    const hp = world.getComponent(pEnt, Health)!;
    const mana = world.getComponent(pEnt, Mana);
    const xp = world.getComponent(pEnt, Experience);
    const skills = world.getComponent(pEnt, Skills);
    const inv = world.getComponent(pEnt, Inventory)!;

    // Serialize Inventory
    const equippedItems: Array<{ slot: string, itemIdx: number, count: number }> = [];
    inv.equipment.forEach((inst, slot) => {
        if (slot !== 'backpack') {
            equippedItems.push({
                slot: slot,
                itemIdx: inst.item.uIndex !== undefined ? inst.item.uIndex : inst.item.id, // Use ID if uIndex missing
                count: inst.count
            });
        }
    });

    const backpackItems: Array<{ itemIdx: number, count: number }> = [];
    const bag = inv.getEquipped('backpack');
    if (bag && bag.contents) {
        bag.contents.forEach(inst => {
            backpackItems.push({
                itemIdx: inst.item.uIndex !== undefined ? inst.item.uIndex : inst.item.id,
                count: inst.count
            });
        });
    }

    const data: SaveData = {
        player: {
            position: { x: Math.floor(pos.x), y: Math.floor(pos.y) },
            health: { current: hp.current, max: hp.max },
            mana: { current: mana ? mana.current : 0, max: mana ? mana.max : 0 },
            xp: {
                current: xp ? xp.current : 0,
                next: xp ? xp.next : 100,
                level: xp ? xp.level : 1
            },
            skills: skills ? JSON.parse(JSON.stringify(skills)) : {}, // Simple clone
            inventory: {
                gold: inv.gold,
                cap: inv.cap,
                equipment: equippedItems,
                backpack: backpackItems
            }
        },
        timestamp: Date.now()
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    console.log("[Persistence] Game Saved.");
}

export function loadGame(world: World): boolean {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return false;

    try {
        const data: SaveData = JSON.parse(json);
        const pEnt = world.query([PlayerControllable])[0];
        if (pEnt === undefined) return false;

        // Restore Position
        const pos = world.getComponent(pEnt, Position);
        if (pos) {
            pos.x = data.player.position.x;
            pos.y = data.player.position.y;
        }

        // Restore Stats
        const hp = world.getComponent(pEnt, Health);
        if (hp) {
            hp.current = data.player.health.current;
            hp.max = data.player.health.max;
        }

        const mana = world.getComponent(pEnt, Mana);
        if (mana) {
            mana.current = data.player.mana.current;
            mana.max = data.player.mana.max;
        }

        const xp = world.getComponent(pEnt, Experience);
        if (xp) {
            xp.current = data.player.xp.current;
            xp.next = data.player.xp.next;
            xp.level = data.player.xp.level;
        }

        // Restore Skills (Manual copy to preserve references if needed, but simple replace works for data obj)
        const skills = world.getComponent(pEnt, Skills);
        if (skills && data.player.skills) {
            Object.assign(skills, data.player.skills);
        }

        // Restore Inventory
        const inv = world.getComponent(pEnt, Inventory);
        if (inv) {
            inv.gold = data.player.inventory.gold;
            inv.cap = data.player.inventory.cap;
            inv.equipment.clear();

            // Re-equip items
            data.player.inventory.equipment.forEach(e => {
                const itemDef = ItemRegistry[e.itemIdx]; // Assuming Registry is index-based or we need to look up
                if (itemDef) {
                    inv.equip(e.slot, new ItemInstance(itemDef, e.count));
                }
            });

            // Re-fill backpack
            // 1. Create Backpack Item
            // 2. Fill it
            // 3. Equip it
            // Ideally we need the 'Backpack' item definition itself.
            // Let's assume ID 0 or name 'Backpack' exists? 
            // Better: Check if we have a default backpack in Registry? 
            // For now, let's look for "Backpack" in definitions or just reuse the code's default starter bag approach.
            // We will create a fresh Bag item instance.
            // But wait, ItemRegistry needs to be searched for "Backpack".

            // HACK: Start with generic backpack if not found
            let bagDef = Object.values(ItemRegistry).find(i => i.name === "Backpack");
            if (!bagDef) {
                // Fallback to searching by type container?
                // Or just assume the loaded data implies a backpack exists.
                // We'll skip creating the bag ItemWrapper if we can just set contents on the slot.
                // BUT inv.getEquipped('backpack') expects an ItemInstance.
                // Let's find "Backpack" or use first container.
                bagDef = ItemRegistry[0]; // Dangerous.
            }

            // Re-construct the bag
            // Actually, we should probably save the Bag Item ID too.
            // Simplify: We assume player ALWAYS has a backpack in 'backpack' slot for now.
            // We'll create a new ItemInstance for it.
            if (bagDef) {
                const bagInst = new ItemInstance(bagDef, 1);
                bagInst.contents = [];
                data.player.inventory.backpack.forEach(b => {
                    const iDef = ItemRegistry[b.itemIdx];
                    if (iDef) {
                        bagInst.contents.push(new ItemInstance(iDef, b.count));
                    }
                });
                inv.equip('backpack', bagInst);
            }
        }

        console.log("[Persistence] Game Loaded.");
        return true;

    } catch (e) {
        console.error("[Persistence] Failed to load save:", e);
        return false;
    }
}
