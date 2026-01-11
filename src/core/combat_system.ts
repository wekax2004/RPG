
import {
    Position, Player, Health, Stats, CombatState, Target, Sprite, Name, Experience
} from '../components';
import { damageTextManager } from '../client/damage_text';

export const combatSystem = (world: any) => {
    const now = performance.now();

    // Query Attackers (Entities with CombatState, Position, Stats, Target)
    const attackers = world.query([CombatState, Position, Stats, Target]);

    for (const attackerId of attackers) {
        const combat = world.getComponent(attackerId, CombatState);
        const pos = world.getComponent(attackerId, Position);
        const stats = world.getComponent(attackerId, Stats);
        const targetComp = world.getComponent(attackerId, Target);

        if (!combat || !pos || !stats || !targetComp) continue;

        const targetId = targetComp.targetId;

        // Skip if no target
        if (targetId === null) continue;

        // Find Target Entity Components
        // We verify the target still has Health and Position (exists and is alive-ish)
        const targetHealth = world.getComponent(targetId, Health);
        const targetPos = world.getComponent(targetId, Position);
        const targetStats = world.getComponent(targetId, Stats); // Optional
        const targetExp = world.getComponent(targetId, Experience); // Optional

        if (!targetHealth || !targetPos) {
            // Target lost/dead/invalid
            targetComp.targetId = null;
            continue;
        }

        if (targetHealth.current <= 0) {
            targetComp.targetId = null;
            continue;
        }


        // Check Range (Standard Melee = 1.5 tiles approx 48px)
        const dx = targetPos.x - pos.x;
        const dy = targetPos.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const attackRange = 48; // Simple melee range

        if (dist <= attackRange) {
            // Check Cooldown
            const cooldownMs = (1000 / stats.attackSpeed);

            if (now - combat.lastAttackTime >= cooldownMs) {
                // ATTACK!
                combat.lastAttackTime = now;

                // Calculate Damage
                // Damage = Attack - Defense (Min 1)
                // Variation: +/- 20%
                let damage = stats.attack;

                if (targetStats) {
                    damage -= targetStats.defense;
                }

                damage = Math.max(1, damage); // Min 1 damage

                // Random variation
                const variation = (Math.random() * 0.4) - 0.2; // -0.2 to +0.2
                damage = Math.floor(damage * (1 + variation));
                damage = Math.max(0, damage);

                // Apply Damage
                targetHealth.current -= damage;

                // Visual Feedback
                damageTextManager.addText(
                    targetPos.x + 8, // Center-ish
                    targetPos.y,
                    damage.toString(),
                    '#ff3333'
                );

                // Handle Death
                if (targetHealth.current <= 0) {
                    // Simple XP Reward
                    const attackerExp = world.getComponent(attackerId, Experience);
                    if (attackerExp && targetExp) {
                        // Placeholder XP gain
                        // attackerExp.current += 10;
                    }

                    // Add death text
                    damageTextManager.addText(targetPos.x, targetPos.y - 16, "DEAD", "#888888");

                    // Clear Target
                    targetComp.targetId = null;

                    // Destroy Target
                    world.removeEntity(targetId);
                }
            }
        }
    }
};
