import { World, Entity, InputHandler } from './engine';
import { UIManager } from './ui';
import { AudioController } from './audio';

// --- Components (Re-exported from separate file) ---
// --- Components (Re-exported from separate file) ---
export * from './components';
export * from './assets';
import {
    Position, Velocity, Sprite, TileMap, PlayerControllable, RemotePlayer, AI, Interactable,
    Item, Inventory, Health, Camera, Particle, ScreenShake, FloatingText, Name, QuestLog,
    QuestGiver, Facing, Projectile, Mana, Experience, Merchant, Skill, Skills, Vocation,
    VOCATIONS, Target, Teleporter, LightSource, Consumable, NetworkItem, Decay, Lootable,
    SpellBook, SkillPoints, ActiveSpell, StatusEffect
} from './components';
import { NetworkManager } from './network';



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

        const interactables = world.query([Interactable, Position]);
        let clickedInteractable = false;

        // Priority: Interactions > Targeting
        for (const id of interactables) {
            const pos = world.getComponent(id, Position)!;
            if (worldX >= pos.x && worldX <= pos.x + 32 &&
                worldY >= pos.y && worldY <= pos.y + 32) {

                const player = world.query([PlayerControllable, Position])[0];
                if (player) {
                    const pPos = world.getComponent(player, Position)!;
                    const dx = (pPos.x + 16) - (pos.x + 16);
                    const dy = (pPos.y + 16) - (pos.y + 16);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist <= 80) {
                        // Execute Interaction
                        const lootable = world.getComponent(id, Lootable);
                        const merchant = world.getComponent(id, Merchant);

                        if (lootable) {
                            const playerInv = world.getComponent(player, Inventory)!;
                            ui.openLoot(lootable, id, playerInv);
                            clickedInteractable = true;
                        } else if (merchant) {
                            const playerInv = world.getComponent(player, Inventory)!;
                            ui.currentMerchant = merchant;
                            ui.activeMerchantId = id;
                            ui.renderShop(merchant, playerInv);
                            ui.shopPanel.classList.remove('hidden');
                            clickedInteractable = true;
                        }
                    } else {
                        if ((ui as any).console) (ui as any).console.addSystemMessage("Too far away.");
                        clickedInteractable = true; // Consume click
                    }
                }
                if (clickedInteractable) break;
            }
        }

        if (clickedInteractable) return; // Skip targeting if we interacted

        const enemies = world.query([Health, Position, Name]);
        let clickedTarget = false;

        for (const eId of enemies) {
            if (world.getComponent(eId, PlayerControllable)) continue;
            const pos = world.getComponent(eId, Position)!;

            // Box Check (32x32)
            if (worldX >= pos.x && worldX <= pos.x + 32 &&
                worldY >= pos.y && worldY <= pos.y + 32) {

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
    const interactRadius = 60;

    // Find closest interacting entity
    const interactables = world.query([Interactable, Position]);
    let closestId = -1;
    let minDist = interactRadius;

    for (const id of interactables) {
        const iPos = world.getComponent(id, Position)!;
        const dx = (pos.x + 16) - (iPos.x + 16);
        const dy = (pos.y + 16) - (iPos.y + 16);
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
        const lootable = world.getComponent(closestId, Lootable);

        if (lootable) {
            const playerInv = world.getComponent(playerEntity, Inventory)!;
            ui.openLoot(lootable, closestId, playerInv);
            return;
        }

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
                        const loot = generateLoot(enemyType);
                        gainExperience(world, 50, ui, audio);
                        createCorpse(world, ePos.x, ePos.y, loot);
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

export function remotePlayerInterpolationSystem(world: World, dt: number) {
    const entities = world.query([RemotePlayer, Position]);
    const lerpFactor = 10 * dt; // Adjust speed (10 = fast snap, 5 = smoother)

    for (const id of entities) {
        const rp = world.getComponent(id, RemotePlayer)!;
        const pos = world.getComponent(id, Position)!;

        // Simple Linear Interpolation
        pos.x += (rp.targetX - pos.x) * lerpFactor;
        pos.y += (rp.targetY - pos.y) * lerpFactor;

        // Teleport if too far (lag spike or teleport packet)
        const dist = Math.abs(pos.x - rp.targetX) + Math.abs(pos.y - rp.targetY);
        if (dist > 50) {
            pos.x = rp.targetX;
            pos.y = rp.targetY;
        }

        // Update Facing for animation (basic)
        if (Math.abs(rp.targetX - pos.x) > 1) {
            // Side facing logic if we had it, for now just move
        }
    }
}

// Status Effect System
export function statusEffectSystem(world: World, dt: number) {
    const entities = world.query([StatusEffect, AI]); // Only affect AI for now? Or Players too?
    for (const id of entities) {
        const status = world.getComponent(id, StatusEffect)!;
        const ai = world.getComponent(id, AI);

        status.duration -= dt;

        if (status.type === 'frozen') {
            // Halt AI - crude method
            if (ai) {
                // Store original speed? We don't have a clean way yet. 
                // Just set vel to 0 in movement system or ai system if frozen.
                // We'll update aiSystem to check for StatusEffect
            }
        }

        if (status.duration <= 0) {
            world.removeComponent(id, StatusEffect);
        }
    }
}

export function aiSystem(world: World, dt: number) {
    const players = world.query([PlayerControllable, Position]);
    if (players.length === 0) return;
    const playerPos = world.getComponent(players[0], Position)!;

    // Map Center...
    const centerX = 480;
    const centerY = 480;
    const safeRadius = 160;

    const enemies = world.query([AI, Position, Velocity]);
    for (const id of enemies) {
        const status = world.getComponent(id, StatusEffect);
        if (status && status.type === 'frozen') continue; // Skip AI if frozen

        const pos = world.getComponent(id, Position)!;
        // ... (rest of AI)
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



export function movementSystem(world: World, dt: number, audio: AudioController, network?: NetworkManager) {
    const entities = world.query([Position, Velocity]);

    const mapEntity = world.query([TileMap])[0];
    let map: TileMap | undefined;
    if (mapEntity !== undefined) {
        map = world.getComponent(mapEntity, TileMap);
    }

    for (const id of entities) {
        const pos = world.getComponent(id, Position)!;
        const vel = world.getComponent(id, Velocity)!;

        // Direction logic ...
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
            // ... collision logic ...
            const centerX = nextX + 8;
            const centerY = nextY + 8;
            const tileX = Math.floor(centerX / map.tileSize);
            const tileY = Math.floor(centerY / map.tileSize);

            if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) continue;
            const tileId = map.data[tileY * map.width + tileX];

            // Collision Check (Walls 17, Water 18, Pillars 20/22?)
            // For now existing logic:
            if (tileId === 17) continue;
            if (tileId === 18) continue;

            // Update Position
            pos.x = nextX;
            pos.y = nextY;

            // Network Update (Player Only)
            if (world.getComponent(id, PlayerControllable)) {
                if (network) network.sendMove(pos.x, pos.y);

                // Teleport Check
                const teleporters = world.query([Teleporter, Position]);
                for (const tId of teleporters) {
                    const tPos = world.getComponent(tId, Position)!;
                    const tData = world.getComponent(tId, Teleporter)!;

                    if (Math.abs((pos.x + 8) - (tPos.x + 8)) < 12 && Math.abs((pos.y + 8) - (tPos.y + 8)) < 12) {
                        pos.x = tData.targetX;
                        pos.y = tData.targetY;
                        // Sync Teleport too
                        if (network) network.sendMove(pos.x, pos.y);
                        return;
                    }
                }

                // Footsteps
                const pc = world.getComponent(id, PlayerControllable)!;
                pc.footstepTimer -= dt;
                if (pc.footstepTimer <= 0) {
                    let material: 'grass' | 'stone' | 'wood' = 'grass';
                    if (tileId === 19 || tileId === 20) material = 'wood';
                    else if (tileId >= 23 || tileId === 17) material = 'stone';

                    audio.playFootstep(material);
                    pc.footstepTimer = 0.4;
                }
            }
        }
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
import { spriteSheet, spriteCanvas, SPRITES, SHEET_TILE_SIZE, SHEET_COLS } from './assets';


export function combatSystem(world: World, input: InputHandler, audio: AudioController, ui: UIManager, network?: any, pvpEnabled: boolean = false) {
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
    let targetId = -1;

    // 1. Check Locked Target First
    // Use existing variable from outer scope if accessible, or rename to avoid conflict
    // The outer one is line 504. Let's start fresh for clarity or reuse.
    // Actually, line 504 is 'if (targetComp)'. Where is it defined?
    // It was passed into the function? No.
    // It must be defined earlier in the function. Let me check line 48... NO.
    // Ah, I missed where 'targetComp' was defined in the original file.
    // Let's assume it IS defined earlier. I will use a NEW name 'lockedTarget'.

    const lockedTarget = world.getComponent(playerEntity, Target);
    if (lockedTarget) {
        const tPos = world.getComponent(lockedTarget.targetId, Position);
        if (tPos) {
            const dx = (pos.x + 8) - (tPos.x + 8);
            const dy = (pos.y + 8) - (tPos.y + 8);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= attackRadius) {
                targetId = lockedTarget.targetId;
            }
        }
    }

    // 2. Fallback to Closest Enemy if no locked target or out of range
    if (targetId === -1) {
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
        if (targets.length > 0) targetId = targets[0].id;
    }

    if (targetId !== -1) {
        const ePos = world.getComponent(targetId, Position)!;

        // Check Network Target
        const rp = world.getComponent(targetId, RemotePlayer);
        if (rp && (ui as any).network && (ui as any).network.connected) {
            if (pvpEnabled) {
                (ui as any).network.sendAttack(rp.id);

                // Visual Feedback for PvP
                // Red 'Ping' effect
                const ft = world.createEntity();
                world.addComponent(ft, new Position(ePos.x, ePos.y - 10));
                world.addComponent(ft, new Velocity(0, -10));
                world.addComponent(ft, new FloatingText("Attack!", '#ff5555', 0.5, 0.5));
            } else {
                if ((ui as any).console) (ui as any).console.addSystemMessage("PvP is Disabled. Press 'P' to enable.");
            }
        } else {
            // Local Enemy Logic
            const health = world.getComponent(targetId, Health);
            if (health) {
                health.current -= damage;
                audio.playHit();
                if ((ui as any).console) (ui as any).console.sendMessage(`You hit Enemy for ${damage} dmg.`);

                const ft = world.createEntity();
                world.addComponent(ft, new Position(ePos.x, ePos.y));
                world.addComponent(ft, new Velocity(0, -20));
                world.addComponent(ft, new FloatingText(`-${damage}`, '#ff3333'));

                if (health.current <= 0) {
                    const nameComp = world.getComponent(targetId, Name);
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

                    const loot = generateLoot(enemyName.toLowerCase());
                    gainExperience(world, 50, ui, audio);
                    createCorpse(world, ePos.x, ePos.y, loot);
                    world.removeEntity(targetId);
                }
            }
        }

        // Screen Shake (Shared)
        const shake = world.createEntity();
        world.addComponent(shake, new ScreenShake(0.2, 2.0));

        // Blood Particles (Shared)
        for (let i = 0; i < 5; i++) {
            const p = world.createEntity();
            world.addComponent(p, new Position(ePos.x + 8, ePos.y + 8));
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 50 + 20;
            const life = Math.random() * 0.3 + 0.2;
            world.addComponent(p, new Particle(life, life, '#a00', 2, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }
        hit = true;
    }

    if (!hit) {
        if ((ui as any).console) (ui as any).console.addSystemMessage("You swing at the air.");
    }
}

function drawSprite(ctx: CanvasRenderingContext2D, uIndex: number, dx: number, dy: number, size: number = 16) {
    const sx = (uIndex % SHEET_COLS) * SHEET_TILE_SIZE;
    const sy = Math.floor(uIndex / SHEET_COLS) * SHEET_TILE_SIZE;

    // Use Canvas Source directly if available (Faster, no load wait)
    if (spriteCanvas) {
        ctx.drawImage(spriteCanvas, sx, sy, SHEET_TILE_SIZE, SHEET_TILE_SIZE, dx, dy, size, size);
        return;
    }

    if (!spriteSheet.complete || spriteSheet.naturalWidth === 0) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(dx, dy, size, size);
        return;
    }
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
                    drawSprite(ctx, tileId, drawX, drawY, map.tileSize);
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
        if (isNaN(camX) || isNaN(camY)) {
            console.error("Camera NaN detected! Resetting.");
            cam.x = 0; cam.y = 0; camX = 0; camY = 0;
        }
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
    world.addComponent(e, new Sprite(SPRITES.PLAYER, 32));
    world.addComponent(e, new PlayerControllable());
    world.addComponent(e, new Inventory());
    world.addComponent(e, new Health(200, 200));
    world.addComponent(e, new Experience(0, 100, 1));
    world.addComponent(e, new Mana(50, 50));
    world.addComponent(e, new Facing(0, 1));
    world.addComponent(e, new QuestLog());
    // Lantern: Dimmer to avoid blinding
    world.addComponent(e, new LightSource(64, '#cc8844', true));

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
        world.addComponent(e, new Sprite(SPRITES.WOLF, 32));
        world.addComponent(e, new AI(50));
        world.addComponent(e, new Health(20 * hpScale, 20 * hpScale));
        world.addComponent(e, new Name("Wolf"));
    } else if (type === "skeleton") {
        world.addComponent(e, new Sprite(SPRITES.SKELETON, 32));
        world.addComponent(e, new AI(20));
        world.addComponent(e, new Health(40 * hpScale, 40 * hpScale));
        world.addComponent(e, new Name("Skeleton"));
    } else if (type === "ghost") {
        world.addComponent(e, new Sprite(SPRITES.GHOST, 32));
        world.addComponent(e, new AI(30));
        world.addComponent(e, new Health(60 * hpScale, 60 * hpScale));
        world.addComponent(e, new Name("Ghost"));
    } else if (type === "slime") {
        world.addComponent(e, new Sprite(SPRITES.SLIME, 32));
        world.addComponent(e, new AI(10)); // Slow
        world.addComponent(e, new Health(100 * hpScale, 100 * hpScale)); // Tanky
        world.addComponent(e, new Name("Slime"));
    } else {
        world.addComponent(e, new Sprite(SPRITES.ORC, 32));
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
    world.addComponent(e, new Sprite(SPRITES.ORC, 48)); // Boss bigger
    world.addComponent(e, new AI(40));
    world.addComponent(e, new Health(200, 200));
    world.addComponent(e, new Name("Orc Warlord"));
    return e;
}

export function createNPC(world: World, x: number, y: number, text: string) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    world.addComponent(e, new Sprite(SPRITES.NPC, 32));
    world.addComponent(e, new Interactable(text));
    world.addComponent(e, new QuestGiver("Kill Warlord", "Orc Warlord", 1, "The Orc Warlord threatens us! Slay him!", "Have you killed the Warlord?", "The Warlord is dead! We are saved!"));
    return e;
}

export function createMerchant(world: World, x: number, y: number) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(SPRITES.NPC, 32));
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
    world.addComponent(e, new Sprite(SPRITES.STAIRS, 32)); // Visual Marker
    return e;
}

export function createItem(world: World, x: number, y: number, name: string, slot: string, uIndex: number, damage: number = 0, price: number = 10, network?: NetworkManager, networkItem?: NetworkItem) {
    // 1. Network Spawn Logic
    if (network && network.connected && !networkItem) {
        network.sendSpawnItem(x, y, uIndex, name);
        return;
    }

    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(uIndex, 24)); // Items slightly smaller than players
    if (slot === 'potion') price = 50;
    if (slot === 'lhand') price = 100;
    if (slot === 'rhand') price = 150;
    if (name === "Potion") price = 50;
    if (name === "Wooden Shield") price = 50;
    if (name === "Wooden Sword") price = 50;
    if (name === "Tower Shield") price = 200;
    if (name === "Noble Sword") price = 400;

    // Pass price to Item (assuming Item constructor takes it?)
    // Checking Item component...
    // In components.ts: Item(name, slot, damage, price, uIndex) ??
    // Step 1068 says: new Item(name, slot, uIndex, damage, price)
    // Wait, uIndex is 3rd arg? 
    // Wait, line 1080: `new Item(name, slot, uIndex, damage, price)`
    // This looks quirky. Keep it as is.
    world.addComponent(e, new Item(name, slot, uIndex, damage, price));

    if (networkItem) {
        world.addComponent(e, networkItem);
    }
    return e;
}


export function itemPickupSystem(world: World, ui: UIManager, audio: AudioController, network?: NetworkManager) {
    const playerEntity = world.query([PlayerControllable, Position, Inventory])[0];
    if (playerEntity === undefined) return;
    const pPos = world.getComponent(playerEntity, Position)!;
    const inventory = world.getComponent(playerEntity, Inventory)!;
    const items = world.query([Item, Position]);
    for (const id of items) {
        const iPos = world.getComponent(id, Position)!;
        if (pPos.x < iPos.x + 12 && pPos.x + 16 > iPos.x + 4 && pPos.y < iPos.y + 12 && pPos.y + 16 > iPos.y + 4) {

            // Network Pickup
            const netItem = world.getComponent(id, NetworkItem);
            if (netItem && network) {
                network.sendPickupItem(netItem.id);
                // Optimistic: We pick it up locally too
            }

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
    if (ui.activeLootEntityId !== null) {
        const playerEntity = world.query([PlayerControllable, Position])[0];
        if (!playerEntity) return;
        const pos = world.getComponent(playerEntity, Position)!;
        const lPos = world.getComponent(ui.activeLootEntityId, Position);
        if (!lPos) { ui.hideDialogue(); return; }
        const dx = (pos.x + 8) - (lPos.x + 8);
        const dy = (pos.y + 8) - (lPos.y + 8);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 32) ui.hideDialogue();
    }
}

export function castSpell(world: World, ui: UIManager, spellName: string, network?: NetworkManager) {
    const playerEntity = world.query([PlayerControllable, Health, Mana, Position, Facing])[0];
    if (playerEntity === undefined) return;
    const hp = world.getComponent(playerEntity, Health)!;
    const mana = world.getComponent(playerEntity, Mana)!;
    const pos = world.getComponent(playerEntity, Position)!;
    const facing = world.getComponent(playerEntity, Facing)!;
    const skills = world.getComponent(playerEntity, Skills);
    const spellBook = world.getComponent(playerEntity, SpellBook);
    const vocation = world.getComponent(playerEntity, Vocation);
    const console = (ui as any).console;

    const vocName = vocation ? vocation.name.toLowerCase() : 'knight'; // Default to Knight
    const spellKey = spellName.toLowerCase();

    // Helper: Verify Class Permission
    const canCast = (allowedClasses: string[]) => {
        if (!allowedClasses.includes(vocName)) {
            if (console) console.addSystemMessage("Your vocation cannot use this spell.");
            spawnFloatingText(world, pos.x, pos.y, "Restricted", '#ccc');
            return false;
        }
        return true;
    };

    // Helper: Get Spell Level (Key is Incantation now)
    const getLevel = (key: string) => {
        return spellBook ? (spellBook.knownSpells.get(key) || 1) : 1;
    };

    if (spellKey === 'exura') {
        // LIGHT HEALING (All Classes)
        if (mana.current >= 20) {
            mana.current -= 20;
            const oldHp = hp.current;
            const magicLevel = skills ? skills.magic.level : 1;
            const spellLvl = getLevel('exura');
            const healAmount = 20 + (magicLevel * 2) + (spellLvl * 10);
            hp.current = Math.min(hp.current + healAmount, hp.max);
            const healed = hp.current - oldHp;

            const ft = world.createEntity();
            world.addComponent(ft, new Position(pos.x, pos.y));
            world.addComponent(ft, new Velocity(0, -20));
            world.addComponent(ft, new FloatingText(`+${healed}`, '#00f'));

            if (console) console.addSystemMessage(`You healed ${healed} HP (exura).`);
        } else {
            if (console) console.addSystemMessage(`Not enough mana.`);
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }

    } else if (spellKey === 'exura gran') {
        // STRONG HEALING (Mage Only)
        if (!canCast(['mage'])) return;

        if (mana.current >= 70) {
            mana.current -= 70;
            const oldHp = hp.current;
            const magicLevel = skills ? skills.magic.level : 1;
            const spellLvl = getLevel('exura gran');
            const healAmount = 50 + (magicLevel * 4) + (spellLvl * 15);
            hp.current = Math.min(hp.current + healAmount, hp.max);
            const healed = hp.current - oldHp;

            const ft = world.createEntity();
            world.addComponent(ft, new Position(pos.x, pos.y));
            world.addComponent(ft, new Velocity(0, -20));
            world.addComponent(ft, new FloatingText(`+${healed}`, '#0000ff')); // Darker blue

            if (console) console.addSystemMessage(`You healed ${healed} HP (exura gran).`);
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }

    } else if (spellKey === 'adori flam') {
        // FIREBALL (Mage Only)
        if (!canCast(['mage'])) return;

        if (mana.current >= 20) {
            mana.current -= 20;
            const pId = world.createEntity();
            world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));

            // Aiming
            const targetComp = world.getComponent(playerEntity, Target);
            let vx = facing.x * 150;
            let vy = facing.y * 150;

            if (targetComp) {
                const targetPos = world.getComponent(targetComp.targetId, Position);
                if (targetPos) {
                    const dx = (targetPos.x + 8) - (pos.x + 8);
                    const dy = (targetPos.y + 8) - (pos.y + 8);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        vx = (dx / dist) * 150;
                        vy = (dy / dist) * 150;
                    }
                } else {
                    world.removeComponent(playerEntity, Target);
                }
            }

            world.addComponent(pId, new Velocity(vx, vy));
            world.addComponent(pId, new Sprite(SPRITES.FIREBALL, 8));
            const magicLevel = skills ? skills.magic.level : 0;
            const spellLvl = getLevel('adori flam');
            const dmg = 25 + (magicLevel * 3) + (spellLvl * 5);
            world.addComponent(pId, new Projectile(dmg, 1.0, 'player'));

            if (console) console.addSystemMessage("adori flam!");
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }

    } else if (spellKey === 'adori frigo') {
        // ICE SHARD (Mage Only)
        if (!canCast(['mage'])) return;

        if (mana.current >= 15) {
            mana.current -= 15;
            const pId = world.createEntity();
            world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));

            const targetComp = world.getComponent(playerEntity, Target);
            let vx = facing.x * 200;
            let vy = facing.y * 200;
            if (targetComp) {
                const targetPos = world.getComponent(targetComp.targetId, Position);
                if (targetPos) {
                    const dx = (targetPos.x + 8) - (pos.x + 8);
                    const dy = (targetPos.y + 8) - (pos.y + 8);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) { vx = (dx / dist) * 200; vy = (dy / dist) * 200; }
                }
            }

            world.addComponent(pId, new Velocity(vx, vy));
            world.addComponent(pId, new Sprite(SPRITES.SPARKLE, 8)); // Visual

            const magicLevel = skills ? skills.magic.level : 0;
            const spellLvl = getLevel('adori frigo');
            const dmg = 15 + (magicLevel * 2) + (spellLvl * 3);
            world.addComponent(pId, new Projectile(dmg, 1.0, 'player_ice'));

            if (console) console.addSystemMessage("adori frigo!");
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }

    } else if (spellKey === 'exori') {
        // HEAVY STRIKE (Knight Only)
        if (!canCast(['knight'])) return;

        if (mana.current >= 20) {
            mana.current -= 20;
            const shake = world.createEntity();
            world.addComponent(shake, new ScreenShake(0.3, 3));

            const targetX = pos.x + (facing.x * 16);
            const targetY = pos.y + (facing.y * 16);

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
                    const dmg = 30 + (swordSkill * 3); // Stronger for Knight
                    eHp.current -= dmg;
                    spawnFloatingText(world, ePos.x, ePos.y - 10, `${dmg}`, '#ff0000');
                    hit = true;
                    if (eHp.current <= 0) {
                        const nameComp = world.getComponent(eId, Name);
                        const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
                        const loot = generateLoot(enemyType);
                        createCorpse(world, ePos.x, ePos.y, loot);
                        world.removeEntity(eId);
                    }
                }
            }
            if (console) console.addSystemMessage("exori!");
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }

    } else if (spellKey === 'exori mas') {
        // WHIRLWIND (Knight Only)
        if (!canCast(['knight'])) return;

        if (mana.current >= 40) {
            mana.current -= 40;
            const shake = world.createEntity();
            world.addComponent(shake, new ScreenShake(0.2, 4));

            const enemies = world.query([Health, Position, Name]);
            let hitCount = 0;
            const range = 24;

            for (const eId of enemies) {
                if (world.getComponent(eId, PlayerControllable)) continue;
                const ePos = world.getComponent(eId, Position)!;
                const dx = (pos.x + 8) - (ePos.x + 8);
                const dy = (pos.y + 8) - (ePos.y + 8);
                if (Math.abs(dx) <= range && Math.abs(dy) <= range) {
                    const eHp = world.getComponent(eId, Health)!;
                    const swordSkill = skills ? skills.sword.level : 10;
                    const dmg = 50 + (swordSkill * 4);
                    eHp.current -= dmg;
                    spawnFloatingText(world, ePos.x, ePos.y - 10, `${dmg}`, '#ff0000');
                    hitCount++;
                    if (eHp.current <= 0) {
                        const nameComp = world.getComponent(eId, Name);
                        const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
                        const loot = generateLoot(enemyType);
                        createCorpse(world, ePos.x, ePos.y, loot);
                        world.removeEntity(eId);
                    }
                }
            }
            if (console) console.addSystemMessage(`exori mas: ${hitCount} hits!`);
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }

    } else if (spellKey === 'exevo gran vis lux') {
        // CHAIN LIGHTNING (Mage Only)
        // Note: Renamed from 'chain lightning' / 'exevo vis' logic
        if (!canCast(['mage'])) return;

        if (mana.current >= 60) {
            mana.current -= 60;

            const spellLvl = getLevel('exevo gran vis lux');
            const magicLevel = skills ? skills.magic.level : 1;
            const baseDmg = 40 + (magicLevel * 3) + (spellLvl * 5); // Stronger

            // Chain Logic (Copied from previous impl, but refined)
            const enemies = world.query([Health, Position, Name]);
            let currentPos = { x: pos.x, y: pos.y };
            let excludeIds = new Set<number>();
            let jumps = 4;
            let hits = 0;

            for (let i = 0; i < jumps; i++) {
                let closestId = -1;
                let closestDist = 150;

                for (const eId of enemies) {
                    if (excludeIds.has(eId)) continue;
                    if (world.getComponent(eId, PlayerControllable)) continue;

                    const ePos = world.getComponent(eId, Position)!;
                    const dx = ePos.x - currentPos.x;
                    const dy = ePos.y - currentPos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < closestDist) {
                        closestDist = dist;
                        closestId = eId;
                    }
                }

                if (closestId !== -1) {
                    excludeIds.add(closestId);
                    const ePos = world.getComponent(closestId, Position)!;

                    // Particles
                    const chunks = 5;
                    for (let p = 0; p < chunks; p++) {
                        const t = p / chunks;
                        const lx = currentPos.x + (ePos.x - currentPos.x) * t;
                        const ly = currentPos.y + (ePos.y - currentPos.y) * t;
                        const part = world.createEntity();
                        world.addComponent(part, new Position(lx + 4, ly + 4));
                        world.addComponent(part, new Particle(0.3, 0.3, '#ff0', 2, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10));
                    }

                    const eHp = world.getComponent(closestId, Health)!;
                    const dmg = Math.floor(baseDmg * (1.0 - (i * 0.15)));
                    eHp.current -= dmg;
                    spawnFloatingText(world, ePos.x, ePos.y - 10, `${dmg}`, '#ffff00');
                    hits++;

                    if (eHp.current <= 0) {
                        const nameComp = world.getComponent(eId, Name);
                        const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
                        const loot = generateLoot(enemyType);
                        createCorpse(world, ePos.x, ePos.y, loot);
                        world.removeEntity(eId);
                    }
                    currentPos = { x: ePos.x, y: ePos.y };
                } else {
                    break;
                }
            }
            if (console) console.addSystemMessage(`exevo gran vis lux: ${hits} hits!`);
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
            spawnFloatingText(world, pos.x, pos.y, "No Mana", '#fff');
        }

    } else if (spellKey === 'utito san') {
        // PRECISION SHOT (Ranger Only)
        if (!canCast(['ranger'])) return;

        if (mana.current >= 20) {
            mana.current -= 20;
            const pId = world.createEntity();
            world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));

            // Aiming
            const targetComp = world.getComponent(playerEntity, Target);
            let vx = facing.x * 250;
            let vy = facing.y * 250;
            if (targetComp) {
                const targetPos = world.getComponent(targetComp.targetId, Position);
                if (targetPos) {
                    const dx = (targetPos.x + 8) - (pos.x + 8);
                    const dy = (targetPos.y + 8) - (pos.y + 8);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) { vx = (dx / dist) * 250; vy = (dy / dist) * 250; }
                }
            }
            world.addComponent(pId, new Velocity(vx, vy));
            world.addComponent(pId, new Sprite(SPRITES.FIREBALL, 8));
            const distSkill = skills ? skills.distance.level : 10;
            const dmg = 40 + (distSkill * 3);
            world.addComponent(pId, new Projectile(dmg, 0.8, 'player'));

            if (console) console.addSystemMessage("utito san!");
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
    const gameConsole = (ui as any).console;

    xp.current += amount;
    if (gameConsole) gameConsole.sendMessage(`You gained ${amount} experience.`);
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
            if (mana) {
                console.log(`[LevelUp] Mana Gain: ${voc.manaGain}. Old Max: ${mana.max}`);
                mana.max += voc.manaGain;
                console.log(`[LevelUp] New Max: ${mana.max}`);
            }
            if (inv) inv.cap += voc.capGain;
        } else {
            // Default Fallback
            hp.max += 10;
            if (mana) mana.max += 10;
        }

        hp.current = hp.max;
        if (mana) mana.current = mana.max;

        if (gameConsole) gameConsole.sendMessage(`You advanced to Level ${xp.level}.`);
        if (gameConsole && voc) gameConsole.sendMessage(`HP: +${voc.hpGain}, MP: +${voc.manaGain}, Cap: +${voc.capGain}`);

        audio.playLevelUp();
        const lu = world.createEntity();
        world.addComponent(lu, new Position(pos.x, pos.y - 20));
        world.addComponent(lu, new Velocity(0, -10));
        world.addComponent(lu, new FloatingText("LEVEL UP!", '#ffd700', 3.0));
        world.addComponent(lu, new FloatingText("LEVEL UP!", '#ffd700', 3.0));
    }

    // Refresh UI
    const inv = world.getComponent(playerEntity, Inventory);
    const skills = world.getComponent(playerEntity, Skills);
    const curLevel = xp.level;
    const curXP = xp.current;
    const nextXP = xp.next;
    const curHP = hp.current;
    const maxHP = hp.max;
    const curMana = mana ? mana.current : 0;
    const maxMana = mana ? mana.max : 0;
    const curCap = inv ? inv.cap : 0;
    const curGold = inv ? inv.gold : 0;

    ui.updateStatus(curHP, maxHP, curMana, maxMana, curCap, curGold, curLevel, curXP, nextXP, skills);
}

