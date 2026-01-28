/**
 * Tibia-Style UI Manager
 * 
 * Updates health/mana bars, skills display, and other UI elements
 * to reflect current player state.
 */

import { Player } from './core/player';
import { Skills } from './components';
import { World } from './engine';

// ============================================================
// DOM ELEMENT CACHE (For performance)
// ============================================================
let hpBar: HTMLDivElement | null = null;
let hpText: HTMLSpanElement | null = null;
let manaBar: HTMLDivElement | null = null;
let manaText: HTMLSpanElement | null = null;
let capVal: HTMLSpanElement | null = null;
let goldVal: HTMLSpanElement | null = null;
let lvlVal: HTMLSpanElement | null = null;
let xpBar: HTMLDivElement | null = null;
let xpPct: HTMLSpanElement | null = null;

// Skill elements
let skillElements: Map<string, {
    val: HTMLSpanElement | null;
    bar: HTMLDivElement | null;
    pct: HTMLSpanElement | null;
}> = new Map();

/**
 * Initialize UI element references
 * Call this once after DOM is ready
 */
export function initUI(): void {
    // Status bars
    hpBar = document.getElementById('hp-bar') as HTMLDivElement;
    hpText = document.getElementById('hp-text') as HTMLSpanElement;
    manaBar = document.getElementById('mana-bar') as HTMLDivElement;
    manaText = document.getElementById('mana-text') as HTMLSpanElement;

    // Stats
    capVal = document.getElementById('cap-val') as HTMLSpanElement;
    goldVal = document.getElementById('gold-val') as HTMLSpanElement;
    lvlVal = document.getElementById('lvl-val') as HTMLSpanElement;
    xpBar = document.getElementById('xp-bar') as HTMLDivElement;
    xpPct = document.getElementById('xp-pct') as HTMLSpanElement;

    // Skills
    const skillNames = ['magic', 'fist', 'club', 'sword', 'axe', 'distance', 'shielding'];
    skillNames.forEach(skill => {
        skillElements.set(skill, {
            val: document.getElementById(`skill-${skill}`) as HTMLSpanElement,
            bar: document.getElementById(`bar-${skill}`) as HTMLDivElement,
            pct: document.getElementById(`pct-${skill}`) as HTMLSpanElement
        });
    });

    console.log('[UI] Initialized');
}

/**
 * Update all UI elements based on player state
 * Call this every frame or when player stats change
 */
export function updateUI(player: Player, world: World): void {
    if (!hpBar || !manaBar) return;

    // ========== HEALTH ==========
    const hp = player.hp;
    const maxHp = player.maxHp;
    const hpPercent = Math.max(0, (hp / maxHp) * 100);

    hpBar.style.width = `${hpPercent}%`;
    if (hpText) hpText.innerText = `${hp}`;

    // Color change when low HP
    if (hpPercent < 25) {
        hpBar.style.backgroundColor = '#ff0000';
    } else if (hpPercent < 50) {
        hpBar.style.backgroundColor = '#ff6600';
    } else {
        hpBar.style.backgroundColor = '#d34c4c';
    }

    // ========== MANA ==========
    const mana = player.mana;
    const maxMana = player.maxMana;
    const manaPercent = Math.max(0, (mana / maxMana) * 100);

    manaBar.style.width = `${manaPercent}%`;
    if (manaText) manaText.innerText = `${mana}`;

    // ========== GENERAL STATS ==========
    if (capVal) capVal.innerText = `${player.capacity}`;
    if (goldVal) goldVal.innerText = `${player.gold}`;
    if (lvlVal) lvlVal.innerText = `${player.level}`;

    // ========== XP BAR ==========
    const xp = player.xp;
    const nextXp = player.nextXp;
    const xpPercent = nextXp > 0 ? Math.min(100, (xp / nextXp) * 100) : 0;

    if (xpBar) xpBar.style.width = `${xpPercent}%`;
    if (xpPct) xpPct.innerText = `${Math.floor(xpPercent)}%`;

    // ========== SKILLS ==========
    const skills = world.getComponent(player.id, Skills);
    if (skills) {
        // Skill objects have .level and .xp properties
        // Progress is calculated as xp towards next level (simplified: xp % 100)
        updateSkillBar('magic', skills.magic.level, (skills.magic.xp % 100));
        updateSkillBar('fist', 10, 0); // Fist not in Skills class, default
        updateSkillBar('club', skills.club.level, (skills.club.xp % 100));
        updateSkillBar('sword', skills.sword.level, (skills.sword.xp % 100));
        updateSkillBar('axe', skills.axe.level, (skills.axe.xp % 100));
        updateSkillBar('distance', skills.distance.level, (skills.distance.xp % 100));
        updateSkillBar('shielding', skills.shielding.level, (skills.shielding.xp % 100));
    }
}

