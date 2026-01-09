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
    SpellBook, SkillPoints, ActiveSpell, StatusEffect, Passives, ItemRarity, RARITY_MULTIPLIERS, RARITY_COLORS, StatusOnHit, Locked,
    DungeonEntrance, DungeonExit, Collider
} from './components';
import { generateOverworld, generateDungeon } from './map_gen';
import { NetworkManager } from './network';
import { AIState, getStateName } from './ai/states';

// Debug flag to visualize collision boxes
export const DEBUG_COLLIDERS = true;

// Debug flag to show AI state names above enemies
// Debug flag to show AI state names above enemies
export const DEBUG_AI_STATES = true;

// --- Components: Dialogue ---
export class Dialogue {
    constructor(
        public lines: string[] = [],
        public currentLine: number = 0,
        public name: string = "Unknown"
    ) { }
}

// --- Systems ---

let lastAttackTime = 0;

export function inputSystem(world: World, input: InputHandler) {
    const entities = world.query([PlayerControllable, Velocity]);

    for (const id of entities) {
        let speed = 100; // Base Speed

        // Passive Bonus
        const passives = world.getComponent(id, Passives);
        if (passives) {
            speed += (passives.agility * 5); // +5 Speed per level
        }
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
            // Teleport to Center (Map is 128*32=4096, center ~2048)
            pos.x = 4096;
            pos.y = 4096;
        }

        // Debug: Home / Stairs
        if (input.isDown('KeyH')) {
            // Check if processed this frame?
            // InputHandler has justPressed
            if (input.isJustPressed('KeyH')) {
                const pos = world.getComponent(id, Position)!;
                // New Map Center is 128x32 = 4096
                pos.x = 4096;
                pos.y = 4096;
                console.log("Teleported to Village Center.");
                spawnFloatingText(world, 4096, 4096, "↓↓ VILLAGE ↓↓", '#ff00ff');
            }
        }
    }
}



export function createNPC(world: World, x: number, y: number, text: string = "Hello!", name: string = "Villager", spriteIndex: number = SPRITES.NPC) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(spriteIndex));
    world.addComponent(e, new Facing(0, 1));
    world.addComponent(e, new Interactable('Press E to talk'));
    world.addComponent(e, new Name(name));

    // Add Dialogue Component
    let lines = ["Hello there.", "Nice weather today."];
    if (name === "Old Man") {
        lines = [
            "Greetings, traveler.",
            "The temple ahead is dangerous.",
            "Take this sword, it's dangerous alone!"
        ];
    } else if (name === "Merchant") {
        lines = ["I have wares, if you have coin."];
    }

    world.addComponent(e, new Dialogue(lines, 0, name));

    // NPCs can wander slightly
    // world.addComponent(e, new AI('wander')); 
    // For now static to talk easier
}

export function interactionSystem(world: World, input: InputHandler, ui: UIManager) {
    // Dialogue Interaction (E key)
    if (input.isJustPressed('e')) {
        const player = world.query([PlayerControllable, Position])[0];
        if (player === undefined) return;
        const pPos = world.getComponent(player, Position)!;

        // Check Dialogue NPCs
        const talkers = world.query([Dialogue, Position]);
        for (const eid of talkers) {
            const dPos = world.getComponent(eid, Position)!;
            const dist = Math.sqrt(Math.pow(dPos.x - pPos.x, 2) + Math.pow(dPos.y - pPos.y, 2));

            if (dist < 48) { // 1.5 tiles
                const dialogue = world.getComponent(eid, Dialogue)!;

                // Interaction Logic
                // If UI is closed, Open it with Line 0
                // If UI is open, Advance Line
                // If End of Lines, Close UI & Reset

                const uiEl = document.getElementById('dialogue-ui');
                const nameEl = document.getElementById('dialogue-name');
                const textEl = document.getElementById('dialogue-text');

                if (uiEl && nameEl && textEl) {
                    if (uiEl.style.display === 'none') {
                        // Open
                        uiEl.style.display = 'block';
                        dialogue.currentLine = 0;
                        nameEl.innerText = dialogue.name;
                        textEl.innerText = dialogue.lines[dialogue.currentLine];
                    } else {
                        // Advance
                        dialogue.currentLine++;
                        if (dialogue.currentLine >= dialogue.lines.length) {
                            // End
                            uiEl.style.display = 'none';
                            dialogue.currentLine = 0;
                        } else {
                            // Show Next
                            textEl.innerText = dialogue.lines[dialogue.currentLine];
                        }
                    }
                }
                return; // Block other interactions if dialogue is handled
            }
        }
    }

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
            // console.log("Check Int:", id, pos.x, pos.y, worldX, worldY);
            if (worldX >= pos.x && worldX <= pos.x + 32 &&
                worldY >= pos.y && worldY <= pos.y + 32) {
                console.log("Clicked Interactable:", id);

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
                        const questGiver = world.getComponent(id, QuestGiver);

                        console.log("Interaction Check:", id, "Lootable:", !!lootable, "Merchant:", !!merchant, "Quest:", !!questGiver);

                        if (lootable) {
                            const playerInv = world.getComponent(player, Inventory)!;
                            ui.openLoot(lootable, id, playerInv);
                            clickedInteractable = true;
                        } else if (merchant) {
                            console.log("Opening Shop UI...");
                            const playerInv = world.getComponent(player, Inventory)!;
                            ui.currentMerchant = merchant;
                            ui.activeMerchantId = id;
                            ui.renderShop(merchant, playerInv);
                            ui.shopPanel.classList.remove('hidden');
                            ui.shopPanel.style.display = 'flex'; // Force visibility
                            ui.shopPanel.style.zIndex = '10000'; // Force on top
                            console.log("Forced Shop Visible");
                            clickedInteractable = true;
                        } else if (questGiver) {
                            // Quest Interaction
                            const playerQLog = world.getComponent(player, QuestLog);
                            const playerInv = world.getComponent(player, Inventory);
                            const playerXp = world.getComponent(player, Experience);

                            if (playerQLog) {
                                // Check for quests to turn in
                                for (const quest of playerQLog.quests) {
                                    if (quest.completed && !quest.turnedIn) {
                                        // Find matching quest in giver
                                        const giverQuest = questGiver.availableQuests.find(q => q.id === quest.id);
                                        if (giverQuest) {
                                            quest.turnedIn = true;
                                            playerQLog.completedQuestIds.push(quest.id);
                                            // Remove from active
                                            playerQLog.quests = playerQLog.quests.filter(q => q.id !== quest.id);
                                            // Give rewards
                                            if (playerInv) playerInv.gold += quest.reward.gold;
                                            if (playerXp) {
                                                playerXp.current += quest.reward.xp;
                                                if (playerXp.current >= playerXp.next) {
                                                    playerXp.level++;
                                                    playerXp.current -= playerXp.next;
                                                    playerXp.next = Math.floor(playerXp.next * 1.5);
                                                }
                                            }
                                            if ((ui as any).console) {
                                                (ui as any).console.addSystemMessage(`Quest Complete: "${quest.name}"!`);
                                                (ui as any).console.addSystemMessage(`Reward: ${quest.reward.gold} gold, ${quest.reward.xp} XP`);
                                            }
                                            clickedInteractable = true;
                                            break;
                                        }
                                    }
                                }

                                // Check for new quests to accept
                                if (!clickedInteractable) {
                                    for (const quest of questGiver.availableQuests) {
                                        // Check if already have or completed this quest
                                        const hasQuest = playerQLog.quests.some(q => q.id === quest.id);
                                        const completedQuest = playerQLog.completedQuestIds.includes(quest.id);
                                        if (!hasQuest && !completedQuest) {
                                            // Accept quest (deep copy to player)
                                            const newQuest = { ...quest, current: 0, completed: false, turnedIn: false };
                                            playerQLog.quests.push(newQuest);
                                            if ((ui as any).console) {
                                                (ui as any).console.addSystemMessage(`New Quest: "${quest.name}"`);
                                                (ui as any).console.addSystemMessage(quest.description);
                                            }
                                            clickedInteractable = true;
                                            break;
                                        }
                                    }
                                }

                                // Already have all quests from this giver
                                if (!clickedInteractable) {
                                    const npcNameComp = world.getComponent(id, Name);
                                    const npcName = npcNameComp ? npcNameComp.value : "NPC";
                                    if ((ui as any).console) (ui as any).console.addSystemMessage(`${npcName}: "Check back later."`);
                                    clickedInteractable = true;
                                }
                            }
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

            if (qGiver.availableQuests.length > 0) {
                const questTemplate = qGiver.availableQuests[0];
                const existing = qLog.quests.find(q => q.id === questTemplate.id);

                if (!existing) {
                    // Accept
                    // TypeScript hack: define proper Quest object structure matching interface
                    const newQuest = { ...questTemplate, current: 0, completed: false, turnedIn: false };
                    qLog.quests.push(newQuest);
                    ui.showDialogue("Objective: " + newQuest.name);
                } else if (existing.completed && !existing.turnedIn) {
                    // Turn In active via dialogue interaction (fallback)
                    existing.turnedIn = true;
                    qLog.completedQuestIds.push(existing.id);
                    ui.showDialogue("Thank you!");
                    const inv = world.getComponent(playerEntity, Inventory);
                    if (inv) inv.gold += existing.reward.gold;
                } else {
                    ui.showDialogue("Progress: " + existing.current + "/" + existing.required);
                }
            }
        }
    }
}

