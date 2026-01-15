import { Tile, Item } from './types';

// Tile Types / Item IDs
export const GRASS = 16;
export const WALL = 17;
export const TOWN_WALL = 200;
export const TOWN_FLOOR = 201;

export class WorldMap {
    width: number;
    height: number;
    tiles: Tile[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.initializeMap();
    }

    private initializeMap() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Default Grass (ID 16)
                this.tiles.push(new Tile(16));
            }
        }
    }

    getTile(x: number, y: number): Tile | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.tiles[y * this.width + x];
    }

    moveItem(fromX: number, fromY: number, toX: number, toY: number): boolean {
        const sourceTile = this.getTile(fromX, fromY);
        const targetTile = this.getTile(toX, toY);

        if (!sourceTile || !targetTile) return false;

        // Ensure we don't pick up the ground (Tile class protects this, but check logic)
        // removeItem() returns undefined if only ground remains.
        const item = sourceTile.removeItem();

        if (item) {
            targetTile.addItem(item);
            return true;
        }

        return false;
    }

    generateSimpleMap() {
        // Simple random walls for testing
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Keep center clear for spawn
                if (Math.abs(x - this.width / 2) < 5 && Math.abs(y - this.height / 2) < 5) continue;

                if (Math.random() < 0.1) {
                    const tile = this.getTile(x, y);
                    if (tile) {
                        tile.addItem(new Item(17)); // Wall
                    }
                }
            }
        }
    }
}
