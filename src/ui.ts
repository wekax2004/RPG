import { Inventory, Item, Health, Sprite, Lootable, SpellBook, SkillPoints } from './components';
import { spriteSheet, SHEET_TILE_SIZE, SHEET_COLS } from './assets';

export class UIManager {
    private box: HTMLElement;
    private text: HTMLElement;
    public console?: ConsoleManager; // Reference to console for cross-talk

    private hpVal: HTMLElement;
    private manaVal: HTMLElement;
    private capVal: HTMLElement;
    private levelVal: HTMLElement;
    private xpVal: HTMLElement;
    private bagPanel: HTMLElement;
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

    constructor() {
        this.box = document.getElementById('box-overlay')!;
        this.text = document.getElementById('text')!;
        this.hpVal = document.getElementById('hp-val')!;
        this.manaVal = document.getElementById('mana-val')!;
        this.capVal = document.getElementById('cap-val')!;
        this.levelVal = document.getElementById('lvl-val')!;
        this.xpVal = document.getElementById('xp-val')!;

        this.createMagicHud(); // Add HUD icon
        this.createSkillTree(); // Add Modal

        // ... (Existing selections)
        this.bagPanel = document.getElementById('backpack-panel') || this.createBag();
        this.bagGrid = document.getElementById('backpack-grid')!;

        // Shop...
        this.shopPanel = document.getElementById('shop-panel') || this.createShop();
        this.shopBuyList = document.getElementById('shop-buy-list')!;
        this.shopSellList = document.getElementById('shop-sell-list')!;

        // Loot...
        this.lootPanel = document.getElementById('loot-panel') || this.createLoot();

        this.inspectPanel = document.getElementById('inspect-panel')!;
        this.inspectName = document.getElementById('inspect-name')!;
        this.inspectDesc = document.getElementById('inspect-desc')!;
        this.inspectStats = document.getElementById('inspect-stats')!;

        // Chat Input (Bind to existing)
        this.chatInput = document.getElementById('console-input') as HTMLInputElement;

        // Backpack Toggle Event
        const backpackSlot = document.querySelector('.slot.backpack');
        if (backpackSlot) {
            backpackSlot.addEventListener('click', () => {
                this.toggleBag();
            });
            (backpackSlot as HTMLElement).style.backgroundColor = '#432';
            (backpackSlot as HTMLElement).innerHTML = '<div style="color:#aaa; font-size:10px; padding:2px;">[BAG]</div>';
        }
    }

    private chatInput!: HTMLInputElement;

    createBag(): HTMLElement {
        // Assume existing in HTML or create if missing (similar to others)
        // For now, returning null/element as existing logic assumes it exists or creates it elsewhere?
        // The original code accessed #backpack-panel directly. 
        // Let's ensure it exists.
        let panel = document.getElementById('backpack-panel');
        if (!panel) {
            // Create Backpack Panel dynamically if missing
            panel = document.createElement('div');
            panel.id = 'backpack-panel';
            panel.className = 'panel hidden';
            panel.innerHTML = `<div class="panel-header">Backpack</div><div id="backpack-grid" class="inventory-grid"></div>`;

            // Append to sidebar
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.appendChild(panel);
            else document.body.appendChild(panel);
        }
        return panel;
    }

    createShop(): HTMLElement {
        let panel = document.getElementById('shop-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'shop-panel';
            panel.className = 'panel hidden';
            panel.innerHTML = `
                <div class="panel-header">Merchant</div>
                <div style="font-size:12px; color:#aaa; margin-bottom:4px;">Buying:</div>
                <div id="shop-buy-list" style="margin-bottom:10px;"></div>
                <div style="font-size:12px; color:#aaa; margin-bottom:4px;">Selling (Backpack):</div>
                <div id="shop-sell-list"></div>
                <div style="margin-top:10px; text-align:center; font-size:12px; cursor:pointer;" onclick="document.getElementById('shop-panel').classList.add('hidden')">Close</div>
            `;
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.appendChild(panel);
            else document.body.appendChild(panel);
        }
        return panel;
    }