export function magicSystem(world: World, input: InputHandler, ui: UIManager) {
    const playerEntity = world.query([PlayerControllable, ActiveSpell])[0];
    if (!playerEntity) return;

    const activeSpell = world.getComponent(playerEntity, ActiveSpell)!;
    let changed = false;

    // Spell Selection
    if (input.isJustPressed('Digit1')) { activeSpell.spellName = 'adori flam'; changed = true; }
    if (input.isJustPressed('Digit2')) { activeSpell.spellName = 'exori'; changed = true; }
    if (input.isJustPressed('Digit3')) { activeSpell.spellName = 'exura'; changed = true; }
    if (input.isJustPressed('Digit4')) { activeSpell.spellName = 'adori frigo'; changed = true; }

    if (changed) {
        ui.updateMagicHud(activeSpell.spellName);
    }

    // Cast Active Spell (Only if UI is not blocking)
    if (!ui.isShowing() && input.isJustPressed('KeyR')) {
        castSpell(world, ui, activeSpell.spellName);
    }

    // Toggle Skill Tree
    if (input.isJustPressed('KeyK')) {
        const spells = world.getComponent(playerEntity, SpellBook);
        const points = world.getComponent(playerEntity, SkillPoints);
        const passives = world.getComponent(playerEntity, Passives);
        const vocation = world.getComponent(playerEntity, Vocation);
        const vocName = vocation ? vocation.name.toLowerCase() : 'knight';

        if (spells && points) {
            ui.toggleSkillTree(spells, points, vocName, passives, () => {
                updateStatsFromPassives(world, playerEntity);
            });
        }
    }

    // Legacy / Quick Cast Bindings (Optional, keeping F for Exori/Attack match)
    if (!ui.isShowing() && input.isJustPressed('KeyF')) {
        castSpell(world, ui, 'exori');
    }
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

/**
 * Spawn blood particles exploding outward from a point.
 * Used when damage is dealt to enemies.
 */
export function spawnBloodEffect(world: World, x: number, y: number) {
    const count = 10 + Math.floor(Math.random() * 6); // 10-15 particles
    for (let i = 0; i < count; i++) {
        const e = world.createEntity();
        world.addComponent(e, new Position(x + 8, y + 8)); // Center of sprite

        // Random direction explosion
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 30; // Slight upward bias

        // Red color variations
        const shade = Math.floor(Math.random() * 100);
        const color = `rgb(${180 + shade}, ${20 + Math.floor(shade * 0.3)}, ${10 + Math.floor(shade * 0.2)})`;

        world.addComponent(e, new Particle(0.4 + Math.random() * 0.3, 0.7, color, 2 + Math.floor(Math.random() * 2), vx, vy));
    }
}

/**
 * Spawn magic particles floating gently upward.
 * Used for spell effects, healing, etc.
 */
export function spawnMagicEffect(world: World, x: number, y: number, colorScheme: 'blue' | 'green' | 'yellow' = 'blue') {
    const count = 8 + Math.floor(Math.random() * 5); // 8-12 particles
    for (let i = 0; i < count; i++) {
        const e = world.createEntity();
        world.addComponent(e, new Position(x + Math.random() * 16, y + Math.random() * 16));

        // Gentle upward float with slight horizontal drift
        const vx = (Math.random() - 0.5) * 30;
        const vy = -20 - Math.random() * 40; // Float upward

        // Color based on scheme
        let color: string;
        if (colorScheme === 'green') {
            color = `rgb(${50 + Math.floor(Math.random() * 50)}, ${200 + Math.floor(Math.random() * 55)}, ${80 + Math.floor(Math.random() * 50)})`;
        } else if (colorScheme === 'yellow') {
            color = `rgb(${220 + Math.floor(Math.random() * 35)}, ${200 + Math.floor(Math.random() * 55)}, ${50 + Math.floor(Math.random() * 50)})`;
        } else {
            color = `rgb(${100 + Math.floor(Math.random() * 80)}, ${150 + Math.floor(Math.random() * 80)}, ${220 + Math.floor(Math.random() * 35)})`;
        }

        world.addComponent(e, new Particle(0.5 + Math.random() * 0.4, 0.9, color, 2, vx, vy));
    }
}

/**
 * Trigger screen shake effect.
 * Used when player takes damage.
 */
export function triggerScreenShake(world: World, intensity: number = 5, duration: number = 0.3) {
    const e = world.createEntity();
    world.addComponent(e, new ScreenShake(duration, intensity));
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

    // Map Center (256x256 map * 32px = center at 128*32)
    const centerX = 128 * 32; // 4096
    const centerY = 128 * 32; // 4096
    const safeRadius = 10 * 32; // 10 tiles = 320px town radius

    const enemies = world.query([AI, Position, Velocity]);
    for (const id of enemies) {
        const status = world.getComponent(id, StatusEffect);
        if (status && status.type === 'frozen') continue; // Skip AI if frozen

        const pos = world.getComponent(id, Position)!;
        if (pos.x < -100) continue;

        const vel = world.getComponent(id, Velocity)!;
        const ai = world.getComponent(id, AI)!;
        const hp = world.getComponent(id, Health);
        const nameComp = world.getComponent(id, Name);

        // Safe Zone Check - Force flee from town center
        const distToCenter = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));
        if (distToCenter < safeRadius) {
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
            continue;
        }

        // Calculate distance to player
        const dx = playerPos.x - pos.x;
        const dy = playerPos.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Boss rage mechanic (double speed at low HP)
        let currentSpeed = ai.speed;
        if (nameComp && nameComp.value === "Warlord" && hp && hp.current < hp.max * 0.5) {
            currentSpeed *= 2.0;
        }

        // Update cooldown timer
        if (ai.cooldownTimer > 0) ai.cooldownTimer -= dt;

        // =============================================
        // FINITE STATE MACHINE LOGIC
        // =============================================

        // Check for FLEE transition (health low) - highest priority
        if (hp && hp.current <= hp.max * ai.fleeHealthThreshold && ai.currentState !== AIState.FLEE) {
            ai.currentState = AIState.FLEE;
        }

        // State-specific behavior
        switch (ai.currentState) {
            case AIState.IDLE:
                // Wander randomly
                ai.wanderTimer -= dt;

                if (ai.wanderTimer <= 0) {
                    // Pick new random wander target
                    ai.wanderTargetX = pos.x + (Math.random() - 0.5) * 100;
                    ai.wanderTargetY = pos.y + (Math.random() - 0.5) * 100;
                    ai.wanderTimer = 2 + Math.random() * 2; // 2-4 seconds
                }

                // Move toward wander target
                const wanderDx = ai.wanderTargetX - pos.x;
                const wanderDy = ai.wanderTargetY - pos.y;
                const wanderDist = Math.sqrt(wanderDx * wanderDx + wanderDy * wanderDy);

                if (wanderDist > 10) {
                    vel.x = (wanderDx / wanderDist) * (ai.speed * 0.4); // Slower wander
                    vel.y = (wanderDy / wanderDist) * (ai.speed * 0.4);
                } else {
                    vel.x = 0;
                    vel.y = 0;
                }

                // Check for player detection
                if (dist < ai.detectionRadius) {
                    ai.currentState = AIState.CHASE;
                }
                break;

            case AIState.CHASE:
                // Move toward player
                if (dist > 0) {
                    vel.x = (dx / dist) * currentSpeed;
                    vel.y = (dy / dist) * currentSpeed;
                }

                // Check for attack range
                if (dist <= ai.attackRange) {
                    ai.currentState = AIState.ATTACK;
                }

                // Lost player? Return to IDLE
                if (dist > ai.detectionRadius * 1.5) {
                    ai.currentState = AIState.IDLE;
                }
                break;

            case AIState.ATTACK:
                // Stop moving
                vel.x = 0;
                vel.y = 0;

                // Attack on cooldown
                if (ai.cooldownTimer <= 0) {
                    if (ai.behavior === 'ranged') {
                        // Fire projectile
                        const p = world.createEntity();
                        world.addComponent(p, new Position(pos.x + 8, pos.y + 8));

                        const aimX = (dx / dist) * 200;
                        const aimY = (dy / dist) * 200;
                        world.addComponent(p, new Velocity(aimX, aimY));

                        let pSprite = SPRITES.FIREBALL;
                        let pDmg = 15;
                        let pType = 'enemy_fire';

                        if (nameComp) {
                            if (nameComp.value.includes("Ice") || nameComp.value.includes("Frost") || nameComp.value === "Yeti") {
                                pSprite = SPRITES.ICE_CRYSTAL || 101;
                                pType = 'enemy_ice';
                            } else if (nameComp.value.includes("Siren") || nameComp.value.includes("Hydra")) {
                                pSprite = SPRITES.WATER_CRYSTAL || 104;
                                pType = 'enemy_water';
                            } else if (nameComp.value.includes("Basilisk")) {
                                pSprite = 59;
                                pType = 'enemy_poison';
                            }
                        }

                        world.addComponent(p, new Sprite(pSprite, 16));
                        world.addComponent(p, new Projectile(pDmg, 1.5, pType));
                    }
                    // Melee attack is handled by enemyCombatSystem

                    ai.cooldownTimer = ai.attackCooldown;
                }

                // Player moved away? Chase again
                if (dist > ai.attackRange * 1.5) {
                    ai.currentState = AIState.CHASE;
                }
                break;

            case AIState.FLEE:
                // Run away from player
                if (dist > 0) {
                    vel.x = -(dx / dist) * currentSpeed * 1.2; // Slightly faster flee
                    vel.y = -(dy / dist) * currentSpeed * 1.2;
                }

                // Recovery: If health restored above threshold, go back to CHASE
                if (hp && hp.current > hp.max * ai.fleeHealthThreshold * 1.5) {
                    ai.currentState = AIState.CHASE;
                }
                break;
        }
    }
}




