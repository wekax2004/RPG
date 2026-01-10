import { World } from './engine';
import { Position, Health, Inventory, QuestLog, PlayerControllable, Item, ItemInstance, Experience, Skills, Mana, Vocation, LightSource, VOCATIONS, SpellBook, SkillPoints, ActiveSpell, Passives, Sprite } from './components';
import { SPRITES } from './assets';

import { UIManager } from './ui';

interface SaveData {
    position: { x: number, y: number };
    health: { current: number, max: number };
    inventory: {
        // New structure: Array of simplified item data
        equipment?: Array<any>;
        // Legacy support
        items?: Array<any>;
        storage?: Array<any>;
        gold: number;
    };
    quest: {
        quests: any[];
        completedQuestIds: string[];
    };
    experience: { current: number, next: number, level: number };
    mana: { current: number, max: number };
    vocation: string;
    magic?: {
        knownSpells: Array<[string, number]>;
        skillPoints: number;
        activeSpell: string;
    };
    passives?: {
        vitality: number;
        spirit: number;
        agility: number;
        might: number;
    };
    seed?: number; // Added for map regeneration
}

const SAVE_KEY = 'retro-rpg-save-v3';

export function hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY);
}

export function getSavedSeed(): number | null {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return null;
    try {
        const data: SaveData = JSON.parse(json);
        return data.seed || null;
    } catch {
        return null;
    }
}

export function saveGame(world: World, ui: UIManager, seed: number) {
    const playerEntity = world.query([PlayerControllable, Position, Health, Inventory, QuestLog, Experience])[0];
    if (playerEntity === undefined) return;

    const pos = world.getComponent(playerEntity, Position)!;
    const hp = world.getComponent(playerEntity, Health)!;
    const mana = world.getComponent(playerEntity, Mana)!; // Mana MUST exist now
    const inv = world.getComponent(playerEntity, Inventory)!;
    const quest = world.getComponent(playerEntity, QuestLog)!;
    const xp = world.getComponent(playerEntity, Experience)!;
    const voc = world.getComponent(playerEntity, Vocation);
    const spells = world.getComponent(playerEntity, SpellBook);
    const sp = world.getComponent(playerEntity, SkillPoints);
    const active = world.getComponent(playerEntity, ActiveSpell);

    // Serialize Inventory (Equipment Map)
    const equipmentArr: any[] = [];
    inv.equipment.forEach((inst, slot) => {
        // Serialize Item Instance
        const itemData = {
            slotKey: slot,
            name: inst.item.name,
            uIndex: inst.item.uIndex,
            count: inst.count,
            damage: inst.item.damage,
            price: inst.item.price || 10,
            description: inst.item.description || "",
            weaponType: inst.item.weaponType || "none",
            defense: inst.item.defense || 0,
            slotType: inst.item.slotType,
            // Recursion for Backpack
            contents: inst.contents.map(c => ({
                name: c.item.name,
                uIndex: c.item.uIndex,
                count: c.count,
                damage: c.item.damage,
                price: c.item.price || 10,
                description: c.item.description || "",
                weaponType: c.item.weaponType || "none",
                defense: c.item.defense || 0,
                slotType: c.item.slotType
            }))
        };
        equipmentArr.push(itemData);
    });

    const data: SaveData = {
        seed: seed,
        position: { x: pos.x, y: pos.y },
        health: { current: hp.current, max: hp.max },
        mana: { current: mana ? mana.current : 0, max: mana ? mana.max : 0 },
        vocation: voc ? voc.name.toLowerCase() : 'knight',
        inventory: {
            equipment: equipmentArr,
            gold: inv.gold
        },
        quest: {
            quests: quest.quests,
            completedQuestIds: quest.completedQuestIds
        },
        experience: {
            current: xp ? xp.current : 0,
            next: xp ? xp.next : 100,
            level: xp ? xp.level : 1
        },
        magic: {
            knownSpells: spells ? Array.from(spells.knownSpells.entries()) : [['Fireball', 1]],
            skillPoints: sp ? sp.current : 0,
            activeSpell: active ? active.spellName : 'Fireball'
        },
        passives: {
            vitality: world.getComponent(playerEntity, Passives)?.vitality || 0,
            spirit: world.getComponent(playerEntity, Passives)?.spirit || 0,
            agility: world.getComponent(playerEntity, Passives)?.agility || 0,
            might: world.getComponent(playerEntity, Passives)?.might || 0
        }
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Save failed:", e);
    }
}

