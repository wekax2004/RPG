import { Entity, World } from '../engine';
import { SPRITES } from '../constants';
import { Player } from '../core/player';
import { WorldMap } from '../core/map';
import { Health, Name, Position, Sprite, Target, Inventory, ItemInstance, Skills, PlayerControllable, Item } from '../components';
import { assetManager } from '../assets';
import { ItemRegistry } from '../data/items';
import { attemptCastSpell } from '../game';
import { gameEvents, EVENTS } from '../core/events';

// Define what an Open Window looks like
interface ContainerWindow {
    uid: string; // Unique ID to track window
    item: ItemInstance;  // Reference to the actual item data
    x: number;   // Screen X
    y: number;   // Screen Y
    rows: number;
    cols: number;
}

export class UIManager {
    private battleList: HTMLElement;
    private chatLog: HTMLElement;
    private hpBar: HTMLElement;
    private manaBar: HTMLElement;

    // Cache for stats
    private hpVal: HTMLElement;
    private manaVal: HTMLElement;
    private capVal: HTMLElement;
    private lvlVal: HTMLElement;
    private xpVal: HTMLElement;
    private goldVal: HTMLElement;

    // Compatibility Stubs for Game.ts
    public shopPanel: HTMLElement = document.createElement('div');
    public bagPanel: HTMLElement = document.createElement('div'); // Stub for compatibility
    public currentMerchant: any = null;
    public activeMerchantId: any | null = null;
    public console: any = { addSystemMessage: (msg: string) => this.log(msg) };
    public world: World | undefined;

    public updateInventory(inv: any): void {
        // Trigger re-render of bag if open
        // this.renderBag(inv); 
    }


    // Loot Panel Properties
    public activeLootEntityId: number | null = null;
    public lootPanel: HTMLElement;
    private lootGrid: HTMLElement;

    // NPC Dialogue
    public dialogPanel: HTMLElement;
    public dialogText: HTMLElement;
    public dialogNextBtn: HTMLElement;


    private _lastBattleUpdate: number = 0;

    // NEW: List of open windows
    openContainers: ContainerWindow[] = [];

    // Dragging State
    public draggedItem: any | null = null;
    public draggingFrom: { type: 'slot' | 'container', index?: number, slot?: string, containerIndex?: number } | null = null;
    public mouseX: number = 0;
    public mouseY: number = 0;

    private chatInput!: HTMLInputElement;

    // Cache
    private equipmentSlots: Record<string, HTMLElement> = {};
    private skillsPanel: HTMLElement | null = null; // New Skills Panel
    private inventoryPanel: HTMLElement | null = null; // New Inventory Panel

    // Shop
    public targetingItem: any = null;

    // Player Reference (Cached from update)
    public player: Player | null = null;

