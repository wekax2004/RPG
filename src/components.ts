// Game Components (Extracted to break Circular Dependency)

export class Position {
    constructor(public x: number, public y: number) { }
}

export class Velocity {
    constructor(public x: number, public y: number) { }
}

export class Sprite {
    // uIndex: horizontal index in 16px grid
    constructor(public uIndex: number, public size: number = 16, public flipX: boolean = false) { }
}

export class TileMap {
    constructor(
        public width: number,
        public height: number,
        public tileSize: number,
        public data: number[]
    ) { }
}

export class PlayerControllable {
    public facingX: number = 0;
    public facingY: number = 1;
    public footstepTimer: number = 0;
}

export class RemotePlayer {
    public targetX: number;
    public targetY: number;
    constructor(public id: number, x: number = 0, y: number = 0) {
        this.targetX = x;
        this.targetY = y;
    }
}

import { AIState } from './ai/states';

export class AI {
    public cooldownTimer: number = 0;
    public currentState: AIState = AIState.IDLE;
    public wanderTimer: number = 0;        // Time until next wander direction
    public wanderTargetX: number = 0;      // Random wander destination X
    public wanderTargetY: number = 0;      // Random wander destination Y

    constructor(
        public speed: number = 30,
        public behavior: 'melee' | 'ranged' | 'flee' = 'melee',
        public attackRange: number = 40,
        public attackCooldown: number = 2.0,
        public detectionRadius: number = 200,      // Range to detect player
        public fleeHealthThreshold: number = 0.2   // 20% HP triggers FLEE
    ) { }
}


export class Interactable {
    constructor(public message: string) { }
}

// Item Rarity System
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_COLORS: Record<ItemRarity, string> = {
    common: '#ffffff',
    uncommon: '#00ff00',
    rare: '#0088ff',
    epic: '#aa00ff',
    legendary: '#ff8800'
};

export const RARITY_MULTIPLIERS: Record<ItemRarity, number> = {
    common: 1.0,
    uncommon: 1.15,
    rare: 1.30,
    epic: 1.50,
    legendary: 2.0
};

export class Item {
    constructor(
        public name: string,
        public slot: string,
        public uIndex: number,
        public damage: number = 0,
        public price: number = 10,
        public description: string = "",
        public weaponType: string = "sword",
        public rarity: ItemRarity = 'common',
        public defense: number = 0,
        public bonusHp: number = 0,
        public bonusMana: number = 0,
        public glowColor: string | null = null,
        public glowRadius: number = 0
    ) { }
}

export class Inventory {
    items: Map<string, Item> = new Map();
    storage: Item[] = [];
    gold: number = 0;
    cap: number = 400; // Capacity (oz)
    constructor(initialItems: Item[] = []) {
        initialItems.forEach(item => this.items.set(item.name, item));
    }
}

export class Health {
    constructor(public current: number, public max: number) { }
}

export class Camera {
    constructor(public x: number, public y: number) { }
}

export class Particle {
    constructor(
        public life: number,
        public maxLife: number,
        public color: string,
        public size: number,
        public vx: number,
        public vy: number
    ) { }
}

export class ScreenShake {
    constructor(public duration: number, public intensity: number) { }
}

export class FloatingText {
    constructor(public text: string, public color: string = '#fff', public life: number = 1.0, public maxLife: number = 1.0) { }
}

export class Name {
    constructor(public value: string) { }
}

// Quest System Types
export interface Quest {
    id: string;
    name: string;
    description: string;
    type: 'kill' | 'fetch';
    target: string; // Enemy type name or item name
    required: number;
    current: number;
    reward: { gold: number; xp: number; items?: string[] };
    completed: boolean;
    turnedIn: boolean;
}

export class QuestLog {
    public quests: Quest[] = [];
    public completedQuestIds: string[] = [];
}

export class MainQuest {
    public fire: boolean = false;
    public ice: boolean = false;
    public water: boolean = false;
    public earth: boolean = false;
}

export class QuestGiver {
    constructor(
        public availableQuests: Quest[],
        public name: string = "Quest Giver"
    ) { }
}

export class Facing {
    constructor(public x: number, public y: number) { }
}

export class Projectile {
    constructor(public damage: number, public life: number, public ownerType: string) { }
}

export class Mana {
    constructor(public current: number, public max: number) { }
}

export class Experience {
    constructor(public current: number, public next: number, public level: number) { }
}

export class Merchant {
    items: Item[] = [];
}

export class Skill {
    constructor(public level: number = 10, public xp: number = 0) { }
}

export class Skills {
    sword: Skill = new Skill();
    axe: Skill = new Skill();
    club: Skill = new Skill();
    distance: Skill = new Skill();
    shielding: Skill = new Skill();
    magic: Skill = new Skill(0, 0); // Magic Level (0 start)
}

