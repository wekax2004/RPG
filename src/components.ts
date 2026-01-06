// Game Components (Extracted to break Circular Dependency)

export class Position {
    constructor(public x: number, public y: number) { }
}

export class Velocity {
    constructor(public x: number, public y: number) { }
}

export class Sprite {
    // uIndex: horizontal index in 16px grid
    constructor(public uIndex: number, public size: number = 16) { }
}

export class TileMap {
    constructor(
        public width: number,
        public height: number,
        public tileSize: number,
        public data: number[]
    ) { }
}

export class PlayerControllable {
    public facingX: number = 0;
    public facingY: number = 1;
    public footstepTimer: number = 0;
}

export class RemotePlayer {
    public targetX: number;
    public targetY: number;
    constructor(public id: number, x: number = 0, y: number = 0) {
        this.targetX = x;
        this.targetY = y;
    }
}

export class AI {
    constructor(public speed: number = 30) { }
}

export class Interactable {
    constructor(public message: string) { }
}

export class Item {
    constructor(
        public name: string,
        public slot: string,
        public uIndex: number,
        public damage: number = 0,
        public price: number = 10,
        public description: string = "",
        public weaponType: string = "sword"
    ) { }
}

export class Inventory {
    items: Map<string, Item> = new Map();
    storage: Item[] = [];
    gold: number = 0;
    cap: number = 400; // Capacity (oz)
    constructor(initialItems: Item[] = []) {
        initialItems.forEach(item => this.items.set(item.name, item));
    }
}

export class Health {
    constructor(public current: number, public max: number) { }
}

export class Camera {
    constructor(public x: number, public y: number) { }
}

export class Particle {
    constructor(
        public life: number,
        public maxLife: number,
        public color: string,
        public size: number,
        public vx: number,
        public vy: number
    ) { }
}

export class ScreenShake {
    constructor(public duration: number, public intensity: number) { }
}

export class FloatingText {
    constructor(public text: string, public color: string = '#fff', public life: number = 1.0, public maxLife: number = 1.0) { }
}

export class Name {
    constructor(public value: string) { }
}

export class QuestLog {
    questId: string = "";
    targetType: string = "";
    targetCount: number = 0;
    progress: number = 0;
    completed: boolean = false;
}

export class QuestGiver {
    constructor(
        public questId: string,
        public targetType: string,
        public count: number,
        public startText: string,
        public progressText: string,
        public completeText: string
    ) { }
}

export class Facing {
    constructor(public x: number, public y: number) { }
}

export class Projectile {
    constructor(public damage: number, public life: number, public ownerType: string) { }
}

export class Mana {
    constructor(public current: number, public max: number) { }
}

export class Experience {
    constructor(public current: number, public next: number, public level: number) { }
}

export class Merchant {
    items: Item[] = [];
}

export class Skill {
    constructor(public level: number = 10, public xp: number = 0) { }
}

export class Skills {
    sword: Skill = new Skill();
    axe: Skill = new Skill();
    club: Skill = new Skill();
    distance: Skill = new Skill();
    shielding: Skill = new Skill();
    magic: Skill = new Skill(0, 0); // Magic Level (0 start)
}

export class Vocation {
    constructor(
        public name: string,
        public hpGain: number,
        public manaGain: number,
        public capGain: number
    ) { }
}

export const VOCATIONS: Record<string, { name: string, hpGain: number, manaGain: number, capGain: number, startHp: number, startMana: number, startCap: number }> = {
    knight: { name: 'Knight', hpGain: 15, manaGain: 5, capGain: 25, startHp: 150, startMana: 20, startCap: 450 },
    mage: { name: 'Mage', hpGain: 5, manaGain: 30, capGain: 10, startHp: 80, startMana: 100, startCap: 300 },
    ranger: { name: 'Ranger', hpGain: 10, manaGain: 15, capGain: 20, startHp: 100, startMana: 60, startCap: 380 }
};

export class Target {
    constructor(public targetId: number) { }
}

export class Teleporter {
    constructor(public targetX: number, public targetY: number) { }
}

export class LightSource {
    constructor(
        public radius: number,
        public color: string, // HEX or RGB
        public flickers: boolean = false
    ) { }
}

export class NetworkItem {
    constructor(public id: number) { }
}

export class Decay { constructor(public life: number) { } }
export class Lootable { constructor(public items: Item[] = []) { } }

export class Consumable {
    constructor(
        public type: 'health' | 'mana',
        public amount: number,
        public text: string
    ) { }
}
