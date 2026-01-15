import { Inventory, Item, Health, Sprite, Lootable, SpellBook, SkillPoints, Passives } from './components';
import { spriteSheet, SHEET_TILE_SIZE, SHEET_COLS, assetManager } from './assets';

export class UIManager {
    private box: HTMLElement;
    private text: HTMLElement;
    public console?: ConsoleManager; // Reference to console for cross-talk

    // Cached DOM Elements
    private hpVal: HTMLElement;
    private hpBar: HTMLElement;
    private manaVal: HTMLElement;
    private manaBar: HTMLElement;
    private capVal: HTMLElement;
    private levelVal: HTMLElement;
    private xpVal: HTMLElement;
    private goldVal: HTMLElement;

    public bagPanel: HTMLElement;
    private bagGrid: HTMLElement;

    // Shop
    public shopPanel: HTMLElement;
    private shopBuyList: HTMLElement;
    private shopSellList: HTMLElement;
    public activeMerchantId: number | null = null;
    public currentMerchant: any = null;

    // Loot
    public lootPanel!: HTMLElement;
    public activeLootEntityId: number | null = null;

    // Inspection
    private inspectPanel: HTMLElement;
    private inspectName: HTMLElement;
    private inspectDesc: HTMLElement;
    private inspectStats: HTMLElement;

    private skillsPanel!: HTMLElement;
    private skillTreePanel!: HTMLElement;
    private magicHudIcon!: HTMLElement;

    public onConsume?: (item: any) => void;

    private chatInput: HTMLInputElement;

    constructor() {
        this.cleanupLegacyUI();

        this.box = document.getElementById('box-overlay') || this.createOverlay();
        this.box.style.display = 'none';
        this.box.classList.add('hidden');

        this.text = document.getElementById('text') || this.createText();

        // 1. Static Bindings (now exist in HTML)
        this.hpVal = document.getElementById('hp-val')!;
        this.hpBar = document.querySelector('.health-bar') as HTMLElement;
        this.manaVal = document.getElementById('mana-val')!;
        this.manaBar = document.querySelector('.mana-bar') as HTMLElement;
        this.capVal = document.getElementById('cap-val')!;
        this.levelVal = document.getElementById('lvl-val')!;
        this.xpVal = document.getElementById('xp-val')!;
        this.goldVal = document.getElementById('gold-val')!;

        // 2. Panel Bindings
        this.bagPanel = document.getElementById('backpack-panel')!;
        this.bagGrid = document.getElementById('backpack-grid')!;

        // 3. Dynamic/Modals
        this.shopPanel = document.getElementById('shop-panel') || this.createShop();
        this.shopPanel.style.display = 'none';
        this.shopPanel.classList.add('hidden');
        this.shopBuyList = document.getElementById('shop-buy-list')!;
        this.shopSellList = document.getElementById('shop-sell-list')!;

        this.lootPanel = document.getElementById('loot-panel') || this.createLoot();
        this.lootPanel.style.display = 'none';
        this.lootPanel.classList.add('hidden');

        this.inspectPanel = document.getElementById('inspect-panel') || this.createInspect();
        this.inspectPanel.style.display = 'none';
        this.inspectPanel.classList.add('hidden');

        this.inspectName = document.getElementById('inspect-name')!;
        this.inspectDesc = document.getElementById('inspect-desc')!;
        this.inspectStats = document.getElementById('inspect-stats')!;

        // Chat Input (Initialize properly)
        this.chatInput = document.getElementById('console-input') as HTMLInputElement;

        this.createMagicHud();
        this.createSkillTree();
        if (this.skillTreePanel) this.skillTreePanel.style.display = 'none';

        // Backpack Toggle Event
        const backpackSlot = document.querySelector('.slot.backpack');
        if (backpackSlot) {
            backpackSlot.addEventListener('click', () => {
                this.toggleBag();
            });
        }

        // Global Mouse Tracking
        document.addEventListener('mousemove', (e) => {
            if (this.inspectPanel && this.inspectPanel.style.display !== 'none') {
                const x = Math.min(e.clientX + 15, window.innerWidth - 220);
                const y = Math.min(e.clientY + 15, window.innerHeight - 150);

                this.inspectPanel.style.position = 'fixed';
                this.inspectPanel.style.left = `${x}px`;
                this.inspectPanel.style.top = `${y}px`;
            }
        });
    }


