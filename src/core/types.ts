export const TILE_SIZE = 32;

// ============================================================
// SLOT TYPES (Paper Doll Equipment Slots)
// ============================================================
export type SlotType = 'HEAD' | 'BODY' | 'LEGS' | 'FEET' | 'HAND_L' | 'HAND_R' | 'BACKPACK' | 'AMULET' | 'RING' | 'AMMO';

// ============================================================
// ITEM TYPES
// ============================================================
export type ItemType = 'SOLID' | 'CONTAINER' | 'READABLE' | 'EQUIPMENT' | 'CONSUMABLE' | 'GROUND';

export class MapItem {

    public id: number = 0;
    public count: number;
    public weight: number;
    public capacity: number = 4;
    public isContainer: boolean;
    public inventory: MapItem[] | null;
    public properties: any = {};

    // Equipment Properties (Paper Doll)
    public name?: string;
    public itemType?: ItemType;
    public slotType?: SlotType;
    public attack?: number;
    public defense?: number;
    public armor?: number;
    public speed?: number;

    constructor(
        arg1: number = 0,
        arg2: any = {},
        arg3: number = 0
    ) {
        // Overload 1: new MapItem(id)
        if (typeof arg2 === 'undefined' && typeof arg3 === 'undefined') { // Actually arg2 defaults to {}, so check if it looks like props
            // Logic: If arg2 is default {}, and arg3 is 0.
            // But wait, the default params confuse detection.
            // Let's remove defaults from signature and handle inside.
        }

        // Revised Constructor Logic
        // We detect signature based on types
        // Case 1: (id: number) -> count=1, props={}, id=id
        // Case 2: (count: number, props: any, id: number)

        // To implement cleanly without changing all callsites:
        // Identify if it's the 3-arg version.
        // The 3-arg version passes an Object as 2nd arg.
        // The 1-arg version passes nothing (undefined).

        // But Typescript defaults `arg2` to `{}`.
        // Let's rely on `arg3` (id).
        // If arg3 is provided (and nonzero? or just provided), it's the 3-arg version.
        // But default is 0.
        // If the caller calls `new Item(1, {}, id)`, arg3 is `id`.
        // If caller calls `new Item(id)`, arg1=id, arg2={}, arg3=0.

        if (arg3 !== 0) {
            // High confidence: 3-argument version
            this.count = arg1;
            this.properties = arg2;
            this.id = arg3;
        } else {
            // Ambiguous. 
            // Could be `new Item(count, props, 0)` (ID 0 item? invalid)
            // Or `new Item(id)` (Legacy).
            // Assume if arg3 is 0, we use arg1 as ID (Legacy), UNLESS arg1 is obviously a count (small?) and args2 is props.
            // Actually, ID 0 is AIR/Nothing. Creating Items of ID 0 is rare.
            // So if arg3 is 0, likely it's Legacy `new Item(id)`.

            this.id = arg1;
            this.count = 1;
            this.properties = arg2 || {};

            // Edge case: `new Item(5, {}, 0)` -> creates ID=5, count=1?
            // Yes, this breaks `new Item(count, props, 0)`.
            // But map generation shouldn't create ID 0 items.
            // So this is a safe heuristic.
        }

        this.weight = 10.0;
        this.isContainer = false;
        this.inventory = null;

        // Apply equipment stats
        const p = this.properties;
        if (p.name) this.name = p.name;
        if (p.slotType) this.slotType = p.slotType;
        if (p.attack) this.attack = p.attack;
        if (p.defense) this.defense = p.defense;
        if (p.armor) this.armor = p.armor;
        if (p.speed) this.speed = p.speed;
        if (p.itemType) this.itemType = p.itemType;

        // Fix for Chests (ID 22 is deprecated here, handled by properties usually, but keep for legacy)
        // If ID is CHEST (1390/etc), set container.
        // The old code checked `if (id === 22)`.
    }
}

export class Tile {
    items: MapItem[] = [];
    mob: string | null = null; // Name of NPC to spawn here

    constructor(groundId: number = 0) {
        if (groundId !== 0) {
            this.addGround(groundId);
        }
    }

    private addGround(id: number) {
        this.items.push(new MapItem(1, {}, id));
    }

    peek(): MapItem | undefined {
        return this.items[this.items.length - 1];
    }

    // Helper compatibility for map_gen
    add(id: number) {
        this.addItem(new MapItem(1, {}, id));
    }
    has(id: number): boolean {
        return this.items.some(i => i.id === id);
    }
    pop() {
        this.removeItem();
    }

    addItem(item: MapItem) {
        this.items.push(item);
    }

    removeItem(): MapItem | undefined {
        // Allow removing ground if needed, but normally we don't
        return this.items.pop();
    }

    get baseId(): number {
        return this.items.length > 0 ? this.items[0].id : 0;
    }

    set baseId(id: number) {
        if (this.items.length === 0) {
            this.items.push(new MapItem(1, {}, id));
        } else {
            this.items[0].id = id;
        }
    }
    // ...

    removeWall() {
        // Assume wall is the top item or just pop whatever is on top (Gate logic)
        // If we want to be safe, we could check if top item is wall-ish.
        // For now, simple pop is fine for map gen.
        if (this.items.length > 1) { // Don't remove ground
            this.items.pop();
        }
    }
}
