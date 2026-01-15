import { World, Entity, InputHandler } from './engine';
import { PHYSICS } from './physics';
import { UIManager } from './client/ui_manager';
import { PixelRenderer } from './client/renderer';
import { WorldMap } from './core/map';
import { TILE_SIZE } from './core/types';
import { AudioController } from './audio';
import { ItemRegistry } from './data/items';

// --- Components (Re-exported from separate file) ---
// --- Components (Re-exported from separate file) ---
export * from './components';
export * from './assets';
import { SPRITES } from './constants';
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
import { SPELLS, findSpellByWords, SpellDefinition } from './data/spells';
import { MOB_REGISTRY } from './data/mobs';
import { LOOT_TABLES } from './data/loot_tables';

// Debug flag to visualize collision boxes
export const DEBUG_COLLIDERS = true;

// Debug flag to show AI state names above enemies
// Debug flag to show AI state names above enemies
export const DEBUG_AI_STATES = true;

export const TEMPLE_POS = { x: 25 * 32, y: 25 * 32 }; // Default Temple Position (Center of 50x50 map)

// --- Components: Dialogue ---
export class Dialogue {
    constructor(
        public lines: string[] = [],
        public currentLine: number = 0,
        public name: string = "Unknown"
    ) { }
}

// --- Systems ---

// --- Systems ---

let lastAttackTime = 0;

export function attemptCastSpell(world: World, player: Entity, text: string, ui: UIManager): boolean {
    const spell = findSpellByWords(text);
    if (!spell) return false; // Not a spell

    // Check Cooldown / Global CD
    // For now, assume cooldown handled by "mana regen" pace or global timer
    // Todo: Add spell cooldowns

    // Check Mana
    const mana = world.getComponent(player, Mana);
    if (!mana || mana.current < spell.mana) {
        if ((ui as any).console) (ui as any).console.addSystemMessage("Not enough mana.");
        return true; // It WAS a spell command, just failed
    }

    // Cast!
    mana.current -= spell.mana;
    const pPos = world.getComponent(player, Position)!;

    // Apply Effect
    switch (spell.effect) {
        case 'heal':
            const hp = world.getComponent(player, Health);
            if (hp) {
                hp.current = Math.min(hp.max, hp.current + spell.power);
                spawnFloatingText(world, pPos.x, pPos.y, `+${spell.power}`, "#5f5");
                spawnParticle(world, pPos.x, pPos.y, '#5f5');
            }
            break;
        case 'haste':
            const passive = world.getComponent(player, Passives);
            if (passive) {
                // Temporary Haste? 
                // We need a StatusEffect component.
                world.addComponent(player, new StatusEffect('haste', 10.0, spell.power)); // 10s duration
                spawnFloatingText(world, pPos.x, pPos.y, "Haste!", "#ff5");
            }
            break;
        case 'damage_aoe':
            // Exori
            const enemies = world.query([Health, Position, Name]); // Only named enemies
            let hitCount = 0;
            for (const eid of enemies) {
                if (world.getComponent(eid, PlayerControllable)) continue;
                const ePos = world.getComponent(eid, Position)!;
                const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
                if (dist < 50) { // AoE Range
                    const eHp = world.getComponent(eid, Health)!;
                    eHp.current -= spell.power;
                    spawnFloatingText(world, ePos.x, ePos.y, `${spell.power}`, "#f55");
                    spawnBloodEffect(world, ePos.x, ePos.y); // reuse
                    hitCount++;
                    if (eHp.current <= 0) {
                        // Kill logic (reuse deathSystem or flag dead?)
                        // deathSystem will cleanup
                    }
                }
            }
            if (hitCount === 0) {
                if ((ui as any).console) (ui as any).console.addSystemMessage("No target for Exori.");
            }
            spawnParticle(world, pPos.x, pPos.y, '#f33');
            break;
        case 'create_food':
            // Drop Food
            createItem(world, pPos.x, pPos.y, createItemFromRegistry(SPRITES.BARREL)); // Mushroom?
            break;
    }

    if ((ui as any).console) (ui as any).console.addSystemMessage(`Cast ${spell.name}.`);
    return true;
}

export function teleportSystem(world: World, ui: UIManager) {
    const player = world.query([PlayerControllable, Position])[0];
    if (player === undefined) return;
    const pPos = world.getComponent(player, Position)!;

    // Check overlaps with Teleporters
    const teleporters = world.query([Teleporter, Position]);
    for (const tid of teleporters) {
        const tPos = world.getComponent(tid, Position)!;
        const dest = world.getComponent(tid, Teleporter)!;

        // Simple Box Collision (Player 32x32 vs Teleporter 32x32)
        // Shrink player box slightly to avoid accidental triggers
        const pad = 10;
        if (pPos.x + pad < tPos.x + 32 &&
            pPos.x + 32 - pad > tPos.x &&
            pPos.y + pad < tPos.y + 32 &&
            pPos.y + 32 - pad > tPos.y) {

            // Teleport!
            console.log(`[Game] Teleporting logic triggered to ${dest.targetX}, ${dest.targetY}`);
            pPos.x = dest.targetX * TILE_SIZE; // Dest is in Tile Coords
            pPos.y = dest.targetY * TILE_SIZE;

            // Should we snap camera? logic in cameraSystem handles it.
            if ((ui as any).console) (ui as any).console.addSystemMessage("Teleported.");
            return; // Only one teleport per frame
        }
    }
}

export function autoAttackSystem(world: World, dt: number, ui: UIManager) {
    const player = world.query([PlayerControllable, Target, Position])[0];
    if (player === undefined) return;

    const targetComp = world.getComponent(player, Target)!;
    const pPos = world.getComponent(player, Position)!;
    const pStats = world.getComponent(player, Skills); // Sword/Axe/etc
    const pPassives = world.getComponent(player, Passives);
    const pInv = world.getComponent(player, Inventory);

    // Validate Target
    const targetId = targetComp.targetId;
    const tHp = world.getComponent(targetId, Health);
    const tPos = world.getComponent(targetId, Position);

    if (!tHp || !tPos || tHp.current <= 0) {
        // Target dead or gone
        world.removeComponent(player, Target);
        if ((ui as any).console) (ui as any).console.addSystemMessage("Target lost.");
        return;
    }

    // Check Range (Melee = 40px, Distance = ???)
    // For now assume Melee
    const range = 50;
    const dist = Math.sqrt(Math.pow(tPos.x - pPos.x, 2) + Math.pow(tPos.y - pPos.y, 2));

    if (dist <= range) {
        // Cooldown Check (2.0s attack speed)
        // We use a global or component timer. For simplicity, use component on player or global var relative to Date.now()
        // Using Date.now() for simplicity
        const now = Date.now();
        if (now - lastAttackTime >= 2000) {
            lastAttackTime = now;

            // --- REFACTORED INVENTORY ACCESS ---

            // Helper to get weapon damage
            let weaponDmg = 0;
            if (pInv) {
                // Check hands
                const rhand = pInv.getEquipped('rhand');
                if (rhand && rhand.item.damage > 0) weaponDmg = rhand.item.damage;
                else {
                    const lhand = pInv.getEquipped('lhand');
                    if (lhand && lhand.item.damage > 0) weaponDmg = lhand.item.damage;
                }
            }

            // ... (Calculations remain same)


            // Skill logic (simplified)
            let skillVal = 10;
            if (pStats) {
                skillVal = pStats.sword.level; // Assume sword for now
                // Gain XP (On Hit)
                pStats.sword.xp += 1;
                // Simple Level Up Formula: Level^2 * 10 or similar?
                // Tibia: Constant factor 1.1x per level
                const reqXp = Math.floor(10 * Math.pow(1.1, pStats.sword.level));
                if (pStats.sword.xp >= reqXp) {
                    pStats.sword.level++;
                    pStats.sword.xp = 0;
                    spawnFloatingText(world, pPos.x, pPos.y, "Skill Up!", "#ff0");
                    if ((ui as any).console) (ui as any).console.addSystemMessage(`You advanced to Sword Fighting level ${pStats.sword.level}.`);
                }
            }

            // Passives
            let might = 0;
            if (pPassives) might = pPassives.might * 2;

            // Tibia-ish Formula: 
            // MaxDmg = 0.085 * factor * skill * weapon + (level / 5)
            // Customized: (Weapon * 0.5) + (Skill * 1.0) + Might
            const maxDmg = Math.floor((weaponDmg * 0.6) + (skillVal * 1.5) + might);
            const minDmg = Math.floor(maxDmg * 0.2);

            const damage = Math.floor(minDmg + Math.random() * (maxDmg - minDmg));

            // Apply Damage
            tHp.current -= damage;
            if (tHp.current < 0) tHp.current = 0;

            // Visuals
            spawnBloodEffect(world, tPos.x, tPos.y);
            spawnFloatingText(world, tPos.x, tPos.y, damage.toString(), "#a33"); // Dark Red for phys

            if (damage > 0) {
                // Screen shake if big hit? Nah, confusing for auto attack
            }

            // Check Death
            if (tHp.current <= 0) {
                world.removeComponent(player, Target);

                // Gain XP
                const pXp = world.getComponent(player, Experience);
                if (pXp) {
                    const gain = 50;
                    pXp.current += gain;
                    if ((ui as any).console) (ui as any).console.addSystemMessage(`You dealt ${damage} damage. Target died.`);
                }

                // --- LOOT LOGIC ---
                const loot: Item[] = [];

                // 50% Chance: Gold Coin (ID 40)
                if (Math.random() < 0.5) {
                    loot.push(createItemFromRegistry(SPRITES.GOLD));
                }
                // 20% Chance: Short Sword (ID 42)
                if (Math.random() < 0.2) {
                    loot.push(createItemFromRegistry(SPRITES.SWORD));
                }
                // 20% Chance: Potion (ID 41)
                if (Math.random() < 0.2) {
                    loot.push(createItemFromRegistry(SPRITES.POTION));
                }

                if (loot.length > 0) {
                    createCorpse(world, tPos.x, tPos.y, loot);
                } else {
                    createCorpse(world, tPos.x, tPos.y, []);
                }
                // ------------------
            } else {
                // Log (optional, can span console)
                // console.log(`Hit target for ${damage}`);
            }
        }
    }
}

