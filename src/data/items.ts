export interface ItemDef {
    name: string;
    type: 'weapon' | 'armor' | 'container' | 'food' | 'other';
    attack?: number;
    defense?: number;
    slot?: string;
    heal?: number;
    stackable?: boolean;
}

export const ItemRegistry: Record<number, ItemDef> = {
    1: { name: "Short Sword", type: "weapon", attack: 10, slot: "rhand" },
    2: { name: "Plate Armor", type: "armor", defense: 8, slot: "body" },
    3: { name: "Gold Coin", type: "other", stackable: true },
    5: { name: "Wooden Shield", type: "armor", defense: 5, slot: "lhand" },
    16: { name: "Apple", type: "food", heal: 5 }
};
