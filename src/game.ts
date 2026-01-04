import { World, Entity, InputHandler } from './engine';
import { UIManager } from './ui';
import { AudioController } from './audio';

// --- Components ---
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

// --- Systems ---

let lastAttackTime = 0;

export function inputSystem(world: World, input: InputHandler) {
    const entities = world.query([PlayerControllable, Velocity]);
    const speed = 100;

    for (const id of entities) {
        const vel = world.getComponent(id, Velocity)!;
        const pc = world.getComponent(id, PlayerControllable)!;

        vel.x = 0;
        vel.y = 0;

        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) { vel.x = -speed; pc.facingX = -1; pc.facingY = 0; }
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) { vel.x = speed; pc.facingX = 1; pc.facingY = 0; }
        if (input.isDown('ArrowUp') || input.isDown('KeyW')) { vel.y = -speed; pc.facingX = 0; pc.facingY = -1; }
        if (input.isDown('ArrowDown') || input.isDown('KeyS')) { vel.y = speed; pc.facingX = 0; pc.facingY = 1; }

        // Unstuck
        if (input.isDown('KeyU')) {
            const pos = world.getComponent(id, Position)!;
            // Teleport to roughly center
            pos.x = 480;
            pos.y = 480;
        }
    }
}

export function interactionSystem(world: World, input: InputHandler, ui: UIManager) {
    // Targeting Logic (Left Click)
    if (input.isDown('MouseLeft')) {
        const mx = input.mouse.x;
        const my = input.mouse.y;

        let camX = 0, camY = 0;
        const cam = world.query([Camera])[0];
        if (cam !== undefined) {
            const cPos = world.getComponent(cam, Camera)!;
            camX = Math.floor(cPos.x); // Align with rendering
            camY = Math.floor(cPos.y);
        }

        const worldX = mx + camX;
        const worldY = my + camY;

        const enemies = world.query([Health, Position, Name]);
        let clickedTarget = false;

        for (const eId of enemies) {
            if (world.getComponent(eId, PlayerControllable)) continue;
            const pos = world.getComponent(eId, Position)!;

            // Box Check (16x16)
            if (worldX >= pos.x && worldX <= pos.x + 16 &&
                worldY >= pos.y && worldY <= pos.y + 16) {

                const player = world.query([PlayerControllable])[0];
                if (player !== undefined) {
                    const currentTarget = world.getComponent(player, Target);
                    if (!currentTarget || currentTarget.targetId !== eId) {
                        if (currentTarget) world.removeComponent(player, Target);
                        world.addComponent(player, new Target(eId));
                        if ((ui as any).console) (ui as any).console.addSystemMessage("Target Locked.");
                    }
                    clickedTarget = true;
                }
                break;
            }
        }

        if (!clickedTarget) {
            // Clicked empty space? Clear target
            const player = world.query([PlayerControllable])[0];
            if (player !== undefined) {
                if (world.getComponent(player, Target)) {
                    world.removeComponent(player, Target);
                    if ((ui as any).console) (ui as any).console.addSystemMessage("Target Lost.");
                }
            }
        }
    }

    if (!input.isJustPressed('Space')) return;

    if (ui.isShowing()) {
        ui.hideDialogue();
        return;
    }

    const playerEntity = world.query([PlayerControllable, Position])[0];
    if (playerEntity === undefined) return;

    const pos = world.getComponent(playerEntity, Position)!;
    // const pc = world.getComponent(playerEntity, PlayerControllable)!;

    // Radius check instead of directional
    const interactRadius = 40;

    // Find closest interacting entity
    const interactables = world.query([Interactable, Position]);
    let closestId = -1;
    let minDist = interactRadius;

    for (const id of interactables) {
        const iPos = world.getComponent(id, Position)!;
        const dx = (pos.x + 8) - (iPos.x + 8);
        const dy = (pos.y + 8) - (iPos.y + 8);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
            minDist = dist;
            closestId = id;
        }
    }

    if (closestId !== -1) {
        const interact = world.getComponent(closestId, Interactable)!;
        const qGiver = world.getComponent(closestId, QuestGiver);
        const merchant = world.getComponent(closestId, Merchant);

        if (merchant) {
            // Open Shop
            const playerInv = world.getComponent(playerEntity, Inventory)!;
            ui.currentMerchant = merchant;
            ui.activeMerchantId = closestId;
            ui.renderShop(merchant, playerInv);
            ui.shopPanel.classList.remove('hidden');
            return;
        }

        if (qGiver) {
            let qLog = world.getComponent(playerEntity, QuestLog);
            if (!qLog) {
                qLog = new QuestLog();
                world.addComponent(playerEntity, qLog);
            }

            if (!qLog.questId) {
                // Accept Quest
                qLog.questId = qGiver.questId;
                qLog.targetType = qGiver.targetType;
                qLog.targetCount = qGiver.count;
                qLog.progress = 0;
                qLog.completed = false;
                ui.showDialogue(qGiver.startText);
            } else if (qLog.questId === qGiver.questId) {
                if (qLog.completed) {
                    // Complete Logic
                    ui.showDialogue(qGiver.completeText);
                    // Give Reward
                    const inv = world.getComponent(playerEntity, Inventory)!;
                    inv.gold += 100;
                    // Reset or finish
                    qLog.questId = ""; // Clear quest for now
                } else {
                    ui.showDialogue(qGiver.progressText);
                }
            } else {
                ui.showDialogue("I am busy properly.");
            }
        } else {
            ui.showDialogue(interact.message);
        }
    }
}

export function magicSystem(world: World, input: InputHandler, ui: UIManager) {
    if (input.isDown('KeyR')) {
        castSpell(world, ui, 'fireball');
    } else if (input.isDown('KeyF')) {
        castSpell(world, ui, 'heavystrike');
    } else if (input.isDown('KeyH')) {
        castSpell(world, ui, 'exura');
    }
}