export function movementSystem(world: World, dt: number, audio: AudioController, network?: NetworkManager, ui?: any) {
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
            // --- ENTITY-TO-ENTITY COLLISION CHECK (using Collider component) ---
            const myCollider = world.getComponent(id, Collider);
            let blockedByEntity = false;

            if (myCollider) {
                // Calculate my collision box at next position
                const myBoxNextX = nextX + myCollider.offsetX;
                const myBoxNextY = nextY + myCollider.offsetY;
                const myBoxW = myCollider.width;
                const myBoxH = myCollider.height;

                // Check against all other entities with Colliders
                const collidables = world.query([Collider, Position]);
                for (const otherId of collidables) {
                    if (otherId === id) continue; // Skip self

                    const otherPos = world.getComponent(otherId, Position)!;
                    const otherCollider = world.getComponent(otherId, Collider)!;

                    const otherBoxX = otherPos.x + otherCollider.offsetX;
                    const otherBoxY = otherPos.y + otherCollider.offsetY;
                    const otherBoxW = otherCollider.width;
                    const otherBoxH = otherCollider.height;

                    // AABB overlap check
                    if (myBoxNextX < otherBoxX + otherBoxW &&
                        myBoxNextX + myBoxW > otherBoxX &&
                        myBoxNextY < otherBoxY + otherBoxH &&
                        myBoxNextY + myBoxH > otherBoxY) {
                        blockedByEntity = true;
                        break;
                    }
                }
            }

            if (blockedByEntity) continue;

            // --- TILE-BASED COLLISION CHECK ---
            const centerX = nextX + 8;
            const centerY = nextY + 8;
            const tileX = Math.floor(centerX / map.tileSize);
            const tileY = Math.floor(centerY / map.tileSize);

            if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) continue;
            const tileId = map.data[tileY * map.width + tileX];

            // Collision Check (Walls 17, Water 18, Trees 34)
            if (tileId === 17) continue;
            if (tileId === 18) continue;
            if (tileId === 34) continue; // Trees are solid


            // Update Position
            // --- DEEP FOREST UNLOCK CHECK ---
            const cx = map ? (map.width * map.tileSize) / 2 : 2048;
            const cy = map ? (map.height * map.tileSize) / 2 : 2048;
            const currentDist = Math.sqrt((pos.x - cx) ** 2 + (pos.y - cy) ** 2);
            const nextDist = Math.sqrt((nextX - cx) ** 2 + (nextY - cy) ** 2);

            // Limit 1550 (approx 50 tiles) -> DISABLED for verification
            const limitDist = 9999;
            if (nextDist > limitDist) {
                // Disabled logic
            }

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
import { spriteSheet, spriteCanvas, SPRITES, SHEET_TILE_SIZE, SHEET_COLS, assetManager } from './assets';


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

    const targetX = pos.x + 8 + (pc.facingX * 24);
    const targetY = pos.y + 8 + (pc.facingY * 24);

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
                // Passives: Might now boosts your EFFECTIVE Skill Level
                // This aligns with "Damage comes from Skill" philosophy
                const passives = world.getComponent(playerEntity, Passives);
                const mightBonus = passives ? passives.might : 0;

                // Effective Skill = Trained Skill + (Might * 3)
                // Might makes you handle weapons like a master
                skillLevel = skill.level + (mightBonus * 3);

                // --- WEAPON MISS CHANCE ---
                // Base: 35% Miss. -1% per Effective Skill. Cap at 5% Miss.
                const missChance = Math.max(0.05, 0.35 - (skillLevel * 0.01));

                if (Math.random() < missChance) {
                    damage = 0;
                    spawnFloatingText(world, targetX, targetY, "MISS", '#aaaaaa');
                } else {
                    // Tibia Formula approximation: (Level * 0.2) + (Skill * Atk * 0.06) + (Atk * 0.5)
                    // (Calculation continues below...)
                    const playerLevel = xp ? xp.level : 1;
                    const skillDmg = (skillLevel * weapon.damage * 0.06) + (playerLevel * 0.2);

                    // Final Damage
                    damage = Math.floor(skillDmg + (Math.random() * (damage * 0.5))); // Variation

                    // --- CRITICAL HIT ---
                    // 5% Chance
                    if (Math.random() < 0.05) {
                        damage *= 2;
                        spawnFloatingText(world, targetX, targetY, "CRIT!", '#ff0000');
                        // Screen Shake Magnitude
                        const s = world.createEntity();
                        world.addComponent(s, new ScreenShake(0.2, 5.0));
                    }
                }

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

                // Spatial audio: play hit sound from enemy position
                audio.playSpatialSound('hit', ePos.x, ePos.y, pos.x, pos.y);

                if ((ui as any).console) (ui as any).console.sendMessage(`You hit Enemy for ${damage} dmg.`);

                // Spawn blood particles on hit
                spawnBloodEffect(world, ePos.x, ePos.y);

                const ft = world.createEntity();
                world.addComponent(ft, new Position(ePos.x, ePos.y));
                world.addComponent(ft, new Velocity(0, -20));
                world.addComponent(ft, new FloatingText(`-${damage}`, '#ff3333'));

                if (health.current <= 0) {
                    const nameComp = world.getComponent(targetId, Name);
                    const enemyName = nameComp ? nameComp.value : "Enemy";
                    if ((ui as any).console) (ui as any).console.sendMessage(`${enemyName} died.`);

                    // Quest Progress Tracking
                    const qLog = world.getComponent(playerEntity, QuestLog);
                    if (qLog) {
                        for (const quest of qLog.quests) {
                            if (!quest.completed && quest.type === 'kill' && quest.target.toLowerCase() === enemyName.toLowerCase()) {
                                quest.current++;
                                if ((ui as any).console) (ui as any).console.sendMessage(`Quest "${quest.name}": ${quest.current}/${quest.required} ${quest.target}s`);
                                if (quest.current >= quest.required) {
                                    quest.completed = true;
                                    if ((ui as any).console) (ui as any).console.addSystemMessage(`Quest Complete! Return to turn in "${quest.name}"`);
                                }
                            }
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

export function projectileSystem(world: World, dt: number, ui: UIManager, audio: AudioController) {
    const projectiles = world.query([Position, Projectile]);
    const targets = world.query([Position, Health, Name]); // Possible targets

    for (const pId of projectiles) {
        const pPos = world.getComponent(pId, Position)!;
        const proj = world.getComponent(pId, Projectile)!;

        // Lifetime decay handled by separate decaySystem usually, but we can check bounds or time here

        // Collision
        let hit = false;
        for (const tId of targets) {
            if (pId === tId) continue;
            // Owner check? simple version: projectiles don't hit owner if we tracked it?
            // Proj has 'ownerType'.
            const tName = world.getComponent(tId, Name)!;
            if (proj.ownerType === 'player' && world.getComponent(tId, PlayerControllable)) continue;
            if (proj.ownerType === 'enemy' && !world.getComponent(tId, PlayerControllable)) continue; // Enemies don't hit enemies
            if (proj.ownerType === 'player_ice' && world.getComponent(tId, PlayerControllable)) continue;

            const tPos = world.getComponent(tId, Position)!;

            // Box Calc
            if (pPos.x < tPos.x + 12 && pPos.x + 8 > tPos.x + 4 &&
                pPos.y < tPos.y + 12 && pPos.y + 8 > tPos.y + 4) {

                // Hit!
                const tHp = world.getComponent(tId, Health)!;
                tHp.current -= proj.damage;
                spawnFloatingText(world, tPos.x, tPos.y, `-${proj.damage}`, '#ff0');

                // Status Effects
                if (proj.ownerType === 'player_ice') {
                    // Apply Frozen
                    // Ensure StatusEffect component exists or add it
                    // We need to import StatusEffect or define it. It is in components.
                    // We need to ADD it.
                    // But we can't check 'if (world.getComponent(tId, StatusEffect))'.
                    // We can just add it.
                    world.addComponent(tId, new StatusEffect('frozen', 3.0, 0.5)); // 3s freeze
                    spawnFloatingText(world, tPos.x, tPos.y - 10, "*Froze*", '#0ff');
                }

                if (tHp.current <= 0) {
                    const name = tName.value.toLowerCase();
                    const loot = generateLoot(name);
                    createCorpse(world, tPos.x, tPos.y, loot);
                    world.removeEntity(tId);
                    gainExperience(world, 20, ui, audio); // Flat XP for now
                }

                hit = true;
                break; // One hit per projectile
            }
        }

        if (hit) {
            world.removeEntity(pId);
        }
    }
}

// Updated drawSprite using AssetManager with Sheet Switching
export function drawSprite(ctx: CanvasRenderingContext2D, uIndex: number, dx: number, dy: number, size: number = 32) {
    let source = assetManager.getSpriteSource(uIndex);

    // --- Dynamic Texture Switching (Prompt Fix) ---
    if (uIndex >= 100) {
        // IDs 100-199: Use 'dungeon' sheet by default
        let sheetName = 'dungeon';
        let localIndex = uIndex - 100;

        // --- VISUAL DEBUG REMOVED: Now using generated assets ---

        const manager = assetManager as any;
        const img = manager.images.get(sheetName);

        if (img) {
            const config = manager.sheetConfigs.get(sheetName) || { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 };

            // Calculate Position in Sheet
            // Assuming simplified grid (no manual UV mapping per ID for dungeon yet)
            const cols = Math.floor(img.width / config.stride);
            const col = localIndex % cols;
            const row = Math.floor(localIndex / cols);

            source = {
                image: img,
                sx: config.offsetX + (col * config.stride),
                sy: config.offsetY + (row * config.stride),
                sw: config.tileSize,
                sh: config.tileSize
            };
        }
    }

    if (source) {
        // Bounds Check
        if (source.sx + source.sw > source.image.width || source.sy + source.sh > source.image.height) {
            // OOB
            ctx.fillStyle = '#000000';
            ctx.fillRect(Math.floor(dx), Math.floor(dy), size, size);
            return;
        }

        // Determine Draw Dimensions
        let dWidth = size;
        let dHeight = size;
        let dOffsetY = 0;

        // Big Sprite Handling (High-Res Characters)
        if (source.sw >= 64) {
            // Scale 64px source to 32x48 (Tall) destination
            dWidth = 32;
            dHeight = 48;
            dOffsetY = 32 - 48; // -16 (Shift up)
        } else {
            // Standard Scaling (Aspect Ratio)
            const ratio = source.sh / source.sw;
            dHeight = size * ratio;
            dOffsetY = size - dHeight;
        }

        // Draw with strict integer coordinates
        ctx.drawImage(
            source.image,
            Math.floor(source.sx), Math.floor(source.sy), Math.floor(source.sw), Math.floor(source.sh),
            Math.floor(dx), Math.floor(dy) + dOffsetY, dWidth, dHeight
        );
    } else {
        // Fallback or Missing - Draw Black
        ctx.fillStyle = '#000000';
        ctx.fillRect(Math.floor(dx), Math.floor(dy), size, size);
    }
}

function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    drawSprite(ctx, SPRITES.WALL, x, y, size);
}

/**
 * Deterministic coordinate hash for tile variants.
 * Uses sin/cos hash to produce stable results (no flickering).
 * @param x - Tile X coordinate
 * @param y - Tile Y coordinate
 * @param numVariants - Number of possible variants
 * @returns A stable index from 0 to numVariants-1
 */
function getTileVariant(x: number, y: number, numVariants: number): number {
    const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return Math.floor((hash - Math.floor(hash)) * numVariants);
}

/**
 * Maps for grass tile variants to add visual variety to terrain.
 * Base grass (16) will randomly pick from these.
 */
const GRASS_VARIANTS = [16, 16, 16, 62, 63, 64]; // 50% base, 16.6% dark, 16.6% light, 16.6% flowers

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

                // Culling: Skip tiles outside visible area
                if (drawX < -map.tileSize || drawX > 320 || drawY < -map.tileSize || drawY > 240) continue;

                if (tileId === 17) {
                    // Tall Wall: Draw wood floor behind, then tall wall
                    drawSprite(ctx, 19, drawX, drawY, map.tileSize); // Wood floor background
                    drawSprite(ctx, 17, drawX, drawY, map.tileSize); // Tall Wall
                }
                else if (tileId === 16) {
                    // Grass: Use terrain variation for visual variety
                    const variant = getTileVariant(x, y, GRASS_VARIANTS.length);
                    drawSprite(ctx, GRASS_VARIANTS[variant], drawX, drawY, map.tileSize);

                    // Occasionally add small decorative rocks
                    if (getTileVariant(x + 100, y + 100, 20) === 0) {
                        drawSprite(ctx, 66, drawX, drawY, map.tileSize); // ROCK_SMALL
                    }
                }
                else if (tileId === 34) {
                    // Tree: Draw varied grass background first, then tall tree
                    const variant = getTileVariant(x, y, GRASS_VARIANTS.length);
                    drawSprite(ctx, GRASS_VARIANTS[variant], drawX, drawY, map.tileSize);
                    drawSprite(ctx, tileId, drawX, drawY, map.tileSize);
                }
                else {
                    // Default: Direct map (Sprite ID matches Tile ID)
                    drawSprite(ctx, tileId, drawX, drawY, map.tileSize);
                }
            }
        }
    }
}