/**
 * Update a single skill bar
 */
function updateSkillBar(skillName: string, level: number, progress: number): void {
    const elements = skillElements.get(skillName);
    if (!elements) return;

    if (elements.val) elements.val.innerText = `${level}`;
    if (elements.bar) elements.bar.style.width = `${progress}%`;
    if (elements.pct) elements.pct.innerText = `${Math.floor(progress)}%`;
}

/**
 * Add a chat message to the log
 */
export function addChatMessage(message: string, type: 'system' | 'say' | 'whisper' | 'yell' = 'system'): void {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;

    const msgSpan = document.createElement('span');
    msgSpan.className = `msg-${type}`;

    // Add timestamp
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    msgSpan.innerText = `${timestamp} ${message}`;
    chatLog.appendChild(msgSpan);
    chatLog.appendChild(document.createElement('br'));

    // Auto-scroll to bottom
    chatLog.scrollTop = chatLog.scrollHeight;
}

/**
 * Show overlay message on game window
 */
export function showOverlayMessage(message: string, durationMs: number = 2000): void {
    let overlay = document.getElementById('overlay-message');

    // Create if doesn't exist
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay-message';
        overlay.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 8px 16px;
            border: 1px solid #555;
            font-size: 12px;
            z-index: 100;
            pointer-events: none;
        `;
        document.getElementById('viewport')?.appendChild(overlay);
    }

    overlay.innerText = message;
    overlay.style.display = 'block';

    // Auto-hide
    setTimeout(() => {
        if (overlay) overlay.style.display = 'none';
    }, durationMs);
}

/**
 * Update battle list with nearby hostiles
 */
export function updateBattleList(entities: Array<{ id: number; name: string; hp: number; maxHp: number }>): void {
    const battleList = document.getElementById('battle-list');
    if (!battleList) return;

    battleList.innerHTML = '';

    entities.forEach(entity => {
        const entry = document.createElement('div');
        entry.className = 'battle-entry';
        entry.dataset.entityId = entity.id.toString();

        const hpPercent = Math.floor((entity.hp / entity.maxHp) * 100);
        entry.innerHTML = `${entity.name} <small>(${hpPercent}%)</small>`;

        battleList.appendChild(entry);
    });
}

// ============================================================
// EQUIPMENT DRAG & DROP (Paper Doll)
// ============================================================

import { SlotType } from './core/types';
import { ItemInstance, Item } from './components';
import { assetManager } from './assets';
import { equipItem, unequipItem, EquipmentMap, recalculateStats, PlayerStats } from './equipment';

// Global equipment state (will be linked to player)
let currentEquipment: EquipmentMap | null = null;
let onEquipCallback: ((stats: PlayerStats) => void) | null = null;

/**
 * Initialize equipment UI with drag-drop handlers
 * @param equipment - Reference to player's equipment slots
 * @param onEquip - Callback when equipment changes
 */
export function initEquipmentUI(
    equipment: EquipmentMap,
    onEquip?: (stats: PlayerStats) => void
): void {
    currentEquipment = equipment;
    onEquipCallback = onEquip || null;

    // Find all equipment slots
    const slots = document.querySelectorAll('.equip-slot');

    slots.forEach(slot => {
        const slotType = slot.getAttribute('data-type') || slot.id.replace('slot-', '').toUpperCase();

        // Allow dropping
        slot.addEventListener('dragover', (e: Event) => {
            e.preventDefault();
            slot.classList.add('drag-hover');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-hover');
        });

        slot.addEventListener('drop', (e: Event) => {
            const dragEvent = e as DragEvent;
            dragEvent.preventDefault();
            slot.classList.remove('drag-hover');

            if (!currentEquipment || !dragEvent.dataTransfer) return;

            try {
                const itemJson = dragEvent.dataTransfer.getData('text/plain');
                const itemData = JSON.parse(itemJson);

                // Create Item instance from data
                const item = new Item(
                    itemData.name || 'Item',
                    itemData.slotType || 'HAND_R',
                    itemData.uIndex || 0,
                    itemData.attack || 0,
                    100,
                    itemData.description || '',
                    'weapon',
                    'common',
                    itemData.defense || 0,
                    (itemData as any).armor || 0,
                    (itemData as any).speed || 0,
                    0, 0, false, 0, undefined, 0, 0, 0,
                    itemData.id || 0,
                    itemData.icon || ""
                );
                const itemInstance = new ItemInstance(item, itemData.count || 1);
                // Reconstruct contents if available
                if (itemData.contents) {
                    itemInstance.contents = itemData.contents;
                }

                // Try to equip
                const result = equipItem(currentEquipment, itemInstance, slotType);

                if (result.success) {
                    // Update slot visual
                    updateSlotVisual(slot as HTMLElement, item);

                    // Recalculate stats
                    const newStats = recalculateStats(currentEquipment);
                    if (onEquipCallback) onEquipCallback(newStats);

                    // Show message
                    addChatMessage(result.message, 'system');
                } else {
                    addChatMessage(result.message, 'system');
                }
            } catch (err) {
                console.error('[UI] Failed to parse dropped item:', err);
            }
        });

        // Right-click to unequip
        slot.addEventListener('contextmenu', (e: Event) => {
            e.preventDefault();

            if (!currentEquipment) return;

            const item = unequipItem(currentEquipment, slotType);
            if (item) {
                clearSlotVisual(slot as HTMLElement);

                const newStats = recalculateStats(currentEquipment);
                if (onEquipCallback) onEquipCallback(newStats);

                addChatMessage(`Unequipped ${item.item.name || 'item'}.`, 'system');

                // TODO: Add item back to inventory
            }
        });
    });

    console.log('[UI] Equipment drag-drop initialized');
}

/**
 * Update slot visual with equipped item
 */
function updateSlotVisual(slot: HTMLElement, item: Item): void {
    // Clear existing content
    slot.innerHTML = '';

    if (item.uIndex > 0) {
        const sprite = assetManager.getSpriteSource(item.uIndex);
        if (sprite && sprite.image) {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.imageSmoothingEnabled = false;
                const dw = Math.min(32, sprite.sw);
                const dh = Math.min(32, sprite.sh);
                const dx = (32 - dw) / 2;
                const dy = (32 - dh) / 2;
                ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, dx, dy, dw, dh);
            }
            slot.appendChild(canvas);
            return;
        }
    }

    if (item.icon) {
        slot.style.backgroundImage = `url('${item.icon}')`;
        slot.style.backgroundSize = 'contain';
        slot.style.backgroundPosition = 'center';
        slot.style.backgroundRepeat = 'no-repeat';
    } else {
        // Create placeholder with item ID
        const placeholder = document.createElement('span');
        placeholder.innerText = `#${item.id}`;
        placeholder.style.fontSize = '8px';
        slot.appendChild(placeholder);
    }
}

/**
 * Clear slot visual
 */
function clearSlotVisual(slot: HTMLElement): void {
    slot.style.backgroundImage = '';
    slot.innerHTML = '';
}

/**
 * Make an inventory item draggable
 * @param element - HTML element representing the item
 * @param item - Item data
 */
export function makeItemDraggable(element: HTMLElement, inst: ItemInstance, context?: any): void {
    element.setAttribute('draggable', 'true');
    element.style.cursor = 'grab';

    element.addEventListener('dragstart', (e: DragEvent) => {
        if (!e.dataTransfer) return;

        const item = inst.item;
        // Serialize item data
        const itemData = {
            id: item.id,
            name: item.name,
            count: inst.count,
            slotType: item.slotType,
            attack: item.attack,
            defense: item.defense,
            armor: item.armor,
            speed: item.speed,
            icon: item.icon,
            uIndex: item.uIndex,
            contents: inst.contents,
            ...context // Merge context (slot, index, from)
        };

        e.dataTransfer.setData('text/plain', JSON.stringify(itemData));
        e.dataTransfer.effectAllowed = 'move';

        element.style.opacity = '0.5';
    });

    element.addEventListener('dragend', () => {
        element.style.opacity = '1';
    });
}