export function inputSystem(world: World, input: InputHandler) {
    // query includes Target so we can use it
    const entities = world.query([PlayerControllable, Velocity]);

    for (const id of entities) {
        let speed = 100;

        const passives = world.getComponent(id, Passives);
        if (passives) speed += (passives.agility * 5);

        const vel = world.getComponent(id, Velocity)!;
        const pc = world.getComponent(id, PlayerControllable)!;
        const sprite = world.getComponent(id, Sprite);
        const pos = world.getComponent(id, Position)!;

        // 1. Reset Velocity Default
        vel.x = 0;
        vel.y = 0;

        // 2. Check Input
        let dir = input.getDirection();
        let isMoving = dir.x !== 0 || dir.y !== 0;

        // --- 3. AUTO-CHASE LOGIC ---
        // If not manually moving, check for a Target
        if (!isMoving) {
            const targetComp = world.getComponent(id, Target);
            if (targetComp) {
                const tPos = world.getComponent(targetComp.targetId, Position);
                const tHp = world.getComponent(targetComp.targetId, Health);

                // Check if target exists and is alive
                if (tPos && tHp && tHp.current > 0) {
                    const dx = (tPos.x + 8) - (pos.x + 8); // Center offset
                    const dy = (tPos.y + 8) - (pos.y + 8);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // STOP DISTANCE: 20px (Close enough to hit with sword)
                    if (dist > 20) {
                        const moveX = (dx / dist);
                        const moveY = (dy / dist);

                        vel.x = moveX * speed;
                        vel.y = moveY * speed;

                        // Fake the "dir" so sprites face the right way
                        dir = {
                            x: Math.abs(moveX) > 0.5 ? Math.sign(moveX) : 0,
                            y: Math.abs(moveY) > 0.5 ? Math.sign(moveY) : 0
                        };
                        isMoving = true;
                    }
                } else {
                    // Target dead? Stop chasing.
                    world.removeComponent(id, Target);
                }
            }
        }

        // 4. Apply Movement & Animations
        if (isMoving) {
            // Manual input overwrites chase
            if (input.getDirection().x !== 0 || input.getDirection().y !== 0) {
                vel.x = dir.x * speed;
                vel.y = dir.y * speed;
            }

            // Update Facing
            if (dir.x < 0) {
                pc.facingX = -1; pc.facingY = 0;
                if (sprite) { sprite.uIndex = 2; sprite.direction = 2; sprite.flipX = true; }
            }
            else if (dir.x > 0) {
                pc.facingX = 1; pc.facingY = 0;
                if (sprite) { sprite.uIndex = 2; sprite.direction = 3; sprite.flipX = false; }
            }
            else if (dir.y < 0) {
                pc.facingX = 0; pc.facingY = -1;
                if (sprite) { sprite.uIndex = 1; sprite.direction = 1; sprite.flipX = false; }
            }
            else if (dir.y > 0) {
                pc.facingX = 0; pc.facingY = 1;
                if (sprite) { sprite.uIndex = 0; sprite.direction = 0; sprite.flipX = false; }
            }

            if (sprite) {
                const now = Date.now();
                sprite.frame = 1 + (Math.floor(now / 150) % 2);
            }
        } else {
            // Idle Frame
            if (sprite) sprite.frame = 1;
        }

        // Unstuck & Debug
        if (input.isDown('KeyU')) { pos.x = 4096; pos.y = 4096; }
        if (input.isDown('KeyH') && input.isJustPressed('KeyH')) {
            pos.x = 4096; pos.y = 4096;
            spawnFloatingText(world, 4096, 4096, "↓↓ VILLAGE ↓↓", '#ff00ff');
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
    // 1. Dialogue Interaction (E key)
    if (input.isJustPressed('e')) {
        const player = world.query([PlayerControllable, Position])[0];
        if (player === undefined) return;
        const pPos = world.getComponent(player, Position)!;

        // Check for NPC Component
        const npcs = world.query([NPC, Position]);
        for (const eid of npcs) {
            const dPos = world.getComponent(eid, Position)!;
            const dist = Math.sqrt(Math.pow(dPos.x - pPos.x, 2) + Math.pow(dPos.y - pPos.y, 2));

            if (dist < 48) {
                const npc = world.getComponent(eid, NPC)!;
                const name = world.getComponent(eid, Name);
                const npcName = name ? name.value : "Villager";

                // Show UI
                // ui.showDialogue(npc.dialog[0], npcName);

                // Check Quest Giver
                const qGiver = world.getComponent(eid, QuestGiver);
                const merchant = world.getComponent(eid, Merchant);

                if (merchant) {
                    const pInv = world.getComponent(player, Inventory);
                    if (pInv) {
                        ui.renderShop(merchant, pInv);
                        ui.showDialogue(npc.dialog[0], npcName);
                    }
                } else if (qGiver) {
                    // Trigger Quest logic manually since we are bypassing the Space/Click loop
                    // Create interaction loop logic here or just call it?
                    // Let's defer to the main interaction flow by NOT returning if we have quests?
                    // No, 'E' is specific. Let's handle it here.

                    let qLog = world.getComponent(player, QuestLog);
                    if (!qLog) {
                        qLog = new QuestLog();
                        world.addComponent(player, qLog);
                    }

                    if (qGiver.availableQuests.length > 0) {
                        const questTemplate = qGiver.availableQuests[0];
                        const existing = qLog.quests.find(q => q.id === questTemplate.id);

                        if (!existing) {
                            const newQuest = { ...questTemplate, current: 0, completed: false, turnedIn: false };
                            qLog.quests.push(newQuest);
                            ui.showDialogue(`[Quest] ${newQuest.name}: ${newQuest.description}`, npcName);
                            if ((ui as any).console) (ui as any).console.addSystemMessage(`Quest Accepted: ${newQuest.name}`);
                        } else if (existing.completed && !existing.turnedIn) {
                            existing.turnedIn = true;
                            qLog.completedQuestIds.push(existing.id);
                            const inv = world.getComponent(player, Inventory);
                            if (inv) inv.gold += existing.reward.gold;
                            ui.showDialogue("Thank you! Here is your reward.", npcName);
                        } else {
                            ui.showDialogue(`Quest Progress: ${existing.current}/${existing.required}`, npcName);
                        }
                    } else {
                        ui.showDialogue(npc.dialog[0], npcName);
                    }
                } else {
                    ui.showDialogue(npc.dialog[0], npcName);
                }
                return;
            }
        }

        // Legacy Dialogue Component Support
        const talkers = world.query([Dialogue, Position]);
        for (const eid of talkers) {
            const dPos = world.getComponent(eid, Position)!;
            const dist = Math.sqrt(Math.pow(dPos.x - pPos.x, 2) + Math.pow(dPos.y - pPos.y, 2));

            if (dist < 48) {
                const dialogue = world.getComponent(eid, Dialogue)!;
                const uiEl = document.getElementById('dialogue-ui');
                const nameEl = document.getElementById('dialogue-name');
                const textEl = document.getElementById('dialogue-text');

                if (uiEl && nameEl && textEl) {
                    if (uiEl.style.display === 'none') {
                        uiEl.style.display = 'block';
                        dialogue.currentLine = 0;
                        nameEl.innerText = dialogue.name;
                        textEl.innerText = dialogue.lines[dialogue.currentLine];
                    } else {
                        dialogue.currentLine++;
                        if (dialogue.currentLine >= dialogue.lines.length) {
                            uiEl.style.display = 'none';
                            dialogue.currentLine = 0;
                        } else {
                            textEl.innerText = dialogue.lines[dialogue.currentLine];
                        }
                    }
                }
                return;
            }
        }
    }

    // 2. TARGETING LOGIC (Left Click) - FIXED
    // Changed isDown -> isJustPressed to prevent "machine gun" clicking
    if (input.isJustPressed('MouseLeft')) {
        const mx = input.mouse.x;
        const my = input.mouse.y;

        let camX = 0, camY = 0;
        const cam = world.query([Camera])[0];
        if (cam !== undefined) {
            const cPos = world.getComponent(cam, Camera)!;
            camX = Math.floor(cPos.x);
            camY = Math.floor(cPos.y);
        }

        const worldX = mx + camX;
        const worldY = my + camY;

        // console.log(`[Interaction] Clicked Screen: ${mx},${my} -> World: ${worldX},${worldY}`);

        const interactables = world.query([Interactable, Position]);
        let clickedInteractable = false;

        // A. Check Interactables (Loot, NPCs, etc)
        for (const id of interactables) {
            const pos = world.getComponent(id, Position)!;
            // Standard 32x32 hit box
            if (worldX >= pos.x && worldX <= pos.x + 32 &&
                worldY >= pos.y && worldY <= pos.y + 32) {

                const player = world.query([PlayerControllable, Position])[0];
                if (player) {
                    const pPos = world.getComponent(player, Position)!;
                    const dx = (pPos.x + 16) - (pos.x + 16);
                    const dy = (pPos.y + 16) - (pos.y + 16);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist <= 80) {
                        const lootable = world.getComponent(id, Lootable);
                        const merchant = world.getComponent(id, Merchant);
                        const questGiver = world.getComponent(id, QuestGiver);

                        if (lootable) {
                            // Fix: Prevent looting alive mobs
                            const hp = world.getComponent(id, Health);
                            if (hp && hp.current > 0) {
                                if ((ui as any).console) (ui as any).console.addSystemMessage("You cannot loot a living target.");
                            } else {
                                const playerInv = world.getComponent(player, Inventory)!;
                                ui.openLoot(lootable, id, playerInv);
                                clickedInteractable = true;
                            }
                        } else if (merchant) {
                            const playerInv = world.getComponent(player, Inventory)!;
                            ui.currentMerchant = merchant;
                            ui.activeMerchantId = id;
                            const mName = world.getComponent(id, Name)?.value || "Merchant";
                            ui.toggleShop(merchant, mName);
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
    const players = world.query([PlayerControllable, Position, Health]);
    if (players.length === 0) return;

    // Find closest player (simple version: just first player)
    const pPos = world.getComponent(players[0], Position)!;
    const pHp = world.getComponent(players[0], Health)!;

    const entities = world.query([AI, Position, Velocity]);
    for (const id of entities) {
        const ai = world.getComponent(id, AI)!;
        const pos = world.getComponent(id, Position)!;
        const vel = world.getComponent(id, Velocity)!;
        const hp = world.getComponent(id, Health);

        const targetComp = world.getComponent(id, Target); // Add Target Component

        // 1. Distance Check
        const dx = (pPos.x + 16) - (pos.x + 16);
        const dy = (pPos.y + 16) - (pos.y + 16);
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 2. State Transition Logic
        let targetX = ai.wanderTargetX;
        let targetY = ai.wanderTargetY;
        let moveSpeed = 0;

        // Flee if low HP?
        if (hp && hp.current < hp.max * 0.2) {
            ai.behavior = 'flee';
            if (targetComp) targetComp.targetId = null; // Stop targeting
        }

        if (ai.behavior === 'flee') {
            // Run away from player
            if (dist < ai.detectionRadius * 1.5) {
                targetX = pos.x - dx;
                targetY = pos.y - dy;
                moveSpeed = ai.speed * 1.5; // Sprint
            } else {
                moveSpeed = 0; // Safe
            }
        }
        else if (dist < ai.detectionRadius && pHp.current > 0) {
            // CHASE
            targetX = pPos.x;
            targetY = pPos.y;
            moveSpeed = ai.speed;

            // Set Combat Target
            if (targetComp) targetComp.targetId = players[0];

            // Should Attack?
            if (dist < 40) { // Attack Range
                moveSpeed = 0; // Stop to attack
                // Attack logic now handled by combatSystem via Target component
            }
        }
        else {
            // WANDER
            if (targetComp) targetComp.targetId = null; // Clear target

            ai.wanderTimer -= dt;
            if (ai.wanderTimer <= 0) {
                // Pick new random spot nearby
                ai.wanderTimer = 2.0 + Math.random() * 3.0; // 2-5s
                const wanderRad = 100;
                ai.wanderTargetX = pos.x + (Math.random() * wanderRad * 2 - wanderRad);
                ai.wanderTargetY = pos.y + (Math.random() * wanderRad * 2 - wanderRad);
            }
            targetX = ai.wanderTargetX;
            targetY = ai.wanderTargetY;

            // Move slowly towards wander target
            const wdx = targetX - pos.x;
            const wdy = targetY - pos.y;
            const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
            if (wdist > 10) {
                moveSpeed = ai.speed * 0.5; // Walk slow
            } else {
                moveSpeed = 0; // Arrived
            }
        }

        // 3. Apply Velocity
        if (moveSpeed > 0) {
            const mdx = targetX - pos.x;
            const mdy = targetY - pos.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist > 0) {
                vel.x = (mdx / mdist) * moveSpeed;
                vel.y = (mdy / mdist) * moveSpeed;

                // Update Facing
                const sprite = world.getComponent(id, Sprite);
                if (sprite) {
                    if (Math.abs(mdx) > Math.abs(mdy)) {
                        sprite.direction = mdx > 0 ? 3 : 2; // R : L
                        sprite.flipX = mdx < 0;
                    } else {
                        sprite.direction = mdy > 0 ? 0 : 1; // D : U
                    }
                }
            }
        } else {
            vel.x = 0;
            vel.y = 0;
        }
    }
}

export function uiInteractionSystem(world: World, ui: UIManager, input: InputHandler, player: Player, map: WorldMap, renderer: PixelRenderer) {
    const TILE_SIZE = 32;
    const canvas = renderer.ctx.canvas;

    // Calculate Camera Position (Centered on Player)
    const camX = Math.floor((player.x * TILE_SIZE) - (canvas.width / 2) + (TILE_SIZE / 2));
    const camY = Math.floor((player.y * TILE_SIZE) - (canvas.height / 2) + (TILE_SIZE / 2));

    const worldMouseX = input.mouse.x + camX;
    const worldMouseY = input.mouse.y + camY;

    // 0. Interaction (Key E)
    if (input.isJustPressed('KeyE')) {
        console.log('[Game] Key E pressed. Checking interactables...');
        const pPos = world.getComponent(player.id, Position)!;
        const interactables = world.query([Position, Interactable, Merchant]);
        console.log(`[Game] Found ${interactables.length} merchants.`);

        let foundMerchant = false;
        for (const eid of interactables) {
            const ePos = world.getComponent(eid, Position)!;
            const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
            console.log(`[Game] Distance to merchant ${eid}: ${dist}`);

            // Check Range (e.g. 6 tiles = 192px)
            if (dist < 200) {
                const merchant = world.getComponent(eid, Merchant)!;
                const name = world.getComponent(eid, Name);
                console.log(`Interacting with Merchant: ${name ? name.value : 'Unknown'}`);

                // Open Shop UI
                // ui.toggleShop(merchantItems, merchantName)
                ui.toggleShop(merchant, name ? name.value : "Merchant");
                foundMerchant = true;
                break;
            }
        }

        if (!foundMerchant) {
            // Check generic NPCs if not merchant
            // const npcs = world.query([Position, Interactable, NPC]);

            // CHECK FOR CORPSES / LOOTABLES
            const lootables = world.query([Position, Lootable]);
            for (const eid of lootables) {
                const ePos = world.getComponent(eid, Position)!;
                const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
                if (dist < 48) { // Close range for looting
                    // Check if alive
                    const hp = world.getComponent(eid, Health);
                    if (hp && hp.current > 0) continue; // Cannot loot living mobs

                    const lootComp = world.getComponent(eid, Lootable)!;
                    const nameComp = world.getComponent(eid, Name);
                    const entName = nameComp ? nameComp.value : "Remains";

                    console.log(`[Game] Opening Loot Container: ${entName}`);
                    ui.toggleLoot(eid, entName, lootComp.items);
                    foundMerchant = true; // reusing flag to stop other interactions
                    break;
                }
            }
        }
    }

    // 1. Right Click (Open/Use)
    if (input.isJustPressed('MouseRight')) {
        // A. Check UI Items (Inventory/Equipment) - TODO (Context menus on UI?)
        // For now, focus on World Interaction (Open Chest)

        // A. Check Entities (e.g. Corpses/Lootable)
        const lootables = world.query([Position, Lootable]);
        let interactedWithEntity = false;

        for (const eid of lootables) {
            const pos = world.getComponent(eid, Position)!;
            // Simple Box Check (32x32 assumed)
            if (worldMouseX >= pos.x && worldMouseX < pos.x + 32 &&
                worldMouseY >= pos.y && worldMouseY < pos.y + 32) {

                // Check if alive
                const hp = world.getComponent(eid, Health);
                if (hp && hp.current > 0) {
                    if (interactedWithEntity) continue;
                    // Optional: Log "You cannot loot this yet"?
                    // For now just ignore so we don't block attacking/other interactions?
                    // But right click usually attacks?
                    // If we block here, we might fall through to nothing.
                    // Let's Just Continue.
                    continue;
                }

                const name = world.getComponent(eid, Name);
                const loot = world.getComponent(eid, Lootable)!;

                console.log(`[Game] Opening Corpse/Container: ${name ? name.value : 'Unknown'} (ID: ${eid})`);

                // If it has items, open it
                // We might need to ensure loot.items is populated.
                // UI expects a container object or list. 
                // ui.toggleLoot takes (entityId, name, items)
                ui.toggleLoot(eid, name ? name.value : "Corpse", loot.items || []);
                interactedWithEntity = true;
                break;
            }
        }

        if (interactedWithEntity) {
            // Skip map item check if we opened a corpse
        } else {
            // B. Check World Items
            const hit = renderer.getObjectAt(map, player, worldMouseX, worldMouseY);

            if (hit && hit.item) {
                console.log(`[UI] Right Clicked Item: ${hit.item.id}`);

                // Check if Container (Simple check based on ID range or property)
                // Using createItemFromRegistry to check prototype properties
                // We need a way to check if an item ID is a container. 
                // Ideally ItemRegistry has this info.
                // For now, hardcode or use existing logic
                const itemDef = createItemFromRegistry(hit.item.id);

                if (itemDef.isContainer) {
                    const runtimeItem = hit.item as any;
                    // Init inventory if needed
                    if (!runtimeItem.inventory) {
                        runtimeItem.inventory = [
                            // Default Loot
                            { item: createItemFromRegistry(2), count: 1 }, // Sword
                            { item: createItemFromRegistry(7), count: 3 }  // Potions
                        ];
                        runtimeItem.capacity = 8;
                    }
                    ui.openContainer(runtimeItem);
                } else {
                    // Look at item
                    if (ui) ui.lookAtItem(itemDef);
                }
            }
        }
    }

    // 2. Drag & Drop Logic
    // Start Drag
    if (input.isJustPressed('MouseLeft')) {
        // A. Check UI (Containers, Equipment)
        const uiHit = ui.getContainerSlotAt(input.mouse.x, input.mouse.y);
        // Note: input.mouse is canvas-relative, which matches ui.renderWindows coordinate space

        if (uiHit) {
            const container = ui.openContainers[uiHit.containerIndex].item;
            if (container.inventory && container.inventory[uiHit.slotIndex]) {
                const itemInst = container.inventory[uiHit.slotIndex];

                // Set Drag State
                ui.draggedItem = itemInst.item; // Instance wrappers? 
                // ui_manager expects Item. itemInst is { item: Item, count: number } ? 
                // ui_manager.ts:409: const innerItem = win.item.inventory[s]; -> It seems inventory is Item[]?
                // Let's check ui_manager.ts Render logic.
                // Line 409: win.item.inventory[s].id -> implying it's an Item or has .id
                // If inventory is Item[], then ok. 
                // But game.ts creates { item: ..., count: ... } for "runtimeItem.inventory".
                // This is a mismatch I need to solve. 
                // Looking at main.ts line 152: inventory.push({ item: ..., count: 1 }).
                // Looking at ui_manager.ts line 410: innerItem.id. 
                // If innerItem is { item: Item }, it doesn't have .id directly.
                // BUG: ui_manager.ts render loop expects Item, but main.ts populates { item, count }.

                // FIX: Let's assume for this step we normalize to { id: number, ... } or fix ui_manager later.
                // In ui_manager.ts renderWindows: const sprite = assetManager.getSpriteSource(innerItem.id);
                // So ui_manager expects objects with .id. 
                // If I push { item: Item, count: 1 } -> innerItem.item.id is correct.
                // I will assume inventory holds Items directly for now to match ui_manager, OR ui_manager handles ItemInstance.
                // ui_manager line 409: const innerItem = win.item.inventory[s];

                // Let's stick to: Inventory = Item[] for simple containers for now.
                // So runtimeItem.inventory.push(new Item(2));

                ui.draggedItem = container.inventory[uiHit.slotIndex];
                ui.draggingFrom = { type: 'container', index: uiHit.slotIndex, containerIndex: uiHit.containerIndex };

                // Remove from container? Visuals usually keep it until drop. 
                // But dragging a ghost implies moving.
                // Let's leave it for now (copy).
            }
        } else {
            // B. Check World
            const hit = renderer.getObjectAt(map, player, worldMouseX, worldMouseY);
            if (hit && hit.item && hit.item.id !== 0) {
                ui.draggedItem = hit.item;
                ui.draggingFrom = { type: 'world', index: 0 }; // index 0 is placeholder? Needs coords.
                // We need to store source coords
                ui.draggingFrom = { type: 'world', index: 0 };
                // Hack: Store coords in the "index" or extend the type.
                // ui.draggingFrom signature: { type: ..., index: number, containerIndex?: number }
                // I cannot store x/y in index.
                // I should assume index = hash or I must modify UIManager types.
                // For now, let's attach data to ui directly as a temp hack or just use index as flat index (y * width + x)?
                // Yes, tile index!
                const tileIdx = hit.y * map.width + hit.x;
                ui.draggingFrom = { type: 'world', index: tileIdx };
            }
        }
    }

    // End Drag
    if (ui.draggedItem && !input.isDown('MouseLeft')) {
        // DROP LOGIC
        const dropX = input.mouse.x; // Canvas coords
        const dropY = input.mouse.y;

        // 1. Drop in UI?
        const uiHit = ui.getContainerSlotAt(dropX, dropY);
        if (uiHit) {
            const targetCont = ui.openContainers[uiHit.containerIndex].item;
            if (!targetCont.inventory) targetCont.inventory = [];

            // Add item
            targetCont.inventory.push(ui.draggedItem);

            // Remove from Source
            removeFromSource(ui, map);

            console.log("Dropped in Container");
        } else {
            // 2. Drop in World
            const dropWorldX = dropX + camX;
            const dropWorldY = dropY + camY;
            const tx = Math.floor(dropWorldX / TILE_SIZE);
            const ty = Math.floor(dropWorldY / TILE_SIZE);

            const tile = map.getTile(tx, ty);
            if (tile) {
                tile.addItem(ui.draggedItem);
                removeFromSource(ui, map);
                // console.log("Dropped in World");
            }
        }

        ui.draggedItem = null;
        ui.draggingFrom = null;
    }
}

function removeFromSource(ui: UIManager, map: WorldMap) {
    if (!ui.draggingFrom) return;

    if (ui.draggingFrom.type === 'container') {
        const cIdx = ui.draggingFrom.containerIndex!;
        const sIdx = ui.draggingFrom.index;
        const cont = ui.openContainers[cIdx].item;
        if (cont && cont.inventory) {
            cont.inventory.splice(sIdx, 1);
        }
    } else if (ui.draggingFrom.type === 'world') {
        const tIdx = ui.draggingFrom.index;
        // Map is 1D array? map.tiles
        const tile = map.tiles[tIdx];
        if (tile) {
            tile.removeItem(); // Pops top
        }
    }
}

export function createItemFromRegistry(id: number): Item {
    const def = ItemRegistry[id];
    if (def) {
        // Use uIndex from registry, fallback to id if not defined
        const spriteId = def.uIndex !== undefined ? def.uIndex : id;
        return new Item(
            def.name,
            id, // Pass ID to constructor
            def.slot || 'other',
            spriteId,  // uIndex for sprite
            0,         // frame
            0,         // direction
            def.attack || 0,  // damage
            10,        // price
            "",        // description
            def.type === 'weapon' ? 'melee' : 'none',  // weaponType
            'common',  // rarity
            def.defense || 0  // defense
        );
    }
    // Fallback: Create basic item with id as sprite
    return new Item(String(id), 'other', id);
}

// FIX: Code fragment detached from aiSystem. Commenting out to prevent crash.
// const playerPos = world.getComponent(players[0], Position)!;
// const centerX = 128 * 32; 
// const centerY = 128 * 32; 
// const safeRadius = 10 * 32; 
// const enemies = world.query([AI, Position, Velocity]);
// for (const id of enemies) {
//     const status = world.getComponent(id, StatusEffect);
//     if (status && status.type === 'frozen') continue; 
//     const pos = world.getComponent(id, Position)!;
//     if (pos.x < -100) continue;
//     const vel = world.getComponent(id, Velocity)!;
//     const ai = world.getComponent(id, AI)!;
//     const hp = world.getComponent(id, Health);
//     const nameComp = world.getComponent(id, Name);
//     const distToCenter = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));
//     if (distToCenter < safeRadius) {
//          const dx = pos.x - centerX;
// FIX: Detached code cleanup
// const dy = pos.y - centerY;
// const len = Math.sqrt(dx * dx + dy * dy);
// if (len > 0) {
//     vel.x = (dx / len) * ai.speed;
//     if (hp && hp.current <= 0) {
//         // Already dead, awaiting cleanup or loot?

// [Detached Code Removed]





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
        const sprite = world.getComponent(id, Sprite);

        // DEBUG: Trace Velocity
        if (Math.random() < 0.01 && (vel.x !== 0 || vel.y !== 0)) {
            console.log(`[MoveSys] Entity ${id} Attempting Move. Vel: ${vel.x}, ${vel.y}`);
        }

        // --- NEW: Animation Logic ---
        if (sprite) {
            // 1. Update Direction
            // 1. Update Direction (Strict User Logic)
            if (Math.abs(vel.x) > 0 || Math.abs(vel.y) > 0) {
                if (Math.abs(vel.x) > Math.abs(vel.y)) {
                    // Moving Horizontal
                    sprite.direction = (vel.x > 0) ? 3 : 2; // 3=Right, 2=Left
                } else {
                    // Moving Vertical
                    sprite.direction = (vel.y > 0) ? 0 : 1; // 0=Down, 1=Up
                }
                sprite.animState = 'walk';
            } else {
                sprite.animState = 'idle';
            }

            // 2. Update Frame
            if (sprite.animState === 'walk') {
                sprite.animTimer += dt;
                if (sprite.animTimer >= sprite.frameDuration) {
                    sprite.animTimer = 0;
                    sprite.frame = (sprite.frame + 1) % 4; // Assume 4 frames
                }
            } else {
                // Idle
                sprite.frame = 1; // Or specific idle frame? Usually 1 is stand
                sprite.animTimer = 0;
            }
        }

        // Direction logic (Legacy Facing)
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

        // --- TERRAIN SPEED MODIFIERS ---
        let speedMult = 1.0;
        if (map) {
            // Check center point
            const centerX = pos.x + 16;
            const centerY = pos.y + 16;
            const tile = map.getTile(Math.floor(centerX / 32), Math.floor(centerY / 32));
            if (tile) {
                // Swamp / Mud (ID check needed, assuming SWAMP=28 from existing knowledge or placeholder)
                // Sand = SPRITES.SAND (Checking constants) -> 27?
                // Mud = 28?
                // Let's use hardcoded IDs or better, check constants.
                // Assuming standard IDs: Grass=10, Dirt=11, Sand=12?
                // Let's check Tile contents interactively or assume standard:
                // If tile has SPRITES.WATER (26) without boat -> 0.3?
                // If tile has SPRITES.MUD (20?) -> 0.5

                // For Phase 4, we define:
                // Swamp = Slow (0.5)
                // Desert = Slow (0.7)

                // Let's iterate items to find floor
                // Simplification: Check for specific IDs
                if (tile.has(28) || tile.has(SPRITES.WATER)) speedMult = 0.5; // Swamp/Water
                else if (tile.has(27)) speedMult = 0.7; // Sand
            }
        }

        const nextX = pos.x + vel.x * speedMult * dt;
        const nextY = pos.y + vel.y * speedMult * dt;

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

            const checkCollision = (x: number, y: number, debug: boolean = false): boolean => {
                if (!map) return false;

                // Map Bounds
                if (x < 0 || x >= map.width * map.tileSize || y < 0 || y >= map.height * map.tileSize) {
                    if (debug) console.log(`[Collision] Out of bounds: ${x}, ${y}`);
                    return true;
                }

                const tileX = Math.floor(x / map.tileSize);
                const tileY = Math.floor(y / map.tileSize);
                const idx = tileY * map.width + tileX;

                if (idx < 0 || idx >= map.tiles.length) return true;

                const tile = map.tiles[idx];

                // Check Stack for Solids
                for (const item of tile.items) {
                    if (PHYSICS.isSolid(item.id)) {
                        if (debug) console.log(`[Collision] Solid Item: ${item.id} at ${tileX},${tileY}`);
                        return true;
                    }
                }
                return false;
            };

            // Helper to update tile occupancy
            const updateOccupancy = (oldX: number, oldY: number, newX: number, newY: number) => {
                if (!map) return;
                const oldTx = Math.floor((oldX + 8) / map.tileSize);
                const oldTy = Math.floor((oldY + 8) / map.tileSize);
                const newTx = Math.floor((newX + 8) / map.tileSize);
                const newTy = Math.floor((newY + 8) / map.tileSize);

                if (oldTx !== newTx || oldTy !== newTy) {
                    // Clear old
                    if (oldTx >= 0 && oldTx < map.width && oldTy >= 0 && oldTy < map.height) {
                        const oldIdx = oldTy * map.width + oldTx;
                        if (map.tiles[oldIdx].creature === id) {
                            map.tiles[oldIdx].creature = null;
                        }
                    }
                    // Set new
                    if (newTx >= 0 && newTx < map.width && newTy >= 0 && newTy < map.height) {
                        const newIdx = newTy * map.width + newTx;
                        map.tiles[newIdx].creature = id;
                    }
                }
            };

            // X Axis
            const cx1 = nextX + (vel.x > 0 ? 12 : 4);
            const cy1 = pos.y + 12;
            const cx2 = nextX + (vel.x > 0 ? 12 : 4);
            const cy2 = pos.y + 28;

            if (!checkCollision(cx1, cy1) && !checkCollision(cx2, cy2)) {
                // No collision
                updateOccupancy(pos.x, pos.y, nextX, pos.y);
                pos.x = nextX;
            } else {
                // Collision!
                console.log(`[MoveSystem] Blocked X! Pos: ${pos.x}, Target: ${nextX}`);
                // Debug what blocked it
                checkCollision(cx1, cy1, true); // Add verbose flag if possible, or just manually check here
                vel.x = 0;
            }

            // Y Axis
            const nextYAfterX = pos.y + vel.y * dt;
            if (!checkCollision(pos.x + 4, nextYAfterX + (vel.y > 0 ? 28 : 12)) &&
                !checkCollision(pos.x + 12, nextYAfterX + (vel.y > 0 ? 28 : 12))) {
                updateOccupancy(pos.x, pos.y, pos.x, nextYAfterX);
                pos.y = nextYAfterX;
            } else {
                vel.y = 0;
            }      // Network Update (Player Only)
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
                // Footsteps
                const pc = world.getComponent(id, PlayerControllable)!;
                pc.footstepTimer -= dt;
                if (pc.footstepTimer <= 0) {
                    let material: 'grass' | 'stone' | 'wood' = 'grass';

                    if (map) {
                        const tx = Math.floor((pos.x + 8) / map.tileSize);
                        const ty = Math.floor((pos.y + 8) / map.tileSize);
                        if (tx >= 0 && tx < map.width && ty >= 0 && ty < map.height) {
                            const tile = map.tiles[ty * map.width + tx];
                            const top = tile.items.length > 0 ? tile.items[tile.items.length - 1].id : 0;

                            if (top === 19 || top === 20) material = 'wood';
                            else if (top >= 23 || top === 17) material = 'stone';
                        }
                    }

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

    const weapon = inv.getEquipped('rhand');
    if (weapon) {
        damage = weapon.item.damage;

        // Skill Damage Bonus
        if (skills) {
            // Determine skill type
            let skillType = weapon.item.weaponType || "sword";
            // Fallback inference if old save
            if (weapon.item.name.includes("Sword")) skillType = "sword";
            else if (weapon.item.name.includes("Axe")) skillType = "axe";
            else if (weapon.item.name.includes("Club")) skillType = "club";

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
                    const skillDmg = (skillLevel * weapon.item.damage * 0.06) + (playerLevel * 0.2);

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
// Updated drawSprite using AssetManager
// Uses native sprite size unless 'size' override is provided
// Updated drawSprite using AssetManager
// Uses native sprite size unless 'size' override is provided
export function drawSprite(ctx: CanvasRenderingContext2D, uIndex: number, dx: number, dy: number, size: number = 0, flipX: boolean = false) {
    let source = assetManager.getSpriteSource(uIndex);

    // --- Dynamic Texture Switching (Fix for prompt) ---
    if (uIndex >= 100 && uIndex < 200) {
        // logic for dungeon/other sheets if needed
    }

    if (!source) {
        // Force fallback immediately if source is missing to avoid silent failure
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(Math.floor(dx), Math.floor(dy), 32, 32);
        return;
    }

    if (source) {
        // Native Sizing
        const sw = source.sw;
        const sh = source.sh;

        // Tall Object Offset (Align Bottom)
        // If sprite is taller than 32, shift it up
        const tallOffset = sh - 32;
        const drawY = dy - tallOffset;

        if (flipX) {
            ctx.save();
            ctx.translate(dx + sw, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(source.image, source.sx, source.sy, sw, sh, 0, 0, sw, sh);
            ctx.restore();
        } else {
            ctx.drawImage(source.image, source.sx, source.sy, sw, sh, dx, drawY, sw, sh);
        }
    } else {
        // Fallback
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(Math.floor(dx), Math.floor(dy), 32, 32);
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
    // Deprecated. Merged into renderSystem.
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

    const mapEntities = world.query([TileMap])[0];
    if (mapEntities === undefined) return;
    const map = world.getComponent(mapEntities, TileMap)!;

    // Viewport Culling (Dynamic)
    const viewportW = ctx.canvas.width;
    const viewportH = ctx.canvas.height;

    const startCol = Math.floor(Math.max(0, camX / map.tileSize));
    const endCol = Math.floor(Math.min(map.width, (camX + viewportW) / map.tileSize + 1));
    const startRow = Math.floor(Math.max(0, camY / map.tileSize));
    const endRow = Math.floor(Math.min(map.height, (camY + viewportH) / map.tileSize + 1));

    const overlays: number[] = []; // Store IDs to draw HUDs later

    // --- MAIN RENDER LOOP (Y-Sorted / Row-by-Row) ---
    // Tibia-like: Draw Row N (Ground -> Items -> Creature) -> Next Row
    for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
            const idx = r * map.width + c;
            const tile = map.tiles[idx];
            if (!tile) continue;

            const drawX = Math.floor(c * map.tileSize - camX);
            const drawY = Math.floor(r * map.tileSize - camY);

            // 1. Draw Tile Items (Ground -> Walls -> Objects)
            for (const item of tile.items) {
                drawSprite(ctx, item.id, drawX, drawY, map.tileSize);
            }

            // 2. Draw Creature (if on this tile)
            if (tile.creature) {
                const id = tile.creature;
                // Verify entity still exists/valid
                const pos = world.getComponent(id, Position);
                const sprite = world.getComponent(id, Sprite);

                if (pos && sprite) {
                    // Use ACTUAL position for smooth movement, but purely strictly ordered by this tile loop
                    const px = Math.floor(pos.x - camX);
                    const py = Math.floor(pos.y - camY);

                    // Center correction if sprite is larger than tile?
                    // Typically mapped to foot position. 
                    // Draw sprite
                    drawSprite(ctx, sprite.uIndex, px, py, sprite.size, sprite.flipX);

                    // Add to overlay queue
                    overlays.push(id);
                }
            }
        }
    }

    // 3. Draw "Free" Entities (Particles, Projectiles) - On Top for now
    // Ideally these would be sorted into the rows too, but simple z-buffer is fine for FX
    // Particles are handled in textRenderSystem currently.

    // Projectiles
    const projectiles = world.query([Position, Projectile, Sprite]);
    for (const pid of projectiles) {
        const pos = world.getComponent(pid, Position)!;
        const sprite = world.getComponent(pid, Sprite)!;
        if (pos.x - camX > -32 && pos.x - camX < 320 && pos.y - camY > -32 && pos.y - camY < 240) {
            drawSprite(ctx, sprite.uIndex, Math.floor(pos.x - camX), Math.floor(pos.y - camY), sprite.size, sprite.flipX);
        }
    }

    // 4. Overlays (Health Bars, Names)
    for (const id of overlays) {
        drawOverlays(world, ctx, id, camX, camY);
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

        }
    }

    // DEBUG: Draw collision box if entity has a Collider component
    if (DEBUG_COLLIDERS) {
        const colliders = world.query([Position, Collider]);
        for (const id of colliders) {
            const pos = world.getComponent(id, Position)!;
            const collider = world.getComponent(id, Collider)!;
            const colX = Math.floor(pos.x + collider.offsetX - camX);
            const colY = Math.floor(pos.y + collider.offsetY - camY);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;

        }
    }

    // DEBUG: Draw AI state name above enemies
    if (DEBUG_AI_STATES) {
        const aiEntities = world.query([Position, Sprite, AI]);
        for (const id of aiEntities) {
            const pos = world.getComponent(id, Position)!;
            const sprite = world.getComponent(id, Sprite)!;
            const aiComp = world.getComponent(id, AI)!;
            const isPlayer = world.getComponent(id, PlayerControllable);

            if (!isPlayer) {
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
}

// Separate function for Overlays to keep loop clean
// Separate function for Overlays to keep loop clean
function drawOverlays(world: World, ctx: CanvasRenderingContext2D, id: number, camX: number, camY: number) {
    const pos = world.getComponent(id, Position)!;
    const sprite = world.getComponent(id, Sprite)!;
    const health = world.getComponent(id, Health);
    const nameComp = world.getComponent(id, Name);
    const isPlayer = world.getComponent(id, PlayerControllable);

    // Health Bar
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

    }

    // Draw NPC Name Labels (for entities with Name and QuestGiver or Interactable)
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

    const potion = inv.findItemByName('Small Health Potion');
    if (potion) {
        if (health.current < health.max) {
            health.current = Math.min(health.current + 20, health.max);
            inv.removeItem(potion.instance.item.name, 1);
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
                const armor = pInv.getEquipped('armor');
                if (armor) {
                    // Flat reduction. Armor Value = Damage Reduction
                    const reduction = Math.floor(armor.item.damage * 0.5); // 50% effectiveness vs Raw Dmg? 
                    // Let's make it 1:1 for now but randomized?
                    // Tibia style: Arm absorbs between Min and Max.
                    // Let's do: Absorbs 0 to ArmorValue.
                    const absorbed = Math.floor(Math.random() * (armor.item.damage + 1));
                    damage -= absorbed;
                    if (absorbed > 0 && (ui as any).console) (ui as any).console.sendMessage(`Armor absorbed ${absorbed} dmg.`);
                }

                // Helmet
                const helm = pInv.getEquipped('head');
                if (helm) {
                    const absorbed = Math.floor(Math.random() * (helm.item.damage + 1));
                    damage -= absorbed;
                }

                const shield = pInv.getEquipped('lhand');
                if (shield) {
                    // Shielding Mitigation: Defense * (ShieldSkill * 0.01) + Defense
                    let mitigation = shield.item.damage;

                    if (skills) {
                        const shSkill = skills.shielding;
                        // Bonus mitigation based on skill
                        mitigation += Math.floor(shield.item.damage * (shSkill.level * 0.05));

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
                    const status = world.getComponent(playerEntity, StatusEffect);
                    let manaShieldActive = false;
                    // Check active status (Needs iterable check if multiple statuses allowed, currently single)
                    // Current StatusEffect is single instance. We should probably allow list, but for now assumption: one status overrides.
                    // Wait, existing system assumes 1 status. If we want mana shield + poison, we need refactor.
                    // For now, let's assume 'mana_shield' overwrites others or we use a separate component?
                    // Let's use a separate logic: Mana Shield is usually a buff. StatusEffect is handled as single slot.
                    // FIX: Let's check 'utamo vita' spell effect which adds a unique component or status. 
                    // To avoid refactoring entire Status system, let's check a new component `ManaShield` or just rely on Status 'mana_shield'.
                    if (status && status.type === 'mana_shield') {
                        const pMana = world.getComponent(playerEntity, Mana);
                        if (pMana && pMana.current > 0) {
                            manaShieldActive = true;
                            if (pMana.current >= damage) {
                                pMana.current -= damage;
                                if ((ui as any).console) (ui as any).console.sendMessage(`Mana Shield absorbed ${damage} dmg.`);
                                spawnFloatingText(world, pPos.x, pPos.y, `-${damage}`, '#0000ff');
                            } else {
                                damage -= pMana.current;
                                pMana.current = 0;
                                if ((ui as any).console) (ui as any).console.sendMessage(`Mana Shield broken!`);
                                world.removeComponent(playerEntity, StatusEffect); // Remove shield
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

    // B. Check Enemies (Targeting) - if not interacted with something else
    if (!clickedInteractable) {
        // Re-query for potential targets (Entities with Health/Sprite/Pos)
        const targets = world.query([Health, Position, Sprite]);
        for (const eid of targets) {
            // Skip player or self
            if (world.getComponent(eid, PlayerControllable)) continue;

            const pos = world.getComponent(eid, Position)!;
            // Standard 32x32 hit box
            if (worldX >= pos.x && worldX <= pos.x + 32 &&
                worldY >= pos.y && worldY <= pos.y + 32) {

                const player = world.query([PlayerControllable, Target])[0];
                if (player) {
                    const pTarget = world.getComponent(player, Target)!;
                    // Toggle or Set Target
                    pTarget.entityId = eid; // Set target

                    // Visual/Audio feedback?
                    const hp = world.getComponent(eid, Health);
                    const name = world.getComponent(eid, Name)?.value || "Target";
                    if (hp && hp.current > 0) {
                        if ((ui as any).console) (ui as any).console.addSystemMessage(`Targeting: ${name}`);
                    }
                }
                break; // Only target top-most
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
        map.tiles = mapData.tiles; // Replace array
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
                    if (!inv.hasItem(key)) missingKeys.push(key);
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
            switchMap(world, 'overworld', 'main', Date.now());
            return;
        }
    }
}


// --- MAP SWITCHING SYSTEM ---
export const MAP_CACHE: Map<string, TileMap> = new Map();


// --- TOOL SYSTEM ---
export function toolSystem(world: World, input: InputHandler, ui: UIManager) {
    if (input.isJustPressed('MouseLeft')) {
        const uiAny = ui as any;
        if (uiAny.targetingItem) {
            const mx = input.mouse.x;
            const my = input.mouse.y;

            // Convert Screen -> World Coords
            const cam = world.query([Camera])[0];
            let camX = 0, camY = 0;
            if (cam) {
                const cPos = world.getComponent(cam, Camera)!;
                camX = cPos.x; camY = cPos.y;
            }
            const wx = mx + camX;
            const wy = my + camY;
            const tx = Math.floor(wx / TILE_SIZE);
            const ty = Math.floor(wy / TILE_SIZE);

            const game = (window as any).game;
            if (!game || !game.map) return;

            const tile = game.map.getTile(tx, ty);

            // Check Distance
            const player = world.query([PlayerControllable, Position])[0];
            if (player) {
                const pPos = world.getComponent(player, Position)!;
                const dx = pPos.x - wx;
                const dy = pPos.y - wy;
                if (Math.sqrt(dx * dx + dy * dy) > 100) {
                    if (ui.console) ui.console.sendMessage("Too far away.");
                    uiAny.targetingItem = null;
                    document.body.style.cursor = 'default';
                    return;
                }
            }

            if (!tile) return;

            // --- SHOVEL LOGIC ---
            if (uiAny.targetingItem.name === "Shovel") {
                if (!tile.has(17)) { // Not wall
                    if (!tile.has(SPRITES.HOLE)) {
                        // Create Hole Entity
                        const hole = world.createEntity();
                        world.addComponent(hole, new Position(tx * 32, ty * 32));
                        world.addComponent(hole, new Sprite(SPRITES.HOLE));
                        world.addComponent(hole, new DungeonEntrance('cave', 'Secret Cave'));

                        // Visuals
                        if (ui.console) ui.console.sendMessage("You dug a hole.");

                        // Add to Map Data so it persists?
                        // tile.add(SPRITES.HOLE); // Logic?
                    } else {
                        if (ui.console) ui.console.sendMessage("There is already a hole here.");
                    }
                } else {
                    if (ui.console) ui.console.sendMessage("You cannot dig this.");
                }
            }
            // --- ROPE LOGIC ---
            else if (uiAny.targetingItem.name === "Rope") {
                if (tile.has(SPRITES.ROPE_SPOT) || tile.has(SPRITES.HOLE)) {
                    if (ui.console) ui.console.sendMessage("You rope yourself up.");
                    // Switch Map UP (Back to Overworld or Level - 1)
                    switchMap(world, 'overworld', 'main', 1337);
                } else {
                    if (ui.console) ui.console.sendMessage("Nothing to rope here.");
                }
            }

            // Reset cursor
            uiAny.targetingItem = null;
            document.body.style.cursor = 'default';
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


    const def = MOB_REGISTRY[type];
    if (def) {
        world.addComponent(e, new Sprite(def.spriteIndex, 32));
        world.addComponent(e, new AI(def.speed));

        const maxHp = Math.floor(def.hp * hpScale);
        world.addComponent(e, new Health(maxHp, maxHp));
        world.addComponent(e, new Name(def.name));

        // Loot Generation
        const lootItems = generateLoot(def.lootTable || type);
        world.addComponent(e, new Lootable(lootItems));

        // Equipment Interaction
        if (def.equipment) {
            const inv = new Inventory();
            // Populate slots
            if (def.equipment.rhand) inv.equip('rhand', new ItemInstance(createItemFromRegistry(def.equipment.rhand), 1));
            if (def.equipment.lhand) inv.equip('lhand', new ItemInstance(createItemFromRegistry(def.equipment.lhand), 1));
            if (def.equipment.body) inv.equip('body', new ItemInstance(createItemFromRegistry(def.equipment.body), 1));
            if (def.equipment.head) inv.equip('head', new ItemInstance(createItemFromRegistry(def.equipment.head), 1));

            world.addComponent(e, inv);
        }
    } else {
        console.warn(`[Game] Unknown Mob Type: ${type}`);
        world.addComponent(e, new Sprite(SPRITES.ORC || 58, 32));
        world.addComponent(e, new AI(20));
        world.addComponent(e, new Health(50, 50));
        world.addComponent(e, new Name("Unknown " + type));
    }

    // Collider: Body-sized collision box for enemies
    world.addComponent(e, new Collider(20, 12, 6, 20));

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
            new Item('Ice Shard', 'currency', 101, 0, 5, 'Cold to the touch', 'none', 'common', 0, 0, 0, false, 0, undefined, undefined),
            new Item('Thunder Staff', 'rhand', SPRITES.THUNDER_STAFF, 25, 600, 'Crackles with energy', 'staff', 'rare', 0, 0, 20, false, 0, '#00ffff', 40)
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
            new Item('Frost Helm', 'head', SPRITES.FROST_HELM, 0, 800, 'Icy protection', 'none', 'epic', 8, 0, 0, false, 0, '#ccffff', 30),
            new Item('Ice Bow', 'rhand', SPRITES.ICE_BOW, 35, 700, 'Freezes enemies', 'bow', 'rare', 0, 0, 0, false, 0, '#99ffff', 35)
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
            new Item('Thunder Staff', 'rhand', SPRITES.THUNDER_STAFF, 25, 600, 'Crackles with energy', 'staff', 'rare', 0, 0, 20, false, 0, '#00ffff', 40),
            new Item('Water Essence', 'currency', 100, 0, 50, 'Pure water energy', 'none', 'rare', 0, 0, 0, false, 0, undefined, undefined)
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
            new Item('Earth Essence', 'currency', 110, 0, 50, 'Solid earth energy', 'none', 'rare', 0, 0, 0, undefined, undefined, undefined, undefined),
            new Item('Obsidian Shard', 'currency', 103, 0, 15, 'Sharp black stone', 'none', 'common', 0, 0, 0, undefined, undefined, undefined, undefined)
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
    merch.items.push(new Item('Health Potion', 'consumable', SPRITES.POTION, 0, 30, 'Restores 50 health', 'none', 'common', 0, 0, 0, undefined, undefined, undefined, undefined));
    merch.items.push(new Item('Mana Potion', 'consumable', SPRITES.MANA_POTION, 0, 40, 'Restores 30 mana', 'none', 'common', 0, 0, 0, undefined, undefined, undefined, undefined));

    // Basic Weapons
    merch.items.push(new Item('Wooden Sword', 'rhand', SPRITES.WOODEN_SWORD, 3, 10, 'Training weapon', 'sword', 'common', 0, 0, 0, undefined, undefined, undefined, undefined));
    merch.items.push(new Item('Wooden Club', 'rhand', SPRITES.CLUB, 4, 15, 'Heavy branch', 'club', 'common', 2, 0, 0, undefined, undefined, undefined, undefined));
    merch.items.push(new Item('Hand Axe', 'rhand', SPRITES.AXE, 7, 25, 'Woodcutter\'s tool', 'axe', 'common', 0, 0, 0, undefined, undefined, undefined, undefined));

    // Basic Armor
    merch.items.push(new Item('Wooden Shield', 'lhand', SPRITES.WOODEN_SHIELD, 0, 20, 'Simple plank shield', 'none', 'common', 3, 0, 0, undefined, undefined, undefined, undefined));
    merch.items.push(new Item('Leather Armor', 'body', SPRITES.ARMOR, 0, 50, 'Basic protection', 'none', 'uncommon', 6, 0, 0, undefined, undefined, undefined, undefined));

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
            new Item('Spider Silk', 'currency', 102, 0, 5, 'Sticky silk', 'none', 'common', 0, 0, 0, undefined, undefined, undefined, undefined)
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
            new Item('Magma Armor', 'armor', SPRITES.MAGMA_ARMOR, 0, 800, 'Forged in fire', 'none', 'epic', 10, 0, 0, false, 0, '#ff4400', 50),
            new Item('Fire Sword', 'rhand', SPRITES.FIRE_SWORD, 30, 700, 'Burns on contact', 'sword', 'rare', 0, 0, 0, false, 0, '#ffaa00', 40)
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

export function createItem(world: World, x: number, y: number, name: string, slot: string, uIndex: number, damage: number = 0, price: number = 10, description: string = '', weaponType: string = '', rarity: string = 'common', defense: number = 0, bonusHp: number = 0, bonusMana: number = 0, glowColor?: string, glowRadius?: number, network?: NetworkManager, networkItem?: NetworkItem) {
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
    world.addComponent(e, new Item(name, slot, uIndex, damage, price, description, weaponType, rarity as ItemRarity, defense, bonusHp, bonusMana, false, 0, glowColor, glowRadius));
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
            if (item.slotType === 'currency') {
                const amount = 10;
                inventory.gold = (inventory.gold || 0) + amount;
                iPos.x = -1000;
                if ((ui as any).console) (ui as any).console.sendMessage(`You picked up ${amount} Gold.`);
                audio.playCoin();
                world.removeEntity(id);
                continue;
            }
            if (inventory.addItem(item)) { // Use helper method
                iPos.x = -1000;
                if ((ui as any).console) (ui as any).console.sendMessage(`You picked up a ${item.name}.`);
                audio.playCoin();
                if (spriteSheet.complete) ui.updateInventory(inventory);
            } else {
                // If addItem fails, it means no space in main slots or storage
                if ((ui as any).console) (ui as any).console.sendMessage(`No space for ${item.name}.`);
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

export function deathSystem(world: World, ui: UIManager, spawnX: number = TEMPLE_POS.x, spawnY: number = TEMPLE_POS.y) {
    const healths = world.query([Health]);
    for (const id of healths) {
        const hp = world.getComponent(id, Health)!;
        if (hp.current <= 0) {
            // Player Death
            const isPlayer = world.getComponent(id, PlayerControllable);
            if (isPlayer) {
                if ((ui as any).console) (ui as any).console.addSystemMessage("You have died! Respawning at temple...");
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

            // NPC/Enemy Death (Fallback if not handled by autoAttackSystem/projectileSystem)
            const name = world.getComponent(id, Name);
            // ... (rest managed elsewhere usually, but safety cleanup)
            if (name && !world.getComponent(id, PlayerControllable)) {
                // Should be handled by who killed it, but if environmental death?
                // Let's leave it as fallback cleanup or ignore to avoid double loot
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

// Helper to create Item Component from Registry

export function generateLoot(enemyType: string = "orc"): Item[] {
    const items: Item[] = [];
    const tableKey = enemyType.toLowerCase();
    const table = LOOT_TABLES[tableKey] || LOOT_TABLES['orc']; // Fallback

    if (table) {
        table.forEach(entry => {
            if (Math.random() < entry.chance) {
                const count = entry.min ? Math.floor(Math.random() * ((entry.max || 1) - entry.min + 1)) + entry.min : 1;
                // Since Item component doesn't have count (only Instance does), 
                // we might need to push multiple items OR we just push 1 for now if stackable isn't supported in loot bag visual.
                // But Loot Window supports simple list.
                // Let's push 'count' times? No, that spills to ground.
                // We'll just push 1 for now, or check if Item has stack logic.
                // Hack: For gold/stackables, we might want a property?
                const item = createItemFromRegistry(entry.itemId, count);
                // If it's gold, we might want to stash the count in a property?
                // item.properties = { count: count }; // If we add this field
                items.push(item);
            }
        });
    }
    return items;
}

// --- LIGHTING SYSTEM (Moved up due to deletion) ---


// --- LIGHTING SYSTEM ---

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

        // Check Equipment
        for (const [_, inst] of inv.equipment) {
            const item = inst.item;
            if (item.glowColor) {
                if (item.glowRadius > maxRadius) {
                    maxRadius = item.glowRadius;
                    bestColor = item.glowColor;
                }
            }
        }

        // Check Backpack (Optional: Items glow in bag?)
        // Skipping for performance/simplicity or can iterate bag.

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
    world.addComponent(e, new Decay(300)); // 300s decay (5 mins)
    world.addComponent(e, new Interactable("Loot Corpse"));
    world.addComponent(e, new Lootable(loot));
    if (loot.length > 0) {
        // world.addComponent(e, new Lootable(loot)); // Removed redundant check

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

// --- Item Movement Logic ---
export function moveItem(world: World, source: any, target: any, ui: UIManager) {
    const player = world.query([PlayerControllable, Position, Inventory])[0];
    if (!player) return;

    const pPos = world.getComponent(player, Position)!;
    const inv = world.getComponent(player, Inventory)!;

    // 1. Validation: Distance
    // Source/Target could be { type: 'ground', x, y } or { type: 'slot', id }
    let targetPos = { x: pPos.x, y: pPos.y }; // Default to player pos for inventory checks

    if (source.type === 'ground') {
        targetPos = { x: source.x * 32, y: source.y * 32 };
    } else if (target.type === 'ground') {
        // If dropping, we check distance to drop location
        targetPos = { x: target.x * 32, y: target.y * 32 };
    }

    const dist = Math.sqrt(Math.pow(targetPos.x - pPos.x, 2) + Math.pow(targetPos.y - pPos.y, 2));
    if (dist > 80) { // < 2.5 tiles approx
        if ((ui as any).console) (ui as any).console.addSystemMessage("Too far away.");
        return;
    }

    // 2. Resolve Item from Source
    let item: any = null;
    let sourceContainer: any = null; // Tile or Inventory

    // Access Map via Global Game for now (Simpler than threading generic map everywhere)
    const game = (window as any).game;
    if (!game) return;
    const map = game.map;

    if (source.type === 'ground') {
        const tile = map.getTile(source.x, source.y);
        if (tile && tile.items.length > 0) {
            // Pick top item
            item = tile.items[tile.items.length - 1];
            if (item.id === 0) return; // Cannot move player
            sourceContainer = tile.items; // Array ref
        }
    } else if (source.type === 'slot') {
        // Extract slot name from "slot-head" -> "head"
        const slotName = source.id.replace('slot-', '');
        const equipped = inv.getEquipped(slotName);
        if (equipped) {
            item = equipped.item;
            // sourceContainer handled by inventory methods
        }
    }

    if (!item) return;

    // 3. Execute Move
    // Remove from Source
    if (source.type === 'ground') {
        // Remove from tile
        sourceContainer.pop();
    } else if (source.type === 'slot') {
        inv.unequip(source.id.replace('slot-', ''));
    }

    // Add to Target
    if (target.type === 'ground') {
        const tile = map.getTile(target.x, target.y);
        if (tile) {
            if (typeof item.id === 'number') {
                // If it's a raw TileItem-like object (from map)
                tile.items.push({ id: item.id, count: 1 });
            } else {
                // It's an Item Class Object?
                // The 'item' from inventory is 'Item', from Tile it's 'TileItem {id, count}'
                // We need to normalize.
                // If item has .id, use it. If item is Item class, retrieve ID from somewhere?
                // AssetManager usually maps IDs. Item class has uIndex.
                const id = item.uIndex !== undefined ? item.uIndex : item.id;
                tile.items.push({ id: id, count: 1 });
            }
        }
    } else if (target.type === 'slot') {
        const slotName = target.id.replace('slot-', '');

        // Hydrate Item if needed
        let properItem = item;
        // If it looks like a tile-item (raw ID or simplified)
        if (!item.name) {
            // We need to find the Item Definition by ID.
            // HACK: Create generic item.
            properItem = {
                id: item.id,
                uIndex: item.id,
                name: "Item " + item.id,
                type: "misc",
                damage: 0,
                defense: 0,
                value: 0,
                spriteId: item.id,
                slotType: 'any'
            };
        }

        // Wrap in ItemInstance if not already
        if (properItem.item) {
            inv.equip(slotName, properItem);
        } else {
            inv.equip(slotName, { item: properItem, count: 1, contents: [] });
        }
    }

    // 4. Update UI
    calculatePlayerStats(world, player);
    ui.update(player);
}

export function calculatePlayerStats(world: World, playerEntity: Entity) {
    const inv = world.getComponent(playerEntity, Inventory);
    if (!inv) return;

    let attack = 0;
    let defense = 0;

    // Slots to check
    const slots = ['head', 'body', 'legs', 'boots', 'lhand', 'rhand', 'amulet', 'ring'];

    for (const slot of slots) {
        const equipped = inv.getEquipped(slot);
        if (equipped && equipped.item) {
            // Check Registry by ID
            // Inventory items might be complex objects or just ids.
            // Our system uses ItemInstance { item: { id: number ... } }
            // Let's assume equipped.item.id matches ItemRegistry keys.

            // Fix: Access ID via spriteId or id property depending on Item structure
            const uIndex = equipped.item.uIndex !== undefined ? equipped.item.uIndex : equipped.item.id;
            const def = ItemRegistry[uIndex];

            if (def) {
                if (def.attack) attack += def.attack;
                if (def.defense) defense += def.defense;
            }
        }
    }

    // Update Visual Player
    const game = (window as any).game;
    if (game && game.player) {
        game.player.attack = attack;
        game.player.defense = defense;
        if (attack > 0 || defense > 0) {
            console.log(`[Stats] Updated: Atk ${attack}, Def ${defense}`);
        }
    }
}




// Helper to spawn items directly into the MAP GRID (so getObjectAt works)
export function spawnMapItem(x: number, y: number, id: number) {
    const game = (window as any).game;
    if (!game || !game.map) return;

    // Convert Pixel to Tile
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);

    const tile = game.map.getTile(tileX, tileY);
    if (tile) {
        // Push simple object {id, count} or Hydrated Item?
        // Map stores TileItems: { id: number, count: number }
        // BUT our main.ts logic hydrates them dynamically.
        // So we just push the raw ID.
        tile.items.push({ id: id, count: 1 });
        console.log(`[Debug] Spawned Map Item ${id} at ${tileX},${tileY}`);
    }
}

// --- MUSEUM SPAWN ---
import { BULK_SPRITES } from './data/bulk_constants';

export function spawnDebugSet(world: World, ui?: UIManager) {
    const playerEntity = world.query([PlayerControllable, Position])[0];
    if (playerEntity === undefined) return;
    const pos = world.getComponent(playerEntity, Position)!;

    const game = (window as any).game;
    const map = game.map;

    console.log("[Debug] Spawning Museum of All Assets...");
    if (ui && (ui as any).console) (ui as any).console.addSystemMessage("Spawning Museum of 50+ Assets...");

    // 1. Core Items
    const coreItems = [
        SPRITES.GOLDEN_HELMET, SPRITES.GOLDEN_ARMOR, SPRITES.GOLDEN_LEGS, SPRITES.GOLDEN_BOOTS, SPRITES.GOLDEN_SHIELD,
        SPRITES.ELF_ARMOR, SPRITES.ELF_LEGS, SPRITES.ELF_ICICLE_BOW,
        SPRITES.DWARF_HELMET, SPRITES.DWARF_ARMOR, SPRITES.DWARF_LEGS, SPRITES.DWARF_SHIELD, SPRITES.DWARF_GUARD,
        SPRITES.AXE, SPRITES.CLUB,
        SPRITES.TREE_PINE, SPRITES.TREE_OAK, SPRITES.ROCK_LARGE, SPRITES.GEM_RUBY, SPRITES.GEM_SAPPHIRE,
        SPRITES.ARMOR, SPRITES.LEGS, SPRITES.SHIELD, SPRITES.SHOVEL
    ];

    let row = 0;
    let col = 0;
    const MAX_COLS = 10;
    const START_X = pos.x;
    const START_Y = pos.y + 64; // Start below player

    // Helper to spawn
    const spawnAt = (id: number, r: number, c: number) => {
        const x = START_X + (c * 32);
        const y = START_Y + (r * 32);
        spawnMapItem(x, y, id);

        // Also spawn a Label (Floating Text) if possible? No, too much clutter.
    };

    // Spawn Core
    for (const id of coreItems) {
        spawnAt(id, row, col);
        col++;
        if (col >= MAX_COLS) { col = 0; row++; }
    }

    // 2. Spawn Bulk Collection (The 50+ Files)
    row += 2; // Spacer
    col = 0;
    const bulkIds = Object.values(BULK_SPRITES);
    for (const id of bulkIds) {
        if (typeof id === 'number') {
            spawnAt(id, row, col);
            col++;
            if (col >= MAX_COLS) { col = 0; row++; }
        }
    }
}
