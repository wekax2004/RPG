import { WorldMap3D, GROUND_FLOOR } from './core/world_map_3d';
import { Tile, Item } from './core/types';
import { SPRITES, EDRON_ASSETS } from './constants';
import { TERRAIN, generateHeightMap } from './core/noise';

const WALL_SETS = EDRON_ASSETS.WALLS;

/**
 * Calculates which wall sprite to use based on neighbors.
 */
function getWallSprite(wallIndices: Set<number>, x: number, y: number, width: number, height: number): number {
    let mask = 0;
    if (y > 0 && wallIndices.has((y - 1) * width + x)) mask |= 1;
    if (x < width - 1 && wallIndices.has(y * width + (x + 1))) mask |= 2;
    if (y < height - 1 && wallIndices.has((y + 1) * width + x)) mask |= 4;
    if (x > 0 && wallIndices.has(y * width + (x - 1))) mask |= 8;

    switch (mask) {
        case 5: return WALL_SETS.VERTICAL;
        case 10: return WALL_SETS.HORIZONTAL;
        case 9: return WALL_SETS.CORNER_TL;
        case 3: return WALL_SETS.CORNER_TR;
        case 12: return WALL_SETS.CORNER_BL;
        case 6: return WALL_SETS.CORNER_BR;
        case 1: case 4: return WALL_SETS.VERTICAL;
        case 2: case 8: return WALL_SETS.HORIZONTAL;
        default: return WALL_SETS.PILLAR;
    }
}