export function renderSystem(world: World, ctx: CanvasRenderingContext2D) {
    // Force Crisp Pixels
    ctx.imageSmoothingEnabled = false;

    let camX = 0, camY = 0;
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity !== undefined) {
        const cam = world.getComponent(cameraEntity, Camera)!;
        camX = Math.floor(cam.x + (typeof shakeOffsetX !== 'undefined' ? shakeOffsetX : 0));
        camY = Math.floor(cam.y + (typeof shakeOffsetY !== 'undefined' ? shakeOffsetY : 0));
    }

    // Collect visible sprites with their "bottom Y" for Y-sorting (2.5D depth)
    const entities = world.query([Position, Sprite]);

    // Sort by bottom Y (pos.y + sprite.size) so lower objects appear IN FRONT
    const sorted = entities.sort((a, b) => {
        const posA = world.getComponent(a, Position)!;
        const spriteA = world.getComponent(a, Sprite)!;
        const posB = world.getComponent(b, Position)!;
        const spriteB = world.getComponent(b, Sprite)!;
        // Bottom Y = position Y + sprite height
        const bottomA = posA.y + spriteA.size;
        const bottomB = posB.y + spriteB.size;
        return bottomA - bottomB;
    });

    let renderedCount = 0;
    for (const id of sorted) {
        const pos = world.getComponent(id, Position)!;
        const sprite = world.getComponent(id, Sprite)!;

        // Culling
        if (pos.x - camX < -32 || pos.x - camX > 320 || pos.y - camY < -32 || pos.y - camY > 240) continue;

        drawSprite(ctx, sprite.uIndex, Math.floor(pos.x - camX), Math.floor(pos.y - camY), sprite.size);
        renderedCount++;

        // Draw Health Bar for enemies (entities with Health but not PlayerControllable)
        const health = world.getComponent(id, Health);
        const isPlayer = world.getComponent(id, PlayerControllable);
        if (health && !isPlayer && health.current < health.max) {
            const barWidth = sprite.size;
            const barHeight = 4;
            const barX = Math.floor(pos.x - camX);
            const barY = Math.floor(pos.y - camY) - 6;
            const healthPercent = health.current / health.max;

            // Background (dark red)
            ctx.fillStyle = '#400';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Health (green to red gradient based on health)
            if (healthPercent > 0.5) {
                ctx.fillStyle = '#0a0';
            } else if (healthPercent > 0.25) {
                ctx.fillStyle = '#aa0';
            } else {
                ctx.fillStyle = '#a00';
            }
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

            // Border
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }

        // Draw NPC Name Labels (for entities with Name and QuestGiver or Interactable)
        const nameComp = world.getComponent(id, Name);
        const isQuestGiver = world.getComponent(id, QuestGiver);
        const isInteractable = world.getComponent(id, Interactable);
        if (nameComp && (isQuestGiver || isInteractable) && !isPlayer) {
            const nameX = Math.floor(pos.x - camX + sprite.size / 2);
            const nameY = Math.floor(pos.y - camY) - 6;

            ctx.font = 'bold 12px "VT323", monospace';
            ctx.textAlign = 'center';
            const textWidth = ctx.measureText(nameComp.value).width;

            // Background (solid black for better contrast)
            ctx.fillStyle = '#000000';
            ctx.fillRect(nameX - textWidth / 2 - 3, nameY - 11, textWidth + 6, 14);

            // Text shadow
            ctx.fillStyle = '#000';
            ctx.fillText(nameComp.value, nameX + 1, nameY + 1);

            // Name text (gold for quest givers, white for others)
            ctx.fillStyle = isQuestGiver ? '#ffd700' : '#ffffff';
            ctx.fillText(nameComp.value, nameX, nameY);
        }

        // DEBUG: Draw collision box if entity has a Collider component
        if (DEBUG_COLLIDERS) {
            const collider = world.getComponent(id, Collider);
            if (collider) {
                const colX = Math.floor(pos.x + collider.offsetX - camX);
                const colY = Math.floor(pos.y + collider.offsetY - camY);
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 1;
                ctx.strokeRect(colX, colY, collider.width, collider.height);
            }
        }

        // DEBUG: Draw AI state name above enemies
        if (DEBUG_AI_STATES) {
            const aiComp = world.getComponent(id, AI);
            if (aiComp && !isPlayer) {
                const stateX = Math.floor(pos.x - camX + sprite.size / 2);
                const stateY = Math.floor(pos.y - camY) - 18; // Above health bar

                const stateName = getStateName(aiComp.currentState);

                // Color-code by state
                let stateColor = '#888888'; // IDLE = gray
                if (aiComp.currentState === AIState.CHASE) stateColor = '#ff8800'; // Orange
                else if (aiComp.currentState === AIState.ATTACK) stateColor = '#ff0000'; // Red
                else if (aiComp.currentState === AIState.FLEE) stateColor = '#00ff00'; // Green

                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000';
                ctx.fillText(stateName, stateX + 1, stateY + 1);
                ctx.fillStyle = stateColor;
                ctx.fillText(stateName, stateX, stateY);
            }
        }
    }

    // Draw Target Reticle
    const player = world.query([PlayerControllable, Target])[0];
    if (player !== undefined) {
        const targetComp = world.getComponent(player, Target)!;
        const tPos = world.getComponent(targetComp.targetId, Position);
        if (tPos) {
            const tx = Math.floor(tPos.x - camX);
            const ty = Math.floor(tPos.y - camY);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            ctx.strokeRect(tx, ty, 32, 32); // Assume 32x32 for now, or use target's sprite size
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
    // Quest display now handled by Quest Log UI panel (press Q)
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

                // --- ARMOR MITIGATION ---
                // Body Armor
                if (pInv.items.has('armor')) {
                    const armor = pInv.items.get('armor')!;
                    // Flat reduction. Armor Value = Damage Reduction
                    const reduction = Math.floor(armor.damage * 0.5); // 50% effectiveness vs Raw Dmg? 
                    // Let's make it 1:1 for now but randomized?
                    // Tibia style: Arm absorbs between Min and Max.
                    // Let's do: Absorbs 0 to ArmorValue.
                    const absorbed = Math.floor(Math.random() * (armor.damage + 1));
                    damage -= absorbed;
                    if (absorbed > 0 && (ui as any).console) (ui as any).console.sendMessage(`Armor absorbed ${absorbed} dmg.`);
                }

                // Helmet
                if (pInv.items.has('head')) {
                    const helm = pInv.items.get('head')!;
                    const absorbed = Math.floor(Math.random() * (helm.damage + 1));
                    damage -= absorbed;
                }

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
                    // MANA SHIELD Logic
                    const status = world.getComponent(id, StatusEffect);
                    let manaShieldActive = false;
                    // Check active status (Needs iterable check if multiple statuses allowed, currently single)
                    // Current StatusEffect is single instance. We should probably allow list, but for now assumption: one status overrides.
                    // Wait, existing system assumes 1 status. If we want mana shield + poison, we need refactor.
                    // For now, let's assume 'mana_shield' overwrites others or we use a separate component?
                    // Let's use a separate logic: Mana Shield is usually a buff. StatusEffect is handled as single slot.
                    // FIX: Let's check 'utamo vita' spell effect which adds a unique component or status. 
                    // To avoid refactoring entire Status system, let's check a new component `ManaShield` or just rely on Status 'mana_shield'.
                    if (status && status.type === 'mana_shield') {
                        const pMana = world.getComponent(id, Mana);
                        if (pMana && pMana.current > 0) {
                            manaShieldActive = true;
                            if (pMana.current >= damage) {
                                pMana.current -= damage;
                                if ((ui as any).console) (ui as any).console.sendMessage(`Mana Shield absorbed ${damage} dmg.`);
                                spawnFloatingText(world, pPos.x, pPos.y, `-${damage}`, '#0000ff');
                                damage = 0; // Fully absorbed
                            } else {
                                damage -= pMana.current;
                                pMana.current = 0;
                                if ((ui as any).console) (ui as any).console.sendMessage(`Mana Shield broken!`);
                                world.removeComponent(id, StatusEffect); // Remove shield
                            }
                        }
                    }

                    if (damage > 0) {
                        pHealth.current = Math.max(0, pHealth.current - damage);
                        if ((ui as any).console) (ui as any).console.sendMessage(`Ouch! Took ${damage} dmg.`);

                        // Spatial audio: play hit sound from enemy position
                        audio.playSpatialSound('hit', ePos.x, ePos.y, pPos.x, pPos.y);

                        // Screen shake and blood effect when player takes damage
                        triggerScreenShake(world, 6, 0.2);
                        spawnBloodEffect(world, pPos.x, pPos.y);

                        const ft = world.createEntity();
                        world.addComponent(ft, new Position(pPos.x, pPos.y));
                        world.addComponent(ft, new Velocity(0, -20));
                        world.addComponent(ft, new FloatingText(`-${damage}`, '#f00'));
                        if (pHealth.current <= 0) {
                            if ((ui as any).console) (ui as any).console.addSystemMessage("YOU DIED!");
                            audio.playDeath();
                        }
                    }
                }
            }
        }
    }
}


// Draw Target Reticle

export function switchMap(world: World, type: 'overworld' | 'dungeon', dungeonType: 'fire' | 'ice' | 'water' | 'earth' | 'temple' | 'final' = 'temple', seed: number = 0) {
    // 1. Clear Entities (Preserve Player)
    const players = world.query([PlayerControllable]);
    if (players.length === 0) return;
    const playerEntity = players[0];

    // Remove all others
    const all = world.query([Position]);
    for (const id of all) {
        if (id !== playerEntity && !world.getComponent(id, PlayerControllable)) {
            world.removeEntity(id);
        }
    }

    // 2. Generate Map
    let mapData;
    if (type === 'overworld') {
        mapData = generateOverworld(256, 256, seed);
    } else {
        mapData = generateDungeon(64, 64, seed + Math.random(), dungeonType);
    }

    const mapEntity = world.query([TileMap])[0];
    if (mapEntity !== undefined) {
        // Update existing map component
        const map = world.getComponent(mapEntity, TileMap)!;
        map.width = mapData.width;
        map.height = mapData.height;
        map.tileSize = mapData.tileSize;
        map.data = mapData.data; // Replace array
    }

    // 3. Spawn Entities (from Map Data)
    for (const ent of mapData.entities) {
        if (ent.type === 'player') {
            // Teleport Player
            const pPos = world.getComponent(playerEntity, Position)!;
            pPos.x = ent.x;
            pPos.y = ent.y;

            // Reset Camera immediately to prevent flicker
            const cam = world.query([Camera])[0];
            if (cam) {
                const cPos = world.getComponent(cam, Camera)!;
                cPos.x = ent.x - 160;
                cPos.y = ent.y - 120;
            }
        } else if (ent.type === 'dungeon_entrance') {
            const portal = world.createEntity();
            world.addComponent(portal, new Position(ent.x, ent.y));
            world.addComponent(portal, new Sprite(77, 32));
            world.addComponent(portal, new DungeonEntrance(ent.dungeonType, ent.label));
            world.addComponent(portal, new Interactable(`Enter ${ent.label}`));
            world.addComponent(portal, new Name(ent.label));
        } else if (ent.type === 'dungeon_exit') {
            const portal = world.createEntity();
            world.addComponent(portal, new Position(ent.x, ent.y));
            world.addComponent(portal, new Sprite(77, 32));
            world.addComponent(portal, new DungeonExit(ent.label));
            world.addComponent(portal, new Interactable(ent.label));
            world.addComponent(portal, new Name(ent.label));
        } else if (ent.type === 'enemy') {
            createEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
        } else if (ent.type === 'fire_enemy') {
            createFireEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
        } else if (ent.type === 'ice_enemy') {
            createIceEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
        } else if (ent.type === 'water_enemy') {
            createWaterEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
        } else if (ent.type === 'earth_enemy') {
            createEarthEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
        } else if (ent.type === 'item') {
            createItem(world, ent.x, ent.y, ent.name, ent.slot, ent.uIndex, ent.damage);
        } else if (ent.type === 'static') {
            const s = world.createEntity();
            world.addComponent(s, new Position(ent.x, ent.y));
            world.addComponent(s, new Sprite(ent.sprite, ent.size));
        } else if (ent.type === 'boss') {
            if (ent.enemyType === 'hydra') {
                createWaterEnemy(world, ent.x, ent.y, 'hydra', 2.0);
            } else {
                createBoss(world, ent.x, ent.y);
            }
        }
    }
}

