export const TILE_SIZE = 32;

export class Item {
    constructor(
        public id: number,
        public count: number = 1,
        public properties: any = {}
    ) { }
}

export class Tile {
    items: Item[] = [];

    constructor(groundId: number) {
        this.addGround(groundId);
    }

    private addGround(id: number) {
        this.items.push(new Item(id));
    }

    peek(): Item | undefined {
        return this.items[this.items.length - 1];
    }

    addItem(item: Item) {
        this.items.push(item);
    }

    removeItem(): Item | undefined {
        if (this.items.length > 1) { // Never remove ground (index 0)
            return this.items.pop();
        }
        return undefined;
    }
}
