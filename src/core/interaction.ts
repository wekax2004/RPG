import { WorldMap } from './map';
import { Player } from './player';
import { Item } from './types';

// Type for script functions
// Type for script functions
// Updated to include Inventory and Passives for RPG logic
type ItemScript = (map: WorldMap, player: Player, x: number, y: number, inventory?: any, passives?: any) => void;

export const ScriptRegistry: Record<number, ItemScript> = {
    // ID 200: Blueberry Bush
    200: (map: WorldMap, player: Player, x: number, y: number, inventory?: any) => {
        const tile = map.getTile(x, y);
        if (tile) {
            const item = tile.removeItem();
            if (item && item.id === 200) {
                tile.addItem(new Item(201)); // Empty Bush
                console.log("You harvest a blueberry.");
                // Add to inventory if passed
                if (inventory) {
                    // Assuming inventory.storage is generic array or we use addItem logic
                    // For now just log, preventing bugs if method differs
                }
            }
        }
    },
    // ID 202: Temple Altar
    202: (map: WorldMap, player: Player, x: number, y: number, inventory?: any, passives?: any) => {
        if (!inventory) {
            console.log("You need an inventory to use this.");
            return;
        }

        if (inventory.gold >= 10) {
            inventory.gold -= 10;
            if (passives) {
                passives.agility += 1;
                console.log(`You feel a holy presence. Speed increased! (Agility: ${passives.agility})`);
                // Optional: Spawn floating text if possible, but we don't have World access here easily
            }
        } else {
            console.log("You need 10 ₪ to pray here.");
        }
    }
};

export function useItem(x: number, y: number, player: Player, map: WorldMap, inventory?: any, passives?: any) {
    const tile = map.getTile(x, y);
    if (!tile) return;

    const topItem = tile.peek();
    if (!topItem) return;

    const script = ScriptRegistry[topItem.id];
    if (script) {
        script(map, player, x, y, inventory, passives);
    } else {
        console.log("You cannot use this object.");
    }
}
