import { WorldMap3D, GROUND_FLOOR } from '../core/world_map_3d';
import { Tile, MapItem as Item } from '../core/types';
import { SPRITES, EDRON_ASSETS } from '../constants';

export function generateOrcFortress(map: WorldMap3D, edronRect: { x: number, y: number, w: number, h: number }) {
    // Location: West of Edron
    // Start X: 5
    // End X: edronRect.x - 5
    // Y: Centered vertically roughly

    const startX = 5;
    const endX = edronRect.x - 10;
    const width = endX - startX;

    if (width < 20) return; // Not enough space

    const startY = edronRect.y - 10;
    const height = edronRect.h + 20;

    const zBase = GROUND_FLOOR; // 7

    // 1. Terrain: Marsh/Mud around the fortress
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            const tile = map.getTile(x, y, zBase);
            if (!tile) continue;

            // Muddy ground
            if (Math.random() < 0.4) tile.baseId = 6013; // Dirt (Mud placeholder)
            else tile.baseId = SPRITES.GRASS;

            // Trees (Dead/Swampy)
            if (Math.random() < 0.05) tile.addItem(new Item(1, {}, SPRITES.DROWNED_TREE)); // 54

            // Mobs: Orcs & Riders outside
            if (Math.random() < 0.02) {
                if (Math.random() < 0.3) tile.mob = "Orc Rider";
                else tile.mob = "Orc";
            }
        }
    }

    // 2. The Fortress Walls (Wooden Palisades)
    const fortX = startX + 10;
    const fortY = startY + 10;
    const fortW = width - 20;
    const fortH = height - 20;

    // Draw Palisades
    // We need a specific sprite for wooden walls.
    // Using default vertical/horizontal walls or a custom "Palisade" ID if available.
    // Constants.ts has CUSTOM_WOOD_FENCE = 302? Or use specific IDs.
    const PALISADE = 302; // Using custom fence as palisade

    for (let x = fortX; x < fortX + fortW; x++) {
        map.getTile(x, fortY, zBase)?.addItem(new Item(1, {}, PALISADE));
        map.getTile(x, fortY + fortH - 1, zBase)?.addItem(new Item(1, {}, PALISADE));
    }
    for (let y = fortY; y < fortY + fortH; y++) {
        map.getTile(fortX, y, zBase)?.addItem(new Item(1, {}, PALISADE));
        map.getTile(fortX + fortW - 1, y, zBase)?.addItem(new Item(1, {}, PALISADE));
    }

    // Gate (East side facing Edron)
    const gateY = fortY + Math.floor(fortH / 2);
    // Clear gate
    map.getTile(fortX + fortW - 1, gateY, zBase)!.items = [];
    map.getTile(fortX + fortW - 1, gateY - 1, zBase)!.items = [];
    map.getTile(fortX + fortW - 1, gateY + 1, zBase)!.items = [];

    // 3. Inside the Fortress
    for (let y = fortY + 1; y < fortY + fortH - 1; y++) {
        for (let x = fortX + 1; x < fortX + fortW - 1; x++) {
            const tile = map.getTile(x, y, zBase);
            if (!tile) continue;
            tile.baseId = 6013; // Dirt floor inside

            // Mobs: Warriors & Warlords
            if (Math.random() < 0.04) {
                const r = Math.random();
                if (r < 0.1) tile.mob = "Orc Warlord"; // Boss
                else if (r < 0.5) tile.mob = "Orc Warrior";
                else tile.mob = "Orc";
            }
        }
    }

    // 4. Watchtowers (Corners)
    // Small elevated platforms?
    // Z=6
    // Top Left
    const zTw = zBase - 1;
    for (let x = fortX; x < fortX + 3; x++) {
        for (let y = fortY; y < fortY + 3; y++) {
            map.getTile(x, y, zTw)!.baseId = EDRON_ASSETS.FLOORS.WOOD_FLOOR;
            map.getTile(x, y, zTw)!.mob = "Orc Spearman"; // or just Orc
        }
    }
}
