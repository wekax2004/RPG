import { World, Entity } from "./engine";
import { Position, Stats, Name, Health, CombatState, AI, Velocity, Facing, TileMap } from "./components";
import { Player } from "./core/player";
import { spawnFloatingText, spawnBloodEffect } from "./effects";
import { gameEvents, EVENTS } from "./core/events";
import { getNextStep } from "./pathfinding";

const MONSTER_MOVE_COOLDOWN = 1000; // 1 second between moves (Tibia speed)

export function updateMonsterAI(world: World, currentTime: number, player: Player, map: TileMap | null) {
    // Get all monsters (Entities with AI, Position, Stats, Name, CombatState)
    const monsterIds = world.query([AI, Position, Stats, Name, CombatState, Health]);

    // Player pixel coordinates (center of tile)
    const px = player.x * 32;
    const py = player.y * 32;

    for (const id of monsterIds) {
        const ai = world.getComponent(id, AI)!;
        const pos = world.getComponent(id, Position)!;
        const stats = world.getComponent(id, Stats)!;
        const combat = world.getComponent(id, CombatState)!;
        const name = world.getComponent(id, Name)!.value;
        const vel = world.getComponent(id, Velocity);

        // 1. Calculate Chebyshev Distance in Tiles (Tibia style)
        const mx = pos.x / 32;
        const my = pos.y / 32;
        const distX = Math.abs(mx - player.x);
        const distY = Math.abs(my - player.y);
        const dist = Math.max(distX, distY);

        // Z-Level Check
        if (pos.z !== player.z) continue;

        // 2. CHASE/MOVE LOGIC 
        // Sight range 8
        if (dist <= 8 && dist > 1) {
            // Move towards player if cooldown allows
            if (currentTime - ai.lastWanderTime >= MONSTER_MOVE_COOLDOWN) {
                if (map) {
                    moveTowardsPlayerSmart(world, id, pos, player, currentTime, map);
                } else {
                    moveTowardsPlayer(world, id, pos, player, currentTime);
                }
            }
        } else if (dist > 8) {
            // WANDER (Idle)
            if (currentTime - ai.lastWanderTime >= 3000) { // Wander every 3s
                wanderRandomly(world, id, pos, currentTime);
            }
        }

        // 3. ATTACK LOGIC
        // If adjacent (dist === 1)
        if (dist <= 1.1) { // Floating point safety
            const attackInterval = 1000 / stats.attackSpeed; // stats.attackSpeed is attacks/sec
            if (currentTime - combat.lastAttackTime >= attackInterval) {
                performMonsterAttack(world, id, player, stats, combat, name, currentTime);
            }
            // Stop moving if attacking
            if (vel) { vel.x = 0; vel.y = 0; }
        }
    }
}

function performMonsterAttack(world: World, monsterId: Entity, player: Player, stats: Stats, combat: CombatState, name: string, time: number) {
    combat.lastAttackTime = time;

    // 1. Calculate Damage
    // Formula: (Monster Atk) - (Player Armor)
    const baseDmg = stats.attack;
    const variance = Math.floor(Math.random() * 6); // 0-5

    // Get player armor from stats or equipment
    const playerArmor = player.stats.defense; // We have defense in Stats component

    const damage = Math.max(0, (baseDmg + variance) - playerArmor);

    // 2. Apply Damage to Player
    const playerHealth = world.getComponent(player.id, Health);
    if (!playerHealth) return;

    playerHealth.current -= damage;
    console.log(`[AI] ${name} hit player for ${damage} damage!`);

    // 3. Visuals
    const px = player.x * 32 + 16;
    const py = player.y * 32 + 16;

    spawnBloodEffect(world, px, py, player.z);
    if (damage > 0) {
        spawnFloatingText(world, px, py - 20, player.z, damage.toString(), "#ff0000"); // Red
    } else {
        spawnFloatingText(world, px, py - 20, player.z, "Block", "#aaaaaa"); // Grey
    }

    // 4. Emit Stats Change Event to trigger UI update
    gameEvents.emit(EVENTS.PLAYER_STATS_CHANGED, player);

    // 5. Check Player Death
    if (playerHealth.current <= 0) {
        handlePlayerDeath(world, player);
    }
}

