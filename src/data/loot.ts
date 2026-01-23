import { ITEM_IDS } from "../constants";

export interface LootEntry {
    itemId: number;
    chance: number; // 0.0 to 1.0
    maxCount?: number; // For stackable items
}

export const MONSTER_LOOT: Record<string, LootEntry[]> = {
    "Goblin": [
        { itemId: ITEM_IDS.GOLD_COIN, chance: 1.0, maxCount: 15 }, // Always drops gold
        { itemId: ITEM_IDS.DAGGER, chance: 0.2 },                  // 20%
        { itemId: ITEM_IDS.APPLE, chance: 0.15 }
    ],
    "Rat": [
        { itemId: ITEM_IDS.GOLD_COIN, chance: 0.8, maxCount: 4 }
    ],
    "Dragon": [
        { itemId: ITEM_IDS.GOLD_COIN, chance: 1.0, maxCount: 100 },
        { itemId: ITEM_IDS.DRAGON_HAMMER, chance: 0.02 },          // Rare!
        { itemId: ITEM_IDS.LONG_SWORD, chance: 0.1 }
    ],
    "Sewer Slime": [
        { itemId: ITEM_IDS.GOLD_COIN, chance: 0.5, maxCount: 20 }
    ],
    "Orc": [
        { itemId: ITEM_IDS.GOLD_COIN, chance: 0.8, maxCount: 15 },
        { itemId: 300, chance: 0.05 }, // Dirty Note (5% chance)
        { itemId: 302, chance: 0.1 }   // Roast Chicken (10%)
    ],
    "Grom": [
        { itemId: 303, chance: 1.0 }   // Peace Treaty (if killed? but he's friendly)
    ]
};
