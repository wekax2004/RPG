export const TILE_SIZE = 32;

export class Item {
    id: number;
    count: number;
    weight: number;
    capacity: number = 4; // Default container size
    isContainer: boolean;
    inventory: Item[] | null;
    properties: any = {};

    constructor(id: number, count: number = 1, properties: any = {}) {
        this.id = id;
        this.count = count;
        this.properties = properties;
        this.weight = 10.0;
        this.isContainer = false;
        this.inventory = null;

        if (id === 22) {
            this.isContainer = true;
            this.inventory = [];
        }
    }
}

export class Tile {
    items: Item[] = [];

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
