import { WorldMap3D, GROUND_FLOOR } from '../core/world_map_3d';
import { Tile, MapItem as Item } from '../core/types';
import { SPRITES, EDRON_ASSETS } from '../constants';
import { TERRAIN } from '../core/noise';

/**
 * Generates the Cyclops Mountain area to the North-East of Edron.
 * 
 * Bounds:
 * X: Edron East Wall -> Map Edge
 * Y: Map Top -> Edron North Wall
 */
export function generateCyclopsMountain(map: WorldMap3D, startX: number, startY: number, width: number, height: number, edronRect: { x: number, y: number, w: number, h: number }) {

    // Bounds check
    const mStartX = edronRect.x + edronRect.w + 5; // Start 5 tiles east of city
    const mStartY = 5; // Start near top of map
    const mWidth = map.width - mStartX - 5;
    const mHeight = (edronRect.y + edronRect.h) - mStartY; // Extend down to city bottom

    // Define Z levels
    const zBase = GROUND_FLOOR; // 7
    const zMid = GROUND_FLOOR - 1; // 6 (City Level)
    const zHigh = GROUND_FLOOR - 2; // 5 (High Peaks)
    const zPeak = GROUND_FLOOR - 3; // 4 (Summit)

    // Perlin noise for terrain shape
    const noise = (x: number, y: number) => {
        return Math.sin(x * 0.05) + Math.cos(y * 0.05);
    };

    // 1. BASE TERRAIN (Z=7) - foothills
    for (let y = mStartY; y < mStartY + mHeight; y++) {
        for (let x = mStartX; x < mStartX + mWidth; x++) {
            const tile = map.getTile(x, y, zBase);
            if (!tile) continue;

            const n = noise(x, y);

            // Default: Grass/Dirt mix
            tile.baseId = Math.random() > 0.3 ? SPRITES.GRASS : 6013; // Dirt

            // Scattered Rocks
            if (Math.random() < 0.1) tile.addItem(new Item(1, {}, SPRITES.ROCK));
            if (Math.random() < 0.05) tile.addItem(new Item(1, {}, SPRITES.TREE_PINE));

            // Mobs: Cyclops Drone (Patrols base)
            if (Math.random() < 0.02) {
                tile.mob = "Cyclops Drone";
            }
        }
    }

    // 2. MID LEVEL (Z=6) - The Plateau
    // Shape: Circular-ish based on noise, smaller than base
    for (let y = mStartY + 5; y < mStartY + mHeight - 5; y++) {
        for (let x = mStartX + 5; x < mStartX + mWidth - 5; x++) {
            const n = noise(x, y);
            if (n > 0.2) {
                // This is Level 6 terrain
                const tile = map.getTile(x, y, zMid);
                if (tile) {
                    tile.baseId = SPRITES.MOUNTAIN_TOP; // Grey stone
                    // Add borders on Z=7 below this to create cliffs?
                    // (Assuming 3D map handles borders purely visual or we invoke border gen)
                }

                // Mobs: Cyclops
                if (Math.random() < 0.03) {
                    const t = map.getTile(x, y, zMid);
                    if (t) t.mob = "Cyclops";
                }
            }
        }
    }

    // 3. HIGH PEAKS (Z=5)
    for (let y = mStartY + 10; y < mStartY + mHeight - 10; y++) {
        for (let x = mStartX + 10; x < mStartX + mWidth - 10; x++) {
            const n = noise(x + 100, y + 100); // Shift noise
            if (n > 0.5) {
                const tile = map.getTile(x, y, zHigh);
                if (tile) {
                    tile.baseId = SPRITES.MOUNTAIN_TOP;
                }
                // Mobs: Cyclops Smith
                if (Math.random() < 0.04) {
                    const t = map.getTile(x, y, zHigh);
                    if (t) t.mob = "Cyclops Smith";
                }
            }
        }
    }

    // 4. TRANSITIONS (Ramps)
    // Connect Z=7 to Z=6
    // Find a spot where Z=7 meets Z=6 edge
    // Hardcoded ramp for stability
    const rampX = mStartX + 10;
    const rampY = mStartY + 15;

    // Create Ramp 7->6
    map.getTile(rampX, rampY, zBase)?.addItem(new Item(1, {}, SPRITES.RAMP_N));
    map.getTile(rampX, rampY - 1, zMid)?.addItem(new Item(1, {}, SPRITES.MOUNTAIN_TOP)); // Ensure landing exists

    // Ramp 6->5
    const ramp2X = mStartX + 20;
    const ramp2Y = mStartY + 25;
    map.getTile(ramp2X, ramp2Y, zMid)?.addItem(new Item(1, {}, SPRITES.RAMP_N));
    map.getTile(ramp2X, ramp2Y - 1, zHigh)?.addItem(new Item(1, {}, SPRITES.MOUNTAIN_TOP));

}
