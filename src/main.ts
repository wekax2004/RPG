import { World, InputHandler } from './engine';
import { inputSystem, movementSystem, renderSystem, tileRenderSystem, aiSystem, interactionSystem, itemPickupSystem, combatSystem, cameraSystem, floatingTextSystem, textRenderSystem, consumableSystem, enemyCombatSystem, autocloseSystem, magicSystem, projectileSystem, particleSystem, screenShakeSystem, decaySystem, castSpell, consumeItem, safeZoneRegenSystem, createPlayer, createEnemy, createBoss, createNPC, createMerchant, createItem, createTeleporter, TileMap, Camera, FloatingText, Health, PlayerControllable, Inventory, Facing, Mana, Experience, Skills, Position, NetworkItem, SpellBook, SkillPoints, ActiveSpell, updateStatsFromPassives, AI, Quest, QuestLog, QuestGiver, Interactable, Name } from './game';
import { Vocation, lightingRenderSystem, LightSource, RemotePlayer, Sprite, SPRITES, spriteSheet, Velocity } from './game'; // Fix TS2552
import { UIManager, ConsoleManager, CharacterCreation } from './ui';
import { saveGame, loadGame } from './save';
import { NetworkManager } from './network';
import { generateMap } from './map_gen';

import { AudioController } from './audio';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 240;