export function dungeonSystem(world: World, input: InputHandler, ui: UIManager) {
    if (!input.isJustPressed('Space')) return;

    const playerEntity = world.query([PlayerControllable, Position])[0];
    if (!playerEntity) return;

    const pos = world.getComponent(playerEntity, Position)!;

    // Find nearby Portals
    const entrances = world.query([DungeonEntrance, Position]);
    for (const id of entrances) {
        const pPos = world.getComponent(id, Position)!;
        const dx = (pos.x + 16) - (pPos.x + 16);
        const dy = (pos.y + 16) - (pPos.y + 16);
        if (Math.sqrt(dx * dx + dy * dy) < 50) {
            const entrance = world.getComponent(id, DungeonEntrance)!;

            // Check for Locked component
            const locked = world.getComponent(id, Locked);
            if (locked) {
                const inv = world.getComponent(playerEntity, Inventory);
                if (!inv) return;

                const missingKeys = [];
                for (const key of locked.keyIds) {
                    let found = false;
                    for (const [_, item] of inv.items) {
                        if (item.name === key) { found = true; break; }
                    }
                    if (!found) {
                        for (const item of inv.storage) {
                            if (item.name === key) { found = true; break; }
                        }
                    }
                    if (!found) missingKeys.push(key);
                }

                if (missingKeys.length > 0) {
                    ui.console?.addSystemMessage(locked.message);
                    return;
                } else {
                    ui.console?.addSystemMessage("The seal shatters!");
                    // Keep it open
                    world.removeComponent(id, Locked);
                }
            }

            if ((ui as any).console) (ui as any).console.addSystemMessage(`Entering ${entrance.label}...`);
            switchMap(world, 'dungeon', entrance.dungeonType as any, Date.now());
            return;
        }
    }

    const exits = world.query([DungeonExit, Position]);
    for (const id of exits) {
        const pPos = world.getComponent(id, Position)!;
        const dx = (pos.x + 16) - (pPos.x + 16);
        const dy = (pos.y + 16) - (pPos.y + 16);
        if (Math.sqrt(dx * dx + dy * dy) < 50) {
            if ((ui as any).console) (ui as any).console.addSystemMessage(`Leaving Dungeon...`);
            switchMap(world, 'overworld', 'temple', 1337);
            return;
        }
    }
}





export function createPlayer(world: World, x: number, y: number, input: InputHandler, vocationKey: string = 'knight') {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));

    // Set sprite based on vocation
    const vocationSpriteMap: Record<string, number> = {
        'knight': SPRITES.PLAYER,  // 0 - Knight in full armor
        'mage': SPRITES.MAGE,      // 1 - Blue wizard robes
        'ranger': SPRITES.RANGER,  // 2 - Green leather with bow
        'paladin': SPRITES.GUARD   // 5 - White/gold armor (use Guard sprite for now)
    };
    const spriteIndex = vocationSpriteMap[vocationKey] ?? SPRITES.PLAYER;
    world.addComponent(e, new Sprite(spriteIndex, 32));

    world.addComponent(e, new PlayerControllable());
    world.addComponent(e, new Inventory());
    world.addComponent(e, new Health(200, 200));
    world.addComponent(e, new Experience(0, 100, 1));
    world.addComponent(e, new Mana(50, 50));
    world.addComponent(e, new Facing(0, 1));
    world.addComponent(e, new QuestLog());
    // Lantern: Dimmer to avoid blinding
    world.addComponent(e, new LightSource(64, '#cc8844', true));

    // Magic System State
    world.addComponent(e, new ActiveSpell('adori flam')); // Default Fireball

    // RPG Depth
    const vocData = VOCATIONS[vocationKey] || VOCATIONS.knight;
    world.addComponent(e, new Skills());
    world.addComponent(e, new Passives()); // New Passive System
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

    // Collider: Body-sized collision box (smaller than sprite)
    world.addComponent(e, new Collider(20, 12, 6, 20)); // 20x12 box at bottom center

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
    } else if (type === "zombie") {
        world.addComponent(e, new Sprite(SPRITES.ZOMBIE, 32));
        world.addComponent(e, new AI(15)); // Very slow
        world.addComponent(e, new Health(25 * hpScale, 25 * hpScale)); // Weak
        world.addComponent(e, new Name("Zombie"));
    } else if (type === "slime") {
        world.addComponent(e, new Sprite(SPRITES.SLIME, 32));
        world.addComponent(e, new AI(25));
        world.addComponent(e, new Health(15 * hpScale, 15 * hpScale));
        world.addComponent(e, new Name("Slime"));
    } else if (type === "necromancer") {
        // BOSS
        world.addComponent(e, new Sprite(SPRITES.NECROMANCER, 32));
        world.addComponent(e, new AI(20)); // Caster logic
        world.addComponent(e, new Health(300 * hpScale, 300 * hpScale)); // Tanky
        world.addComponent(e, new Name("Necromancer"));
        // Make him bigger via scale? No component for that yet. 
        // Just rely on stats.
    } else if (type === "bear") {
        world.addComponent(e, new Sprite(SPRITES.BEAR, 32));
        world.addComponent(e, new AI(20)); // Slow
        world.addComponent(e, new Health(150 * hpScale, 150 * hpScale)); // Very Tanky
        world.addComponent(e, new Name("Bear"));
    } else if (type === "spider") {
        world.addComponent(e, new Sprite(SPRITES.SPIDER, 32));
        world.addComponent(e, new AI(60)); // Fast
        world.addComponent(e, new Health(40 * hpScale, 40 * hpScale));
        world.addComponent(e, new Name("Spider"));
    } else if (type === "bandit") {
        world.addComponent(e, new Sprite(SPRITES.BANDIT, 32));
        world.addComponent(e, new AI(40)); // Smart/Fast
        world.addComponent(e, new Health(60 * hpScale, 60 * hpScale));
        world.addComponent(e, new Name("Bandit"));
    } else if (type === "scorpion") {
        // Desert enemy - fast, poisonous
        world.addComponent(e, new Sprite(SPRITES.SCORPION, 32));
        world.addComponent(e, new AI(55)); // Fast
        world.addComponent(e, new Health(35 * hpScale, 35 * hpScale));
        world.addComponent(e, new Name("Scorpion"));
    } else if (type === "mummy") {
        // Desert enemy - slow, tanky, hits hard
        world.addComponent(e, new Sprite(SPRITES.MUMMY, 32));
        world.addComponent(e, new AI(18)); // Very slow
        world.addComponent(e, new Health(100 * hpScale, 100 * hpScale)); // Tanky
        world.addComponent(e, new Name("Mummy"));
    } else if (type === "scarab") {
        // Desert enemy - swarm enemy, fast, weak
        world.addComponent(e, new Sprite(SPRITES.SCARAB, 32));
        world.addComponent(e, new AI(65)); // Very fast
        world.addComponent(e, new Health(15 * hpScale, 15 * hpScale)); // Weak
        world.addComponent(e, new Name("Scarab"));
    } else {
        world.addComponent(e, new Sprite(SPRITES.ORC, 32));
        world.addComponent(e, new AI(30));
        world.addComponent(e, new Health(30 * hpScale, 30 * hpScale));
        world.addComponent(e, new Name("Orc"));
    }

    // Collider: Body-sized collision box for enemies
    world.addComponent(e, new Collider(20, 12, 6, 20)); // 20x12 box at bottom center

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


export function createIceEnemy(world: World, x: number, y: number, type: string = "ice_wolf", difficulty: number = 1.0) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));

    const hpScale = difficulty;

    if (type === "ice_wolf") {
        world.addComponent(e, new Sprite(SPRITES.ICE_WOLF, 32));
        world.addComponent(e, new AI(55)); // Fast
        world.addComponent(e, new Health(45 * hpScale, 45 * hpScale));
        world.addComponent(e, new Name("Ice Wolf"));
        world.addComponent(e, new StatusOnHit('bleed', 0.35, 6, 4));
    } else if (type === "frost_mage") {
        world.addComponent(e, new Sprite(SPRITES.FROST_MAGE, 32));
        world.addComponent(e, new AI(25)); // Slow caster
        world.addComponent(e, new Health(80 * hpScale, 80 * hpScale));
        world.addComponent(e, new Name("Frost Mage"));
        world.addComponent(e, new StatusOnHit('freeze', 0.6, 4, 50));
        // Drop Thunder Staff (Rare)
        world.addComponent(e, new Lootable([
            new Item('Ice Shard', 'currency', 101, 0, 5, 'Cold to the touch', 'none', 'common'),
            new Item('Thunder Staff', 'rhand', SPRITES.THUNDER_STAFF, 25, 600, 'Crackles with energy', 'staff', 'rare', 0, 0, 20, '#00ffff', 40)
        ]));
    } else if (type === "yeti") {
        // Boss-like enemy
        world.addComponent(e, new Sprite(SPRITES.YETI, 32));
        world.addComponent(e, new AI(18)); // Very slow
        world.addComponent(e, new Health(250 * hpScale, 250 * hpScale));
        world.addComponent(e, new Name("Yeti"));
        world.addComponent(e, new StatusOnHit('bleed', 0.5, 8, 8));

        // Boss Drops
        world.addComponent(e, new Lootable([
            new Item('Frost Helm', 'head', SPRITES.FROST_HELM, 0, 800, 'Icy protection', 'none', 'epic', 8, 0, 0, '#ccffff', 30),
            new Item('Ice Bow', 'rhand', SPRITES.ICE_BOW, 35, 700, 'Freezes enemies', 'bow', 'rare', 0, 0, 0, '#99ffff', 35)
        ]));
    }
    return e;
}

export function createWaterEnemy(world: World, x: number, y: number, type: string = "crab", difficulty: number = 1.0) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));

    const hpScale = difficulty;

    if (type === "crab") {
        world.addComponent(e, new Sprite(SPRITES.CRAB, 32));
        world.addComponent(e, new AI(20)); // Slow
        world.addComponent(e, new Health(60 * hpScale, 60 * hpScale)); // Tanky
        world.addComponent(e, new Name("Crab"));
        // Shell gives natural armor? (Maybe high health reflects this)
    } else if (type === "siren") {
        world.addComponent(e, new Sprite(SPRITES.SIREN, 32));
        world.addComponent(e, new AI(45)); // Fast shimmer
        world.addComponent(e, new Health(50 * hpScale, 50 * hpScale));
        world.addComponent(e, new Name("Siren"));
    } else if (type === "hydra") {
        world.addComponent(e, new Sprite(SPRITES.HYDRA, 32));
        world.addComponent(e, new AI(25));
        world.addComponent(e, new Health(300 * hpScale, 300 * hpScale)); // Boss HP
        world.addComponent(e, new Name("Hydra"));
        world.addComponent(e, new StatusOnHit('poison', 0.5, 5, 10)); // Venemous

        // Hydra Drops
        world.addComponent(e, new Lootable([
            new Item('Thunder Staff', 'rhand', SPRITES.THUNDER_STAFF, 25, 600, 'Crackles with energy', 'staff', 'rare', 0, 0, 20, '#00ffff', 40),
            new Item('Water Essence', 'currency', 100, 0, 50, 'Pure water energy', 'none', 'rare')
        ]));
    }
    return e;
}

