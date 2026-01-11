
import { Entity } from '../engine';
import { Player } from '../core/player';
import { WorldMap } from '../core/map';
import { Health, Name, Position, Sprite, Target } from '../components';

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
    public activeMerchantId: number | null = null;
    public console: any = { addSystemMessage: (msg: string) => this.log(msg) };

    // Loot Panel Properties
    public activeLootEntityId: number | null = null;
    public lootPanel: HTMLElement;
    private lootGrid: HTMLElement;

    private _lastBattleUpdate: number = 0;

    constructor() {
        // Battle List
        this.battleList = document.getElementById('battle-list')!;
        if (!this.battleList) console.error("UI: #battle-list not found");

        // Chat
        this.chatLog = document.getElementById('chat-log')!;
        if (!this.chatLog) console.error("UI: #chat-log not found");

        // HUD - Health/Mana
        this.hpBar = document.querySelector('.health-bar') as HTMLElement;
        this.manaBar = document.querySelector('.mana-bar') as HTMLElement;
        this.hpVal = document.getElementById('hp-val')!;
        this.manaVal = document.getElementById('mana-val')!;

        // HUD - Stats
        this.capVal = document.getElementById('cap-val')!;
        this.lvlVal = document.getElementById('lvl-val')!;
        this.xpVal = document.getElementById('xp-val')!;
        this.goldVal = document.getElementById('gold-val')!;

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

        // Bind the close button properly if needed, or rely on inline onclick above
        const closeBtn = this.lootPanel.querySelector('.close-btn') as HTMLElement;
        closeBtn.onclick = () => this.hideDialogue();
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

        this.battleList.innerHTML = '';

        // 1. Get Player Position
        const playerPos = world.getComponent(player.id, Position);

        entities.forEach(entityId => {
            if (entityId === player.id) return;

            const nameComp = world.getComponent(entityId, Name);
            const healthComp = world.getComponent(entityId, Health);
            const posComp = world.getComponent(entityId, Position);

            if (!nameComp || (healthComp && healthComp.current <= 0) || !posComp) return;

            // --- 2. DISTANCE CHECK (The Fix) ---
            // Only show monsters within 320 pixels (approx 10 tiles)
            if (playerPos) {
                const dist = Math.sqrt(Math.pow(playerPos.x - posComp.x, 2) + Math.pow(playerPos.y - posComp.y, 2));
                if (dist > 320) return; // <--- This line hides the far-away mobs
            }
            // -----------------------------------

            const entry = document.createElement('div');
            entry.className = 'battle-entry';
            const hpPercent = Math.floor((healthComp.current / healthComp.max) * 100);
            entry.innerText = `${nameComp.value} [${hpPercent}%]`;

            // Highlight target
            const currentTarget = world.getComponent(player.id, Target);
            const isTargeted = player.targetId === entityId || (currentTarget && currentTarget.targetId === entityId);

            if (isTargeted) {
                entry.style.color = '#ff5555';
                entry.style.border = '1px solid #ff5555';
                entry.style.backgroundColor = '#442222';
            }

            // Click Handler
            entry.onclick = () => {
                if (isTargeted) {
                    player.targetId = null;
                    world.removeComponent(player.id, Target);
                } else {
                    player.targetId = entityId;
                    if (world.getComponent(player.id, Target)) {
                        world.removeComponent(player.id, Target);
                    }
                    world.addComponent(player.id, new Target(entityId));
                }
                document.body.focus();
                (this as any)._lastBattleUpdate = 0;
            };

            this.battleList.appendChild(entry);
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

    /**
     * Updates HUD elements (HP, Mana, etc) from the Visual Player state.
     */
    update(player: Player) {
        // Health
        if (this.hpVal) this.hpVal.innerText = `${Math.floor(player.hp)}/${player.maxHp}`;
        if (this.hpBar) {
            const pct = Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100));
            this.hpBar.style.width = `${pct}%`;
        }

        // Mana
        if (this.manaVal) this.manaVal.innerText = `${Math.floor(player.mana)}/${player.maxMana}`;
        if (this.manaBar) {
            const pct = Math.min(100, Math.max(0, (player.mana / player.maxMana) * 100));
            this.manaBar.style.width = `${pct}%`;
        }

        // Stats
        if (this.lvlVal) this.lvlVal.innerText = player.level.toString();
        if (this.capVal) this.capVal.innerText = player.capacity.toString();
        if (this.goldVal) this.goldVal.innerText = `${player.gold} GP`;
        if (this.xpVal) this.xpVal.innerText = `${player.xp}/${player.nextXp}`;
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
        // ... existing dialogue hide code ...
        if (this.lootPanel) this.lootPanel.style.display = 'none';
        this.activeLootEntityId = null;
        this.activeMerchantId = null;

        // Return focus to game
        document.body.focus();
    }

    public showDialogue(msg: string) { this.log(msg, '#ffe'); }

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
    public renderShop(merchant: any, inv: any) { this.log("Shop not implemented in UI Manager yet.", '#f55'); }
    public updateMagicHud(spellName: string) { /* console.log("Magic HUD update", spellName); */ }
    public toggleSkillTree(book: any, points: any, voc: any, passives: any, cb: any) { this.log("Skills not implemented in UI Manager yet.", '#f55'); }
}
