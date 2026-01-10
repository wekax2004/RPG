import { TileMap, Tile } from './components';
import { RNG } from './rng';

export function generateOverworld(width: number, height: number, seed: number): { width: number, height: number, tileSize: number, tiles: Tile[], entities: any[] } {
    const rng = new RNG(seed);
    const tiles = Array(width * height).fill(null).map(() => new Tile());
    const entities: any[] = [];

    // IDs
    const GRASS = 16;
    const WALL = 17;

    // --- NEW: TOWN SETTINGS ---
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const townRadius = 12; // Size of the town (24x24 tiles)

    // 1. Generate Base Terrain (Noise/Randomness)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;

            // Edges of the world are always walls
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                tiles[index].add(WALL);
                continue;
            }

            // Always add Ground first - RANDOM VARIATION (Natural World)
            // 90% Clean Grass (16), 5% Flowers (161), 5% Pebbles (162)
            const rand = rng.next();
            if (rand > 0.95) tiles[index].add(161); // Flowers (5%)
            else if (rand > 0.90) tiles[index].add(162); // Pebbles (5%)
            else tiles[index].add(16); // Plain Grass (90%)

            // Natural World: Obstacles (Trees/Rocks)
            // Dist > 5 allows some space for town, but let's make it closer for testing
            // Town Radius logic:
            const dist = Math.abs(x - centerX) + Math.abs(y - centerY);

            if (dist > 3) {
                if (rng.next() > 0.96) { // 4% chance (Sparse Forest - Better for navigation)
                    // Add Oak Tree (5) or Large Rock (6)
                    const obs = rng.next() > 0.6 ? 5 : 6;
                    tiles[index].add(obs);
                }
            }
        }
    }

    // 2. Build the Town Walls
    // We loop through a square around the center
    for (let y = centerY - townRadius; y <= centerY + townRadius; y++) {
        for (let x = centerX - townRadius; x <= centerX + townRadius; x++) {
            const index = y * width + x;

            // Identify the border of the town
            const isBorder =
                x === centerX - townRadius || x === centerX + townRadius ||
                y === centerY - townRadius || y === centerY + townRadius;

            if (isBorder) {
                if (!tiles[index].has(WALL)) tiles[index].add(WALL);
            } else {
                while (tiles[index].has(WALL)) tiles[index].pop();
                if (tiles[index].items.length === 0) tiles[index].add(GRASS);
            }
        }
    }

    // --- TEMPLE GENERATION (5x5 around Center) ---
    const templeRadius = 2; // 5x5 = Center +/- 2
    const FLOOR_MARBLE = 201;

    for (let y = centerY - templeRadius; y <= centerY + templeRadius; y++) {
        for (let x = centerX - templeRadius; x <= centerX + templeRadius; x++) {
            const index = y * width + x;

            // 1. Clear existing
            tiles[index].items = [];

            // 2. Add Marble Floor
            tiles[index].add(FLOOR_MARBLE);

            // 3. Add Walls on perimeter
            if (x === centerX - templeRadius || x === centerX + templeRadius ||
                y === centerY - templeRadius || y === centerY + templeRadius) {

                // Door Logic: Bottom Center
                if (x === centerX && y === centerY + templeRadius) {
                    // Doorway - No Wall
                } else {
                    tiles[index].add(WALL); // ID 17
                }
            }
        }
    }

    // 4. Place Altar (Center of Temple)
    const altarIdx = centerY * width + centerX;
    tiles[altarIdx].add(21); // Add Altar (ID 21)

    // 5. Place Treasure Chest (ID 50) to the right of Altar
    const chestIdx = centerY * width + (centerX + 1);
    tiles[chestIdx].add(50);

    // 3. Create Gates (Openings in the wall)
    const openGate = (x: number, y: number) => {
        const idx = y * width + x;
        // Remove wall if present
        while (tiles[idx].has(WALL)) tiles[idx].pop();
    };

    // North Gate
    openGate(centerX, centerY - townRadius);
    openGate(centerX - 1, centerY - townRadius);
    // South Gate
    openGate(centerX, centerY + townRadius);
    openGate(centerX - 1, centerY + townRadius);
    // East Gate
    openGate(centerX + townRadius, centerY);
    // West Gate
    openGate(centerX - townRadius, centerY);

    // 4. Spawn Enemies (ONLY OUTSIDE TOWN)
    const enemyCount = 50;
    for (let i = 0; i < enemyCount; i++) {
        let ex = 0, ey = 0, attempts = 0;
        let valid = false;

        while (!valid && attempts < 50) {
            ex = rng.nextInt(width);
            ey = rng.nextInt(height);
            attempts++;
            const idx = ey * width + ex;

            // CHECK: Is this tile solid? (Has Wall)
            if (tiles[idx].has(WALL)) continue;

            // CHECK: Is this inside the safe zone?
            const distFromCenter = Math.abs(ex - centerX) + Math.abs(ey - centerY);

            // Only spawn if far away from town center
            if (distFromCenter > townRadius + 2) {
                valid = true;
            }
        }

        if (valid) {
            // Spawn an Orc (using your 'orc' sprite ID logic)
            entities.push({
                type: 'enemy',
                x: ex * 32,
                y: ey * 32,
                enemyType: 9 // Orc ID
            });
        }
    }

    console.log("[MapGen] Town and Walls Generated (Stack Mode).");
    return { width, height, tileSize: 32, tiles, entities };
}

export function generateDungeon(width: number, height: number, seed: number, type: string = 'dungeon'): { width: number, height: number, tileSize: number, tiles: Tile[], entities: any[] } {
    const tiles = Array(width * height).fill(null).map(() => new Tile());
    const entities: any[] = [];

    // Simple box
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            tiles[idx].add(201); // Floor

            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                tiles[idx].add(200); // Wall on top
            }
        }
    }

    entities.push({ type: 'dungeon_exit', x: 32 * 2, y: 32 * 2 });

    console.log('[MapGen] Dungeon Generated (Stub/Stack).');
    return { width, height, tileSize: 32, tiles, entities };
}