export function createEarthEnemy(world: World, x: number, y: number, type: string = "golem", difficulty: number = 1.0) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));

    const hpScale = difficulty;

    if (type === "golem") {
        world.addComponent(e, new Sprite(SPRITES.GOLEM, 32));
        world.addComponent(e, new AI(15)); // Very slow
        world.addComponent(e, new Health(120 * hpScale, 120 * hpScale)); // Extremely Tanky
        world.addComponent(e, new Name("Golem"));
        // Golem Drops
        world.addComponent(e, new Lootable([
            new Item('Earth Essence', 'currency', 110, 0, 50, 'Solid earth energy', 'none', 'rare'),
            new Item('Obsidian Shard', 'currency', 103, 0, 15, 'Sharp black stone', 'none', 'common')
        ]));
        // TODO: Add 'Resistance' component later? for now just HP.
    } else if (type === "basilisk") {
        world.addComponent(e, new Sprite(SPRITES.BASILISK, 32));
        world.addComponent(e, new AI(45)); // Fast
        world.addComponent(e, new Health(60 * hpScale, 60 * hpScale));
        world.addComponent(e, new Name("Basilisk"));
        world.addComponent(e, new StatusOnHit('poison', 0.4, 4, 8));
    }
    return e;
}



export function createMerchant(world: World, x: number, y: number) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(SPRITES.NPC, 32));
    world.addComponent(e, new Interactable("Open Shop"));
    world.addComponent(e, new Name("Merchant"));
    const merch = new Merchant();

    // Basic Starter Items (Common only)

    // Potions
    merch.items.push(new Item('Health Potion', 'consumable', SPRITES.POTION, 0, 30, 'Restores 50 health', 'none', 'common'));
    merch.items.push(new Item('Mana Potion', 'consumable', SPRITES.MANA_POTION, 0, 40, 'Restores 30 mana', 'none', 'common'));

    // Basic Weapons
    merch.items.push(new Item('Wooden Sword', 'rhand', SPRITES.WOODEN_SWORD, 3, 10, 'Training weapon', 'sword', 'common'));
    merch.items.push(new Item('Wooden Club', 'rhand', SPRITES.CLUB, 4, 15, 'Heavy branch', 'club', 'common', 2, 0, 0));
    merch.items.push(new Item('Hand Axe', 'rhand', SPRITES.AXE, 7, 25, 'Woodcutter\'s tool', 'axe', 'common'));

    // Basic Armor
    merch.items.push(new Item('Wooden Shield', 'lhand', SPRITES.WOODEN_SHIELD, 0, 20, 'Simple plank shield', 'none', 'common', 3, 0, 0));
    merch.items.push(new Item('Leather Armor', 'body', SPRITES.ARMOR, 0, 50, 'Basic protection', 'none', 'uncommon', 6, 0, 0));

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

export function createFireEnemy(world: World, x: number, y: number, type: string = "scorpion", difficulty: number = 1.0) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));

    const hpScale = difficulty;

    if (type === "scorpion") {
        world.addComponent(e, new Sprite(SPRITES.SCORPION, 32));
        world.addComponent(e, new AI(55)); // Fast
        world.addComponent(e, new Health(30 * hpScale, 30 * hpScale));
        world.addComponent(e, new Name("Scorpion"));
        world.addComponent(e, new StatusOnHit('poison', 0.5, 4, 6));
    } else if (type === "mummy") {
        world.addComponent(e, new Sprite(SPRITES.MUMMY, 32));
        world.addComponent(e, new AI(20)); // Slow
        world.addComponent(e, new Health(80 * hpScale, 80 * hpScale));
        world.addComponent(e, new Name("Mummy"));
        world.addComponent(e, new StatusOnHit('curse', 0.2, 5, 20)); // Curses reduce damage dealt? (Not impl yet)
    } else if (type === "spider") {
        world.addComponent(e, new Sprite(SPRITES.SPIDER, 32));
        world.addComponent(e, new AI(45));
        world.addComponent(e, new Health(35 * hpScale, 35 * hpScale));
        world.addComponent(e, new Name("Spider"));
        world.addComponent(e, new StatusOnHit('slow', 0.4, 3, 2)); // Webs
        world.addComponent(e, new Lootable([
            new Item('Spider Silk', 'currency', 102, 0, 5, 'Sticky silk', 'none', 'common')
        ]));
    } else if (type === "fire_guardian") {
        // BOSS
        world.addComponent(e, new Sprite(SPRITES.SCORPION, 48)); // Re-use Scorpion
        world.addComponent(e, new AI(35));
        world.addComponent(e, new Health(250 * hpScale, 250 * hpScale));
        world.addComponent(e, new Name("Fire Guardian"));
        world.addComponent(e, new StatusOnHit('burn', 0.5, 6, 20));

        // Boss Drops
        world.addComponent(e, new Lootable([
            new Item('Magma Armor', 'armor', SPRITES.MAGMA_ARMOR, 0, 800, 'Forged in fire', 'none', 'epic', 10, 0, 0, '#ff4400', 50),
            new Item('Fire Sword', 'rhand', SPRITES.FIRE_SWORD, 30, 700, 'Burns on contact', 'sword', 'rare', 0, 0, 0, '#ffaa00', 40)
        ]));
    }
    return e;
}

export function createFinalBoss(world: World, x: number, y: number) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    world.addComponent(e, new Sprite(SPRITES.NECROMANCER, 64)); // Giant Necromancer
    world.addComponent(e, new AI(45)); // Fast
    world.addComponent(e, new Health(1000, 1000));
    world.addComponent(e, new Name("Void Bringer"));
    world.addComponent(e, new StatusOnHit('curse', 1.0, 10, 50)); // High damage curse
    return e;
}

export function createSealedGate(world: World, x: number, y: number) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(98, 32)); // Use a Gate/Door sprite (98 is placeholder, check assets)
    world.addComponent(e, new Name("Sealed Gate"));
    world.addComponent(e, new Interactable("Inspect Gate"));
    world.addComponent(e, new DungeonEntrance('final', "Final Arena"));
    world.addComponent(e, new Locked(['Water Essence', 'Ice Essence', 'Fire Essence', 'Earth Essence'], "The gate is sealed by 4 Elemental Essences."));
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

export function consumeItem(world: World, entity: number, item: Item, audio: AudioController, ui: UIManager) {
    const hp = world.getComponent(entity, Health);
    const mana = world.getComponent(entity, Mana);

    let consumed = false;

    if (item.name === "Health Potion") {
        if (hp) {
            const old = hp.current;
            hp.current = Math.min(hp.max, hp.current + 50);
            if (ui.console) ui.console.sendMessage(`You drank a Health Potion (+${hp.current - old} HP).`);
            audio.playLevelUp();
            consumed = true;
        }
    } else if (item.name === "Mana Potion") {
        if (mana) {
            const old = mana.current;
            mana.current = Math.min(mana.max, mana.current + 50);
            if (ui.console) ui.console.sendMessage(`You drank a Mana Potion (+${mana.current - old} MP).`);
            audio.playLevelUp();
            consumed = true;
        }
    }

    return consumed;
}

export function safeZoneRegenSystem(world: World, dt: number, ui: UIManager) {
    const playerEntity = world.query([PlayerControllable, Position, Health, Mana])[0];
    if (playerEntity === undefined) return;

    const pos = world.getComponent(playerEntity, Position)!;
    const hp = world.getComponent(playerEntity, Health)!;
    const mana = world.getComponent(playerEntity, Mana)!;

    // Check Safe Zone (Village Center ~ 100,100 from original spawn, or dynamic)
    // Map Gen Spawn is at 100, 100 usually.
    // Let's say Safe Radius = 200.
    const dist = Math.sqrt(Math.pow(pos.x - 100, 2) + Math.pow(pos.y - 100, 2));

    if (dist < 200) {
        // Regen
        // 10 HP/sec => 10 * dt
        hp.current = Math.min(hp.max, hp.current + (20 * dt)); // Fast Regen
        mana.current = Math.min(mana.max, mana.current + (20 * dt));

        // Visual indicator? (Maybe too noisy)
        // Only if not full
        if (Math.random() < 0.05 && (hp.current < hp.max || mana.current < mana.max)) {
            // Occasional sparkles
            const p = world.createEntity();
            world.addComponent(p, new Position(pos.x, pos.y - 10));
            world.addComponent(p, new Velocity(0, -10));
            world.addComponent(p, new FloatingText("+", '#00ff00'));
        }
    }
}

