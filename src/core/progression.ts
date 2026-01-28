// src/core/progression.ts
import { Health, Mana, Experience, Stats, Name, Skills } from "../components";
import { getExpForLevel } from "../data/experience";
import { spawnFloatingText } from "../effects";
import { gameEvents, EVENTS } from "./events";
import { addChatMessage } from "../ui";

export function addExperience(world: any, entityId: number, amount: number) {
    const exp = world.getComponent(entityId, Experience);
    if (!exp) return;

    exp.current += amount;

    // Visual feedback for exp gain (Optional: Only if player)
    const pos = world.getComponent(entityId, "Position");
    if (pos) {
        spawnFloatingText(pos.x, pos.y - 40, `+${amount} exp`, "#ffffff");
    }

    // Check for Level Up
    let nextThreshold = getExpForLevel(exp.level + 1);

    while (exp.current >= nextThreshold) {
        levelUp(world, entityId);
        nextThreshold = getExpForLevel(exp.level + 1);
    }
    exp.next = nextThreshold;

    // Emit event if player
    const gameObj = (window as any).game;
    if (gameObj && gameObj.player && entityId === gameObj.player.id) {
        gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, gameObj.player);
    }
}

export function tryAdvanceMagic(world: any, entityId: number, manaSpent: number) {
    const skills = world.getComponent(entityId, Skills);
    const pos = world.getComponent(entityId, "Position");

    if (!skills) return;

    // Magic Level Formula (Approximation: Mana Spent)
    // Tibia: Mana to advance = 1600 * 1.1^(ML)
    skills.magic.xp += manaSpent;

    let reqMana = Math.floor(100 * Math.pow(1.1, skills.magic.level));

    while (skills.magic.xp >= reqMana) {
        skills.magic.level++;
        skills.magic.xp -= reqMana;

        const msg = `You advanced to Magic Level ${skills.magic.level}.`;
        console.log(`[Progression] ${msg}`);
        addChatMessage(msg, 'system');

        if (pos) {
            spawnFloatingText(pos.x, pos.y - 60, "Magic UP!", "#00ffff");
        }

        reqMana = Math.floor(100 * Math.pow(1.1, skills.magic.level));
    }

    // Update UI
    const gameObj = (window as any).game;
    if (gameObj && gameObj.player && entityId === gameObj.player.id) {
        gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, gameObj.player);
    }
}

function levelUp(world: any, entityId: number) {
    const exp = world.getComponent(entityId, Experience)!;
    const hp = world.getComponent(entityId, Health);
    const mana = world.getComponent(entityId, Mana);
    const stats = world.getComponent(entityId, Stats);
    const pos = world.getComponent(entityId, "Position");

    exp.level++;

    // Tibia-style gains (Knight defaults)
    if (hp) {
        hp.max += 15;
        hp.current = hp.max; // Full heal
    }
    if (mana) {
        mana.max += 5;
        mana.current = mana.max; // Full mana
    }
    if (stats) {
        stats.capacity += 25;
    }

    const msg = `You advanced from Level ${exp.level - 1} to Level ${exp.level}.`;
    console.log(`[Progression] ${msg}`);
    addChatMessage(msg, 'system');

    if (pos) {
        spawnFloatingText(pos.x, pos.y - 60, "LEVEL UP!", "#ffff00");
    }

    // Emit Level Up Event (for animations, sounds, etc)
    gameEvents.emit(EVENTS.LEVEL_UP, { entityId, level: exp.level });
}

export function addSkillExperience(world: any, entityId: number, skillName: keyof Skills, amount: number) {
    const skills = world.getComponent(entityId, Skills);
    const pos = world.getComponent(entityId, "Position");

    if (!skills || !skills[skillName]) return;

    const skill = skills[skillName];
    // Don't add XP to Magic here (use tryAdvanceMagic)
    if (skillName === 'magic') return;

    skill.xp += amount;

    let reqXp = Math.floor(50 * Math.pow(1.1, skill.level));

    while (skill.xp >= reqXp) {
        skill.level++;
        skill.xp -= reqXp;

        const msg = `You advanced to ${skillName} fighting level ${skill.level}.`;
        console.log(`[Progression] ${msg}`);
        addChatMessage(msg, 'system');

        if (pos) {
            spawnFloatingText(pos.x, pos.y - 60, `${skillName.toUpperCase()} UP!`, "#00ff00");
        }

        reqXp = Math.floor(50 * Math.pow(1.1, skill.level));
    }

    // Update UI (Now outside level-up block for real-time progress bars)
    const gameObj = (window as any).game;
    if (gameObj && gameObj.player && entityId === gameObj.player.id) {
        gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, gameObj.player);
    }
}
