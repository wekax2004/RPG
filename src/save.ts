import { World } from './engine';
import { Position, Health, Inventory, QuestLog, PlayerControllable, Item, Experience, Skills, Mana, Vocation, LightSource, VOCATIONS } from './components';

import { UIManager } from './ui';

interface SaveData {
    position: { x: number, y: number };
    health: { current: number, max: number };
    inventory: {
        items: Array<{ slot: string, name: string, uIndex: number, damage: number }>;
        storage: Array<{ slot: string, name: string, uIndex: number, damage: number }>;
        gold: number;
    };
    quest: {
        questId: string | null;
        targetType: string | null;
        progress: number;
        targetCount: number;
        completed: boolean;
    };
    experience: { current: number, next: number, level: number };
    mana: { current: number, max: number };
    vocation: string;
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

    // Serialize Inventory
    const itemsFunc = (items: Map<string, Item>) => {
        const arr: any[] = [];
        items.forEach((item) => {
            arr.push({ slot: item.slot, name: item.name, uIndex: item.uIndex, damage: item.damage });
        });
        return arr;
    };

    // Serialize Storage
    const storageArr = inv.storage.map(item => ({
        slot: item.slot, name: item.name, uIndex: item.uIndex, damage: item.damage
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
            questId: quest.questId,
            targetType: quest.targetType,
            progress: quest.progress,
            targetCount: quest.targetCount,
            completed: quest.completed
        },
        experience: {
            current: xp ? xp.current : 0,
            next: xp ? xp.next : 100,
            level: xp ? xp.level : 1
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
        inv.items.clear();
        inv.storage = [];

        data.inventory.items.forEach((i: any) => {
            inv.items.set(i.slot, new Item(i.name, i.slot, i.uIndex, i.damage));
        });

        data.inventory.storage.forEach((i: any) => {
            inv.storage.push(new Item(i.name, i.slot, i.uIndex, i.damage));
        });
        inv.gold = (data.inventory as any).gold !== undefined ? (data.inventory as any).gold : 100;

        // Restore Quest
        const quest = world.getComponent(playerEntity, QuestLog)!;
        quest.questId = data.quest.questId || "";
        quest.targetType = data.quest.targetType || "";
        quest.progress = data.quest.progress;
        quest.targetCount = data.quest.targetCount;
        quest.completed = data.quest.completed;

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

        ui.updateStatus(hp.current, hp.max, 50, 50, 400, inv.gold, xp.level, xp.current, xp.next);

        if ((ui as any).console) (ui as any).console.addSystemMessage("Game Loaded.");

        return true;

    } catch (e) {
        console.error("Load failed:", e);
        if ((ui as any).console) (ui as any).console.addSystemMessage("Save Corrupt. Starting New Game.");
        return false;
    }
}