export function loadGame(world: World, ui: UIManager): boolean {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return false;

    try {
        const data: SaveData = JSON.parse(json);
        const playerEntity = world.query([PlayerControllable, Position, Health, Inventory, QuestLog, Experience])[0];
        if (playerEntity === undefined) return false;

        // Restore Position
        const pos = world.getComponent(playerEntity, Position)!;
        pos.x = data.position.x;
        pos.y = data.position.y;

        // Restore Health
        const hp = world.getComponent(playerEntity, Health)!;
        hp.current = data.health.current;
        hp.max = data.health.max;

        // Restore Mana (If exists in save, else calculate)
        const mana = world.getComponent(playerEntity, Mana);
        if (mana) {
            if (data.mana) {
                mana.current = data.mana.current;
                mana.max = data.mana.max;
            } else {
                // Migration: Recalculate from Level if missing
                const vocKey = (data.vocation || 'knight').toLowerCase();
                const vocData = VOCATIONS[vocKey];
                if (vocData) {
                    const lvl = data.experience ? data.experience.level : 1;
                    mana.max = vocData.startMana + (vocData.manaGain * (lvl - 1));
                    mana.current = mana.max;
                }
            }
        }

        // Restore Vocation
        if (data.vocation) {
            // ... (Keep existing vocation restoration logic)
            const vocKey = data.vocation.toLowerCase();
            // ... (Logic is same as before, omitted from replace range if not needing update, but safer to include if I'm replacing big block)
            // Actually, I'll assume the replacement range covers inventory restoration mostly.
            // Wait, I am replacing lines 68-230. That includes Vocation.
            // I must re-include Vocation logic.
            const vocData = VOCATIONS[vocKey];
            if (vocData) {
                const currentVoc = world.getComponent(playerEntity, Vocation);
                if (currentVoc) {
                    currentVoc.name = vocData.name;
                    currentVoc.hpGain = vocData.hpGain;
                    currentVoc.manaGain = vocData.manaGain;
                    currentVoc.capGain = vocData.capGain;
                } else {
                    world.addComponent(playerEntity, new Vocation(vocData.name, vocData.hpGain, vocData.manaGain, vocData.capGain));
                }
                const vocationSpriteMap: Record<string, number> = {
                    'knight': SPRITES.PLAYER,
                    'mage': SPRITES.MAGE,
                    'ranger': SPRITES.RANGER,
                    'paladin': SPRITES.GUARD
                };
                const spriteIndex = vocationSpriteMap[vocKey] ?? SPRITES.PLAYER;
                const spriteComp = world.getComponent(playerEntity, Sprite);
                if (spriteComp) {
                    spriteComp.uIndex = spriteIndex;
                }
            }
        }

        // Restore Inventory (NEW)
        const inv = world.getComponent(playerEntity, Inventory)!;
        inv.gold = data.inventory.gold || 0;
        inv.equipment.clear();

        // Handle migration from old save format vs new
        if ((data.inventory as any).items) {
            // OLD FORMAT MIGRATION
            // (data.inventory.items array of simple items)
            (data.inventory as any).items.forEach((i: any) => {
                const newItem = new Item(i.name, i.slot || 'backpack', i.uIndex, i.damage, i.price, i.description, i.weaponType || 'none', 'common', i.defense || 0, 0, 0, false, 0);
                const inst = new ItemInstance(newItem, 1);
                inv.equip(i.slot || 'backpack', inst);
            });
        } else if (data.inventory.equipment) {
            // NEW FORMAT
            data.inventory.equipment.forEach((i: any) => {
                const newItem = new Item(i.name, i.slotType || 'none', i.uIndex, i.damage, i.price, i.description, i.weaponType, 'common', i.defense || 0, 0, 0, i.name === 'Backpack', i.name === 'Backpack' ? 20 : 0);

                const inst = new ItemInstance(newItem, i.count || 1);

                // Restore contents if backpack
                if (i.contents) {
                    i.contents.forEach((c: any) => {
                        const subItem = new Item(c.name, c.slotType, c.uIndex, c.damage, c.price, c.description, c.weaponType, 'common', c.defense);
                        inst.contents.push(new ItemInstance(subItem, c.count));
                    });
                }

                inv.equip(i.slotKey, inst);
            });
        }


        // Restore Experience
        const xp = world.getComponent(playerEntity, Experience)!;
        if (data.experience) {
            xp.current = data.experience.current;
            xp.next = data.experience.next;
            xp.level = data.experience.level;
        }

        // Force Reset LightSource to apply latest tweaks
        const light = world.getComponent(playerEntity, LightSource);
        if (light) {
            light.radius = 64;
            light.color = '#cc8844';
            light.flickers = true;
        }

        if (data.magic) {
            const spells = world.getComponent(playerEntity, SpellBook);
            if (spells) {
                spells.knownSpells = new Map(data.magic.knownSpells);
            } else {
                const sb = new SpellBook();
                sb.knownSpells = new Map(data.magic.knownSpells);
                world.addComponent(playerEntity, sb);
            }
            const sp = world.getComponent(playerEntity, SkillPoints);
            if (sp) {
                sp.current = data.magic.skillPoints;
            } else {
                world.addComponent(playerEntity, new SkillPoints(data.magic.skillPoints, 0));
            }
            const active = world.getComponent(playerEntity, ActiveSpell);
            if (active) {
                active.spellName = data.magic.activeSpell;
            } else {
                world.addComponent(playerEntity, new ActiveSpell(data.magic.activeSpell));
            }
        } else {
            // New Magic System Default (Old Save)
            const spells = world.getComponent(playerEntity, SpellBook);
            if (spells && !spells.knownSpells.has("Fireball")) spells.knownSpells.set("Fireball", 1);
            else if (!spells) world.addComponent(playerEntity, new SpellBook());

            const active = world.getComponent(playerEntity, ActiveSpell);
            if (!active) {
                world.addComponent(playerEntity, new ActiveSpell("adori flam"));
            }
            // Fix: Add SkillPoints fallback for old saves
            if (!world.getComponent(playerEntity, SkillPoints)) {
                world.addComponent(playerEntity, new SkillPoints(0, 0));
            }
        }

        // Restore Passives
        if (data.passives) {
            world.addComponent(playerEntity, new Passives(
                data.passives.vitality,
                data.passives.spirit,
                data.passives.agility,
                data.passives.might
            ));
        } else {
            // New Passives Default (Old Save)
            if (!world.getComponent(playerEntity, Passives)) {
                world.addComponent(playerEntity, new Passives());
            }
        }

        ui.updateStatus(hp.current, hp.max, 50, 50, 400, inv.gold, xp.level, xp.current, xp.next);

        if ((ui as any).console) (ui as any).console.addSystemMessage("Game Loaded.");

        return true;

    } catch (e) {
        console.error("Load failed:", e);
        if ((ui as any).console) (ui as any).console.addSystemMessage("Save Corrupt. Starting New Game.");
        return false;
    }
}
