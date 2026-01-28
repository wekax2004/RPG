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
    public shopPanel: HTMLElement | null = null;
    public bagPanel: HTMLElement | null = null;
    public currentMerchant: any = null;
    public activeMerchantId: any | null = null;

    // Loot State
    public activeLootEntityId: number | null = null;
    public activeLootComponent: Lootable | null = null;
    public activePlayerInventory: Inventory | null = null;

    private lastBagString: string = "";

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

        // Initial UI Finding
        this.bagPanel = document.getElementById('backpack-grid');
        this.shopPanel = document.getElementById('shop-window');
        this.lootGrid = document.getElementById('loot-grid');

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
                const req = Math.floor(50 * Math.pow(1.1, lvl));
                return Math.min(100, Math.max(0, (cur / req) * 100));
            };

            const getMagicPct = (lvl: number, cur: number) => {
                const req = Math.floor(100 * Math.pow(1.1, lvl));
                return Math.min(100, Math.max(0, (cur / req) * 100));
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
            this.bagPanel = document.getElementById('backpack-grid');
        }
        const grid = this.bagPanel;
        if (!grid) return;

        grid.innerHTML = ''; // Clear current

        // console.log(`[UIManager] renderBag: gold: ${inv.gold}`);

        // Get Backpack Slot
        const bag = inv.equipment.get('backpack');

        if (bag) {
            const contents = bag.contents || [];

            // Diagnostics: Only log if contents change to avoid Spam
            const currentString = JSON.stringify(contents.map(i => ({ n: i.item.name, c: i.count })));
            if (currentString !== this.lastBagString) {
                console.log(`[UIManager] renderBag: Contents changed! Count: ${contents.length}`);
                this.lastBagString = currentString;
            }

            // Render Contents
            contents.forEach((item, index) => {
                if (!item || !item.item) return;

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
                } else {
                    // Standardized FALLBACK: Text-based icon
                    const fallback = document.createElement('div');
                    fallback.innerText = item.item.name.substring(0, 2).toUpperCase();
                    fallback.style.cssText = 'width: 32px; height: 32px; font-size: 14px; color: #aaa; text-align: center; line-height: 32px; background: #222; border-radius: 4px;';
                    slot.appendChild(fallback);
                }

                if (item.count > 1) {
                    const countSpan = document.createElement('span');
                    countSpan.className = 'item-count';
                    countSpan.innerText = `${item.count}`;
                    countSpan.style.cssText = 'position: absolute; right: 2px; bottom: 2px; color: white; font-size: 10px; text-shadow: 1px 1px 0 #000; pointer-events: none;';
                    slot.appendChild(countSpan);
                }

                // Drag Handling
                makeItemDraggable(slot, item, { type: 'container', index: index, slot: 'backpack' });

                // Interaction (Right-Click to Use)
                slot.oncontextmenu = (e) => {
                    e.preventDefault();
                    console.log(`[Inventory] Using item: ${item.item.name}`);
                    // Dispatch Custom Event "playerAction" that main_v4.ts listens to
                    const event = new CustomEvent('playerAction', {
                        detail: {
                            action: 'consume', // or 'use' generic
                            item: item.item,
                            index: index,
                            fromBag: true
                        }
                    });
                    document.dispatchEvent(event);
                };

                grid.appendChild(slot);
            });

            // Fill remaining slots
            const limit = bag.item.containerSize || 20;
            for (let i = contents.length; i < limit; i++) {
                const slot = document.createElement('div');
                slot.className = 'item-slot empty';
                grid.appendChild(slot);
            }
        } else {
            console.log(`[UIManager] renderBag: No backpack equipped.`);
            grid.innerHTML = '<div style="color: #666; font-size: 10px; padding: 10px; width: 100%; text-align: center;">No Container</div>';
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

        // Add "Take All" button at the top of the grid if there are items
        if (items.length > 0) {
            const takeAllBtn = document.createElement('div');
            takeAllBtn.className = 'take-all-btn';
            takeAllBtn.innerText = 'TAKE ALL';
            takeAllBtn.style.cssText = 'grid-column: span 4; background: #444; color: #ffd700; text-align: center; padding: 4px; cursor: pointer; border: 1px solid #666; font-size: 10px; margin-bottom: 5px;';
            takeAllBtn.onclick = () => this.takeAllLoot();
            grid.appendChild(takeAllBtn);
        }

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
            } else {
                // Standardized FALLBACK
                const fallback = document.createElement('div');
                fallback.innerText = item.item.name.substring(0, 2).toUpperCase();
                fallback.style.cssText = 'width: 32px; height: 32px; font-size: 14px; color: #aaa; text-align: center; line-height: 32px; background: #222; border-radius: 4px;';
                slot.appendChild(fallback);
            }

            if (item.count > 1) {
                const countSpan = document.createElement('span');
                countSpan.className = 'item-count';
                countSpan.innerText = `${item.count}`;
                countSpan.style.cssText = 'position: absolute; right: 2px; bottom: 2px; color: white; font-size: 10px; text-shadow: 1px 1px 0 #000; pointer-events: none;';
                slot.appendChild(countSpan);
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
            itemToLoot.count = inventoryInstance.count;
            if (itemToLoot.count <= 0) items.splice(index, 1);

            console.log(`[Loot] Success! Item added. Remaining in corpse: ${itemToLoot.count}`);
            gameEvents.emit(EVENTS.SYSTEM_MESSAGE, `You looted ${itemToLoot.item.name}.`);
        } else {
            // Check if count was reduced (partial stacking)
            if (inventoryInstance.count < itemToLoot.count) {
                itemToLoot.count = inventoryInstance.count;
                console.log(`[Loot] Partial loot! Remaining: ${itemToLoot.count}`);
            } else {
                console.log(`[Loot] Failed to add item. Full?`);
                gameEvents.emit(EVENTS.SYSTEM_MESSAGE, "You cannot carry this object.");
            }
        }

        // Always re-render to keep UI in sync
        this.renderLoot();
        this.renderBag(this.activePlayerInventory);
    }

    private takeAllLoot() {
        if (!this.activeLootComponent || !this.activePlayerInventory) return;
        const items = this.activeLootComponent.items;
        if (!items || items.length === 0) return;

        console.log(`[Loot] Taking all ${items.length} items...`);

        // We iterate backwards because we might splice
        for (let i = items.length - 1; i >= 0; i--) {
            this.takeLootItem(i);
        }

        console.log(`[Loot] Take All finished.`);
    }
}