export function deathSystem(world: World, ui: UIManager, spawnX: number = 100, spawnY: number = 100) {
    const healths = world.query([Health]);
    for (const id of healths) {
        const hp = world.getComponent(id, Health)!;
        if (hp.current <= 0) {
            // Player Death
            const isPlayer = world.getComponent(id, PlayerControllable);
            if (isPlayer) {
                if ((ui as any).console) (ui as any).console.addSystemMessage("You have died! Respawning at village...");
                hp.current = hp.max;
                const pos = world.getComponent(id, Position);
                if (pos) {
                    pos.x = spawnX;
                    pos.y = spawnY;
                }
                const mana = world.getComponent(id, Mana);
                if (mana) mana.current = mana.max;
                continue;
            }

            // NPC/Enemy Death (Fallback)
            const name = world.getComponent(id, Name);
            if (name) {
                world.removeEntity(id);
            }
        }
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
        if (mana.current >= 30) {
            mana.current -= 30;
            const magicLevel = skills ? skills.magic.level : 0;
            // Scale with Magic Level
            const healAmount = 50 + (magicLevel * 10);

            hp.current = Math.min(hp.current + healAmount, hp.max);

            spawnFloatingText(world, pos.x, pos.y, `+${healAmount}`, '#00ff00');
            world.addComponent(world.createEntity(), new Position(pos.x, pos.y)); // Particle effect source?

            if (console) console.addSystemMessage("exura!");
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
        // ADORI FLAM: Fireball
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

            // New Scaling: Magic Level Primary
            const magicLevel = skills ? skills.magic.level : 0;
            const dmg = 30 + (magicLevel * 5); // 5 DMG per Magic Level
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

            // New Scaling: Magic Level Primary
            const magicLevel = skills ? skills.magic.level : 0;
            const dmg = 20 + (magicLevel * 4);
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
                        const nameComp = world.getComponent(closestId, Name);
                        const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
                        const loot = generateLoot(enemyType);
                        createCorpse(world, ePos.x, ePos.y, loot);
                        world.removeEntity(closestId);
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

    } else if (spellKey === 'exeta res') {
        // CHALLENGE (Knight Only) - Taunt
        if (!canCast(['knight'])) return;
        if (mana.current >= 30) {
            mana.current -= 30;
            spawnFloatingText(world, pos.x, pos.y, "CHALLENGE!", '#ff0000');
            const shake = world.createEntity();
            world.addComponent(shake, new ScreenShake(0.2, 2));

            const enemies = world.query([AI, Position]);
            let pulled = 0;
            for (const eId of enemies) {
                const ePos = world.getComponent(eId, Position)!;
                const dx = ePos.x - pos.x;
                const dy = ePos.y - pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 160) { // Screen radius
                    // Force AI to target player (simplistic 'aggro' reset)
                    // In our AI, we rely on dist to 'center' or player. 
                    // Let's force Velocity towards player immediately to simulate 'pull'
                    const vel = world.getComponent(eId, Velocity);
                    if (vel) {
                        vel.x = -dx * 2; // Pull IN
                        vel.y = -dy * 2;
                    }
                    spawnFloatingText(world, ePos.x, ePos.y - 16, "!", '#ff0000');
                    pulled++;
                }
            }
            if (console) console.addSystemMessage(`exeta res: ${pulled} enemies challenged.`);
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
        }

    } else if (spellKey === 'utamo vita') {
        // MANA SHIELD (Mage Only)
        if (!canCast(['mage'])) return;
        if (mana.current >= 50) {
            mana.current -= 50;
            // Add Status Effect 'mana_shield' for 60 seconds
            // Requires existing Status logic to support this type or we just add the component
            // Since our combatSystem check looks for StatusEffect with type 'mana_shield', this works.
            const status = world.getComponent(playerEntity, StatusEffect);
            if (status) world.removeComponent(playerEntity, StatusEffect);
            world.addComponent(playerEntity, new StatusEffect('mana_shield', 60.0));

            spawnFloatingText(world, pos.x, pos.y, "Mana Shield", '#0000ff');
            if (console) console.addSystemMessage("utamo vita: Magic protects you.");
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
        }

    } else if (spellKey === 'exevo gran mas frigo') {
        // ETERNAL WINTER (Mage Ultimate)
        if (!canCast(['mage'])) return;
        if (mana.current >= 120) {
            mana.current -= 120;
            const shake = world.createEntity();
            world.addComponent(shake, new ScreenShake(0.5, 5)); // Heavy shake

            spawnFloatingText(world, pos.x, pos.y, "ETERNAL WINTER", '#00ffff');

            const enemies = world.query([Health, Position]);
            let frozen = 0;
            for (const eId of enemies) {
                if (world.getComponent(eId, PlayerControllable)) continue;
                const ePos = world.getComponent(eId, Position)!;
                const dx = ePos.x - pos.x;
                const dy = ePos.y - pos.y;
                if (Math.abs(dx) < 120 && Math.abs(dy) < 120) { // Large AoE
                    const eHp = world.getComponent(eId, Health)!;
                    const magicLevel = skills ? skills.magic.level : 1;
                    const dmg = 80 + (magicLevel * 6);
                    eHp.current -= dmg;
                    spawnFloatingText(world, ePos.x, ePos.y, `${dmg}`, '#00ffff');

                    // Apply Freeze
                    const status = world.getComponent(eId, StatusEffect);
                    if (status) world.removeComponent(eId, StatusEffect);
                    world.addComponent(eId, new StatusEffect('frozen', 4.0)); // 4s Freeze
                    frozen++;

                    if (eHp.current <= 0) {
                        const nameComp = world.getComponent(eId, Name);
                        const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
                        const loot = generateLoot(enemyType);
                        createCorpse(world, ePos.x, ePos.y, loot);
                        world.removeEntity(eId);
                    }
                }
            }
            if (console) console.addSystemMessage(`exevo gran mas frigo: Frozen ${frozen} enemies.`);
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
        }

    } else if (spellKey === 'exura san') {
        // SALVATION (Paladin Healing)
        if (!canCast(['paladin', 'ranger'])) return; // Paladin spell, mostly
        if (mana.current >= 60) {
            mana.current -= 60;
            const magicLevel = skills ? skills.magic.level : 1;
            // Paladin heals based on Magic Level + Level?
            // Let's scale heavily with Magic
            const heal = 80 + (magicLevel * 8);
            hp.current = Math.min(hp.current + heal, hp.max);
            spawnFloatingText(world, pos.x, pos.y, `+${heal}`, '#ffff00');
            if (console) console.addSystemMessage("exura san!");
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
        }

    } else if (spellKey === 'exori san') {
        // DIVINE CALDERA / HOLY SMITE (Paladin Logic)
        // Ranged Holy Attack
        if (!canCast(['paladin'])) return;
        if (mana.current >= 40) {
            mana.current -= 40;
            const pId = world.createEntity();
            world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));

            const targetComp = world.getComponent(playerEntity, Target);
            let vx = facing.x * 250;
            let vy = facing.y * 250;

            // Auto-Aim
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
            world.addComponent(pId, new Sprite(SPRITES.SPARKLE, 8)); // Holy sparkle
            const magicLevel = skills ? skills.magic.level : 1;
            const distSkill = skills ? skills.distance.level : 10;
            // Paladin Formula: Dist + Magic
            const dmg = 40 + (distSkill * 2) + (magicLevel * 3);
            world.addComponent(pId, new Projectile(dmg, 0.8, 'player_holy'));

            if (console) console.addSystemMessage("exori san!");
        } else {
            if (console) console.addSystemMessage("Not enough Mana!");
        }
    }
}

export function spawnFloatingText(world: World, x: number, y: number, text: string, color: string) {
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
    // const maxHP = hp.max; // Removed duplicate
    const curMana = mana ? mana.current : 0;
    const maxMana = mana ? mana.max : 0;
    const curCap = inv ? inv.cap : 0;
    const curGold = inv ? inv.gold : 0;
    ui.updateStatus(curHP, maxHP, curMana, maxMana, curCap, curGold, curLevel, curXP, nextXP, skills);
}

export function updateStatsFromPassives(world: World, playerEntity: number) {
    const passives = world.getComponent(playerEntity, Passives);
    const hp = world.getComponent(playerEntity, Health);
    const mana = world.getComponent(playerEntity, Mana);
    const voc = world.getComponent(playerEntity, Vocation);
    // const speed = world.getComponent(playerEntity, Speed); // If we had Speed component

    if (!hp || !mana || !voc) return;

    // Base Stats based on Vocation + Level (Assuming start is level 1)
    // Actually, persistence saves MaxHP/MaxMana directly, but we should recalculate max to be safe/dynamic.
    // For now, let's just ADD the passive bonus to the base? 
    // Or better: Let Vocation define Base, and this adds on top.

    // Simplest approach for "Add on Upgrade":
    // But if we load game, we need to know if bonus was already applied?
    // Safer to recalculate Total Max from scratch:
    // TotalMax = Base(Voc) + (Level * VocGain) + (Passive * Bonus)
    // But we don't track "Level" easily inside Health component. We have Experience.level.

    const xp = world.getComponent(playerEntity, Experience);
    const level = (xp && !isNaN(xp.level)) ? xp.level : 1;

    const vocKey = (voc && voc.name) ? voc.name.toLowerCase() : 'knight';
    const vocData = VOCATIONS[vocKey] || VOCATIONS['knight'];

    const startHp = vocData.startHp;
    const startMana = vocData.startMana;
    // hpGain/manaGain are on the component instance (if modified/custom) or we could use vocData
    const hpGain = (voc && voc.hpGain) ? voc.hpGain : vocData.hpGain;
    const manaGain = (voc && voc.manaGain) ? voc.manaGain : vocData.manaGain;

    const baseHp = startHp + ((level - 1) * hpGain);
    const baseMana = startMana + ((level - 1) * manaGain);

    const bonusHp = (passives && !isNaN(passives.vitality)) ? (passives.vitality * 10) : 0;
    const bonusMana = (passives && !isNaN(passives.spirit)) ? (passives.spirit * 10) : 0;

    hp.max = Math.floor(baseHp + bonusHp);
    mana.max = Math.floor(baseMana + bonusMana);

    // Repair Logic: Fix Corrupted / NaN current values
    if (isNaN(hp.current) || hp.current === null || hp.current === undefined) {
        hp.current = hp.max;
    }
    if (isNaN(mana.current) || mana.current === null || mana.current === undefined) {
        mana.current = mana.max;
    }
}

