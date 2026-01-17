import { WorldMap } from './map';
import { World } from '../engine';
import { Position, Health, Mana, Experience, Inventory, Skills, Sprite, Target } from '../components';
import { SPRITES } from '../constants';
import { PHYSICS } from '../physics';
import { TILE_SIZE } from './types';

export type Direction = 'north' | 'south' | 'east' | 'west';

export class Player {
    nextMoveTime: number = 0;
    queuedDx: number = 0;
    queuedDy: number = 0;

    // ECS Link
    constructor(public world: World, public id: number) { }

    // --- PROXIES TO ECS (Single Source of Truth) ---
    get spriteId(): number {
        const spr = this.world.getComponent(this.id, Sprite);
        return (spr && spr.uIndex !== 0) ? spr.uIndex : SPRITES.PLAYER;
    }
    set spriteId(val: number) {
        const spr = this.world.getComponent(this.id, Sprite);
        if (spr) spr.uIndex = val;
    }

    get flipX(): boolean {
        const spr = this.world.getComponent(this.id, Sprite);
        return spr ? spr.flipX : false;
    }
    set flipX(val: boolean) {
        const spr = this.world.getComponent(this.id, Sprite);
        if (spr) spr.flipX = val;
    }

    get frame(): number {
        const spr = this.world.getComponent(this.id, Sprite);
        return spr ? spr.frame : 0;
    }
    set frame(val: number) {
        const spr = this.world.getComponent(this.id, Sprite);
        if (spr) spr.frame = val;
    }

    get direction(): 0 | 1 | 2 | 3 {
        const spr = this.world.getComponent(this.id, Sprite);
        return spr ? spr.direction : 0;
    }
    set direction(val: 0 | 1 | 2 | 3) {
        const spr = this.world.getComponent(this.id, Sprite);
        if (spr) spr.direction = val;
    }

    get targetId(): number | null {
        const target = this.world.getComponent(this.id, Target);
        return target ? target.targetId : null;
    }
    set targetId(val: number | null) {
        let target = this.world.getComponent(this.id, Target);
        if (!target) {
            if (val !== null) {
                target = new Target(val);
                this.world.addComponent(this.id, target);
            }
        } else {
            target.targetId = val;
        }
    }

    get inventory(): Inventory {
        return this.world.getComponent(this.id, Inventory)!;
    }

    get x(): number {
        const pos = this.world.getComponent(this.id, Position);
        return pos ? pos.x / TILE_SIZE : 0;
    }
    set x(val: number) {
        const pos = this.world.getComponent(this.id, Position);
        if (pos) pos.x = val * TILE_SIZE;
    }

    get y(): number {
        const pos = this.world.getComponent(this.id, Position);
        return pos ? pos.y / TILE_SIZE : 0;
    }
    set y(val: number) {
        const pos = this.world.getComponent(this.id, Position);
        if (pos) pos.y = val * TILE_SIZE;
    }

    get hp(): number { return this.world.getComponent(this.id, Health)?.current || 0; }
    get maxHp(): number { return this.world.getComponent(this.id, Health)?.max || 100; }
    get mana(): number { return this.world.getComponent(this.id, Mana)?.current || 0; }
    get maxMana(): number { return this.world.getComponent(this.id, Mana)?.max || 50; }

    get level(): number { return this.world.getComponent(this.id, Experience)?.level || 1; }
    get xp(): number { return this.world.getComponent(this.id, Experience)?.current || 0; }
    get nextXp(): number { return this.world.getComponent(this.id, Experience)?.next || 100; }

    get gold(): number { return this.world.getComponent(this.id, Inventory)?.gold || 0; }
    get capacity(): number { return this.world.getComponent(this.id, Inventory)?.cap || 400; }

    get isMoving(): boolean {
        return this.queuedDx !== 0 || this.queuedDy !== 0;
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
        // ✅ FIXED: Using PHYSICS module instead of hardcoded ID 17
        const isBlocked = tile.items.some(item => PHYSICS.isSolid(item.id));

        if (isBlocked) {
            return false;
        }

        // 3. Move (Triggers ECS Update via Setters)
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
                this.tryMove(dir, map);
            }
        }
    }
}