class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;
    private running: boolean = true;
    public pvpEnabled: boolean = false; // Safe by default

    private mapWidthPixels: number = 0;
    private mapHeightPixels: number = 0;
    private spawnX: number = 100;
    private spawnY: number = 100;

    public world: World;
    private input: InputHandler;
    public ui: UIManager;
    public console: ConsoleManager;
    private network: NetworkManager;
    public audio: AudioController;

    constructor() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        // Explicitly set internal resolution
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        // Initial UI Render - Removed invalid early call

        // Initialize ECS and UI
        this.world = new World();
        this.input = new InputHandler();
        this.ui = new UIManager();
        this.console = new ConsoleManager();
        this.network = new NetworkManager();
        this.audio = new AudioController();

        // Wire Consumable Callback
        this.ui.onConsume = (item) => {
            const playerEntity = this.world.query([PlayerControllable, Health])[0];
            if (playerEntity !== undefined) {
                const inv = this.world.getComponent(playerEntity, Inventory)!;
                // Consume
                if (consumeItem(this.world, playerEntity, item, this.audio, this.ui)) {
                    // If success, remove from inventory (Storage or Equipped logic handled by UI mostly, but we should ensure sync)
                    // UI's onclick already handles removal logic usually? 
                    // No, UI onclick was just "Equip". WE need to remove it here if we want "use" logic.

                    // Helper to find and remove ONE instance of this item
                    // Since `item` is the object ref, we can find it in storage.
                    const index = inv.storage.indexOf(item);
                    if (index > -1) {
                        inv.storage.splice(index, 1);
                    } else {
                        // Check equipped? Should not be equipped if in bag.
                    }

                    // Force Update UI
                    this.ui.updateInventory(inv, spriteSheet.src);
                }
            }
        };


        // Create PvP Indicator
        const pvpInd = document.createElement('div');
        pvpInd.id = 'pvp-indicator';
        pvpInd.style.position = 'absolute';
        pvpInd.style.top = '10px';
        pvpInd.style.right = '10px'; // Right side
        pvpInd.style.color = '#55ff55';
        pvpInd.style.fontFamily = "'VT323', monospace";
        pvpInd.style.fontSize = '24px';
        pvpInd.style.fontWeight = 'bold';
        pvpInd.style.zIndex = '4000';
        pvpInd.style.pointerEvents = 'none';
        pvpInd.innerText = "PvP: OFF";
        pvpInd.style.textShadow = '1px 1px 0 #000';
        pvpInd.style.border = '2px solid red'; // DEBUG VISIBILITY
        pvpInd.style.display = 'block';
        document.getElementById('game-viewport')!.appendChild(pvpInd);

        // Audio Auto-Init
        window.addEventListener('keydown', () => this.audio.init(), { once: true });
        window.addEventListener('mousedown', () => this.audio.init(), { once: true });

        // Link Network Chat to Console
        this.network.onMessage = (msg) => {
            this.console.addSystemMessage(msg);
        };

        this.network.onStats = (hp, maxHp, mana, maxMana) => {
            // Update Local Player
            const playerEntity = this.world.query([PlayerControllable, Health])[0];
            if (playerEntity !== undefined) {
                const healthComp = this.world.getComponent(playerEntity, Health);
                if (healthComp) {
                    healthComp.current = hp;
                    healthComp.max = maxHp;
                }

                const manaComp = this.world.getComponent(playerEntity, Mana);
                if (manaComp) {
                    manaComp.current = mana;
                    manaComp.max = maxMana;
                }
            }
        };



        // Link UI to Console for system messages
        this.ui.console = this.console;
    }

    async init() {
        this.console.addSystemMessage("Connecting to Retro RPG Server...");
        this.console.addSystemMessage("Assets Loading...");

        // Setup Network Login Callback
        // Setup Network Login Callback
        this.network.onLogin = (seed, spawnX, spawnY) => {
            console.log(`[Game] Login Accepted. Seed: ${seed}`);
            try {
                this.console.addSystemMessage("Connected to Server!");
                this.startGame(seed, spawnX, spawnY);
            } catch (err: any) {
                console.error("[Game] StartGame Error:", err);
            }
        };

        this.network.onEntityUpdate = (entities) => {
            try {
                // Get all existing remote players
                const remoteEntities = this.world.query([RemotePlayer, Position]);

                // Map existing IDs to Entities for fast lookup
                const existingMap = new Map<number, number>(); // ID -> EntityID
                for (const eid of remoteEntities) {
                    const rp = this.world.getComponent(eid, RemotePlayer)!;
                    existingMap.set(rp.id, eid);
                }

                const activeIds = new Set<number>();

                for (const data of entities) {
                    if (data.id === this.network.playerId) continue;

                    activeIds.add(data.id);

                    if (existingMap.has(data.id)) {
                        // Update Target instead of Snap
                        const eid = existingMap.get(data.id)!;
                        const rp = this.world.getComponent(eid, RemotePlayer)!;
                        rp.targetX = data.x;
                        rp.targetY = data.y;
                    } else {
                        // Create
                        const newEnt = this.world.createEntity();
                        this.world.addComponent(newEnt, new Position(data.x, data.y));
                        this.world.addComponent(newEnt, new Sprite(SPRITES.PLAYER));
                        this.world.addComponent(newEnt, new RemotePlayer(data.id, data.x, data.y));
                    }
                }

                // Cleanup disconnected players
                for (const eid of remoteEntities) {
                    const rp = this.world.getComponent(eid, RemotePlayer)!;
                    if (!activeIds.has(rp.id)) {
                        // console.log(`[Network] Removing Player ${rp.id}`);
                        this.world.removeEntity(eid);
                    }
                }
            } catch (err: any) {
                console.error("[Game] EntityUpdate Error:", err);
            }

        };

        this.network.onChat = (pid, msg) => {
            console.log(`[Game] Chat Rx from ${pid}: ${msg}`);
            // Display Chat Bubble
            // Find Entity
            let targetEnt = -1;

            // Check Local
            const localP = this.world.query([PlayerControllable])[0];
            if (localP !== undefined && this.network.playerId === pid) {
                targetEnt = localP;
            } else {
                // Check Remote
                const remotes = this.world.query([RemotePlayer]);
                for (const eid of remotes) {
                    const rp = this.world.getComponent(eid, RemotePlayer)!;
                    if (rp.id === pid) {
                        targetEnt = eid;
                        break;
                    }
                }
            }

            // console.log(`[Game] Chat Target Entity: ${targetEnt}`);

            // Add to Console Log (User Request)
            const senderName = (this.network.playerId === pid) ? "Me" : `Player${pid}`;
            this.console.sendMessage(`${senderName}: ${msg}`);



            if (targetEnt !== -1) {
                const pos = this.world.getComponent(targetEnt, Position)!;
                // Create Floating Text
                const ft = this.world.createEntity();
                this.world.addComponent(ft, new Position(pos.x, pos.y - 20)); // Above head
                this.world.addComponent(ft, new Velocity(0, -5)); // Float up slowly
                this.world.addComponent(ft, new FloatingText(msg, '#ffffff', 4.0, 4.0)); // 4s life, 4s max
                console.log(`[Game] Spawned Bubble for ${pid}`);
            }
        };

        this.network.onSpawnItem = (id, x, y, sprite, name) => {
            // console.log(`[Game] NetSpawn Item ${id}: ${name}`);
            let slot = 'rhand';
            if (name.includes('Potion')) slot = 'consumable';
            else if (name.includes('Shield')) slot = 'lhand';
            else if (name.includes('Coin') || name.includes('Gold')) slot = 'currency';

            // createItem(world, x, y, name, slot, sprite, dmg, price, network, netItem)
            createItem(this.world, x, y, name, slot, sprite, 0, 0, undefined, new NetworkItem(id));
        };

        this.network.onItemDespawn = (id) => {
            const items = this.world.query([NetworkItem]);
            for (const eid of items) {
                const net = this.world.getComponent(eid, NetworkItem)!;
                if (net.id === id) {
                    this.world.removeEntity(eid);
                    break;
                }
            }
        };

        // Listen for Global Keys (Chat)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.ui.isChatOpen()) {
                    // Send
                    const msg = this.ui.getChatInput();
                    if (msg.trim().length > 0) {
                        // Check Spells
                        if (msg.toLowerCase() === 'exura') {
                            castSpell(this.world, this.ui, 'exura', this.network);
                            // this.console.sendMessage("You cast 'exura'."); // castSpell logs it now?
                            // castSpell logs "You healed X" or "Not enough mana".
                            // Let's keep a log here just in case? No, duplication.
                            this.network.sendChat(msg);
                        } else if (msg.toLowerCase() === 'exori') {
                            castSpell(this.world, this.ui, 'heavystrike', this.network);
                            this.network.sendChat(msg);
                        } else if (msg.toLowerCase() === 'exori mas') {
                            castSpell(this.world, this.ui, 'exori mas', this.network);
                            this.network.sendChat(msg);
                        } else if (msg.toLowerCase() === 'exevo vis') {
                            castSpell(this.world, this.ui, 'exevo vis', this.network);
                            this.network.sendChat(msg);
                        } else if (msg.toLowerCase() === 'utito san') {
                            castSpell(this.world, this.ui, 'utito san', this.network);
                            this.network.sendChat(msg);
                        } else if (msg.toLowerCase() === '/reset' || msg.toLowerCase() === '/restart') {
                            // Debug Reset
                            const player = this.world.query([PlayerControllable, Experience, Health, Mana, Inventory, Skills])[0];
                            if (player !== undefined) {
                                const xp = this.world.getComponent(player, Experience)!;
                                const hp = this.world.getComponent(player, Health)!;
                                const mana = this.world.getComponent(player, Mana)!;
                                const inv = this.world.getComponent(player, Inventory)!;
                                const skills = this.world.getComponent(player, Skills)!;
                                const voc = this.world.getComponent(player, Vocation);

                                xp.level = 1;
                                xp.current = 0;
                                xp.next = 100;

                                if (voc) {
                                    // Hardcoded startup matching createPlayer (approx)
                                    // Ideally verify vocation name but simple reset is fine
                                    if (voc.name === 'Knight') { hp.max = 150; mana.max = 20; inv.cap = 450; }
                                    else if (voc.name === 'Mage') { hp.max = 80; mana.max = 100; inv.cap = 300; }
                                    else if (voc.name === 'Ranger') { hp.max = 100; mana.max = 60; inv.cap = 380; }
                                    else { hp.max = 150; mana.max = 50; inv.cap = 400; }
                                } else {
                                    hp.max = 200; mana.max = 50;
                                }
                                hp.current = hp.max;
                                mana.current = mana.max;

                                this.console.addSystemMessage("Character Reset to Level 1.");
                                this.ui.updateStatus(hp.current, hp.max, mana.current, mana.max, inv.cap, inv.gold, xp.level, xp.current, xp.next, skills);
                            }
                        } else {
                            this.network.sendChat(msg);
                        }
                    }
                    this.ui.toggleChat(); // Close
                } else {
                    // Open
                    this.ui.toggleChat();
                }
            } else if (e.key === 'Escape') {
                if (this.ui.isChatOpen()) {
                    this.ui.toggleChat(); // Close
                }
            } else if (this.ui.isChatOpen()) {
                // Stop other inputs from firing while typing!
                // console.log("[Game] Input blocked by Chat");
                e.stopImmediatePropagation(); // Ensure it stops engines
                e.stopPropagation();
            } else {
                // Game Hotkeys
                // Check both code (physical) and key (value)
                // Game Hotkeys
                // Check both code (physical) and key (value)
                if (e.code === 'KeyP' || e.key.toLowerCase() === 'p') {
                    console.log("[Game] Toggling PvP...");
                    this.pvpEnabled = !this.pvpEnabled;
                    const status = this.pvpEnabled ? "ENABLED (Unsafe)" : "DISABLED (Safe)";
                    this.console.addSystemMessage(`PvP Mode: ${status}`);
                    // Optional: Visual Notification
                    const player = this.world.query([PlayerControllable, Position])[0];
                    if (player !== undefined) {
                        const pos = this.world.getComponent(player, Position)!;
                        const color = this.pvpEnabled ? '#ff0000' : '#00ff00';
                        const ft = this.world.createEntity();
                        this.world.addComponent(ft, new Position(pos.x, pos.y - 30));
                        this.world.addComponent(ft, new Velocity(0, -10));
                        this.world.addComponent(ft, new FloatingText(this.pvpEnabled ? "PvP ON" : "Safe Mode", color, 2.0));
                    }
                    // Update DOM Indicator
                    const pvpEl = document.getElementById('pvp-indicator');
                    if (pvpEl) {
                        pvpEl.innerText = this.pvpEnabled ? "PvP: ON" : "PvP: OFF";
                        pvpEl.style.color = this.pvpEnabled ? "#ff5555" : "#55ff55";
                    }
                }

                // Magic Hotkeys (Moved to magicSystem in game.ts)
                // if (e.code === 'KeyK') { ... } REMOVED: Duplicate of magicSystem logic
            }
        }, true); // Capture phase
        // Better: InputHandler check ui.isChatOpen()

        // Attempt Login
        this.network.login("Player" + Math.floor(Math.random() * 1000));
    }

    async startGame(seed: number, spawnX: number, spawnY: number) {
        try {
            // Generate Map Procedurally (Larger world for Crypt)
            // Use Global Seed from Server
            const mapData = generateMap(256, 256, seed);
            console.log(`[Main] Map Generated. Entities: ${mapData.entities.length}.`);

            // FORCE DEBUG TILE (Tree) next to spawn
            const tileX = Math.floor(spawnX / 32) + 2;
            const tileY = Math.floor(spawnY / 32);
            mapData.data[tileY * 256 + tileX] = 34; // TREE (Test)
            console.log(`[Debug] Forced Tree (ID 34) at ${tileX}, ${tileY}`);

            // Create Map Entity
            const mapEntity = this.world.createEntity();
            this.world.addComponent(mapEntity, new TileMap(mapData.width, mapData.height, mapData.tileSize, mapData.data as number[]));

            this.mapWidthPixels = mapData.width * mapData.tileSize;
            this.mapHeightPixels = mapData.height * mapData.tileSize;

            // Override spawn with server data
            this.spawnX = spawnX;
            this.spawnY = spawnY;

            // Process Entities
            if (mapData.entities) {
                for (const ent of mapData.entities) {
                    if (ent.type === 'player') {
                        // Ignore local player spawn from map gen, use server spawn
                    } else if (ent.type === 'enemy') {
                        createEnemy(this.world, ent.x, ent.y, ent.enemyType, ent.difficulty || 1.0);
                    } else if (ent.type === 'npc') {
                        createNPC(this.world, ent.x, ent.y, ent.text);
                    } else if (ent.type === 'merchant') {
                        createMerchant(this.world, ent.x, ent.y);
                    } else if (ent.type === 'item') {
                        createItem(this.world, ent.x, ent.y, ent.name, ent.slot, ent.uIndex, ent.damage || 0);
                    } else if (ent.type === 'boss') {
                        createBoss(this.world, ent.x, ent.y);
                    } else if (ent.type === 'teleporter') {
                        createTeleporter(this.world, ent.x, ent.y, ent.targetX, ent.targetY);
                    } else if (ent.type === 'torch') {
                        const torch = this.world.createEntity();
                        this.world.addComponent(torch, new Position(ent.x, ent.y));
                        this.world.addComponent(torch, new LightSource(48, '#ff5500', true));
                    } else if (ent.type === 'static') {
                        const s = this.world.createEntity();
                        this.world.addComponent(s, new Position(ent.x, ent.y));
                        this.world.addComponent(s, new Sprite(ent.sprite, ent.size));
                    } else if (ent.type === 'quest_npc') {
                        this.createQuestNPC(ent.x, ent.y, ent.name, ent.quests);
                    }
                }
            }

            const camEntity = this.world.createEntity();
            this.world.addComponent(camEntity, new Camera(0, 0));

            // Initial UI Render
            this.ui.updateStatus(150, 150, 0, 100, 400, 0, 1, 0, 100);

            const hasSave = localStorage.getItem('retro-rpg-save-v2');

            if (hasSave) {
                console.log("Save found. Loading game...");
                createPlayer(this.world, this.spawnX, this.spawnY, this.input, 'knight');
                if (loadGame(this.world, this.ui)) {
                    // Ensure Skills exist (Migration for old saves)
                    const player = this.world.query([PlayerControllable])[0];
                    if (player !== undefined) {
                        // Migration 1: Skills
                        if (!this.world.getComponent(player, Skills)) {
                            this.world.addComponent(player, new Skills());
                            this.world.addComponent(player, new Vocation("Knight", 15, 5, 25)); // Default
                            this.console.addSystemMessage("Save migrated: Skills added.");
                        }

                        // Migration 2: Map Expansion (Old center ~480, New center ~1024)
                        const pos = this.world.getComponent(player, Position)!;
                        if (pos.x < 800) {
                            pos.x = this.spawnX;
                            pos.y = this.spawnY;
                            this.console.addSystemMessage("World Updated: Moved to new village.");
                        }

                        // Recalculate stats
                        updateStatsFromPassives(this.world, player);
                    }
                    this.console.addSystemMessage("Save Loaded.");
                    // Force Inventory Update
                    const inv = this.world.getComponent(player, Inventory);
                    if (inv) this.ui.updateInventory(inv, spriteSheet.src);
                }
                this.startGameLoop();
            } else {
                console.log("No save found. Starting Character Creation...");
                const cc = new CharacterCreation((vocation) => {
                    console.log(`Vocation selected: ${vocation}`);
                    createPlayer(this.world, this.spawnX, this.spawnY, this.input, vocation);
                    this.console.addSystemMessage(`You have chosen the path of the ${vocation}.`);

                    // Force Inventory Update (New Character)
                    const player = this.world.query([PlayerControllable])[0];
                    if (player !== undefined) {
                        const inv = this.world.getComponent(player, Inventory);
                        if (inv) this.ui.updateInventory(inv, spriteSheet.src);
                    }

                    this.startGameLoop();
                });
                cc.show();
            }

        } catch (e) {
            console.error("Failed to load map:", e);
            this.console.addSystemMessage("Failed to load map.");
        }
        // Save on Exit/Refresh
        window.addEventListener('beforeunload', () => {
            if (this.running) saveGame(this.world, this.ui);
        });
    }

    startGameLoop() {
        this.console.addSystemMessage("World Loaded.");
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        // Auto-Save Loop
        setInterval(() => {
            if (this.running) saveGame(this.world, this.ui);
        }, 5000);
    }

    update(dt: number) {
        inputSystem(this.world, this.input);
        inputSystem(this.world, this.input);
        // autocloseSystem(this.world, this.ui); // DISABLED: Causing rapid open/close toggle loops

        // Run Magic System always (to allow toggling UI/Skills)
        magicSystem(this.world, this.input, this.ui);

        // System Updates
        if (!this.ui.isShowing()) {
            aiSystem(this.world, dt);
            interactionSystem(this.world, this.input, this.ui);
            movementSystem(this.world, dt, this.audio, this.network);
            itemPickupSystem(this.world, this.ui, this.audio, this.network);
            // Pass UI for console messages, and Network for PvP
            combatSystem(this.world, this.input, this.audio, this.ui, this.network, this.pvpEnabled);
            // magicSystem moved out to allow toggling UI
            consumableSystem(this.world, this.input, this.ui);
            safeZoneRegenSystem(this.world, dt, this.ui);
            decaySystem(this.world, dt);
            floatingTextSystem(this.world, dt);
            particleSystem(this.world, dt);
            screenShakeSystem(this.world, dt);
            // The original consumableSystem call was duplicated, this one is removed as per the instruction's snippet.
            // consumableSystem(this.world, this.input, this.ui); 
            enemyCombatSystem(this.world, dt, this.ui, this.audio);

            // Audio Updates
            const playerPos = this.world.query([PlayerControllable, Position]).map(id => this.world.getComponent(id, Position)!)[0];
            const lights = this.world.query([LightSource, Position]).map(id => this.world.getComponent(id, Position)!);

            if (playerPos) {
                this.audio.update(dt, playerPos.x, playerPos.y, lights);

                // Ambience Zone Check
                // Village Center ~ (128*16)/2 = 1024. Crypt starts somewhere else?
                // In map_gen, Crypt/Dungeon levels have specific origins. 
                // Simple check: If Y > 1200
                if (playerPos.y > 1200) {
                    this.audio.setAmbience('crypt');
                } else {
                    this.audio.setAmbience('village');
                }
            }

        }

        // Camera follows player (Moved outside UI check)
        cameraSystem(this.world, this.mapWidthPixels, this.mapHeightPixels);

        interactionSystem(this.world, this.input, this.ui);

        // UI Updates
        const playerEntity = this.world.query([PlayerControllable, Health, Inventory])[0];
        if (playerEntity !== undefined) {
            const health = this.world.getComponent(playerEntity, Health)!;
            const inv = this.world.getComponent(playerEntity, Inventory)!;
            const mana = this.world.getComponent(playerEntity, Mana);

            // Self-Heal Gold logic for old saves
            if (typeof inv.gold !== 'number') {
                inv.gold = 100;
            }

            // TEST: Grant infinite wealth for testing
            if (inv.gold < 9999) {
                inv.gold = 9999;
            }

            const xpComp = this.world.getComponent(playerEntity, Experience);
            const skills = this.world.getComponent(playerEntity, Skills);

            this.ui.updateStatus(
                health.current, health.max,
                mana ? mana.current : 0, mana ? mana.max : 0,
                inv.cap || 400,
                inv.gold,
                xpComp ? xpComp.level : 1,
                xpComp ? xpComp.current : 0,
                xpComp ? xpComp.next : 100,
                skills
            );

            // Update Quest Panel
            const qLog = this.world.getComponent(playerEntity, QuestLog);
            if (qLog) {
                this.updateQuestPanel(qLog);
            }

            // Q key to toggle quest panel
            if (this.input.isJustPressed('KeyQ')) {
                const questPanel = document.getElementById('quest-panel');
                if (questPanel) {
                    questPanel.classList.toggle('hidden');
                }
            }
        }

        // Clear justPressed state
        this.input.update();
    }

    updateQuestPanel(qLog: QuestLog) {
        const questList = document.getElementById('quest-list');
        if (!questList) return;

        questList.innerHTML = '';

        if (qLog.quests.length === 0) {
            questList.innerHTML = '<div class="quest-empty" style="color: #888; padding: 8px; text-align: center;">No active quests</div>';
            return;
        }

        for (const quest of qLog.quests) {
            const questDiv = document.createElement('div');
            questDiv.className = `quest-item${quest.completed ? ' quest-completed' : ''}`;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'quest-name';
            nameDiv.textContent = quest.name;

            const progressDiv = document.createElement('div');
            progressDiv.className = 'quest-progress';
            if (quest.completed) {
                progressDiv.textContent = '✓ Complete - Return to NPC';
            } else {
                progressDiv.textContent = `${quest.current}/${quest.required} ${quest.target}s`;
            }

            questDiv.appendChild(nameDiv);
            questDiv.appendChild(progressDiv);
            questList.appendChild(questDiv);
        }
    }

    render() {
        // Clear screen
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Map FIRST (background)
        tileRenderSystem(this.world, this.ctx);

        // Draw Entities (foreground)
        renderSystem(this.world, this.ctx);

        // Lighting Overlay (Day: 0.1, Night: 0.9)
        lightingRenderSystem(this.world, this.ctx, 0.0); // 0.0 = Bright Day

        // Draw Floating Text (UI overlay layer)
        textRenderSystem(this.world, this.ctx);

        // Draw Minimap (top-right corner)
        this.drawMinimap();

        // Draw debug text
        if (!this.ui.isShowing()) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px monospace';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px monospace';
            const pvpStatus = this.pvpEnabled ? "PvP: ON" : "PvP: OFF";
            this.ctx.fillText(`WASD: Move | SPACE: Talk | F: Attack | P: Toggle PvP (${pvpStatus})`, 4, 10);
        }
    }

    drawMinimap() {
        const minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
        if (!minimapCanvas) return;
        const mCtx = minimapCanvas.getContext('2d');
        if (!mCtx) return;

        const mapSize = minimapCanvas.width; // Use canvas size
        const mapX = 0; // Draw at origin of minimap canvas
        const mapY = 0;

        // Get player position
        const playerEntity = this.world.query([PlayerControllable, Position])[0];
        if (!playerEntity) return;
        const playerPos = this.world.getComponent(playerEntity, Position)!;

        const scale = mapSize / this.mapWidthPixels; // Scale factor

        // Clear minimap
        mCtx.fillStyle = '#111';
        mCtx.fillRect(0, 0, mapSize, mapSize);

        // Draw terrain (simplified - just show tiles near player)
        const mapEntities = this.world.query([TileMap]);
        if (mapEntities.length > 0) {
            const map = this.world.getComponent(mapEntities[0], TileMap)!;
            const tileScale = mapSize / (map.width * map.tileSize) * map.tileSize;

            // Only draw visible area (centered on player)
            const viewRadius = 30; // tiles
            const playerTileX = Math.floor(playerPos.x / map.tileSize);
            const playerTileY = Math.floor(playerPos.y / map.tileSize);

            for (let dy = -viewRadius; dy <= viewRadius; dy++) {
                for (let dx = -viewRadius; dx <= viewRadius; dx++) {
                    const tx = playerTileX + dx;
                    const ty = playerTileY + dy;
                    if (tx < 0 || tx >= map.width || ty < 0 || ty >= map.height) continue;

                    const tileId = map.data[ty * map.width + tx];
                    const mx = mapX + (tx * tileScale);
                    const my = mapY + (ty * tileScale);

                    // Color based on tile type
                    if (tileId === 16) mCtx.fillStyle = '#2d5a1e'; // Grass
                    else if (tileId === 17) mCtx.fillStyle = '#654'; // Wall
                    else if (tileId === 18) mCtx.fillStyle = '#246'; // Water
                    else if (tileId === 34) mCtx.fillStyle = '#1a4a1a'; // Tree
                    else if (tileId === 23) mCtx.fillStyle = '#555'; // Stone
                    else if (tileId === 19) mCtx.fillStyle = '#532'; // Wood
                    else mCtx.fillStyle = '#333';

                    mCtx.fillRect(mx, my, Math.max(1, tileScale), Math.max(1, tileScale));
                }
            }
        }

        // Draw enemies as red dots
        const enemies = this.world.query([Position, AI]);
        for (const eid of enemies) {
            const ePos = this.world.getComponent(eid, Position)!;
            const ex = mapX + (ePos.x * scale);
            const ey = mapY + (ePos.y * scale);
            if (ex >= mapX && ex <= mapX + mapSize && ey >= mapY && ey <= mapY + mapSize) {
                mCtx.fillStyle = '#f00';
                mCtx.fillRect(ex - 1, ey - 1, 3, 3);
            }
        }

        // Draw player as white dot
        const px = mapX + (playerPos.x * scale);
        const py = mapY + (playerPos.y * scale);
        mCtx.fillStyle = '#fff';
        mCtx.fillRect(px - 2, py - 2, 5, 5);

        // Border
        mCtx.strokeStyle = '#666';
        mCtx.lineWidth = 1;
        mCtx.strokeRect(0, 0, mapSize, mapSize);
    }

    createQuestNPC(x: number, y: number, name: string, quests: Quest[]) {
        const e = this.world.createEntity();
        this.world.addComponent(e, new Position(x, y));
        this.world.addComponent(e, new Sprite(SPRITES.NPC, 32));
        this.world.addComponent(e, new Name(name));
        this.world.addComponent(e, new Interactable(`Talk to ${name}`));
        this.world.addComponent(e, new QuestGiver(quests, name));
        return e;
    }

    loop(timestamp: number) {
        if (!this.running) return;

        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        // input.update(); // REMOVED: Duplicate call (called in update())

        requestAnimationFrame(this.loop);
    }
}

// Start Game
window.onload = () => {
    try {
        console.log("Initializing Game...");
        const game = new Game();
        (window as any).game = game;

        console.log('[Debug] RemotePlayer class:', RemotePlayer);
        console.log('[Debug] Sprite class:', Sprite);

        // Init Game (Async)
        game.init().then(() => {
            console.log("Game Initialized");

            // Remove Loading Screen
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';

        }).catch(e => {
            throw e;
        });

    } catch (e: any) {
        console.error("Game Init Failed:", e);
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerText = `Error: ${e.message}\nCheck Console (Ctrl+Shift+I)`;
            loading.style.color = 'red';
        }
    }
};
