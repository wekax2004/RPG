import { World } from './engine';
import { Position, Health, Inventory, QuestLog, PlayerControllable, Item, Experience, Skills, Mana, Vocation, LightSource, VOCATIONS, SpellBook, SkillPoints, ActiveSpell, Passives } from './components';
import { SPRITES } from './assets';

import { UIManager } from './ui';

interface SaveData {
    position: { x: number, y: number };
    health: { current: number, max: number };
    inventory: {
        items: Array<{ slot: string, name: string, uIndex: number, damage: number, price: number, description: string, weaponType: string }>;
        storage: Array<{ slot: string, name: string, uIndex: number, damage: number, price: number, description: string, weaponType: string }>;
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
}

const SAVE_KEY = 'retro-rpg-save-v2';

export function saveGame(world: World, ui?: UIManager) {
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

    // Serialize Inventory
    const itemsFunc = (items: Map<string, Item>) => {
        const arr: any[] = [];
        items.forEach((item) => {
            arr.push({
                slot: item.slot, name: item.name, uIndex: item.uIndex,
                damage: item.damage, price: item.price || 10,
                description: item.description || "", weaponType: item.weaponType || "sword",
                defense: item.defense || 0
            });
        });
        return arr;
    };

    // Serialize Storage
    const storageArr = inv.storage.map(item => ({
        slot: item.slot, name: item.name, uIndex: item.uIndex,
        damage: item.damage, price: item.price || 10,
        description: item.description || "", weaponType: item.weaponType || "sword",
        defense: item.defense || 0
    }));

    const data: SaveData = {
        position: { x: pos.x, y: pos.y },
        health: { current: hp.current, max: hp.max },
        mana: { current: mana ? mana.current : 0, max: mana ? mana.max : 0 },
        vocation: voc ? voc.name.toLowerCase() : 'knight',
        inventory: {
            items: itemsFunc(inv.items),
            storage: storageArr,
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

        // Restore Vocation (Update Component)
        // If data.vocation exists, update the Vocation component to match gains
        if (data.vocation) {
            const vocKey = data.vocation.toLowerCase();
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
            }
        }

        // Restore Inventory
        const inv = world.getComponent(playerEntity, Inventory)!;
        inv.gold = data.inventory.gold || 0;
        inv.items.clear();
        inv.storage = [];

        data.inventory.items.forEach((i: any) => {
            // Fix Sprite IDs (Migration)
            if (i.name === "Wooden Shield") i.uIndex = SPRITES.WOODEN_SHIELD;
            else if (i.name === "Tower Shield") i.uIndex = SPRITES.WOODEN_SHIELD;
            else if (i.name === "Wooden Sword") i.uIndex = SPRITES.WOODEN_SWORD;
            else if (i.name === "Noble Sword") i.uIndex = SPRITES.NOBLE_SWORD;
            else if (i.name === "Iron Sword") i.uIndex = SPRITES.SWORD;

            const item = new Item(i.name, i.slot, i.uIndex, i.damage, i.price, i.description, i.weaponType, 'common', i.defense || 0);
            inv.items.set(i.slot, item);
        });

        data.inventory.storage.forEach((i: any) => {
            // Fix Sprite IDs (Migration)
            if (i.name === "Wooden Shield") i.uIndex = SPRITES.WOODEN_SHIELD;
            else if (i.name === "Tower Shield") i.uIndex = SPRITES.WOODEN_SHIELD;
            else if (i.name === "Wooden Sword") i.uIndex = SPRITES.WOODEN_SWORD;
            else if (i.name === "Noble Sword") i.uIndex = SPRITES.NOBLE_SWORD;
            else if (i.name === "Iron Sword") i.uIndex = SPRITES.SWORD;

            const item = new Item(i.name, i.slot, i.uIndex, i.damage, i.price, i.description, i.weaponType, 'common', i.defense || 0);
            inv.storage.push(item);
        });

        // Restore Quest
        const quest = world.getComponent(playerEntity, QuestLog)!;
        // Check for new format vs legacy
        if ((data.quest as any).quests) {
            quest.quests = (data.quest as any).quests;
            quest.completedQuestIds = (data.quest as any).completedQuestIds || [];
        } else {
            // Legacy Fallback (Clear active, tough luck)
            quest.quests = [];
            quest.completedQuestIds = [];
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
