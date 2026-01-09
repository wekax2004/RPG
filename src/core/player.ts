import { WorldMap } from './map';

export type Direction = 'north' | 'south' | 'east' | 'west';

export class Player {
    x: number;
    y: number;
    nextMoveTime: number = 0;
    queuedDx: number = 0;
    queuedDy: number = 0;

    constructor(startX: number, startY: number) {
        this.x = startX;
        this.y = startY;
    }

    tryMove(direction: Direction, map: WorldMap): boolean {
        // Enforce Cooldown (The "Tick")
        if (Date.now() < this.nextMoveTime) {
            return false;
        }

        let targetX = this.x;
        let targetY = this.y;

        switch (direction) {
            case 'north': targetY--; break;
            case 'south': targetY++; break;
            case 'west': targetX--; break;
            case 'east': targetX++; break;
        }

        const tile = map.getTile(targetX, targetY);

        // 1. Check Bounds
        if (!tile) return false;

        // 2. Check Collision (Stack-based)
        // If any item in the stack is "Blocking" (ID 17 = Wall), we cannot move.
        // In a real engine, we'd check item.properties.isBlocking
        const isBlocked = tile.items.some(item => item.id === 17);

        if (isBlocked) {
            return false;
        }

        // 3. Move
        this.x = targetX;
        this.y = targetY;
        this.nextMoveTime = Date.now() + 200; // 200ms Step Delay (Grid Lock)

        return true;
    }

    queueMove(dx: number, dy: number) {
        this.queuedDx = dx;
        this.queuedDy = dy;
    }

    tick(map: WorldMap, now: number) {
        if (this.queuedDx !== 0 || this.queuedDy !== 0) {
            // Determine direction based on vector
            let dir: Direction | null = null;
            if (this.queuedDy === -1) dir = 'north';
            else if (this.queuedDy === 1) dir = 'south';
            else if (this.queuedDx === -1) dir = 'west';
            else if (this.queuedDx === 1) dir = 'east';

            if (dir) {
                if (this.tryMove(dir, map)) {
                    // Move successful, clear queue logic or keep it for continuous movement?
                    // Tibia style: Key down keeps queue populated. Key up clears it (handled in Input).
                    // In main.ts, we preventDefault on keydown.
                    // We can clear queue after one attempt for strict step-by-step or keep it.
                    // Let's clear it for now to prevent "flying".
                    // Actually, main.ts sets it on 'keydown'. If we clear it, user has to repress.
                    // But if we don't clear it, they slide.
                    // The "Tick" implies we check.
                    // Let's leave queues active until input system explicitly stops it, OR clear it if we want distinct steps.
                    // User said: "You step, wait, step, wait."
                    // If we don't clear, and key is held, `tryMove` checks cooldown.
                    // If cooldown is active, `tryMove` returns false.
                    // Next tick, we check again.
                    // This creates continuous stepping. Perfect.
                }
            }
        }
    }
}