    constructor() {
        // Global Right Click Cancel
        document.addEventListener('contextmenu', (e) => {
            if (this.targetingItem) {
                e.preventDefault();
                this.targetingItem = null;
                document.body.style.cursor = 'default';
                document.body.style.cursor = 'default';
                this.log("Targeting cancelled.");
            }
        });

        // Global Mouse Move for Dragging
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Global Mouse Up for Dropping (Cancel drag if outside valid drop zone)
        document.addEventListener('mouseup', (e) => {
            if (this.draggedItem) {
                // If we dropped on nothing valid (handled by specific elements' mouseup), cancel.
                // We use a small timeout to allow specific handlers to fire first.
                setTimeout(() => {
                    if (this.draggedItem) {
                        this.log("Drop cancelled.");
                        this.draggedItem = null;
                        this.draggingFrom = null;
                    }
                }, 50);
            }
        });

        // Battle List
        this.battleList = document.getElementById('battle-list')!;
        if (!this.battleList) console.error("UI: #battle-list not found");

        // Chat
        this.chatLog = document.getElementById('chat-log')!;
        if (!this.chatLog) console.error("UI: #chat-log not found");

        const chatInput = document.getElementById('chat-input') as HTMLInputElement;
        if (chatInput) {
            this.chatInput = chatInput; // Cache it
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.onChatInput();
                }
            });
        }

        // Equipment UI Setup
        this.setupEquipmentUI();

        // HUD - Health/Mana
        this.hpBar = document.getElementById('hp-bar') as HTMLElement;
        this.manaBar = document.getElementById('mana-bar') as HTMLElement;
        this.hpVal = document.getElementById('hp-text')!;
        this.manaVal = document.getElementById('mana-text')!;

        // HUD - Stats
        this.capVal = document.getElementById('slot-cap')!;
        this.lvlVal = document.getElementById('lvl-val')!;
        this.xpVal = document.getElementById('xp-pct')!;
        this.goldVal = document.getElementById('gold-val')!;

        // --- PHASE 5: EVENT-DRIVEN UI ---
        gameEvents.on(EVENTS.PLAYER_STATS_CHANGED, (player: Player) => {
            this.handleStatsUpdate(player);
        });

        gameEvents.on(EVENTS.INVENTORY_CHANGED, (inv: Inventory) => {
            this.updateEquipment(inv);
        });

        gameEvents.on(EVENTS.SYSTEM_MESSAGE, (msg: string) => {
            this.log(msg);
        });

        // 2. Initialize the Loot Panel
        this.lootPanel = document.createElement('div');
        this.lootPanel.id = 'loot-panel';
        this.lootPanel.innerHTML = `
            <div class="loot-header">
                <span>Loot</span>
                <span class="close-btn" onclick="document.getElementById('loot-panel').style.display='none'">X</span>
            </div>
            <div class="loot-grid" id="loot-grid-content"></div>
        `;
        document.body.appendChild(this.lootPanel);

        this.lootGrid = document.getElementById('loot-grid-content')!;

        // 3. Initialize Dialogue Panel
        this.dialogPanel = document.createElement('div');
        this.dialogPanel.id = 'dialog-panel';
        this.dialogPanel.innerHTML = `
            <div class="dialog-content">
                <p id="dialog-text">...</p>
                <div class="dialog-buttons">
                    <button id="dialog-next">Next</button>
                    <button id="dialog-trade" style="display:none">Trade</button>
                    <button id="dialog-close">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.dialogPanel);
        this.dialogText = document.getElementById('dialog-text')!;
        this.dialogNextBtn = document.getElementById('dialog-next')!;

        document.getElementById('dialog-close')!.onclick = () => this.hideDialogue();

        // Bind the close button properly if needed, or rely on inline onclick above
        const closeBtn = this.lootPanel.querySelector('.close-btn') as HTMLElement;
        closeBtn.onclick = () => this.hideDialogue();

        // 4. Initialize Shop Panel with Buy/Sell Tabs
        this.shopPanel = document.createElement('div');
        this.shopPanel.id = 'shop-panel';
        this.shopPanel.innerHTML = `
            <div class="shop-header">
                <span>Shop</span>
                <span class="close-btn" onclick="document.getElementById('shop-panel').style.display='none'">X</span>
            </div>
            <div class="shop-tabs">
                <button class="shop-tab active" id="shop-tab-buy">Buy</button>
                <button class="shop-tab" id="shop-tab-sell">Sell</button>
            </div>
            <div class="shop-grid" id="shop-grid-content"></div>
            <div class="shop-grid" id="shop-sell-content" style="display:none"></div>
        `;
        document.body.appendChild(this.shopPanel);
        this.shopPanel.querySelector('.close-btn')!.addEventListener('click', () => this.hideDialogue());

        // Tab switching logic
        const buyTab = this.shopPanel.querySelector('#shop-tab-buy') as HTMLElement;
        const sellTab = this.shopPanel.querySelector('#shop-tab-sell') as HTMLElement;
        const buyGrid = this.shopPanel.querySelector('#shop-grid-content') as HTMLElement;
        const sellGrid = this.shopPanel.querySelector('#shop-sell-content') as HTMLElement;

        buyTab.onclick = () => {
            buyTab.classList.add('active');
            sellTab.classList.remove('active');
            buyGrid.style.display = 'block';
            sellGrid.style.display = 'none';
        };

        sellTab.onclick = () => {
            sellTab.classList.add('active');
            buyTab.classList.remove('active');
            sellGrid.style.display = 'block';
            buyGrid.style.display = 'none';
            this.renderSellGrid();
        };
    }

    /**
     * Updates the Battle List sidebar with visible entities.
     */
    updateBattleList(entities: Entity[], world: any, player: Player) {
        if (!this.battleList) return;

        // Throttle updates (prevents flickering)
        const now = Date.now();
        if ((this as any)._lastBattleUpdate && now - (this as any)._lastBattleUpdate < 250) return;
        (this as any)._lastBattleUpdate = now;

        const playerPos = world.getComponent(player.id, Position);
        const activeIds = new Set<number>();

        entities.forEach(entityId => {
            if (entityId === player.id) return;

            const nameComp = world.getComponent(entityId, Name);
            const healthComp = world.getComponent(entityId, Health);
            const posComp = world.getComponent(entityId, Position);

            if (!nameComp || (healthComp && healthComp.current <= 0) || !posComp) return;

            // Distance Check
            if (playerPos) {
                const dist = Math.sqrt(Math.pow(playerPos.x - posComp.x, 2) + Math.pow(playerPos.y - posComp.y, 2));
                if (dist > 320) return;
            }

            activeIds.add(entityId);

            // Find existing entry
            let entry = document.getElementById(`battle-entry-${entityId}`);
            let hpBarFill: HTMLElement | null = null;

            if (!entry) {
                entry = document.createElement('div');
                entry.id = `battle-entry-${entityId}`;
                entry.className = 'battle-entry';

                // Construct inner HTML structure once
                // Using a progress bar look
                const nameSpan = document.createElement('span');
                nameSpan.className = 'be-name';

                const hpBar = document.createElement('div');
                hpBar.className = 'be-hp-bar';
                hpBarFill = document.createElement('div');
                hpBarFill.className = 'be-hp-fill';
                hpBar.appendChild(hpBarFill);

                entry.appendChild(nameSpan);
                entry.appendChild(hpBar);

                // Click Handler - defined once
                entry.onclick = (e) => {
                    e.stopPropagation(); // Safe habit
                    // Re-fetch component to get latest target status
                    const pTarg = world.getComponent(player.id, Target);
                    const currentTargId = pTarg ? pTarg.targetId : null;

                    if (currentTargId === entityId) {
                        player.targetId = null;
                    } else {
                        player.targetId = entityId;
                    }
                    // Force visual update next frame if needed, but styling handles immediate feedback usually
                    (this as any)._lastBattleUpdate = 0; // Trigger immediate refresh
                };

                this.battleList.appendChild(entry);
            } else {
                hpBarFill = entry.querySelector('.be-hp-fill');
            }

            // Update Content
            const pct = Math.floor((healthComp.current / healthComp.max) * 100);
            const nameSpan = entry.querySelector('.be-name') as HTMLElement;
            if (nameSpan) nameSpan.innerText = `${nameComp.value} [${pct}%]`;

            if (hpBarFill) {
                hpBarFill.style.width = `${pct}%`;
                hpBarFill.style.backgroundColor = pct < 25 ? '#d00' : (pct < 50 ? '#da0' : '#0d0');
            }

            // Highlight
            const currentTarget = world.getComponent(player.id, Target);
            const isTargeted = player.targetId === entityId || (currentTarget && currentTarget.targetId === entityId);

            if (isTargeted) {
                entry.classList.add('targeted');
                entry.style.borderColor = '#ff5555';
            } else {
                entry.classList.remove('targeted');
                entry.style.borderColor = '#444';
            }
        });

        // Cleanup removed entities
        Array.from(this.battleList.children).forEach((child: any) => {
            const idStr = child.id.replace('battle-entry-', '');
            const id = parseInt(idStr);
            if (!activeIds.has(id)) {
                this.battleList.removeChild(child);
            }
        });
    }

    /**
     * Appends a message to the Chat Console.
     * @param message Text to display
     * @param color CSS color string (default white)
     */
    log(message: string, color: string = '#ccc') {
        if (!this.chatLog) return;

        const line = document.createElement('div');
        line.style.color = color;
        line.innerText = message;

        // Timestamp
        const now = new Date();
        const time = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}] `;
        const timeSpan = document.createElement('span');
        timeSpan.style.color = '#666';
        timeSpan.innerText = time;

        line.prepend(timeSpan);

        this.chatLog.appendChild(line);
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    private onChatInput() {
        const text = this.chatInput.value.trim();
        if (!text) return;

        this.chatInput.value = ''; // Clear

        // Handle Commands
        if (text.startsWith('!')) {
            const parts = text.split(' ');
            const cmd = parts[0].toLowerCase();
            this.log(`Command: ${text}`, '#ffff00');

            if (cmd === '!reset') {
                this.log("HARD RESET INITIATED...", '#ff0000');
                this.log("Clearing Save Data...", '#ff0000');
                localStorage.clear();
                setTimeout(() => location.reload(), 1000);
                return;
            }

            if (cmd === '!gear') {
                if (this.player && this.player.id !== undefined) {
                    this.log("Restoring Starter Gear...", '#00ff00');
                    // Access Global World
                    const world = (window as any).game?.world;
                    if (!world) {
                        this.log("Error: World not found.", '#ff0000');
                        return;
                    }

                    const inv = world.getComponent(this.player.id, Inventory);
                    if (inv) {
                        // Add Bag (if not present)
                        if (!inv.getEquipped('backpack')) {
                            const bagItem = new Item("Small Bag", "backpack", SPRITES.SMALL_BAG, 0, 30, "A small leather bag.", "none", "common", 0, 0, 0, true, 8);
                            const bagInst = new ItemInstance(bagItem, 1);

                            // Content
                            bagInst.contents.push(new ItemInstance(new Item("Apple", "none", SPRITES.APPLE, 0, 2, "Restores 10 HP", "none", "common"), 5));
                            bagInst.contents.push(new ItemInstance(new Item("Health Potion", "none", SPRITES.POTION, 0, 50, "Restores 50 HP", "none", "common"), 2));

                            inv.equip('backpack', bagInst);
                            this.log("Added Small Bag.", '#ccc');
                        }

                        // Sword
                        if (!inv.getEquipped('rhand')) {
                            const weapon = new Item("Wooden Sword", "rhand", SPRITES.WOODEN_SWORD, 8, 20, "Practice sword.", "sword", "common");
                            inv.equip('rhand', new ItemInstance(weapon, 1));
                            this.log("Added Wooden Sword.", '#ccc');
                        }

                        // Shield
                        if (!inv.getEquipped('lhand')) {
                            const shield = new Item("Wooden Shield", "lhand", SPRITES.WOODEN_SHIELD, 0, 40, "Wooden shield.", "none", "common", 5);
                            inv.equip('lhand', new ItemInstance(shield, 1));
                            this.log("Added Wooden Shield.", '#ccc');
                        }

                        // Armor
                        if (!inv.getEquipped('body')) {
                            const armor = new Item("Leather Armor", "body", SPRITES.LEATHER_ARMOR, 0, 50, "Leather armor.", "none", "common", 4);
                            inv.equip('body', new ItemInstance(armor, 1));
                            this.log("Added Leather Armor.", '#ccc');
                        }

                        // Boots
                        if (!inv.getEquipped('boots')) {
                            const boots = new Item("Leather Boots", "boots", SPRITES.LEATHER_BOOTS, 0, 25, "Leather boots.", "none", "common", 1);
                            inv.equip('boots', new ItemInstance(boots, 1));
                            this.log("Added Leather Boots.", '#ccc');
                        }

                        this.log("Starter Gear Check Complete.", '#00ff00');
                        // Force Inventory UI Update via Event if possible, or expect game loop to catch it
                        gameEvents.emit(EVENTS.INVENTORY_CHANGED, inv);
                    }
                }
                return;
            }

            if (cmd === '!debug') {
                if (this.player) this.log(`Debug: Player ID: ${this.player.id}`, '#ffff00');
                const world = (window as any).game?.world;
                this.log("World Entities: " + world?.entities.size, '#ffff00');
                return;
            }
        }

        // Normal chat
        this.log(`You: ${text}`);
    }

    /**
     * Updates HUD elements from the Visual Player state.
     * DEPRECATED: UI now updates via events.
     */
    update(player: Player) {
        this.player = player; // Still cache for Shop/Loot logic context
    }

    private handleStatsUpdate(player: Player) {
        if (!player) return;
        const curHP = Math.floor(player.hp);
        const maxHP = player.maxHp;
        const curMana = Math.floor(player.mana);
        const maxMana = player.maxMana;
        const curLevel = player.level;
        const curXP = player.xp;
        const nextXP = player.nextXp;
        const curCap = player.capacity;
        const curGold = player.gold;

        if (this.hpVal) this.hpVal.innerText = `${curHP}`;
        if (this.hpBar) this.hpBar.style.width = `${Math.min(100, Math.max(0, (curHP / maxHP) * 100))}%`;

        if (this.manaVal) this.manaVal.innerText = `${curMana}`;
        if (this.manaBar) this.manaBar.style.width = `${Math.min(100, Math.max(0, (curMana / maxMana) * 100))}%`;

        if (this.lvlVal) this.lvlVal.innerText = curLevel.toString();
        if (this.capVal) this.capVal.innerHTML = `Cap:<br>${curCap}`;
        if (this.goldVal) this.goldVal.innerText = `${curGold} GP`;

        const xpBar = document.getElementById('xp-bar');
        const xpPct = nextXP > 0 ? Math.floor((player.xp / nextXP) * 100) : 0;
        if (this.xpVal) this.xpVal.innerText = `${xpPct}%`;
        if (xpBar) xpBar.style.width = `${xpPct}%`;

        // Update Skills Panel
        const skills = player.world.getComponent(player.id, Skills);
        if (skills) {
            this.updateSkills({ level: curLevel }, skills, { name: "Knight" });
        }
    }

    // legacy stub
    public updateStatus(...args: any[]) { }

    // --- LOOT / CONTAINER UI ---
    public toggleLoot(entityId: number, name: string, items: any[]) {
        if (this.activeLootEntityId === entityId) {
            this.lootPanel.style.display = 'none';
            this.activeLootEntityId = null;
            return;
        }

        this.activeLootEntityId = entityId;
        this.lootPanel.style.display = 'block';
        const header = this.lootPanel.querySelector('.loot-header span') as HTMLElement;
        if (header) header.innerText = name;

        this.renderLootGrid(items);
    }

    private renderLootGrid(items: any[]) {
        if (!this.lootGrid) return;
        this.lootGrid.innerHTML = '';

        items.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'loot-slot';

            const sprite = assetManager.getSpriteSource(item.uIndex);
            if (sprite && sprite.image) {
                const canvas = document.createElement('canvas');
                canvas.width = 32; canvas.height = 32;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, 32, 32);
                slot.appendChild(canvas);
            } else {
                slot.innerText = item.name ? item.name.substring(0, 2) : '??';
            }

            this.lootGrid.appendChild(slot);
        });
    }

    renderMinimap(map: WorldMap, player: Player) {
        // Find or create canvas
        let canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
        if (!canvas) {
            const container = document.getElementById('minimap-container');
            if (container) {
                container.innerHTML = ''; // Clear text
                canvas = document.createElement('canvas');
                canvas.id = 'minimap-canvas';
                canvas.width = 150;
                canvas.height = 150;
                container.appendChild(canvas);
            } else {
                return;
            }
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Dot for Player
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Simple Radar: Draw nearby solid tiles?
        // For performance, maybe just static or simple hash?
        // Let's just draw Player for now.
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
    }

    // --- STUBS FOR GAME.TS COMPATIBILITY ---
    public isShowing(): boolean { return false; }

    public hideDialogue() {
        if (this.lootPanel) this.lootPanel.style.display = 'none';
        if (this.dialogPanel) this.dialogPanel.style.display = 'none';
        this.activeLootEntityId = null;
        this.activeMerchantId = null;

        // Return focus to game
        document.body.focus();
    }

    public showDialogue(msg: string, npcName: string = "NPC") {
        if (!this.dialogPanel) return;
        this.dialogPanel.style.display = 'flex';
        this.dialogText.innerHTML = `<strong>${npcName}:</strong> ${msg}`;
        // Simple one-off message for now
        this.dialogNextBtn.style.display = 'none';

        this.log(`[${npcName}] ${msg}`, '#ffe');
    }

    // 3. Replace the old openLoot stub with this:
    public openLoot(lootable: any, entityId: number, playerInv: any) {
        this.activeLootEntityId = entityId;
        this.lootPanel.style.display = 'flex';
        this.renderLoot(lootable, playerInv);
    }

    // 4. Add this new helper method
    private renderLoot(lootable: any, playerInv: any) {
        this.lootGrid.innerHTML = ''; // Clear old items

        if (lootable.items.length === 0) {
            // Auto-close if empty
            this.hideDialogue();
            this.log("Corpse is empty.");

            // Optional: Remove the empty corpse from the world entirely?
            // You would need access to 'world' here to do world.removeEntity(this.activeLootEntityId);
            return;
        }

        lootable.items.forEach((item: any, index: number) => {
            const slot = document.createElement('div');
            slot.className = 'loot-slot';

            // We need a way to get the sprite URL or draw it. 
            // Assuming assetManager can give us a URL or we use a placeholder color
            // For now, let's just use text or a colored block if no image source available
            // If you have an asset path: `src="assets/sprites/${item.spriteIndex}.png"`

            // Simpler: Just styled div with text for now (or integrate your sprite sheet canvas later)
            slot.innerText = item.name.substring(0, 2);
            slot.title = item.name;
            slot.style.color = item.color || '#fff';

            // Add Click Handler (Take Item)
            slot.onclick = () => {
                // Try to add to player inventory
                if (playerInv.addItem(item)) {
                    this.log(`Looted: ${item.name}`);

                    // Remove from Corpse
                    lootable.items.splice(index, 1);

                    // Re-render to show it's gone
                    this.renderLoot(lootable, playerInv);

                    // Update Player UI (Inventory/Stats)
                    // Note: You might need to trigger inventory UI update here if it's open
                } else {
                    this.log("Inventory full!", "#ff5555");
                }
            };

            this.lootGrid.appendChild(slot);
        });
    }
    // --- SKILLS UI ---
    public lookAtItem(item: any) {
        let parts = [];
        parts.push(`You see ${item.name}.`);

        let stats = [];
        if (item.damage > 0) stats.push(`Atk: ${item.damage}`);
        if (item.defense > 0) stats.push(`Def: ${item.defense}`);
        if (item.bonusHp > 0) stats.push(`+${item.bonusHp} HP`);

        if (stats.length > 0) parts.push(`(${stats.join(', ')})`);

        if (item.description) parts.push(item.description);

        this.log(parts.join(' '), '#fff');
    }

    public updateSkills(xp: any, skills: any, vocation: any) {
        // Update Level & XP first (redundant if called from updateStatus, but safe)
        if (this.lvlVal) this.lvlVal.innerText = xp.level.toString();

        // Vocation
        const vocEl = document.getElementById('skill-vocation');
        if (vocEl) vocEl.innerText = vocation ? vocation.name : "None";

        // Helper for individual skills
        const updateSkill = (name: string, skill: any) => {
            const valEl = document.getElementById(`skill-${name}`);
            const barEl = document.getElementById(`bar-${name}`);
            const pctEl = document.getElementById(`pct-${name}`);

            if (!skill) skill = { level: 10, xp: 0 }; // Default stub

            if (valEl) valEl.innerText = skill.level.toString();

            // Calc %
            // Formula: 10 * 1.1^lvl
            const req = Math.floor(10 * Math.pow(1.1, skill.level));
            const pct = req > 0 ? Math.floor((skill.xp / req) * 100) : 0;

            if (barEl) barEl.style.width = `${Math.min(100, pct)}%`;
            if (pctEl) pctEl.innerText = `${Math.min(100, pct)}%`;
        };

        updateSkill('magic', skills.magic); // Magic
        updateSkill('fist', skills.fist);
        updateSkill('club', skills.club);
        updateSkill('sword', skills.sword);
        updateSkill('axe', skills.axe);
        updateSkill('distance', skills.distance);
        updateSkill('shielding', skills.shielding);
    }

    // --- SHOP SYSTEM ---
    public toggleShop(merchantComp: any, merchantName: string) {
        if (this.activeMerchantId === merchantComp) { // ID check? Actually merchantComp is the component instance?
            // If toggle logic required, close it. 
            // But usually opening same merchant just refreshes.
        }

        this.shopPanel.style.display = 'block';
        const header = this.shopPanel.querySelector('.shop-header span') as HTMLElement;
        if (header) header.innerText = `Shop: ${merchantName}`;

        this.renderShop(merchantComp);
    }

    public renderShop(merchant: any) {
        this.activeMerchantId = merchant; // Warning: Storing component, not ID. Ensure compatibility.

        this.shopPanel.style.display = 'block';
        const grid = document.getElementById('shop-grid-content');
        if (!grid) return;
        grid.innerHTML = '';


        if (!merchant.items || merchant.items.length === 0) {
            grid.innerText = "Available soon!";
            return;
        }

        merchant.items.forEach((itemId: number) => {
            const itemDef = ItemRegistry[itemId];
            if (!itemDef) return;

            const card = document.createElement('div');
            card.className = 'shop-item-card';

            // Sprite
            const spriteInfo = assetManager.getSpriteSource(itemDef.uIndex || 0);
            let imgHtml = '<div class="shop-icon-placeholder"></div>';
            if (spriteInfo && spriteInfo.image) {
                // Use canvas for sprite
                // But simpler to just use background for now ?
                // Let's create a canvas element 
            }

            card.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-name">${itemDef.name}</div>
                    <div class="shop-item-price">${itemDef.price || 10} GP</div>
                </div>
                <button class="buy-btn">Buy</button>
             `;

            // Add Canvas Icon
            const iconContainer = document.createElement('div');
            iconContainer.className = 'shop-icon';
            if (spriteInfo && spriteInfo.image) {
                const cvs = document.createElement('canvas');
                cvs.width = 32; cvs.height = 32;
                const ctx = cvs.getContext('2d');
                if (ctx) ctx.drawImage(spriteInfo.image, spriteInfo.sx, spriteInfo.sy, spriteInfo.sw, spriteInfo.sh, 0, 0, 32, 32);
                iconContainer.appendChild(cvs);
            }
            card.prepend(iconContainer);

            // Buy Logic
            const btn = card.querySelector('.buy-btn') as HTMLElement;
            btn.onclick = () => {
                // We need access to Player Inventory. Passed in? Or query world?
                // Ideally this method is called with playerInv.
                // Refactor: We need a reference to the active player inventory.
                // For now, we'll dispatch an event or use a global if available (bad practice).
                // BETTER: toggleShop signature should include playerInv? No, UI shouldn't hold that state long term.
                // BUT `buyItem` needs it.
                // Solution: We'll temporarily store a reference or callback.

                // HACK: Find player inventory via World (global) is hard here.
                // Let's pass a callback closure when calling toggleShop?
                // Or just emit a custom event "shopBuy"
                const event = new CustomEvent('shopBuy', { detail: { item: itemDef, price: itemDef.price || 10 } });
                document.dispatchEvent(event);
            };

            grid.appendChild(card);
        });
    }

    public renderSellGrid() {
        const grid = document.getElementById('shop-sell-content');
        if (!grid) return;
        grid.innerHTML = '';

        if (!this.player || !this.player.inventory) {
            grid.innerHTML = '<div style="padding:20px; color:#aaa">Inventory empty or not loaded.</div>';
            return;
        }

        // Combine inventory and bag
        // Note: Player visual object might not have full inventory structure matched to Entity
        // But let's assume this.player has { inventory: Item[] } or similar
        // Wait, Player (visual) has inventory array? Let's check types.ts or how we pass it.
        // Assuming visual player has .inventory as array of items

        const inv = this.player.inventory;
        const items: Item[] = [];
        if (inv) {
            inv.equipment.forEach((inst) => {
                items.push(inst.item);
                if (inst.item.containerSize) {
                    inst.contents.forEach(c => items.push(c.item));
                }
            });
        }

        if (items.length === 0) {
            grid.innerHTML = '<div style="padding:20px; color:#aaa">Nothing to sell.</div>';
            return;
        }

        items.forEach((item: Item, index: number) => {
            if (!item) return;

            const card = document.createElement('div');
            card.className = 'shop-item-card';

            const sellPrice = Math.floor((item.price || 0) * 0.5);

            // Skip non-valuable items?
            if (sellPrice <= 0) return;

            // Sprite logic (Reusing existing logic or simplified)
            const spriteInfo = assetManager.getSpriteSource(item.uIndex || 0);

            let iconHtml = '';
            if (spriteInfo && spriteInfo.image) {
                const cvs = document.createElement('canvas');
                cvs.width = 32; cvs.height = 32;
                const ctx = cvs.getContext('2d');
                if (ctx) ctx.drawImage(spriteInfo.image, spriteInfo.sx, spriteInfo.sy, spriteInfo.sw, spriteInfo.sh, 0, 0, 32, 32);
                // We can't easily inject canvas into template string, so append later
            }

            card.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-price">Sell: ${sellPrice} GP</div>
                </div>
                <button class="buy-btn" style="background:#d44;">Sell</button>
            `;

            // Append Canvas Icon
            const iconContainer = document.createElement('div');
            iconContainer.className = 'shop-icon';
            if (spriteInfo && spriteInfo.image) {
                const cvs = document.createElement('canvas');
                cvs.width = 32; cvs.height = 32;
                const ctx = cvs.getContext('2d');
                if (ctx) ctx.drawImage(spriteInfo.image, spriteInfo.sx, spriteInfo.sy, spriteInfo.sw, spriteInfo.sh, 0, 0, 32, 32);
                iconContainer.appendChild(cvs);
            }
            card.prepend(iconContainer);

            // Sell Action
            const btn = card.querySelector('button') as HTMLElement;
            btn.onclick = () => {
                const event = new CustomEvent('shopSell', { detail: { item: item, index: index } });
                document.dispatchEvent(event);

                // Remove card immediately for feedback, or wait for refresh?
                // Dispatch event handles logic. We should re-render or remove this card.
                card.remove();
                // Updating entire grid might be safer to keep indices synced if we weren't just using array index.
                // But array index shifts when splicing!
                // FIX: If we remove item at index 0, item at index 1 becomes 0.
                // The next click on index 1 (now 0) will try to sell index 1 (which is now index 2's item).
                // So we MUST re-render the grid or track IDs. 
                // Re-rendering is safest.
                setTimeout(() => this.renderSellGrid(), 50); // Small delay to allow logic update
            };

            grid.appendChild(card);
        });
    }

    // NOTE: buyItem is now handled by event listener in game.ts to avoid coupling UI directly to Inventory logic

    public updateMagicHud(spellName: string) { /* console.log("Magic HUD update", spellName); */ }
    public toggleSkillTree(book: any, points: any, voc: any, passives: any, cb: any) { this.log("Skills not implemented in UI Manager yet.", '#f55'); }


    // 1. Function to Open a Window
    public openContainer(item: ItemInstance) {
        // Check if already open?
        if (this.openContainers.find(c => c.item === item)) return;

        // Create new window
        this.openContainers.push({
            uid: Math.random().toString(36),
            item: item,
            x: 100 + (this.openContainers.length * 20), // Cascade windows
            y: 100 + (this.openContainers.length * 20),
            rows: 2, // 2x2 = 4 slots for now
            cols: 2
        });

        this.log("Container opened.");
    }

    // 2. Function to Close
    public closeContainer(index: number) {
        this.openContainers.splice(index, 1);
    }

    // 3. Draw All Windows (Call this in your main loop!)
    public renderWindows(ctx: CanvasRenderingContext2D, mouseX: number, mouseY: number) {
        const SLOT_SIZE = 32;
        const PADDING = 10;
        const HEADER = 20;

        // Iterate backwards so top windows draw last? Or forwards?
        // Standard painter: Draw 0 first (bottom), then 1...
        for (let i = 0; i < this.openContainers.length; i++) {
            const win = this.openContainers[i];

            // Calculate Size
            const w = (win.cols * SLOT_SIZE) + (PADDING * 2);
            const h = (win.rows * SLOT_SIZE) + (PADDING * 2) + HEADER;

            // A. Draw Background (Gray Box)
            ctx.fillStyle = '#b0b0b0'; // Classic Windows Gray
            ctx.fillRect(win.x, win.y, w, h);

            // B. Draw Border (Bevel effect)
            ctx.strokeStyle = '#404040';
            ctx.lineWidth = 2;
            ctx.strokeRect(win.x, win.y, w, h);

            // C. Draw Header (Darker Gray)
            ctx.fillStyle = '#808080';
            ctx.fillRect(win.x + 2, win.y + 2, w - 4, HEADER);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.fillText("Container", win.x + 5, win.y + 15);

            // D. Draw Close Button (Red X)
            ctx.fillStyle = '#aa0000';
            ctx.fillRect(win.x + w - 18, win.y + 4, 14, 14);

            // E. Draw Slots
            const startY = win.y + HEADER + PADDING;
            const startX = win.x + PADDING;

            for (let s = 0; s < win.item.item.containerSize; s++) {
                // Math for 2D Grid
                const col = s % win.cols;
                const row = Math.floor(s / win.cols);

                const slotX = startX + (col * SLOT_SIZE);
                const slotY = startY + (row * SLOT_SIZE);

                // Draw Slot Background (Darker)
                ctx.fillStyle = '#505050';
                ctx.fillRect(slotX, slotY, 32, 32);
                ctx.strokeStyle = '#808080';
                ctx.strokeRect(slotX, slotY, 32, 32);
                // Draw Item inside?
                if (win.item.contents[s]) {
                    const innerItem = win.item.contents[s];
                    // innerItem is ItemInstance, has .item
                    // We need sprite from item definition
                    // If innerItem.item is just Item class, it has uIndex.
                    const sprite = assetManager.getSpriteSource(innerItem.item.uIndex || 0); // Fix: Access .item
                    if (sprite) {
                        ctx.drawImage(
                            sprite.image,
                            sprite.sx, sprite.sy, sprite.sw, sprite.sh,
                            slotX, slotY, 32, 32
                        );
                    }
                }
            }
        }
    }
    // 4. Input Helper: Get Container Slot at Mouse Position
    public getContainerSlotAt(screenX: number, screenY: number): { containerIndex: number, slotIndex: number } | null {
        const SLOT_SIZE = 32;
        const PADDING = 10;
        const HEADER = 20;

        // Check top-most windows first (end of array)
        for (let i = this.openContainers.length - 1; i >= 0; i--) {
            const win = this.openContainers[i];
            const startX = win.x + PADDING;
            const startY = win.y + HEADER + PADDING;

            // Check bounding box first
            const w = (win.cols * SLOT_SIZE) + (PADDING * 2);
            const h = (win.rows * SLOT_SIZE) + (PADDING * 2) + HEADER;

            if (screenX >= win.x && screenX <= win.x + w &&
                screenY >= win.y && screenY <= win.y + h) {

                // Inside window, check slots
                for (let s = 0; s < win.item.item.containerSize; s++) {
                    const col = s % win.cols;
                    const row = Math.floor(s / win.cols);
                    const slotX = startX + (col * SLOT_SIZE);
                    const slotY = startY + (row * SLOT_SIZE);

                    if (screenX >= slotX && screenX <= slotX + 32 &&
                        screenY >= slotY && screenY <= slotY + 32) {
                        return { containerIndex: i, slotIndex: s };
                    }
                }
            }
        }
        return null;
    }

    public renderGhostItem(ctx: CanvasRenderingContext2D, item: Item, x: number, y: number) {
        if (!item) return;

        ctx.save();
        ctx.globalAlpha = 0.7; // Make it semi-transparent
        const sprite = assetManager.getSpriteSource(item.id);

        if (sprite) {
            // Draw centered on the mouse cursor
            ctx.drawImage(
                sprite.image,
                sprite.sx, sprite.sy, sprite.sw, sprite.sh,
                x - 16, y - 16, 32, 32
            );
        } else {
            // Fallback if sprite fails
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(x - 16, y - 16, 32, 32);
        }
        ctx.restore();
    }


    public renderDragging(ctx: CanvasRenderingContext2D, x: number, y: number) {
        if (!this.draggedItem) return;
        this.renderGhostItem(ctx, this.draggedItem, x, y);
    }

    private setupEquipmentUI() {
        const container = document.getElementById('inventory-container');
        if (!container) return;

        // Tibia-Style Grid Layout (Matches CSS)
        // Note: .equip-row is strictly for flex fallback, but we use grid now, so direct children are fine.
        // We removed .equip-row from HTML to simplify grid area assignment.
        container.innerHTML = `
            <div class="equip-doll">
                <div class="equip-slot" id="slot-amulet" data-slot="amulet"></div>
                <div class="equip-slot" id="slot-head" data-slot="helmet"></div>
                <div class="equip-slot" id="slot-backpack" data-slot="backpack"></div>
                
                <div class="equip-slot" id="slot-lhand" data-slot="lhand"></div>
                <div class="equip-slot" id="slot-body" data-slot="body"></div>
                <div class="equip-slot" id="slot-rhand" data-slot="rhand"></div>

                <div class="equip-slot" id="slot-ring" data-slot="ring"></div>
                <div class="equip-slot" id="slot-legs" data-slot="legs"></div>
                <div class="equip-slot" id="slot-ammo" data-slot="ammo"></div>

                <div class="equip-slot" id="slot-soul" data-slot="soul">Soul:<br>100</div>
                <div class="equip-slot" id="slot-boots" data-slot="boots"></div>
                <div class="equip-slot" id="slot-cap" data-slot="cap">Cap:<br>400</div>
            </div>
            
            <div id="inventory-panel" class="panel">
                 <div class="panel-header">Backpack</div>
                 <div class="inventory-grid" id="bag-grid"></div>
            </div>
        `;

        // Cache slots
        ['amulet', 'head', 'backpack', 'lhand', 'body', 'rhand', 'ring', 'legs', 'ammo', 'boots'].forEach(slot => {
            const el = document.getElementById(`slot-${slot}`);
            if (el) {
                this.equipmentSlots[slot] = el;
                // Add click handler for unequip later
            }
        });

        this.bagPanel = document.getElementById('inventory-panel')!;
    }

    // Shop


    public updateEquipment(inv: Inventory) {
        if (!inv) return;

        // 1. Update Slots
        Object.entries(this.equipmentSlots).forEach(([slotName, el]) => {
            const equipped = inv.getEquipped(slotName);
            el.innerHTML = ''; // Clear

            if (equipped && equipped.item) {
                // ... render item ...
                const uIndex = equipped.item.uIndex !== undefined ? equipped.item.uIndex : equipped.item.id;
                const sprite = assetManager.getSpriteSource(uIndex);
                if (sprite && sprite.image) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 32; canvas.height = 32;
                    const ctx = canvas.getContext('2d');
                    if (ctx) ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, 32, 32);
                    el.appendChild(canvas);
                } else {
                    el.innerText = equipped.item.name.substring(0, 2);
                }

                // Add Tooltip
                el.title = equipped.item.name;

                // DRAG START (Left Click)
                el.onmousedown = (e) => {
                    if (e.button === 0) { // Left Click
                        this.draggedItem = equipped.item;
                        this.draggingFrom = { type: 'slot', slot: slotName };
                    }
                };

                // DROP TARGET (Left Click Release)
                el.onmouseup = (e) => {
                    if (e.button === 0 && this.draggedItem) {
                        e.stopPropagation(); // Prevent global cancel
                        // Handle Drop
                        this.handleDrop({ type: 'slot', slot: slotName });
                    }
                };

                // RIGHT CLICK -> USE / USE WITH
                el.oncontextmenu = (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // prevent global cancel

                    const def = ItemRegistry[uIndex];
                    if (def) {
                        // Check if Tool or Useable
                        if (def.name === "Shovel" || def.name === "Rope" || def.name === "Pickaxe" || def.name === "Machete") {
                            this.targetingItem = def;
                            document.body.style.cursor = 'crosshair';
                            this.log(`Using ${def.name}... select target.`);
                        } else if (def.type === "food" || def.name.includes("Potion")) {
                            // Consume (Handled via Network or Game Action usually)
                            // For now simple consume event?
                            // game.player.consume(item) logic?
                            // Let's leave potions for now, focus on TOOLS.
                            this.log(`You cannot use ${def.name} directly yet.`);
                        } else {
                            this.lookAtItem(def);
                        }
                    } else {
                        // Fallback
                        this.lookAtItem(def || { name: "Unknown Item", description: "You see something unfamiliar." });
                    }
                };
            }
        });

        // 2. Update Bag Grid
        // ... (rest of bag update)
        if (this.bagPanel) {
            const grid = this.bagPanel.querySelector('.inventory-grid');
            if (grid) {
                grid.innerHTML = '';
                const bag = inv.getEquipped('backpack');
                if (bag && bag.item.containerSize) {
                    bag.contents.forEach((inst, idx) => {
                        const slot = document.createElement('div');
                        slot.className = 'loot-slot';

                        // Render Icon
                        const uIndex = inst.item.uIndex !== undefined ? inst.item.uIndex : inst.item.id;
                        const sprite = assetManager.getSpriteSource(uIndex);
                        if (sprite && sprite.image) {
                            const cvs = document.createElement('canvas');
                            cvs.width = 32; cvs.height = 32;
                            const ctx = cvs.getContext('2d');
                            if (ctx) ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, 32, 32);
                            slot.appendChild(cvs);
                        } else {
                            slot.innerText = inst.item.name.substring(0, 2);
                        }

                        // Right Click -> Use With
                        slot.oncontextmenu = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Use ID for Registry Lookup (Fix: uIndex is for sprite)
                            const id = inst.item.id !== undefined ? inst.item.id : uIndex;
                            const def = ItemRegistry[id];
                            if (def) {
                                if (def.name === "Shovel" || def.name === "Rope" || def.name === "Pickaxe") {
                                    this.targetingItem = def;
                                    document.body.style.cursor = 'crosshair';
                                    this.log(`Using ${def.name}... select target.`);
                                } else if (def.type === "food" || def.name.includes("Potion")) {
                                    const event = new CustomEvent('playerAction', { detail: { action: 'consume', item: def, fromBag: true, index: idx } });
                                    document.dispatchEvent(event);
                                } else {
                                    this.lookAtItem(def);
                                }
                            } else {
                                this.lookAtItem(def || { name: "Unknown Item", description: "You see something unfamiliar." });
                            }
                        };

                        // DRAG START
                        slot.onmousedown = (e) => {
                            if (e.button === 0) {
                                this.draggedItem = inst.item;
                                this.draggingFrom = { type: 'container', containerIndex: 0, index: idx };
                            }
                        };

                        // DROP TARGET
                        slot.onmouseup = (e) => {
                            if (e.button === 0 && this.draggedItem) {
                                e.stopPropagation();
                                this.handleDrop({ type: 'container', containerIndex: 0, index: idx });
                            }
                        };

                        grid.appendChild(slot);
                    });
                }
            }
        }
    }

    // --- DROP LOGIC ---
    private handleDrop(target: { type: 'slot' | 'container', slot?: string, containerIndex?: number, index?: number }) {
        if (!this.draggedItem || !this.draggingFrom) return;

        // Dispatch Event to Game Logic
        const event = new CustomEvent('playerAction', {
            detail: {
                action: 'moveItem',
                item: this.draggedItem,
                from: this.draggingFrom,
                to: target
            }
        });
        document.dispatchEvent(event);

        // Reset
        this.draggedItem = null;
        this.draggingFrom = null;
    }


    public setWorld(world: World) {
        this.world = world;
    }
}