// Predefined Items Database - Each item has FIXED stats and rarity
const ITEM_DB = {
    // --- CONSUMABLES ---
    wolfMeat: new Item('Wolf Meat', 'consumable', SPRITES.MEAT, 0, 5, 'Raw meat', 'none', 'common'),
    rottenFlesh: new Item('Rotten Flesh', 'consumable', SPRITES.ROTTEN_MEAT, 0, 2, 'Disgusting', 'none', 'common'),
    healthPotion: new Item('Health Potion', 'consumable', SPRITES.POTION, 0, 30, 'Restores 50 health', 'none', 'common'),
    manaPotion: new Item('Mana Potion', 'consumable', SPRITES.POTION, 0, 40, 'Restores 30 mana', 'none', 'common'),

    // --- ARMOR ---
    leatherArmor: new Item('Leather Armor', 'body', SPRITES.ARMOR, 0, 50, 'Basic protection', 'none', 'uncommon', 6, 0, 0),
    wolfPelt: new Item('Wolf Pelt', 'body', SPRITES.ARMOR, 0, 15, 'Warm fur armor', 'none', 'common', 3, 0, 0),
    orcArmor: new Item('Orc Armor', 'body', SPRITES.ARMOR, 0, 100, 'Crude but sturdy', 'none', 'rare', 10, 15, 0),
    plateArmor: new Item('Plate Armor', 'body', SPRITES.ARMOR, 0, 400, 'Heavy knight armor', 'none', 'epic', 20, 30, 0),
    skullHelm: new Item('Skull Helm', 'head', SPRITES.ARMOR, 0, 35, 'Creepy but effective', 'none', 'uncommon', 5, 0, 0),
    crownOfKings: new Item('Crown of Kings', 'head', SPRITES.ARMOR, 0, 800, 'Worn by legends', 'none', 'legendary', 10, 100, 50),
    orcShield: new Item('Orc Shield', 'lhand', SPRITES.WOODEN_SHIELD, 0, 70, 'Battered shield', 'none', 'rare', 8, 0, 0),
    dragonShield: new Item('Dragon Shield', 'lhand', SPRITES.WOODEN_SHIELD, 0, 350, 'Scales of a dragon', 'none', 'epic', 15, 20, 10),

    // --- WEAPONS: SWORDS (Balanced Dmg/Spd) ---
    // Common
    rustySword: new Item('Rusty Sword', 'rhand', SPRITES.SWORD, 5, 10, 'Old and dull', 'sword', 'common'),
    woodenSword: new Item('Wooden Sword', 'rhand', SPRITES.WOODEN_SWORD, 3, 5, 'Training weapon', 'sword', 'common'),
    // Uncommon
    ironSword: new Item('Iron Sword', 'rhand', SPRITES.SWORD, 12, 40, 'Standard soldier blade', 'sword', 'uncommon'),
    boneSword: new Item('Bone Sword', 'rhand', SPRITES.WOODEN_SWORD, 10, 25, 'Sharpened bone', 'sword', 'uncommon'),
    // Rare
    steelSword: new Item('Steel Sword', 'rhand', SPRITES.SWORD, 20, 120, 'Finely crafted', 'sword', 'rare'),
    // Epic
    demonBlade: new Item('Demon Blade', 'rhand', SPRITES.SWORD, 35, 300, 'Burns with hellfire', 'sword', 'epic', 0, 0, 20),
    // Legendary
    nobleSword: new Item('Noble Sword', 'rhand', SPRITES.NOBLE_SWORD, 50, 500, 'Hero\'s weapon', 'sword', 'legendary', 5, 50, 20),

    // --- WEAPONS: AXES (High Dmg, Low Def) ---
    // Common
    handAxe: new Item('Hand Axe', 'rhand', SPRITES.AXE, 7, 15, 'Woodcutter\'s tool', 'axe', 'common'),
    // Uncommon
    battleAxe: new Item('Battle Axe', 'rhand', SPRITES.AXE, 16, 50, 'Heavy chopper', 'axe', 'uncommon'),
    orcAxe: new Item('Orc Axe', 'rhand', SPRITES.AXE, 18, 80, 'Brutal weapon', 'axe', 'rare'),
    // Rare
    warAxe: new Item('War Axe', 'rhand', SPRITES.AXE, 28, 150, 'Crushes armor', 'axe', 'rare'),
    // Epic
    executionerAxe: new Item('Executioner Axe', 'rhand', SPRITES.AXE, 45, 350, 'Decapitating force', 'axe', 'epic'),

    // --- WEAPONS: CLUBS (Modest Dmg, +Defense) ---
    // Common
    woodenClub: new Item('Wooden Club', 'rhand', SPRITES.CLUB, 4, 8, 'Heavy branch', 'club', 'common', 2, 0, 0),
    // Uncommon
    mace: new Item('Iron Mace', 'rhand', SPRITES.CLUB, 10, 45, 'Spiked bludgeon', 'club', 'uncommon', 4, 0, 0),
    // Rare
    warhammer: new Item('Warhammer', 'rhand', SPRITES.CLUB, 18, 130, 'Heavy impact', 'club', 'rare', 8, 0, 0),
    // Epic
    morningStar: new Item('Morning Star', 'rhand', SPRITES.CLUB, 30, 320, 'Crushes skulls', 'club', 'epic', 12, 0, 0),

    // --- DEEP FOREST ITEMS ---
    bearFur: new Item('Bear Fur', 'body', SPRITES.ARMOR, 0, 80, 'Thick and warm', 'none', 'uncommon', 5, 20, 0),
    spiderSilk: new Item('Spider Silk', 'consumable', SPRITES.WEB, 0, 15, 'Strong sticky thread', 'none', 'common'),
    venomDagger: new Item('Venom Dagger', 'rhand', SPRITES.SWORD, 14, 150, 'Drips with poison', 'sword', 'rare'), // TODO: Add poison logic
    banditHood: new Item('Bandit Hood', 'head', SPRITES.ARMOR, 0, 60, 'Hides your face', 'none', 'uncommon', 3, 0, 0)
};

// Enemy drop tables - defines which items each enemy can drop and their chances
const DROP_TABLES: Record<string, { item: Item, chance: number }[]> = {
    wolf: [
        { item: ITEM_DB.wolfMeat, chance: 0.30 },
        { item: ITEM_DB.wolfPelt, chance: 0.15 },
    ],
    skeleton: [
        { item: ITEM_DB.boneSword, chance: 0.10 },
        { item: ITEM_DB.woodenClub, chance: 0.15 }, // Clubs for skeles
        { item: ITEM_DB.skullHelm, chance: 0.08 },
        { item: ITEM_DB.healthPotion, chance: 0.20 },
    ],
    orc: [
        { item: ITEM_DB.orcAxe, chance: 0.08 }, // Orcs love axes
        { item: ITEM_DB.mace, chance: 0.05 },
        { item: ITEM_DB.orcArmor, chance: 0.03 },
        { item: ITEM_DB.orcShield, chance: 0.04 },
        { item: ITEM_DB.healthPotion, chance: 0.15 },
    ],
    zombie: [
        { item: ITEM_DB.rottenFlesh, chance: 0.40 },
        { item: ITEM_DB.rustySword, chance: 0.10 },
        { item: ITEM_DB.handAxe, chance: 0.08 },
    ],
    // --- DEEP FOREST ENEMIES ---
    bear: [
        { item: ITEM_DB.bearFur, chance: 0.40 },
        { item: ITEM_DB.wolfMeat, chance: 0.50 }, // Bears have meat too
    ],
    spider: [
        { item: ITEM_DB.spiderSilk, chance: 0.60 },
        { item: ITEM_DB.venomDagger, chance: 0.05 }, // Rare drop
    ],
    bandit: [
        { item: ITEM_DB.banditHood, chance: 0.15 },
        { item: ITEM_DB.leatherArmor, chance: 0.10 },
        { item: ITEM_DB.ironSword, chance: 0.10 },
        { item: ITEM_DB.ironSword, chance: 0.10 },
        { item: ITEM_DB.healthPotion, chance: 0.25 },
    ],
    crypt_keeper: [
        { item: ITEM_DB.boneSword, chance: 0.50 },
        { item: ITEM_DB.skullHelm, chance: 0.30 },
        { item: ITEM_DB.manaPotion, chance: 0.40 },
    ],
    necromancer: [
        { item: ITEM_DB.skullHelm, chance: 0.20 },
        { item: ITEM_DB.boneSword, chance: 0.30 },
        { item: ITEM_DB.manaPotion, chance: 0.50 },
        { item: ITEM_DB.demonBlade, chance: 0.05 }, // Epic drop
    ],
    // --- BOSSES ---
    warlord: [
        { item: ITEM_DB.nobleSword, chance: 1.0 }, // Guaranteed!
        { item: ITEM_DB.plateArmor, chance: 0.50 },
        { item: ITEM_DB.executionerAxe, chance: 0.30 },
    ],
    boss: [
        { item: ITEM_DB.demonBlade, chance: 0.80 },
        { item: ITEM_DB.dragonShield, chance: 0.50 },
        { item: ITEM_DB.crownOfKings, chance: 0.20 },
        { item: ITEM_DB.morningStar, chance: 0.40 },
    ],
};

export function generateLoot(enemyType: string = "orc"): Item[] {
    const items: Item[] = [];

    // Gold drop (50% chance, amount varies by enemy)
    if (Math.random() < 0.5) {
        const baseGold = enemyType === 'wolf' ? 5 :
            enemyType === 'skeleton' ? 10 :
                enemyType === 'orc' ? 20 :
                    enemyType.includes('warlord') ? 100 :
                        enemyType.includes('boss') ? 200 : 15;
        const gold = Math.floor(baseGold * (0.5 + Math.random()));
        items.push(new Item('currency', 'Gold Coin', SPRITES.COIN, gold));
    }

    // Get drop table for this enemy type
    let dropTable = DROP_TABLES[enemyType];

    // Check for boss/warlord in name
    if (!dropTable && enemyType.includes('warlord')) dropTable = DROP_TABLES['warlord'];
    if (!dropTable && enemyType.includes('boss')) dropTable = DROP_TABLES['boss'];
    if (!dropTable) dropTable = DROP_TABLES['orc']; // Fallback

    // Roll for each item in the drop table
    for (const drop of dropTable) {
        if (Math.random() < drop.chance) {
            // Clone the item so each drop is a new instance
            const item = new Item(
                drop.item.slot,
                drop.item.name,
                drop.item.uIndex,
                drop.item.damage,
                drop.item.price,
                drop.item.description,
                drop.item.weaponType,
                drop.item.rarity,
                drop.item.defense,
                drop.item.bonusHp,
                drop.item.bonusMana
            );
            items.push(item);
        }
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
        // Use a slightly darker overlay for better contrast if needed
        // ctx.globalAlpha = 1.1; // Not valid
        ctx.drawImage(lightCanvas, 0, 0);
        ctx.restore();
    }

    // 4. Draw Colored Glows (Additive Pass on Main)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.6; // Increased from 0.4 for more "wow" factor
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

export function equipmentLightSystem(world: World) {
    const players = world.query([PlayerControllable, Inventory]);
    for (const playerEntity of players) {
        const inv = world.getComponent(playerEntity, Inventory)!;

        // Find best light source from equipped items
        let bestColor: string | null = null;
        let maxRadius = 0;

        for (const [_, item] of inv.items) {
            if (item.glowColor) {
                if (item.glowRadius > maxRadius) {
                    maxRadius = item.glowRadius;
                    bestColor = item.glowColor;
                }
            }
        }

        const light = world.getComponent(playerEntity, LightSource);
        if (bestColor) {
            if (light) {
                light.color = bestColor;
                light.radius = maxRadius;
                light.flickers = true;
            } else {
                world.addComponent(playerEntity, new LightSource(maxRadius, bestColor, true));
            }
        } else {
            // No glowing gear - if we have a light, reset it to dim or remove if specific
            if (light && (light.color !== '#ffffff' || light.radius > 32)) {
                light.radius = 32;
                light.color = '#ffffff';
                light.flickers = false;
            }
        }
    }
}



export function createCorpse(world: World, x: number, y: number, loot: Item[] = []) {
    // Spawn death particles (blood/smoke burst)
    for (let i = 0; i < 12; i++) {
        const p = world.createEntity();
        world.addComponent(p, new Position(x + 16, y + 16)); // Center of sprite
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 80 + 40;
        const life = Math.random() * 0.4 + 0.2;
        const colors = ['#a00', '#800', '#600', '#400', '#300'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        world.addComponent(p, new Particle(life, life, color, Math.random() * 3 + 2, Math.cos(angle) * speed, Math.sin(angle) * speed - 30));
    }

    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    // Use BONES sprite (22)
    world.addComponent(e, new Sprite(SPRITES.BONES || 22, 16));
    world.addComponent(e, new Decay(30000)); // 30s decay
    world.addComponent(e, new Interactable("Loot Corpse"));
    if (loot.length > 0) {
        world.addComponent(e, new Lootable(loot));

        // If any item glows, make the corpse glow
        const glowingItem = loot.find(item => item.glowColor);
        if (glowingItem) {
            world.addComponent(e, new LightSource(glowingItem.glowRadius || 40, glowingItem.glowColor!, true));
        }
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

export function uiControlSystem(world: World, input: InputHandler, ui: UIManager) {
    if (input.isJustPressed('KeyEscape')) {
        console.log("ESC Pressed - Closing UI");

        // Hide All Panels
        ui.shopPanel.classList.add('hidden');
        ui.bagPanel.classList.add('hidden');
        ui.lootPanel.classList.add('hidden');

        // Reset State
        ui.currentMerchant = null;
        ui.activeMerchantId = null;
        ui.activeLootEntityId = null;

        // Close Inspection
        const inspectPanel = document.getElementById('inspect-panel');
        if (inspectPanel) inspectPanel.classList.add('hidden');
    }
}
