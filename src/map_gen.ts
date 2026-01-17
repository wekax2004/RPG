import { SPRITES } from './constants';
import { RNG } from './rng';
import { Tile } from './components';

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

            // 1. Generate Base Terrain with Biomes
            // Biomes: Snow (North), Desert (South), Swamp (East/West outskirts), Grass (Center)
            // Coordinates: 0,0 is Top-Left (North-West)

            let terrain = SPRITES.GRASS;
            let biome = 'grass';

            if (y < height * 0.25) {
                // North: Snow
                terrain = SPRITES.SNOW;
                biome = 'snow';
                if (rng.next() > 0.9) terrain = SPRITES.ICE; // Ice patches
            } else if (y > height * 0.75) {
                // South: Desert
                terrain = SPRITES.SAND;
                biome = 'desert';
                if (rng.next() > 0.95) terrain = SPRITES.SANDSTONE; // Ruins or rock
            } else if (x < width * 0.2 || x > width * 0.8) {
                // East/West Edges: Swamp
                terrain = SPRITES.SWAMP_MUD; // Need MUD sprite
                biome = 'swamp';
                if (rng.next() > 0.8) terrain = SPRITES.GRASS; // Patchy grass
            } else {
                // Center: Grasslands (Default)
                const rand = rng.next();
                if (rand > 0.95) terrain = SPRITES.GRASS_FLOWERS;
                else if (rand > 0.90) terrain = SPRITES.DIRT;
                else terrain = SPRITES.GRASS;
            }

            tiles[index].add(terrain);

            // Natural World: Obstacles (Trees/Rocks)
            // Dist > 5 allows some space for town
            const dist = Math.abs(x - centerX) + Math.abs(y - centerY);

            if (dist > 3) {
                if (rng.next() > 0.96) {
                    // Add Biome-Specific Obstacles
                    let obs = SPRITES.OAK_TREE;
                    if (biome === 'snow') obs = SPRITES.PINE_TREE || 50; // Fallback
                    else if (biome === 'desert') obs = SPRITES.CACTUS || SPRITES.ROCK; // Cactus missing?
                    else if (biome === 'swamp') obs = SPRITES.DROWNED_TREE || SPRITES.TREE_OAK;

                    if (biome === 'desert' && rng.next() > 0.5) obs = SPRITES.ROCK;

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

    // ... (Temple Generation - Multi-story with DOME) ...
    // --- TEMPLE GENERATION (Rookgaard Library Style) ---
    const templeRadius = 2;
    const FLOOR_TEMPLE = SPRITES.FLOOR_STONE;

    for (let y = centerY - templeRadius; y <= centerY + templeRadius; y++) {
        for (let x = centerX - templeRadius; x <= centerX + templeRadius; x++) {
            const index = y * width + x;
            tiles[index].items = []; // Clear ground
            tiles[index].add(FLOOR_TEMPLE);

            const isBorderX = x === centerX - templeRadius || x === centerX + templeRadius;
            const isBorderY = y === centerY - templeRadius || y === centerY + templeRadius;
            const isBorder = isBorderX || isBorderY;
            const isEntrance = x === centerX && y === centerY + templeRadius;

            // STORY 1 (Base Walls)
            if (isBorder && !isEntrance) {
                tiles[index].add(SPRITES.WALL_3D || 600);
            }

            // STORY 2 (Inset Walls for Depth)
            const isS2BorderX = x === centerX - (templeRadius - 1) || x === centerX + (templeRadius - 1);
            const isS2BorderY = y === centerY - (templeRadius - 1) || y === centerY + (templeRadius - 1);
            if (isS2BorderX || isS2BorderY) {
                tiles[index].add(SPRITES.WALL_L2 || 601);
            }

            // ROOF / DOME (On top of Story 2)
            if (x === centerX && y === centerY) {
                tiles[index].add(SPRITES.ROOF_TEMPLE || 582);
            }

            if (isEntrance) {
                tiles[index].add(SPRITES.DOOR_METAL || 590);
            }
        }
    }

    // Central altar with special decorations
    const altarIdx = centerY * width + centerX;
    tiles[altarIdx].add(SPRITES.TORCH);
    tiles[altarIdx].add(SPRITES.FOUNTAIN || 592); // Sacred fountain

    // Treasure/offering chest
    const chestIdx = centerY * width + (centerX + 1);
    tiles[chestIdx].add(SPRITES.CHEST || 597);

    // === TOWN BUILDINGS ===
    // Helper function to place a building with walls, floor AND ROOF for 3D effect
    const placeBuilding = (bx: number, by: number, bw: number, bh: number, entranceSide: 'n' | 's' | 'e' | 'w', roofColor: 'brown' | 'red' = 'brown') => {
        const ROOF_ID = roofColor === 'red' ? SPRITES.ROOF_RED : SPRITES.ROOF_BROWN;

        for (let dy = 0; dy < bh; dy++) {
            for (let dx = 0; dx < bw; dx++) {
                const tx = bx + dx;
                const ty = by + dy;
                const idx = ty * width + tx;

                // Clear existing items
                tiles[idx].items = [];

                // Check if this is border
                const isNorth = dy === 0;
                const isSouth = dy === bh - 1;
                const isWest = dx === 0;
                const isEast = dx === bw - 1;
                const isBorder = isNorth || isSouth || isWest || isEast;

                // Check if this is the entrance
                const midX = Math.floor(bw / 2);
                const midY = Math.floor(bh / 2);
                const isEntrance =
                    (entranceSide === 'n' && isNorth && dx === midX) ||
                    (entranceSide === 's' && isSouth && dx === midX) ||
                    (entranceSide === 'e' && isEast && dy === midY) ||
                    (entranceSide === 'w' && isWest && dy === midY);

                tiles[idx].add(SPRITES.FLOOR_WOOD || SPRITES.COBBLE);

                // Add 3D wall if border but not entrance
                if (isBorder && !isEntrance) {
                    // Use the new 3D wall sprite
                    tiles[idx].add(SPRITES.WALL_3D || 600);

                    // Add windows on the north wall for more detail
                    if (isNorth && dx % 2 === 1 && dx !== midX) {
                        tiles[idx].add(SPRITES.WINDOW || 588);
                    }
                }

                // Add entrance door
                if (isEntrance) {
                    tiles[idx].add(SPRITES.DOOR_WOOD || 589);
                }

                // === ADD ROOF LAYER FOR 3D EFFECT ===
                // Roof covers interior and some walls (not entrance side)
                const isInterior = !isBorder;
                const isRoofWall = isBorder && !isEntrance &&
                    ((entranceSide === 's' && !isSouth) ||
                        (entranceSide === 'n' && !isNorth) ||
                        (entranceSide === 'e' && !isEast) ||
                        (entranceSide === 'w' && !isWest));

                if (isInterior || isRoofWall) {
                    // Add roof tile on top (layered rendering)
                    tiles[idx].add(ROOF_ID || 580);
                }

                // Add corner roof pieces
                if ((isNorth && isWest) && entranceSide !== 'n' && entranceSide !== 'w') {
                    tiles[idx].add(SPRITES.ROOF_CORNER_NW || 583);
                }
                if ((isNorth && isEast) && entranceSide !== 'n' && entranceSide !== 'e') {
                    tiles[idx].add(SPRITES.ROOF_CORNER_NE || 584);
                }
            }
        }

        // Add chimney on one corner (back-left of building)
        const chimneyX = bx + 1;
        const chimneyY = by + 1;
        tiles[chimneyY * width + chimneyX].add(SPRITES.CHIMNEY || 587);
    };

    // Building positions (relative to town center)
    const buildingSize = 5; // 5x5 buildings
    const offset = townRadius - buildingSize - 1; // Place near corners

    // 1. WEAPON SHOP (Northwest corner) - Where Gorn is
    const shopX = centerX - offset;
    const shopY = centerY - offset;
    placeBuilding(shopX, shopY, buildingSize, buildingSize, 's');
    // Add shop decorations
    tiles[(shopY + 2) * width + (shopX + 1)].add(SPRITES.CRATE); // Crate
    tiles[(shopY + 2) * width + (shopX + 3)].add(SPRITES.BARREL || SPRITES.CRATE); // Barrel
    tiles[(shopY + 1) * width + (shopX + 2)].add(SPRITES.TORCH); // Torch inside

    // 2. HEALER'S HUT (Southwest corner) - Where Adana is
    const healerX = centerX - offset;
    const healerY = centerY + offset - buildingSize + 1;
    placeBuilding(healerX, healerY, buildingSize, buildingSize, 'n');
    // Add healer decorations
    tiles[(healerY + 2) * width + (healerX + 2)].add(SPRITES.WELL || SPRITES.FOUNTAIN || SPRITES.CHEST); // Healing fountain
    tiles[(healerY + 3) * width + (healerX + 1)].add(SPRITES.TORCH);

    // 3. INN (Northeast corner) - For flavor
    const innX = centerX + offset - buildingSize + 1;
    const innY = centerY - offset;
    placeBuilding(innX, innY, buildingSize, buildingSize, 's');
    // Add inn decorations  
    tiles[(innY + 2) * width + (innX + 1)].add(SPRITES.TABLE || SPRITES.CRATE); // Table
    tiles[(innY + 2) * width + (innX + 3)].add(SPRITES.TABLE || SPRITES.CRATE); // Table
    tiles[(innY + 1) * width + (innX + 2)].add(SPRITES.TORCH);

    // 4. BANK (Southeast corner)
    const bankX = centerX + offset - buildingSize + 1;
    const bankY = centerY + offset - buildingSize + 1;
    placeBuilding(bankX, bankY, buildingSize, buildingSize, 'n');
    // Add bank decorations
    tiles[(bankY + 2) * width + (bankX + 2)].add(SPRITES.CHEST); // Main vault chest
    tiles[(bankY + 3) * width + (bankX + 1)].add(SPRITES.GOLD_PILE || SPRITES.COIN || SPRITES.CRATE);
    tiles[(bankY + 3) * width + (bankX + 3)].add(SPRITES.GOLD_PILE || SPRITES.COIN || SPRITES.CRATE);
    tiles[(bankY + 1) * width + (bankX + 2)].add(SPRITES.TORCH);

    // 5. TOWN DECORATIONS - Roads and Lighting
    // Place torches along main roads (every 4 tiles)
    for (let i = -townRadius + 2; i < townRadius - 1; i += 4) {
        // Horizontal road (center)
        const roadY = centerY;
        if (Math.abs(i) > 3) { // Don't place too close to temple
            tiles[roadY * width + (centerX + i)].add(SPRITES.LAMPPOST || SPRITES.TORCH);
        }
        // Vertical road
        const roadX = centerX;
        if (Math.abs(i) > 3) {
            tiles[(centerY + i) * width + roadX].add(SPRITES.LAMPPOST || SPRITES.TORCH);
        }
    }

    // 6. TOWN WELL (Near temple)
    const wellX = centerX + 4;
    const wellY = centerY + 1;
    const wellIdx = wellY * width + wellX;
    tiles[wellIdx].add(SPRITES.WELL || SPRITES.FOUNTAIN || 50);

    console.log(`[MapGen] Town buildings generated: Shop(${shopX},${shopY}), Healer(${healerX},${healerY}), Inn(${innX},${innY}), Bank(${bankX},${bankY})`);


    // --- TOWN PERIMETER WALLS (Old Rookgaard) ---
    // Enclose the town with thick stone walls like Rookgaard
    const townMinX = centerX - 12;
    const townMinY = centerY - 12;
    const townMaxX = centerX + 12;
    const townMaxY = centerY + 12;

    for (let y = townMinY; y <= townMaxY; y++) {
        for (let x = townMinX; x <= townMaxX; x++) {
            const isBorderX = x === townMinX || x === townMaxX;
            const isBorderY = y === townMinY || y === townMaxY;

            if (isBorderX || isBorderY) {
                // Openings for gates (at crossroads)
                if (x === centerX || x === centerX - 1 || y === centerY || y === centerY - 1) continue;

                const idx = y * width + x;
                tiles[idx].items = []; // Clear trees/grass
                tiles[idx].add(SPRITES.COBBLE); // Floor under wall
                tiles[idx].add(SPRITES.TOWN_WALL || 602);
            }
        }
    }

    // --- SPAWN TOWN NPCs ---
    // 1. GORN (Merchant) - Inside Weapon Shop
    entities.push({
        type: 'npc',
        x: shopX * 32 + 64, // Center of shop
        y: shopY * 32 + 64,
        npcType: 'merchant',
        name: 'Gorn'
    });

    // 2. ADANA (Healer) - Inside Healer's Hut
    entities.push({
        type: 'npc',
        x: healerX * 32 + 64,
        y: healerY * 32 + 64,
        npcType: 'healer',
        name: 'Adana'
    });

    // 3. ARIC THE GUIDE (Quest NPC) - Near Center
    entities.push({
        type: 'npc',
        x: (centerX + 3) * 32,
        y: (centerY + 3) * 32,
        npcType: 'quest_giver',
        name: 'Aric the Guide'
    });
    console.log(`[MapGen] Town NPCs registered for spawn.`);

    // 4. Spawn Enemies (THEMATIC POIS)
    // We replace random spawning with structured "Points of Interest"

    // Helper to spawn a group of mobs around a center
    const spawnMobGroup = (centerX: number, centerY: number, radius: number, count: number, type: string) => {
        for (let i = 0; i < count; i++) {
            const angle = rng.next() * Math.PI * 2;
            const dist = rng.next() * radius;
            const mx = Math.floor(centerX + Math.cos(angle) * dist);
            const my = Math.floor(centerY + Math.sin(angle) * dist);

            if (mx > 0 && mx < width && my > 0 && my < height) {
                const idx = my * width + mx;
                if (!tiles[idx].has(WALL) && !tiles[idx].has(SPRITES.WATER)) {
                    entities.push({ type: 'enemy', x: mx * 32, y: my * 32, enemyType: type });
                }
            }
        }
    };

    // === A. ORC FORTRESS (Grasslands) ===
    // Find a spot in the grasslands (center band)
    let orcPlaced = false;
    for (let i = 0; i < 50; i++) {
        const ox = rng.nextInt(width);
        const oy = rng.nextInt(height);
        // Grassland check (middle band)
        if (oy > height * 0.3 && oy < height * 0.7 && Math.abs(ox - centerX) > 30) {
            // Build Fortress
            const fortSize = 14;
            for (let fy = oy - fortSize / 2; fy <= oy + fortSize / 2; fy++) {
                for (let fx = ox - fortSize / 2; fx <= ox + fortSize / 2; fx++) {
                    const fIdx = Math.floor(fy) * width + Math.floor(fx);
                    if (!tiles[fIdx]) continue;

                    tiles[fIdx].items = []; // Clear
                    tiles[fIdx].add(SPRITES.DIRT); // Mud floor

                    // Walls
                    if (Math.abs(fx - ox) > fortSize / 2 - 1 || Math.abs(fy - oy) > fortSize / 2 - 1) {
                        if (fx !== ox && fy !== oy + Math.floor(fortSize / 2)) { // Entrance
                            tiles[fIdx].add(SPRITES.WALL_STONE_V); // Wooden palisade? reusing stone for now
                        }
                    }
                }
            }
            // Spawn Orcs
            spawnMobGroup(ox, oy, 12, 15, 'orc');
            // Warlord
            entities.push({ type: 'boss', x: ox * 32, y: oy * 32, enemyType: 'orc_warlord' });
            console.log(`[MapGen] Orc Fortress generated at ${ox},${oy}`);
            orcPlaced = true;
            break;
        }
    }

    // === B. WOLF DEN (Forest) ===
    // Near trees
    let wolfPlaced = false;
    for (let i = 0; i < 50 && !wolfPlaced; i++) {
        const wx = rng.nextInt(width);
        const wy = rng.nextInt(height);
        // Check for trees nearby implies forest
        const idx = wy * width + wx;
        if (tiles[idx] && tiles[idx].has(SPRITES.GRASS_FLOWERS)) { // Deep grass
            spawnMobGroup(wx, wy, 10, 12, 'wolf');
            spawnMobGroup(wx, wy, 5, 3, 'bear'); // Bears nearby
            console.log(`[MapGen] Wolf Den generated at ${wx},${wy}`);
            wolfPlaced = true;
        }
    }

    // === C. ICE MOUNTAIN (North) ===
    const iceX = Math.floor(width * 0.7); // East side
    const iceY = 15; // North
    spawnMobGroup(iceX, iceY, 20, 8, 'yeti');
    spawnMobGroup(iceX, iceY, 25, 12, 'polar_bear');
    console.log(`[MapGen] Ice Mountain populated at ${iceX},${iceY}`);

    // === D. DESERT RUINS (South) ===
    const desX = Math.floor(width * 0.3); // West side
    const desY = height - 20; // South
    // Ruins (Sandstone columns)
    for (let r = 0; r < 10; r++) {
        const rx = desX + Math.floor(rng.next() * 20 - 10);
        const ry = desY + Math.floor(rng.next() * 10 - 5);
        tiles[ry * width + rx].add(SPRITES.SANDSTONE);
    }
    spawnMobGroup(desX, desY, 15, 10, 'scorpion');
    spawnMobGroup(desX, desY, 15, 10, 'snake');
    console.log(`[MapGen] Desert Ruins populated at ${desX},${desY}`);

    // === E. SPIDER CAVES (Swamp edges) ===
    const swampX = 15;
    const swampY = Math.floor(height / 2);
    spawnMobGroup(swampX, swampY, 15, 20, 'spider');
    spawnMobGroup(swampX, swampY, 15, 5, 'slime');

    // 5. Spawn Dungeon Entrances (Biome Specific)
    // One per biome
    const biomes = ['snow', 'desert', 'swamp'];
    for (const b of biomes) {
        let spawned = false;
        let attempts = 0;
        while (!spawned && attempts < 100) {
            const bx = rng.nextInt(width);
            const by = rng.nextInt(height);
            attempts++;

            // Validate Biome
            let isCorrectBiome = false;
            if (b === 'snow' && by < height * 0.25) isCorrectBiome = true;
            if (b === 'desert' && by > height * 0.75) isCorrectBiome = true;
            if (b === 'swamp' && (bx < width * 0.2 || bx > width * 0.8)) isCorrectBiome = true;

            if (isCorrectBiome) {
                const idx = by * width + bx;
                if (!tiles[idx].has(WALL)) {
                    // Safe to spawn
                    const ent: any = {
                        type: 'dungeon_entrance',
                        x: bx * 32,
                        y: by * 32,
                        dungeonType: b, // 'snow', 'desert', 'swamp'
                        label: b.charAt(0).toUpperCase() + b.slice(1) + " Cave"
                    };

                    // Lock specific dungeons (linked to Quests)
                    // Swamp -> Requires "Orchard Key" (From Wolf Quest)
                    if (b === 'swamp') {
                        ent.locked = { keyIds: ['Orchard Key'], message: "Locked. Requires Orchard Key." };
                    }
                    // Desert -> Requires "Mine Key" (From Orc Quest)
                    if (b === 'desert') {
                        ent.locked = { keyIds: ['Mine Key'], message: "Locked. Requires Mine Key." };
                    }

                    entities.push(ent);

                    // Add Entrance Sprite (77 = Stairs Down/Hole)
                    tiles[idx].add(SPRITES.STAIRS_DOWN || 77);
                    spawned = true;
                }
            }
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

export function generateDungeon(width: number, height: number, seed: number, type: 'dungeon' | 'cave' = 'dungeon', biome: string = 'grass'): { width: number, height: number, tileSize: number, tiles: Tile[], entities: any[] } {
    const tiles = Array(width * height).fill(null).map(() => new Tile());
    const entities: any[] = [];
    const rng = new RNG(seed);

    // IDs
    const WALL_STONE = SPRITES.STONE_WALL;
    const FLOOR_STONE = SPRITES.FLOOR_STONE;

    // Biome Overrides
    let WALL_CAVE = SPRITES.STONE_WALL;
    let FLOOR_CAVE = SPRITES.DIRT;

    if (biome === 'snow') {
        WALL_CAVE = SPRITES.ICE; // Or wall_ice
        FLOOR_CAVE = SPRITES.ICE;
    } else if (biome === 'desert') {
        WALL_CAVE = SPRITES.SANDSTONE;
        FLOOR_CAVE = SPRITES.SAND;
    } else if (biome === 'swamp') {
        WALL_CAVE = SPRITES.WALL_STONE_V; // Temporary
        FLOOR_CAVE = SPRITES.SWAMP_MUD;
    }

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
                    tiles[idx].add(WALL);
                } else {
                    // Decor
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

    // Spawn Mobs in Dungeon
    const mobCount = 15; // Small dungeon
    for (let i = 0; i < mobCount; i++) {
        let spawned = false;
        let attempts = 0;
        while (!spawned && attempts < 50) {
            const mx = rng.nextInt(width);
            const my = rng.nextInt(height);
            attempts++;
            const idx = my * width + mx;

            // Check solid
            const hasWall = tiles[idx].items.some(i => i.id === WALL || i.id === WALL_CAVE);
            if (!hasWall) {
                let mobType = 'rat';
                const roll = rng.next();

                if (biome === 'snow') {
                    if (roll > 0.7) mobType = 'yeti';
                    else mobType = 'polar_bear';
                } else if (biome === 'desert') {
                    if (roll > 0.6) mobType = 'scorpion';
                    else mobType = 'snake';
                } else if (biome === 'swamp') {
                    mobType = 'slime';
                } else {
                    // Generic Dungeon (Grass Biome Entrance) -> "Sewer / Crypt" theme
                    // "Rat in sewers" - User Request
                    if (roll > 0.8) mobType = 'skeleton';
                    else if (roll > 0.6) mobType = 'spider';
                    else mobType = 'rat'; // Rats are common here
                }

                entities.push({
                    type: 'enemy',
                    x: mx * 32,
                    y: my * 32,
                    enemyType: mobType
                });
                spawned = true;
            }
        }
    }

    // Spawn Boss at Dungeon End
    // Find a clear spot far from exit
    let bossPlaced = false;
    let bossAttempts = 0;
    while (!bossPlaced && bossAttempts < 100) {
        const bx = rng.nextInt(width);
        const by = rng.nextInt(height);
        bossAttempts++;
        const idx = by * width + bx;

        const hasWall = tiles[idx].items.some(i => i.id === WALL || i.id === WALL_CAVE);
        if (!hasWall) {
            let bossType = '';
            if (biome === 'snow') bossType = 'frost_giant';
            else if (biome === 'desert') bossType = 'scorpion_king';
            else if (biome === 'swamp') bossType = 'hydra';
            else bossType = 'orc_warlord'; // Generic dungeon

            if (bossType) {
                entities.push({
                    type: 'boss',
                    x: bx * 32,
                    y: by * 32,
                    enemyType: bossType
                });
                // NOTE: Aric is now spawned ONCE at line 151, not here.
                console.log(`[MapGen] Spawned ${bossType} boss at ${bx},${by}`);
                bossPlaced = true;
            }
        }
    }

    console.log(`[MapGen] Generated ${type} map.`);
    return { width, height, tileSize: 32, tiles, entities };
}
