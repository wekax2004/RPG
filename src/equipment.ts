/**
 * Equipment System (Paper Doll)
 * 
 * Handles equipping items into slots,
 * validating slot types, and recalculating player stats.
 */

import { SlotType } from './core/types';
import { ItemInstance, Stats as PlayerStats, Item } from './components';

// ============================================================
// EQUIPMENT STATE
// ============================================================

// EquipmentSlots will now match the Inventory.equipment Map structure
// but we'll provide a helper for initialization
export type EquipmentMap = Map<string, ItemInstance>;

// Re-export PlayerStats for convenience
export { PlayerStats };

/**
 * Creates empty equipment map
 */
export function createEmptyEquipment(): EquipmentMap {
    return new Map<string, ItemInstance>();
}

// ============================================================
// SLOT NORMALIZATION
// ============================================================

/**
 * Maps between item slot names (lowercase) and UI slot names (uppercase)
 * Items use: rhand, lhand, body, head, legs, boots
 * UI uses: HAND_R, HAND_L, BODY, HEAD, LEGS, FEET
 */
const SLOT_MAP: Record<string, string> = {
    // Item slot -> UI slot
    'rhand': 'HAND_R',
    'lhand': 'HAND_L',
    'body': 'BODY',
    'head': 'HEAD',
    'legs': 'LEGS',
    'boots': 'FEET',
    'backpack': 'BACKPACK',
    'amulet': 'AMULET',
    'ring': 'RING',
    'ammo': 'AMMO',
    // UI slot -> normalized (identity)
    'HAND_R': 'HAND_R',
    'HAND_L': 'HAND_L',
    'BODY': 'BODY',
    'HEAD': 'HEAD',
    'LEGS': 'LEGS',
    'FEET': 'FEET',
    'BACKPACK': 'BACKPACK',
    'AMULET': 'AMULET',
    'RING': 'RING',
    'AMMO': 'AMMO',
};

/**
 * Normalizes a slot name to the UI format (uppercase)
 */
function normalizeSlot(slot: string): string {
    return SLOT_MAP[slot] || slot.toUpperCase();
}

// ============================================================
// EQUIP ITEM
// ============================================================

/**
 * Result of an equip attempt
 */
export interface EquipResult {
    success: boolean;
    unequipped?: ItemInstance;  // Item instance that was removed from slot
    message: string;
}

/**
 * Attempts to equip an item into a specific slot.
 * 
 * @param equipment - Current equipment map
 * @param item - Item instance to equip
 * @param targetSlot - Target slot name
 * @returns EquipResult with success status and any unequipped item instance
 */
export function equipItem(
    equipment: EquipmentMap,
    item: ItemInstance,
    targetSlot: string
): EquipResult {
    const itemData = item.item;

    // Normalize slot names for comparison
    const normalizedTarget = normalizeSlot(targetSlot);
    const normalizedItem = itemData.slotType ? normalizeSlot(itemData.slotType) : null;

    // 1. Validate: Does the item fit this slot?
    if (normalizedItem) {
        // Hand slots accept 'HAND_L' or 'HAND_R' items, or any HAND type
        const validHand = (normalizedTarget === 'HAND_L' || normalizedTarget === 'HAND_R') &&
            (normalizedItem === 'HAND_L' || normalizedItem === 'HAND_R');

        if (normalizedItem !== normalizedTarget && !validHand) {
            return {
                success: false,
                message: `Cannot equip ${itemData.name || 'item'} in ${targetSlot} slot.`
            };
        }
    }

    // 2. Remove current item if any
    const currentItem = equipment.get(targetSlot);

    // 3. Equip new item
    equipment.set(targetSlot, item);

    console.log(`[Equipment] Equipped ${itemData.name || `Item #${itemData.id}`} to ${targetSlot}`);

    return {
        success: true,
        unequipped: currentItem || undefined,
        message: `Equipped ${itemData.name || 'item'}!`
    };
}

/**
 * Removes item from a slot
 */
export function unequipItem(
    equipment: EquipmentMap,
    slot: string
): ItemInstance | null {
    const item = equipment.get(slot);
    equipment.delete(slot);

    if (item) {
        console.log(`[Equipment] Unequipped ${item.item.name || `Item #${item.item.id}`} from ${slot}`);
    }

    return item || null;
}

// ============================================================
// STAT CALCULATION
// ============================================================

/**
 * Recalculates player stats based on equipped items
 * 
 * @param equipment - Current equipment map
 * @param baseStats - Base stats (before equipment)
 * @returns Calculated total stats
 */
export function recalculateStats(
    equipment: EquipmentMap,
    baseStats: PlayerStats = new PlayerStats(10, 0, 1.0, 48)
): PlayerStats {

    let totalAttack = baseStats.attack;
    let totalDefense = baseStats.defense;
    let totalArmor = 0; // Base armor is 0
    let totalSpeed = 100; // Base speed placeholder

    // Iterate over all equipment slots
    for (const [slot, instance] of equipment) {
        if (!instance) continue;
        const item = instance.item;

        if (item.attack) totalAttack += item.attack;
        if (item.defense) totalDefense += item.defense;
        if ((item as any).armor) totalArmor += (item as any).armor;
        if ((item as any).speed) totalSpeed += (item as any).speed;
    }

    const newStats = new PlayerStats(
        totalAttack,
        totalDefense,
        baseStats.attackSpeed,
        baseStats.range
    );

    // We might need to store armor/speed somewhere else or extend PlayerStats
    (newStats as any).armor = totalArmor;
    (newStats as any).speed = totalSpeed;

    console.log('[Equipment] Stats recalculated:', newStats);

    return newStats;
}

// ============================================================
// ITEM DEFINITIONS (Example equipment database)
// ============================================================
export const EQUIPMENT_DB: Record<number, Partial<Item>> = {
    // Weapons (HAND_R)
    42: { name: 'Iron Sword', slotType: 'HAND_R', attack: 15, uIndex: 42 },
    43: { name: 'Magic Sword', slotType: 'HAND_R', attack: 48, uIndex: 43 },

    // Shields (HAND_L)
    44: { name: 'Wooden Shield', slotType: 'HAND_L', defense: 5, uIndex: 44 },
    45: { name: 'Steel Shield', slotType: 'HAND_L', defense: 15, uIndex: 45 },

    // Helmets (HEAD)
    100: { name: 'Golden Helmet', slotType: 'HEAD', armor: 12, uIndex: 100 },

    // Armor (BODY)
    101: { name: 'Golden Armor', slotType: 'BODY', armor: 15, uIndex: 101 },

    // Legs (LEGS)
    102: { name: 'Golden Legs', slotType: 'LEGS', armor: 8, uIndex: 102 },

    // Boots (FEET)
    103: { name: 'Golden Boots', slotType: 'FEET', armor: 4, speed: 10, uIndex: 103 },
};

/**
 * Creates an equipment item instance from the database
 */
export function createEquipmentItem(itemId: number): ItemInstance | null {
    const template = EQUIPMENT_DB[itemId];
    if (!template) return null;

    // Map template properties to Item constructor
    const item = new Item(
        template.name || 'Equipment',
        template.slotType || 'HAND_R',
        template.uIndex || 0,
        template.attack || 0,
        100, // Price
        template.description || '',
        'weapon',
        'common',
        template.defense || 0,
        (template as any).armor || 0,
        (template as any).speed || 0,
        0, // bonusHp
        0, // bonusMana
        false, // isContainer
        0, // containerSize
        undefined, // glowColor
        0, // glowRadius
        0, // frame
        0, // direction
        itemId
    );

    return new ItemInstance(item, 1);
}
