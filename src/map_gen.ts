import { SPRITES } from './constants';
import { RNG } from './rng';
import { Tile, Item } from './core/types';

export function generateOverworld(width: number, height: number, seed: number): { width: number, height: number, tileSize: number, tiles: Tile[], entities: any[] } {
    const rng = new RNG(seed);
    const tiles = Array(width * height).fill(null).map(() => new Tile());
    const entities: any[] = [];

    // IDs
    const GRASS = SPRITES.GRASS_FLOWERS; // 16
    const WALL = SPRITES.STONE_WALL; // 17

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
            // 90% Clean Grass (10), 5% Flowers (16), 5% Dirt (11)
            const rand = rng.next();
            if (rand > 0.95) tiles[index].add(SPRITES.GRASS_FLOWERS);
            else if (rand > 0.90) tiles[index].add(SPRITES.DIRT);
            else tiles[index].add(SPRITES.GRASS);

            // Natural World: Obstacles (Trees/Rocks)
            // Dist > 5 allows some space for town, but let's make it closer for testing
            // Town Radius logic:
            const dist = Math.abs(x - centerX) + Math.abs(y - centerY);

            if (dist > 3) {
                if (rng.next() > 0.96) { // 4% chance (Sparse Forest - Better for navigation)
                    // Add Oak Tree (5) or Large Rock (6)
                    const obs = rng.next() > 0.6 ? SPRITES.OAK_TREE : SPRITES.ROCK;
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
                // Clear natural obstacles inside town
                tiles[index].items = [];
                // Add Town Floor (Cobble)
                tiles[index].add(SPRITES.COBBLE);
            }
        }
    }

    // --- TEMPLE GENERATION (5x5 around Center) ---
    const templeRadius = 2; // 5x5 = Center +/- 2
    const FLOOR_TEMPLE = SPRITES.FLOOR_STONE; // 15

    for (let y = centerY - templeRadius; y <= centerY + templeRadius; y++) {
        for (let x = centerX - templeRadius; x <= centerX + templeRadius; x++) {
            const index = y * width + x;

            // 1. Clear existing
            tiles[index].items = [];

            // 2. Add Marble Floor
            tiles[index].add(FLOOR_TEMPLE);

            // 3. Add Walls on perimeter
            if (x === centerX - templeRadius || x === centerX + templeRadius ||
                y === centerY - templeRadius || y === centerY + templeRadius) {

                // Door Logic: Bottom Center
                if (x === centerX && y === centerY + templeRadius) {
                    // Doorway - No Wall
                } else {
                    tiles[index].add(SPRITES.WALL); // ID 21 (Brick)
                }
            }
        }
    }

    // 4. Place Altar (Center of Temple)
    const altarIdx = centerY * width + centerX;
    tiles[altarIdx].add(SPRITES.TORCH); // Altar -> Torch (32)

    // 5. Place Treasure Chest (ID 50 -> Crate 31) to the right of Altar
    const chestIdx = centerY * width + (centerX + 1);
    tiles[chestIdx].add(SPRITES.CRATE);

    // 3. Create Gates (Openings in the wall)
    const openGate = (x: number, y: number) => {
        const idx = y * width + x;
        // Remove wall if present
        while (tiles[idx].has(WALL)) tiles[idx].pop();
        // Ensure floor
        if (tiles[idx].items.length === 0) tiles[idx].add(SPRITES.COBBLE);
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
    const enemyCount = 60; // Increased count
    for (let i = 0; i < enemyCount; i++) {
        let ex = 0, ey = 0, attempts = 0;
        let valid = false;

        while (!valid && attempts < 50) {
            ex = rng.nextInt(width);
            ey = rng.nextInt(height);
            attempts++;
            const idx = ey * width + ex;

            // CHECK: Is this tile solid? (Has Wall)
            if (tiles[idx].has(WALL) || tiles[idx].has(SPRITES.WALL)) continue;

            // CHECK: Is this inside the safe zone?
            const distFromCenter = Math.abs(ex - centerX) + Math.abs(ey - centerY);

            // Only spawn if far away from town center (Safe Zone)
            if (distFromCenter > townRadius + 8) { // Increased distance
                valid = true;
            }
        }

        if (valid) {
            // Pick Random Monster
            const roll = rng.next();
            let monsterKey = "rat"; // Default
            if (roll > 0.90) monsterKey = "slime"; // rare
            else if (roll > 0.80) monsterKey = "orc";
            else if (roll > 0.70) monsterKey = "skeleton"; // undead area?
            else if (roll > 0.40) monsterKey = "wolf"; // common

            entities.push({
                type: 'enemy',
                x: ex * 32,
                y: ey * 32,
                enemyType: monsterKey // Passed as string to Game
            });
        }
    }

    // TEST OBJECT: Barrel (30) at 26,26
    const testIdx = 26 * width + 26;
    if (tiles[testIdx]) {
        while (tiles[testIdx].has(WALL)) tiles[testIdx].pop();
        tiles[testIdx].add(SPRITES.TREE_OAK); // FORCE TREE VISIBILITY
        console.log(`[MapGen] FORCED TREE(51) at 26,26. Tile Items NOW:`, tiles[testIdx].items.map(i => i.id));
    }

    // PROCEDURAL TEST: Crate (31) at 27,27
    const boxIdx = 27 * width + 27;
    if (tiles[boxIdx]) {
        while (tiles[boxIdx].has(WALL)) tiles[boxIdx].pop();
        tiles[boxIdx].add(SPRITES.ROCK_LARGE); // FORCE ROCK VISIBILITY
    }

    // Add Water Pool nearby
    const waterIdx = (centerY + 5) * width + (centerX + 5);
    tiles[waterIdx].items = [];
    tiles[waterIdx].add(SPRITES.WATER);

    console.log("[MapGen] Town and Walls Generated (Stack Mode).");
    return { width, height, tileSize: 32, tiles, entities };
}

