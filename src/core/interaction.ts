import { WorldMap } from './map';
import { Player } from './player';
import { Item } from './types';

// Type for script functions
type ItemScript = (map: WorldMap, player: Player, x: number, y: number) => void;

export const ScriptRegistry: Record<number, ItemScript> = {
    // ID 200: Blueberry Bush
    200: (map: WorldMap, player: Player, x: number, y: number) => {
        const tile = map.getTile(x, y);
        if (tile) {
            // Logic: Transform Bush (200) -> Empty Bush (201)
            const item = tile.removeItem(); // Remove top (200)
            if (item && item.id === 200) {
                tile.addItem(new Item(201)); // Add Empty Bush
                console.log("You harvest a blueberry.");
                // TODO: Add blueberry (ID 900) to player inventory
            }
        }
    }
};

export function useItem(x: number, y: number, player: Player, map: WorldMap) {
    const tile = map.getTile(x, y);
    if (!tile) return;

    const topItem = tile.peek();
    if (!topItem) return;

    const script = ScriptRegistry[topItem.id];
    if (script) {
        script(map, player, x, y);
    } else {
        console.log("You cannot use this object.");
    }
}
