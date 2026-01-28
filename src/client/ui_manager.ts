import { Entity, World } from '../engine';
import { SPRITES } from '../constants';
import { Player } from '../core/player';
import { WorldMap } from '../core/map';
import { Health, Name, Position, Sprite, Target, Inventory, ItemInstance, Skills, PlayerControllable, Item, RARITY_COLORS, Quest, QuestLog, Lootable } from '../components';
import { assetManager } from '../assets';
import { ItemRegistry } from '../data/items';
// import { attemptCastSpell } from '../game'; // Circular?
import { gameEvents, EVENTS } from '../core/events';
import { makeItemDraggable } from '../ui';

interface ContainerWindow {
    uid: string;
    item: ItemInstance;
    x: number;
    y: number;
    rows: number;
    cols: number;
}

export class UIManager {
    private battleList: HTMLElement;
    private chatLog: HTMLElement;
    private chatInput: HTMLInputElement | null = null;
    private hpBar: HTMLElement | null = null;
    private manaBar: HTMLElement | null = null;

    // Cache for stats
    private hpVal: HTMLElement | null = null;
    private manaVal: HTMLElement | null = null;
    private capVal: HTMLElement | null = null;
    private lvlVal: HTMLElement | null = null;
    private xpVal: HTMLElement | null = null;
    private goldVal: HTMLElement | null = null;

    // Compatibility Stubs
    public shopPanel: HTMLElement = document.createElement('div');
    public bagPanel: HTMLElement = document.createElement('div');
    public currentMerchant: any = null;
    public activeMerchantId: any | null = null;

    // Loot State
    public activeLootEntityId: number | null = null;
    public activeLootComponent: Lootable | null = null; // Stored reference to the component
    public activePlayerInventory: Inventory | null = null;

    public console: any;
    public world: World | undefined;

    // Loot Stub
    // Loot Stub
    public lootPanel: HTMLElement = document.createElement('div');
    public lootGrid: HTMLElement | null = null;

