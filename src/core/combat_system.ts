import { Position, Health, Sprite, Tint, Stats, CombatState, TileMap, FloatingText, Experience, Corpse, ItemInstance, Inventory, Lootable, AI, Target, Skills, Interactable, CorpseDefinition, Item, Name } from '../components';
import { SPRITES, CORPSE_IDS, ITEM_IDS } from '../constants';
import { spawnFloatingText, spawnBloodEffect } from '../effects';
import { gameEvents, EVENTS } from './events';
import { MONSTER_LOOT, LootEntry } from '../data/loot';
import { createItemFromRegistry } from '../data/items';
import { addExperience } from './progression';

import { AudioController } from '../audio';
import { UIManager } from '../client/ui_manager';
import { InputHandler } from '../engine';

export const combatSystem = (world: any, input: InputHandler, audio: AudioController, ui: UIManager) => {
    const now = performance.now();

    // Phase 2 Combat Logic
    const combatants = world.query([CombatState, Position, Stats, Target, Skills]);

    for (const attackerId of combatants) {
        const combat = world.getComponent(attackerId, CombatState)!;
        const pos = world.getComponent(attackerId, Position)!;
        const stats = world.getComponent(attackerId, Stats); // Base Stats
        const skills = world.getComponent(attackerId, Skills);
        const targetComp = world.getComponent(attackerId, Target)!;

        // Skip if missing required components
        if (!stats || !skills) continue;

        // Skip Cooldown early (Optimization)
        const cooldownMs = (1000 / stats.attackSpeed);
        if (now - combat.lastAttackTime < cooldownMs) continue;

        const targetId = targetComp.targetId;
        if (targetId === null) continue;

        // Verify Target
        const tPos = world.getComponent(targetId, Position);
        const tHealth = world.getComponent(targetId, Health);

        if (!tPos || !tHealth || tHealth.current <= 0) {
            targetComp.targetId = null;
            continue;
        }

        // Z-Level Check
        if (tPos.z !== pos.z) continue;

        // Determine Attack Type & Range
        // (For now assumes Melee Sword; Phase 3 will check Weapon Type)
        // Default Melee
        let range = stats.range || 48; // Use stats.range or default to 48px
        let skillLevel = skills.sword.level;
        let weaponAtk = stats.attack; // Use entity stats as "weapon + base" for now

        // Check Distance
        const dist = Math.sqrt((tPos.x - pos.x) ** 2 + (tPos.y - pos.y) ** 2);

        if (dist <= range) {
            // == EXECUTE ATTACK ==
            combat.lastAttackTime = now;

            // 1. Hit Chance (Simple: 90% Base + Skill Factor?)
            // Let's assume 90% hit rate for now
            if (Math.random() > 0.9) {
                spawnFloatingText(tPos.x, tPos.y - 16, tPos.z, "MISS", '#aaaaaa');
                continue;
            }

            // 1.5 SKILL GAIN (Dynamic)
            const inv = world.getComponent(attackerId, Inventory);
            let weaponType = 'fist'; // Default

            if (inv) {
                const weapon = inv.getEquipped('rhand') || inv.getEquipped('lhand'); // Check both hands
                if (weapon && weapon.item.weaponType) {
                    // map 'sword', 'axe', 'club' directly.
                    if (['sword', 'axe', 'club'].includes(weapon.item.weaponType)) {
                        weaponType = weapon.item.weaponType;
                    }
                }
            }

            // Audio Feedback
            if (audio) audio.playWeaponSound(weaponType);

            // Gain XP based on Weapon Type
            // @ts-ignore
            if (skills[weaponType]) {
                // @ts-ignore
                skills[weaponType].xp += 1;
                // @ts-ignore
                const reqXp = Math.floor(10 * Math.pow(1.1, skills[weaponType].level));

                // @ts-ignore
                console.log(`[Combat] Attacker ${weaponType} XP: ${skills[weaponType].xp} / ${reqXp}`);

                // @ts-ignore
                if (skills[weaponType].xp >= reqXp) {
                    // @ts-ignore
                    skills[weaponType].level++;
                    // @ts-ignore
                    skills[weaponType].xp = 0;
                    spawnFloatingText(pos.x, pos.y - 32, pos.z, "Skill Up!", "#ffff00");
                }
            }

            // UI UPDATE: If attacker is player, update skill bars
            const gameObj = (window as any).game;
            if (gameObj && gameObj.player && attackerId === gameObj.player.id) {
                gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, gameObj.player);
            }

            // 2. Damage Calculation
            let rawDmg = (skillLevel * weaponAtk * 0.05);
            // Variance
            const variance = (Math.random() * 0.3) - 0.2;
            rawDmg = rawDmg * (1 + variance);

            // 3. Crit Check (5% Chance)
            let isCrit = false;
            if (Math.random() < 0.05) {
                isCrit = true;
                rawDmg *= 1.5;
            }

            // 4. Block/Defense
            let defense = 0;
            const tStats = world.getComponent(targetId, Stats);
            if (tStats) defense = tStats.defense;

            // Armor Reduction
            let damage = Math.max(0, rawDmg - defense);
            damage = Math.floor(damage);

            // Apply Damage
            tHealth.current = Math.max(0, tHealth.current - damage);

            // UI UPDATE: If target is player, update HP
            if (gameObj && gameObj.player && targetId === gameObj.player.id) {
                gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, gameObj.player);

                // 4.5 SHIELD SKILL GAIN (Defender)
                // Only if player is defender
                const defSkills = world.getComponent(targetId, Skills);
                const defInv = world.getComponent(targetId, Inventory);

                // check if shielding equipped
                let hasShield = false;
                if (defInv && (defInv.getEquipped('lhand')?.item.type === 'shield' || defInv.getEquipped('rhand')?.item.type === 'shield')) {
                    hasShield = true;
                }

                if (defSkills && hasShield) {
                    defSkills.shielding.xp += 1; // 1 XP per hit taken/blocked
                    const reqXp = Math.floor(10 * Math.pow(1.1, defSkills.shielding.level));

                    console.log(`[Combat] Defender Shield XP: ${defSkills.shielding.xp} / ${reqXp} (Lvl ${defSkills.shielding.level})`);

                    if (defSkills.shielding.xp >= reqXp) {
                        defSkills.shielding.level++;
                        defSkills.shielding.xp = 0;
                        spawnFloatingText(tPos.x, tPos.y - 48, tPos.z, "Shield UP!", "#0000ff");
                        console.log(`[Combat] Shield Level Up! New Level: ${defSkills.shielding.level}`);
                    }
                }
            }

            // 5. Visual Feedback
            spawnBloodEffect(tPos.x, tPos.y, tPos.z);
            if (damage <= 0) {
                spawnFloatingText(tPos.x, tPos.y - 16, tPos.z, "BLOCK", '#00aaff');
            } else {
                if (isCrit) {
                    spawnFloatingText(tPos.x, tPos.y - 24, tPos.z, `CRIT ${damage}!`, '#ffff00');
                } else {
                    spawnFloatingText(tPos.x + 8, tPos.y, tPos.z, damage.toString(), '#ff3333');
                }
            }

            // Death Check
            if (tHealth.current <= 0) {
                handleDeath(world, targetId, attackerId); // Pass attackerId
                targetComp.targetId = null;
            }
        }
    }
};