export function projectileSystem(world: World, dt: number, ui: UIManager, audio: AudioController) {
    const projectiles = world.query([Projectile, Position, Velocity]);
    const enemies = world.query([Health, Position, Name]);

    projectiles.forEach(pId => {
        const proj = world.getComponent(pId, Projectile)!;
        const pos = world.getComponent(pId, Position)!;
        const vel = world.getComponent(pId, Velocity)!;

        pos.x += vel.x * dt;
        pos.y += vel.y * dt;

        proj.life -= dt;
        if (proj.life <= 0) {
            world.removeEntity(pId);
            return;
        }

        if (proj.ownerType === 'player') {
            for (const eId of enemies) {
                if (eId === pId) continue;
                if (world.getComponent(eId, PlayerControllable)) continue;

                const ePos = world.getComponent(eId, Position);
                if (!ePos) continue;
                const dx = (pos.x + 8) - (ePos.x + 8);
                const dy = (pos.y + 8) - (ePos.y + 8);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 12) {
                    const hp = world.getComponent(eId, Health)!;
                    hp.current -= proj.damage;

                    const text = world.createEntity();
                    world.addComponent(text, new Position(ePos.x, ePos.y - 10));
                    world.addComponent(text, new FloatingText(`-${proj.damage}`, '#ff4400'));
                    world.addComponent(text, new Velocity(0, -20));

                    audio.playHit(); // SFX

                    world.removeEntity(pId);

                    if (hp.current <= 0) {
                        const nameComp = world.getComponent(eId, Name);
                        const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
                        dropLoot(world, ePos.x, ePos.y, enemyType);

                        gainExperience(world, 50, ui, audio);
                        world.removeEntity(eId);
                    }
                    return;
                }
            }
        }
    });
}

export function floatingTextSystem(world: World, dt: number) {
    const entities = world.query([FloatingText]);
    for (const id of entities) {
        const ft = world.getComponent(id, FloatingText)!;
        ft.life -= dt;
        if (ft.life <= 0) {
            world.removeEntity(id);
        }
    }
}

export function particleSystem(world: World, dt: number) {
    const entities = world.query([Position, Particle]);
    for (const id of entities) {
        const pos = world.getComponent(id, Position)!;
        const part = world.getComponent(id, Particle)!;

        pos.x += part.vx * dt;
        pos.y += part.vy * dt;
        part.life -= dt;

        if (part.life <= 0) {
            world.removeEntity(id);
        }
    }
}

let shakeOffsetX = 0;
let shakeOffsetY = 0;

export function screenShakeSystem(world: World, dt: number) {
    const entities = world.query([ScreenShake]);
    shakeOffsetX = 0;
    shakeOffsetY = 0;

    for (const id of entities) {
        const shake = world.getComponent(id, ScreenShake)!;
        shake.duration -= dt;
        if (shake.duration > 0) {
            shakeOffsetX = (Math.random() - 0.5) * shake.intensity;
            shakeOffsetY = (Math.random() - 0.5) * shake.intensity;
        } else {
            world.removeEntity(id);
        }
    }
}

export function aiSystem(world: World, dt: number) {
    const players = world.query([PlayerControllable, Position]);
    if (players.length === 0) return;
    const playerPos = world.getComponent(players[0], Position)!;

    // Map Center (roughly, hardcoded for now or passed in?)
    // In map_gen we used center of map. Let's assume map is 60x60 tiles = 960x960. Center is 480,480.
    // Ideally we should pass map dimensions to aiSystem or store "SafeZone" component.
    // For now, let's assume Town is near 480,480 (from map_gen).
    const centerX = 480;
    const centerY = 480;
    const safeRadius = 160; // 10 tiles

    const enemies = world.query([AI, Position, Velocity]);
    for (const id of enemies) {
        const pos = world.getComponent(id, Position)!;
        if (pos.x < -100) continue;

        const vel = world.getComponent(id, Velocity)!;
        const ai = world.getComponent(id, AI)!;

        // Safe Zone Check
        const distToCenter = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));

        if (distToCenter < safeRadius) {
            // Flee from center
            const dx = pos.x - centerX;
            const dy = pos.y - centerY;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                vel.x = (dx / len) * ai.speed;
                vel.y = (dy / len) * ai.speed;
            } else {
                vel.x = ai.speed;
                vel.y = 0;
            }
            continue; // Skip chasing player
        }

        const dx = playerPos.x - pos.x;
        const dy = playerPos.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150 && dist > 16) { // Aggro range 150
            vel.x = (dx / dist) * ai.speed;
            vel.y = (dy / dist) * ai.speed;
        } else {
            vel.x = 0;
            vel.y = 0;
        }
    }
}

export function movementSystem(world: World, dt: number) {
    const entities = world.query([Position, Velocity]);

    const mapEntity = world.query([TileMap])[0];
    let map: TileMap | undefined;
    if (mapEntity !== undefined) {
        map = world.getComponent(mapEntity, TileMap);
    }

    for (const id of entities) {
        const pos = world.getComponent(id, Position)!;
        const vel = world.getComponent(id, Velocity)!;

        if (vel.x !== 0 || vel.y !== 0) {
            const facing = world.getComponent(id, Facing);
            if (facing) {
                if (Math.abs(vel.x) > Math.abs(vel.y)) {
                    facing.x = Math.sign(vel.x);
                    facing.y = 0;
                } else {
                    facing.x = 0;
                    facing.y = Math.sign(vel.y);
                }
            }
        }

        if (vel.x === 0 && vel.y === 0) continue;

        const nextX = pos.x + vel.x * dt;
        const nextY = pos.y + vel.y * dt;

        if (map) {
            const centerX = nextX + 8;
            const centerY = nextY + 8;

            const tileX = Math.floor(centerX / map.tileSize);
            const tileY = Math.floor(centerY / map.tileSize);

            if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) continue;

            // Check for Teleporters (Entities with Teleporter + Position)
            // Optimization: Only check if player? Or all? Let's do player for now.
            if (world.getComponent(id, PlayerControllable)) {
                const teleporters = world.query([Teleporter, Position]);
                for (const tId of teleporters) {
                    const tPos = world.getComponent(tId, Position)!;
                    const tData = world.getComponent(tId, Teleporter)!;
                    // Center to Center check
                    // Player is 16x16, Teleporter is 16x16
                    const pCx = nextX + 8;
                    const pCy = nextY + 8;
                    const tCx = tPos.x + 8;
                    const tCy = tPos.y + 8;

                    const dx = pCx - tCx;
                    const dy = pCy - tCy;

                    // 12px radius trigger (slightly larger)
                    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
                        // Teleport!
                        console.log(`Teleporting to ${tData.targetX}, ${tData.targetY}`);
                        pos.x = tData.targetX;
                        pos.y = tData.targetY;
                        // Cancel velocity to prevent sliding
                        world.getComponent(id, Velocity)!.x = 0;
                        world.getComponent(id, Velocity)!.y = 0;
                        return;
                    }
                }
            }

            const tileId = map.data[tileY * map.width + tileX];
            if (tileId === 17) continue; // Wall is 17 now? Need to verify logic
            if (tileId === 18) continue; // Water
        }

        pos.x = nextX;
        pos.y = nextY;
    }
}