function moveTowardsPlayerSmart(world: World, id: Entity, pos: Position, target: Player, time: number, map: TileMap) {
    const ai = world.getComponent(id, AI);
    if (!ai) return;

    ai.lastWanderTime = time;

    const mx = pos.x / 32;
    const my = pos.y / 32;

    // Invalidate path if target moved significantly
    // (Simple check: if target tile changed)
    if (Math.round(ai.pathTargetX) !== Math.round(target.x) ||
        Math.round(ai.pathTargetY) !== Math.round(target.y)) {
        // Target moved, might need repathing eventually, 
        // but `getNextStep` handles validity checks too.
        // We'll trust `getNextStep` to use or discard the cache.
    }

    const step = getNextStep(
        mx, my,
        target.x, target.y,
        map,
        ai.cachedPath,
        ai.pathTargetX,
        ai.pathTargetY
    );

    // Update Cache
    if (step.pathValid) {
        ai.cachedPath = step.newPath;
        ai.pathTargetX = target.x;
        ai.pathTargetY = target.y;
    } else {
        ai.cachedPath = []; // Path invalid or empty
    }

    // Execute Move
    // Calculate delta for animation/facing
    const nextPixelX = step.nextX * 32;
    const nextPixelY = step.nextY * 32;

    const dx = nextPixelX - pos.x;
    const dy = nextPixelY - pos.y;

    pos.x = nextPixelX;
    pos.y = nextPixelY;

    // Update Facing
    const facing = world.getComponent(id, Facing);
    if (facing) {
        if (dx > 0) { facing.x = 1; facing.y = 0; }
        else if (dx < 0) { facing.x = -1; facing.y = 0; }
        else if (dy > 0) { facing.x = 0; facing.y = 1; }
        else if (dy < 0) { facing.x = 0; facing.y = -1; }
    }
}

function moveTowardsPlayer(world: World, id: Entity, pos: Position, target: Player, time: number) {
    const ai = world.getComponent(id, AI);
    if (ai) ai.lastWanderTime = time;

    // Move 1 tile towards player
    let dx = 0;
    let dy = 0;

    if (pos.x < target.x * 32) dx = 32;
    else if (pos.x > target.x * 32) dx = -32;
    else if (pos.y < target.y * 32) dy = 32;
    else if (pos.y > target.y * 32) dy = -32;

    pos.x += dx;
    pos.y += dy;

    // Update Facing
    const facing = world.getComponent(id, Facing);
    if (facing) {
        if (dx !== 0) { facing.x = dx > 0 ? 1 : -1; facing.y = 0; }
        else if (dy !== 0) { facing.x = 0; facing.y = dy > 0 ? 1 : -1; }
    }
}

function wanderRandomly(world: World, id: Entity, pos: Position, time: number) {
    const ai = world.getComponent(id, AI);
    if (ai) ai.lastWanderTime = time;

    if (Math.random() > 0.5) return; // Don't wander every time

    const dir = Math.floor(Math.random() * 4);
    let dx = 0; let dy = 0;
    if (dir === 0) dy = -32; // North
    if (dir === 1) dx = 32;  // East
    if (dir === 2) dy = 32;  // South
    if (dir === 3) dx = -32; // West

    pos.x += dx;
    pos.y += dy;

    // Update Facing
    const facing = world.getComponent(id, Facing);
    if (facing) {
        if (dx !== 0) { facing.x = dx > 0 ? 1 : -1; facing.y = 0; }
        else if (dy !== 0) { facing.x = 0; facing.y = dy > 0 ? 1 : -1; }
    }
}

function handlePlayerDeath(world: World, player: Player) {
    const hp = world.getComponent(player.id, Health);
    if (hp) {
        hp.current = hp.max;
        // Respawn at Town Center (approx)
        player.x = 128;
        player.y = 128;
    }
    gameEvents.emit(EVENTS.SYSTEM_MESSAGE, "You were killed! You have been resurrected.");
}
