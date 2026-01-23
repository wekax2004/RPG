/**
 * Complete Movement Handler
 * 
 * Handles:
 * - Standard walking (WASD / Arrow Keys)
 * - Diagonal movement (Q/E/Z/C)
 * - Solid collisions (walls, water, mountains)
 * - Z-Axis Ramp Logic (auto floor changes)
 * - Landing pad safety checks
 */

import { Player } from './core/player';
import { WorldMap } from './core/map';
import { PHYSICS } from './physics';

// ============================================================
// BLOCKING IDS (Stop movement on SAME floor)
// ============================================================
export const BLOCKING_IDS = new Set([
    // Water
    4608, 200, 202, 26, 304,

    // Walls
    1020, 17, 21, 219, 600, 601, 602,

    // Mountain Walls (Straight)
    4468, 4469, 4470, 4471,

    // Mountain Corners
    4479, 4476, 4478, 4477,
    4472, 4473, 4474, 4475
]);

// ============================================================
// FLOOR CHANGE IDS (Changes Z when walked onto)
// ============================================================
export const RAMP_IDS = {
    NORTH: 1950,
    EAST: 1951,
    SOUTH: 1952,
    WEST: 1953,
    STAIRS_DOWN: 438,
    STAIRS_UP: 1391,
    LADDER_UP: 1386,
    HOLE_DOWN: 594,
    SEWER_GRATE: 312 // Standard Sewer Grate
} as const;

// Direction type
export type Direction = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

/**
 * Move result for feedback
 */
export interface MoveResult {
    success: boolean;
    blocked?: string;
    floorChanged?: boolean;
    newZ?: number;
}

/**
 * Attempts to move the player in a specific direction.
 * Handles collisions, ramps, stairs, and floor changes.
 * 
 * @param player - The player instance
 * @param map - The world map
 * @param dx - Direction X (-1, 0, 1)
 * @param dy - Direction Y (-1, 0, 1)
 * @returns MoveResult with success/failure info
 */
export function movePlayer(
    player: Player,
    map: WorldMap,
    dx: number,
    dy: number
): MoveResult {
    const startX = player.x;
    const startY = player.y;
    const startZ = player.z;

    // 1. Calculate Target Coordinates
    let targetX = startX + dx;
    let targetY = startY + dy;
    let targetZ = startZ;

    // 2. Get Target Tile (on CURRENT floor)
    let targetTile = null;
    if ((map as any).map3D) {
        targetTile = (map as any).map3D.getTile(targetX, targetY, startZ);
    } else {
        targetTile = map.getTile(targetX, targetY);
    }

    // BOUNDARY CHECK
    if (!targetTile) {
        return { success: false, blocked: 'boundary' };
    }

    // 3. COLLISION CHECK (Standard blocking)
    // Check items on the tile for blocking
    const isBlocked = targetTile.items.some(item =>
        BLOCKING_IDS.has(item.id) || PHYSICS.isSolid(item.id)
    );

    if (isBlocked) {
        return { success: false, blocked: 'solid' };
    }

    // 4. RAMP LOGIC (Going UP - Z decreases in Tibia)
    let isRampMove = false;
    let rampPushDx = 0;
    let rampPushDy = 0;

    for (const item of targetTile.items) {
        console.log(`[Move] Checking Item ID: ${item.id} on ${targetX},${targetY}`);
        if (item.id === RAMP_IDS.NORTH) {
            targetZ -= 1;
            rampPushDy = -1; // Push north
            isRampMove = true;
            break;
        } else if (item.id === RAMP_IDS.SOUTH) {
            targetZ -= 1;
            rampPushDy = 1; // Push south
            isRampMove = true;
            break;
        } else if (item.id === RAMP_IDS.EAST) {
            targetZ -= 1;
            rampPushDx = 1; // Push east
            isRampMove = true;
            break;
        } else if (item.id === RAMP_IDS.WEST) {
            targetZ -= 1;
            rampPushDx = -1; // Push west
            isRampMove = true;
            break;
        }
    }

    // Apply ramp push (move player forward after going up)
    if (isRampMove) {
        targetX += rampPushDx;
        targetY += rampPushDy;
    }

    // 5. STAIRS/HOLE LOGIC (Going DOWN - Z increases)
    for (const item of targetTile.items) {
        if (item.id === RAMP_IDS.STAIRS_DOWN || item.id === RAMP_IDS.HOLE_DOWN || item.id === RAMP_IDS.SEWER_GRATE) {
            console.log(`[Move] Found HOLE/GRATE ${item.id}. Dropping Z.`);
            targetZ += 1;
            break;
        }
        if (item.id === RAMP_IDS.STAIRS_UP || item.id === RAMP_IDS.LADDER_UP) {
            targetZ -= 1;
            break;
        }
    }

    // 6. SAFETY CHECK (Landing Pad)
    // If floor changed, verify landing spot is valid
    if (targetZ !== startZ) {
        // Clamp Z to valid range
        targetZ = Math.max(0, Math.min(15, targetZ));

        // In a full 3D map, we'd check the destination floor
        // For now, just log the floor change
        console.log(`[Movement] Floor change: Z=${startZ} → Z=${targetZ}`);

        // TODO: When WorldMap3D is used in renderer, check:
        // const landingTile = map3D.getTile(targetX, targetY, targetZ);
        // if (!landingTile || isBlocked(landingTile)) return blocked;
    }

    // 7. COMMIT THE MOVE
    player.x = targetX;
    player.y = targetY;
    player.z = targetZ;

    // 8. Update Direction (for sprite facing)
    updatePlayerDirection(player, dx, dy);

    return {
        success: true,
        floorChanged: targetZ !== startZ,
        newZ: targetZ
    };
}

/**
 * Update player direction based on movement vector
 */
function updatePlayerDirection(player: Player, dx: number, dy: number): void {
    // Prioritize vertical direction for animation
    if (dy < 0) {
        player.direction = 0; // North
        player.flipX = false;
    } else if (dy > 0) {
        player.direction = 2; // South
        player.flipX = false;
    } else if (dx < 0) {
        player.direction = 3; // West
        player.flipX = true;
    } else if (dx > 0) {
        player.direction = 1; // East
        player.flipX = false;
    }
}

/**
 * Get movement delta from direction name
 */
export function getMoveDelta(direction: Direction): { dx: number; dy: number } {
    switch (direction) {
        case 'north': return { dx: 0, dy: -1 };
        case 'south': return { dx: 0, dy: 1 };
        case 'east': return { dx: 1, dy: 0 };
        case 'west': return { dx: -1, dy: 0 };
        case 'northeast': return { dx: 1, dy: -1 };
        case 'northwest': return { dx: -1, dy: -1 };
        case 'southeast': return { dx: 1, dy: 1 };
        case 'southwest': return { dx: -1, dy: 1 };
    }
}

/**
 * Check if a tile is walkable (for pathfinding)
 */
export function isTileWalkable(map: WorldMap, x: number, y: number): boolean {
    const tile = map.getTile(x, y);
    if (!tile) return false;

    return !tile.items.some(item =>
        BLOCKING_IDS.has(item.id) || PHYSICS.isSolid(item.id)
    );
}