export class SpellBook {
    // Spell Name -> Level (0 = locked, 1+ = learned)
    knownSpells: Map<string, number> = new Map();
    constructor() {
        // Default: Fireball level 1 (if starting magus?)
        // For now start empty or basic
        this.knownSpells.set("Fireball", 1);
    }
}

export class SkillPoints {
    constructor(public current: number = 0, public total: number = 0) { }
}

export class ActiveSpell {
    constructor(public spellName: string = "Fireball") { }
}

export class StatusEffect {
    // Type: 'frozen', 'burning', 'poison'
    constructor(public type: string, public duration: number, public power: number = 0) { }
}

export class Vocation {
    constructor(
        public name: string,
        public hpGain: number,
        public manaGain: number,
        public capGain: number
    ) { }
}

export const VOCATIONS: Record<string, { name: string, hpGain: number, manaGain: number, capGain: number, startHp: number, startMana: number, startCap: number }> = {
    knight: { name: 'Knight', hpGain: 15, manaGain: 5, capGain: 25, startHp: 150, startMana: 20, startCap: 450 },
    mage: { name: 'Mage', hpGain: 5, manaGain: 30, capGain: 10, startHp: 80, startMana: 100, startCap: 300 },
    ranger: { name: 'Ranger', hpGain: 10, manaGain: 15, capGain: 20, startHp: 100, startMana: 60, startCap: 380 },
    paladin: { name: 'Paladin', hpGain: 10, manaGain: 15, capGain: 20, startHp: 120, startMana: 60, startCap: 400 } // Balanced Hybrid
};

export class Target {
    constructor(public targetId: number) { }
}

export class Teleporter {
    constructor(public targetX: number, public targetY: number) { }
}

export class LightSource {
    constructor(
        public radius: number,
        public color: string, // HEX or RGB
        public flickers: boolean = false
    ) { }
}

export class NetworkItem {
    constructor(public id: number) { }
}

export class Decay { constructor(public life: number) { } }
export class Lootable { constructor(public items: Item[] = []) { } }

export class Consumable {
    constructor(
        public type: 'health' | 'mana',
        public amount: number,
        public text: string
    ) { }
}

export class Passives {
    constructor(
        public vitality: number = 0, // +MaxHP
        public spirit: number = 0,   // +MaxMana
        public agility: number = 0,  // +Speed
        public might: number = 0     // +Damage (Physical)
    ) { }
}

// Temple/Spawn Point - marks a location where player can set their respawn
export class Temple {
    constructor(public name: string = "Temple") { }
}

// Mob Resistance - immunity or resistance to damage types
export class MobResistance {
    constructor(
        public physicalImmune: boolean = false,   // Ghost: immune to physical
        public magicImmune: boolean = false,      // Some enemies immune to magic
        public fireResist: number = 0,            // 0-100% fire resistance
        public iceResist: number = 0,             // 0-100% ice resistance
        public poisonImmune: boolean = false      // Immune to poison
    ) { }
}

// Split On Death - creates smaller copies when killed (Slime mechanic)
export class SplitOnDeath {
    constructor(
        public splitCount: number = 2,            // How many to spawn
        public splitType: string = "slime",       // What enemy type to spawn
        public minHealth: number = 10             // Minimum HP to split (prevents infinite)
    ) { }
}

// Status Effect On Hit - applies status when attacking
export class StatusOnHit {
    constructor(
        public effectType: string,                // 'poison', 'bleed', 'freeze', 'burn'
        public chance: number = 0.3,              // 30% chance by default
        public duration: number = 5,              // Seconds
        public power: number = 5                  // Damage per tick
    ) { }
}

// Bleed effect tracking (stacking)
export class BleedEffect {
    constructor(
        public stacks: number = 1,
        public duration: number = 5,
        public damagePerTick: number = 3
    ) { }
}

// Poison effect tracking
export class PoisonEffect {
    constructor(
        public duration: number = 8,
        public damagePerTick: number = 2
    ) { }
}

// Freeze effect (slows movement)
export class FreezeEffect {
    constructor(
        public duration: number = 3,
        public slowPercent: number = 50           // 50% slower
    ) { }
}

// Dungeon Entrance - Loads a new map instance
export class DungeonEntrance {
    constructor(
        public dungeonType: 'fire' | 'ice' | 'water' | 'earth' | 'temple' | 'final',
        public label: string = "Enter Dungeon"
    ) { }
}

// Dungeon Exit - Returns to overworld
export class DungeonExit {
    constructor(
        public label: string = "Exit to World"
    ) { }
}

export class Locked {
    constructor(public keyIds: string[], public message: string = "Locked") { }
}

// Offset Collider - allows collision box to differ from sprite bounds
export class Collider {
    constructor(
        public width: number,
        public height: number,
        public offsetX: number = 0,  // Offset from Position.x
        public offsetY: number = 0   // Offset from Position.y
    ) { }
}