export function placeEdronCity(map: WorldMap3D, startX: number, startY: number, cityWidth: number, cityHeight: number, z: number = GROUND_FLOOR) {
    const wallIndices = new Set<number>();
    const centerX = startX + Math.floor(cityWidth / 2);
    const centerY = startY + Math.floor(cityHeight / 2);

    const isMainRoad = (x: number, y: number) => {
        return Math.abs(x - centerX) < 2 || Math.abs(y - centerY) < 2;
    };

    for (let y = startY; y < startY + cityHeight; y++) {
        for (let x = startX; x < startX + cityWidth; x++) {
            const tile = map.getTile(x, y, z);
            if (!tile) continue;

            const isWater = tile.baseId === SPRITES.WATER || tile.baseId === TERRAIN.DEEP_WATER || tile.baseId === TERRAIN.SHALLOW_WATER;
            let groundId = 0;

            if (isWater) {
                if (isMainRoad(x, y)) {
                    groundId = 5770;
                } else {
                    continue;
                }
            } else {
                groundId = SPRITES.GRASS;
                if (isMainRoad(x, y)) {
                    groundId = EDRON_ASSETS.FLOORS.COBBLESTONE;
                }
                const plazaSize = 15;
                const plazaHalf = Math.floor(plazaSize / 2);
                if (x > centerX - plazaHalf && x < centerX + plazaHalf &&
                    y > centerY - plazaHalf && y < centerY + plazaHalf) {
                    groundId = EDRON_ASSETS.FLOORS.PAVEMENT_LIGHT;
                }
                if (groundId === SPRITES.GRASS && Math.random() < 0.05) {
                    groundId = SPRITES.DIRT;
                }
            }

            if (groundId !== 0) {
                tile.baseId = groundId;
            }
        }
    }

    const addBuilding = (bx: number, by: number, bw: number, bh: number, floorId: number, isSolid: boolean = false) => {
        const hasRoof = bw >= 4 && bh >= 4;
        const roofInset = 1;

        for (let y = by; y < by + bh; y++) {
            for (let x = bx; x < bx + bw; x++) {
                const idx = y * map.width + x;
                const tile = map.getTile(x, y, z);
                if (!tile) continue;

                const isNorth = y === by;
                const isSouth = y === by + bh - 1;
                const isWest = x === bx;
                const isEast = x === bx + bw - 1;

                if (isNorth || isWest || isEast) {
                    wallIndices.add(idx);
                } else if (isSouth) {
                    tile.baseId = floorId;
                } else {
                    const isInsideRoof = hasRoof &&
                        x >= bx + roofInset && x < bx + bw - roofInset &&
                        y >= by + roofInset && y < by + bh - roofInset;

                    tile.baseId = (isSolid || isInsideRoof) ? 0 : floorId;
                }
            }
        }
    };

    // === CASTLE BUILDER ===

    // Helper to draw walls using new edron_v2 sprites (6000-6003)
    const drawWall = (x: number, y: number, wallType: number) => {
        const tile = map.getTile(x, y, z);
        if (tile) {
            wallIndices.add(y * map.width + x);
            tile.addItem(new Item(wallType));
        }
    };

    // === 1. OUTER FORTRESS WALLS ===
    // North & South walls
    for (let x = startX; x < startX + cityWidth; x++) {
        drawWall(x, startY, EDRON_ASSETS.WALLS.HORIZONTAL);
        drawWall(x, startY + cityHeight - 1, EDRON_ASSETS.WALLS.HORIZONTAL);
    }
    // East & West walls
    for (let y = startY; y < startY + cityHeight; y++) {
        drawWall(startX, y, EDRON_ASSETS.WALLS.VERTICAL);
        drawWall(startX + cityWidth - 1, y, EDRON_ASSETS.WALLS.VERTICAL);
    }

    // === 2. FOUR CORNER TOWERS (5x5 each) ===
    const buildTower = (tx: number, ty: number) => {
        for (let x = tx; x < tx + 5; x++) {
            for (let y = ty; y < ty + 5; y++) {
                const tile = map.getTile(x, y, z);
                if (!tile) continue;
                tile.baseId = EDRON_ASSETS.FLOORS.PAVEMENT_LIGHT; // Tower floor
                // Tower walls
                if (x === tx || x === tx + 4) drawWall(x, y, EDRON_ASSETS.WALLS.VERTICAL);
                if (y === ty || y === ty + 4) drawWall(x, y, EDRON_ASSETS.WALLS.HORIZONTAL);
            }
        }
        // Pillar in corner
        const cornerTile = map.getTile(tx, ty, z);
        if (cornerTile) {
            cornerTile.items = [];
            cornerTile.addItem(new Item(EDRON_ASSETS.WALLS.PILLAR)); // Pillar
        }
    };

    buildTower(startX - 2, startY - 2);                           // Top-Left
    buildTower(startX + cityWidth - 3, startY - 2);               // Top-Right
    buildTower(startX - 2, startY + cityHeight - 3);              // Bottom-Left
    buildTower(startX + cityWidth - 3, startY + cityHeight - 3);  // Bottom-Right

    // === 2b. CUSTOMIZE TOP-RIGHT TOWER (MAGIC SHOP) ===
    const shopTx = startX + cityWidth - 3;
    const shopTy = startY - 2;
    // 1. Wood Floor
    for (let x = shopTx; x < shopTx + 5; x++) {
        for (let y = shopTy; y < shopTy + 5; y++) {
            const tile = map.getTile(x, y, z);
            if (tile && tile.baseId !== 0) tile.baseId = SPRITES.EDRON_FLOOR_WOOD;
        }
    }
    // 2. Counters (Row along North wall)
    for (let x = shopTx + 1; x < shopTx + 4; x++) {
        const tile = map.getTile(x, shopTy + 2, z); // 2 tiles down from top
        if (tile) {
            tile.items = []; // Clear other items
            tile.addItem(new Item(SPRITES.EDRON_SHOP_COUNTER));
        }
    }

    // === 3. CENTRAL KEEP (Throne Room) ===
    const keepX = centerX - 10;
    const keepY = centerY - 8;
    const keepW = 20;
    const keepH = 16;

    // Keep walls
    for (let x = keepX; x < keepX + keepW; x++) {
        drawWall(x, keepY, EDRON_ASSETS.WALLS.HORIZONTAL);
        drawWall(x, keepY + keepH - 1, EDRON_ASSETS.WALLS.HORIZONTAL);
    }
    for (let y = keepY; y < keepY + keepH; y++) {
        drawWall(keepX, y, EDRON_ASSETS.WALLS.VERTICAL);
        drawWall(keepX + keepW - 1, y, EDRON_ASSETS.WALLS.VERTICAL);
    }

    // Throne Room Floor (Pavement)
    // Throne Room Floor (Pavement)
    for (let x = keepX + 1; x < keepX + keepW - 1; x++) {
        for (let y = keepY + 1; y < keepY + keepH - 1; y++) {
            const tile = map.getTile(x, y, z);
            if (tile) {
                // Restoration: Use proper Wood Floor (1066)
                tile.baseId = SPRITES.EDRON_FLOOR_WOOD;
            }
        }
    }

    // Keep Entrance Door (middle of south wall)
    const keepDoorX = keepX + Math.floor(keepW / 2);
    const keepDoorTile = map.getTile(keepDoorX, keepY + keepH - 1, z);
    if (keepDoorTile) {
        keepDoorTile.items = [];
        keepDoorTile.addItem(new Item(6003)); // Wooden Door
    }

    // === 4. MASSIVE GATEHOUSE (5-tiles wide so you can DEFINITELY walk out) ===
    const gateX = centerX;
    const gateY = startY + cityHeight - 1;

    // Clear 5-tile wide opening - FORCE WALKABLE
    for (let dx = -2; dx <= 2; dx++) {
        const gateTile = map.getTile(gateX + dx, gateY, z);
        if (gateTile) {
            gateTile.items = [];  // Remove wall sprites
            wallIndices.delete(gateY * map.width + gateX + dx);  // Remove collision
            gateTile.baseId = EDRON_ASSETS.FLOORS.COBBLESTONE;
        }
    }

    // Pillars flanking the gate (moved further out - 3 tiles from center)
    const leftPillar = map.getTile(gateX - 3, gateY, z);
    const rightPillar = map.getTile(gateX + 3, gateY, z);
    if (leftPillar) {
        leftPillar.addItem(new Item(EDRON_ASSETS.WALLS.PILLAR));  // Pillar Left
        wallIndices.add(gateY * map.width + (gateX - 3));
    }
    if (rightPillar) {
        rightPillar.addItem(new Item(EDRON_ASSETS.WALLS.PILLAR)); // Pillar Right
        wallIndices.add(gateY * map.width + (gateX + 3));
    }

    // === 5. WIDE DIRT ROAD OUTSIDE CASTLE (5-tiles wide, all walkable) ===
    for (let y = gateY + 1; y < map.height; y++) {
        for (let dx = -2; dx <= 2; dx++) {
            const roadTile = map.getTile(gateX + dx, y, z);
            if (roadTile) {
                roadTile.baseId = 6013; // Dirt road
                roadTile.items = [];    // Clear any blocking items
                wallIndices.delete(y * map.width + (gateX + dx));  // FORCE WALKABLE
            }
        }
    }

    // === 6. LAMP-LINED ROAD (Inside - Gate to Keep) ===
    for (let y = gateY - 2; y > keepY + keepH; y -= 3) {
        const leftLamp = map.getTile(gateX - 3, y, z);
        const rightLamp = map.getTile(gateX + 3, y, z);
        if (leftLamp && !leftLamp.items.length) leftLamp.addItem(new Item(SPRITES.EDRON_LAMP));  // Edron Lamp
        if (rightLamp && !rightLamp.items.length) rightLamp.addItem(new Item(SPRITES.EDRON_LAMP)); // Edron Lamp
    }

    // === 7. LAMPS ALONG OUTSIDE ROAD ===
    for (let y = gateY + 1; y < map.height; y += 6) {
        const leftLamp = map.getTile(gateX - 2, y, z);
        const rightLamp = map.getTile(gateX + 2, y, z);
        if (leftLamp && !leftLamp.items.length) leftLamp.addItem(new Item(SPRITES.EDRON_LAMP));  // Lamp Left
        if (rightLamp && !rightLamp.items.length) rightLamp.addItem(new Item(SPRITES.EDRON_LAMP)); // Lamp Right
    }

    // === 8. COURTYARD CLUTTER ===
    // 6030=Lamp, 6031=Barrel, 6032=Crate, 6033=Flower
    const CLUTTER = [6031, 6032, 6033]; // Barrel, Crate, Flower

    // Scatter barrels and crates in the courtyard (but not on main road or in keep)
    for (let i = 0; i < 30; i++) {
        const rx = startX + 5 + Math.floor(Math.random() * (cityWidth - 10));
        const ry = startY + 5 + Math.floor(Math.random() * (cityHeight - 10));

        // Skip if on main road (near center X)
        if (Math.abs(rx - centerX) < 4) continue;
        // Skip if inside keep
        if (rx >= keepX && rx < keepX + keepW && ry >= keepY && ry < keepY + keepH) continue;

        const tile = map.getTile(rx, ry, z);
        if (tile && tile.items.length === 0 && !wallIndices.has(ry * map.width + rx)) {
            tile.addItem(new Item(CLUTTER[Math.floor(Math.random() * CLUTTER.length)]));
        }
    }

    // === 9. FOUNTAIN IN PLAZA ===
    const fTile = map.getTile(centerX, centerY, z);
    if (fTile) fTile.addItem(new Item(EDRON_ASSETS.DECOR.FOUNTAIN_WATER));
}

