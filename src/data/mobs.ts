import { SPRITES } from '../constants';

export interface MobDef {
    name: string;
    hp: number;
    attack: number;
    defense: number;
    speed: number; // Pixels per second (approx)
    xp: number;    // XP value
    spriteIndex: number; // Single Sprite
    behavior: 'aggressive' | 'neutral' | 'passive' | 'ranged' | 'caster';
    lootTable: string; // key in LOOT_TABLES
    attackRange?: number;
    keepDistance?: number;
    spells?: string[];
    equipment?: {
        rhand?: number;
        lhand?: number;
        body?: number;
        head?: number;
    };
    resistance?: {
        physical?: number; // 0.0 to 1.0 (1.0 = Immune)
        fire?: number;
        ice?: number;
        poison?: number;
        magic?: number;
    };
    fleeThreshold?: number;
    corpse?: number;

    // special skills
    splitOnDeath?: boolean; // Default splits into 2 of same type (smaller?)
    statusOnHit?: {
        type: 'poison' | 'bleed' | 'freeze';
        chance: number;
        power: number;
        duration: number;
    };

    // Boss Mechanics
    isBoss?: boolean;
    bossSkills?: {
        name: string;
        type: 'aoe' | 'summon' | 'buff' | 'projectile' | 'heal';
        damage?: number;
        range?: number;
        cooldown: number; // Seconds
        summonType?: string; // For summon skills
        summonCount?: number;
        statusEffect?: 'poison' | 'freeze' | 'bleed';
    }[];
    enrageThreshold?: number; // HP % at which boss enrages (speed/damage boost)
}