export function cameraSystem(world: World, mapWidth: number, mapHeight: number) {
    const playerEntity = world.query([PlayerControllable, Position])[0];
    if (playerEntity === undefined) return;
    const pos = world.getComponent(playerEntity, Position)!;

    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity === undefined) return;
    const cam = world.getComponent(cameraEntity, Camera)!;

    // Center camera on player (screen 320x240)
    let targetX = pos.x - 320 / 2;
    let targetY = pos.y - 240 / 2;

    // Clamp
    targetX = Math.max(0, Math.min(targetX, mapWidth - 320));
    targetY = Math.max(0, Math.min(targetY, mapHeight - 240));

    cam.x = targetX;
    cam.y = targetY;
}

// --- RENDERING ---

export const spriteSheet = new Image();
// spriteSheet.src = '/sprites.png'; // DISABLED: suspected bad file

const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128; // 8x8 grid of 16px sprites

function generateSpriteSheet() {
    console.log("Generating Procedural Sprites...");
    const ctx = canvas.getContext('2d')!;
    // Colors
    const drawTile = (idx: number, color: string, icon?: (ctx: CanvasRenderingContext2D, x: number, y: number) => void) => {
        const x = (idx % 8) * 16;
        const y = Math.floor(idx / 8) * 16;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 16, 16);
        if (icon) icon(ctx, x, y);
    };

    drawTile(0, '#0000', (c, x, y) => { c.fillStyle = '#33f'; c.fillRect(x + 4, y + 2, 8, 12); c.fillStyle = '#fc9'; c.fillRect(x + 5, y + 3, 6, 4); }); // Player
    drawTile(1, '#0000', (c, x, y) => { c.fillStyle = '#151'; c.fillRect(x + 2, y + 2, 12, 12); c.fillStyle = '#f00'; c.fillRect(x + 4, y + 5, 2, 2); c.fillRect(x + 10, y + 5, 2, 2); }); // Orc
    drawTile(2, '#0000', (c, x, y) => { c.fillStyle = '#a63'; c.fillRect(x + 4, y + 2, 8, 12); c.fillStyle = '#fc9'; c.fillRect(x + 5, y + 3, 6, 4); }); // NPC
    drawTile(3, '#0000', (c, x, y) => { c.fillStyle = '#888'; c.fillRect(x + 2, y + 6, 12, 8); c.fillRect(x + 10, y + 3, 5, 5); c.fillStyle = '#f00'; c.fillRect(x + 11, y + 4, 1, 1); }); // Wolf
    drawTile(4, '#0000', (c, x, y) => { c.fillStyle = '#ddd'; c.fillRect(x + 6, y + 2, 4, 4); c.fillRect(x + 7, y + 6, 2, 8); c.fillRect(x + 4, y + 6, 8, 2); c.fillRect(x + 5, y + 14, 2, 2); c.fillRect(x + 9, y + 14, 2, 2); }); // Skeleton
    drawTile(5, '#0000', (c, x, y) => { c.fillStyle = '#ccf'; c.globalAlpha = 0.7; c.fillRect(x + 4, y + 2, 8, 10); c.fillRect(x + 2, y + 8, 12, 6); c.globalAlpha = 1.0; c.fillStyle = '#000'; c.fillRect(x + 5, y + 4, 2, 2); c.fillRect(x + 9, y + 4, 2, 2); }); // Ghost
    drawTile(6, '#0000', (c, x, y) => { c.fillStyle = '#4f4'; c.beginPath(); c.arc(x + 8, y + 10, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#000'; c.fillRect(x + 6, y + 8, 1, 1); c.fillRect(x + 9, y + 8, 1, 1); }); // Slime

    drawTile(16, '#2a2', (c, x, y) => { c.fillStyle = '#4c4'; c.fillRect(x + 2, y + 2, 2, 2); }); // Grass
    drawTile(17, '#777', (c, x, y) => { c.fillStyle = '#555'; c.fillRect(x, y + 3, 16, 1); c.fillRect(x, y + 13, 16, 1); c.fillRect(x + 8, y + 3, 1, 5); }); // Wall
    drawTile(18, '#44f', (c, x, y) => { c.fillStyle = '#66f'; c.fillRect(x + 2, y + 4, 12, 2); }); // Water
    drawTile(19, '#752', (c, x, y) => { c.fillStyle = '#541'; c.fillRect(x, y + 4, 16, 1); }); // Wood
    drawTile(20, '#000', (c, x, y) => { c.fillStyle = '#444'; c.fillRect(x + 2, y + 2, 12, 12); c.fillStyle = '#777'; c.fillRect(x + 3, y + 3, 10, 2); c.fillRect(x + 4, y + 6, 8, 2); c.fillRect(x + 5, y + 9, 6, 2); }); // Stairs
    drawTile(21, '#0000', (c, x, y) => { c.strokeStyle = '#eee'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16, y + 16); c.moveTo(x + 16, y); c.lineTo(x, y + 16); c.stroke(); }); // Web
    drawTile(22, '#0000', (c, x, y) => { c.fillStyle = '#ccc'; c.fillRect(x + 6, y + 6, 4, 2); c.fillRect(x + 5, y + 5, 2, 2); c.fillRect(x + 9, y + 5, 2, 2); }); // Bones

    drawTile(23, '#445', (c, x, y) => { c.fillStyle = '#556'; c.fillRect(x + 1, y + 1, 14, 14); c.fillStyle = '#334'; c.fillRect(x, y, 16, 1); c.fillRect(x, y, 1, 16); }); // Stone Floor (Lev 1)
    drawTile(24, '#343', (c, x, y) => { c.fillStyle = '#454'; c.fillRect(x + 1, y + 1, 14, 14); c.fillStyle = '#232'; c.fillRect(x + 4, y + 4, 4, 4); c.fillRect(x + 10, y + 10, 2, 2); }); // Mossy Floor (Lev 2)
    drawTile(25, '#223', (c, x, y) => { c.fillStyle = '#334'; c.fillRect(x, y, 16, 16); c.fillStyle = '#112'; c.beginPath(); c.moveTo(x + 2, y + 2); c.lineTo(x + 14, y + 14); c.stroke(); }); // Dark Cracked (Lev 3)

    drawTile(32, '#0000', (c, x, y) => { c.fillStyle = '#f00'; c.beginPath(); c.arc(x + 8, y + 10, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ccc'; c.fillRect(x + 6, y + 3, 4, 3); }); // Potion
    drawTile(33, '#0000', (c, x, y) => { c.fillStyle = '#44a'; c.fillRect(x + 3, y + 3, 10, 10); c.fillStyle = '#ea0'; c.strokeRect(x + 3.5, y + 3.5, 9, 9); }); // Shield
    drawTile(34, '#0000', (c, x, y) => { c.fillStyle = '#aaa'; c.fillRect(x + 6, y + 2, 4, 10); c.fillStyle = '#420'; c.fillRect(x + 4, y + 10, 8, 2); }); // Sword
    drawTile(35, '#0000', (c, x, y) => { c.fillStyle = '#642'; c.beginPath(); c.arc(x + 8, y + 8, 6, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#853'; c.stroke(); c.fillStyle = '#999'; c.fillRect(x + 7, y + 7, 2, 2); }); // Wooden Shield
    drawTile(36, '#0000', (c, x, y) => { c.fillStyle = '#fd0'; c.fillRect(x + 6, y + 2, 4, 10); c.fillStyle = '#408'; c.fillRect(x + 4, y + 10, 8, 2); c.fillStyle = '#f0f'; c.fillRect(x + 7, y + 12, 2, 3); }); // Noble Sword
    drawTile(37, '#0000', (c, x, y) => { c.fillStyle = '#853'; c.fillRect(x + 6, y + 2, 4, 10); c.fillStyle = '#642'; c.fillRect(x + 4, y + 10, 8, 2); });
    drawTile(40, '#0000', (c, x, y) => { c.fillStyle = '#f40'; c.beginPath(); c.arc(x + 8, y + 8, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ff0'; c.beginPath(); c.arc(x + 8, y + 8, 2, 0, Math.PI * 2); c.fill(); }); // Fireball

    spriteSheet.src = canvas.toDataURL();
}

generateSpriteSheet();

/*
spriteSheet.onerror = () => {
    console.warn("Using Generated Sprites");
    generateSpriteSheet();
};
*/

const SHEET_TILE_SIZE = 16;
const SHEET_COLS = 8;
const SPRITES = {
    PLAYER: 0, ORC: 1, NPC: 2, WOLF: 3, SKELETON: 4, GHOST: 5, SLIME: 6,
    GRASS: 16, WALL: 17, WATER: 18, WOOD: 19, STAIRS: 20, WEB: 21, BONES: 22,
    STONE: 23, MOSSY: 24, DARK: 25,
    POTION: 32, SHIELD: 33, SWORD: 34, WOODEN_SHIELD: 35, NOBLE_SWORD: 36, WOODEN_SWORD: 37,
    FIREBALL: 40
};

export function combatSystem(world: World, input: InputHandler, ui: UIManager, audio: AudioController) {
    // Auto-Attack (Target Locked)
    const playerEntity = world.query([PlayerControllable, Position, Inventory])[0];
    if (playerEntity === undefined) return;

    const targetComp = world.getComponent(playerEntity, Target);
    let autoAttack = false;

    const now = Date.now();
    if (now - lastAttackTime < 1000) return; // 1.0s Attack Speed

    if (targetComp) {
        // Check range
        const tPos = world.getComponent(targetComp.targetId, Position);
        if (tPos) {
            const pPos = world.getComponent(playerEntity, Position)!;
            const dx = (tPos.x + 8) - (pPos.x + 8);
            const dy = (tPos.y + 8) - (pPos.y + 8);
            if (Math.abs(dx) <= 24 && Math.abs(dy) <= 24) {
                autoAttack = true;
            }
        }
    }

    if (!autoAttack && !input.isDown('KeyF')) return;
    lastAttackTime = now;

    if (input.isDown('KeyF')) audio.playAttack(); // Manual only sound? Or both?
    if (autoAttack) audio.playAttack();

    // const playerEntity = ... (Already queried)
    // if (playerEntity === undefined) return; // Redundant check


    const pos = world.getComponent(playerEntity, Position)!;
    const pc = world.getComponent(playerEntity, PlayerControllable)!;
    const inv = world.getComponent(playerEntity, Inventory)!;
    const skills = world.getComponent(playerEntity, Skills);
    const xp = world.getComponent(playerEntity, Experience);

    let damage = 0; // Base
    let skillLevel = 10;

    const weapon = inv.items.get('rhand');
    if (weapon) {
        damage = weapon.damage;

        // Skill Damage Bonus
        if (skills) {
            // Determine skill type
            let skillType = weapon.weaponType || "sword";
            // Fallback inference if old save
            if (weapon.name.includes("Sword")) skillType = "sword";
            else if (weapon.name.includes("Axe")) skillType = "axe";
            else if (weapon.name.includes("Club")) skillType = "club";

            const skill = (skills as any)[skillType] as Skill;
            if (skill) {
                skillLevel = skill.level;
                // Tibia Formula approximation: (Level * 0.2) + (Skill * Atk * 0.06) + (Atk * 0.5)
                const playerLevel = xp ? xp.level : 1;
                const skillDmg = (skillLevel * weapon.damage * 0.06) + (playerLevel * 0.2);
                damage = Math.floor(skillDmg + (Math.random() * (damage * 0.5))); // Variation

                // Skill Gain
                skill.xp += 1;
                // Simple exponential curve: 10 * 1.1^Level
                const nextXp = Math.floor(50 * Math.pow(1.1, skill.level - 10));
                if (skill.xp >= nextXp) {
                    skill.xp = 0;
                    skill.level++;
                    if ((ui as any).console) (ui as any).console.addSystemMessage(`You advanced to ${skillType} fighting level ${skill.level}.`);
                    audio.playLevelUp();
                }
            }
        }
    } else {
        // Fist fighting use Club logic for now? Or just base
        damage = 1 + (skills ? Math.floor(skills.club.level * 0.2) : 0);
    }

    const targetX = pos.x + 8 + (pc.facingX * 24);
    const targetY = pos.y + 8 + (pc.facingY * 24);
    const attackRadius = 24;

    const enemies = world.query([Health, Position]);
    let hit = false;
    const targets: { id: number, dist: number }[] = [];
    for (const id of enemies) {
        if (id === playerEntity) continue;
        const ePos = world.getComponent(id, Position)!;
        const dx = (pos.x + 8) - (ePos.x + 8);
        const dy = (pos.y + 8) - (ePos.y + 8);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= attackRadius) targets.push({ id, dist });
    }
    targets.sort((a, b) => a.dist - b.dist);

    if (targets.length > 0) {
        const id = targets[0].id;
        const health = world.getComponent(id, Health)!;
        const ePos = world.getComponent(id, Position)!;

        health.current -= damage;
        audio.playHit();
        if ((ui as any).console) (ui as any).console.sendMessage(`You hit Enemy for ${damage} dmg.`);

        const ft = world.createEntity();
        world.addComponent(ft, new Position(ePos.x, ePos.y));
        world.addComponent(ft, new Velocity(0, -20));
        world.addComponent(ft, new FloatingText(`-${damage}`, '#ff3333'));

        // Screen Shake
        const shake = world.createEntity();
        world.addComponent(shake, new ScreenShake(0.2, 2.0));

        // Blood Particles
        for (let i = 0; i < 5; i++) {
            const p = world.createEntity();
            world.addComponent(p, new Position(ePos.x + 8, ePos.y + 8));
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 50 + 20;
            const life = Math.random() * 0.3 + 0.2;
            world.addComponent(p, new Particle(life, life, '#a00', 2, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }

        if (health.current <= 0) {
            const nameComp = world.getComponent(id, Name);
            const enemyName = nameComp ? nameComp.value : "Enemy";
            if ((ui as any).console) (ui as any).console.sendMessage(`${enemyName} died.`);

            const qLog = world.getComponent(playerEntity, QuestLog);
            if (qLog && qLog.questId && !qLog.completed && qLog.targetType === enemyName) {
                qLog.progress++;
                if ((ui as any).console) (ui as any).console.sendMessage(`Quest: ${qLog.progress}/${qLog.targetCount} ${enemyName}s`);
                if (qLog.progress >= qLog.targetCount) {
                    if ((ui as any).console) (ui as any).console.addSystemMessage("Quest Objective Complete! Return to villager.");
                }
            }

            dropLoot(world, ePos.x, ePos.y, enemyName.toLowerCase());
            gainExperience(world, 50, ui, audio);
            ePos.x = -9999;
            world.removeEntity(id);
        }
        hit = true;
    }

    if (!hit) {
        if ((ui as any).console) (ui as any).console.addSystemMessage("You swing at the air.");
    }
}

function drawSprite(ctx: CanvasRenderingContext2D, uIndex: number, dx: number, dy: number, size: number = 16) {
    if (!spriteSheet.complete || spriteSheet.naturalWidth === 0) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(dx, dy, size, size);
        return;
    }
    const sx = (uIndex % SHEET_COLS) * SHEET_TILE_SIZE;
    const sy = Math.floor(uIndex / SHEET_COLS) * SHEET_TILE_SIZE;
    ctx.drawImage(spriteSheet, sx, sy, SHEET_TILE_SIZE, SHEET_TILE_SIZE, dx, dy, size, size);
}

function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    drawSprite(ctx, SPRITES.WALL, x, y, size);
}

export function tileRenderSystem(world: World, ctx: CanvasRenderingContext2D) {
    let camX = 0, camY = 0;
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity !== undefined) {
        const cam = world.getComponent(cameraEntity, Camera)!;
        camX = Math.floor(cam.x + shakeOffsetX);
        camY = Math.floor(cam.y + shakeOffsetY);
    }
    const mapEntities = world.query([TileMap]);
    for (const id of mapEntities) {
        const map = world.getComponent(id, TileMap)!;
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tileId = map.data[y * map.width + x];
                const drawX = x * map.tileSize - camX;
                const drawY = y * map.tileSize - camY;
                if (tileId === 17) drawWall(ctx, drawX, drawY, map.tileSize);
                else {
                    // Direct map: Sprite ID matches Tile ID
                    drawSprite(ctx, tileId, drawX, drawY, 16);
                }
            }
        }
    }
}

export function textRenderSystem(world: World, ctx: CanvasRenderingContext2D) {
    let camX = 0, camY = 0;
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity !== undefined) {
        const cam = world.getComponent(cameraEntity, Camera)!;
        camX = Math.floor(cam.x);
        camY = Math.floor(cam.y);
    }
    const entities = world.query([Position, FloatingText]);
    ctx.save();
    ctx.font = '14px "VT323", monospace';
    ctx.textAlign = 'center';
    for (const id of entities) {
        const pos = world.getComponent(id, Position)!;
        const ft = world.getComponent(id, FloatingText)!;
        const drawX = Math.round(pos.x - camX + 8);
        const drawY = Math.round(pos.y - camY);
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        ctx.fillText(ft.text, drawX, drawY);
    }

    // Particles
    const particles = world.query([Position, Particle]);
    for (const id of particles) {
        const pos = world.getComponent(id, Position)!;
        const part = world.getComponent(id, Particle)!;
        const drawX = Math.round(pos.x - camX);
        const drawY = Math.round(pos.y - camY);

        ctx.globalAlpha = Math.max(0, part.life / part.maxLife);
        ctx.fillStyle = part.color;
        ctx.fillRect(drawX, drawY, part.size, part.size);
    }
    ctx.globalAlpha = 1.0;
    const playerEntity = world.query([QuestLog])[0];
    if (playerEntity !== undefined) {
        const qLog = world.getComponent(playerEntity, QuestLog)!;
        if (qLog.questId) {
            // Reset opacity in case floating text loop changed it
            ctx.globalAlpha = 1.0;
            const msg = qLog.completed
                ? `Quest: Return to Villager`
                : `Quest: Kill ${qLog.targetType} (${qLog.progress}/${qLog.targetCount})`;

            ctx.textAlign = 'left';
            ctx.font = '16px "VT323", monospace';

            // Background Box
            const width = ctx.measureText(msg).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(4, 60, width + 12, 20);

            // Text with Shadow
            ctx.fillStyle = '#000';
            ctx.fillText(msg, 11, 75);
            ctx.fillStyle = '#FFD700'; // Gold
            ctx.fillText(msg, 10, 74);
        }
    }
    ctx.restore();
}

export function consumableSystem(world: World, input: InputHandler, ui: UIManager) {
    if (!input.isDown('KeyH')) return;
    const now = Date.now();
    if ((consumableSystem as any).lastTime && now - (consumableSystem as any).lastTime < 500) return;
    (consumableSystem as any).lastTime = now;

    const playerEntity = world.query([PlayerControllable, Inventory, Health])[0];
    if (playerEntity === undefined) return;
    const inv = world.getComponent(playerEntity, Inventory)!;
    const health = world.getComponent(playerEntity, Health)!;

    if (inv.items.has('potion')) {
        if (health.current < health.max) {
            health.current = Math.min(health.current + 20, health.max);
            inv.items.delete('potion');
            const refillIndex = inv.storage.findIndex(i => i.slot === 'potion');
            if (refillIndex !== -1) {
                const refill = inv.storage.splice(refillIndex, 1)[0];
                inv.items.set('potion', refill);
                if ((ui as any).console) (ui as any).console.sendMessage("Equipped new potion.");
            }
            if (spriteSheet.complete) ui.updateInventory(inv, spriteSheet.src);
            if ((ui as any).console) (ui as any).console.sendMessage("Used Potion. +20 HP.");
            const pos = world.getComponent(playerEntity, Position)!;
            const ft = world.createEntity();
            world.addComponent(ft, new Position(pos.x, pos.y));
            world.addComponent(ft, new Velocity(0, -20));
            world.addComponent(ft, new FloatingText(`+20 Returns`, '#00ff00'));
        }
    } else {
        if ((ui as any).console) (ui as any).console.sendMessage("No Potions!");
    }
}

export function enemyCombatSystem(world: World, dt: number, ui: UIManager, audio: AudioController) {
    const playerEntity = world.query([PlayerControllable, Position, Health, Inventory])[0];
    if (playerEntity === undefined) return;
    const pPos = world.getComponent(playerEntity, Position)!;
    const pHealth = world.getComponent(playerEntity, Health)!;
    const pInv = world.getComponent(playerEntity, Inventory)!;
    const enemies = world.query([AI, Position]);

    if (!(enemyCombatSystem as any).cooldowns) (enemyCombatSystem as any).cooldowns = new Map<number, number>();
    const cooldowns = (enemyCombatSystem as any).cooldowns as Map<number, number>;
    const now = Date.now();

    for (const id of enemies) {
        const ePos = world.getComponent(id, Position)!;
        const dx = (pPos.x + 8) - (ePos.x + 8);
        const dy = (pPos.y + 8) - (ePos.y + 8);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 16) {
            const last = cooldowns.get(id) || 0;
            if (now - last > 1000) {
                cooldowns.set(id, now);
                let damage = 5;
                const skills = world.getComponent(playerEntity, Skills);

                if (pInv.items.has('lhand')) {
                    const shield = pInv.items.get('lhand')!;
                    // Shielding Mitigation: Defense * (ShieldSkill * 0.01) + Defense
                    let mitigation = shield.damage;

                    if (skills) {
                        const shSkill = skills.shielding;
                        // Bonus mitigation based on skill
                        mitigation += Math.floor(shield.damage * (shSkill.level * 0.05));

                        // Gain XP
                        shSkill.xp += 1;
                        const nextXp = Math.floor(50 * Math.pow(1.1, shSkill.level - 10));
                        if (shSkill.xp >= nextXp) {
                            shSkill.xp = 0;
                            shSkill.level++;
                            if ((ui as any).console) (ui as any).console.addSystemMessage(`You advanced to shielding level ${shSkill.level}.`);
                            audio.playLevelUp();
                        }
                    }

                    damage = Math.max(0, damage - mitigation);
                    if ((ui as any).console && mitigation > 0) (ui as any).console.sendMessage(`Blocked ${mitigation} dmg!`);
                }
                if (damage > 0) {
                    pHealth.current = Math.max(0, pHealth.current - damage);
                    if ((ui as any).console) (ui as any).console.sendMessage(`Ouch! Took ${damage} dmg.`);
                    audio.playHit();
                    const ft = world.createEntity();
                    world.addComponent(ft, new Position(pPos.x, pPos.y));
                    world.addComponent(ft, new Velocity(0, -20));
                    world.addComponent(ft, new FloatingText(`-${damage}`, '#f00'));
                    if (pHealth.current <= 0) {
                        if ((ui as any).console) (ui as any).console.addSystemMessage("YOU DIED!");
                    }
                }
            }
        }
    }
}

export function renderSystem(world: World, ctx: CanvasRenderingContext2D) {
    let camX = 0, camY = 0;
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity !== undefined) {
        const cam = world.getComponent(cameraEntity, Camera)!;
        camX = Math.floor(cam.x);
        camY = Math.floor(cam.y);
    }
    const entities = world.query([Position, Sprite]);
    entities.sort((a, b) => {
        const posA = world.getComponent(a, Position)!;
        const posB = world.getComponent(b, Position)!;
        return posA.y - posB.y;
    });

    for (const id of entities) {
        const pos = world.getComponent(id, Position)!;
        const sprite = world.getComponent(id, Sprite)!;
        if (pos.x < -100) continue;
        const drawX = Math.round(pos.x - camX);
        const drawY = Math.round(pos.y - camY);
        drawSprite(ctx, sprite.uIndex, drawX, drawY - 4, sprite.size);
    }

    // Draw Target Reticle
    const playerRef = world.query([PlayerControllable, Target])[0];
    if (playerRef !== undefined) {
        const targetComp = world.getComponent(playerRef, Target)!;
        const targetPos = world.getComponent(targetComp.targetId, Position);
        if (targetPos) {
            const tx = Math.floor(targetPos.x - camX);
            const ty = Math.floor(targetPos.y - camY);

            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;

            // Corners
            const s = 16;
            const len = 4;
            // Top Left
            ctx.beginPath(); ctx.moveTo(tx, ty + len); ctx.lineTo(tx, ty); ctx.lineTo(tx + len, ty); ctx.stroke();
            // Top Right
            ctx.beginPath(); ctx.moveTo(tx + s - len, ty); ctx.lineTo(tx + s, ty); ctx.lineTo(tx + s, ty + len); ctx.stroke();
            // Bottom Left
            ctx.beginPath(); ctx.moveTo(tx, ty + s - len); ctx.lineTo(tx, ty + s); ctx.lineTo(tx + len, ty + s); ctx.stroke();
            // Bottom Right
            ctx.beginPath(); ctx.moveTo(tx + s - len, ty + s); ctx.lineTo(tx + s, ty + s); ctx.lineTo(tx + s, ty + s - len); ctx.stroke();

        } else {
            world.removeComponent(playerRef, Target);
        }
    }
}

export function createPlayer(world: World, x: number, y: number, input: InputHandler, vocationKey: string = 'knight') {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    world.addComponent(e, new Sprite(SPRITES.PLAYER, 16));
    world.addComponent(e, new PlayerControllable());
    world.addComponent(e, new Inventory());
    world.addComponent(e, new Health(200, 200));
    world.addComponent(e, new Experience(0, 100, 1));
    world.addComponent(e, new Mana(50, 50));
    world.addComponent(e, new Facing(0, 1));
    world.addComponent(e, new QuestLog());

    // RPG Depth
    const vocData = VOCATIONS[vocationKey] || VOCATIONS.knight;
    world.addComponent(e, new Skills());
    world.addComponent(e, new Vocation(vocData.name, vocData.hpGain, vocData.manaGain, vocData.capGain));

    // Update stats based on vocation
    const hp = world.getComponent(e, Health)!;
    hp.max = vocData.startHp;
    hp.current = vocData.startHp;

    const mana = world.getComponent(e, Mana)!;
    mana.max = vocData.startMana;
    mana.current = vocData.startMana;

    const inv = world.getComponent(e, Inventory)!;
    inv.cap = vocData.startCap;

    return e;
}

export function createEnemy(world: World, x: number, y: number, type: string = "orc", difficulty: number = 1.0) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));

    // Scale HP based on difficulty
    const hpScale = difficulty;

    if (type === "wolf") {
        world.addComponent(e, new Sprite(SPRITES.WOLF, 16));
        world.addComponent(e, new AI(50));
        world.addComponent(e, new Health(20 * hpScale, 20 * hpScale));
        world.addComponent(e, new Name("Wolf"));
    } else if (type === "skeleton") {
        world.addComponent(e, new Sprite(SPRITES.SKELETON, 16));
        world.addComponent(e, new AI(20));
        world.addComponent(e, new Health(40 * hpScale, 40 * hpScale));
        world.addComponent(e, new Name("Skeleton"));
    } else if (type === "ghost") {
        world.addComponent(e, new Sprite(SPRITES.GHOST, 16));
        world.addComponent(e, new AI(30));
        world.addComponent(e, new Health(60 * hpScale, 60 * hpScale));
        world.addComponent(e, new Name("Ghost"));
    } else if (type === "slime") {
        world.addComponent(e, new Sprite(SPRITES.SLIME, 16));
        world.addComponent(e, new AI(10)); // Slow
        world.addComponent(e, new Health(100 * hpScale, 100 * hpScale)); // Tanky
        world.addComponent(e, new Name("Slime"));
    } else {
        world.addComponent(e, new Sprite(SPRITES.ORC, 16));
        world.addComponent(e, new AI(30));
        world.addComponent(e, new Health(30 * hpScale, 30 * hpScale));
        world.addComponent(e, new Name("Orc"));
    }
    return e;
}

