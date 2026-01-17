import { Position, Health, Sprite, Tint, Stats, CombatState, TileMap, FloatingText, Experience, Corpse, ItemInstance, Inventory, Lootable, AI, Target, Skills, Interactable, CorpseDefinition, Item } from '../components';
import { Player } from './player';
// import { Item } from './types'; // Removed to use Item from components
import { SPRITES } from '../constants'; // Moved to top
import { damageTextManager } from '../client/damage_text';
import { gameEvents, EVENTS } from './events';

export const combatSystem = (world: any) => {
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
                damageTextManager.addText(tPos.x, tPos.y - 16, "MISS", '#aaaaaa');
                continue;
            }

            // 1.5 SKILL GAIN (New)
            // Only for Sword for now
            skills.sword.xp += 1;
            const reqXp = Math.floor(10 * Math.pow(1.1, skills.sword.level));
            if (skills.sword.xp >= reqXp) {
                skills.sword.level++;
                skills.sword.xp = 0;
                damageTextManager.addText(pos.x, pos.y - 32, "Skill Up!", "#ffff00");
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
            }

            // 5. Visual Feedback
            if (damage <= 0) {
                damageTextManager.addText(tPos.x, tPos.y - 16, "BLOCK", '#00aaff');
            } else {
                if (isCrit) {
                    damageTextManager.addText(tPos.x, tPos.y - 24, `CRIT ${damage}!`, '#ffff00');
                } else {
                    damageTextManager.addText(tPos.x + 8, tPos.y, damage.toString(), '#ff3333');
                }
            }

            // Death Check
            if (tHealth.current <= 0) {
                handleDeath(world, targetId);
                targetComp.targetId = null;
            }
        }
    }
};

// Helper: Handle Death (Corpses & Loot)
function handleDeath(world: any, victimId: number) {
    const pos = world.getComponent(victimId, Position);
    const sprite = world.getComponent(victimId, Sprite);
    const loot = world.getComponent(victimId, Lootable); // Assumes we have Lootable component

    if (pos && sprite) {
        // Create Corpse Entity
        const corpseId = world.createEntity();
        world.addComponent(corpseId, new Position(pos.x, pos.y));

        // Corpse Sprite Logic
        let corpseSpriteId = SPRITES.CORPSE || 299;

        // Use CorpseDefinition if available
        const corpseDef = world.getComponent(victimId, CorpseDefinition);
        if (corpseDef && corpseDef.spriteId) {
            corpseSpriteId = corpseDef.spriteId;
        }

        const cSprite = new Sprite(corpseSpriteId, 32);
        world.addComponent(corpseId, cSprite);
        world.addComponent(corpseId, new Tint('#ffffffff'));

        // Add Lootable Component
        const lootItems: Item[] = [];
        if (loot && loot.items) {
            for (const item of loot.items) {
                // DROP RATE BOOST: 100% chance (User complained "no loot")
                // Was 50%.
                if (Math.random() < 1.0) {
                    lootItems.push(item);
                    console.log(`[Loot] Dropped ${item.name}`);
                }
            }
        }
        world.addComponent(corpseId, new Lootable(lootItems));

        // Decay (5 mins)
        world.addComponent(corpseId, new Corpse(300));

        // Fix: Add Interactable so we can click it!
        world.addComponent(corpseId, new Interactable("Loot Corpse"));

    }

    // Destroy Victim
    world.removeEntity(victimId);
}