    createLoot(): HTMLElement {
        let panel = document.getElementById('loot-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'loot-panel';
            panel.className = 'panel hidden';
            panel.innerHTML = `
                <div class="panel-header">Corpse Loot</div>
                <div id="loot-grid" style="display:grid; grid-template-columns: repeat(5, 32px); gap: 4px; padding: 10px;"></div>
                <div style="text-align:center; font-size:12px; cursor:pointer; margin-top:10px;" onclick="document.getElementById('loot-panel').classList.add('hidden')">Close</div>
            `;
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.appendChild(panel);
            else document.body.appendChild(panel);
        }
        return panel;
    }

    createMagicHud() {
        const hud = document.createElement('div');
        hud.id = 'magic-hud';
        hud.style.position = 'absolute';
        hud.style.top = '28px'; // Below Mana
        hud.style.left = '4px';
        hud.style.display = 'flex';
        hud.style.alignItems = 'center';
        hud.style.gap = '4px';
        hud.style.zIndex = '10';
        hud.innerHTML = `<div id="active-spell-icon" style="width:24px;height:24px;border:2px solid #58b;background:#222;image-rendering:pixelated;display:flex;align-items:center;justify-content:center;color:#58b;font-weight:bold;">F</div> <span style="font-size:10px;color:#acc;">[R] to Cast</span>`;
        document.body.appendChild(hud);
        this.magicHudIcon = document.getElementById('active-spell-icon')!;
    }


