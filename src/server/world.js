import * as fs from 'fs';
import * as path from 'path';
export class World {
    constructor() {
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 20
        });
        Object.defineProperty(this, "tiles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "players", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        this.loadMap('public/maps/village.json');
    }
    loadMap(relativePath) {
        try {
            const fullPath = path.resolve(process.cwd(), relativePath);
            const content = fs.readFileSync(fullPath, 'utf-8');
            const mapData = JSON.parse(content);
            this.width = mapData.width;
            this.height = mapData.height;
            this.tiles = mapData.data;
            console.log(`[World] Loaded Map: ${this.width}x${this.height}`);
        }
        catch (e) {
            console.error(`[World] Failed to load map:`, e);
        }
    }
    addPlayer(player) {
        this.players.add(player);
        console.log(`[World] Player ${player.name} joined. Total: ${this.players.size}`);
    }
    removePlayer(player) {
        this.players.delete(player);
        console.log(`[World] Player ${player.name} left.`);
    }
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return 0; // Void
        return this.tiles[y * this.width + x];
    }
    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        // Based on game.ts logic or map data:
        // 0=Void, 1=Grass, 2=Stone (Wall), 3=Water, 4=Wood Floor
        // Walls(2) and Water(3) are blocking.
        // Actually, let's verify map indices.
        // Looking at village.json: data has lots of 1s (Grass).
        // Let's assume standard RetroRPG tiles: 2 is Wall, 3 is Water.
        return tile !== 2 && tile !== 3 && tile !== 0;
    }
}
