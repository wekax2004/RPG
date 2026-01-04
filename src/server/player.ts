import { Client } from './client.js';
import { VocationType, Vocations } from './vocation.js';

export class Player {
    public x: number = 5;
    public y: number = 5;
    public z: number = 7; // Ground Level

    public name: string = "Unknown";
    public hp: number;
    public maxHp: number;
    public mana: number;
    public maxMana: number;

    public vocation: VocationType = VocationType.KNIGHT; // Default for now

    constructor(public client: Client) {
        const stats = Vocations[this.vocation];
        this.hp = stats.baseHp;
        this.maxHp = stats.baseHp;
        this.mana = stats.baseMana;
        this.maxMana = stats.baseMana;
    }

    move(dx: number, dy: number) {
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
        } else {
            // console.log(`[Player] Blocked at ${newX}, ${newY}`);
        }
    }

    send(data: any) {
        // Wrapper if we need to send raw packets
        if (data) { }
    }
}
