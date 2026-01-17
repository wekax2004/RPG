export type Entity = number;
export { NPC } from './components/npc';


export class Position {
    constructor(public x: number, public y: number) { }
}

export class Destination {
    constructor(public x: number, public y: number) { }
}

export class Velocity {
    constructor(public x: number, public y: number) { }
}

export class Sprite {
    // uIndex: Sprite ID (can include directional/anim offset)
    // frame: Animation frame (0-2)
    constructor(
        public uIndex: number,
        public size: number = 16,
        public flipX: boolean = false,
        public frame: number = 0,
        // Phase 3: Animation State
        public direction: 0 | 1 | 2 | 3 = 0,
        public animState: 'idle' | 'walk' | 'attack' = 'idle',
        public animTimer: number = 0,
        public frameDuration: number = 0.15 // 150ms per frame
    ) { }
}

export class TileItem {
    constructor(
        public id: number, // Sprite/Type ID
        public count: number = 1 // Support stacking items later
    ) { }
}

export class Tile {
    items: TileItem[] = []; // Stack: [Ground, ..., TopItem]
    creature: number | null = null; // Entity ID of creature on this tile

    // Helper to add items easily
    add(id: number) {
        this.items.push(new TileItem(id));
    }

    // Helper to get top item
    top(): TileItem | null {
        return this.items.length > 0 ? this.items[this.items.length - 1] : null;
    }

    // Helper to check if stack has a specific item ID
    has(id: number): boolean {
        return this.items.some(i => i.id === id);
    }

    // Helper to remove top item
    pop(): TileItem | undefined {
        return this.items.pop();
    }
}

export class TileMap {
    public tiles: Tile[];

    constructor(
        public width: number,
        public height: number,
        public tileSize: number
    ) {
        this.tiles = Array(width * height).fill(null).map(() => new Tile());
    }

    getTile(x: number, y: number): Tile | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.tiles[y * this.width + x];
    }
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

// Boss AI Component - tracks skill cooldowns and enrage
export class BossAI {
    public skillCooldowns: Map<string, number> = new Map();
    public isEnraged: boolean = false;
    public enrageMultiplier: number = 1.5; // Damage/speed boost when enraged

    constructor(
        public skills: { name: string; type: string; damage?: number; range?: number; cooldown: number; summonType?: string; summonCount?: number; statusEffect?: string }[] = [],
        public enrageThreshold: number = 0.3 // Enrage at 30% HP
    ) {
        // Initialize all cooldowns to 0 (ready)
        for (const skill of skills) {
            this.skillCooldowns.set(skill.name, 0);
        }
    }

    getReadySkill(): typeof this.skills[0] | null {
        for (const skill of this.skills) {
            if ((this.skillCooldowns.get(skill.name) || 0) <= 0) {
                return skill;
            }
        }
        return null;
    }

    useSkill(skillName: string) {
        const skill = this.skills.find(s => s.name === skillName);
        if (skill) {
            this.skillCooldowns.set(skillName, skill.cooldown);
        }
    }

    update(dt: number) {
        for (const [name, cd] of this.skillCooldowns.entries()) {
            if (cd > 0) {
                this.skillCooldowns.set(name, cd - dt);
            }
        }
    }
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
        // slotType: Where it fits (head, body, etc)
        public slotType: string,
        public uIndex: number = 0,
        public damage: number = 0,
        public price: number = 10,
        public description: string = "",
        public weaponType: string = "none",
        public rarity: ItemRarity = 'common',
        public defense: number = 0,
        public bonusHp: number = 0,
        public bonusMana: number = 0,
        // If this item IS a container (e.g. Backpack), it might need unique ID or just be treated as a container type
        public isContainer: boolean = false,
        public containerSize: number = 0,
        // Optional Glow Properties
        public glowColor: string | undefined = undefined,
        public glowRadius: number = 0,
        public frame: number = 0,
        public direction: 0 | 1 | 2 | 3 = 0, // 0=Down, 1=Up, 2=Left, 3=Right
        public id: number = 0 // Registry ID moved to end for compatibility
    ) { }
}

// Runtime Instance of an item (Stacks, etc)
export class ItemInstance {
    constructor(
        public item: Item,
        public count: number = 1,
        // If this instance handles a persistent inner container (like a specific bag with items)
        // We might store that data here or link to an Entity.
        // For simplicity Phase 3: We will generate a UUID for containers or just use nested arrays if we don't need persistent world entities yet.
        // Let's use a simple nested array approach for "Container Data"
        public contents: ItemInstance[] = []
    ) { }
}

export class Container {
    // Represents a grid of items
    // Fixed size (e.g. 20 for backpack)
    public items: (ItemInstance | null)[];

    constructor(public size: number = 20) {
        this.items = new Array(size).fill(null);
    }