    createSkillTree() {
        const p = document.createElement('div');
        p.id = 'skill-tree-panel';
        p.className = 'dialog-box hidden';
        p.style.width = '200px';
        p.style.height = '180px';
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.transform = 'translate(-50%, -50%)';
        p.style.display = 'none'; // Ensure hidden start
        p.innerHTML = `
            <div style="text-align:center; margin-bottom: 8px; border-bottom: 1px solid #555; padding-bottom:4px;">
                <span class="dialog-title">Arcane Knowledge</span>
                <div style="position:absolute; right:4px; top:4px; cursor:pointer;" onclick="document.getElementById('skill-tree-panel').style.display='none'">X</div>
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

    toggleSkillTree(spells: SpellBook, points: SkillPoints) {
        if (this.skillTreePanel.style.display === 'none') {
            this.skillTreePanel.style.display = 'block';
            this.renderSkillTree(spells, points);
        } else {
            this.skillTreePanel.style.display = 'none';
        }
    }

    renderSkillTree(book: SpellBook, points: SkillPoints) {
        const grid = document.getElementById('skill-tree-grid')!;
        grid.innerHTML = '';

        const spells = [
            { name: "Fireball", desc: "Burn foes", color: "#f80" },
            { name: "Global Heal", desc: "Restore HP", color: "#0f0" },
            { name: "Ice Shard", desc: "Freeze enemy", color: "#0ef" },
            { name: "Chain Lightning", desc: "Zap multiple", color: "#ff0" }
        ];

        spells.forEach(spell => {
            const level = book.knownSpells.get(spell.name) || 0;
            const learned = level > 0;

            const btn = document.createElement('div');
            btn.style.border = learned ? `2px solid ${spell.color}` : '1px solid #444';
            btn.style.background = learned ? '#222' : '#111';
            btn.style.padding = '4px';
            btn.style.cursor = 'pointer';
            btn.style.opacity = learned ? '1' : '0.6';

            btn.innerHTML = `
                <div style="color:${spell.color}; font-weight:bold;">${spell.name}</div>
                <div style="font-size:10px; color:#ccc;">Lvl: ${level}</div>
                <div style="font-size:9px; color:#888;">${spell.desc}</div>
            `;

            // Click to Learn/Upgrade
            btn.onclick = () => {
                // Send Signal to Game (Hack via window or custom event ideally, but direct call for now?)
                // We don't have ref to World here easily without callback.
                // Let's emit a custom event
                const event = new CustomEvent('skill-upgrade-request', { detail: { spell: spell.name } });
                window.dispatchEvent(event);
            };

            grid.appendChild(btn);
        });

        document.getElementById('skill-points-display')!.innerText = `Available Points: ${points.current}`;
    }

    updateMagicHud(activeSpell: string) {
        if (!this.magicHudIcon) return;
        this.magicHudIcon.innerText = activeSpell.charAt(0).toUpperCase();
        let color = '#ccc';
        if (activeSpell === 'Fireball') color = '#f80';
        if (activeSpell === 'Global Heal') color = '#0f0';
        if (activeSpell === 'Ice Shard') color = '#0ef';
        if (activeSpell === 'Chain Lightning') color = '#ff0';
        this.magicHudIcon.style.color = color;
        this.magicHudIcon.style.borderColor = color;
    }

    // Existing updateStatus update...
    updateStatus(hp: number, maxHp: number, mana: number, maxMana: number, capacity: number, gold: number, level: number, xp: number, nextXp: number, skills: any = null) {
        this.hpVal.innerText = `${hp}/${maxHp}`;
        this.manaVal.innerText = `${mana}/${maxMana}`;
        this.capVal.innerText = capacity.toString();
        this.levelVal.innerText = level.toString();
        this.xpVal.innerText = `${xp}/${nextXp}`;

        const goldEl = document.getElementById('gold-val');
        if (goldEl) goldEl.innerText = gold.toString();

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
            `;
        }
    }

    // Constructor Removed (Merged)

    private chatInput!: HTMLInputElement;

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

        // Update Text FIRST
        this.inspectName.innerText = item.name || "Unknown";
        this.inspectDesc.innerText = item.description || "No description.";

        let stats = `Price: ${item.price}gp`;
        if (item.damage > 0) stats += ` | Dmg: ${item.damage}`;
        this.inspectStats.innerText = stats;

        // Then Show
        this.inspectPanel.classList.remove('hidden');
    }

    closeInspect() {
        this.inspectPanel.classList.add('hidden');
    }

    toggleBag() {
        this.bagPanel.classList.toggle('hidden');
    }

    toggleShop(merchant: any, playerInv: Inventory, merchantId: number) {
        if (this.shopPanel.classList.contains('hidden')) {
            this.shopPanel.classList.remove('hidden');
            this.shopPanel.classList.remove('hidden');
            this.activeMerchantId = merchantId;
            this.currentMerchant = merchant;
            this.renderShop(merchant, playerInv);
        } else {
            this.shopPanel.classList.add('hidden');
            this.activeMerchantId = null;
            this.currentMerchant = null;
        }
    }

    renderShop(merchant: any, playerInv: Inventory) {
        // Reset Inspection to prevent stuck panels
        this.closeInspect();

        // Render Buy List
        this.shopBuyList.innerHTML = '';
        merchant.items.forEach((item: any) => {
            const div = document.createElement('div');
            div.style.padding = '4px';
            div.style.borderBottom = '1px solid #333';
            div.style.fontSize = '12px';
            div.style.cursor = 'pointer';
            div.style.color = playerInv.gold >= item.price ? '#fff' : '#888';
            div.innerText = `${item.name} - ${item.price}gp`;

            div.onmouseover = () => this.inspectItem(item);
            div.onmouseleave = () => this.closeInspect();

            div.onclick = () => {
                if (playerInv.gold >= item.price) {
                    playerInv.gold -= item.price;
                    // Add copy of item to player
                    // Needs spriteSheet to update visual, passed in usually... 
                    // or just update inventory data structure and rely on loop.

                    // Simple logic: Push to storage (backpack)
                    // We need a way to deep copy. For now, create new Item structure manually or assume simple object.
                    // Important: item is an instance of Item class.
                    const newItem = { ...item }; // Shallow copy props

                    playerInv.storage.push(newItem);
                    if (this.console) this.console.sendMessage(`Bought ${item.name}.`);
                    this.renderShop(merchant, playerInv);
                    this.updateInventory(playerInv, spriteSheet.src);
                } else {
                    if (this.console) this.console.sendMessage("Not enough gold!");
                }
            };
            this.shopBuyList.appendChild(div);
        });

        // Render Sell List (Storage Only for now to simplify)
        this.shopSellList.innerHTML = '';
        playerInv.storage.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.padding = '4px';
            div.style.borderBottom = '1px solid #333';
            div.style.fontSize = '12px';
            div.style.cursor = 'pointer';
            const sellPrice = Math.floor(item.price / 2);
            div.innerText = `${item.name} - ${sellPrice}gp`;

            div.onmouseover = () => this.inspectItem(item);
            div.onmouseleave = () => this.closeInspect();

            div.onclick = () => {
                playerInv.gold += sellPrice;
                playerInv.storage.splice(index, 1);
                if (this.console) this.console.sendMessage(`Sold ${item.name}.`);
                this.renderShop(merchant, playerInv);
                this.updateInventory(playerInv, spriteSheet.src);
            };
            this.shopSellList.appendChild(div);
        });

        // Update Gold UI immediate
        const goldEl = document.getElementById('gold-val');
        if (goldEl) goldEl.innerText = `${playerInv.gold}`;
    }

    showDialogue(message: string) {
        if (this.console) this.console.addSystemMessage(`Dialogue: ${message}`);
        this.text.innerText = message;
        this.box.classList.remove('hidden');
    }

    hideDialogue() {
        this.box.classList.add('hidden');
        this.shopPanel.classList.add('hidden');
        if (this.lootPanel) this.lootPanel.classList.add('hidden');
        this.activeMerchantId = null;
        this.activeLootEntityId = null;
        this.closeInspect();
    }

    isShowing(): boolean {
        return !this.box.classList.contains('hidden') || !this.shopPanel.classList.contains('hidden');
    }

    updateInventory(inv: Inventory, spriteSrc: string) {
        // Clear all slots
        document.querySelectorAll('.slot:not(.backpack)').forEach(el => {
            el.innerHTML = '';
            (el as HTMLElement).style.backgroundColor = '#222';
            (el as HTMLElement).style.backgroundImage = 'none';
        });

        // Populate slots
        inv.items.forEach((item, slotKey) => {
            const slotEl = document.querySelector(`.slot.${slotKey}`);
            if (slotEl) {
                // Use Sprite Sheet
                const el = slotEl as HTMLElement;
                el.style.backgroundImage = `url(${spriteSrc})`;

                // Sheet is 128x128 (8x8 tiles of 16px).
                // We display at 32x32 (2x scale).
                // So effective sheet size is 256x256.
                // Pos = index * 32
                const col = item.uIndex % 8;
                const row = Math.floor(item.uIndex / 8);

                el.style.backgroundPosition = `-${col * 32}px -${row * 32}px`;
                el.style.backgroundSize = '256px 256px';
                el.style.imageRendering = 'pixelated';
                el.setAttribute('title', ""); // Clear title as we have custom inspect

                // Inspect Events
                el.onmouseover = () => this.inspectItem(item);
                el.onmouseleave = () => this.closeInspect();

                // Unequip Event
                el.onclick = () => {
                    // Move to storage
                    inv.storage.push(item);
                    inv.items.delete(slotKey);

                    if (this.console) this.console.sendMessage(`Unequipped ${item.name}.`);
                    this.updateInventory(inv, spriteSrc);
                    // Sync Shop if Open
                    if (this.currentMerchant && !this.shopPanel.classList.contains('hidden')) {
                        this.renderShop(this.currentMerchant, inv);
                    }
                };
            }
        });

        // Populate Backpack storage
        this.bagGrid.innerHTML = '';
        inv.storage.forEach((item) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.style.border = '1px solid #444';
            slot.style.backgroundColor = '#222';
            slot.style.width = '32px';
            slot.style.height = '32px';

            // Render Sprite
            slot.style.backgroundImage = `url(${spriteSrc})`;
            const col = item.uIndex % 8;
            const row = Math.floor(item.uIndex / 8);
            slot.style.backgroundPosition = `-${col * 32}px -${row * 32}px`;
            slot.style.backgroundSize = '256px 256px';
            slot.style.imageRendering = 'pixelated';
            slot.setAttribute('title', ""); // Clear default

            // Inspect Events
            slot.onmouseover = () => this.inspectItem(item);
            slot.onmouseleave = () => this.closeInspect();

            // Equip Event
            slot.onclick = () => {
                const targetSlot = item.slot;

                // Check if slot is occupied
                if (inv.items.has(targetSlot)) {
                    // Swap
                    const currentItem = inv.items.get(targetSlot)!;
                    inv.storage.push(currentItem);
                    inv.items.set(targetSlot, item);

                    // Remove from storage (by index is safer)
                    const index = inv.storage.indexOf(item);
                    if (index > -1) inv.storage.splice(index, 1);

                    if (this.console) this.console.sendMessage(`Equipped ${item.name} (Swapped).`);
                } else {
                    // Equip
                    inv.items.set(targetSlot, item);
                    const index = inv.storage.indexOf(item);
                    if (index > -1) inv.storage.splice(index, 1);

                    if (this.console) this.console.sendMessage(`Equipped ${item.name}.`);
                }

                this.updateInventory(inv, spriteSrc);
                // Sync Shop if Open
                if (this.currentMerchant && !this.shopPanel.classList.contains('hidden')) {
                    this.renderShop(this.currentMerchant, inv);
                }
            };

            this.bagGrid.appendChild(slot);
        });
    }


    openLoot(lootable: Lootable, entityId: number, playerInv: Inventory) {
        if (!this.lootPanel) {
            this.lootPanel = this.createLoot();
        }

        this.activeLootEntityId = entityId;
        this.lootPanel.classList.remove('hidden');
        this.lootPanel.style.display = 'block'; // Ensure visibility
        this.renderLoot(lootable, playerInv);
    }

    renderLoot(lootable: Lootable, playerInv: Inventory) {
        const grid = this.lootPanel.querySelector('#loot-grid')!;
        grid.innerHTML = '';

        if (lootable.items.length === 0) {
            const empty = document.createElement('div');
            empty.innerText = "(Empty)";
            empty.style.color = '#888';
            empty.style.fontSize = '12px';
            empty.style.gridColumn = 'span 5';
            empty.style.textAlign = 'center';
            grid.appendChild(empty);
            return;
        }

        lootable.items.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.style.border = '1px solid #444';
            slot.style.backgroundColor = '#222';
            slot.style.width = '32px';
            slot.style.height = '32px';
            slot.style.cursor = 'pointer';

            // Render Sprite
            slot.style.backgroundImage = `url(${spriteSheet.src})`;
            const col = item.uIndex % 8;
            const row = Math.floor(item.uIndex / 8);
            slot.style.backgroundPosition = `-${col * 32}px -${row * 32}px`;
            slot.style.backgroundSize = '256px 256px';
            slot.style.imageRendering = 'pixelated';

            // Inspect
            slot.onmouseover = () => this.inspectItem(item);
            slot.onmouseleave = () => this.closeInspect();

            // Loot Interaction
            slot.onclick = () => {
                // Move to player
                // Check capacity? (For now ignore cap)
                playerInv.storage.push(item);
                lootable.items.splice(index, 1);

                if (this.console) this.console.sendMessage(`Looted ${item.name}.`);
                this.updateInventory(playerInv, spriteSheet.src);
                this.renderLoot(lootable, playerInv);

                // If empty, auto close? Nah, let user close.
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
        this.createOption(container, 'Ranger', 'Balanced stats. Master of distance.', '#3a3', 'ranger');

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