export const MOB_REGISTRY: Record<string, MobDef> = {
    'rat': {
        name: "Rat",
        hp: 25,
        attack: 5,
        defense: 1,
        speed: 80,
        xp: 10,
        spriteIndex: SPRITES.RAT,
        behavior: 'aggressive',
        lootTable: 'rat',
        fleeThreshold: 0.15,
        corpse: SPRITES.RAT_DEAD || 23
    },
    'wolf': {
        name: "Wolf",
        hp: 60,
        attack: 12,
        defense: 4,
        speed: 70,
        xp: 35,
        spriteIndex: SPRITES.WOLF,
        behavior: 'aggressive',
        lootTable: 'wolf',
        fleeThreshold: 0.1,
        corpse: SPRITES.WOLF_DEAD || 24
    },
    'bear': {
        name: "Bear",
        hp: 140,
        attack: 25,
        defense: 10,
        speed: 55,
        xp: 90,
        spriteIndex: SPRITES.BEAR,
        behavior: 'neutral',
        lootTable: 'bear',
        fleeThreshold: 0,
        corpse: SPRITES.BEAR_DEAD || 25
    },
    'spider': {
        name: "Giant Spider",
        hp: 80,
        attack: 18,
        defense: 6,
        speed: 90,
        xp: 60,
        spriteIndex: SPRITES.SPIDER || 44,
        behavior: 'aggressive',
        lootTable: 'spider',
        fleeThreshold: 0.1,
        corpse: SPRITES.SPIDER_DEAD || 45,
        statusOnHit: { type: 'poison', chance: 0.4, power: 3, duration: 10 }
    },
    'orc': {
        name: "Orc Warrior",
        hp: 120,
        attack: 20,
        defense: 12,
        speed: 60,
        xp: 110,
        spriteIndex: SPRITES.ORC || 58,
        behavior: 'aggressive',
        lootTable: 'orc',
        fleeThreshold: 0,
        corpse: SPRITES.ORC_DEAD || 59,
        equipment: {
            rhand: SPRITES.HAND_AXE,
            lhand: SPRITES.STUDDED_CLUB,
            body: SPRITES.CHAIN_ARMOR
        }
    },
    'bandit': {
        name: "Bandit",
        hp: 90,
        attack: 15,
        defense: 5,
        speed: 80,
        xp: 65,
        spriteIndex: SPRITES.BANDIT, // New ID 210
        behavior: 'aggressive',
        lootTable: 'bandit',
        fleeThreshold: 0.2,
        corpse: SPRITES.HUMAN_CORPSE || 22,
        equipment: {
            rhand: SPRITES.SABRE,
            head: SPRITES.LEATHER_HELMET
        }
    },
    'cyclops': {
        name: "Cyclops",
        hp: 260,
        attack: 45,
        defense: 12,
        speed: 65,
        xp: 150,
        spriteIndex: SPRITES.CYCLOPS, // ID 7003
        behavior: 'aggressive',
        lootTable: 'orc', // Placeholder loot
        fleeThreshold: 0.1,
        corpse: SPRITES.ORC_DEAD || 59
    },
    'royal_guard': {
        name: "Royal Guard",
        hp: 500,
        attack: 60,
        defense: 40,
        speed: 70,
        xp: 0,
        spriteIndex: SPRITES.NPC_GUIDE, // Placeholder
        behavior: 'neutral',
        lootTable: 'none',
        fleeThreshold: 0,
        corpse: SPRITES.HUMAN_CORPSE
    },
    'skeleton': {
        name: "Skeleton",
        hp: 45,
        attack: 15,
        defense: 5,
        speed: 50,
        xp: 40,
        spriteIndex: SPRITES.SKELETON,
        behavior: 'aggressive',
        lootTable: 'skeleton',
        fleeThreshold: 0,
        corpse: SPRITES.BONES || 22,
        equipment: {
            rhand: SPRITES.MACE
        },
        resistance: { poison: 1.0, ice: 0.2 } // Undead immune to poison
    },
    'zombie': {
        name: "Zombie",
        hp: 100,
        attack: 18,
        defense: 8,
        speed: 30,
        xp: 55,
        spriteIndex: SPRITES.ZOMBIE,
        behavior: 'aggressive',
        lootTable: 'zombie',
        fleeThreshold: 0,
        corpse: SPRITES.ZOMBIE_DEAD || 22,
        resistance: { poison: 1.0 }
    },
    'ghost': {
        name: "Ghost",
        hp: 60,
        attack: 25,
        defense: 0,
        speed: 60,
        xp: 75,
        spriteIndex: SPRITES.GHOST,
        behavior: 'aggressive',
        lootTable: 'ghost',
        fleeThreshold: 0,
        corpse: 0,
        resistance: { physical: 1.0, poison: 1.0 } // Ethereal
    },
    'slime': {
        name: "Slime",
        hp: 30,
        attack: 10,
        defense: 2,
        speed: 25,
        xp: 15,
        spriteIndex: SPRITES.SLIME,
        behavior: 'aggressive',
        lootTable: 'slime',
        fleeThreshold: 0,
        corpse: SPRITES.SLIME_PUDDLE || 26,
        splitOnDeath: true,
        resistance: { physical: 0.2 } // Squishy but resilient?
    },
    'necromancer': {
        name: "Necromancer",
        hp: 300,
        attack: 40,
        defense: 15,
        speed: 65,
        xp: 600,
        spriteIndex: SPRITES.NECROMANCER,
        behavior: 'aggressive',
        lootTable: 'necromancer',
        fleeThreshold: 0.15,
        corpse: SPRITES.HUMAN_CORPSE || 22,
        equipment: {
            head: 163
        },
        resistance: { poison: 0.5, ice: 0.5, fire: 0.5 }
    },
    'polar_bear': {
        name: "Polar Bear",
        hp: 180,
        attack: 35,
        defense: 15,
        speed: 50,
        xp: 140,
        spriteIndex: SPRITES.POLAR_BEAR,
        behavior: 'aggressive',
        lootTable: 'bear',
        fleeThreshold: 0,
        corpse: SPRITES.BEAR_DEAD || 25,
        resistance: { ice: 0.8 }
    },
    'yeti': {
        name: "Yeti",
        hp: 400,
        attack: 50,
        defense: 25,
        speed: 65,
        xp: 350,
        spriteIndex: SPRITES.YETI,
        behavior: 'aggressive',
        lootTable: 'orc',
        fleeThreshold: 0,
        corpse: SPRITES.HUMAN_CORPSE || 22,
        resistance: { ice: 1.0 }
    },
    'scorpion': {
        name: "Scorpion",
        hp: 45,
        attack: 15,
        defense: 8,
        speed: 85,
        xp: 35,
        spriteIndex: SPRITES.SCORPION,
        behavior: 'aggressive',
        lootTable: 'spider',
        fleeThreshold: 0.1,
        corpse: SPRITES.SPIDER_DEAD || 45,
        resistance: { poison: 1.0 },
        statusOnHit: { type: 'poison', chance: 0.3, power: 2, duration: 6 }
    },
    'snake': {
        name: "Snake",
        hp: 20,
        attack: 8,
        defense: 2,
        speed: 60,
        xp: 15,
        spriteIndex: SPRITES.SNAKE,
        behavior: 'aggressive',
        lootTable: 'rat',
        fleeThreshold: 0.2,
        corpse: SPRITES.SNAKE || 22,
        resistance: { poison: 0.8 },
        statusOnHit: { type: 'poison', chance: 0.25, power: 2, duration: 4 }
    },
    'quest_giver': {
        name: "Aric the Guide",
        hp: 1000, // Immortal-ish
        attack: 0,
        defense: 100,
        speed: 0, // Stationary
        xp: 0,
        spriteIndex: SPRITES.NPC_GUIDE || 262,
        behavior: 'neutral',
        lootTable: 'rat', // Should not die
        fleeThreshold: 0,
        corpse: SPRITES.HUMAN_CORPSE
    },

    // ============ BOSSES ============

    'frost_giant': {
        name: "Frost Giant",
        hp: 1500,
        attack: 80,
        defense: 40,
        speed: 40,
        xp: 1200,
        spriteIndex: SPRITES.FROST_GIANT,
        behavior: 'aggressive',
        lootTable: 'boss_ice',
        fleeThreshold: 0,
        corpse: SPRITES.HUMAN_CORPSE,
        isBoss: true,
        resistance: { ice: 1.0, fire: -0.5 }, // Weak to fire
        enrageThreshold: 0.3, // Enrages at 30% HP
        bossSkills: [
            { name: 'Ice Storm', type: 'aoe', damage: 40, range: 80, cooldown: 8, statusEffect: 'freeze' },
            { name: 'Summon Yetis', type: 'summon', cooldown: 15, summonType: 'yeti', summonCount: 2 },
            { name: 'Frozen Roar', type: 'buff', cooldown: 20 } // Self speed boost
        ]
    },

    'scorpion_king': {
        name: "Scorpion King",
        hp: 1200,
        attack: 60,
        defense: 30,
        speed: 70,
        xp: 1000,
        spriteIndex: SPRITES.SCORPION_KING,
        behavior: 'aggressive',
        lootTable: 'boss_desert',
        fleeThreshold: 0,
        corpse: SPRITES.SPIDER_DEAD,
        isBoss: true,
        resistance: { poison: 1.0, physical: 0.3 },
        enrageThreshold: 0.25,
        bossSkills: [
            { name: 'Venom Burst', type: 'aoe', damage: 30, range: 60, cooldown: 6, statusEffect: 'poison' },
            { name: 'Burrow', type: 'buff', cooldown: 12 }, // Temporary invulnerability + reposition
            { name: 'Stinger Barrage', type: 'projectile', damage: 25, cooldown: 4 }
        ],
        statusOnHit: { type: 'poison', chance: 0.6, power: 5, duration: 8 }
    },

    'hydra': {
        name: "Hydra",
        hp: 2000,
        attack: 70,
        defense: 35,
        speed: 30,
        xp: 1500,
        spriteIndex: SPRITES.HYDRA,
        behavior: 'aggressive',
        lootTable: 'boss_swamp',
        fleeThreshold: 0,
        corpse: SPRITES.SLIME_PUDDLE,
        isBoss: true,
        resistance: { poison: 1.0, ice: 0.5 },
        enrageThreshold: 0.4,
        bossSkills: [
            { name: 'Multi-Head Strike', type: 'aoe', damage: 35, range: 50, cooldown: 3 },
            { name: 'Regenerate', type: 'heal', cooldown: 10 }, // Heals 10% HP
            { name: 'Toxic Breath', type: 'projectile', damage: 20, cooldown: 5, statusEffect: 'poison' }
        ]
    },

    'orc_warlord': {
        name: "Orc Warlord",
        hp: 1800,
        attack: 90,
        defense: 50,
        speed: 55,
        xp: 1400,
        spriteIndex: SPRITES.ORC_WARLORD,
        behavior: 'aggressive',
        lootTable: 'boss_orc',
        fleeThreshold: 0,
        corpse: SPRITES.ORC_DEAD,
        isBoss: true,
        resistance: { physical: 0.2, magic: 0.4 },
        enrageThreshold: 0.25,
        equipment: {
            rhand: SPRITES.GREAT_AXE,
            body: SPRITES.KNIGHT_ARMOR,
            head: SPRITES.KNIGHT_HELMET
        },
        bossSkills: [
            { name: 'War Cry', type: 'buff', cooldown: 15 }, // Boosts damage
            { name: 'Whirlwind', type: 'aoe', damage: 50, range: 64, cooldown: 8 },
            { name: 'Summon Orcs', type: 'summon', cooldown: 20, summonType: 'orc', summonCount: 3 }
        ]
    },
    'big_zombie': {
        name: "Big Zombie",
        hp: 600,
        attack: 45,
        defense: 20,
        speed: 35, // Slow but tough
        xp: 250,
        spriteIndex: SPRITES.ZOMBIE, // ID 300
        behavior: 'aggressive',
        lootTable: 'big_zombie',
        fleeThreshold: 0,
        corpse: SPRITES.ZOMBIE_DEAD || 22,
        isBoss: true,
        resistance: { poison: 1.0, physical: 0.1 },
        enrageThreshold: 0.4,
        bossSkills: [
            { name: 'Vomit', type: 'aoe', damage: 30, range: 48, cooldown: 8, statusEffect: 'poison' },
            { name: 'Summon Rats', type: 'summon', cooldown: 12, summonType: 'rat', summonCount: 3 }
        ]
    },
    'minotaur_archer': {
        name: "Minotaur Archer",
        hp: 100,
        attack: 30, // Ranged dmg
        defense: 10,
        speed: 65,
        xp: 90,
        spriteIndex: SPRITES.MINOTAUR_ARCHER || 67,
        behavior: 'ranged',
        attackRange: 6,
        keepDistance: 4,
        lootTable: 'orc',
        fleeThreshold: 0.1,
        corpse: SPRITES.MINOTAUR_DEAD || 68,
        equipment: {
            lhand: SPRITES.CROSSBOW || 34
        }
    },
    'elf_arcanist': {
        name: "Elf Arcanist",
        hp: 80,
        attack: 40, // Spell dmg
        defense: 5,
        speed: 70,
        xp: 150,
        spriteIndex: SPRITES.ELF_ARCANIST || 75,
        behavior: 'caster',
        attackRange: 7,
        keepDistance: 4,
        lootTable: 'elf',
        fleeThreshold: 0.2,
        corpse: SPRITES.ELF_DEAD || 76,
        resistance: { magic: 0.5 },
        spells: ['fireball', 'heal']
    }
};