    addItem(newItem: ItemInstance): boolean {
        // 1. Try to stack
        for (let i = 0; i < this.items.length; i++) {
            const slot = this.items[i];
            if (slot && slot.item.name === newItem.item.name && slot.count < 100) { // Max Stack 100
                slot.count += newItem.count;
                return true;
            }
        }
        // 2. Find empty slot
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === null) {
                this.items[i] = newItem;
                return true;
            }
        }
        return false;
    }
}

export class Inventory {
    // Equipment Slots
    // key: 'head', 'body', 'legs', 'boots', 'lhand', 'rhand', 'amulet', 'ring', 'ammo', 'backpack'
    equipment: Map<string, ItemInstance> = new Map();

    gold: number = 0;
    cap: number = 400;

    // The Main Backpack Container is usually the item in the 'backpack' slot.
    // However, for ease of access, we might reference the "Active Container" here.
    // Or we just read equipment.get('backpack').contents

    constructor() { }

    // Helper
    getEquipped(slot: string): ItemInstance | undefined {
        return this.equipment.get(slot);
    }

    equip(slot: string, item: ItemInstance) {
        this.equipment.set(slot, item);
    }

    unequip(slot: string) {
        this.equipment.delete(slot);
    }

    // --- Legacy / Convenience Helpers ---

    // Find an item instance by name (searches equipment + backpack)
    findItemByName(name: string): { instance: ItemInstance, container: 'equipment' | 'backpack' | 'none', slot?: string, parent?: ItemInstance } | null {
        // 1. Check Equipment
        for (const [slot, inst] of this.equipment) {
            if (inst.item.name === name) return { instance: inst, container: 'equipment', slot };
        }

        // 2. Check Backpack
        const bag = this.equipment.get('backpack');
        if (bag && bag.contents) {
            const found = bag.contents.find(i => i && i.item.name === name);
            if (found) return { instance: found, container: 'backpack', parent: bag };
        }

        return null; // Not found
    }

    // Check if player has item
    hasItem(name: string): boolean {
        return !!this.findItemByName(name);
    }

    // Remove item (Decrements count or removes)
    removeItem(name: string, count: number = 1): boolean {
        // Find it
        const result = this.findItemByName(name);
        if (!result) return false;

        const { instance, container, slot, parent } = result;

        if (instance.count > count) {
            instance.count -= count;
            return true;
        } else {
            // Remove entirely
            if (container === 'equipment' && slot) {
                this.equipment.delete(slot);
            } else if (container === 'backpack' && parent) {
                parent.contents = parent.contents.filter(i => i !== instance);
            }
            return true;
        }
    }

    // Add item to backpack (or first empty slot logic later)
    addItem(item: Item, count: number = 1): boolean {
        const bag = this.equipment.get('backpack');
        // If no backpack, fail or add to "storage" (deprecated)?
        // For Phase 3: Must have backpack.
        if (!bag) {
            // Check if we can equip it directly? (e.g. it IS a backpack)
            if (item.name === 'Backpack') {
                this.equip('backpack', new ItemInstance(item, count));
                return true;
            }
            return false; // No space
        }

        // Add to bag contents
        // Check stackability
        const stackMatch = bag.contents.find(i => i.item.name === item.name);
        if (stackMatch) {
            stackMatch.count += count;
            return true;
        }

        // Add new
        if (bag.contents.length < 20) {
            bag.contents.push(new ItemInstance(item, count));
            return true;
        }

        return false; // Full
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
    constructor(
        public damage: number,
        public life: number,
        public ownerType: string,
        public vx: number = 0,
        public vy: number = 0,
        public speed: number = 200,
        public targetX: number = 0,
        public targetY: number = 0
    ) { }
}

export class Corpse {
    constructor(
        public decayTimer: number = 300 // 5 minutes default
    ) { }
}

export class Mana {
    constructor(public current: number, public max: number) { }
}

export class Experience {
    constructor(public current: number, public next: number, public level: number) { }
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
    constructor(public targetId: number | null) { }
}

export class Teleporter {
    constructor(public targetX: number, public targetY: number) { }
}

export class Tint {
    constructor(
        public color: string // Hex or RGBA string e.g. "#FF0000"
    ) { }
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
export class CorpseDefinition { constructor(public spriteId: number) { } }

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
        public dungeonType: string,
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

// Combat Stats
export class Stats {
    constructor(
        public attack: number = 10,
        public defense: number = 0,
        public attackSpeed: number = 1.0, // Attacks per second
        public range: number = 48         // Attack Range (px)
    ) { }
}

// Runtime Combat State
export class CombatState {
    public lastAttackTime: number = 0;
    constructor() { }
}

export class Interactable {
    constructor(
        public actionName: string = "Interact"
    ) { }
}

export class Merchant {
    constructor(
        public items: Item[] = [] // List of Items
    ) { }
}

export class RegenState {
    public hpTimer: number = 0;
    public manaTimer: number = 0;
    constructor() { }
}