    constructor() {
        this.console = {
            addSystemMessage: (msg: string) => this.log(msg),
            sendMessage: (msg: string) => this.log(msg)
        };

        this.battleList = document.getElementById('battle-list') || document.createElement('div');
        this.chatLog = document.getElementById('chat-log') || document.createElement('div');
        this.chatInput = document.getElementById('chat-input') as HTMLInputElement;

        this.hpBar = document.getElementById('hp-bar');
        this.manaBar = document.getElementById('mana-bar');
        this.hpVal = document.getElementById('hp-text');
        this.manaVal = document.getElementById('mana-text');
        this.capVal = document.getElementById('slot-cap');
        this.lvlVal = document.getElementById('lvl-val');
        this.xpVal = document.getElementById('xp-pct');
        this.goldVal = document.getElementById('gold-val');

        // Setup Chat Listeners
        if (this.chatInput) {
            this.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const text = this.chatInput!.value.trim();
                    if (text.length > 0) {
                        const event = new CustomEvent('player-chat', { detail: { text: text } });
                        document.dispatchEvent(event);
                        this.chatInput!.value = '';
                    }
                    this.toggleChat(false);
                }
                e.stopPropagation();
            });
            this.chatInput.addEventListener('focus', () => {
                const event = new CustomEvent('chat-focus', { detail: { focused: true } });
                document.dispatchEvent(event);
            });

            this.chatInput.addEventListener('blur', () => {
                const event = new CustomEvent('chat-focus', { detail: { focused: false } });
                document.dispatchEvent(event);
            });
        }

        // 3. Toggle Chat Event (Global shortcut)
        document.addEventListener('toggle-chat', () => {
            this.toggleChat();
        });
    }

    public updateInventory(inv: any): void { }

    public update(player: Player) {
        // Only if needed
    }

    public handleStatsUpdate(player: Player) {
        if (!player) return;
        const curHP = Math.floor(player.hp);
        const maxHP = player.maxHp;
        const curMana = Math.floor(player.mana);
        const maxMana = player.maxMana;

        if (this.hpVal) this.hpVal.innerText = `${curHP}`;
        if (this.hpBar) this.hpBar.style.width = `${Math.min(100, Math.max(0, (curHP / maxHP) * 100))}%`;
        if (this.manaVal) this.manaVal.innerText = `${curMana}`;
        if (this.manaBar) this.manaBar.style.width = `${Math.min(100, Math.max(0, (curMana / maxMana) * 100))}%`;
    }

    public log(message: string, color: string = '#ccc') {
        if (!this.chatLog) return;
        const line = document.createElement('div');
        line.style.color = color;
        line.innerText = `System: ${message}`;
        this.chatLog.appendChild(line);
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    public updateBattleList(entities: Entity[], world: any, player: Player) {
        if (!this.battleList) return;
        this.battleList.innerHTML = '';

        entities.forEach(eid => {
            const name = world.getComponent(eid, Name)?.value || "Unknown";
            const health = world.getComponent(eid, Health);
            const pos = world.getComponent(eid, Position);

            // Distance check (Battle List Range)
            const pPos = world.getComponent(player.id, Position);
            if (pPos && pos && pPos.z !== pos.z) return;

            const entry = document.createElement('div');
            entry.className = 'battle-entry';
            entry.dataset.id = eid.toString();

            // Name & HP %
            let hpPct = 100;
            if (health) hpPct = Math.floor((health.current / health.max) * 100);

            // Highlight Target
            const targetComp = world.getComponent(player.id, Target);
            if (targetComp && targetComp.targetId === eid) {
                entry.classList.add('targeted');
                entry.style.color = "#ff5555";
            }

            entry.innerHTML = `
                <div class="be-name">${name}</div>
                <div class="be-hp-bar"><div class="be-hp-fill" style="width: ${hpPct}%"></div></div>
            `;

            // Click to Attack
            entry.onclick = () => {
                gameEvents.emit(EVENTS.TARGET_ENTITY, eid);
            };

            this.battleList.appendChild(entry);
        });
    }

    public setWorld(world: World) {
        this.world = world;
    }

    public toggleChat(forceState?: boolean): void {
        if (!this.chatInput) return;
        const shouldFocus = forceState !== undefined ? forceState : document.activeElement !== this.chatInput;
        if (shouldFocus) {
            this.chatInput.focus();
        } else {
            this.chatInput.blur();
        }
    }

    // Loot Stub
    public toggleLoot(entityId: number, name: string, items: any[]) { }
    // Missing Stubs
    public showDialog(text: string, options?: any) { }
    public updateStatus(
        hp: number, maxHp: number,
        mana: number, maxMana: number,
        cap: number, gold: number,
        level: number, xp: number, nextXp: number,
        skills: any // Skills component
    ) {
        if (this.hpVal) this.hpVal.innerText = `${hp}`;
        if (this.hpBar) this.hpBar.style.width = `${Math.min(100, Math.max(0, (hp / maxHp) * 100))}%`;

        if (this.manaVal) this.manaVal.innerText = `${mana}`;
        if (this.manaBar) this.manaBar.style.width = `${Math.min(100, Math.max(0, (mana / maxMana) * 100))}%`;

        if (this.capVal) this.capVal.innerText = `${cap}`;
        if (this.goldVal) this.goldVal.innerText = `${gold}`;

        if (this.lvlVal) this.lvlVal.innerText = `${level}`;

        // XP Bar
        if (this.xpVal && nextXp > 0) {
            const pct = Math.floor((xp / nextXp) * 100);
            this.xpVal.innerText = `${pct}%`;
            // Assuming there is an XP bar element (not cached in constructor, let's try to find it or skip)
            const xpBar = document.getElementById('xp-bar');
            if (xpBar) xpBar.style.width = `${pct}%`;
        }
        // Skills
        if (skills) {
            const setSkill = (name: string, val: number, pct: number) => {
                const elVal = document.getElementById(`skill-${name}`);
                const elPct = document.getElementById(`pct-${name}`);
                const elBar = document.getElementById(`bar-${name}`);
                if (elVal) elVal.innerText = `${val}`;
                if (elPct) elPct.innerText = `${Math.floor(pct)}%`;
                if (elBar) elBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
            };

            // Helper to calc pct
            const getPct = (lvl: number, cur: number) => {
                const req = Math.floor(10 * Math.pow(1.1, lvl));
                return (cur / req) * 100;
            };

            // Magic uses different formula? In progression.ts: floor(100 * 1.1^lvl)
            const getMagicPct = (lvl: number, cur: number) => {
                const req = Math.floor(100 * Math.pow(1.1, lvl));
                return (cur / req) * 100;
            };

            setSkill('fist', skills.fist?.level || 10, getPct(skills.fist?.level || 10, skills.fist?.xp || 0));
            setSkill('club', skills.club.level, getPct(skills.club.level, skills.club.xp));
            setSkill('sword', skills.sword.level, getPct(skills.sword.level, skills.sword.xp));
            setSkill('axe', skills.axe.level, getPct(skills.axe.level, skills.axe.xp));
            setSkill('distance', skills.distance.level, getPct(skills.distance.level, skills.distance.xp));
            setSkill('shielding', skills.shielding.level, getPct(skills.shielding.level, skills.shielding.xp));
            setSkill('magic', skills.magic.level, getMagicPct(skills.magic.level, skills.magic.xp));
        }
    }

    public updateEquipment(inv: Inventory) {
        // Update Paper Doll (Equipment Slots)
        const slotIds: Record<string, string> = {
            'head': 'slot-head',
            'amulet': 'slot-amulet',
            'backpack': 'slot-backpack',
            'lhand': 'slot-lhand',
            'body': 'slot-body',
            'rhand': 'slot-rhand',
            'ring': 'slot-ring',
            'legs': 'slot-legs',
            'ammo': 'slot-ammo',
            'boots': 'slot-boots'
        };

        for (const [slotName, domId] of Object.entries(slotIds)) {
            const el = document.getElementById(domId);
            if (!el) continue;

            el.innerHTML = ''; // Clear existing

            const itemInst = inv.equipment.get(slotName);
            // DEBUG Equipment
            if (itemInst) {
                // Render Item
                const uIndex = itemInst.item.uIndex;
                const img = assetManager.getSprite(uIndex);
                // if (!img) console.warn(`[UIManager] Missing Sprite for Item ${uIndex} in slot ${slotName}`);

                if (img) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 32;
                    canvas.height = 32;
                    const ctx = canvas.getContext('2d');
                    if (ctx) ctx.drawImage(img, 0, 0, 32, 32);
                    el.appendChild(canvas);

                    // Allow dragging OFF the equipment slot
                    makeItemDraggable(el, itemInst, { type: 'slot', slot: slotName, index: 0 });
                }
            }
        }
    }

    public renderBag(inv: Inventory) {
        if (!this.bagPanel) {
            this.bagPanel = document.getElementById('backpack-grid') || document.createElement('div');
        }
        const grid = this.bagPanel; // This is #backpack-grid from main.html
        if (!grid) return;

        grid.innerHTML = ''; // Clear current

        // Get Backpack Slot
        // We need to know which slot holds better container. 
        // For now, assume 'backpack' slot.
        const bag = inv.getEquipped('backpack');

        if (bag && bag.contents) {
            // Render Contents
            bag.contents.forEach((item, index) => {
                const slot = document.createElement('div');
                slot.className = 'item-slot';
                // Drag Data
                slot.dataset.index = index.toString();
                slot.dataset.from = 'container';

                // Icon
                const uIndex = item.item.uIndex;
                const img = assetManager.getSprite(uIndex);
                if (img) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 32;
                    canvas.height = 32;
                    const ctx = canvas.getContext('2d');
                    if (ctx) ctx.drawImage(img, 0, 0, 32, 32);
                    slot.appendChild(canvas);

                    if (item.count > 1) {
                        const countSpan = document.createElement('span');
                        countSpan.className = 'item-count';
                        countSpan.innerText = `${item.count}`;
                        countSpan.style.cssText = 'position: absolute; right: 2px; bottom: 2px; color: white; font-size: 10px; text-shadow: 1px 1px 0 #000;';
                        slot.appendChild(countSpan);
                    }
                }

                // Drag Handling
                makeItemDraggable(slot, item, { type: 'container', index: index, slot: 'backpack' }); // Basic drag support

                grid.appendChild(slot);
            });

            // Fill remaining slots to look like 20 slot bag
            const totalSlots = 20;
            const filled = bag.contents.length;
            for (let i = filled; i < totalSlots; i++) {
                const slot = document.createElement('div');
                slot.className = 'item-slot empty';
                grid.appendChild(slot);
            }
        } else {
            // No bag equipped
            grid.innerText = "No Container";
            grid.style.color = "#777";
            grid.style.fontSize = "10px";
            grid.style.textAlign = "center";
            grid.style.padding = "10px";
        }
    }

    // Alias to satisfy interface
    public renderBackpack(inv: Inventory) { this.renderBag(inv); }

    // Crosshair Stubs
    public targetingItem: any = null;
    public cancelCrosshair() { }

    // Aliases/Stubs for game.ts compatibility
    public showDialogue(text: string, options?: any) { this.showDialog(text, options); }
    public hideDialogue() {
        // Hide dialog logic (stub)
        const d = document.getElementById('dialogue-box');
        if (d) d.style.display = 'none';
    }
    public toggleShop(...args: any[]) { }
    public openLoot(lootable: Lootable, id: number, pInv: Inventory) {
        this.activeLootEntityId = id;
        this.activeLootComponent = lootable;
        this.activePlayerInventory = pInv;

        const panel = document.getElementById('loot-panel');
        if (panel) {
            panel.style.display = 'block';
            panel.classList.remove('hidden');
        }

        this.renderLoot();
    }

    public renderLoot() {
        const grid = document.getElementById('loot-grid');
        if (!grid || !this.activeLootComponent) return;

        grid.innerHTML = '';

        const items = this.activeLootComponent.items || [];

        items.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'item-slot';
            slot.title = item.item.name + (item.count > 1 ? ` (${item.count})` : '');

            // Icon
            const uIndex = item.item.uIndex;
            const img = assetManager.getSprite(uIndex);

            if (img) {
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.drawImage(img, 0, 0, 32, 32);
                slot.appendChild(canvas);

                if (item.count > 1) {
                    const countSpan = document.createElement('span');
                    countSpan.className = 'item-count';
                    countSpan.innerText = `${item.count}`;
                    countSpan.style.cssText = 'position: absolute; right: 2px; bottom: 2px; color: white; font-size: 10px; text-shadow: 1px 1px 0 #000;';
                    slot.appendChild(countSpan);
                }
            }

            // Click to Loot
            slot.onclick = () => {
                this.takeLootItem(index);
            };

            grid.appendChild(slot);
        });

        // Fill remaining slots (min 8)
        const totalSlots = Math.max(8, items.length + 4);
        for (let i = items.length; i < totalSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'item-slot empty';
            grid.appendChild(slot);
        }
    }

    private takeLootItem(index: number) {
        if (!this.activeLootComponent || !this.activePlayerInventory) return;
        const items = this.activeLootComponent.items;
        if (index >= items.length) return;

        const itemToLoot = items[index];
        if (!itemToLoot || itemToLoot.count <= 0) return;

        console.log(`[Loot] Trying to loot: ${itemToLoot.item.name} (Count: ${itemToLoot.count})`);

        // Clone for inventory to prevent shared reference with the corpse/loot array
        const inventoryInstance = itemToLoot.clone();

        // Try to add to inventory
        if (this.activePlayerInventory.addItemInstance(inventoryInstance)) {
            // Success: 
            // If the item was fully consumed/moved, remove from source
            // If partially moved (count remains > 0), update source count
            if (inventoryInstance.count <= 0 || inventoryInstance !== itemToLoot) {
                // This logic is slightly complex because addItemInstance might have 
                // pushed the same object OR modified it. 
                // With cloning, we check the inventoryInstance.

                // If addItemInstance returned true, it means it was handled.
                // We should remove it from corpse now.
                items.splice(index, 1);
            }

            console.log(`[Loot] Success! Item added. Re-rendering bag.`);
            // Re-render UIs
            this.renderLoot();
            this.renderBag(this.activePlayerInventory);

            gameEvents.emit(EVENTS.SYSTEM_MESSAGE, `You looted ${itemToLoot.item.name}.`);
        } else {
            console.log(`[Loot] Failed to add item. Full? Backpack missing?`);
            gameEvents.emit(EVENTS.SYSTEM_MESSAGE, "You cannot carry this object.");
        }
    }
}

