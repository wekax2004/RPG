import { WorldMap3D, GROUND_FLOOR } from '../core/world_map_3d';
import { Tile, MapItem as Item } from '../core/types';
import { SPRITES } from '../constants';

export function generateDesert(map: WorldMap3D, edronRect: { x: number, y: number, w: number, h: number }) {
    // Location: South of Edron
    const startX = 0;
    const startY = edronRect.y + edronRect.h + 10;
    const width = map.width;
    const height = map.height - startY;

    if (height < 20) return;

    const zBase = GROUND_FLOOR; // 7

    // Perlin noise for Dunes
    const noise = (x: number, y: number) => Math.sin(x * 0.1) + Math.cos(y * 0.1);

    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            const tile = map.getTile(x, y, zBase);
            if (!tile) continue;

            const n = noise(x, y);

            // Terrain: Sand
            tile.baseId = SPRITES.SAND; // 311 

            // Dunes (Height variation? Or just sand texture)
            // If n > 0.5, maybe "High Sand"? No sprite for that.

            // Oasis (Rare)
            const oasisNoise = Math.sin(x * 0.05) + Math.cos(y * 0.05);
            if (oasisNoise > 1.8) {
                // Water and Grass
                tile.baseId = SPRITES.WATER;
                if (Math.random() < 0.2) return; // Water
            } else if (oasisNoise > 1.5) {
                // Grass separation
                tile.baseId = SPRITES.GRASS;
                if (Math.random() < 0.3) tile.addItem(new Item(1, {}, SPRITES.PALM_TREE));
            } else {
                // Standard Desert
                // Cactus? Constants has CACTUS=53 (placeholder). 
                // Let's use Palm Tree sparsely.
                if (Math.random() < 0.005) {
                    tile.addItem(new Item(1, {}, SPRITES.PALM_TREE));
                }
            }

            // Mobs
            if (tile.baseId === SPRITES.SAND && Math.random() < 0.02) {
                if (Math.random() < 0.3) tile.mob = "Scarab";
                else tile.mob = "Larva";
            }
        }
    }
}
