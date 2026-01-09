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

            // Always add Ground first
            tiles[index].add(GRASS);

            // Random obstacles (Trees/Rocks) outside town
            // We check if we are FAR from the center
            const dist = Math.abs(x - centerX) + Math.abs(y - centerY);
            if (dist > townRadius + 5) {
                if (rng.next() > 0.9) {
                    // Add Wall ON TOP of Grass
                    tiles[index].add(WALL);
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
                // Check if we already have wall? Just push it.
                // If it was grass, now it has a wall on top.
                if (!tiles[index].has(WALL)) {
                    tiles[index].add(WALL);
                }
            } else {
                // Inside town: ensure it's clean (remove walls if any were added by random noise)
                // Since we rebuilt, we can just ensure top is grass.
                // But our logic above added grass then maybe random wall.
                // Let's clear stacks if they have walls?
                // Actually, simplest is to pop if top is wall.
                while (tiles[index].has(WALL)) {
                    tiles[index].pop();
                }
                // Ensure at least grass
                if (tiles[index].items.length === 0) tiles[index].add(GRASS);
            }
        }
    }

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
