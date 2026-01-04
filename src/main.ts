import { World, InputHandler } from './engine';
import { inputSystem, movementSystem, renderSystem, tileRenderSystem, aiSystem, interactionSystem, itemPickupSystem, combatSystem, cameraSystem, floatingTextSystem, textRenderSystem, consumableSystem, enemyCombatSystem, autocloseSystem, magicSystem, projectileSystem, particleSystem, screenShakeSystem, castSpell, createPlayer, createEnemy, createBoss, createNPC, createMerchant, createItem, createTeleporter, TileMap, Camera, FloatingText, Health, PlayerControllable, Inventory, Facing, Mana, Experience, Skills, Position } from './game';
import { Vocation } from './game'; // Fix TS2552
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

        // Initialize ECS and UI
        this.world = new World();
        this.input = new InputHandler();
        this.ui = new UIManager();
        this.console = new ConsoleManager();
        this.network = new NetworkManager();
        this.audio = new AudioController();

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

        // Chat Input Logic
        const chatContainer = document.getElementById('console-panel')!;
        const chatInput = document.getElementById('console-input') as HTMLInputElement;

        // 1. Window Listener: ONLY for Opening Chat
        // Unified Chat Listener
        window.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            const isInputFocused = active && active.id === 'console-input';

            if (e.key === 'Enter') {
                if (isInputFocused) {
                    // SEND
                    e.preventDefault();
                    e.stopPropagation();

                    const msg = chatInput.value;
                    if (this.ui.console) console.log(`[Debug] Sending: '${msg}'`);

                    if (msg) {
                        if (msg) {
                            try {
                                const cleanMsg = msg.trim().toLowerCase();
                                // DEBUG
                                console.log(`[Debug] Checking: '${cleanMsg}'`);

                                if (cleanMsg === 'exura') {
                                    console.log(`[Debug] Casting Exura!`);
                                    castSpell(this.world, this.ui, 'exura');
                                } else if (cleanMsg === 'adori flam') {
                                    console.log(`[Debug] Casting Fireball!`);
                                    castSpell(this.world, this.ui, 'fireball');
                                } else if (cleanMsg === 'exori') {
                                    console.log(`[Debug] Casting Heavy Strike!`);
                                    castSpell(this.world, this.ui, 'heavystrike');
                                } else if (cleanMsg === '/reset') {
                                    if (confirm("Are you sure you want to wipe your save data?")) {
                                        this.running = false; // Stop game loop to prevent auto-save
                                        localStorage.removeItem('retro-rpg-save-v2');
                                        location.reload();
                                    }
                                } else {
                                    this.network.sendSay(msg);
                                }
                            } catch (err: any) {
                                if (this.ui.console) this.ui.console.addSystemMessage(`[Error] Send Failed: ${err.message}`);
                            }
                            chatInput.value = '';
                        }
                    }

                    chatInput.blur();
                    this.canvas.focus();
                } else {
                    // FOCUS
                    e.preventDefault();
                    chatInput.focus();
                    // if (this.ui.console) this.ui.console.addSystemMessage("[Debug] Chat Focused");
                }
            } else if (e.key === 'Escape') {
                if (isInputFocused) {
                    chatInput.blur();
                    this.canvas.focus();
                    chatInput.value = '';
                }
            } else {
                // Prevent game input if chatting
                if (isInputFocused) {
                    e.stopPropagation();
                }
            }
        });

        // Remove individual listener to avoid conflict
        // chatInput.addEventListener('keydown', ...) // Removed

        // Link UI to Console for system messages
        this.ui.console = this.console;
    }

    async init() {
        this.console.addSystemMessage("Connecting to Retro RPG Server...");
        this.console.addSystemMessage("Assets Loading...");

        try {
            // const response = await fetch('/maps/village.json?t=' + Date.now() + Math.random());
            // const mapData = await response.json();

            // Generate Map Procedurally (Larger world for Crypt)
            const mapData = generateMap(128, 128);

            // Create Map Entity
            const mapEntity = this.world.createEntity();
            this.world.addComponent(mapEntity, new TileMap(mapData.width, mapData.height, mapData.tileSize, mapData.data as number[]));

            this.mapWidthPixels = mapData.width * mapData.tileSize;
            this.mapHeightPixels = mapData.height * mapData.tileSize;

            // Process Entities
            if (mapData.entities) {
                for (const ent of mapData.entities) {
                    if (ent.type === 'player') {
                        this.spawnX = ent.x;
                        this.spawnY = ent.y;
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
                    }
                }
            }

            const camEntity = this.world.createEntity();
            this.world.addComponent(camEntity, new Camera(0, 0));

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
                    }
                    this.console.addSystemMessage("Save Loaded.");
                }
                this.startGameLoop();
            } else {
                console.log("No save found. Starting Character Creation...");
                const cc = new CharacterCreation((vocation) => {
                    console.log(`Vocation selected: ${vocation}`);
                    createPlayer(this.world, this.spawnX, this.spawnY, this.input, vocation);
                    this.console.addSystemMessage(`You have chosen the path of the ${vocation}.`);
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
        autocloseSystem(this.world, this.ui);

        // System Updates
        if (!this.ui.isShowing()) {
            aiSystem(this.world, dt);
            movementSystem(this.world, dt);
            itemPickupSystem(this.world, this.ui, this.audio);

            magicSystem(this.world, this.input, this.ui);
            projectileSystem(this.world, dt, this.ui, this.audio);
            combatSystem(this.world, this.input, this.ui, this.audio);
            floatingTextSystem(this.world, dt);
            particleSystem(this.world, dt);
            screenShakeSystem(this.world, dt);
            consumableSystem(this.world, this.input, this.ui);
            enemyCombatSystem(this.world, dt, this.ui, this.audio);

            // Camera follows player
            cameraSystem(this.world, this.mapWidthPixels, this.mapHeightPixels);
        }
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

            // Migration: Convert old "Shield" (generic) to Wooden Shield Sprite (35)
            // If item name is "Shield" and uses Tower Shield sprite (33), fix it.
            inv.items.forEach(item => {
                if (item.name === "Shield" && item.uIndex === 33) {
                    item.uIndex = 35; // WOODEN_SHIELD
                    item.name = "Wooden Shield";
                    item.description = "Basic protection. Blk: 2";
                    item.price = 50;
                }
                // Migration: Convert "Spare Sword", "Sword", or unknown item using SWORD sprite to Wooden Sword (37)
                // BUT keep "Iron Sword" as is.
                if (item.uIndex === 34 && item.name !== "Iron Sword") {
                    item.uIndex = 37; // WOODEN_SWORD
                    item.name = "Wooden Sword";
                    item.description = "Training gear. Dmg: 5";
                    item.price = 50;
                }
                // Fix Potions
                if (item.name === "Potion") item.price = 50;
                if (item.name === "Iron Sword") item.price = 150;
                if (item.name === "Tower Shield") item.price = 200;
                if (item.name === "Noble Sword") item.price = 400;
            });
            inv.storage.forEach(item => {
                if (item.name === "Shield" && item.uIndex === 33) {
                    item.uIndex = 35; // WOODEN_SHIELD
                    item.name = "Wooden Shield";
                    item.description = "Basic protection. Blk: 2";
                    item.price = 50;
                }
                if (item.uIndex === 34 && item.name !== "Iron Sword") {
                    item.uIndex = 37; // WOODEN_SWORD
                    item.name = "Wooden Sword";
                    item.description = "Training gear. Dmg: 5";
                    item.price = 50;
                }
                // Fix Potions
                if (item.name === "Potion") item.price = 50;
                if (item.name === "Wooden Sword") item.price = 50; // Explicit fix
                if (item.name === "Wooden Shield") item.price = 50; // Explicit fix
                if (item.name === "Iron Sword") item.price = 150;
                if (item.name === "Tower Shield") item.price = 200;
                if (item.name === "Noble Sword") item.price = 400;
            });

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
        }

        // Clear justPressed state
        this.input.update();
    }

    render() {
        // Clear screen
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Map FIRST (background)
        tileRenderSystem(this.world, this.ctx);

        // Draw Entities (foreground)
        renderSystem(this.world, this.ctx);

        // Draw Floating Text (UI overlay layer)
        textRenderSystem(this.world, this.ctx);

        // Draw debug text
        if (!this.ui.isShowing()) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px monospace';
            this.ctx.fillText('WASD: Move | SPACE: Talk | F: Attack', 4, 10);
        }
    }

    loop(timestamp: number) {
        if (!this.running) return;

        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        this.input.update();

        requestAnimationFrame(this.loop);
    }
}

// Start Game
window.onload = () => {
    try {
        console.log("Initializing Game...");
        const game = new Game();
        (window as any).game = game;

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