export function generateMountainBorders(map: WorldMap3D, startX: number, startY: number, width: number, height: number, z: number = GROUND_FLOOR) {
    const MOUNTAINS = SPRITES.MOUNTAIN_ASSETS;

    for (let x = startX - 1; x <= startX + width; x++) {
        for (let y = startY - 1; y <= startY + height; y++) {
            const tile = map.getTile(x, y, z);
            if (!tile) continue;

            const isCityTile = (x >= startX && x < startX + width && y >= startY && y < startY + height);

            if (!isCityTile) {
                let mask = 0;
                if (isCity(map, x, y - 1, z)) mask += 1;
                if (isCity(map, x + 1, y, z)) mask += 2;
                if (isCity(map, x, y + 1, z)) mask += 4;
                if (isCity(map, x - 1, y, z)) mask += 8;

                let borderId = 0;
                switch (mask) {
                    case 2: borderId = MOUNTAINS.WEST; break;
                    case 8: borderId = MOUNTAINS.EAST; break;
                    case 4: borderId = MOUNTAINS.NORTH; break;
                    case 1: borderId = MOUNTAINS.SOUTH; break;
                    case 6: borderId = MOUNTAINS.CORNER_NW; break;
                    case 12: borderId = MOUNTAINS.CORNER_NE; break;
                    case 3: borderId = MOUNTAINS.CORNER_SW; break;
                    case 9: borderId = MOUNTAINS.CORNER_SE; break;
                }

                if (borderId !== 0) {
                    tile.addItem(new Item(borderId));
                }
            }
        }
    }
}

