/**
 * Biome Spawn Rules Configuration
 * 
 * Defines where each monster type can spawn based on:
 * - Tile type (grass, sand, stone, etc.)
 * - Z-level (surface, underground)
 * - Area type (town, forest, dungeon)
 * - Noise value (for procedural placement)
 */

import { SPRITES } from '../constants';

// ============================================================
// TERRAIN TYPES (Matching noise.ts TERRAIN enum)
// ============================================================
export const TERRAIN_TYPE = {
    DEEP_WATER: 'deep_water',
    SHALLOW_WATER: 'shallow_water',
    SAND: 'sand',
    GRASS: 'grass',
    MOUNTAIN: 'mountain',
    STONE_FLOOR: 'stone_floor',
    COBBLE: 'cobble',
    TEMPLE_FLOOR: 'temple_floor',
    WOOD_FLOOR: 'wood_floor'
} as const;

export type TerrainTypeName = typeof TERRAIN_TYPE[keyof typeof TERRAIN_TYPE];

// ============================================================
// BIOME TYPES
// ============================================================
export const BIOME = {
    TOWN: 'town',           // Safe zones with NPCs
    FOREST: 'forest',       // Grass areas with trees
    BEACH: 'beach',         // Sandy coastlines
    MOUNTAIN: 'mountain',   // High elevation rocky areas
    DUNGEON: 'dungeon',     // Underground ruins (Z >= 8)
    RUINS: 'ruins',         // Surface stone structures
    CAVE: 'cave',           // Natural underground
    SEWER: 'sewer'          // Sewer System
} as const;

export type BiomeName = typeof BIOME[keyof typeof BIOME];

// ============================================================
// MONSTER DEFINITIONS
// ============================================================
export interface MonsterDefinition {
    id: string;
    name: string;
    spriteId: number;
    health: number;
    damage: number;
    experience: number;
    hostile: boolean;
    flees: boolean;
    fleeHealth: number;
    loot: LootEntry[];
    attackType: 'melee' | 'ranged' | 'magic';
    attackRange: number;
}

export interface LootEntry {
    itemId: number;
    chance: number;    // 0-1 probability
    maxCount: number;
}