export function generateLoot(enemyType: string = "orc"): Item[] {
    const items: Item[] = [];

    // Gold (Currency)
    if (Math.random() < 0.5) {
        const gold = Math.floor(Math.random() * 20) + 5;
        // Construct Item manually since we aren't spawning entity
        // Item(slot, name, uIndex, damage/price)
        // Gold needs a slot? 'currency'.
        items.push(new Item('currency', 'Gold Coin', SPRITES.POTION, gold)); // Using POTION sprite for now as placeholder
    }

    if (enemyType.includes("warlord")) {
        items.push(new Item("rhand", "Noble Sword", SPRITES.NOBLE_SWORD, 25));
        return items;
    }

    const rand = Math.random();
    if (rand < 0.1) {
        if (enemyType === "skeleton") {
            items.push(new Item("rhand", "Wooden Sword", SPRITES.WOODEN_SWORD, 8));
        } else if (enemyType === "wolf") {
            // wolf loot?
        } else {
            if (Math.random() < 0.5) items.push(new Item("rhand", "Iron Sword", SPRITES.SWORD, 15));
            else items.push(new Item("lhand", "Wooden Shield", SPRITES.WOODEN_SHIELD, 0));
        }
    } else if (rand < 0.4) {
        items.push(new Item("consumable", "Health Potion", SPRITES.POTION, 0));
    }

    return items;
}




