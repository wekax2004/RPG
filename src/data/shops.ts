import { ITEM_IDS } from "../constants";

export interface ShopOffer {
    itemId: number;
    name: string;
    buyPrice?: number; // Cost to buy FROM NPC (undefined = NPC doesn't sell this)
    sellPrice?: number; // Cost to sell TO NPC (undefined = NPC doesn't buy this)
}

export const NPC_SHOPS: Record<string, ShopOffer[]> = {
    "Donald": [ // Food Merchant
        { itemId: ITEM_IDS.APPLE, name: "Apple", buyPrice: 5, sellPrice: 2 },
        { itemId: ITEM_IDS.MEAT, name: "Meat", buyPrice: 10, sellPrice: 4 }
    ],
    "Sam": [ // Armory
        { itemId: ITEM_IDS.DAGGER, name: "Dagger", buyPrice: 20, sellPrice: 5 },
        { itemId: ITEM_IDS.LONG_SWORD, name: "Long Sword", buyPrice: 150, sellPrice: 40 },
        { itemId: ITEM_IDS.LEATHER_LEGS, name: "Leather Legs", buyPrice: 50, sellPrice: 10 }
    ]
};
