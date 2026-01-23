export const TILE_SIZE = 32;

// ============================================================
// SLOT TYPES (Paper Doll Equipment Slots)
// ============================================================
export type SlotType = 'HEAD' | 'BODY' | 'LEGS' | 'FEET' | 'HAND_L' | 'HAND_R' | 'BACKPACK' | 'AMULET' | 'RING' | 'AMMO';

// ============================================================
// ITEM TYPES
// ============================================================
export type ItemType = 'SOLID' | 'CONTAINER' | 'READABLE' | 'EQUIPMENT' | 'CONSUMABLE' | 'GROUND';

export class Item {
    id: number;
    count: number;
    weight: number;
    capacity: number = 4; // Default container size
    isContainer: boolean;
    inventory: Item[] | null;
    properties: any = {};

    // Equipment Properties (Paper Doll)
    name?: string;           // Display name
    itemType?: ItemType;     // Item category
    slotType?: SlotType;     // Where can it be equipped?
    attack?: number;         // Weapon damage
    defense?: number;        // Shield blocking
    armor?: number;          // Damage reduction
    speed?: number;          // Movement bonus (boots)
    icon?: string;           // UI icon path

    constructor(id: number, count: number = 1, properties: any = {}) {
        this.id = id;
        this.count = count;
        this.properties = properties;
        this.weight = 10.0;
        this.isContainer = false;
        this.inventory = null;

        // Apply equipment stats from properties
        if (properties.name) this.name = properties.name;
        if (properties.slotType) this.slotType = properties.slotType;
        if (properties.attack) this.attack = properties.attack;
        if (properties.defense) this.defense = properties.defense;
        if (properties.armor) this.armor = properties.armor;
        if (properties.speed) this.speed = properties.speed;
        if (properties.icon) this.icon = properties.icon;
        if (properties.itemType) this.itemType = properties.itemType;

        if (id === 22) {
            this.isContainer = true;
            this.inventory = [];
        }
    }
}

export class Tile {
    items: Item[] = [];
    mob: string | null = null; // Name of NPC to spawn here

    constructor(groundId: number = 0) {
        if (groundId !== 0) {
            this.addGround(groundId);
        }
    }

    private addGround(id: number) {
        this.items.push(new Item(id));
    }

    peek(): Item | undefined {
        return this.items[this.items.length - 1];
    }

    // Helper compatibility for map_gen
    add(id: number) {
        this.addItem(new Item(id));
    }
    has(id: number): boolean {
        return this.items.some(i => i.id === id);
    }
    pop() {
        this.removeItem();
    }

    addItem(item: Item) {
        this.items.push(item);
    }

    removeItem(): Item | undefined {
        // Allow removing ground if needed, but normally we don't
        return this.items.pop();
    }

    get baseId(): number {
        return this.items.length > 0 ? this.items[0].id : 0;
    }

    set baseId(id: number) {
        if (this.items.length === 0) {
            this.items.push(new Item(id));
        } else {
            this.items[0].id = id;
        }
    }

    removeWall() {
        // Assume wall is the top item or just pop whatever is on top (Gate logic)
        // If we want to be safe, we could check if top item is wall-ish.
        // For now, simple pop is fine for map gen.
        if (this.items.length > 1) { // Don't remove ground
            this.items.pop();
        }
    }
}
