import { SPRITES } from '../constants';

export interface LootEntry {
    itemId: number;
    chance: number; // 0.0 to 1.0
    min?: number;
    max?: number;
}

export const LOOT_TABLES: Record<string, LootEntry[]> = {
    // --- ANIMALS ---
    'rat': [
        { itemId: 40, chance: 0.40, min: 1, max: 3 }, // Gold
        { itemId: 170, chance: 0.10, min: 1, max: 1 } // Meat
    ],
    'wolf': [
        { itemId: 170, chance: 0.30, min: 1, max: 1 }, // Meat
        { itemId: SPRITES.WOLF_PELT || 160, chance: 0.15 } // Pelt
    ],
    'bear': [
        { itemId: SPRITES.BEAR_FUR || 161, chance: 0.20 }, // Bear Fur
        { itemId: 170, chance: 0.60, min: 1, max: 3 } // Meat
    ],
    'spider': [
        { itemId: 172, chance: 0.40 }, // Silk
        { itemId: SPRITES.VENOM_DAGGER || 157, chance: 0.05 }  // Venom Dagger
    ],

    // --- HUMANOIDS ---
    'bandit': [
        { itemId: 40, chance: 0.50, min: 2, max: 10 }, // Gold
        { itemId: SPRITES.LEATHER_LEGS, chance: 0.15 }, // Leather Legs
        { itemId: SPRITES.SABRE, chance: 0.10 }, // Sabre
        { itemId: 41, chance: 0.25 }   // Health Potion
    ],
    'orc': [
        { itemId: 40, chance: 0.40, min: 3, max: 15 },
        { itemId: SPRITES.HAND_AXE, chance: 0.15 }, // Hand Axe
        { itemId: SPRITES.STUDDED_CLUB, chance: 0.10 }, // Club
        { itemId: SPRITES.CHAIN_ARMOR, chance: 0.02 }, // Rare Chain
        { itemId: 41, chance: 0.15 }   // Potion
    ],

    // --- UNDEAD ---
    'skeleton': [
        { itemId: SPRITES.MACE, chance: 0.15 }, // Mace
        { itemId: SPRITES.LEATHER_HELMET, chance: 0.08 }, // Leather Helm
        { itemId: 40, chance: 0.20, min: 1, max: 5 } // Gold
    ],
    'zombie': [
        { itemId: 171, chance: 0.40 }, // Rotten Flesh
        { itemId: SPRITES.HATCHET, chance: 0.10 }, // Hatchet
        { itemId: SPRITES.MACE, chance: 0.08 }  // Mace
    ],
    'big_zombie': [
        { itemId: SPRITES.IRON_KEY, chance: 1.0, min: 1, max: 1 }, // Guaranteed
        { itemId: SPRITES.GOLD, chance: 1.0, min: 50, max: 150 },
        { itemId: SPRITES.LEATHER_ARMOR, chance: 0.3 },
        { itemId: 41, chance: 0.5, min: 1, max: 3 } // Potions
    ],
    'ghost': [
        { itemId: 203, chance: 0.05 }, // Ruby
        { itemId: 173, chance: 0.15 }  // Mana Potion
    ],
    'slime': [
        { itemId: 40, chance: 0.30, min: 1, max: 3 }, // Gold
        { itemId: 173, chance: 0.10 } // Mana Potion
    ],
    'necromancer': [
        { itemId: SPRITES.SKULL_STAFF, chance: 0.15 }, // Skull Staff
        { itemId: SPRITES.MAGIC_SWORD, chance: 0.01 }, // RARE Magic Sword
        { itemId: 173, chance: 0.60, min: 1, max: 2 }, // Mana Potions
        { itemId: 203, chance: 0.10 }  // Ruby
    ],

    // --- BIOME MOBS ---
    'yeti': [
        { itemId: 170, chance: 0.80, min: 2, max: 4 }, // Meat
        { itemId: SPRITES.ICE_RAPIER, chance: 0.05 }, // Ice Rapier
        { itemId: 40, chance: 0.50, min: 10, max: 50 }, // Gold
        { itemId: SPRITES.CHAIN_ARMOR, chance: 0.10 }
    ],
    'polar_bear': [
        { itemId: 170, chance: 0.70, min: 2, max: 3 },
        { itemId: SPRITES.BEAR_FUR || 161, chance: 0.40 } // Fur
    ],
    'scorpion': [
        { itemId: 40, chance: 0.30, min: 1, max: 5 },
        { itemId: 203, chance: 0.02 } // Ruby
    ],

    // ============ BOSS LOOT ============
    'boss_ice': [
        { itemId: 40, chance: 1.0, min: 100, max: 300 }, // Guaranteed Gold
        { itemId: SPRITES.ICE_RAPIER, chance: 0.25 }, // Ice Rapier
        { itemId: SPRITES.KNIGHT_ARMOR, chance: 0.10 },
        { itemId: SPRITES.CHAIN_ARMOR, chance: 0.30 },
        { itemId: 173, chance: 1.0, min: 3, max: 5 }, // Mana Potions
        // Elemental Drops
        { itemId: SPRITES.FROST_BLADE, chance: 0.15 },
        { itemId: SPRITES.GLACIAL_AXE, chance: 0.12 },
        { itemId: SPRITES.FROST_ARMOR, chance: 0.08 },
        { itemId: SPRITES.FROST_HELMET, chance: 0.10 }
    ],
    'boss_desert': [
        { itemId: 40, chance: 1.0, min: 80, max: 250 },
        { itemId: SPRITES.STONE_CUTTER_AXE, chance: 0.15 }, // Rare Axe
        { itemId: SPRITES.CHAIN_LEGS, chance: 0.20 },
        { itemId: SPRITES.VENOM_DAGGER || 157, chance: 0.30 },
        { itemId: 41, chance: 1.0, min: 3, max: 5 }, // Health Potions
        // Elemental Drops (Fire - Desert Heat)
        { itemId: SPRITES.FIRE_SWORD, chance: 0.12 },
        { itemId: SPRITES.FIRE_AXE, chance: 0.10 },
        { itemId: SPRITES.FLAME_ARMOR, chance: 0.08 },
        { itemId: SPRITES.INFERNO_BLADE, chance: 0.03 } // Legendary
    ],
    'boss_swamp': [
        { itemId: 40, chance: 1.0, min: 150, max: 400 },
        { itemId: SPRITES.MAGIC_SWORD, chance: 0.08 }, // Rare Sword
        { itemId: SPRITES.KNIGHT_LEGS, chance: 0.15 },
        { itemId: SPRITES.SKULL_STAFF, chance: 0.20 },
        { itemId: 173, chance: 1.0, min: 4, max: 6 },
        // Elemental Drops (Poison)
        { itemId: SPRITES.VENOM_BLADE, chance: 0.15 },
        { itemId: SPRITES.POISON_AXE, chance: 0.10 },
        { itemId: SPRITES.TOXIC_MACE, chance: 0.12 },
        { itemId: SPRITES.VENOM_ARMOR, chance: 0.08 }
    ],
    'boss_orc': [
        { itemId: 40, chance: 1.0, min: 120, max: 350 },
        { itemId: SPRITES.GREAT_AXE, chance: 0.20 }, // Great Axe
        { itemId: SPRITES.KNIGHT_HELMET, chance: 0.15 },
        { itemId: SPRITES.KNIGHT_ARMOR, chance: 0.10 },
        { itemId: SPRITES.BATTLE_AXE, chance: 0.25 },
        { itemId: 41, chance: 1.0, min: 2, max: 4 },
        // Elemental Drops (Lightning - War Thunder)
        { itemId: SPRITES.STORM_BLADE, chance: 0.12 },
        { itemId: SPRITES.THUNDER_AXE, chance: 0.08 },
        { itemId: SPRITES.STORM_ARMOR, chance: 0.06 },
        { itemId: SPRITES.LIGHTNING_ROD, chance: 0.02 } // Legendary
    ],

    // --- MONSTERS ---
    'goblin': [
        { itemId: 40, chance: 0.30, min: 1, max: 5 }, // Gold
        { itemId: SPRITES.DAGGER, chance: 0.15 }, // Dagger from Goblin
        { itemId: SPRITES.LEATHER_HELMET, chance: 0.10 }, // Basic Armor
        { itemId: 202, chance: 0.20 } // Small Stones (Rock)
    ],
    'dragon': [
        { itemId: 40, chance: 1.0, min: 100, max: 200 }, // Guaranteed Gold
        { itemId: SPRITES.FIRE_SWORD, chance: 0.10 }, // Fire Sword from Dragon
        { itemId: SPRITES.DRAGON_SHIELD, chance: 0.08 }, // Dragon Shield
        { itemId: SPRITES.DRAGON_HAMMER || 142, chance: 0.05 }, // Warhammer/Dragon Hammer
        { itemId: 170, chance: 0.80, min: 2, max: 4 }, // Meat (Dragon Ham)
        { itemId: 203, chance: 0.05 } // Green Mushroom / Ruby
    ],

    // --- NEW AREAS ---
    'cyclops': [
        { itemId: 40, chance: 0.50, min: 20, max: 60 }, // Gold
        { itemId: SPRITES.BATTLE_AXE, chance: 0.10 },
        { itemId: SPRITES.CHAIN_ARMOR, chance: 0.05 },
        { itemId: 170, chance: 0.40, min: 1, max: 3 } // Meat
    ],
    'cyclops drone': [
        { itemId: 40, chance: 0.40, min: 10, max: 40 },
        { itemId: SPRITES.IRON_MACE || 141, chance: 0.15 }, // Mace
        { itemId: 170, chance: 0.30 }
    ],
    'cyclops smith': [
        { itemId: 40, chance: 0.60, min: 40, max: 90 },
        { itemId: SPRITES.DOUBLE_AXE || 132, chance: 0.15 }, // Double Axe
        { itemId: SPRITES.PLATE_ARMOR || 2, chance: 0.20 },
        { itemId: 213, chance: 0.10 } // Pickaxe
    ],
    'orc rider': [
        { itemId: 40, chance: 0.50, min: 15, max: 50 },
        { itemId: SPRITES.ORC_SHIELD || 167, chance: 0.20 },
        { itemId: 170, chance: 0.40 }
    ],
    'larva': [
        { itemId: 40, chance: 0.30, min: 2, max: 8 },
        { itemId: 170, chance: 0.50, min: 1, max: 2 }, // Meat
        { itemId: 10, chance: 0.05 } // Grass (lol)
    ],
    'scarab': [
        { itemId: 40, chance: 0.45, min: 10, max: 30 },
        { itemId: 203, chance: 0.05 }, // Ruby
        { itemId: 204, chance: 0.05 }, // Sapphire
        { itemId: SPRITES.IRON_HELMET || 150, chance: 0.10 }
    ]
};
