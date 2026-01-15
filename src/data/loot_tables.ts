export interface LootEntry {
    itemId: number;
    chance: number; // 0.0 to 1.0
    min?: number;
    max?: number;
}

export const LOOT_TABLES: Record<string, LootEntry[]> = {
    // --- ANIMALS ---
    'wolf': [
        { itemId: 170, chance: 0.30, min: 1, max: 1 }, // Meat
        { itemId: 160, chance: 0.15 } // Pelt
    ],
    'bear': [
        { itemId: 161, chance: 0.20 }, // Bear Fur
        { itemId: 170, chance: 0.60, min: 1, max: 3 } // Meat
    ],
    'spider': [
        { itemId: 172, chance: 0.40 }, // Silk
        { itemId: 157, chance: 0.05 }  // Venom Dagger
    ],

    // --- HUMANOIDS ---
    'bandit': [
        { itemId: 40, chance: 0.50, min: 2, max: 10 }, // Gold
        { itemId: 164, chance: 0.15 }, // Hood
        { itemId: 152, chance: 0.10 }, // Iron Sword
        { itemId: 41, chance: 0.25 }   // Health Potion
    ],
    'orc': [
        { itemId: 40, chance: 0.40, min: 3, max: 15 },
        { itemId: 132, chance: 0.08 }, // Orc Axe
        { itemId: 162, chance: 0.03 }, // Orc Armor
        { itemId: 167, chance: 0.04 }, // Orc Shield
        { itemId: 41, chance: 0.15 }   // Potion
    ],

    // --- UNDEAD ---
    'skeleton': [
        { itemId: 153, chance: 0.10 }, // Bone Sword
        { itemId: 140, chance: 0.15 }, // Wooden Club
        { itemId: 163, chance: 0.08 }, // Skull Helm
        { itemId: 40, chance: 0.20, min: 1, max: 5 } // Gold
    ],
    'zombie': [
        { itemId: 171, chance: 0.40 }, // Rotten Flesh
        { itemId: 150, chance: 0.10 }, // Rusty Sword
        { itemId: 130, chance: 0.08 }  // Hand Axe
    ],
    'ghost': [
        { itemId: 203, chance: 0.05 }, // Ruby (Ectoplasm placeholder)
        { itemId: 173, chance: 0.15 }  // Mana Potion
    ],
    'slime': [
        { itemId: 40, chance: 0.30, min: 1, max: 3 }, // Gold
        { itemId: 173, chance: 0.10 } // Mana Potion
    ],
    'crypt_keeper': [
        { itemId: 153, chance: 0.50 }, // Bone Sword
        { itemId: 163, chance: 0.30 }, // Skull Helm
        { itemId: 173, chance: 0.40 }  // Mana Potion
    ],
    'necromancer': [
        { itemId: 163, chance: 0.20 }, // Skull Helm
        { itemId: 155, chance: 0.05 }, // Demon Blade (Legendary!)
        { itemId: 173, chance: 0.60, min: 1, max: 2 }, // Mana Potions
        { itemId: 203, chance: 0.10 }  // Ruby
    ],

    // --- BOSSES ---
    'boss': [
        { itemId: 166, chance: 0.50 }, // Dragon Shield
        { itemId: 165, chance: 0.20 }, // Crown of Kings
        { itemId: 143, chance: 0.40 }, // Morning Star
        { itemId: 40, chance: 1.0, min: 100, max: 500 } // Gold
    ]
};