export function createBoss(world: World, x: number, y: number) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    world.addComponent(e, new Sprite(SPRITES.ORC, 24));
    world.addComponent(e, new AI(40));
    world.addComponent(e, new Health(200, 200));
    world.addComponent(e, new Name("Orc Warlord"));
    return e;
}

export function createNPC(world: World, x: number, y: number, text: string) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    world.addComponent(e, new Sprite(SPRITES.NPC, 16));
    world.addComponent(e, new Interactable(text));
    world.addComponent(e, new QuestGiver("Kill Warlord", "Orc Warlord", 1, "The Orc Warlord threatens us! Slay him!", "Have you killed the Warlord?", "The Warlord is dead! We are saved!"));
    return e;
}

export function createMerchant(world: World, x: number, y: number) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(SPRITES.NPC, 16));
    world.addComponent(e, new Interactable("Open Shop"));
    const merch = new Merchant();
    merch.items.push(new Item("Health Potion", "potion", SPRITES.POTION, 20, 50));
    merch.items.push(new Item("Wooden Shield", "lhand", SPRITES.WOODEN_SHIELD, 2, 50));
    merch.items.push(new Item("Iron Sword", "rhand", SPRITES.SWORD, 15, 150));
    merch.items.push(new Item("Tower Shield", "lhand", SPRITES.SHIELD, 5, 200));
    merch.items.push(new Item("Noble Sword", "rhand", SPRITES.NOBLE_SWORD, 25, 400));
    world.addComponent(e, merch);
    return e;
}

