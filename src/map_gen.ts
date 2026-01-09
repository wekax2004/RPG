import { TileMap } from './game';
import { RNG } from './rng';

export function generateOverworld(width: number, height: number, seed: number): { width: number, height: number, tileSize: number, data: number[], entities: any[] } {
    const rng = new RNG(seed);
    const data = new Array(width * height).fill(16); // Fill with Grass (16)
    const entities: any[] = [];

    // Terrain variety tile IDs
    const GRASS = 16;
    const GRASS_DARK = 62;
    const GRASS_LIGHT = 63;
    const FLOWERS = 64;
    const ROCK = 65;
    const ROCK_SMALL = 66;
    const RIVER_H = 67;
    const RIVER_V = 68;
    const BRIDGE = 69;
    const BEACH = 70;
    const BOAT = 71;
    const WATER = 18;

    // --- INITIAL TERRAIN WITH VARIETY ---
    // Walls around edges
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                data[y * width + x] = 17; // Wall
            } else {
                // Add grass variety based on noise
                const grassRoll = rng.next();
                if (grassRoll < 0.05) {
                    data[y * width + x] = GRASS_DARK;
                } else if (grassRoll < 0.10) {
                    data[y * width + x] = GRASS_LIGHT;
                } else if (grassRoll < 0.12) {
                    data[y * width + x] = FLOWERS;
                } else if (grassRoll < 0.14) {
                    data[y * width + x] = ROCK_SMALL;
                } else {
                    data[y * width + x] = GRASS;
                }
            }
        }
    }

    // --- RIVER GENERATION (Winding river from north to south) ---
    let riverX = Math.floor(width * 0.3) + rng.nextInt(20); // Start west of center
    for (let y = 10; y < height - 50; y++) {
        // River winds left and right
        riverX += rng.nextInt(3) - 1;
        riverX = Math.max(20, Math.min(width - 40, riverX));

        // River is 3-5 tiles wide
        const riverWidth = 3 + rng.nextInt(2);
        for (let rx = 0; rx < riverWidth; rx++) {
            const tx = riverX + rx;
            if (tx > 0 && tx < width - 1) {
                data[y * width + tx] = RIVER_V;
            }
        }
    }

    // Add bridges where paths cross river
    const bridgeY = Math.floor(height / 2);
    for (let bx = riverX - 1; bx < riverX + 6; bx++) {
        if (bx > 0 && bx < width - 1) {
            data[bridgeY * width + bx] = BRIDGE;
        }
    }

    // --- ROCK FORMATIONS (Scattered clusters) ---
    const rockClusters = 15 + rng.nextInt(10);
    for (let i = 0; i < rockClusters; i++) {
        const cx = 30 + rng.nextInt(width - 60);
        const cy = 30 + rng.nextInt(height - 60);
        const clusterSize = 2 + rng.nextInt(3);

        for (let dy = 0; dy < clusterSize; dy++) {
            for (let dx = 0; dx < clusterSize; dx++) {
                const tx = cx + dx;
                const ty = cy + dy;
                if (tx > 0 && tx < width - 1 && ty > 0 && ty < height - 1) {
                    if (data[ty * width + tx] === GRASS || data[ty * width + tx] === GRASS_DARK || data[ty * width + tx] === GRASS_LIGHT) {
                        data[ty * width + tx] = rng.next() < 0.3 ? ROCK : ROCK_SMALL;
                    }
                }
            }
        }
    }

    // --- COASTAL AREA (West edge - ocean with islands) ---
    for (let y = 30; y < height - 30; y++) {
        for (let x = 1; x < 25; x++) {
            // Create ocean
            data[y * width + x] = WATER;

            // Beach transition
            if (x >= 22 && x <= 24) {
                data[y * width + x] = BEACH;
            }
        }
    }

    // --- ISLAND IN THE OCEAN ---
    const islandX = 10;
    const islandY = Math.floor(height / 2) - 10;
    const islandRadius = 6;

    for (let dy = -islandRadius; dy <= islandRadius; dy++) {
        for (let dx = -islandRadius; dx <= islandRadius; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= islandRadius) {
                const tx = islandX + dx;
                const ty = islandY + dy;
                if (tx > 0 && tx < width - 1 && ty > 0 && ty < height - 1) {
                    if (dist <= islandRadius - 1) {
                        // Island interior - grass with variety
                        data[ty * width + tx] = rng.next() < 0.3 ? GRASS_LIGHT : GRASS;
                    } else {
                        // Island edge - beach
                        data[ty * width + tx] = BEACH;
                    }
                }
            }
        }
    }

    // Add boat near the beach (to reach island later)
    const boatY = Math.floor(height / 2);
    data[boatY * width + 23] = BOAT;
    entities.push({ type: 'teleporter', x: 23 * 32, y: boatY * 32, targetX: 12 * 32, targetY: islandY * 32, label: 'Boat to Island' });

    // --- EXPLORATION REWARDS: TREASURE CHESTS ---
    // Spawn treasure chests in hidden locations around the world
    const CHEST_CLOSED = 73;
    const chestCount = 20 + rng.nextInt(10); // 20-30 chests
    const chestLocations: Array<{ x: number, y: number, tier: string }> = [];

    for (let i = 0; i < chestCount; i++) {
        let cx, cy, attempts = 0;
        do {
            cx = 30 + rng.nextInt(width - 60);
            cy = 30 + rng.nextInt(height - 60);
            attempts++;
        } while (attempts < 50 && (
            // Avoid town center
            Math.abs(cx - Math.floor(width / 2)) < 15 && Math.abs(cy - Math.floor(height / 2)) < 15 ||
            // Avoid water/walls
            data[cy * width + cx] === 17 || data[cy * width + cx] === 18
        ));

        if (attempts < 50) {
            // Determine chest tier based on distance from center
            const distFromCenter = Math.sqrt(Math.pow(cx - width / 2, 2) + Math.pow(cy - height / 2, 2));
            let tier = 'common';
            if (distFromCenter > 80) tier = 'rare';
            if (distFromCenter > 100) tier = 'legendary';

            chestLocations.push({ x: cx, y: cy, tier });
            entities.push({
                type: 'chest',
                x: cx * 32,
                y: cy * 32,
                tier,
                loot: getChestLoot(tier, rng)
            });
        }
    }
    console.log(`[MapGen] Spawned ${chestLocations.length} treasure chests.`);

    // --- EXPLORATION REWARDS: RARE MOB GROUPS ---
    // Spawn rare enemy camps with better loot
    const rareCamps = 8 + rng.nextInt(5); // 8-12 rare camps
    const rareEnemyTypes = ['bear', 'bandit', 'necromancer', 'mummy'];

    for (let i = 0; i < rareCamps; i++) {
        const rx = 40 + rng.nextInt(width - 80);
        const ry = 40 + rng.nextInt(height - 80);

        // Avoid town
        if (Math.abs(rx - width / 2) < 20 && Math.abs(ry - height / 2) < 20) continue;

        const rareType = rareEnemyTypes[rng.nextInt(rareEnemyTypes.length)];
        const groupSize = 2 + rng.nextInt(3); // 2-4 enemies

        for (let g = 0; g < groupSize; g++) {
            const gx = rx + rng.nextInt(3) - 1;
            const gy = ry + rng.nextInt(3) - 1;
            entities.push({
                type: 'enemy',
                x: gx * 32,
                y: gy * 32,
                enemyType: rareType,
                difficulty: 1.5 + rng.next() * 0.5 // Higher difficulty
            });
        }

        // Add a chest near the camp
        entities.push({
            type: 'chest',
            x: rx * 32,
            y: (ry + 2) * 32,
            tier: 'rare',
            loot: getChestLoot('rare', rng)
        });
    }
    console.log(`[MapGen] Spawned ${rareCamps} rare enemy camps.`);

    // Helper function for chest loot
    function getChestLoot(tier: string, rng: RNG): any {
        const gold = tier === 'common' ? 50 + rng.nextInt(100) :
            tier === 'rare' ? 150 + rng.nextInt(200) :
                300 + rng.nextInt(400);

        const items: string[] = [];
        if (tier === 'rare' || tier === 'legendary') {
            const rareItems = ['Noble Sword', 'Iron Sword', 'Health Potion', 'Mana Potion'];
            items.push(rareItems[rng.nextInt(rareItems.length)]);
        }
        if (tier === 'legendary') {
            items.push('Tower Shield');
        }

        return { gold, items };
    }



    // Early declarations needed for biome generation
    const centerTileX = Math.floor(width / 2);
    const centerTileY = Math.floor(height / 2);
    const townRadius = 10;

    // --- DUNGEON ENTRANCES (Teleporters) ---
    // We will place teleporters that load NEW maps instead of just teleporting coords.
    // For now, let's keep the existing "Crypt" logic as a "Local Dungeon" (on same map) for backward compatibility 
    // BUT we will also add "Remote Dungeon" entrances.

    // 1. Fire Caverns Entrance (Desert)
    const fireX = width - 40;
    const fireY = height - 40;
    // Clear area
    for (let y = fireY - 3; y <= fireY + 3; y++) {
        for (let x = fireX - 3; x <= fireX + 3; x++) {
            if (x > 0 && x < width && y > 0 && y < height) data[y * width + x] = 56; // Sand
        }
    }
    // Lava pool decoration
    data[fireY * width + fireX] = 56;
    entities.push({ type: 'static', x: fireX * 32, y: fireY * 32, sprite: 77, size: 32 }); // Cave Entrance
    entities.push({
        type: 'dungeon_entrance',
        x: fireX * 32,
        y: fireY * 32,
        dungeonType: 'fire',
        label: 'Fire Caverns'
    });

    // 2. Frozen Crypt Entrance (Ice Zone)
    const iceX = centerTileX;
    const iceY = 20; // Far north
    entities.push({ type: 'static', x: iceX * 32, y: iceY * 32, sprite: 77, size: 32 });
    entities.push({
        type: 'dungeon_entrance',
        x: iceX * 32,
        y: iceY * 32,
        dungeonType: 'ice',
        label: 'Frozen Crypt'
    });

    // 3. Sunken Temple (Ocean Island)
    // Island is at islandX, islandY defined earlier (approx x=10, y=height/2 - 10)
    // We haven't defined islandX in this scope cleanly. Let's find the boat target.
    // Boat target is x=12, y=islandY (approx height/2 - 10).
    const islandEntranceX = 12;
    const islandEntranceY = Math.floor(height / 2) - 10;
    entities.push({ type: 'static', x: islandEntranceX * 32, y: islandEntranceY * 32, sprite: 77, size: 32 });
    entities.push({
        type: 'dungeon_entrance',
        x: islandEntranceX * 32,
        y: islandEntranceY * 32,
        dungeonType: 'temple',
        label: 'Sunken Temple'
    });

    // --- ICE ZONE (North side of map) ---
    const SNOW = 81;
    const ICE = 82;
    const FROZEN_TREE = 83;

    for (let y = 1; y < 70; y++) {
        for (let x = 30; x < width - 30; x++) {
            // Check distance from center
            const dx = x - Math.floor(width / 2);
            const dy = y - Math.floor(height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > townRadius + 10) {
                // Replace terrain with snow
                if (data[y * width + x] !== 17 && data[y * width + x] !== 18) {
                    data[y * width + x] = SNOW;

                    // Frozen trees
                    if (rng.next() < 0.08) {
                        data[y * width + x] = FROZEN_TREE;
                    }

                    // Ice patches
                    if (rng.next() < 0.03) {
                        data[y * width + x] = ICE;
                    }

                    // Ice Zone Enemies
                    const enemyRoll = rng.next();
                    if (enemyRoll < 0.003) {
                        entities.push({ type: 'ice_enemy', x: x * 32, y: y * 32, enemyType: 'ice_wolf', difficulty: 1.3 });
                    } else if (enemyRoll < 0.005) {
                        entities.push({ type: 'ice_enemy', x: x * 32, y: y * 32, enemyType: 'frost_mage', difficulty: 1.6 });
                    } else if (enemyRoll < 0.006) {
                        entities.push({ type: 'ice_enemy', x: x * 32, y: y * 32, enemyType: 'yeti', difficulty: 2.0 });
                    }
                }
            }
        }
    }

    // Ice Zone Temple
    entities.push({
        type: 'temple',
        x: (width / 2) * 32,
        y: 40 * 32,
        name: 'Frost Temple',
        isDefault: false
    });
    console.log(`[MapGen] Generated Ice Zone (y < 70).`);

    // --- CAMPFIRES (Scattered rest points) ---
    const campfireCount = 8 + rng.nextInt(5);
    for (let i = 0; i < campfireCount; i++) {
        const cx = 40 + rng.nextInt(width - 80);
        const cy = 40 + rng.nextInt(height - 80);

        // Avoid water/walls
        if (data[cy * width + cx] === GRASS || data[cy * width + cx] === 62 || data[cy * width + cx] === 63) {
            entities.push({ type: 'campfire', x: cx * 32, y: cy * 32 });
        }
    }

    // --- SIGNPOSTS (At key locations) ---
    // North path signpost
    entities.push({ type: 'signpost', x: (centerTileX) * 32, y: (centerTileY - townRadius - 5) * 32, text: 'North: Ice Lands' });
    // East path signpost
    entities.push({ type: 'signpost', x: (centerTileX + townRadius + 5) * 32, y: (centerTileY) * 32, text: 'East: Desert' });
    // West path signpost
    entities.push({ type: 'signpost', x: (centerTileX - townRadius - 5) * 32, y: (centerTileY) * 32, text: 'West: Ocean' });

    // --- DECORATIVE PROPS (Mushrooms, Graves scattered) ---
    const propCount = 30 + rng.nextInt(20);
    for (let i = 0; i < propCount; i++) {
        const px = 30 + rng.nextInt(width - 60);
        const py = 30 + rng.nextInt(height - 60);

        if (data[py * width + px] === GRASS) {
            const propRoll = rng.next();
            if (propRoll < 0.4) {
                entities.push({ type: 'static', x: px * 32, y: py * 32, sprite: 91, size: 32 }); // Mushroom
            } else if (propRoll < 0.6) {
                entities.push({ type: 'static', x: px * 32, y: py * 32, sprite: 93, size: 32 }); // Grave
            } else if (propRoll < 0.7) {
                entities.push({ type: 'static', x: px * 32, y: py * 32, sprite: 94, size: 32 }); // Barrel
            }
        }
    }

    // --- CAVES (Entrance points for later dungeons) ---
    // Cave in forest
    entities.push({ type: 'teleporter', x: (centerTileX + 50) * 32, y: (centerTileY + 30) * 32, targetX: (centerTileX + 52) * 32, targetY: (centerTileY + 30) * 32, label: 'Forest Cave' });
    // Cave sprite marker
    entities.push({ type: 'static', x: (centerTileX + 50) * 32, y: (centerTileY + 30) * 32, sprite: 77, size: 32 });

    // Cave in ice zone
    entities.push({ type: 'static', x: (Math.floor(width / 2) + 20) * 32, y: 35 * 32, sprite: 77, size: 32 });

    // --- FISHING SPOTS ---
    entities.push({ type: 'static', x: 24 * 32, y: (height / 2 + 10) * 32, sprite: 78, size: 32 });
    entities.push({ type: 'static', x: 24 * 32, y: (height / 2 - 15) * 32, sprite: 78, size: 32 });

    // Spawn Player in Center
    const centerX = Math.floor(width / 2) * 32;
    const centerY = Math.floor(height / 2) * 32;

    // Clear "Town" Area (Safe Zone) - variables declared earlier

    // Clear "Town" Area (Safe Zone)
    // --- DUNGEON TILE INTEGRATION ---
    const WALL_ID = 200; // Dungeon Wall (Safe ID)
    const FLOOR_ID = 201; // Dungeon Floor (Safe ID)

    // Helper to draw buildings
    const drawBuilding = (bx: number, by: number, bw: number, bh: number) => {
        for (let y = by; y < by + bh; y++) {
            for (let x = bx; x < bx + bw; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    // Wall on edge, Floor inside
                    if (x === bx || x === bx + bw - 1 || y === by || y === by + bh - 1) {
                        data[y * width + x] = WALL_ID;
                    } else {
                        data[y * width + x] = FLOOR_ID;
                    }
                }
            }
        }
        // Add Door (Bottom Center)
        const doorX = bx + Math.floor(bw / 2);
        const doorY = by + bh - 1;
        if (doorX >= 0 && doorX < width && doorY >= 0 && doorY < height) {
            data[doorY * width + doorX] = FLOOR_ID;
        }
    };

    const startX = centerTileX - townRadius;
    const startY = centerTileY - townRadius;
    const endX = centerTileX + townRadius;
    const endY = centerTileY + townRadius;

    // 1. FILL THE ENTIRE TOWN WITH FLOOR (Base Layer)
    for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                data[y * width + x] = FLOOR_ID;
            }
        }
    }

    // 2. DRAW OUTER WALLS (Perimeter)
    for (let y = startY; y <= endY; y++) {
        if (startX >= 0 && startX < width && y >= 0 && y < height) data[y * width + startX] = WALL_ID; // Left
        if (endX >= 0 && endX < width && y >= 0 && y < height) data[y * width + endX] = WALL_ID; // Right
    }
    for (let x = startX; x <= endX; x++) {
        if (startY >= 0 && startY < height && x >= 0 && x < width) data[startY * width + x] = WALL_ID; // Top
        if (endY >= 0 && endY < height && x >= 0 && x < width) data[endY * width + x] = WALL_ID; // Bottom
    }

    // 3. PUNCH GATES (Exits)
    if (centerTileX >= 0 && centerTileX < width) {
        if (startY >= 0) data[startY * width + centerTileX] = FLOOR_ID; // North
        if (endY < height) data[endY * width + centerTileX] = FLOOR_ID; // South
    }
    if (centerTileY >= 0 && centerTileY < height) {
        if (startX >= 0) data[centerTileY * width + startX] = FLOOR_ID; // West
        if (endX < width) data[centerTileY * width + endX] = FLOOR_ID; // East
    }

    // 4. DRAW THE MAIN TEMPLE (Center)
    // Smaller 3x3 core to avoid clutter
    const templeX = centerTileX - 1;
    const templeY = centerTileY - 1;
    drawBuilding(templeX, templeY, 3, 3);

    // 5. THE GREAT PLAZA CLEARING (Expanded!)
    // We clear a massive 12x12 area around the center, skipping only the tiny temple core.
    for (let y = centerTileY - 6; y <= centerTileY + 6; y++) {
        for (let x = centerTileX - 6; x <= centerTileX + 6; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                // PRESERVE TEMPLE CORE (Only the very middle 3x3 box)
                if (x >= templeX && x < templeX + 3 && y >= templeY && y < templeY + 3) {
                    continue;
                }

                // SAFEGUARD: Don't erase the Town Walls (Outer Rim)
                // In our coords, startX and endX are the walls.
                if (x > startX && x < endX && y > startY && y < endY) {
                    data[y * width + x] = FLOOR_ID; // FORCE FLOOR
                }
            }
        }
    }

    // Spawn Player in Center
    entities.push({ type: 'player', x: centerX, y: centerY });

    // Main Town Temple (Default Spawn Point)
    entities.push({
        type: 'temple',
        x: centerX + 64,
        y: centerY - 64,
        name: 'Main Temple',
        isDefault: true
    });

    // --- CARDINAL PATHS FROM TOWN ---
    // Carve 3-tile wide paths in all 4 directions to ensure navigability
    const pathWidth = 2;
    const pathLength = 80; // tiles from town edge

    // North Path
    for (let i = townRadius + 1; i < townRadius + pathLength; i++) {
        for (let pw = -pathWidth; pw <= pathWidth; pw++) {
            const tx = centerTileX + pw;
            const ty = centerTileY - i;
            if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                data[ty * width + tx] = 16; // Clear to grass
            }
        }
    }
    // South Path
    for (let i = townRadius + 1; i < townRadius + pathLength; i++) {
        for (let pw = -pathWidth; pw <= pathWidth; pw++) {
            const tx = centerTileX + pw;
            const ty = centerTileY + i;
            if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                data[ty * width + tx] = 16;
            }
        }
    }
    // East Path
    for (let i = townRadius + 1; i < townRadius + pathLength; i++) {
        for (let pw = -pathWidth; pw <= pathWidth; pw++) {
            const tx = centerTileX + i;
            const ty = centerTileY + pw;
            if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                data[ty * width + tx] = 16;
            }
        }
    }
    // West Path
    for (let i = townRadius + 1; i < townRadius + pathLength; i++) {
        for (let pw = -pathWidth; pw <= pathWidth; pw++) {
            const tx = centerTileX - i;
            const ty = centerTileY + pw;
            if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                data[ty * width + tx] = 16;
            }
        }
    }

    // --- FOREST GENERATION (Ring around town) ---
    // Min Radius: Town Radius + 2 (12 tiles) - Closer to town
    // Max Radius: 120 tiles (Cover effectively whole map since width/2 = 128)
    const forestMinFn = 12;
    const forestMaxFn = 120;

    let treeCount = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - Math.floor(centerX / 32);
            const dy = y - Math.floor(centerY / 32);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > forestMinFn && dist < forestMaxFn) {
                if (dist > 50) {
                    // --- DEEP FOREST ZONE ---
                    // Denser trees, pine trees
                    if (rng.next() < 0.6) {
                        if (data[y * width + x] === 16) {
                            data[y * width + x] = 37; // PINE TREE (Darker)
                            treeCount++;
                        }
                    }

                    // Enemies: Bear, Spider, Bandit
                    if (data[y * width + x] === 16) {
                        const roll = rng.next();

                        // Bear (Tanky)
                        if (roll < 0.005) {
                            entities.push({ type: 'enemy', x: x * 32, y: y * 32, enemyType: 'bear', difficulty: 2.0 });
                        }
                        // Spider (Fast, Poison)
                        else if (roll < 0.01) {
                            entities.push({ type: 'enemy', x: x * 32, y: y * 32, enemyType: 'spider', difficulty: 1.5 });
                        }
                        // Bandit (Ranged/Smart)
                        else if (roll < 0.015) {
                            entities.push({ type: 'enemy', x: x * 32, y: y * 32, enemyType: 'bandit', difficulty: 1.8 });
                        }

                        // Clear small area for them
                        if (roll < 0.015) {
                            for (let cy = -1; cy <= 1; cy++) {
                                for (let cx = -1; cx <= 1; cx++) {
                                    const tx = x + cx, ty = y + cy;
                                    if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                                        if (data[ty * width + tx] === 37) data[ty * width + tx] = 16;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // --- LIGHT FOREST ZONE ---
                    // Reduced chance of trees (40% for more clearings)
                    if (rng.next() < 0.4) {
                        // Don't overwrite walls or water easily, but let's just force wood for density
                        if (data[y * width + x] === 16) { // If grass
                            data[y * width + x] = 34; // TREE (Collision + Visual)
                            treeCount++;
                        }
                    }

                    // Spawn Wolves with clearing
                    if (rng.next() < 0.008 && data[y * width + x] === 16) { // Slightly more wolves
                        entities.push({ type: 'enemy', x: x * 32, y: y * 32, enemyType: 'wolf', difficulty: 0.8 });
                        // Create 3x3 clearing around enemy
                        for (let cy = -1; cy <= 1; cy++) {
                            for (let cx = -1; cx <= 1; cx++) {
                                const tx = x + cx, ty = y + cy;
                                if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                                    if (data[ty * width + tx] === 34) data[ty * width + tx] = 16; // Remove tree
                                }
                            }
                        }
                    }

                    // Spawn Orcs (further from town)
                    if (dist > 25 && rng.next() < 0.004 && data[y * width + x] === 16) {
                        entities.push({ type: 'enemy', x: x * 32, y: y * 32, enemyType: 'orc', difficulty: 1.0 });
                        // Create clearing
                        for (let cy = -1; cy <= 1; cy++) {
                            for (let cx = -1; cx <= 1; cx++) {
                                const tx = x + cx, ty = y + cy;
                                if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                                    if (data[ty * width + tx] === 34) data[ty * width + tx] = 16;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    console.log(`[MapGen] Generated ${treeCount} trees in the Forest.`);

    // --- DESERT ZONE (East side of map) ---
    // Desert occupies the eastern edge of the map (x > 180)
    const desertStartX = 180;
    const SAND_TILE = 56;
    const CACTUS_TILE = 57;

    for (let y = 20; y < height - 20; y++) {
        for (let x = desertStartX; x < width - 1; x++) {
            // Check if not too close to center (town area)
            const dx = x - centerTileX;
            const dy = y - centerTileY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > townRadius + 5) {
                // Replace grass/trees with sand
                if (data[y * width + x] === 16 || data[y * width + x] === 34 || data[y * width + x] === 37) {
                    data[y * width + x] = SAND_TILE;

                    // Spawn cacti (obstacles)
                    if (rng.next() < 0.03) {
                        data[y * width + x] = CACTUS_TILE;
                    }

                    // Spawn desert enemies
                    const enemyRoll = rng.next();
                    if (enemyRoll < 0.004) {
                        // Scorpion (common)
                        entities.push({ type: 'enemy', x: x * 32, y: y * 32, enemyType: 'scorpion', difficulty: 1.2 });
                    } else if (enemyRoll < 0.006) {
                        // Mummy (rare, stronger)
                        entities.push({ type: 'enemy', x: x * 32, y: y * 32, enemyType: 'mummy', difficulty: 1.5 });
                    } else if (enemyRoll < 0.010) {
                        // Scarab swarm (common, weak)
                        entities.push({ type: 'enemy', x: x * 32, y: y * 32, enemyType: 'scarab', difficulty: 0.8 });
                        // Spawn a few more nearby for swarm effect
                        if (x + 1 < width) entities.push({ type: 'enemy', x: (x + 1) * 32, y: y * 32, enemyType: 'scarab', difficulty: 0.8 });
                        if (y + 1 < height) entities.push({ type: 'enemy', x: x * 32, y: (y + 1) * 32, enemyType: 'scarab', difficulty: 0.8 });
                    }
                }
            }
        }
    }
    console.log(`[MapGen] Generated desert zone (x > ${desertStartX}).`);

    // Helper: Generate House
    const generateHouse = (bx: number, by: number, w: number, h: number) => {
        const WALL_ID = 100;
        const FLOOR_ID = 101;

        const tx = Math.floor(bx / 32);
        const ty = Math.floor(by / 32);
        for (let y = ty; y < ty + h; y++) {
            for (let x = tx; x < tx + w; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    // Floor Logic
                    data[y * width + x] = FLOOR_ID;

                    // Wall Logic (Perimeter)
                    if (x === tx || x === tx + w - 1 || y === ty || y === ty + h - 1) {
                        data[y * width + x] = WALL_ID;
                    }
                }
            }
        }
        // Door (Bottom Center)
        const doorX = tx + Math.floor(w / 2);
        const doorY = ty + h - 1;
        if (doorX >= 0 && doorX < width && doorY >= 0 && doorY < height) {
            data[doorY * width + doorX] = FLOOR_ID;
        }
    };

    // Spawn Merchant House (East of Center)
    generateHouse(centerX + 64, centerY - 32, 5, 5);
    entities.push({ type: 'merchant', x: centerX + 64 + 64, y: centerY + 32 });

    // Spawn NPC House (West of Center)
    generateHouse(centerX - 192, centerY - 32, 5, 5);
    entities.push({ type: 'npc', x: centerX - 128, y: centerY + 32, text: "Beware the deep woods..." });

    // Ambient Town NPCs - Make the village feel alive!
    // --- Manual NPC Placement ---

    // 1. Town Guards (Sprite 5) - Placing them at the 4 cardinal gates
    const gateDist = (townRadius * 32) - 32; // Just inside the wall
    entities.push({ type: 'npc', x: centerX, y: centerY - gateDist, text: "Keep an eye on the forest line.", name: "North Guard", sprite: 5 });
    entities.push({ type: 'npc', x: centerX, y: centerY + gateDist, text: "Orcs have been spotted south.", name: "South Guard", sprite: 5 });
    entities.push({ type: 'npc', x: centerX - gateDist, y: centerY, text: "The woods are deep and dark.", name: "West Guard", sprite: 5 });
    entities.push({ type: 'npc', x: centerX + gateDist, y: centerY, text: "Watch your step traveller.", name: "East Guard", sprite: 5 });

    // 2. Ambient Villagers (Sprite 3) - Placing them near houses and center
    // Near Merchant House (East)
    entities.push({ type: 'npc', x: centerX + 128, y: centerY + 128, text: "The merchant has new stock today.", name: "Shopper", sprite: 3 });
    // Near Residential House (West)
    entities.push({ type: 'npc', x: centerX - 128, y: centerY + 128, text: "My husband is out hunting wolves.", name: "Villager", sprite: 3 });
    // Town Center / Well area
    entities.push({ type: 'npc', x: centerX - 32, y: centerY - 64, text: "Beautiful day, isn't it?", name: "Old Man", sprite: 3 });
    entities.push({ type: 'npc', x: centerX + 32, y: centerY + 32, text: "I wish I could cast spells...", name: "Boy", sprite: 3 });


    // Quest NPCs
    // Hunter NPC - Wolf quest
    entities.push({
        type: 'quest_npc',
        x: centerX + 32,
        y: centerY + 64,
        name: "Hunter Gorn",
        sprite: 4, // HUNTER sprite
        quests: [
            {
                id: "wolf_menace",
                name: "Wolf Menace",
                description: "Kill 5 wolves that threaten our village.",
                type: "kill",
                target: "Wolf",
                required: 5,
                current: 0,
                reward: { gold: 50, xp: 100 },
                completed: false,
                turnedIn: false
            }
        ]
    });

    // Guard NPC - Orc quest
    entities.push({
        type: 'quest_npc',
        x: centerX - 32,
        y: centerY + 64,
        name: "Guard Captain",
        sprite: 5, // GUARD sprite
        quests: [
            {
                id: "orc_patrol",
                name: "Orc Patrol",
                description: "Kill 3 orcs scouts in the deep forest.",
                type: "kill",
                target: "Orc",
                required: 3,
                current: 0,
                reward: { gold: 100, xp: 200 },
                completed: false,
                turnedIn: false
            }
        ]
    });

    // Priest NPC - Crypt quest (near Mausoleum)
    entities.push({
        type: 'quest_npc',
        x: centerX,
        y: centerY + 96,
        name: "Father Marcus",
        sprite: 6, // PRIEST sprite
        quests: [
            {
                id: "crypt_cleansing",
                name: "Crypt Cleansing",
                description: "Descend into the Crypt and destroy 10 Skeletons.",
                type: "kill",
                target: "Skeleton",
                required: 10,
                current: 0,
                reward: { gold: 150, xp: 300 },
                completed: false,
                turnedIn: false
            }
        ]
    });

    // Sealed Gate (Final Boss Entrance)
    // Located North of Village
    entities.push({
        type: 'sealed_gate',
        x: centerX,
        y: centerY - 80 * 32
    });
    // Add some decorative pillars around it?
    entities.push({ type: 'static', x: centerX - 40, y: centerY - 80 * 32 + 20, sprite: 21, size: 32 }); // Pillar
    entities.push({ type: 'static', x: centerX + 40, y: centerY - 80 * 32 + 20, sprite: 21, size: 32 }); // Pillar


    // Spawn Boss (Orc Warlord) Camp
    // Place far from center
    const bossDist = 20 * 32;
    let bx = centerX;
    let by = centerY - bossDist;
    // Ensure bounds
    if (by < 64) by = 64;

    // Clear area for "Camp"
    const campRadius = 6;
    const tileBX = Math.floor(bx / 32);
    const tileBY = Math.floor(by / 32);
    for (let y = tileBY - campRadius; y <= tileBY + campRadius; y++) {
        for (let x = tileBX - campRadius; x <= tileBX + campRadius; x++) {
            if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                data[y * width + x] = 19; // Wood floor
                // Wall ring
                if (Math.abs(x - tileBX) === campRadius || Math.abs(y - tileBY) === campRadius) {
                    if (y !== tileBY + campRadius) { // Leave entrance at bottom
                        data[y * width + x] = 17; // Wall
                    }
                }
            }
        }
    }

    entities.push({ type: 'boss', x: bx, y: by });
    entities.push({ type: 'enemy', x: bx - 64, y: by + 64, enemyType: 'orc' });
    entities.push({ type: 'enemy', x: bx + 64, y: by + 64, enemyType: 'orc' });

    // --- CRYPT GENERATION (Multi-Level) ---
    const levels = 6;

    // Place dungeons in far bottom-right corner of map (hidden from normal view)
    // This keeps them invisible when player is in the overworld
    // Map is 256x256, so place dungeons starting at y=200, x=180

    const levelConfigs = [
        { ox: 180, oy: 200, w: 30, h: 30, density: 15, mobs: ['ghost', 'slime'] },
        { ox: 215, oy: 200, w: 30, h: 30, density: 20, mobs: ['ghost', 'skeleton'] },
        { ox: 180, oy: 235, w: 30, h: 25, density: 25, mobs: ['skeleton', 'zombie'] },
        { ox: 215, oy: 235, w: 30, h: 25, density: 30, mobs: ['skeleton', 'zombie', 'ghost'] },
        { ox: 180, oy: 180, w: 30, h: 15, density: 35, mobs: ['skeleton', 'ghost'] }, // Hard
        { ox: 215, oy: 180, w: 20, h: 15, density: 5, mobs: ['skeleton'] } // Boss Room (Small, focused)
    ];

    // Village Entrance -> Level 1
    const l1OriginX = levelConfigs[0].ox;
    const l1OriginY = levelConfigs[0].oy;

    // Move Crypt Deep South
    const villageStairsX = centerX;
    const villageStairsY = centerY + (85 * 32); // 85 tiles south (Very far in 256x256 map)

    // Carve Path from Town to Crypt
    const startTileY = Math.floor((centerY + 10 * 32) / 32); // Town Edge
    const endTileY = Math.floor(villageStairsY / 32);
    const pathX = Math.floor(centerX / 32);

    for (let y = startTileY; y <= endTileY; y++) {
        // Main Path
        data[y * width + pathX] = 23; // Stone Floor (Path)
        data[y * width + pathX - 1] = 23; // Widen path
        // Clear trees ONLY directly adjacent (Width 4 total clearing: Path 2 + Border 2)
        // Previous was clearing +2 and -3. Let's keep it tight.
        if (data[y * width + pathX + 1] === 34) data[y * width + pathX + 1] = 16;
        if (data[y * width + pathX - 2] === 34) data[y * width + pathX - 2] = 16;

        // Force Trees on the edge of the path to GUARANTEE visual forest
        // Left side
        if (rng.next() < 0.8) data[y * width + pathX - 3] = 34;
        if (rng.next() < 0.5) data[y * width + pathX - 4] = 34;
        // Right side
        if (rng.next() < 0.8) data[y * width + pathX + 2] = 34;
        if (rng.next() < 0.5) data[y * width + pathX + 3] = 34;
    }

    // --- MAUSOLEUM GENERATION ---
    // A stone structure around the entrance
    const mRadius = 4;
    const mx = Math.floor(villageStairsX / 32);
    const my = Math.floor(villageStairsY / 32);

    for (let y = my - mRadius; y <= my + mRadius; y++) {
        for (let x = mx - mRadius; x <= mx + mRadius; x++) {
            // Floor
            data[y * width + x] = 23; // Stone

            // Columns / Walls (Perimeter)
            if (Math.abs(x - mx) === mRadius || Math.abs(y - my) === mRadius) {
                // Leave entrance gap on north side (y === my - mRadius, x near center)
                if (y === my - mRadius && Math.abs(x - mx) <= 1) {
                    // Entrance - keep as stone floor
                    data[y * width + x] = 23;
                } else {
                    // Use Wall (17) for tall height
                    data[y * width + x] = 17; // Wall with height
                }
            }
        }
    }

    // Spawn Zombies around Mausoleum
    for (let i = 0; i < 8; i++) {
        // Random spot near Crypt
        const ox = (Math.random() * 10 - 5) * 32;
        const oy = (Math.random() * 10 - 5) * 32;
        entities.push({ type: 'enemy', x: villageStairsX + ox, y: villageStairsY + oy, enemyType: 'zombie', difficulty: 0.5 });
    }

    entities.push({
        type: 'teleporter', x: villageStairsX, y: villageStairsY,
        targetX: (l1OriginX + 2) * 32, targetY: (l1OriginY + 2) * 32 + 48
    });
    entities.push({ type: 'teleporter', x: (l1OriginX + 2) * 32, y: (l1OriginY + 2) * 32, targetX: villageStairsX, targetY: villageStairsY + 48 });

    data[Math.floor(villageStairsY / 32) * width + Math.floor(villageStairsX / 32)] = 20; // Stairs Tile

    for (let i = 0; i < levels; i++) {
        const cfg = levelConfigs[i];
        const ox = cfg.ox;
        const oy = cfg.oy;

        // Build Room
        for (let y = oy; y < oy + cfg.h; y++) {
            for (let x = ox; x < ox + cfg.w; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    // Floor Tile based on Level
                    data[y * width + x] = 23 + i;

                    // Walls
                    if (x === ox || x === ox + cfg.w - 1 || y === oy || y === oy + cfg.h - 1) {
                        data[y * width + x] = 17;
                    }
                    // Pillars / Decorations
                    else if (x % 6 === 0 && y % 6 === 0) {
                        data[y * width + x] = 17;
                        // Add Wall Torch
                        entities.push({ type: 'torch', x: x * 32, y: y * 32 });
                    } else if (i > 0 && rng.next() < 0.05) {
                        data[y * width + x] = 21; // Web 
                    } else if (i > 0 && rng.next() < 0.05) {
                        data[y * width + x] = 22; // Bones 
                    }
                }
            }
        }

        // Connect Levels (Down)
        if (i < levels - 1) {
            const nextCfg = levelConfigs[i + 1];
            // Stairs Down (Bottom Right of current) -> Stairs Up (Top Left of next)
            const downX = (ox + cfg.w - 3) * 32;
            const downY = (oy + cfg.h - 3) * 32;

            const upX = (nextCfg.ox + 2) * 32;
            const upY = (nextCfg.oy + 2) * 32;

            entities.push({ type: 'teleporter', x: downX, y: downY, targetX: upX, targetY: upY + 48 });
            entities.push({ type: 'teleporter', x: upX, y: upY, targetX: downX, targetY: downY - 48 });

            // Mark stairs visually
            // Int conversion might be tricky if not aligned but strict ox/oy is integer coords.
            data[Math.floor(downY / 32) * width + Math.floor(downX / 32)] = 20;
        }

        // Enemies / Bosses
        if (i === levels - 1) {
            // BOSS ROOM - Spawn Necromancer
            entities.push({ type: 'enemy', x: (ox + cfg.w / 2) * 32, y: (oy + cfg.h / 2) * 32, enemyType: 'necromancer', difficulty: 2.0 });
            // Add some elite guards
            entities.push({ type: 'enemy', x: (ox + cfg.w / 2 - 2) * 32, y: (oy + cfg.h / 2 + 2) * 32, enemyType: 'skeleton', difficulty: 1.5 });
            entities.push({ type: 'enemy', x: (ox + cfg.w / 2 + 2) * 32, y: (oy + cfg.h / 2 + 2) * 32, enemyType: 'skeleton', difficulty: 1.5 });
        } else if (i === 2) {
            // MINI-BOSS: Crypt Keeper (Level 3)
            entities.push({ type: 'enemy', x: (ox + cfg.w / 2) * 32, y: (oy + cfg.h / 2) * 32, enemyType: 'crypt_keeper', difficulty: 1.5 });
        }

        // Mobs
        for (let m = 0; m < cfg.density; m++) {
            const mx = (ox + 2 + Math.floor(rng.next() * (cfg.w - 4))) * 32;
            const my = (oy + 2 + Math.floor(rng.next() * (cfg.h - 4))) * 32;
            const type = cfg.mobs[Math.floor(rng.next() * cfg.mobs.length)];
            const diff = 1.0 + (i * 0.5);
            entities.push({ type: 'enemy', x: mx, y: my, enemyType: type, difficulty: diff });
        }
    }

    // Spawn Sealed Gate (Near Spawn)
    // Assume spawn is at center or determined by caller, but we return entities relative to map.
    // If player spawns at centerX, centerY, put gate slightly north.
    const gateX = Math.floor(width / 2);
    const gateY = Math.floor(height / 2) - 6; // 6 tiles north
    entities.push({ type: 'sealed_gate', x: gateX * 32, y: gateY * 32 });

    return {
        width,
        height,
        tileSize: 32,
        data,
        entities
    };
}


export function generateDungeon(width: number, height: number, seed: number, type: 'fire' | 'ice' | 'water' | 'earth' | 'temple' | 'final'): { width: number, height: number, tileSize: number, data: number[], entities: any[] } {
    const rng = new RNG(seed);
    const data = new Array(width * height).fill(17); // Fill with Wall default
    const entities: any[] = [];

    // CELLULAR AUTOMATA SETTINGS
    const iterations = 5;
    const wallChance = 0.45;

    // 1. Random Noise
    for (let i = 0; i < width * height; i++) {
        data[i] = rng.next() < wallChance ? 1 : 0; // 1 = Wall, 0 = Floor (temp)
    }

    // Border Walls
    for (let x = 0; x < width; x++) {
        data[x] = 1; data[(height - 1) * width + x] = 1;
    }
    for (let y = 0; y < height; y++) {
        data[y * width] = 1; data[y * width + (width - 1)] = 1;
    }

    // 2. Smoothing
    for (let i = 0; i < iterations; i++) {
        const newData = [...data];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let neighbors = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        if (data[(y + dy) * width + (x + dx)] === 1) neighbors++;
                    }
                }
                if (neighbors > 4) newData[y * width + x] = 1;
                else if (neighbors < 4) newData[y * width + x] = 0;
            }
        }
        data.splice(0, data.length, ...newData);
    }

    // 3. Tile Mapping & Theming
    const FIRE_WALL = 98;
    const LAVA = 97;
    const FLOOR_FIRE = 56;

    const ICE_WALL = 100;
    const ICE_FLOOR = 81; // Snow/Ice ground
    const ICE_SPIKES = 102;
    const WALL = 17;
    const FLOOR_STONE = 23;

    // Water Temple
    const WATER_WALL = 103;
    const WATER_CRYSTAL = 104;
    const WATER_FLOOR = 108; // Deep water puddles

    // Earth Dungeon
    const EARTH_WALL = 109;
    const EARTH_CRYSTAL = 110;
    const GOLEM = 111;
    const BASILISK = 112;

    let wallTile = WALL;
    let floorTile = FLOOR_STONE;

    if (type === 'fire') {
        wallTile = FIRE_WALL;
        floorTile = FLOOR_FIRE;
    } else if (type === 'ice') {
        wallTile = ICE_WALL;
        floorTile = ICE_FLOOR;
    } else if (type === 'water') {
        wallTile = WATER_WALL;
        floorTile = FLOOR_STONE;
    } else if (type === 'earth') {
        wallTile = EARTH_WALL;
        floorTile = FLOOR_STONE; // Cave floor
    }

    // Apply Tiles
    for (let i = 0; i < width * height; i++) {
        if (data[i] === 1) data[i] = wallTile;
        else data[i] = floorTile;
    }

    // 4. Decoration & Content
    if (type === 'fire') {
        // Lava Pools
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                if (data[y * width + x] === floorTile) {
                    let openSpace = true;
                    for (let dy = -2; dy <= 2; dy++) {
                        for (let dx = -2; dx <= 2; dx++) {
                            if (data[(y + dy) * width + (x + dx)] !== floorTile) openSpace = false;
                        }
                    }
                    if (openSpace && rng.next() < 0.2) {
                        data[y * width + x] = LAVA;
                    }
                }
            }
        }
    } else if (type === 'ice') {
        // Ice Spikes (Traps)
        for (let i = 0; i < 30; i++) {
            const rx = rng.nextInt(width);
            const ry = rng.nextInt(height);
            if (data[ry * width + rx] === floorTile) {
                entities.push({ type: 'static', x: rx * 32, y: ry * 32, sprite: ICE_SPIKES, size: 32 });
            }
        }
    } else if (type === 'water') {
        // Water Pools (Deep Water)
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                if (data[y * width + x] === floorTile) {
                    let openSpace = true;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (data[(y + dy) * width + (x + dx)] !== floorTile) openSpace = false;
                        }
                    }
                    if (openSpace && rng.next() < 0.15) {
                        data[y * width + x] = WATER_FLOOR;
                    }
                }
            }
        }
    } else if (type === 'earth') {
        // Earth Dungeon: Random Rock pillars
        for (let i = 0; i < 40; i++) {
            const rx = rng.nextInt(width);
            const ry = rng.nextInt(height);
            if (data[ry * width + rx] === floorTile) {
                // Use ROCK_SMALL (66) or just wallTile?
                // Let's use wall tile for robust blocking
                data[ry * width + rx] = wallTile;
            }
        }
    }

    // 5. Find Spawn & Exit
    let spawnX = width / 2, spawnY = height / 2;
    for (let y = 10; y < height - 10; y++) {
        for (let x = 10; x < width - 10; x++) {
            if (data[y * width + x] === floorTile) {
                spawnX = x;
                spawnY = y;
                break;
            }
        }
    }

    // Find Boss/Artifact Room
    let endX = spawnX, endY = spawnY;
    let maxDist = 0;
    for (let y = 5; y < height - 5; y++) {
        for (let x = 5; x < width - 5; x++) {
            if (data[y * width + x] === floorTile) {
                const d = Math.sqrt((x - spawnX) ** 2 + (y - spawnY) ** 2);
                if (d > maxDist) {
                    maxDist = d;
                    endX = x;
                    endY = y;
                }
            }
        }
    }

    entities.push({ type: 'player', x: spawnX * 32, y: spawnY * 32 });
    entities.push({
        type: 'dungeon_exit',
        x: spawnX * 32,
        y: spawnY * 32 - 32,
        label: 'Exit Dungeon'
    });

    if (type === 'fire') {
        entities.push({ type: 'static', x: endX * 32, y: endY * 32, sprite: 99, size: 32 });
        entities.push({ type: 'item', x: endX * 32, y: (endY + 1) * 32, name: 'Fire Essence', slot: 'ring', uIndex: 99, damage: 0 });
        entities.push({ type: 'fire_enemy', x: endX * 32, y: endY * 32, enemyType: 'fire_guardian', difficulty: 1.5 });
    } else if (type === 'ice') {
        entities.push({ type: 'static', x: endX * 32, y: endY * 32, sprite: 101, size: 32 }); // Ice Crystal
        entities.push({ type: 'item', x: endX * 32, y: (endY + 1) * 32, name: 'Ice Essence', slot: 'ring', uIndex: 101, damage: 0 });
        // Ice Boss (Yeti)
        entities.push({ type: 'ice_enemy', x: endX * 32, y: endY * 32, enemyType: 'yeti', difficulty: 1.5 });
    } else if (type === 'water') {
        entities.push({ type: 'static', x: endX * 32, y: endY * 32, sprite: WATER_CRYSTAL, size: 32 });
        entities.push({ type: 'item', x: endX * 32, y: (endY + 1) * 32, name: 'Water Essence', slot: 'ring', uIndex: WATER_CRYSTAL, damage: 0 });
        // Hydra Boss
        entities.push({ type: 'water_enemy', x: endX * 32, y: endY * 32, enemyType: 'hydra' });
    } else if (type === 'earth') {
        entities.push({ type: 'static', x: endX * 32, y: endY * 32, sprite: 110, size: 32 }); // Earth Crystal
        entities.push({ type: 'item', x: endX * 32, y: (endY + 1) * 32, name: 'Earth Essence', slot: 'ring', uIndex: 110, damage: 0 });
        // Golem Boss (Reusing Golem sprite but tougher)
        // Or just spawn multiple golems?
        // Let's spawn a "Basilisk Prime"
        entities.push({ type: 'earth_enemy', x: endX * 32, y: endY * 32, enemyType: 'golem', difficulty: 2.5 });
    } else if (type === 'final') {
        // Clear center for Boss Arena
        const cx = Math.floor(width / 2);
        const cy = Math.floor(height / 2);

        // Simple Square Arena
        for (let y = 10; y < height - 10; y++) {
            for (let x = 10; x < width - 10; x++) {
                data[y * width + x] = 20; // Floor
            }
        }

        // Spawn Final Boss
        entities.push({ type: 'final_boss', x: cx * 32, y: cy * 32 });
        // No exit? Or win condition triggers credits.
        // But let's add an exit just in case
        entities.push({ type: 'dungeon_exit', x: cx * 32, y: (cy + 10) * 32, label: 'Flee' });
    }

    // Spawn Mobs
    const mobCount = 30 + rng.nextInt(20);
    const mobTypes = type === 'fire' ? ['scorpion', 'mummy', 'spider'] :
        type === 'ice' ? ['ice_wolf', 'frost_mage', 'yeti'] :
            type === 'water' ? ['crab', 'siren'] :
                ['golem', 'basilisk']; // Earth types

    for (let i = 0; i < mobCount; i++) {
        let mx, my, attempts = 0;
        do {
            mx = rng.nextInt(width);
            my = rng.nextInt(height);
            attempts++;
        } while (data[my * width + mx] !== floorTile && attempts < 50);

        if (data[my * width + mx] === floorTile) {
            // Don't spawn too close to start
            if (Math.abs(mx - spawnX) > 10 || Math.abs(my - spawnY) > 10) {
                const mType = mobTypes[rng.nextInt(mobTypes.length)];
                if (type === 'ice') {
                    entities.push({ type: 'ice_enemy', x: mx * 32, y: my * 32, enemyType: mType, difficulty: 1.2 });
                } else if (type === 'water') {
                    entities.push({ type: 'water_enemy', x: mx * 32, y: my * 32, enemyType: mType, difficulty: 1.1 });
                } else if (type === 'earth') {
                    entities.push({ type: 'earth_enemy', x: mx * 32, y: my * 32, enemyType: mType, difficulty: 1.2 });
                } else if (type === 'fire') {
                    entities.push({ type: 'fire_enemy', x: mx * 32, y: my * 32, enemyType: mType, difficulty: 1.2 });
                } else {
                    entities.push({ type: 'enemy', x: mx * 32, y: my * 32, enemyType: mType, difficulty: 1.2 });
                }
            }
        }
    }

    console.log(`[MapGen] Generated ${type} dungeon via CA.`);

    return {
        width,
        height,
        tileSize: 32,
        data,
        entities
    };
}
