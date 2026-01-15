export interface ItemDef {
    name: string;
    type: 'weapon' | 'armor' | 'container' | 'food' | 'other';
    attack?: number;
    defense?: number;
    slot?: string;
    heal?: number;
    stackable?: boolean;
    uIndex?: number; // Sprite ID for rendering
}

export const ItemRegistry: Record<number, ItemDef> = {
    42: { name: "Short Sword", type: "weapon", attack: 10, slot: "rhand", uIndex: 42 },
    // Terrain
    10: { name: "Grass", type: "other", uIndex: 10 },
    11: { name: "Dirt", type: "other", uIndex: 11 },
    12: { name: "Cobblestone", type: "other", uIndex: 12 },
    13: { name: "Water", type: "other", uIndex: 13 },
    21: { name: "Stone Wall", type: "other", uIndex: 21 },
    17: { name: "Cave Wall", type: "other", uIndex: 17 },

    2: { name: "Plate Armor", type: "armor", defense: 8, slot: "body", uIndex: 2 }, // Armor sprite? Need to check assets
    40: { name: "Gold Coin", type: "other", stackable: true, uIndex: 40 },
    5: { name: "Wooden Shield", type: "armor", defense: 5, slot: "lhand", uIndex: 46 }, // Fixed: 5 was Tree, using 46 (Shield)
    41: { name: "Health Potion", type: "food", heal: 25, uIndex: 41 },
    22: { name: "Backpack", type: "container", slot: "backpack", stackable: false, uIndex: 22 },
    30: { name: "Parcel", type: "container", stackable: false, uIndex: 33 }, // Changed to 33
    21: { name: "Bag", type: "container", slot: "backpack", stackable: false, uIndex: 21 },
    // Legendary Sets (Golden)
    100: { name: "Golden Helmet", type: "armor", defense: 12, slot: "head", uIndex: 100 },
    101: { name: "Golden Armor", type: "armor", defense: 18, slot: "body", uIndex: 101 },        // ...
    // --- WEAPONS: CLUBS (Modest Dmg, +Defense) ---
    140: { name: "Wooden Club", type: "weapon", attack: 8, slot: "rhand", uIndex: 140 }, // Fixed uIndex 140
    141: { name: "Iron Mace", type: "weapon", attack: 45, slot: "rhand", uIndex: 141 },
    142: { name: "Warhammer", type: "weapon", attack: 130, slot: "rhand", uIndex: 142 },
    143: { name: "Morning Star", type: "weapon", attack: 320, slot: "rhand", uIndex: 143 },

    // --- WEAPONS: SWORDS ---
    150: { name: "Rusty Sword", type: "weapon", attack: 10, slot: "rhand", uIndex: 150 },
    151: { name: "Wooden Sword", type: "weapon", attack: 5, slot: "rhand", uIndex: 151 },
    152: { name: "Iron Sword", type: "weapon", attack: 40, slot: "rhand", uIndex: 152 },
    153: { name: "Bone Sword", type: "weapon", attack: 25, slot: "rhand", uIndex: 153 },
    154: { name: "Steel Sword", type: "weapon", attack: 120, slot: "rhand", uIndex: 154 },
    155: { name: "Demon Blade", type: "weapon", attack: 300, slot: "rhand", uIndex: 155 },
    156: { name: "Noble Sword", type: "weapon", attack: 500, slot: "rhand", uIndex: 156 },
    157: { name: "Venom Dagger", type: "weapon", attack: 150, slot: "rhand", uIndex: 157 },

    // --- ARMOR / MISC ---
    160: { name: "Wolf Pelt", type: "armor", defense: 5, slot: "body", uIndex: 160 },
    161: { name: "Bear Fur", type: "armor", defense: 25, slot: "body", uIndex: 161 },
    162: { name: "Orc Armor", type: "armor", defense: 40, slot: "body", uIndex: 162 },
    163: { name: "Skull Helm", type: "armor", defense: 10, slot: "head", uIndex: 163 },
    164: { name: "Bandit Hood", type: "armor", defense: 8, slot: "head", uIndex: 164 },
    165: { name: "Crown of Kings", type: "armor", defense: 25, slot: "head", uIndex: 165 },
    166: { name: "Dragon Shield", type: "armor", defense: 55, slot: "lhand", uIndex: 166 },
    167: { name: "Orc Shield", type: "armor", defense: 18, slot: "lhand", uIndex: 167 },

    // --- CONSUMABLES / MATS ---
    170: { name: "Wolf Meat", type: "food", heal: 15, uIndex: 170 },
    171: { name: "Rotten Flesh", type: "food", heal: -5, uIndex: 171 },
    172: { name: "Spider Silk", type: "other", uIndex: 172 },
    173: { name: "Mana Potion", type: "food", heal: 50, uIndex: 41 }, // Visual same as potion

    // Bulk / Decor
    203: { name: "Ruby", type: "other", stackable: true, uIndex: 203 },
    204: { name: "Sapphire", type: "other", stackable: true, uIndex: 204 },
    200: { name: "Pine Tree", type: "other", uIndex: 50 },
    201: { name: "Oak Tree", type: "other", uIndex: 51 },
    202: { name: "Large Rock", type: "other", uIndex: 6 },

    // Tools
    210: { name: "Shovel", type: "weapon", attack: 8, slot: "both", uIndex: 124 },
    211: { name: "Rope", type: "other", stackable: false, uIndex: 65 },
    212: { name: "Machete", type: "weapon", attack: 15, slot: "rhand", uIndex: 43 },
    213: { name: "Pickaxe", type: "weapon", attack: 25, slot: "both", uIndex: 66 }
};