export function generateDungeon(width: number, height: number, type: 'dungeon' | 'cave' = 'dungeon'): { width: number, height: number, tileSize: number, tiles: Tile[], entities: any[] } {
    const tiles = Array(width * height).fill(null).map(() => new Tile());
    const entities: any[] = [];
    const rng = new RNG(1337); // Seed needed? defaulting for now

    // IDs
    const WALL_STONE = SPRITES.WALL_STONE; // 200 or similar
    const FLOOR_STONE = SPRITES.FLOOR_STONE; // 201
    const WALL_CAVE = SPRITES.WALL_CAVE || 17; // Use Cave Wall Sprite
    const FLOOR_CAVE = SPRITES.FLOOR_DIRT || 11; // Dirt floor for caves

    const WALL = type === 'cave' ? WALL_CAVE : WALL_STONE;
    const FLOOR = type === 'cave' ? FLOOR_CAVE : FLOOR_STONE;

    if (type === 'dungeon') {
        // Simple Room/Cooridor (BSP or Box for now)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                tiles[idx].add(FLOOR);
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    tiles[idx].add(WALL);
                }
            }
        }
    } else {
        // Cellular Automata for Caves
        // 1. Random Fill
        const map = new Int8Array(width * height);
        for (let i = 0; i < width * height; i++) map[i] = rng.next() < 0.45 ? 1 : 0; // 1 = Wall

        // 2. Smooth (4 iterations)
        for (let iter = 0; iter < 4; iter++) {
            const newMap = new Int8Array(width * height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let walls = 0;
                    // Count neighbors
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = x + dx; const ny = y + dy;
                            if (nx < 0 || nx >= width || ny < 0 || ny >= height) walls++;
                            else if (map[ny * width + nx] === 1) walls++;
                        }
                    }
                    // Rule: 4-5 rule
                    const idx = y * width + x;
                    if (map[idx] === 1) newMap[idx] = walls >= 4 ? 1 : 0;
                    else newMap[idx] = walls >= 5 ? 1 : 0;
                }
            }
            // Copy back
            for (let i = 0; i < width * height; i++) map[i] = newMap[i];
        }

        // Apply to Tiles
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                tiles[idx].add(FLOOR);
                if (map[idx] === 1 || x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    // Wall
                    tiles[idx].add(WALL_CAVE); // Use explicit cave wall ID
                } else {
                    // Chance for Cave Decor?
                    if (rng.next() > 0.98) tiles[idx].add(SPRITES.ROCK);
                }
            }
        }
    }

    // Spawn Rope Spot (Exit)
    // Find a clear spot
    let exitPlaced = false;
    let attempts = 0;
    while (!exitPlaced && attempts < 100) {
        const x = Math.floor(width / 2) + Math.floor((rng.next() - 0.5) * 10);
        const y = Math.floor(height / 2) + Math.floor((rng.next() - 0.5) * 10);
        const idx = y * width + x;
        if (x > 1 && x < width - 1 && y > 1 && y < height - 1) {
            // Check if Not Wall
            // In Stack: Check items
            const hasWall = tiles[idx].items.some(i => i.id === WALL || i.id === WALL_CAVE);
            if (!hasWall) {
                tiles[idx].add(SPRITES.ROPE_SPOT);
                entities.push({ type: 'dungeon_exit', x: x * 32, y: y * 32 });
                exitPlaced = true;
            }
        }
        attempts++;
    }

    console.log(`[MapGen] Generated ${type} map.`);
    return { width, height, tileSize: 32, tiles, entities };
}