// Monster Registry
export const MONSTERS: Record<string, MonsterDefinition> = {
    cat: {
        id: 'cat',
        name: 'Cat',
        spriteId: SPRITES.RAT, // Placeholder until cat sprite exists
        health: 20,
        damage: 0,
        experience: 0,
        hostile: false,
        flees: true,
        fleeHealth: 20,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    goblin: {
        id: 'goblin',
        name: 'Goblin',
        spriteId: SPRITES.ORC, // Using orc as placeholder
        health: 50,
        damage: 12,
        experience: 25,
        hostile: true,
        flees: true,
        fleeHealth: 5,
        loot: [
            { itemId: SPRITES.GOLD, chance: 1.0, maxCount: 12 },
            { itemId: SPRITES.AXE, chance: 0.2, maxCount: 1 },
            { itemId: SPRITES.LEATHER_BOOTS, chance: 0.35, maxCount: 1 }
        ],
        attackType: 'melee',
        attackRange: 1
    },
    mechanical_magus: {
        id: 'mechanical_magus',
        name: 'Mechanical Magus',
        spriteId: SPRITES.GOLEM, // Placeholder
        health: 550,
        damage: 80,
        experience: 850,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [
            { itemId: SPRITES.GOLD, chance: 1.0, maxCount: 75 },
            { itemId: SPRITES.PICKAXE, chance: 0.45, maxCount: 3 }, // Iron ore placeholder
            { itemId: SPRITES.MAGIC_SWORD, chance: 0.03, maxCount: 1 }
        ],
        attackType: 'magic',
        attackRange: 6
    },
    mechanical_tactician: {
        id: 'mechanical_tactician',
        name: 'Mechanical Tactician',
        spriteId: SPRITES.GOLEM, // Placeholder
        health: 500,
        damage: 70,
        experience: 750,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [
            { itemId: SPRITES.GOLD, chance: 1.0, maxCount: 60 },
            { itemId: SPRITES.PICKAXE, chance: 0.5, maxCount: 4 }, // Iron ore placeholder
            { itemId: SPRITES.ELF_ICICLE_BOW, chance: 0.05, maxCount: 1 }
        ],
        attackType: 'ranged',
        attackRange: 7
    },
    // --- NEW MOBS ---
    bandit: {
        id: 'bandit',
        name: 'Bandit',
        spriteId: 210, // Check manifest if 210 or 212
        health: 145,
        damage: 35,
        experience: 65,
        hostile: true,
        flees: true,
        fleeHealth: 15,
        loot: [{ itemId: SPRITES.GOLD, chance: 0.8, maxCount: 20 }],
        attackType: 'melee',
        attackRange: 1
    },
    bear: {
        id: 'bear',
        name: 'Bear',
        spriteId: 204,
        health: 180,
        damage: 40,
        experience: 23,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [{ itemId: SPRITES.MEAT, chance: 0.5, maxCount: 2 }],
        attackType: 'melee',
        attackRange: 1
    },
    rat: {
        id: 'rat',
        name: 'Rat',
        spriteId: 200,
        health: 20,
        damage: 5,
        experience: 5,
        hostile: true,
        flees: true,
        fleeHealth: 5,
        loot: [{ itemId: SPRITES.GOLD, chance: 0.2, maxCount: 2 }],
        attackType: 'melee',
        attackRange: 1
    },
    wolf: {
        id: 'wolf',
        name: 'Wolf',
        spriteId: 201,
        health: 25,
        damage: 15,
        experience: 18,
        hostile: true,
        flees: true,
        fleeHealth: 5,
        loot: [{ itemId: SPRITES.MEAT, chance: 0.4, maxCount: 1 }],
        attackType: 'melee',
        attackRange: 1
    },
    // ORCS
    orc: {
        id: 'orc',
        name: 'Orc',
        spriteId: 9,
        health: 70,
        damage: 25,
        experience: 25,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [{ itemId: SPRITES.GOLD, chance: 0.5, maxCount: 10 }],
        attackType: 'melee',
        attackRange: 1
    },
    orc_spearman: {
        id: 'orc_spearman',
        name: 'Orc Spearman',
        spriteId: 9, // Using base Orc sprite if specific one missing
        health: 80,
        damage: 30,
        experience: 35,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [{ itemId: SPRITES.GOLD, chance: 0.5, maxCount: 15 }],
        attackType: 'ranged',
        attackRange: 4
    },
    orc_warrior: {
        id: 'orc_warrior',
        name: 'Orc Warrior',
        spriteId: 58,
        health: 125,
        damage: 40,
        experience: 50,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [{ itemId: SPRITES.GOLD, chance: 0.6, maxCount: 25 }],
        attackType: 'melee',
        attackRange: 1
    },
    orc_rider: {
        id: 'orc_rider',
        name: 'Orc Rider',
        spriteId: 253,
        health: 180,
        damage: 50,
        experience: 110,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [{ itemId: SPRITES.GOLD, chance: 0.7, maxCount: 40 }],
        attackType: 'melee',
        attackRange: 1
    },
    orc_warlord: {
        id: 'orc_warlord',
        name: 'Orc Warlord',
        spriteId: 333,
        health: 950,
        damage: 120,
        experience: 670,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [{ itemId: SPRITES.GOLD, chance: 0.9, maxCount: 80 }],
        attackType: 'melee',
        attackRange: 1
    },
    // CYCLOPS
    cyclops: {
        id: 'cyclops',
        name: 'Cyclops',
        spriteId: 7003,
        health: 260,
        damage: 65,
        experience: 150,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [{ itemId: SPRITES.GOLD, chance: 0.7, maxCount: 50 }],
        attackType: 'melee',
        attackRange: 1
    },
    // UNDEAD
    skeleton: {
        id: 'skeleton',
        name: 'Skeleton',
        spriteId: 202,
        health: 50,
        damage: 20,
        experience: 35,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    ghost: {
        id: 'ghost',
        name: 'Ghost',
        spriteId: 301,
        health: 150,
        damage: 45,
        experience: 120,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    zombie: {
        id: 'zombie',
        name: 'Zombie',
        spriteId: 300,
        health: 100,
        damage: 35,
        experience: 60,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    mummy: {
        id: 'mummy',
        name: 'Mummy',
        spriteId: 323,
        health: 240,
        damage: 60,
        experience: 150,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    necromancer: {
        id: 'necromancer',
        name: 'Necromancer',
        spriteId: 289,
        health: 580,
        damage: 70,
        experience: 580,
        hostile: true,
        flees: true,
        fleeHealth: 50,
        loot: [],
        attackType: 'magic',
        attackRange: 5
    },
    // SEWER/SWAMP
    slime: {
        id: 'slime',
        name: 'Slime',
        spriteId: 203,
        health: 150,
        damage: 30,
        experience: 60,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    snake: {
        id: 'snake',
        name: 'Snake',
        spriteId: 324,
        health: 15,
        damage: 10,
        experience: 10,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    // DESERT
    scarab: {
        id: 'scarab',
        name: 'Scarab',
        spriteId: 7006,
        health: 320,
        damage: 75,
        experience: 120,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    larva: {
        id: 'larva',
        name: 'Larva',
        spriteId: 7007,
        health: 70,
        damage: 25,
        experience: 45,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    scorpion_king: {
        id: 'scorpion_king',
        name: 'Scorpion King',
        spriteId: 322,
        health: 1200,
        damage: 150,
        experience: 1500,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    // FROST
    polar_bear: {
        id: 'polar_bear',
        name: 'Polar Bear',
        spriteId: 320,
        health: 250,
        damage: 60,
        experience: 90,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    yeti: {
        id: 'yeti',
        name: 'Yeti',
        spriteId: 321,
        health: 950,
        damage: 110,
        experience: 460,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    frost_giant: {
        id: 'frost_giant',
        name: 'Frost Giant',
        spriteId: 330,
        health: 800,
        damage: 100,
        experience: 400,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    hydra: {
        id: 'hydra',
        name: 'Hydra',
        spriteId: 332,
        health: 2350,
        damage: 180,
        experience: 2100,
        hostile: true,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 3
    },
    // NPCS / SPECIAL
    royal_guard: {
        id: 'royal_guard',
        name: 'Royal Guard',
        spriteId: 267,
        health: 500,
        damage: 100,
        experience: 0,
        hostile: false,
        flees: false,
        fleeHealth: 0,
        loot: [],
        attackType: 'melee',
        attackRange: 1
    },
    henricus: { id: 'henricus', name: 'Henricus', spriteId: 266, health: 100, damage: 0, experience: 0, hostile: false, flees: false, fleeHealth: 0, loot: [], attackType: 'melee', attackRange: 1 },
    king_tibianus: { id: 'king_tibianus', name: 'King Tibianus', spriteId: 260, health: 1000, damage: 0, experience: 0, hostile: false, flees: false, fleeHealth: 0, loot: [], attackType: 'melee', attackRange: 1 },
    clyde: { id: 'clyde', name: 'Clyde', spriteId: 260, health: 100, damage: 0, experience: 0, hostile: false, flees: false, fleeHealth: 0, loot: [], attackType: 'melee', attackRange: 1 },
    beggar: { id: 'beggar', name: 'Beggar', spriteId: 267, health: 100, damage: 0, experience: 0, hostile: false, flees: false, fleeHealth: 0, loot: [], attackType: 'melee', attackRange: 1 },
    willard: { id: 'willard', name: 'Willard', spriteId: 265, health: 100, damage: 0, experience: 0, hostile: false, flees: false, fleeHealth: 0, loot: [], attackType: 'melee', attackRange: 1 },
    xodet: { id: 'xodet', name: 'Xodet', spriteId: 264, health: 100, damage: 0, experience: 0, hostile: false, flees: false, fleeHealth: 0, loot: [], attackType: 'melee', attackRange: 1 }
};

// ============================================================
// SPAWN RULES: Biome → Monster Mapping
// ============================================================
export interface SpawnRule {
    monsterId: string;
    weight: number;        // Relative spawn chance (higher = more common)
    minDifficulty: number; // Minimum area difficulty (1-10)
    maxDifficulty: number; // Maximum area difficulty
    minNoiseValue?: number; // Optional: Only spawn if noise > this value
    maxNoiseValue?: number; // Optional: Only spawn if noise < this value
}

export const SPAWN_RULES: Record<BiomeName, SpawnRule[]> = {
    // TOWN: Passive animals only
    [BIOME.TOWN]: [
        { monsterId: 'cat', weight: 100, minDifficulty: 0, maxDifficulty: 10 }
    ],

    // FOREST: Low-level creatures
    [BIOME.FOREST]: [
        { monsterId: 'goblin', weight: 60, minDifficulty: 1, maxDifficulty: 5, minNoiseValue: 0.5 },
        { monsterId: 'cat', weight: 20, minDifficulty: 0, maxDifficulty: 3 }
        // Add more: wolf, bear, etc.
    ],

    // BEACH: Coastal creatures
    [BIOME.BEACH]: [
        { monsterId: 'cat', weight: 10, minDifficulty: 0, maxDifficulty: 2 }
        // Add: crab, etc.
    ],

    // MOUNTAIN: Medium-difficulty creatures
    [BIOME.MOUNTAIN]: [
        { monsterId: 'goblin', weight: 40, minDifficulty: 2, maxDifficulty: 6 }
        // Add: troll, cyclops, etc.
    ],

    // DUNGEON: High-level mechanical creatures (Underground Z >= 8)
    [BIOME.DUNGEON]: [
        { monsterId: 'mechanical_magus', weight: 40, minDifficulty: 6, maxDifficulty: 10 },
        { monsterId: 'mechanical_tactician', weight: 50, minDifficulty: 5, maxDifficulty: 10 },
        { monsterId: 'goblin', weight: 10, minDifficulty: 3, maxDifficulty: 6 }
    ],

    // RUINS: Surface ruins with mechanicals
    [BIOME.RUINS]: [
        { monsterId: 'mechanical_tactician', weight: 45, minDifficulty: 5, maxDifficulty: 10 },
        { monsterId: 'mechanical_magus', weight: 30, minDifficulty: 6, maxDifficulty: 10 },
        { monsterId: 'goblin', weight: 25, minDifficulty: 3, maxDifficulty: 5 }
    ],

    // CAVE: Natural underground
    [BIOME.CAVE]: [
        { monsterId: 'goblin', weight: 50, minDifficulty: 2, maxDifficulty: 5 }
        // Add: spider, bat, etc.
    ]
};

// ============================================================
// TILE TYPE → BIOME MAPPING
// ============================================================
export function getBiomeFromTile(tileType: TerrainTypeName, zLevel: number, isNearTown: boolean): BiomeName {
    // Priority: Town check
    if (isNearTown && (tileType === TERRAIN_TYPE.COBBLE || tileType === TERRAIN_TYPE.TEMPLE_FLOOR)) {
        return BIOME.TOWN;
    }

    if (zLevel >= 8) {
        if (tileType === TERRAIN_TYPE.STONE_FLOOR) {
            return BIOME.DUNGEON; // Deep Ruins
        }
        if (tileType === TERRAIN_TYPE.COBBLE) {
            return BIOME.SEWER; // Sewer System
        }
        return BIOME.CAVE; // Natural Caves
    }

    // Surface biomes
    // SURFACE BIOMES
    switch (tileType) {
        case TERRAIN_TYPE.GRASS:
            return BIOME.FOREST;
        case TERRAIN_TYPE.SAND:
            return BIOME.BEACH;
        case TERRAIN_TYPE.MOUNTAIN:
            return BIOME.MOUNTAIN;
        case TERRAIN_TYPE.STONE_FLOOR:
            return BIOME.RUINS;
        case TERRAIN_TYPE.COBBLE:
        case TERRAIN_TYPE.TEMPLE_FLOOR:
            return BIOME.TOWN;
        default:
            return BIOME.FOREST; // Default fallback
    }
}

// ... (Existing SPAWN_RULES needs SEWER added)
Object.assign(SPAWN_RULES, {
    [BIOME.SEWER]: [
        { monsterId: 'rat', weight: 40, minDifficulty: 0, maxDifficulty: 5 },
        { monsterId: 'slime', weight: 40, minDifficulty: 1, maxDifficulty: 6 }, // Assuming slime exists or will fall back
        { monsterId: 'bat', weight: 20, minDifficulty: 1, maxDifficulty: 5 }
    ]
});

// ============================================================
// MAIN FUNCTION: Get Monster for Biome
// ============================================================
/**
 * Selects a monster appropriate for the given tile and difficulty.
 * 
 * @param tileType - The terrain type (grass, sand, stone_floor, etc.)
 * @param difficulty - Area difficulty level (1-10)
 * @param zLevel - Z coordinate (7 = surface, 8+ = underground)
 * @param noiseValue - Optional noise value for spawn filtering
 * @param isNearTown - Whether this tile is near a town center
 * @returns Monster ID string or null if no spawn
 */
export function getMonsterForBiome(
    tileType: string,
    difficulty: number,
    zLevel: number = 7,
    noiseValue: number = 0.5,
    isNearTown: boolean = false
): string | null {
    // Step 1: Determine biome
    const biome = getBiomeFromTile(tileType as TerrainTypeName, zLevel, isNearTown);

    // Step 2: Get spawn rules for this biome
    const rules = SPAWN_RULES[biome];
    if (!rules || rules.length === 0) return null;

    // Step 3: Filter rules by difficulty and noise
    const validRules = rules.filter(rule => {
        // Difficulty check
        if (difficulty < rule.minDifficulty || difficulty > rule.maxDifficulty) {
            return false;
        }
        // Noise check (optional)
        if (rule.minNoiseValue !== undefined && noiseValue < rule.minNoiseValue) {
            return false;
        }
        if (rule.maxNoiseValue !== undefined && noiseValue > rule.maxNoiseValue) {
            return false;
        }
        return true;
    });

    if (validRules.length === 0) return null;

    // Step 4: Weighted random selection
    const totalWeight = validRules.reduce((sum, r) => sum + r.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const rule of validRules) {
        roll -= rule.weight;
        if (roll <= 0) {
            return rule.monsterId;
        }
    }

    // Fallback (shouldn't reach here)
    return validRules[0].monsterId;
}

/**
 * Get monster definition by ID
 */
export function getMonsterDefinition(monsterId: string): MonsterDefinition | null {
    return MONSTERS[monsterId] || null;
}

/**
 * Check if a monster can spawn at a specific location
 */
export function canMonsterSpawnAt(
    monsterId: string,
    tileType: string,
    zLevel: number,
    isNearTown: boolean
): boolean {
    const biome = getBiomeFromTile(tileType as TerrainTypeName, zLevel, isNearTown);
    const rules = SPAWN_RULES[biome];

    if (!rules) return false;

    return rules.some(rule => rule.monsterId === monsterId);
}