// Offscreen canvas for lighting
let lightCanvas: HTMLCanvasElement | null = null;
let lightCtx: CanvasRenderingContext2D | null = null;

export function lightingRenderSystem(world: World, ctx: CanvasRenderingContext2D, ambientLight: number = 0.9) {
    let camX = 0, camY = 0;
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity !== undefined) {
        const cam = world.getComponent(cameraEntity, Camera)!;
        camX = Math.floor(cam.x + (typeof shakeOffsetX !== 'undefined' ? shakeOffsetX : 0));
        camY = Math.floor(cam.y + (typeof shakeOffsetY !== 'undefined' ? shakeOffsetY : 0));
    }

    const lights = world.query([Position, LightSource]);

    // Initialize Offscreen Canvas
    if (!lightCanvas) {
        lightCanvas = document.createElement('canvas');
        lightCanvas.width = ctx.canvas.width;
        lightCanvas.height = ctx.canvas.height;
        lightCtx = lightCanvas.getContext('2d');
    }
    // Handle Resize (if necessary)
    if (lightCanvas && lightCtx) {
        if (lightCanvas.width !== ctx.canvas.width || lightCanvas.height !== ctx.canvas.height) {
            lightCanvas.width = ctx.canvas.width;
            lightCanvas.height = ctx.canvas.height;
        }

        // 1. Setup Darkness on Offscreen
        lightCtx.save();
        lightCtx.globalCompositeOperation = 'source-over';
        lightCtx.fillStyle = `rgba(0, 0, 0, ${ambientLight})`;
        lightCtx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);

        // 2. Cut Holes from Darkness (Destination-Out)
        lightCtx.globalCompositeOperation = 'destination-out';
        for (const id of lights) {
            const pos = world.getComponent(id, Position)!;
            const light = world.getComponent(id, LightSource)!;

            const lx = Math.round(pos.x - camX + 8);
            const ly = Math.round(pos.y - camY + 8);

            let radius = light.radius;
            if (light.flickers) {
                radius += (Math.random() - 0.5) * 4;
            }

            const gradient = lightCtx.createRadialGradient(lx, ly, 0, lx, ly, radius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            lightCtx.fillStyle = gradient;
            lightCtx.beginPath();
            lightCtx.arc(lx, ly, radius, 0, Math.PI * 2);
            lightCtx.fill();
        }
        lightCtx.restore();

        // 3. Draw Offscreen to Main Screen
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(lightCanvas, 0, 0);
        ctx.restore();
    }

    // 4. Draw Colored Glows (Additive Pass on Main)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.4; // Reduce intensity of the color glow
    for (const id of lights) {
        const light = world.getComponent(id, LightSource)!;
        if (light.color && light.color !== '#000000') {
            const pos = world.getComponent(id, Position)!;
            const lx = Math.round(pos.x - camX + 8);
            const ly = Math.round(pos.y - camY + 8);

            let radius = light.radius;
            if (light.flickers) radius += (Math.random() - 0.5) * 4;

            const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
            gradient.addColorStop(0, light.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(lx, ly, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}


export function createCorpse(world: World, x: number, y: number, loot: Item[] = []) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    // Use BONES sprite (22)
    world.addComponent(e, new Sprite(SPRITES.BONES || 22, 16));
    world.addComponent(e, new Decay(30000)); // 30s decay
    world.addComponent(e, new Interactable("Loot Corpse"));
    if (loot.length > 0) {
        world.addComponent(e, new Lootable(loot));
    }
    return e;
}


export function decaySystem(world: World, dt: number) {
    const entities = world.query([Decay]);
    for (const id of entities) {
        const decay = world.getComponent(id, Decay)!;
        decay.life -= dt;
        if (decay.life <= 0) {
            world.removeEntity(id);
        }
    }
}
