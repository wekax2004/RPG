import { VocationType, Vocations } from './vocation.js';
export class Player {
    constructor(client) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: client
        });
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "z", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 7
        }); // Ground Level
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Unknown"
        });
        Object.defineProperty(this, "hp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxHp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mana", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxMana", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "vocation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: VocationType.KNIGHT
        }); // Default for now
        const stats = Vocations[this.vocation];
        this.hp = stats.baseHp;
        this.maxHp = stats.baseHp;
        this.mana = stats.baseMana;
        this.maxMana = stats.baseMana;
    }
    move(dx, dy) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        // TODO: Access World from Player properly
        // For now, access via client.server.world (ugly but works for scaffolding)
        // Or store world reference in Player
        // Let's assume client.server is public or accessible or allow 'any' cast for now to proceed efficiently
        // Actually, best to just pass World to Player on creation
        // But to keep diff small, I'll access via client for this step
        const world = this.client.server.world;
        if (world && world.isWalkable(newX, newY)) {
            this.x = newX;
            this.y = newY;
            console.log(`[Player] Moved to ${this.x}, ${this.y}`);
        }
        else {
            // console.log(`[Player] Blocked at ${newX}, ${newY}`);
        }
    }
    send(data) {
        // Wrapper if we need to send raw packets
        if (data) { }
    }
}
