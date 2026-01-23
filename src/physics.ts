
import { SPRITES } from './constants';

export const PHYSICS = {
    // ============================================================
    // SOLID ITEM IDS (Blocking Movement)
    // ============================================================
    SOLIDS: new Set([
        // Walls
        17, // Wall Horizontal
        21, // Wall Vertical (Rookgaard)
        600, 601, 602, // 3D Walls
        219, // OTSP Wall

        // Trees & Nature
        18, // Old Tree
        19, // Old Rock
        34, // Old Bush
        37, // Cactus
        57, // Dead Tree
        50, // Tree Pine (SPRITES.TREE_PINE)
        51, // Tree Oak (SPRITES.TREE_OAK)
        6,  // Large Rock
        7,  // Bush

        // Water (Blocking)
        SPRITES.WATER,
        200, // Water (old ID)
        202, // Deep Water
        26,  // Standard Water
        304, // Custom Water

        // Objects
        30, // Barrel
        31, // Crate
        100, // Generic Block
        20,  // Altar

        // Mountain walls (blocking)
        4468, 4469, 4470, 4471, // Straight walls N/W/S/E
        4472, 4473, 4474, 4475, // Inner corners
        4476, 4477, 4478, 4479  // Outer corners
    ]),

    // ============================================================
    // WATER TILES (For separate water check)
    // ============================================================
    WATER_IDS: new Set([
        SPRITES.WATER,
        200,
        202,
        26,
        304
    ]),

    // ============================================================
    // RAMP IDS (For floor transitions)
    // ============================================================
    RAMP_IDS: {
        NORTH: 1950,
        EAST: 1951,
        SOUTH: 1952,
        WEST: 1953
    } as const,

    // ============================================================
    // VERTICAL TRANSITION IDS
    // ============================================================
    VERTICAL_IDS: {
        HOLE_DOWN: 594,
        ROPE_SPOT: 384,
        LADDER_UP: 1386,
        STAIRS_DOWN: 1390,
        STAIRS_UP: 1391
    } as const,

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================

    isSolid(id: number): boolean {
        return this.SOLIDS.has(id);
    },

    isWater(id: number): boolean {
        return this.WATER_IDS.has(id);
    },

    isRamp(id: number): { isRamp: boolean; direction?: 'north' | 'east' | 'south' | 'west' } {
        switch (id) {
            case this.RAMP_IDS.NORTH: return { isRamp: true, direction: 'north' };
            case this.RAMP_IDS.EAST: return { isRamp: true, direction: 'east' };
            case this.RAMP_IDS.SOUTH: return { isRamp: true, direction: 'south' };
            case this.RAMP_IDS.WEST: return { isRamp: true, direction: 'west' };
            default: return { isRamp: false };
        }
    },

    isHole(id: number): boolean {
        return id === this.VERTICAL_IDS.HOLE_DOWN;
    },

    isLadder(id: number): boolean {
        return id === this.VERTICAL_IDS.LADDER_UP;
    },

    isStairsDown(id: number): boolean {
        return id === this.VERTICAL_IDS.STAIRS_DOWN;
    },

    isStairsUp(id: number): boolean {
        return id === this.VERTICAL_IDS.STAIRS_UP;
    }
};
