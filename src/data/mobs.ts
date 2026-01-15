import { SPRITES } from '../constants';

export interface MobDef {
    name: string;
    hp: number;
    speed: number; // Pixels per second (approx)
    xp: number;    // XP value
    spriteIndex: number; // Single Sprite
    behavior: 'aggressive' | 'neutral' | 'passive';
    lootTable: string; // key in LOOT_TABLES
    equipment?: {
        rhand?: number;
        lhand?: number;
        body?: number;
        head?: number;
    };
    resistance?: {
        physical?: number; // % reduction
        fire?: number;
        ice?: number;
    };
}

export const MOB_REGISTRY: Record<string, MobDef> = {
    'wolf': {
        name: "Wolf",
        hp: 60,
        speed: 70,
        xp: 35,
        spriteIndex: SPRITES.WOLF,
        behavior: 'aggressive',
        lootTable: 'wolf'
    },
    'bear': {
        name: "Bear",
        hp: 140,
        speed: 55,
        xp: 90,
        spriteIndex: SPRITES.BEAR,
        behavior: 'neutral',
        lootTable: 'bear'
    },
    'spider': {
        name: "Giant Spider",
        hp: 80,
        speed: 90,
        xp: 60,
        spriteIndex: SPRITES.SPIDER || 44, // Fallback if missing
        behavior: 'aggressive',
        lootTable: 'spider'
    },
    'orc': {
        name: "Orc Warrior",
        hp: 120,
        speed: 60,
        xp: 110,
        spriteIndex: SPRITES.ORC || 58,
        behavior: 'aggressive',
        lootTable: 'orc',
        equipment: {
            rhand: 132, // Orc Axe
            lhand: 167, // Orc Shield
            body: 162   // Orc Armor
        }
    },
    'bandit': {
        name: "Bandit",
        hp: 90,
        speed: 80,
        xp: 65,
        spriteIndex: 56, // Human sprite?
        behavior: 'aggressive',
        lootTable: 'bandit',
        equipment: {
            rhand: 152, // Iron Sword
            head: 164 // Hood
        }
    },
    'skeleton': {
        name: "Skeleton",
        hp: 45,
        speed: 50,
        xp: 40,
        spriteIndex: SPRITES.SKELETON,
        behavior: 'aggressive',
        lootTable: 'skeleton',
        equipment: {
            rhand: 153 // Bone Sword
        }
    },
    'zombie': {
        name: "Zombie",
        hp: 100,
        speed: 30, // Slow
        xp: 55,
        spriteIndex: SPRITES.ZOMBIE,
        behavior: 'aggressive',
        lootTable: 'zombie'
    },
    'ghost': {
        name: "Ghost",
        hp: 60,
        speed: 60,
        xp: 75,
        spriteIndex: SPRITES.GHOST,
        behavior: 'aggressive',
        lootTable: 'ghost'
    },
    'slime': {
        name: "Slime",
        hp: 30,
        speed: 25,
        xp: 15,
        spriteIndex: SPRITES.SLIME,
        behavior: 'aggressive',
        lootTable: 'slime'
    },
    'necromancer': {
        name: "Necromancer",
        hp: 300,
        speed: 65,
        xp: 600,
        spriteIndex: SPRITES.NECROMANCER,
        behavior: 'aggressive',
        lootTable: 'necromancer',
        equipment: {
            head: 163 // Skull Helm
        }
    }
};