export function createTeleporter(world: World, x: number, y: number, targetX: number, targetY: number) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Teleporter(targetX, targetY));
    world.addComponent(e, new Sprite(SPRITES.STAIRS, 16)); // Visual Marker
    return e;
}

export function createItem(world: World, x: number, y: number, name: string, slot: string, uIndex: number, damage: number = 0, price: number = 10) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(uIndex, 12));
    if (slot === 'potion') price = 50;
    if (slot === 'lhand') price = 100;
    if (slot === 'rhand') price = 150;
    if (name === "Potion") price = 50;
    if (name === "Wooden Shield") price = 50;
    if (name === "Wooden Sword") price = 50;
    if (name === "Tower Shield") price = 200;
    if (name === "Noble Sword") price = 400;
    world.addComponent(e, new Item(name, slot, uIndex, damage, price));
    return e;
}

export function itemPickupSystem(world: World, ui: UIManager, audio: AudioController) {
    const playerEntity = world.query([PlayerControllable, Position, Inventory])[0];
    if (playerEntity === undefined) return;
    const pPos = world.getComponent(playerEntity, Position)!;
    const inventory = world.getComponent(playerEntity, Inventory)!;
    const items = world.query([Item, Position]);
    for (const id of items) {
        const iPos = world.getComponent(id, Position)!;
        if (pPos.x < iPos.x + 12 && pPos.x + 16 > iPos.x + 4 && pPos.y < iPos.y + 12 && pPos.y + 16 > iPos.y + 4) {
            const item = world.getComponent(id, Item)!;
            if (item.slot === 'currency') {
                const amount = 10;
                inventory.gold = (inventory.gold || 0) + amount;
                iPos.x = -1000;
                if ((ui as any).console) (ui as any).console.sendMessage(`You picked up ${amount} Gold.`);
                audio.playCoin();
                world.removeEntity(id);
                continue;
            }
            if (!inventory.items.has(item.slot)) {
                inventory.items.set(item.slot, item);
                iPos.x = -1000;
                if ((ui as any).console) (ui as any).console.sendMessage(`You picked up a ${item.name}.`);
                audio.playCoin();
                if (spriteSheet.complete) ui.updateInventory(inventory, spriteSheet.src);
            } else {
                inventory.storage.push(item);
                iPos.x = -1000;
                if ((ui as any).console) (ui as any).console.sendMessage(`Picked up ${item.name} (In Bag).`);
                audio.playCoin();
                if (spriteSheet.complete) ui.updateInventory(inventory, spriteSheet.src);
            }
            world.removeEntity(id);
        }
    }
}

