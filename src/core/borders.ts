/**
 * Tibia-Style Auto-Bordering System
 * Uses bitmasking to determine the correct border sprite IDs
 * 
 * Based on Tibia 8.60 border logic:
 * - Check 8 neighbors to calculate a unique 'mask' value
 * - Map mask to specific Tibia Item IDs
 */

// Direction bitmask constants
export const DIRECTION = {
    NORTH: 1,
    EAST: 2,
    SOUTH: 4,
    WEST: 8,
    NORTH_EAST: 16,
    SOUTH_EAST: 32,
    SOUTH_WEST: 64,
    NORTH_WEST: 128
} as const;

// ============================================================
// GRASS BORDER LOOKUP TABLE
// Maps calculated bitmask to specific Tibia Sprite IDs
// Base Ground: ID 4526 (Green Grass)
// These are 'Overlay' items - placed ON TOP of ground tile
// ============================================================
export const GRASS_BORDER_TABLE: Record<number, number> = {
    // Single Edges (most common)
    [DIRECTION.NORTH]: 4542,              // North Edge
    [DIRECTION.EAST]: 4543,               // East Edge
    [DIRECTION.SOUTH]: 4544,              // South Edge
    [DIRECTION.WEST]: 4545,               // West Edge

    // Inner Corners (L-Shapes - two cardinal neighbors)
    [DIRECTION.NORTH | DIRECTION.EAST]: 4546,   // Top-Right Inner
    [DIRECTION.EAST | DIRECTION.SOUTH]: 4547,   // Bottom-Right Inner
    [DIRECTION.SOUTH | DIRECTION.WEST]: 4548,   // Bottom-Left Inner
    [DIRECTION.WEST | DIRECTION.NORTH]: 4549,   // Top-Left Inner

    // Outer Corners (sharp points - diagonal checks)
    // These use special IDs above 1000 to indicate corner logic
    1001: 4550, // North-West Outer Corner
    1002: 4551, // North-East Outer Corner
    1003: 4552, // South-East Outer Corner
    1004: 4553  // South-West Outer Corner
};

// ============================================================
// SAND BORDER LOOKUP TABLE
// Sand borders between grass and water
// ============================================================
export const SAND_BORDER_TABLE: Record<number, number> = {
    [DIRECTION.NORTH]: 4554,
    [DIRECTION.EAST]: 4555,
    [DIRECTION.SOUTH]: 4556,
    [DIRECTION.WEST]: 4557,
    [DIRECTION.NORTH | DIRECTION.EAST]: 4558,
    [DIRECTION.EAST | DIRECTION.SOUTH]: 4559,
    [DIRECTION.SOUTH | DIRECTION.WEST]: 4560,
    [DIRECTION.WEST | DIRECTION.NORTH]: 4561
};

// ============================================================
// MOUNTAIN IDS (Grey Mountain - Tibia 8.60)
// These are "Blocking" wall items
// ============================================================
export const MOUNTAIN_IDS = {
    // Straight Walls
    NORTH: 4468,
    WEST: 4469,
    SOUTH: 4470,
    EAST: 4471,

    // Outer Corners (Convex - mountain sticks out)
    OUTER_NW: 4479,
    OUTER_NE: 4476,
    OUTER_SW: 4478,
    OUTER_SE: 4477,

    // Inner Corners (Concave - mountain creates nook)
    INNER_NW: 4475,
    INNER_NE: 4472,
    INNER_SW: 4474,
    INNER_SE: 4473,

    // Ground fill for mountain top
    TOP_GROUND: 4480
} as const;

// ============================================================
// RAMP IDS (Stone Style - Tibia 8.60)
// Replace mountain wall to allow floor transition
// ============================================================
export const RAMP_IDS = {
    // Walking INTO these goes UP (Z - 1)
    NORTH: 1950,  // Replaces North Wall
    EAST: 1951,   // Replaces East Wall
    SOUTH: 1952,  // Replaces South Wall
    WEST: 1953    // Replaces West Wall
} as const;

// ============================================================
// LADDER / HOLE IDS
// ============================================================
export const VERTICAL_IDS = {
    HOLE_DOWN: 594,       // Open hole on Z=7, falls to Z=8
    ROPE_SPOT: 384,       // Ground on Z=8 under hole (rope usable)
    LADDER_UP: 1386,      // Ladder on Z=8, click to go to Z=7
    STAIRS_DOWN: 1390,    // Stairs on Z=7, walk to go to Z=8
    STAIRS_UP: 1391       // Stairs on Z=8, walk to go to Z=7
} as const;

// ============================================================
// BORDER CALCULATION FUNCTIONS
// ============================================================

/**
 * Calculate grass border ID based on neighbors
 * @param grid - 2D terrain type array
 * @param x - current X coordinate
 * @param y - current Y coordinate
 * @param grassType - terrain type considered "grass" (default 3)
 * @returns Border sprite ID or null if no border needed
 */
export function getGrassBorderId(
    grid: number[][],
    x: number,
    y: number,
    grassType: number = 3
): number | null {
    // Only process grass tiles
    if (grid[y]?.[x] !== grassType) return null;

    let mask = 0;

    // Check cardinal directions (is neighbor NOT grass?)
    const n = grid[y - 1]?.[x];
    const e = grid[y]?.[x + 1];
    const s = grid[y + 1]?.[x];
    const w = grid[y]?.[x - 1];

    if (n !== undefined && n !== grassType && n < grassType) mask += DIRECTION.NORTH;
    if (e !== undefined && e !== grassType && e < grassType) mask += DIRECTION.EAST;
    if (s !== undefined && s !== grassType && s < grassType) mask += DIRECTION.SOUTH;
    if (w !== undefined && w !== grassType && w < grassType) mask += DIRECTION.WEST;

    // If no edges, check corners for outer corner logic
    if (mask === 0) {
        const nw = grid[y - 1]?.[x - 1];
        const ne = grid[y - 1]?.[x + 1];
        const se = grid[y + 1]?.[x + 1];
        const sw = grid[y + 1]?.[x - 1];

        if (nw !== undefined && nw !== grassType && nw < grassType) return GRASS_BORDER_TABLE[1001];
        if (ne !== undefined && ne !== grassType && ne < grassType) return GRASS_BORDER_TABLE[1002];
        if (se !== undefined && se !== grassType && se < grassType) return GRASS_BORDER_TABLE[1003];
        if (sw !== undefined && sw !== grassType && sw < grassType) return GRASS_BORDER_TABLE[1004];

        return null; // No border needed
    }

    return GRASS_BORDER_TABLE[mask] || null;
}