function isCity(map: WorldMap3D, x: number, y: number, z: number): boolean {
    const tile = map.getTile(x, y, z);
    if (!tile) return false;
    return tile.baseId === EDRON_ASSETS.FLOORS.COBBLESTONE || tile.baseId === EDRON_ASSETS.FLOORS.PAVEMENT_LIGHT;
}

/**
 * Creates a City Gate with functional ramps.
 */
export function createCityGate(map: WorldMap3D, x: number, y: number, z: number = GROUND_FLOOR) {
    const tile = map.getTile(x, y, z);
    if (!tile) return;

    // 1. Clear the Mountain Wall
    tile.items = []; // Remove mountain border
    tile.baseId = EDRON_ASSETS.FLOORS.COBBLESTONE;

    // 2. Place the Ramp (Assuming South entrance leading North)
    tile.addItem(new Item(EDRON_ASSETS.STAIR_ASSETS.RAMP_NORTH));

    // 3. Clear path in front
    const frontTile = map.getTile(x, y + 1, z);
    if (frontTile) {
        frontTile.baseId = SPRITES.GRASS;
        frontTile.items = frontTile.items.filter(i => ![4468, 4469, 4470, 4471, 4472, 4473, 4474, 4475, 4476, 4477, 4478, 4479].includes(i.id));
    }
}