export function autocloseSystem(world: World, ui: UIManager) {
    if (ui.activeMerchantId !== null) {
        const playerEntity = world.query([PlayerControllable, Position])[0];
        if (!playerEntity) return;
        const pos = world.getComponent(playerEntity, Position)!;
        const mPos = world.getComponent(ui.activeMerchantId, Position);
        if (!mPos) { ui.hideDialogue(); return; }
        const dx = (pos.x + 8) - (mPos.x + 8);
        const dy = (pos.y + 8) - (mPos.y + 8);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 32) ui.hideDialogue();
    }
}

export function castSpell(world: World, ui: UIManager, spellName: string) {
    const playerEntity = world.query([PlayerControllable, Health, Mana, Position, Facing])[0];
    if (playerEntity === undefined) return;
    const hp = world.getComponent(playerEntity, Health)!;
    const mana = world.getComponent(playerEntity, Mana)!;
    const pos = world.getComponent(playerEntity, Position)!;
    const facing = world.getComponent(playerEntity, Facing)!;
    const skills = world.getComponent(playerEntity, Skills); // Optional for safety
    const console = (ui as any).console;

    if (spellName === 'exura') { // HEAL
        if (mana.current >= 20) {
            mana.current -= 20;
            const oldHp = hp.current;
            const magicLevel = skills ? skills.magic.level : 1;
            const healAmount = 20 + (magicLevel * 2);

            hp.current = Math.min(hp.current + healAmount, hp.max);
            const healed = hp.current - oldHp;

            const ft = world.createEntity();
            world.addComponent(ft, new Position(pos.x, pos.y));
            world.addComponent(ft, new Velocity(0, -20));
            world.addComponent(ft, new FloatingText(`+${healed}`, '#00f'));

            if (console) console.addSystemMessage(`You healed ${healed} HP.`);
        } else {
            if (console) console.addSystemMessage(`Not enough mana.`);
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }
    } else if (spellName === 'fireball') { // FIREBALL
        if (mana.current >= 10) {
            mana.current -= 10;
            const pId = world.createEntity();
            world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));

            // Aiming Logic
            const targetComp = world.getComponent(playerEntity, Target);
            let vx = facing.x * 150;
            let vy = facing.y * 150;

            if (targetComp) {
                const targetPos = world.getComponent(targetComp.targetId, Position);
                if (targetPos) { // Target might be dead/gone
                    const dx = (targetPos.x + 8) - (pos.x + 8);
                    const dy = (targetPos.y + 8) - (pos.y + 8);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        vx = (dx / dist) * 150;
                        vy = (dy / dist) * 150;
                    }
                } else {
                    // Target invalid, remove it
                    world.removeComponent(playerEntity, Target);
                }
            }

            world.addComponent(pId, new Velocity(vx, vy));
            world.addComponent(pId, new Sprite(SPRITES.FIREBALL, 8));

            const magicLevel = skills ? skills.magic.level : 0;
            const dmg = 20 + (magicLevel * 3);
            world.addComponent(pId, new Projectile(dmg, 1.0, 'player'));

            if (console) console.addSystemMessage("Cast Fireball!");
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }
    } else if (spellName === 'heavystrike') { // HEAVY STRIKE
        if (mana.current >= 20) {
            mana.current -= 20;

            // Screen Shake
            const shake = world.createEntity();
            world.addComponent(shake, new ScreenShake(0.3, 3));

            // Attack in front
            const targetX = pos.x + (facing.x * 16);
            const targetY = pos.y + (facing.y * 16);

            // Basic hit detection (simplified)
            const enemies = world.query([Health, Position, Name]);
            let hit = false;
            for (const eId of enemies) {
                if (world.getComponent(eId, PlayerControllable)) continue;
                const ePos = world.getComponent(eId, Position)!;
                const dx = (targetX + 8) - (ePos.x + 8);
                const dy = (targetY + 8) - (ePos.y + 8);
                if (Math.abs(dx) < 16 && Math.abs(dy) < 16) {
                    const eHp = world.getComponent(eId, Health)!;
                    const swordSkill = skills ? skills.sword.level : 10;
                    const dmg = 30 + (swordSkill * 2);
                    eHp.current -= dmg;
                    spawnFloatingText(world, ePos.x, ePos.y - 10, `${dmg}`, '#ff0000');
                    hit = true;

                    // Kill check logic (shared with combat)
                    if (eHp.current <= 0) {
                        const nameComp = world.getComponent(eId, Name);
                        const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
                        dropLoot(world, ePos.x, ePos.y, enemyType);
                        world.removeEntity(eId);
                    }
                }
            }
            if (console) console.addSystemMessage("Heavy Strike!");
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }
    }
}