/**
 * Calculate mountain wall ID based on neighbors
 * @param grid - 2D terrain type array (4 = mountain mass)
 * @param x - current X coordinate
 * @param y - current Y coordinate
 * @returns Mountain wall sprite ID or null if interior/not mountain
 */
export function getMountainId(
    grid: number[][],
    x: number,
    y: number
): number | null {
    // Only process mountain tiles
    if (grid[y]?.[x] !== 4) return null;

    // Check 4 cardinals (true = neighbor is also mountain)
    const n = grid[y - 1]?.[x] === 4;
    const e = grid[y]?.[x + 1] === 4;
    const s = grid[y + 1]?.[x] === 4;
    const w = grid[y]?.[x - 1] === 4;

    // === OUTER CORNERS (Tips) ===
    // Two adjacent sides are empty
    if (!n && !w) return MOUNTAIN_IDS.OUTER_NW;
    if (!n && !e) return MOUNTAIN_IDS.OUTER_NE;
    if (!s && !w) return MOUNTAIN_IDS.OUTER_SW;
    if (!s && !e) return MOUNTAIN_IDS.OUTER_SE;

    // === STRAIGHT WALLS ===
    // One side is empty
    if (!n) return MOUNTAIN_IDS.NORTH;
    if (!s) return MOUNTAIN_IDS.SOUTH;
    if (!w) return MOUNTAIN_IDS.WEST;
    if (!e) return MOUNTAIN_IDS.EAST;

    // === INNER CORNERS (Nooks) ===
    // All cardinals solid, but diagonal empty
    const nw = grid[y - 1]?.[x - 1] === 4;
    const ne = grid[y - 1]?.[x + 1] === 4;
    const sw = grid[y + 1]?.[x - 1] === 4;
    const se = grid[y + 1]?.[x + 1] === 4;

    if (!nw) return MOUNTAIN_IDS.INNER_NW;
    if (!ne) return MOUNTAIN_IDS.INNER_NE;
    if (!sw) return MOUNTAIN_IDS.INNER_SW;
    if (!se) return MOUNTAIN_IDS.INNER_SE;

    // All neighbors solid = interior (no wall, just ground)
    return null;
}

/**
 * Apply border calculations to entire grid
 * Returns array of border overlays to place
 */
export interface BorderOverlay {
    x: number;
    y: number;
    spriteId: number;
}

export function calculateAllBorders(grid: number[][]): BorderOverlay[] {
    const borders: BorderOverlay[] = [];
    const height = grid.length;
    const width = grid[0]?.length || 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Check grass borders
            const grassBorder = getGrassBorderId(grid, x, y);
            if (grassBorder) {
                borders.push({ x, y, spriteId: grassBorder });
            }
        }
    }

    return borders;
}

/**
 * Calculate mountain walls for entire grid
 * Returns array of wall placements
 */
export interface MountainWall {
    x: number;
    y: number;
    z: number; // Floor level (6 for mountain top, 7 for base)
    spriteId: number;
    isRamp?: boolean;
    rampDirection?: 'north' | 'east' | 'south' | 'west';
}

export function calculateMountainWalls(grid: number[][], baseZ: number = 7): MountainWall[] {
    const walls: MountainWall[] = [];
    const height = grid.length;
    const width = grid[0]?.length || 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const wallId = getMountainId(grid, x, y);
            if (wallId) {
                walls.push({
                    x,
                    y,
                    z: baseZ,
                    spriteId: wallId
                });
            }
        }
    }

    return walls;
}

/**
 * Place ramps on mountain walls
 * Randomly converts some walls to ramps for floor access
 */
export function placeRamps(
    walls: MountainWall[],
    grid: number[][],
    rampChance: number = 0.1,
    seed: number = 12345
): MountainWall[] {
    let rng = seed;
    const nextRandom = () => {
        rng = (rng * 16807) % 2147483647;
        return rng / 2147483647;
    };

    return walls.map(wall => {
        if (nextRandom() < rampChance) {
            // Determine ramp direction based on wall type
            let rampId: number | null = null;
            let direction: 'north' | 'east' | 'south' | 'west' | undefined;

            if (wall.spriteId === MOUNTAIN_IDS.NORTH) {
                rampId = RAMP_IDS.NORTH;
                direction = 'north';
            } else if (wall.spriteId === MOUNTAIN_IDS.EAST) {
                rampId = RAMP_IDS.EAST;
                direction = 'east';
            } else if (wall.spriteId === MOUNTAIN_IDS.SOUTH) {
                rampId = RAMP_IDS.SOUTH;
                direction = 'south';
            } else if (wall.spriteId === MOUNTAIN_IDS.WEST) {
                rampId = RAMP_IDS.WEST;
                direction = 'west';
            }

            if (rampId) {
                return {
                    ...wall,
                    spriteId: rampId,
                    isRamp: true,
                    rampDirection: direction
                };
            }
        }
        return wall;
    });
}