export function generateEdronMap(width: number, height: number): WorldMap3D {
    const map = new WorldMap3D(width, height);

    // Initialize floors
    map.initializeFloor(GROUND_FLOOR);
    map.initializeFloor(GROUND_FLOOR - 1); // Elevated city floor

    // ============================================================
    // CITY RECT DEFINITION (Centered on 250x250 map)
    // ============================================================
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);
    const cw = 60;
    const ch = 60;
    const CITY_RECT = { x: cx - Math.floor(cw / 2), y: cy - Math.floor(ch / 2), w: cw, h: ch };

    const groundZ = GROUND_FLOOR;
    const elevatedZ = GROUND_FLOOR - 1;

    // Helper: Check if coordinate is inside city zone (with 2-tile buffer for cliffs)
    const isInsideCity = (x: number, y: number): boolean => {
        return (x >= CITY_RECT.x - 2 && x <= CITY_RECT.x + CITY_RECT.w + 1 &&
            y >= CITY_RECT.y - 2 && y <= CITY_RECT.y + CITY_RECT.h + 1);
    };

    // ============================================================
    // PHASE 1: NATURE PASS (Skip inside city!)
    // ============================================================

    // Map of Terrain Types
    const TERRAIN = {
        WATER: 0,
        SAND: 1,
        GRASS: 2,
        MOUNTAIN: 3
    };

    // Sprite Mappings
    const TERRAIN_SPRITES = {
        [TERRAIN.WATER]: SPRITES.WATER,
        [TERRAIN.SAND]: SPRITES.SAND,
        [TERRAIN.GRASS]: SPRITES.GRASS,
        [TERRAIN.MOUNTAIN]: SPRITES.MOUNTAIN_TOP
    };

    // === PERLIN NOISE HELPER ===
    const noise = (x: number, y: number, scale: number) => {
        return Math.sin(x * scale) + Math.cos(y * scale) + Math.sin((x + y) * scale * 0.5);
    };

    // === PHASE 1: BIOME & STRUCTURE GENERATION ===
    // We use noise to generate large, coherent biomes
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // CRITICAL: Skip nature generation inside city zone!
            if (isInsideCity(x, y)) {
                map.setBaseId(x, y, GROUND_FLOOR, SPRITES.GRASS);
                map.setBaseId(x, y, elevatedZ, SPRITES.GRASS);
                continue;
            }

            // --- NOISE LAYERS ---
            const elevation = noise(x, y, 0.04);       // Large features (Mountains vs Flats)
            const moisture = noise(x + 500, y + 500, 0.03); // Temp/Wetness (Forest vs Desert)
            const detailVal = noise(x, y, 0.2);        // Local details (Trees/Rocks)

            let baseId = SPRITES.GRASS;
            let items: number[] = [];

            // === BIOME SELECTION ===

            // 1. DESERT BIOME (Dry)
            if (moisture < -0.4) {
                baseId = SPRITES.SAND; // Desert Sand (Verified ID)
                // Desert features
                if (elevation > 1.2) {
                    // Desert Mountain
                    baseId = 6010; // Rocky
                    if (Math.random() > 0.6) items.push(6020); // Cliff
                } else if (detailVal > 0.5) {
                    items.push(6); // Rocks
                }
            }
            // 2. FOREST BIOME (Wet)
            else {
                baseId = SPRITES.GRASS; // Green Grass (Verified ID)

                // Mountains
                if (elevation > 1.2) {
                    baseId = 6010; // Rocky
                    if (Math.random() > 0.6) items.push(6020); // Cliff
                }
                // Forest Vegetation
                else if (detailVal > 0.3) {
                    items.push(50); // Dense Tree
                } else if (detailVal > 0.0) {
                    items.push(51); // Sparse Tree
                }
            }

            // 3. RUINS GENERATOR (Rare structure)
            // Independent noise check for "Ancient POIs"
            const structureNoise = noise(x + 1000, y + 1000, 0.15);
            if (structureNoise > 1.8 && !items.includes(6020)) {
                // Ruin Wall
                baseId = 6010; // Cobble floor
                if (Math.random() > 0.6) {
                    items.push(Math.random() > 0.5 ? EDRON_ASSETS.WALLS.VERTICAL : EDRON_ASSETS.WALLS.HORIZONTAL); // Random Wall
                }
            }

            // 4. CAVE ENTRANCE (Rare)
            if (items.includes(6020) && Math.random() < 0.01) {
                // items.push(125); // Hole overlay (if supported) - skipping for now to avoid collision mess
            }

            // Apply to BOTH floors (Z=6 and Z=7)
            map.setBaseId(x, y, GROUND_FLOOR, baseId);
            map.setBaseId(x, y, elevatedZ, baseId);

            // Add items
            items.forEach(itemId => {
                const tile7 = map.getTile(x, y, GROUND_FLOOR);
                if (tile7) tile7.addItem(new Item(itemId));

                const tile6 = map.getTile(x, y, elevatedZ);
                if (tile6) tile6.addItem(new Item(itemId));
            });
        }
    }

    // ============================================================
    // PHASE 1.5: ORIGINAL WILDERNESS DECORATION (mountains from heightmap)
    // ============================================================
    // No random clutter - just let the heightmap terrain speak for itself

    // ============================================================
    // PHASE 2: BULLDOZER - Clear city area on elevated floor
    // ============================================================
    for (let x = CITY_RECT.x; x < CITY_RECT.x + CITY_RECT.w; x++) {
        for (let y = CITY_RECT.y; y < CITY_RECT.y + CITY_RECT.h; y++) {
            const tile = map.getTile(x, y, elevatedZ);
            if (tile) {
                tile.items = []; // Clear any items
                tile.baseId = EDRON_ASSETS.FLOORS.COBBLESTONE; // City floor
            }
        }
    }

    // ============================================================
    // PHASE 3: PLACE CITY (Buildings, roads, plaza)
    // ============================================================
    placeEdronCity(map, CITY_RECT.x, CITY_RECT.y, CITY_RECT.w, CITY_RECT.h, elevatedZ);

    // ============================================================
    // PHASE 4: MOUNTAIN CLIFFS (The "Container" around city)
    // ============================================================
    const MOUNTAINS = SPRITES.MOUNTAIN_ASSETS;
    const borderX = CITY_RECT.x - 1;
    const borderY = CITY_RECT.y - 1;
    const borderW = CITY_RECT.w + 2;
    const borderH = CITY_RECT.h + 2;

    // Gate location (center of south wall)
    const gateX = CITY_RECT.x + Math.floor(CITY_RECT.w / 2);
    const gateY = borderY + borderH - 1; // South edge

    for (let x = borderX; x < borderX + borderW; x++) {
        for (let y = borderY; y < borderY + borderH; y++) {
            // Skip the inside (city floor)
            if (x > borderX && x < borderX + borderW - 1 &&
                y > borderY && y < borderY + borderH - 1) continue;

            // === MASSIVE GATE GAP: Skip 5-tile wide gap for gate ===
            if (y === gateY && x >= gateX - 2 && x <= gateX + 2) {
                // Clear this tile for the gate opening
                const tile = map.getTile(x, y, GROUND_FLOOR);
                if (tile) {
                    tile.items = [];  // Remove any cliffs
                    tile.baseId = 6013;  // Dirt road
                }
                continue;
            }

            const tile = map.getTile(x, y, GROUND_FLOOR);
            if (!tile) continue;

            let mId = 0;

            // Edges
            if (y === borderY) mId = MOUNTAINS.NORTH;
            else if (y === borderY + borderH - 1) mId = MOUNTAINS.SOUTH;
            else if (x === borderX) mId = MOUNTAINS.WEST;
            else if (x === borderX + borderW - 1) mId = MOUNTAINS.EAST;

            // Corners (Overwrite edges)
            if (x === borderX && y === borderY) mId = MOUNTAINS.CORNER_NW;
            if (x === borderX + borderW - 1 && y === borderY) mId = MOUNTAINS.CORNER_NE;
            if (x === borderX && y === borderY + borderH - 1) mId = MOUNTAINS.CORNER_SW;
            if (x === borderX + borderW - 1 && y === borderY + borderH - 1) mId = MOUNTAINS.CORNER_SE;

            if (mId !== 0) {
                tile.baseId = SPRITES.GRASS; // Grass under cliff
                tile.addItem(new Item(mId));
            }
        }
    }

    // ============================================================
    // PHASE 5: CREATE GATE (Entrance ramp from Z=7 to Z=6)
    // ============================================================
    createCityGate(map, CITY_RECT.x + Math.floor(CITY_RECT.w / 2), CITY_RECT.y + CITY_RECT.h, GROUND_FLOOR);

    // ============================================================
    // PHASE 6: GLOBAL ROAD CLEARING (Fixing "Stuck Outside" Bug)
    // ============================================================
    // Ensure the road path is cleared on BOTH Z=6 and Z=7!
    // Perlin noise generates mountains on Z=6 too, so we must clear them.
    const gateCX = CITY_RECT.x + Math.floor(CITY_RECT.w / 2);
    const gateCY = CITY_RECT.y + CITY_RECT.h + 1; // Start just outside gate

    for (let y = gateCY; y < height; y++) {
        for (let dx = -2; dx <= 2; dx++) { // 5-tile wide road
            // Clear Z=7 (Ground Floor)
            const tile7 = map.getTile(gateCX + dx, y, GROUND_FLOOR);
            if (tile7) {
                tile7.items = []; // Remove heightmap mountains
                tile7.baseId = 6013; // Set to Dirt
            }

            // Clear Z=6 (City Floor) - Player is here!
            const tile6 = map.getTile(gateCX + dx, y, elevatedZ);
            if (tile6) {
                tile6.items = []; // Remove Perlin mountains
                tile6.baseId = 6013; // Set to Dirt
            }
        }
    }

    // ============================================================
    // PHASE 7: POPULATION (City NPCs + Wilderness Mobs)
    // ============================================================

    // --- CITY STRUCTURES & MERCHANDISE ---

    // Helper: Build Room (Walls + Floor + Door)
    const buildRoom = (bx: number, by: number, w: number, h: number, floor: number) => {
        // Floor
        for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
            const t = map.getTile(bx + dx, by + dy, elevatedZ);
            if (t) { t.baseId = floor; t.items = []; }
        }
        // Walls
        for (let i = 0; i < w; i++) {
            const t1 = map.getTile(bx + i, by, elevatedZ); if (t1) t1.items.push(new Item(6020));
            const t2 = map.getTile(bx + i, by + h - 1, elevatedZ); if (t2) t2.items.push(new Item(6020));
        }
        for (let i = 0; i < h; i++) {
            const t1 = map.getTile(bx, by + i, elevatedZ); if (t1) t1.items.push(new Item(6020));
            const t2 = map.getTile(bx + w - 1, by + i, elevatedZ); if (t2) t2.items.push(new Item(6020));
        }
        // Door (Bottom Center)
        const doorX = bx + Math.floor(w / 2);
        const dt = map.getTile(doorX, by + h - 1, elevatedZ);
        if (dt) dt.items = []; // Remove wall
    };

    const cityX = cx - 35; // City Top-Left approximation
    const cityY = cy - 35;

    // 1. MAGIC SHOP (East) - "Xodet's Potions"
    const mx = cityX + 40, my = cityY + 25;
    buildRoom(mx, my, 8, 8, 6012);
    const tXodet = map.getTile(mx + 4, my + 4, elevatedZ);
    if (tXodet) tXodet.mob = "Xodet";
    // Herbs (Flowers) lining walls
    [1, 2, 6, 7].forEach(off => {
        const t = map.getTile(mx + off, my + 1, elevatedZ);
        if (t) t.items.push(new Item(EDRON_ASSETS.DECOR.POTTED_FLOWER)); // Flowers
    });
    // Counter
    const tMCtr = map.getTile(mx + 3, my + 5, elevatedZ); if (tMCtr) tMCtr.items.push(new Item(30)); // Barrel
    const tMLmp = map.getTile(mx + 5, my + 5, elevatedZ); if (tMLmp) tMLmp.items.push(new Item(32)); // Torch

    // 2. WEAPON SHOP (North East) - "Willard's Armory"
    const wx = cityX + 40, wy = cityY + 5;
    buildRoom(wx, wy, 8, 8, 6012);
    const tWillard = map.getTile(wx + 4, wy + 4, elevatedZ);
    if (tWillard) tWillard.mob = "Willard";
    // Crates of Steel
    [1, 2, 6].forEach(off => {
        const t = map.getTile(wx + off, wy + 1, elevatedZ);
        if (t) t.items.push(new Item(31)); // Crate
    });
    const tAnv = map.getTile(wx + 6, wy + 6, elevatedZ); if (tAnv) tAnv.items.push(new Item(30)); // Anvil (Barrel)

    // 3. THE DEPOT (Center) - "Bank"
    const depotX = cityX + 25, depotY = cityY + 15;
    buildRoom(depotX, depotY, 10, 8, 6012);
    const tClyde = map.getTile(depotX + 5, depotY + 4, elevatedZ);
    if (tClyde) tClyde.mob = "Clyde";
    // Lockers (Rows of Crates)
    for (let i = depotX + 1; i < depotX + 10; i += 2) {
        const t = map.getTile(i, depotY + 1, elevatedZ);
        if (t) t.items.push(new Item(31));
    }
    const tDLmp1 = map.getTile(depotX + 1, depotY + 6, elevatedZ); if (tDLmp1) tDLmp1.items.push(new Item(32));
    const tDLmp2 = map.getTile(depotX + 9, depotY + 6, elevatedZ); if (tDLmp2) tDLmp2.items.push(new Item(32));

    // 4. KING'S CASTLE (North West / Center North)
    const kx = cityX + 5, ky = cityY + 5;
    buildRoom(kx, ky, 15, 12, 6012);
    const tThrone = map.getTile(kx + 7, ky + 3, elevatedZ);
    if (tThrone) {
        tThrone.mob = "King Tibianus";
        tThrone.items.push(new Item(31)); // Crate as Throne (Placeholder for Pillar)
    }
    const tGuard = map.getTile(kx + 7, ky + 11, elevatedZ); if (tGuard) tGuard.mob = "Royal Guard";

    // Royal Decor
    const tKF1 = map.getTile(kx + 1, ky + 1, elevatedZ); if (tKF1) tKF1.items.push(new Item(300));
    const tKF2 = map.getTile(kx + 13, ky + 1, elevatedZ); if (tKF2) tKF2.items.push(new Item(300));
    const tKL1 = map.getTile(kx + 1, ky + 10, elevatedZ); if (tKL1) tKL1.items.push(new Item(32));
    const tKL2 = map.getTile(kx + 13, ky + 10, elevatedZ); if (tKL2) tKL2.items.push(new Item(32));

    // 5. TEMPLE (South West)
    const tx = cityX + 5, ty = cityY + 25;
    buildRoom(tx, ty, 10, 10, 6012);
    const tHenricus = map.getTile(tx + 5, ty + 5, elevatedZ);
    if (tHenricus) tHenricus.mob = "Henricus";
    const tT1 = map.getTile(tx + 1, ty + 1, elevatedZ); if (tT1) tT1.items.push(new Item(32));
    const tT2 = map.getTile(tx + 9, ty + 1, elevatedZ); if (tT2) tT2.items.push(new Item(32));
    const tAlt = map.getTile(tx + 5, ty + 2, elevatedZ); if (tAlt) tAlt.items.push(new Item(31)); // Altar

    // Gate Mob
    const tBeggar = map.getTile(gateCX + 2, gateCY - 2, elevatedZ);
    if (tBeggar) tBeggar.mob = "Beggar";

    // FIX: Gate Collision (Ensure Clear Path)
    for (let w = -2; w <= 2; w++) {
        // Clear Walls/Items at Gate Line
        const t = map.getTile(gateCX + w, gateCY, elevatedZ);
        if (t) {
            t.items = []; // Remove walls
            t.baseId = 6013; // Dirt Road
        }
    }

    // 2. Wilderness Habitat Pass (Ground Floor Z=7)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isInsideCity(x, y)) continue;

            const t = map.getTile(x, y, groundZ);
            if (!t) continue;
            if (t.baseId === SPRITES.WATER) continue; // No swimming mobs yet

            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Chance to spawn
            if (Math.random() > 0.02) continue; // 2% chance

            // Biome Check
            const isSand = t.baseId === SPRITES.SAND;
            // Check for Mountain by item
            const hasMountain = t.items.some(i => i.id === 6010 || i.id === SPRITES.MOUNTAIN_TOP);

            if (hasMountain) {
                t.mob = "Cyclops"; // Mountains = Cyclops
            } else if (isSand) {
                t.mob = "Bandit"; // Desert = Bandit
            } else {
                // Distance Zones
                if (dist < 60) {
                    // Safe Zone (Near City) - Peaceful
                } else if (dist < 100) {
                    // Outskirts
                    t.mob = Math.random() > 0.5 ? "Rat" : "Wolf";
                } else {
                    // Deep Wilderness
                    t.mob = Math.random() > 0.5 ? "Bear" : "Orc";
                }
            }
        }
    }

    // === 10. SEWER GRATE (South of Depot) ===
    const grateX = cx + 2;
    const grateY = cy + 12; // South of center
    const gTile = map.getTile(grateX, grateY, elevatedZ);
    if (gTile) {
        gTile.items = [];
        gTile.addItem(new Item(SPRITES.SEWER_GRATE));
    }

    // Generate Sewer Level below
    generateEdronSewers(map, cx, cy, grateX, grateY, elevatedZ + 1); // Z=7 (Ground/Mountain Base) or Z=8?
    // Let's use Z=8 for "Deep Sewer" to be safe and distinct from Wilderness Z=7.
    // Actually, createCityGate links 6->7.
    // Sewer should probably be 8 or a totally different Z. 
    // Let's use Z=7 but ensure it's "Inside" the mountain collision-wise?
    // Or just Z=8.
    // Let's go Z=8.

    return map;
}