function spawnFloatingText(world: World, x: number, y: number, text: string, color: string) {
    const ft = world.createEntity();
    world.addComponent(ft, new Position(x, y));
    world.addComponent(ft, new Velocity(0, -20));
    world.addComponent(ft, new FloatingText(text, color));
}

export function gainExperience(world: World, amount: number, ui: UIManager, audio: AudioController) {
    const playerEntity = world.query([PlayerControllable, Experience, Health, Mana, Position])[0];
    if (playerEntity === undefined) return;
    const xp = world.getComponent(playerEntity, Experience)!;
    const hp = world.getComponent(playerEntity, Health)!;
    const mana = world.getComponent(playerEntity, Mana)!;
    const pos = world.getComponent(playerEntity, Position)!;
    const console = (ui as any).console;

    xp.current += amount;
    if (console) console.sendMessage(`You gained ${amount} experience.`);
    const ft = world.createEntity();
    world.addComponent(ft, new Position(pos.x, pos.y - 12));
    world.addComponent(ft, new Velocity(0, -15));
    world.addComponent(ft, new FloatingText(`${amount} XP`, '#fff'));

    while (xp.current >= xp.next) {
        xp.current -= xp.next;
        xp.level++;
        xp.next = Math.floor(xp.next * 1.5);

        // Vocation Gains
        const voc = world.getComponent(playerEntity, Vocation);
        const inv = world.getComponent(playerEntity, Inventory);

        if (voc) {
            hp.max += voc.hpGain;
            if (mana) mana.max += voc.manaGain;
            if (inv) inv.cap += voc.capGain;
        } else {
            // Default Fallback
            hp.max += 10;
            if (mana) mana.max += 10;
        }

        hp.current = hp.max;
        if (mana) mana.current = mana.max;

        if (console) console.sendMessage(`You advanced to Level ${xp.level}.`);
        if (console && voc) console.sendMessage(`HP: +${voc.hpGain}, MP: +${voc.manaGain}, Cap: +${voc.capGain}`);

        audio.playLevelUp();
        const lu = world.createEntity();
        world.addComponent(lu, new Position(pos.x, pos.y - 20));
        world.addComponent(lu, new Velocity(0, -10));
        world.addComponent(lu, new FloatingText("LEVEL UP!", '#ffd700', 3.0));
    }
}

export function dropLoot(world: World, x: number, y: number, enemyType: string = "orc") {
    const goldAmount = Math.floor(Math.random() * 20) + 5;
    createItem(world, x + (Math.random() * 8 - 4), y + (Math.random() * 8 - 4), "Gold Coin", "currency", 32, 0);
    if (enemyType.includes("warlord")) {
        // Guaranteed Boss Drop
        createItem(world, x, y, "Noble Sword", "rhand", SPRITES.NOBLE_SWORD, 25);
        return;
    }

    const rand = Math.random();
    if (rand < 0.1) {
        if (enemyType === "skeleton") {
            createItem(world, x, y, "Wooden Sword", "rhand", SPRITES.WOODEN_SWORD, 8);
        } else if (enemyType === "wolf") {
        } else {
            if (Math.random() < 0.5) createItem(world, x, y, "Iron Sword", "rhand", SPRITES.SWORD, 15);
            else createItem(world, x, y, "Wooden Shield", "lhand", SPRITES.WOODEN_SHIELD, 0);
        }
    } else if (rand < 0.4) {
        createItem(world, x, y, "Health Potion", "potion", SPRITES.POTION, 20);
    }
}