// Helper: Roll the dice for loot
function generateLootItems(monsterName: string): ItemInstance[] {
    const table = MONSTER_LOOT[monsterName] || [];
    const loot: ItemInstance[] = [];

    table.forEach(entry => {
        if (Math.random() <= entry.chance) {
            const count = entry.maxCount ? Math.floor(Math.random() * entry.maxCount) + 1 : 1;
            const item = createItemFromRegistry(entry.itemId, count);
            loot.push(new ItemInstance(item, count));
        }
    });

    return loot;
}

// Helper: Handle Death (Corpses & Loot)
export function handleDeath(world: any, victimId: number, killerId?: number) {
    const pos = world.getComponent(victimId, Position);
    const nameComp = world.getComponent(victimId, Name);

    if (!pos || !nameComp) {
        world.removeEntity(victimId);
        return;
    }

    const monsterName = nameComp.value;
    console.log(`${monsterName} died.`);

    // QUEST HOOK
    gameEvents.emit(EVENTS.MOB_KILLED, monsterName);

    // 1. Determine Corpse ID
    const upperName = monsterName.toUpperCase();
    const corpseSpriteId = CORPSE_IDS[upperName as keyof typeof CORPSE_IDS] || CORPSE_IDS.DEFAULT;

    // 2. Generate Loot Content
    const lootItems = generateLootItems(monsterName);

    // 3. Create Corpse Entity
    const corpseId = world.createEntity();
    world.addComponent(corpseId, new Position(pos.x, pos.y, pos.z));
    world.addComponent(corpseId, new Sprite(corpseSpriteId, 32));
    world.addComponent(corpseId, new Tint('#ffffffff'));
    world.addComponent(corpseId, new Lootable(lootItems));
    world.addComponent(corpseId, new Corpse(300)); // 5 min decay
    world.addComponent(corpseId, new Interactable("Loot Corpse"));

    console.log(`[Combat] ${monsterName} spawned corpse ${corpseSpriteId} with ${lootItems.length} items.`);

    // AWARD EXPERIENCE
    if (killerId) {
        // Assume monsters have a yield
        const xpAmount = 50; // Hardcoded for now
        addExperience(world, killerId, xpAmount);
    }

    // 4. Destroy Victim
    world.removeEntity(victimId);
}