function generateEdronSewers(map: WorldMap3D, cx: number, cy: number, grateX: number, grateY: number, sewerZ: number) {
    // Use passed Z
    const z = sewerZ;
    map.initializeFloor(z);

    const WALL = EDRON_ASSETS.WALLS.VERTICAL; // 1054
    const FLOOR = EDRON_ASSETS.FLOORS.COBBLESTONE; // 446 (Fixed)

    // Helper: Dig a room
    const digRoom = (bx: number, by: number, w: number, h: number, addMobs: boolean = true) => {
        for (let y = by; y < by + h; y++) {
            for (let x = bx; x < bx + w; x++) {
                const t = map.getTile(x, y, z);
                if (t) {
                    t.items = []; // Clear
                    t.baseId = FLOOR;

                    // Walls on edge
                    if (x === bx || x === bx + w - 1 || y === by || y === by + h - 1) {
                        t.items.push(new Item(WALL));
                    } else {
                        // Inside room
                        // Mobs?
                        if (addMobs && Math.random() < 0.25) { // 25% chance for mob
                            t.mob = Math.random() > 0.4 ? "Slime" : "Rat";
                        }
                    }
                }
            }
        }
    };

    // Helper: Dig Tunnel (Walkable, No Mobs, Walls on side)
    const digTunnel = (x1: number, y1: number, x2: number, y2: number) => {
        // Horizontal then Vertical
        // Ensure tunnel is 2 tiles wide for playability
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        // H-Tunnel
        for (let x = minX; x <= maxX; x++) {
            const t = map.getTile(x, y1, z);
            if (t) { t.items = []; t.baseId = FLOOR; }
            // Clear adjacent for width
            const t2 = map.getTile(x, y1 + 1, z);
            if (t2) { t2.items = []; t2.baseId = FLOOR; }
        }

        // V-Tunnel
        for (let y = minY; y <= maxY; y++) {
            const t = map.getTile(x2, y, z);
            if (t) { t.items = []; t.baseId = FLOOR; }
            const t2 = map.getTile(x2 + 1, y, z);
            if (t2) { t2.items = []; t2.baseId = FLOOR; }
        }
    };

    // 1. Entrance Room (Under Grate)
    const rx = grateX - 5;
    const ry = grateY - 5;
    digRoom(rx, ry, 10, 10, true); // Some mobs in start room

    // Ladder Up (North)
    const lTile = map.getTile(grateX, grateY - 1, z);
    if (lTile) { lTile.items = []; lTile.addItem(new Item(SPRITES.LADDER_UP)); }

    // Landing Spot
    const landTile = map.getTile(grateX, grateY, z);
    if (landTile) { landTile.items = []; landTile.baseId = FLOOR; }

    // 2. Generate Random Rooms
    const rooms: { x: number, y: number, w: number, h: number }[] = [];
    rooms.push({ x: rx, y: ry, w: 10, h: 10 });

    // Generate 5-6 rooms
    for (let i = 0; i < 6; i++) {
        // Random pos within 60 tiles of entrance
        const roomW = 8 + Math.floor(Math.random() * 8);
        const roomH = 8 + Math.floor(Math.random() * 8);
        const roomX = rx + (Math.random() < 0.5 ? -1 : 1) * Math.floor(20 + Math.random() * 40);
        const roomY = ry + (Math.random() < 0.5 ? -1 : 1) * Math.floor(20 + Math.random() * 40);

        digRoom(roomX, roomY, roomW, roomH, true);
        rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });
    }

    // 3. Connect Rooms
    for (let i = 0; i < rooms.length - 1; i++) {
        const r1 = rooms[i];
        const r2 = rooms[i + 1];
        // Connect Center to Center
        digTunnel(r1.x + Math.floor(r1.w / 2), r1.y + Math.floor(r1.h / 2),
            r2.x + Math.floor(r2.w / 2), r2.y + Math.floor(r2.h / 2));
    }

    // 4. Boss Room (Last Room)
    const bossRoom = rooms[rooms.length - 1];
    // Clear center for Boss
    const bx = bossRoom.x + Math.floor(bossRoom.w / 2);
    const by = bossRoom.y + Math.floor(bossRoom.h / 2);
    const bTile = map.getTile(bx, by, z);
    if (bTile) {
        bTile.mob = "big_zombie"; // Boss
    }
    // Add extra Mobs in boss room
    const bTile2 = map.getTile(bx - 2, by - 2, z); if (bTile2) bTile2.mob = "Slime";
    const bTile3 = map.getTile(bx + 2, by + 2, z); if (bTile3) bTile3.mob = "Slime";

    console.log(`[Sewers] Generated ${rooms.length} rooms. Boss at ${bx},${by}`);
}