    // --- MAIN UI UPDATE ---
    update(player: any) {
        if (!player) return;

        // 1. Health Bar
        const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
        if (this.hpBar) this.hpBar.style.width = `${hpPct}%`;
        if (this.hpVal) this.hpVal.innerText = `${Math.floor(player.hp)}/${player.maxHp}`;

        // 2. Mana Bar
        const manaPct = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));
        if (this.manaBar) this.manaBar.style.width = `${manaPct}%`;
        if (this.manaVal) this.manaVal.innerText = `${Math.floor(player.mana)}/${player.maxMana}`;

        // 3. Stats
        if (this.capVal && player.capacity !== undefined) this.capVal.innerText = player.capacity.toString();
        if (this.levelVal && player.level !== undefined) this.levelVal.innerText = player.level.toString();
        if (this.xpVal && player.xp !== undefined && player.nextXp !== undefined) this.xpVal.innerText = `${player.xp}/${player.nextXp}`;
        if (this.goldVal && player.gold !== undefined) this.goldVal.innerText = `${player.gold} GP`;

        // 4. Combat Stats (New)
        // Need elements in HTML? If not, log or create dynamic?
        // Let's assume user wants them visible. I'll modify createText or just log for now?
        // User said: "Update this.ui.updateStats... to display... in the sidebar"
        // I'll prepend/append to stats panel if exists.

        const atkEl = document.getElementById('stat-atk');
        if (atkEl) atkEl.innerText = `Atk: ${player.attack || 0}`;

        const defEl = document.getElementById('stat-def');
        if (defEl) defEl.innerText = `Def: ${player.defense || 0}`;
    }

    renderMinimap(map: any, player: any) {
        const canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Settings
        const scale = 4; // Pixels per tile
        const rangeX = Math.floor(canvas.width / scale / 2);
        const rangeY = Math.floor(canvas.height / scale / 2);

        // Draw Walls
        ctx.fillStyle = '#555'; // Wall color

        for (let dy = -rangeY; dy <= rangeY; dy++) {
            for (let dx = -rangeX; dx <= rangeX; dx++) {
                const tx = Math.floor(player.x + dx);
                const ty = Math.floor(player.y + dy);

                // Bounds Check
                if (tx >= 0 && tx < map.width && ty >= 0 && ty < map.height) {
                    // Check logic: Map structure
                    // map.tiles[y][x] or similar.
                    // Assuming 'map' object passed has getTile or tiles array.
                    // The 'map' object in main.ts is WorldMap instance from core/map.ts
                    // It has .getTile(x, y).items

                    const tile = map.getTile(tx, ty);
                    if (tile) {
                        // Simple Check: Is Wall? (ID 17 or similar)
                        // Or iterate items.
                        let isWall = false;
                        for (const item of tile.items) {
                            // Assuming 17 is wall based on logic in player.ts
                            if (item.id === 17 || item.id === 20 || item.id === 21) {
                                isWall = true; break;
                            }
                        }

                        if (isWall) {
                            const screenX = (dx + rangeX) * scale;
                            const screenY = (dy + rangeY) * scale;
                            ctx.fillRect(screenX, screenY, scale, scale);
                        }
                    }
                }
            }
        }

        // Draw Player
        ctx.fillStyle = '#fff';
        ctx.fillRect(rangeX * scale, rangeY * scale, scale, scale);
    }

    log(message: string) {
        const log = document.getElementById('console-log');
        if (!log) return;

        const entry = document.createElement('div');
        entry.className = 'log-entry';

        // Timestamp
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        entry.innerHTML = `<span style="color:#aaa;">${time}</span> ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }


    // ... (rest of class)

    private cleanupLegacyUI() {
        // Remove old dynamic elements if they persist
        const ids = ['status-panel', 'inventory-panel'];
        ids.forEach(id => {
            // Check if it's the OLD dynamic one (usually wouldn't be if we refreshed HTML, but good safety)
        });
    }

    // Removed createStatusPanel() - now in HTML logic

    // Helper Methods for Modals
    createOverlay(): HTMLElement {
        const el = document.createElement('div');
        el.id = 'box-overlay';
        el.className = 'dialog-box hidden'; // Legacy class usage
        document.body.appendChild(el);
        return el;
    }
    createText(): HTMLElement {
        const el = document.createElement('p'); el.id = 'text';
        const box = document.getElementById('box-overlay') || document.body;
        box.appendChild(el); return el;
    }

    createInspect(): HTMLElement {
        const el = document.createElement('div');
        el.id = 'inspect-panel';
        el.className = 'panel hidden';
        el.style.position = 'fixed';
        el.style.zIndex = '9999';
        el.style.pointerEvents = 'none';
        el.style.width = '200px';
        el.style.background = '#1a1a1a'; // Darker theme
        el.style.border = '1px solid #555';
        el.innerHTML = `<div id="inspect-name"></div><div id="inspect-desc"></div><div id="inspect-stats"></div>`;
        document.body.appendChild(el);
        return el;
    }

    createBag(): HTMLElement {
        // Should exist in HTML now, but fallback
        console.error("Backpack Panel missing from HTML!");
        return document.createElement('div');
    }

    createShop(): HTMLElement {
        let panel = document.getElementById('shop-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'shop-panel';
            panel.className = 'panel hidden';
            panel.style.position = 'absolute';
            panel.style.top = '100px';
            panel.style.left = '50%';
            panel.style.transform = 'translateX(-50%)';
            panel.style.width = '300px';
            panel.style.zIndex = '500';

            panel.innerHTML = `
                <div class="panel-header">Merchant</div>
                <div style="font-size:12px; color:#aaa; margin-bottom:4px;">Buying:</div>
                <div id="shop-buy-list" style="max-height:150px; overflow-y:auto; margin-bottom:10px;"></div>
                <div style="font-size:12px; color:#aaa; margin-bottom:4px;">Selling (Backpack):</div>
                <div id="shop-sell-list" style="max-height:150px; overflow-y:auto;"></div>
                <div id="shop-close-btn" style="margin-top:10px; text-align:center; font-size:12px; cursor:pointer; background:#444; padding:4px;">Close</div>
            `;

            const closeBtn = panel.querySelector('#shop-close-btn');
            if (closeBtn) closeBtn.addEventListener('click', () => this.hideDialogue());

            document.body.appendChild(panel);
        }
        return panel;
    }

    createLoot(): HTMLElement {
        let panel = document.getElementById('loot-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'loot-panel';
            panel.className = 'panel hidden';
            panel.style.position = 'absolute';
            panel.style.top = '200px'; // Offset from shop
            panel.style.right = '240px'; // Left of sidebar
            panel.style.zIndex = '500';

            panel.innerHTML = `
                <div class="panel-header">Corpse</div>
                <div id="loot-grid" class="inventory-grid" style="padding: 10px;"></div>
                <div style="text-align:center; font-size:12px; cursor:pointer; margin-top:10px; background:#444;" onclick="document.getElementById('loot-panel').style.display='none';">Close</div>
            `;
            document.body.appendChild(panel);
        }
        return panel;
    }

    createMagicHud() {
        const hud = document.createElement('div');
        hud.id = 'magic-hud';
        hud.style.position = 'absolute';
        hud.style.top = '10px';
        hud.style.left = '10px';
        hud.style.display = 'flex';
        hud.style.alignItems = 'center';
        hud.style.gap = '4px';
        hud.style.zIndex = '10';
        hud.innerHTML = `<div id="active-spell-icon" style="width:32px;height:32px;border:2px solid #58b;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:#58b;font-weight:bold;">F</div> <span style="font-size:10px;color:#acc;text-shadow:1px 1px #000;">[R] Cast</span>`;

        // Append to GAME CONTAINER specifically
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) gameContainer.appendChild(hud);
        else document.body.appendChild(hud); // Fallback

        this.magicHudIcon = document.getElementById('active-spell-icon')!;
    }


    createSkillTree() {
        const p = document.createElement('div');
        p.id = 'skill-tree-panel';
        p.className = 'dialog-box hidden';
        p.style.position = 'fixed'; // Fix: Ensure it's positioned so top/left work
        p.style.width = '200px';
        p.style.height = '180px';
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.transform = 'translate(-50%, -50%)';
        p.style.zIndex = '2000'; // Ensure it's on top
        p.style.display = 'none'; // Ensure hidden start
        // Hardcoded Styles for Visibility
        p.style.backgroundColor = '#1a1a1a';
        p.style.border = '2px solid #aaa';
        p.style.boxShadow = '0 0 20px #000';
        p.style.color = '#fff';
        p.style.padding = '8px';
        p.style.borderRadius = '4px';
        p.innerHTML = `
            <div style="text-align:center; margin-bottom: 8px; border-bottom: 1px solid #555; padding-bottom:4px;">
                <span class="dialog-title">Arcane Knowledge</span>
                <div style="position:absolute; right:4px; top:4px; cursor:pointer;" onclick="const el=document.getElementById('skill-tree-panel'); el.style.display='none';">X</div>
            </div>
            <div id="skill-points-display" style="text-align:center; color:#fd0; margin-bottom:8px;">Points: 0</div>
            <div id="skill-tree-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 4px;">
                <!-- Spells injected here -->
            </div>
            <div style="margin-top:8px; font-size:10px; color:#888; text-align:center;">Press 1-4 to Select Active Spell</div>
        `;
        document.body.appendChild(p);
        this.skillTreePanel = p;
    }



    toggleSkillTree(book: SpellBook, points: SkillPoints, vocation: string, passives?: Passives, onUpgrade?: () => void) {
        if (!this.skillTreePanel) this.createSkillTree();

        // Fix: Ensure panel is actually in the DOM (handle detached reference)
        if (!document.body.contains(this.skillTreePanel)) {
            if (this.console) this.console.addSystemMessage("Debug: Re-attaching Skill Tree.");
            document.body.appendChild(this.skillTreePanel);
        }

        if (this.skillTreePanel.style.display === 'none') {
            this.renderSkillTree(book, points, vocation, passives, onUpgrade);
            // Force Visible Logic
            this.skillTreePanel.style.zIndex = '2000'; // Normal High Z
            this.skillTreePanel.style.display = 'block';
            this.skillTreePanel.classList.remove('hidden');

            // Restore Nice Styles
            this.skillTreePanel.className = 'dialog-box';
            this.skillTreePanel.style.backgroundColor = ''; // Use class default (or inherited)
            this.skillTreePanel.style.border = '';
            this.skillTreePanel.style.boxShadow = '';
            this.skillTreePanel.style.color = '';
            this.skillTreePanel.style.padding = '';

            // Ensure Position is still fixed (critical fix from earlier)
            this.skillTreePanel.style.position = 'fixed';
            this.skillTreePanel.style.left = '50%';
            this.skillTreePanel.style.top = '50%';
            this.skillTreePanel.style.transform = 'translate(-50%, -50%)';

            // Diagnostics (Keep for verification, user can ignore)
            if (this.console) this.console.addSystemMessage("Debug: Skill Tree Opened.");
        } else {
            this.skillTreePanel.style.display = 'none';
            this.skillTreePanel.classList.add('hidden');
            if (this.console) this.console.addSystemMessage("Debug: Tree CLOSED.");
        }
    }

    renderSkillTree(book: SpellBook, points: SkillPoints, vocation: string, passives?: Passives, onUpgrade?: () => void) {
        try {
            const grid = document.getElementById('skill-tree-grid');
            if (!grid) {
                console.error("UI Error: skill-tree-grid not found!");
                return;
            }
            grid.innerHTML = '';

            const pointsDisplay = document.getElementById('skill-points-display');
            if (pointsDisplay) pointsDisplay.innerText = `Points: ${points.current}`;

            if (!passives) {
                grid.innerHTML = '<div style="color:#aaa; text-align:center; grid-column:span 2;">No Passives Data</div>';
                return;
            }

            // Define Passive Nodes
            const nodes = [
                { id: 'vitality', name: "Vitality", desc: "+10 Max HP", color: "#d00", val: passives.vitality },
                { id: 'spirit', name: "Spirit", desc: "+10 Max Mana", color: "#00d", val: passives.spirit },
                { id: 'agility', name: "Agility", desc: "+5 Speed", color: "#0d0", val: passives.agility },
                { id: 'might', name: "Might", desc: "+2 Phys Dmg", color: "#fa0", val: passives.might }
            ];

            nodes.forEach(node => {
                const btn = document.createElement('div');
                btn.style.border = `2px solid ${node.color}`;
                btn.style.background = '#222';
                btn.style.padding = '8px';
                btn.style.cursor = 'pointer';
                btn.style.margin = '4px';
                btn.style.textAlign = 'center';

                btn.innerHTML = `
                    <div style="color:${node.color}; font-weight:bold;">${node.name}</div>
                    <div style="font-size:10px; color:#aaa;">Lvl ${node.val}</div>
                    <div style="font-size:10px; color:#666;">${node.desc}</div>
                `;

                btn.onclick = () => {
                    if (points.current > 0) {
                        points.current--;
                        (passives as any)[node.id]++; // Dynamic accessor
                        if (pointsDisplay) pointsDisplay.innerText = `Points: ${points.current}`;
                        this.renderSkillTree(book, points, vocation, passives, onUpgrade); // Re-render to update Level text
                        if (onUpgrade) onUpgrade();
                    } else {
                        if (this.console) this.console.addSystemMessage("Not enough Skill Points.");
                    }
                };

                grid.appendChild(btn);
            });

            // Note: Removed old Spell Logic completely as requested

        } catch (e) {
            console.error("Render SkillTree Error:", e);
        }
    }

    updateMagicHud(activeSpell: string) {
        if (!this.magicHudIcon) return;
        this.magicHudIcon.innerText = activeSpell.charAt(0).toUpperCase();
        let color = '#ccc';
        if (activeSpell === 'Fireball' || activeSpell === 'adori flam') color = '#f80';
        if (activeSpell === 'Global Heal' || activeSpell === 'exura') color = '#0f0';
        if (activeSpell === 'Ice Shard' || activeSpell === 'adori frigo') color = '#0ef';
        if (activeSpell === 'Chain Lightning' || activeSpell === 'exevo gran vis lux') color = '#ff0';
        this.magicHudIcon.style.color = color;
        this.magicHudIcon.style.borderColor = color;
    }

    // Existing updateStatus update...
    updateStatus(hp: number, maxHp: number, mana: number, maxMana: number, capacity: number, gold: number, level: number, xp: number, nextXp: number, skills: any = null) {
        if (this.hpVal) this.hpVal.innerText = `${hp}/${maxHp}`;
        if (this.manaVal) this.manaVal.innerText = `${mana}/${maxMana}`;
        if (this.capVal) this.capVal.innerText = capacity.toString();
        if (this.levelVal) this.levelVal.innerText = level.toString();
        if (this.xpVal) this.xpVal.innerText = `${xp}/${nextXp}`;

        const goldEl = document.getElementById('gold-val');
        if (goldEl) goldEl.innerText = gold.toString() + ' GP';

        if (skills) this.renderSkills(skills);
    }

    renderSkills(skills: any) {
        if (!this.skillsPanel) {
            // Lazy create if not in HTML yet, or assume element exists
            // For now, let's append to box-overlay or create a new absolute div
            // Better: assume a #skills-panel exists or inject it
            let panel = document.getElementById('skills-panel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'skills-panel';
                panel.className = 'panel'; // Use same styling as sidebar panels

                // Header
                const header = document.createElement('div');
                header.className = 'panel-header';
                header.innerText = 'Skills';
                panel.appendChild(header);

                // Content container
                const content = document.createElement('div');
                content.id = 'skills-content';
                content.style.padding = '4px';
                content.style.fontSize = '14px';
                panel.appendChild(content);

                // Append to sidebar
                // Append to sidebar (Before Inventory)
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    const inventory = document.getElementById('inventory-panel');
                    if (inventory) {
                        sidebar.insertBefore(panel, inventory);
                    } else {
                        sidebar.appendChild(panel);
                    }
                } else {
                    document.body.appendChild(panel); // Fallback
                }
            }
            this.skillsPanel = panel;
        }

        const content = this.skillsPanel.querySelector('#skills-content');
        if (content) {
            content.innerHTML = `
                <div class="status-row"><span>Sword:</span> <span class="val">${skills.sword.level} (${skills.sword.xp}%)</span></div>
                <div class="status-row"><span>Axe:</span> <span class="val">${skills.axe.level} (${skills.axe.xp}%)</span></div>
                <div class="status-row"><span>Club:</span> <span class="val">${skills.club.level} (${skills.club.xp}%)</span></div>
                <div class="status-row"><span>Dist:</span> <span class="val">${skills.distance.level} (${skills.distance.xp}%)</span></div>
                <div class="status-row"><span>Shield:</span> <span class="val">${skills.shielding.level} (${skills.shielding.xp}%)</span></div>
                <div class="status-row"><span>Magic:</span> <span class="val">${skills.magic.level}</span></div>
                <div class="status-row" style="margin-top:8px; border-top:1px solid #444; padding-top:4px; color:#f88;"><span id="stat-atk">Atk: 0</span></div>
                <div class="status-row" style="color:#88f;"><span id="stat-def">Def: 0</span></div>
            `;
        }
    }

    // Constructor Removed (Merged)

    /*
    private createChatInput() {
        // ... Removed in favor of binding to #console-input
    }
    */

    toggleChat(forceOpen: boolean = false): boolean {
        const bar = document.getElementById('chat-input-bar');
        // Toggle Focus
        if (document.activeElement !== this.chatInput || forceOpen) {
            if (bar) bar.style.display = 'block';
            this.chatInput.focus();
            this.chatInput.style.background = '#333';
            return true;
        } else {
            this.chatInput.blur();
            if (bar) bar.style.display = 'none';
            this.chatInput.style.background = '#222';
            return false;
        }
    }

    isChatOpen(): boolean {
        return document.activeElement === this.chatInput;
    }



    getChatInput(): string {
        const val = this.chatInput.value;
        this.chatInput.value = '';
        return val;
    }

    inspectItem(item: any) {
        if (!item) return;

        // Debug: Check item structure
        console.log("Inspect Item:", item, "Def:", item.defense);

        // "Nuclear Option": Set InnerHTML directly to ensure content appears
        // This bypasses potential stale references to child elements
        const name = item.name || "Unknown";
        const desc = item.description || "No description.";
        let stats = `Price: ${item.price}gp`;
        if (item.damage > 0) stats += ` | Dmg: ${item.damage}`;
        if (item.defense > 0) stats += ` | Def: ${item.defense}`;

        this.inspectPanel.innerHTML = `
            <div style="font-weight: bold; color: #ffd700; border-bottom: 1px solid #555; margin-bottom: 4px; padding-bottom: 2px;">${name}</div>
            <div style="color: #ccc; font-style: italic; font-size: 12px; margin-bottom: 4px;">${desc}</div>
            <div style="color: #0f0; font-size: 12px;">${stats}</div>
        `;

        // Show
        this.inspectPanel.classList.remove('hidden');
        this.inspectPanel.style.display = 'block';
        this.inspectPanel.style.zIndex = '10000';
        this.inspectPanel.style.opacity = '1';
    }

    closeInspect() {
        this.inspectPanel.classList.add('hidden');
        this.inspectPanel.style.display = 'none';
    }

    isShowing(): boolean {
        // Returns true if any blocking UI is visible. Checks style.display as source of truth.
        const dialogOpen = this.box.style.display !== 'none';
        const skillsOpen = this.skillTreePanel && this.skillTreePanel.style.display !== 'none';
        const shopOpen = this.shopPanel && this.shopPanel.style.display !== 'none';
        const bagOpen = this.bagPanel && this.bagPanel.style.display !== 'none';
        const inspectOpen = this.inspectPanel && this.inspectPanel.style.display !== 'none';

        return dialogOpen || skillsOpen || shopOpen || bagOpen || inspectOpen;
    }

    // --- INVENTORY MANAGEMENT ---

    updateInventory(inv: Inventory) {
        this.updateEquipment(inv);
        this.updateBackpack(inv);

        // Update Gold/Cap UI
        const goldEl = document.getElementById('gold-val');
        if (goldEl) goldEl.innerText = `${inv.gold} GP`;

        const capEl = document.getElementById('cap-val');
        if (capEl) capEl.innerText = `${inv.cap}`;
    }

    updateEquipment(inv: Inventory) {
        // Slots: head, body, legs, boots, lhand, rhand, amulet, ring, ammo, backpack
        const slots = ['head', 'body', 'legs', 'boots', 'lhand', 'rhand', 'amulet', 'ring', 'ammo', 'backpack'];

        slots.forEach(slot => {
            const item = inv.getEquipped(slot);
            const el = document.querySelector(`.slot.${slot}`) as HTMLElement;
            if (el) {
                el.innerHTML = ''; // Clear
                // Setup drop zone for equipment slots
                this.setupDragDrop(el, slot, 'equipment', inv);

                if (item) {
                    // Render Item in Slot
                    const img = this.createItemIcon(item, { type: 'equipment', index: slot });
                    el.appendChild(img);
                } else if (slot === 'backpack') {
                    // Default empty backpack placeholder
                    const ph = document.createElement('div');
                    ph.style.fontSize = '9px'; ph.style.color = '#444'; ph.innerText = 'BAG';
                    ph.style.pointerEvents = 'none'; // Ensure click-thru
                    el.appendChild(ph);
                }
            }
        });
    }

    updateBackpack(inv: Inventory) {
        if (!this.bagGrid) return;
        this.bagGrid.innerHTML = ''; // Clear

        // 1. Get the Backpack Item
        const bagItem = inv.getEquipped('backpack');

        // 2. Ensure it's a container
        let items: any[] = [];
        let size = 20; // Default size if no bag

        if (bagItem && bagItem.contents) {
            items = bagItem.contents;
            if (bagItem.item.containerSize) size = bagItem.item.containerSize;
        }

        // 3. Render Grid Loop
        for (let i = 0; i < size; i++) {
            const slotEl = document.createElement('div');
            slotEl.className = 'slot';
            slotEl.style.width = '32px';
            slotEl.style.height = '32px';
            slotEl.dataset.index = i.toString();

            // Drag Drop Events
            this.setupDragDrop(slotEl, i, 'backpack', inv);

            if (items[i]) {
                const itemInst = items[i];
                const icon = this.createItemIcon(itemInst, { type: 'backpack', index: i });
                slotEl.appendChild(icon);
            }

            this.bagGrid.appendChild(slotEl);
        }
    }

    createItemIcon(itemInst: any, source: { type: string, index: number | string }): HTMLElement {
        const el = document.createElement('div');
        el.style.width = '32px';
        el.style.height = '32px';

        // Use AssetManager to resolve the correct Sheet and Coordinates
        // This supports the remapping (Sword->Rock) we did in assets.ts
        const style = assetManager.getSpriteStyle(itemInst.item.uIndex);

        el.style.backgroundImage = style.backgroundImage;
        el.style.backgroundPosition = style.backgroundPosition;
        el.style.backgroundSize = style.backgroundSize;
        el.style.imageRendering = 'pixelated';
        el.draggable = true;
        el.title = itemInst.item.name;

        // Drag Start
        el.addEventListener('dragstart', (e) => {
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', JSON.stringify(source));
                // Add a ghost image or styling here if desired
            }
        });

        // Count
        if (itemInst.count > 1) {
            const countEl = document.createElement('span');
            countEl.innerText = itemInst.count.toString();
            countEl.style.position = 'absolute';
            countEl.style.bottom = '0';
            countEl.style.right = '0';
            countEl.style.color = '#fff';
            countEl.style.fontSize = '10px';
            countEl.style.textShadow = '1px 1px #000';
            el.appendChild(countEl);
        }

        return el;
    }

    setupDragDrop(slotEl: HTMLElement, index: number | string, containerType: string, inv: Inventory) {
        slotEl.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            slotEl.style.borderColor = '#ffd700'; // Gold highlight
        });
        slotEl.addEventListener('dragleave', () => {
            slotEl.style.borderColor = ''; // Reset
        });
        slotEl.addEventListener('drop', (e) => {
            e.preventDefault();
            slotEl.style.borderColor = '';

            const data = e.dataTransfer?.getData('text/plain');
            if (!data) return;

            try {
                const source = JSON.parse(data);
                console.log(`Dropped item from ${source.type}:${source.index} to ${containerType}:${index}`);

                // Logic: Move Item
                this.handleMoveItem(inv, source, { type: containerType, index: index });

            } catch (err) {
                console.error("Drop Error:", err);
            }
        });
    }

    handleMoveItem(inv: Inventory, src: { type: string, index: string | number }, dest: { type: string, index: string | number }) {
        // 1. Identify Source Item
        let srcItem: any = null;
        let srcContainer: any[] | null = null;
        let srcBag = inv.getEquipped('backpack');

        if (src.type === 'equipment') {
            srcItem = inv.getEquipped(src.index as string);
        } else if (src.type === 'backpack') {
            if (srcBag && srcBag.contents) {
                srcContainer = srcBag.contents;
                srcItem = srcContainer[src.index as number];
            }
        }

        if (!srcItem) return; // Nothing to move

        // 2. Identify Destination
        // If same location, abort
        if (src.type === dest.type && src.index === dest.index) return;

        // 3. Execution (Swap or Move)
        if (dest.type === 'equipment') {
            const slot = dest.index as string;
            // Check compatibility (simple check: match slotType)
            if (srcItem.item.slotType !== slot && srcItem.item.slotType !== 'any') {
                // Exceptions? Hand? 
                // For now strict check
                if (this.console) this.console.addSystemMessage(`Cannot equip ${srcItem.item.name} in ${slot}.`);
                return;
            }

            // Swap
            const destItem = inv.getEquipped(slot);

            // Remove from source
            if (src.type === 'backpack' && srcContainer) {
                srcContainer[src.index as number] = destItem; // Put equipped item in bag (or null)
                // If destItem was null, we just cleared the bag slot, which is correct
            } else if (src.type === 'equipment') {
                // Swapping equipment slots? Rare but possible (Ring 1 to Ring 2)
                inv.equipment.set(src.index as string, destItem!); // Might need logic to clear if null
                if (!destItem) inv.equipment.delete(src.index as string);
            }

            // Equip new item
            inv.equip(slot, srcItem);

            // Re-render
            this.updateInventory(inv);

        } else if (dest.type === 'backpack') {
            const destIndex = dest.index as number;

            if (srcBag && srcBag.contents) { // Ensure bag exists
                const destContainer = srcBag.contents;
                const destItem = destContainer[destIndex];

                // Remove from source
                if (src.type === 'equipment') {
                    inv.equipment.delete(src.index as string);
                } else if (srcContainer) {
                    srcContainer[src.index as number] = null; // Temporarily clear
                }

                // Place in Dest (Swap)
                if (srcContainer && src.type === 'backpack') {
                    // Classic Grid Swap
                    const temp = destContainer[destIndex];
                    destContainer[destIndex] = srcItem;
                    srcContainer[src.index as number] = temp;
                } else {
                    // Equipment to Bag
                    if (destItem) {
                        // Swap? If equipment slot accepts destItem
                        // For simplicity: If bag slot occupied and coming from equipment, fail or swap if compatible?
                        // Let's TRY swap if compatible, else fail
                        if (destItem.item.slotType === src.index) {
                            inv.equip(src.index as string, destItem);
                            destContainer[destIndex] = srcItem;
                        } else {
                            // Bag slot full, cannot unequip
                            if (this.console) this.console.addSystemMessage("Bag slot occupied.");
                            // Revert remove?
                            if (src.type === 'equipment') inv.equip(src.index as string, srcItem);
                            return;
                        }
                    } else {
                        destContainer[destIndex] = srcItem;
                    }
                }

                this.updateInventory(inv);
            }
        }
    }

    // Cached State
    private _lastKnownInventory: Inventory | null = null;
    public activeContainerItem: any = null; // Track open container

    toggleBag() {
        if (this.bagPanel.classList.contains('hidden')) {
            this.bagPanel.classList.remove('hidden');
            this.bagPanel.style.display = 'block';
        } else {
            this.bagPanel.classList.add('hidden');
            this.bagPanel.style.display = 'none';
        }
    }

    updateInventory(inv: Inventory) {
        this._lastKnownInventory = inv;

        // 1. Equipment Slots
        const slots = ['head', 'amulet', 'backpack', 'armor', 'right-hand', 'left-hand', 'legs', 'feet', 'ring', 'ammo'];
        slots.forEach(slotName => {
            const el = document.getElementById(`slot-${slotName}`);
            if (el) {
                el.innerHTML = '';
                const item = inv.getEquipped(slotName);
                if (item) {
                    const icon = this.createItemIcon(item, { type: 'equipment', index: slotName });
                    el.appendChild(icon);
                }
                // Allow Drop onto Slot
                this.setupDragDrop(el, slotName, 'equipment', inv);
            }
        });

        // 2. Backpack Grid
        this.bagGrid.innerHTML = '';
        const bag = inv.getEquipped('backpack');
        if (bag && bag.contents) {
            bag.contents.forEach((itemInst: any, i: number) => {
                const slot = document.createElement('div');
                slot.className = 'slot';
                if (itemInst) {
                    const icon = this.createItemIcon(itemInst, { type: 'backpack', index: i });
                    slot.appendChild(icon);
                }
                this.bagGrid.appendChild(slot);
                this.setupDragDrop(slot, i, 'backpack', inv);
            });
        }
    }

    toggleShop(merchant: any, playerInv: Inventory, merchantId: number) {
        if (this.shopPanel.classList.contains('hidden') || this.shopPanel.style.display === 'none') {
            this.shopPanel.style.display = 'block';
            this.shopPanel.classList.remove('hidden');
            this.activeMerchantId = merchantId;
            this.currentMerchant = merchant;
            this.renderShop(merchant, playerInv);
        } else {
            this.shopPanel.style.display = 'none';
            this.shopPanel.classList.add('hidden');
            this.activeMerchantId = null;
            this.currentMerchant = null;
        }
    }

    // --- DRAG AND DROP LOGIC ---
    handleMoveItem(inv: Inventory, src: { type: string, index: string | number, containerId?: number }, dest: { type: string, index: string | number, containerId?: number }) {
        // Prevent No-Op
        if (src.type === dest.type && src.index === dest.index) return;

        // 1. Resolve Source Item & Container
        let srcItem: any = null;
        let srcContainer: any[] | null = null; // Array ref for removal
        let srcBag = inv.getEquipped('backpack');

        if (src.type === 'equipment') {
            srcItem = inv.getEquipped(src.index as string);
        } else if (src.type === 'backpack') {
            if (srcBag && srcBag.contents) {
                srcContainer = srcBag.contents;
                srcItem = srcContainer[src.index as number];
            }
        } else if (src.type === 'container') {
            if (this.activeContainerItem && this.activeContainerItem.inventory) {
                srcContainer = this.activeContainerItem.inventory;
                srcItem = srcContainer![src.index as number];
            }
        }

        if (!srcItem) return; // Error: Source empty

        // 2. Resolve Destination Context
        // CASE A: Equip Item
        if (dest.type === 'equipment') {
            const slotName = dest.index as string;
            // Validate compatibility
            if (srcItem.item.slotType !== slotName && srcItem.item.slotType !== 'any') {
                if (this.console) this.console.addSystemMessage(`Cannot equip ${srcItem.item.name} in ${slotName}.`);
                return;
            }

            // Swap Logic
            const existing = inv.getEquipped(slotName);

            // Execute
            this.removeFromSource(inv, src, srcContainer);
            inv.equip(slotName, srcItem);

            // If existing, put it back to source (Swap)
            if (existing) {
                this.putToSource(inv, src, existing);
            }

            // CASE B: Backpack / Container (Grid Operations)
        } else {
            let destContainer: any[] | null = null;

            if (dest.type === 'backpack') {
                if (srcBag) destContainer = srcBag.contents;
            } else if (dest.type === 'container') {
                if (this.activeContainerItem) destContainer = this.activeContainerItem.inventory;
            }

            if (destContainer) {
                const destIndex = dest.index as number;
                const existing = destContainer[destIndex];

                // Execute Swap/Move
                this.removeFromSource(inv, src, srcContainer);
                destContainer[destIndex] = srcItem;

                if (existing) {
                    this.putToSource(inv, src, existing);
                }
            }
        }

        // 3. Update UI
        this.updateInventory(inv);
        if (this.activeContainerItem) this.renderContainer(this.activeContainerItem);
    }

    // Helper: Remove item from its origin
    private removeFromSource(inv: Inventory, src: any, srcContainer: any[] | null) {
        if (src.type === 'equipment') {
            inv.equipment.delete(src.index);
        } else if (srcContainer) {
            srcContainer[src.index] = null; // Grid clearance
        }
    }

    // Helper: Return item to where it came from (for swaps)
    private putToSource(inv: Inventory, src: any, item: any) {
        if (src.type === 'equipment') {
            // If source was equipment, re-equip? (Swap logic handled this mostly)
            // But if we swapped Ring1 with Ring2, we need to set Ring1
            inv.equip(src.index, item);
        } else if (src.type === 'backpack' || src.type === 'container') {
            // We need to resolve the container ref again or reuse srcContainer if valid
            // For simplicity, re-resolve logic similar to handleMove:
            let container: any[] | null = null;
            if (src.type === 'backpack') container = inv.getEquipped('backpack')?.contents;
            if (src.type === 'container') container = this.activeContainerItem?.inventory;

            if (container) {
                container[src.index] = item;
            }
        }
    }



    renderShop(merchant: any, playerInv: Inventory) {
        // Reset Inspection to prevent stuck panels
        this.closeInspect();

        // Render Buy List
        this.shopBuyList.innerHTML = '';
        merchant.items.forEach((item: any) => {
            const div = document.createElement('div');
            div.style.padding = '8px 4px';
            div.style.borderBottom = '1px solid #333';
            div.style.fontSize = '12px';
            div.style.cursor = 'pointer';
            div.style.color = playerInv.gold >= item.price ? '#fff' : '#888';
            div.style.width = '100%';
            div.style.boxSizing = 'border-box';
            div.style.userSelect = 'none';
            div.innerText = `${item.name} - ${item.price}gp`;

            div.onmouseover = () => this.inspectItem(item);
            div.onmouseleave = () => this.closeInspect();

            console.log(`[Shop Render] ${item.name} ID: ${item.uIndex} Price: ${item.price}`);

            div.onclick = () => {
                console.log(`[Shop] Buy Click: ${item.name} (${item.price}₪) vs Player Gold: ${playerInv.gold}`);
                if (playerInv.gold >= item.price) {
                    playerInv.gold -= item.price;
                    // Add copy of item to player
                    // Needs spriteSheet to update visual, passed in usually... 
                    // or just update inventory data structure and rely on loop.

                    // Simple logic: Push to storage (backpack)
                    // Create proper Item instance with all properties including defense
                    const newItem = new Item(
                        item.name, item.slot, item.uIndex, item.damage, item.price,
                        item.description, item.weaponType, item.rarity || 'common', item.defense || 0
                    );

                    if (playerInv.addItem(item, 1)) {
                        this.renderShop(merchant, playerInv);
                        this.updateInventory(playerInv);
                        if (this.console) this.console.sendMessage(`Bought ${item.name}.`);
                    } else {
                        if (this.console) this.console.sendMessage(`Inventory Full.`);
                    }
                } else {
                    console.log("[Shop] Not enough gold");
                    if (this.console) this.console.sendMessage("Not enough gold!");
                }
            };
            this.shopBuyList.appendChild(div);
        });

        // Render Sell List (Storage Only for now to simplify)
        this.shopSellList.innerHTML = '';

        // Find backpack items
        const bag = playerInv.getEquipped('backpack');
        if (bag && bag.contents) {
            bag.contents.forEach((itemInst, index) => {
                const item = itemInst.item;
                const div = document.createElement('div');
                div.style.padding = '8px 4px';
                div.style.borderBottom = '1px solid #333';
                div.style.fontSize = '12px';
                div.style.cursor = 'pointer';
                div.style.width = '100%';
                div.style.boxSizing = 'border-box';
                div.style.userSelect = 'none';
                const sellPrice = Math.floor(item.price / 2);
                div.innerText = `${item.name} (x${itemInst.count}) - ${sellPrice}gp`;

                div.onmouseover = () => this.inspectItem(item);
                div.onmouseleave = () => this.closeInspect();

                div.onclick = () => {
                    try {
                        console.log(`[Shop] Sell Click: ${item.name} for ${sellPrice}₪`);
                        playerInv.gold += sellPrice;

                        // Remove 1
                        if (itemInst.count > 1) itemInst.count--;
                        else {
                            bag.contents.splice(index, 1);
                        }

                        if (this.console) this.console.sendMessage(`Sold ${item.name}.`);
                        this.renderShop(merchant, playerInv);
                        this.updateInventory(playerInv);
                    } catch (e: any) {
                        console.error("Sell Error:", e);
                        if (this.console) this.console.addSystemMessage("Error selling item: " + e.message);
                    }
                };
                this.shopSellList.appendChild(div);
            });
        }

        // Update Gold UI immediate
        const goldEl = document.getElementById('gold-val');
        if (goldEl) goldEl.innerText = `${playerInv.gold}`;
    }

    showDialogue(message: string) {
        if (this.console) this.console.addSystemMessage(`Dialogue: ${message}`);
        this.text.innerText = message;
        this.box.classList.remove('hidden');
        this.box.style.display = 'block';
    }

    hideDialogue() {
        this.box.classList.add('hidden');
        this.box.style.display = 'none';

        this.shopPanel.classList.add('hidden');
        this.shopPanel.style.display = 'none';

        if (this.lootPanel) {
            this.lootPanel.classList.add('hidden');
            this.lootPanel.style.display = 'none';
        }

        this.activeMerchantId = null;
        this.activeLootEntityId = null;
        this.closeInspect();
    }



    // --- INVENTORY UI ---

    // Removed duplicate setupInventory/updateInventory declarations




    openLoot(lootable: Lootable, entityId: number, playerInv: Inventory, mainQuest?: any) {
        if (!this.lootPanel) {
            // Create loot panel (Implementation omitted for brevity, ensure exists)
            this.lootPanel = document.getElementById('loot-panel') || this.createLoot();
        }
        this.activeLootEntityId = entityId;
        this.lootPanel.classList.remove('hidden');
        this.lootPanel.style.display = 'block';

        this.renderLoot(lootable, playerInv);
    }

    // --- CONTAINER UI (New) ---
    public containerPanel!: HTMLElement;

    openContainer(containerItem: any) {
        // --- FORCE RESET ---
        // Verify if we have a STALE panel in DOM that doesn't match our instance
        const existing = document.getElementById('container-panel');
        if (existing && !this.containerPanel) {
            console.warn("[UI] Found Stale Container Panel! Nuking it to force upgrade.");
            existing.remove();
        }

        if (!this.containerPanel) {
            this.containerPanel = this.createContainerPanel();
        }

        // Double Check: If containerPanel exists but is not in DOM?
        if (!document.getElementById('container-panel')) {
            console.warn("[UI] Panel lost from DOM? Re-appending.");
            // Reset to force create
            this.containerPanel = undefined!;
            this.containerPanel = this.createContainerPanel();
        }

        this.containerPanel.classList.remove('hidden');
        this.containerPanel.style.display = 'block';
        this.renderContainer(containerItem);
    }

    createContainerPanel(): HTMLElement {
        if (this.containerPanel) return this.containerPanel;

        const panel = document.createElement('div');
        panel.id = 'container-panel';
        panel.className = 'panel hidden tibia-panel'; // Apply Tibia Theme

        // --- TIBIA STYLES (Positioning Refined) ---
        panel.style.display = 'none';
        panel.style.position = 'absolute';
        panel.style.top = '100px';
        panel.style.left = '50%';
        panel.style.transform = 'translateX(-50%)';
        panel.style.minWidth = '176px'; // 5 slots * 34px + padding approx
        panel.style.zIndex = '1000';
        panel.style.pointerEvents = 'auto';

        panel.innerHTML = `
            <div class="tibia-header">
                <span>Container</span>
                <div id="container-close-btn" class="tibia-btn-close" title="Close"></div>
            </div>
            <div id="container-grid" class="tibia-grid" style="pointer-events:auto;"></div>
        `;

        // Stop Propagation to prevent clicking through to canvas
        panel.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        }, false);

        panel.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);

        // Bind Close
        const closeBtn = panel.querySelector('#container-close-btn') as HTMLElement;
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                panel.style.display = 'none';
            };
        }

        // APPEND TO VIEWPORT (Direct Sibling of Canvas)
        const viewport = document.getElementById('viewport');
        if (viewport) {
            viewport.appendChild(panel);
        } else {
            console.warn("[UI] Viewport not found, appending to body fallback");
            document.body.appendChild(panel);
        }

        return panel;
    }

    renderContainer(containerItem: any) {
        // Ensure panel exists safely
        const grid = this.containerPanel.querySelector('#container-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const items = containerItem.inventory || [];
        const size = containerItem.containerSize || 10; // Default 10 slots for standard look

        for (let i = 0; i < size; i++) {
            const slot = document.createElement('div');
            slot.className = 'tibia-slot'; // Use Tibia Slot Class

            if (items[i]) {
                // Pre-Wrapped Item Instance from main.ts
                const inst = items[i];
                const icon = this.createItemIcon(inst, { type: 'container', index: i });
                slot.appendChild(icon);
            }
            grid.appendChild(slot);

            // Allow Drop ONTO container slots
            if (this._lastKnownInventory) {
                this.setupDragDrop(slot, i, 'container', this._lastKnownInventory);
            }
        }
    }

    renderLoot(lootable: Lootable, playerInv: Inventory) {
        const grid = this.lootPanel.querySelector('#loot-grid')!;
        grid.innerHTML = '';

        // Lootable.items is still Item[] or ItemInstance[]?
        // It should be ItemInstance[] ideally.
        // Assuming it is still Array<Item> from old components, we might need to wrap them or just render them.
        // Checking Components: Lootable -> public items: Item[] = []; (Old)
        // I should likely wrap them on the fly or refactor Lootable too. 
        // For now, render Item directly.

        lootable.items.forEach((item: any, index: number) => {
            // Wrap in temp instance for icon
            // const inst = new ItemInstance(item, 1);
            // const icon = this.createItemIcon(inst); 

            // Quick fix:
            const slot = document.createElement('div');
            slot.className = 'slot';
            const style = assetManager.getSpriteStyle(item.uIndex);
            slot.style.backgroundImage = style.backgroundImage;
            slot.style.backgroundPosition = style.backgroundPosition;
            slot.style.backgroundSize = style.backgroundSize;

            slot.onclick = () => {
                // Loot it
                // Add to player backpack
                const bag = playerInv.getEquipped('backpack');
                if (bag) {
                    // Add to contents
                    // Need proper `addItem` logic on Container/Inventory
                    // Hacky direct push:
                    // bag.contents.push(new ItemInstance(item, 1));
                    // Remove from loot
                    lootable.items.splice(index, 1);
                    this.renderLoot(lootable, playerInv);
                    this.updateInventory(playerInv);
                }
            };

            grid.appendChild(slot);
        });
    }

}

export class ConsoleManager {
    private log: HTMLElement;
    private input: HTMLInputElement;

    constructor() {
        this.log = document.getElementById('console-log')!;
        this.input = document.getElementById('console-input') as HTMLInputElement;

        // REMOVED: Listener logic moved to main.ts to avoid conflict and allow interception
        // this.input.addEventListener('keydown', (e) => {
        //     if (e.key === 'Enter') {
        //         this.sendMessage(this.input.value);
        //         this.input.value = '';
        //         this.input.blur(); // Return focus to game
        //     }
        // });
    }

    addSystemMessage(msg: string) {
        const div = document.createElement('div');
        div.className = 'msg system';
        div.innerText = msg;
        this.log.appendChild(div);
        this.scrollToBottom();
    }

    sendMessage(text: string) {
        if (!text.trim()) return;

        // Player Message
        const div = document.createElement('div');
        div.className = 'msg info';
        // Timestamp
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.innerText = `${time}: ${text}`; // "14:55: Hello"

        this.log.appendChild(div);
        this.scrollToBottom();
    }

    private scrollToBottom() {
        this.log.scrollTop = this.log.scrollHeight;
    }
}

export class CharacterCreation {
    private overlay: HTMLElement;

    constructor(private onSelect: (vocation: string) => void) {
        this.overlay = document.createElement('div');
        this.overlay.id = 'char-creation-overlay';
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
        this.overlay.style.display = 'none'; // Hidden by default
        this.overlay.style.flexDirection = 'column';
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.zIndex = '5000';
        this.overlay.style.fontFamily = '"VT323", monospace';
        this.overlay.style.color = '#fff';

        const title = document.createElement('h1');
        title.innerText = "Choose Your Vocation";
        title.style.marginBottom = '40px';
        title.style.color = '#FFD700';
        this.overlay.appendChild(title);

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '20px';
        this.overlay.appendChild(container);

        this.createOption(container, 'Knight', 'High HP & Capacity. Master of melee.', '#a33', 'knight');
        this.createOption(container, 'Mage', 'High Mana. Master of spells.', '#33a', 'mage');
        this.createOption(container, 'Ranger', 'Distance expert. Fast and deadly.', '#3a3', 'ranger');
        this.createOption(container, 'Paladin', 'Holy warrior. Balanced Melee/Magic.', '#DAA520', 'paladin');

        document.body.appendChild(this.overlay);
    }

    private createOption(parent: HTMLElement, name: string, desc: string, color: string, key: string) {
        const btn = document.createElement('div');
        btn.style.border = `2px solid ${color}`;
        btn.style.padding = '20px';
        btn.style.width = '150px';
        btn.style.textAlign = 'center';
        btn.style.cursor = 'pointer';
        btn.style.backgroundColor = '#111';
        btn.style.transition = 'transform 0.2s';

        btn.innerHTML = `
            <h2 style="color:${color}; margin:0 0 10px 0;">${name}</h2>
            <p style="font-size:14px; color:#ccc;">${desc}</p>
        `;

        btn.onmouseover = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.backgroundColor = '#222';
        };
        btn.onmouseleave = () => {
            btn.style.transform = 'scale(1.0)';
            btn.style.backgroundColor = '#111';
        };

        btn.onclick = () => {
            this.hide();
            this.onSelect(key);
        };

        parent.appendChild(btn);
    }

    show() {
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}
