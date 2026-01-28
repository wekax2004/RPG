import { SPRITES } from '../constants';
import { Item } from '../components';

export interface ItemDef {
    name: string;
    type: 'weapon' | 'armor' | 'container' | 'food' | 'other' | 'item';
    attack?: number;
    defense?: number;
    slot?: string;
    heal?: number;
    stackable?: boolean;
    uIndex?: number; // Sprite ID for rendering
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    glowColor?: string;
    glowRadius?: number;
    price?: number; // Value in GP
    description?: string; // Added description
    weaponType?: 'sword' | 'axe' | 'club' | 'distance' | 'wand' | 'none'; // Added weaponType
    // Elemental Properties
    elementalDamage?: {
        type: 'fire' | 'ice' | 'lightning' | 'poison';
        amount: number;
    };
    elementalResist?: {
        fire?: number;   // 0.0 to 1.0
        ice?: number;
        lightning?: number;
        poison?: number;
    };
    // Rune Props
    isRune?: boolean;
    runeSpellName?: string;
    charges?: number;
}


export const ItemRegistry: Record<number, ItemDef> = {
    // ... (Existing)
    // Runes
    3176: { name: "Heavy Magic Missile", type: "item", uIndex: 3176, isRune: true, runeSpellName: "Heavy Magic Missile", charges: 5, price: 50 },
    3155: { name: "Sudden Death Rune", type: "item", uIndex: 3155, isRune: true, runeSpellName: "Sudden Death", charges: 1, price: 200 },
    3191: { name: "Great Fireball Rune", type: "item", uIndex: 3191, isRune: true, runeSpellName: "Fireball", charges: 3, price: 100 },

    // 8065 (DAGGER) - Using Dagger sprite (approx sprite ID 73 / 3266 in real Tibia, but using Short Sword or similar for now)
    // Actually using uIndex 42 (from Sheet) or something unique.
    8065: { name: "Dagger", type: "weapon", weaponType: "sword", attack: 8, defense: 2, slot: "rhand", uIndex: 42 },

    42: { name: "Short Sword", type: "weapon", weaponType: 'sword', attack: 10, slot: "rhand", uIndex: 8000 },
    // Terrain
    10: { name: "Grass", type: "other", uIndex: 10 },

    11: { name: "Dirt", type: "other", uIndex: 11 },
    12: { name: "Cobblestone", type: "other", uIndex: 12 },
    13: { name: "Water", type: "other", uIndex: 13 },
    // 21: { name: "Stone Wall", type: "other", uIndex: 21 },
    17: { name: "Cave Wall", type: "other", uIndex: 17 },

    2: { name: "Plate Armor", type: "armor", defense: 8, slot: "body", uIndex: 8011 },
    40: { name: "Gold Coin", type: "other", stackable: true, uIndex: 8008 },
    5: { name: "Wooden Shield", type: "armor", defense: 5, slot: "lhand", uIndex: 8026 },
    41: { name: "Health Potion", type: "food", heal: 25, uIndex: 8006 },
    22: { name: "Backpack", type: "container", slot: "backpack", stackable: false, uIndex: 8043 },
    30: { name: "Parcel", type: "container", stackable: false, uIndex: 8046 },
    21: { name: "Bag", type: "container", slot: "backpack", stackable: false, uIndex: 8042 },

    // Quest Items (Wekax Legends)
    [SPRITES.IRON_KEY]: { name: "Iron Key", type: "item", uIndex: SPRITES.IRON_KEY, description: "It looks heavy and old." },
    300: { name: "Dirty Note", type: "item", uIndex: 8060, description: "A crumpled note with crude writing." },
    301: { name: "Rusty Key", type: "item", uIndex: 8061, description: "Unlocks the main Sewer Gate." },
    302: { name: "Roast Chicken", type: "item", uIndex: 8062, description: "The King's favorite meal." },
    303: { name: "Orcish Peace Treaty", type: "item", uIndex: 8063, description: "A promise of peace from Grom." },
    // Legendary Sets (Golden)
    100: { name: "Golden Helmet", type: "armor", defense: 12, slot: "head", uIndex: 100 },
    101: { name: "Golden Armor", type: "armor", defense: 18, slot: "body", uIndex: 101 },        // ...
    // --- WEAPONS: CLUBS (Modest Dmg, +Defense) ---
    140: { name: "Wooden Club", type: "weapon", weaponType: 'club', attack: 8, slot: "rhand", uIndex: 8048 },
    141: { name: "Iron Mace", type: "weapon", weaponType: 'club', attack: 45, slot: "rhand", uIndex: 8049 },
    142: { name: "Warhammer", type: "weapon", weaponType: 'club', attack: 130, slot: "rhand", uIndex: 8050 },
    143: { name: "Morning Star", type: "weapon", weaponType: 'club', attack: 320, slot: "rhand", uIndex: 8051 },

    // --- WEAPONS: SWORDS ---
    150: { name: "Rusty Sword", type: "weapon", weaponType: 'sword', attack: 10, slot: "rhand", uIndex: 150 },
    151: { name: "Wooden Sword", type: "weapon", weaponType: 'sword', attack: 5, slot: "rhand", uIndex: 151 },
    152: { name: "Iron Sword", type: "weapon", weaponType: 'sword', attack: 40, slot: "rhand", uIndex: 8001 },
    153: { name: "Bone Sword", type: "weapon", weaponType: 'sword', attack: 25, slot: "rhand", uIndex: 153 },
    154: { name: "Steel Sword", type: "weapon", weaponType: 'sword', attack: 120, slot: "rhand", uIndex: 8002 },
    155: { name: "Demon Blade", type: "weapon", weaponType: 'sword', attack: 300, slot: "rhand", uIndex: 155 },
    156: { name: "Noble Sword", type: "weapon", weaponType: 'sword', attack: 500, slot: "rhand", uIndex: 156 },
    157: { name: "Venom Dagger", type: "weapon", weaponType: 'sword', attack: 150, slot: "rhand", uIndex: 157 },

    // --- ARMOR / MISC ---
    160: { name: "Wolf Pelt", type: "armor", defense: 5, slot: "body", uIndex: 160 },
    161: { name: "Bear Fur", type: "armor", defense: 25, slot: "body", uIndex: 161 },
    162: { name: "Orc Armor", type: "armor", defense: 40, slot: "body", uIndex: 162 },
    163: { name: "Skull Helm", type: "armor", defense: 10, slot: "head", uIndex: 8023 },
    164: { name: "Bandit Hood", type: "armor", defense: 8, slot: "head", uIndex: 164 },
    165: { name: "Crown of Kings", type: "armor", defense: 25, slot: "head", uIndex: 8024 },
    166: { name: "Dragon Shield", type: "armor", defense: 55, slot: "lhand", uIndex: 8028 },
    167: { name: "Orc Shield", type: "armor", defense: 18, slot: "lhand", uIndex: 167 },

    // --- CONSUMABLES / MATS ---
    [SPRITES.APPLE]: { name: "Apple", type: "food", heal: 5, stackable: true, uIndex: SPRITES.APPLE },
    170: { name: "Wolf Meat", type: "food", heal: 15, uIndex: 8041 },
    171: { name: "Rotten Flesh", type: "food", heal: -5, uIndex: 171 },
    172: { name: "Spider Silk", type: "other", uIndex: 172 },
    173: { name: "Mana Potion", type: "food", heal: 50, uIndex: 8007 },

    // Bulk / Decor
    203: { name: "Ruby", type: "other", stackable: true, uIndex: 8044 },
    204: { name: "Sapphire", type: "other", stackable: true, uIndex: 8045 },
    200: { name: "Pine Tree", type: "other", uIndex: 50 },
    201: { name: "Oak Tree", type: "other", uIndex: 51 },
    202: { name: "Large Rock", type: "other", uIndex: 6 },

    // Tools
    210: { name: "Shovel", type: "weapon", weaponType: 'club', attack: 8, slot: "both", uIndex: 8053 },
    211: { name: "Rope", type: "other", stackable: false, uIndex: 8052 },
    212: { name: "Machete", type: "weapon", weaponType: 'sword', attack: 15, slot: "rhand", uIndex: 43 },
    213: { name: "Pickaxe", type: "weapon", weaponType: 'axe', attack: 25, slot: "both", uIndex: 8054 },

    // --- WEAPONS: SWORDS (Balanced) ---
    [SPRITES.RAPIER]: { name: "Rapier", type: "weapon", weaponType: 'sword', attack: 15, defense: 2, slot: "rhand", uIndex: SPRITES.RAPIER },

    [SPRITES.SABRE]: { name: "Sabre", type: "weapon", weaponType: 'sword', attack: 25, defense: 12, slot: "rhand", uIndex: SPRITES.SABRE },
    [SPRITES.BROADSWORD]: { name: "Broadsword", type: "weapon", weaponType: 'sword', attack: 30, defense: 15, slot: "rhand", uIndex: SPRITES.BROADSWORD },
    [SPRITES.SPIKE_SWORD]: { name: "Spike Sword", type: "weapon", weaponType: 'sword', attack: 40, defense: 20, slot: "rhand", uIndex: SPRITES.SPIKE_SWORD },
    [SPRITES.BRIGHT_SWORD]: { name: "Bright Sword", type: "weapon", weaponType: 'sword', attack: 45, defense: 25, slot: "rhand", uIndex: SPRITES.BRIGHT_SWORD, rarity: 'rare', glowColor: '#fff', glowRadius: 40 },
    [SPRITES.ICE_RAPIER]: { name: "Ice Rapier", type: "weapon", weaponType: 'sword', attack: 100, defense: 0, slot: "rhand", uIndex: SPRITES.ICE_RAPIER, rarity: 'rare' }, // 1 hit?
    [SPRITES.GIANT_SWORD]: { name: "Giant Sword", type: "weapon", weaponType: 'sword', attack: 80, defense: 10, slot: "both", uIndex: SPRITES.GIANT_SWORD },
    [SPRITES.MAGIC_SWORD]: { name: "Magic Sword", type: "weapon", weaponType: 'sword', attack: 55, defense: 35, slot: "rhand", uIndex: SPRITES.MAGIC_SWORD, rarity: 'legendary', glowColor: '#00ffff', glowRadius: 60 },

    // --- WEAPONS: AXES (Offense) ---
    [SPRITES.HAND_AXE]: { name: "Hand Axe", type: "weapon", weaponType: 'axe', attack: 18, defense: 0, slot: "rhand", uIndex: SPRITES.HAND_AXE },
    [SPRITES.HATCHET]: { name: "Hatchet", type: "weapon", weaponType: 'axe', attack: 25, defense: 0, slot: "rhand", uIndex: SPRITES.HATCHET },
    [SPRITES.BATTLE_AXE]: { name: "Battle Axe", type: "weapon", weaponType: 'axe', attack: 35, defense: 0, slot: "both", uIndex: SPRITES.BATTLE_AXE },
    [SPRITES.DOUBLE_AXE]: { name: "Double Axe", type: "weapon", weaponType: 'axe', attack: 50, defense: 0, slot: "both", uIndex: SPRITES.DOUBLE_AXE },
    [SPRITES.GREAT_AXE]: { name: "Great Axe", type: "weapon", weaponType: 'axe', attack: 90, defense: 0, slot: "both", uIndex: SPRITES.GREAT_AXE, rarity: 'legendary' },

    // --- WEAPONS: CLUBS (Defense) ---
    [SPRITES.STUDDED_CLUB]: { name: "Studded Club", type: "weapon", weaponType: 'club', attack: 10, defense: 5, slot: "rhand", uIndex: SPRITES.STUDDED_CLUB },
    [SPRITES.MACE]: { name: "Mace", type: "weapon", weaponType: 'club', attack: 18, defense: 8, slot: "rhand", uIndex: SPRITES.MACE },
    [SPRITES.MORNING_STAR]: { name: "Morning Star", type: "weapon", weaponType: 'club', attack: 25, defense: 12, slot: "rhand", uIndex: SPRITES.MORNING_STAR },
    [SPRITES.WAR_HAMMER]: { name: "War Hammer", type: "weapon", weaponType: 'club', attack: 45, defense: 10, slot: "both", uIndex: SPRITES.WAR_HAMMER },
    [SPRITES.THUNDER_HAMMER]: { name: "Thunder Hammer", type: "weapon", weaponType: 'club', attack: 110, defense: 30, slot: "rhand", uIndex: SPRITES.THUNDER_HAMMER, rarity: 'legendary', glowColor: '#ffff00' },

    // --- ARMOR SETS ---
    // Leather
    [SPRITES.LEATHER_HELMET]: { name: "Leather Helmet", type: "armor", defense: 2, slot: "head", uIndex: SPRITES.LEATHER_HELMET },
    [SPRITES.LEATHER_ARMOR]: { name: "Leather Armor", type: "armor", defense: 4, slot: "body", uIndex: SPRITES.LEATHER_ARMOR },
    [SPRITES.LEATHER_LEGS]: { name: "Leather Legs", type: "armor", defense: 1, slot: "legs", uIndex: SPRITES.LEATHER_LEGS },
    [SPRITES.LEATHER_BOOTS]: { name: "Leather Boots", type: "armor", defense: 1, slot: "boots", uIndex: SPRITES.LEATHER_BOOTS },

    // Chain
    [SPRITES.CHAIN_HELMET]: { name: "Chain Helmet", type: "armor", defense: 4, slot: "head", uIndex: SPRITES.CHAIN_HELMET },
    [SPRITES.CHAIN_ARMOR]: { name: "Chain Armor", type: "armor", defense: 8, slot: "body", uIndex: SPRITES.CHAIN_ARMOR },
    [SPRITES.CHAIN_LEGS]: { name: "Chain Legs", type: "armor", defense: 3, slot: "legs", uIndex: SPRITES.CHAIN_LEGS },

    // Knight
    [SPRITES.KNIGHT_HELMET]: { name: "Knight Helmet", type: "armor", defense: 8, slot: "head", uIndex: SPRITES.KNIGHT_HELMET },
    [SPRITES.KNIGHT_ARMOR]: { name: "Knight Armor", type: "armor", defense: 14, slot: "body", uIndex: SPRITES.KNIGHT_ARMOR },
    [SPRITES.KNIGHT_LEGS]: { name: "Knight Legs", type: "armor", defense: 7, slot: "legs", uIndex: SPRITES.KNIGHT_LEGS },
    [SPRITES.STEEL_BOOTS]: { name: "Steel Boots", type: "armor", defense: 3, slot: "boots", uIndex: SPRITES.STEEL_BOOTS },

    // Keys
    [SPRITES.KEY_ORCHARD]: { name: "Orchard Key", type: "item", uIndex: SPRITES.KEY_ORCHARD, rarity: 'rare' },
    [SPRITES.KEY_MINE]: { name: "Mine Key", type: "item", uIndex: SPRITES.KEY_MINE, rarity: 'rare' },

    // ============ ELEMENTAL WEAPONS ============
    // Fire
    [SPRITES.FIRE_SWORD]: { name: "Fire Sword", type: "weapon", attack: 45, defense: 10, slot: "rhand", uIndex: SPRITES.FIRE_SWORD, rarity: 'rare', glowColor: '#ff4400', elementalDamage: { type: 'fire', amount: 15 } },
    [SPRITES.FIRE_AXE]: { name: "Fire Axe", type: "weapon", attack: 60, defense: 0, slot: "both", uIndex: SPRITES.FIRE_AXE, rarity: 'rare', glowColor: '#ff6600', elementalDamage: { type: 'fire', amount: 20 } },
    [SPRITES.INFERNO_BLADE]: { name: "Inferno Blade", type: "weapon", attack: 85, defense: 15, slot: "rhand", uIndex: SPRITES.INFERNO_BLADE, rarity: 'legendary', glowColor: '#ff2200', glowRadius: 80, elementalDamage: { type: 'fire', amount: 35 } },

    // Ice
    [SPRITES.FROST_BLADE]: { name: "Frost Blade", type: "weapon", attack: 40, defense: 20, slot: "rhand", uIndex: SPRITES.FROST_BLADE, rarity: 'rare', glowColor: '#00ccff', elementalDamage: { type: 'ice', amount: 12 } },
    [SPRITES.GLACIAL_AXE]: { name: "Glacial Axe", type: "weapon", attack: 55, defense: 5, slot: "both", uIndex: SPRITES.GLACIAL_AXE, rarity: 'rare', glowColor: '#66ddff', elementalDamage: { type: 'ice', amount: 18 } },
    [SPRITES.FROZEN_MACE]: { name: "Frozen Mace", type: "weapon", attack: 35, defense: 25, slot: "rhand", uIndex: SPRITES.FROZEN_MACE, rarity: 'epic', glowColor: '#aaeeff', elementalDamage: { type: 'ice', amount: 25 } },

    // Lightning
    [SPRITES.STORM_BLADE]: { name: "Storm Blade", type: "weapon", attack: 50, defense: 8, slot: "rhand", uIndex: SPRITES.STORM_BLADE, rarity: 'rare', glowColor: '#ffff00', elementalDamage: { type: 'lightning', amount: 20 } },
    [SPRITES.THUNDER_AXE]: { name: "Thunder Axe", type: "weapon", attack: 70, defense: 0, slot: "both", uIndex: SPRITES.THUNDER_AXE, rarity: 'epic', glowColor: '#eeee00', elementalDamage: { type: 'lightning', amount: 28 } },
    [SPRITES.LIGHTNING_ROD]: { name: "Lightning Rod", type: "weapon", attack: 30, defense: 5, slot: "rhand", uIndex: SPRITES.LIGHTNING_ROD, rarity: 'legendary', glowColor: '#ffff88', glowRadius: 100, elementalDamage: { type: 'lightning', amount: 45 } },

    // Poison
    [SPRITES.VENOM_BLADE]: { name: "Venom Blade", type: "weapon", attack: 35, defense: 12, slot: "rhand", uIndex: SPRITES.VENOM_BLADE, rarity: 'rare', glowColor: '#00ff44', elementalDamage: { type: 'poison', amount: 10 } },
    [SPRITES.POISON_AXE]: { name: "Poison Axe", type: "weapon", attack: 50, defense: 0, slot: "both", uIndex: SPRITES.POISON_AXE, rarity: 'epic', glowColor: '#44ff00', elementalDamage: { type: 'poison', amount: 18 } },
    [SPRITES.TOXIC_MACE]: { name: "Toxic Mace", type: "weapon", attack: 28, defense: 18, slot: "rhand", uIndex: SPRITES.TOXIC_MACE, rarity: 'rare', glowColor: '#88ff44', elementalDamage: { type: 'poison', amount: 22 } },

    // ============ ELEMENTAL ARMOR ============
    // Fire
    [SPRITES.FLAME_ARMOR]: { name: "Flame Armor", type: "armor", defense: 12, slot: "body", uIndex: SPRITES.FLAME_ARMOR, rarity: 'rare', glowColor: '#ff4400', elementalResist: { fire: 0.5, ice: -0.2 } },
    [SPRITES.FLAME_HELMET]: { name: "Flame Helmet", type: "armor", defense: 6, slot: "head", uIndex: SPRITES.FLAME_HELMET, rarity: 'rare', elementalResist: { fire: 0.3 } },
    [SPRITES.FLAME_LEGS]: { name: "Flame Legs", type: "armor", defense: 5, slot: "legs", uIndex: SPRITES.FLAME_LEGS, rarity: 'rare', elementalResist: { fire: 0.2 } },
    [SPRITES.FLAME_BOOTS]: { name: "Flame Boots", type: "armor", defense: 3, slot: "boots", uIndex: SPRITES.FLAME_BOOTS, rarity: 'uncommon', elementalResist: { fire: 0.15 } },

    // Ice
    [SPRITES.FROST_ARMOR]: { name: "Frost Armor", type: "armor", defense: 10, slot: "body", uIndex: SPRITES.FROST_ARMOR, rarity: 'rare', glowColor: '#00ccff', elementalResist: { ice: 0.5, fire: -0.2 } },
    [SPRITES.FROST_HELMET]: { name: "Frost Helmet", type: "armor", defense: 5, slot: "head", uIndex: SPRITES.FROST_HELMET, rarity: 'rare', elementalResist: { ice: 0.3 } },
    [SPRITES.FROST_LEGS]: { name: "Frost Legs", type: "armor", defense: 4, slot: "legs", uIndex: SPRITES.FROST_LEGS, rarity: 'rare', elementalResist: { ice: 0.2 } },
    [SPRITES.FROST_BOOTS]: { name: "Frost Boots", type: "armor", defense: 2, slot: "boots", uIndex: SPRITES.FROST_BOOTS, rarity: 'uncommon', elementalResist: { ice: 0.15 } },

    // Lightning
    [SPRITES.STORM_ARMOR]: { name: "Storm Armor", type: "armor", defense: 11, slot: "body", uIndex: SPRITES.STORM_ARMOR, rarity: 'epic', glowColor: '#ffff00', elementalResist: { lightning: 0.6 } },
    [SPRITES.STORM_HELMET]: { name: "Storm Helmet", type: "armor", defense: 7, slot: "head", uIndex: SPRITES.STORM_HELMET, rarity: 'rare', elementalResist: { lightning: 0.35 } },
    [SPRITES.STORM_LEGS]: { name: "Storm Legs", type: "armor", defense: 5, slot: "legs", uIndex: SPRITES.STORM_LEGS, rarity: 'rare', elementalResist: { lightning: 0.25 } },
    [SPRITES.STORM_BOOTS]: { name: "Storm Boots", type: "armor", defense: 3, slot: "boots", uIndex: SPRITES.STORM_BOOTS, rarity: 'uncommon', elementalResist: { lightning: 0.15 } },

    // Poison
    [SPRITES.VENOM_ARMOR]: { name: "Venom Armor", type: "armor", defense: 9, slot: "body", uIndex: SPRITES.VENOM_ARMOR, rarity: 'rare', glowColor: '#00ff44', elementalResist: { poison: 0.7 } },
    [SPRITES.VENOM_HELMET]: { name: "Venom Helmet", type: "armor", defense: 5, slot: "head", uIndex: SPRITES.VENOM_HELMET, rarity: 'rare', elementalResist: { poison: 0.4 } },
    [SPRITES.VENOM_LEGS]: { name: "Venom Legs", type: "armor", defense: 4, slot: "legs", uIndex: SPRITES.VENOM_LEGS, rarity: 'rare', elementalResist: { poison: 0.25 } },
    [SPRITES.VENOM_BOOTS]: { name: "Venom Boots", type: "armor", defense: 2, slot: "boots", uIndex: SPRITES.VENOM_BOOTS, rarity: 'uncommon', elementalResist: { poison: 0.15 } }
};

export function createItemFromRegistry(id: number | string, count: number = 1): Item {
    const def = (ItemRegistry[id as number] || ItemRegistry[id as any]) as any;

    if (def) {
        return new Item(
            def.name,
            def.slot || "inventory",
            def.uIndex,
            def.attack || 0,
            def.price || 0,
            def.description || "",
            def.weaponType || "none",
            def.rarity || 'common',
            def.defense || 0,
            def.armor || 0,
            def.speed || 0,
            0, 0, // bonusHp, bonusMana
            def.type === 'container', def.type === 'container' ? 20 : 0,
            def.glowColor, def.glowRadius || 0,
            0, /* frame */
            0, /* direction */
            typeof id === 'number' ? id : 0, /* registry id */
            "", /* icon */
            def.isRune || false,
            def.runeSpellName || "",
            def.type || "misc", /* Item Type (food, potion, etc) */
            def.charges || 0,
            def.stackable || false
        );
    }
    return new Item("Unknown Item", "inventory", 0);
}
