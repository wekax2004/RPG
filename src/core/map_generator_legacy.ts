import { WorldMap, WALL, GRASS, TOWN_WALL, TOWN_FLOOR } from './map';
import { SPRITES } from '../constants';
import { Item } from './types';
import { RNG } from '../rng';

export class MapGenerator {
    map: WorldMap;
    width: number;
    height: number;
    rng: RNG;
    landMap: boolean[][]; // true = land, false = water
    teleporters: { x: number, y: number, tx: number, ty: number }[] = [];
    entities: any[] = []; // Track spawned entities for Game to instantiate

    constructor(map: WorldMap, seed: number) {
        this.map = map;
        this.width = map.width;
        this.height = map.height;
        this.rng = new RNG(seed);
        this.landMap = [];
        this.teleporters = [];
        this.entities = [];
    }

    generate() {
        // Switch to Global World Generation
        this.generateGlobalWorld();
    }

    generateGlobalWorld() {
        console.log("[MapGen] Generating GLOBAL TIBIA WORLD...");
        // 1. Fill with Water
        this.initializeOcean();

        // Coordinates for Continents
        // Map is assumed huge (e.g. 512x512 from game.ts)
        const cx = Math.floor(this.width / 2);
        const cy = Math.floor(this.height / 2);

        // 1. Rookgaard (Island - Southwest)
        this.generateIsland(cx - 100, cy + 50, 40, 35, SPRITES.GRASS, 'Rookgaard');

        // 2. Thais (Main Continent - South)
        this.generateLandmass(cx + 50, cy + 80, 80, 60, SPRITES.GRASS, 'Thais');

        // 3. Carlin (Main Continent - North-West)
        this.generateLandmass(cx - 20, cy - 80, 70, 50, SPRITES.GRASS_FLOWERS, 'Carlin');

        // 4. Venore (Swamp - East)
        this.generateLandmass(cx + 120, cy, 60, 50, SPRITES.SWAMP_MUD, 'Venore');

        // 5. Svargrond (Ice Islands - North-West corner)
        this.generateIsland(cx - 120, cy - 120, 30, 30, SPRITES.SNOW, 'Svargrond');

        // 6. Darashia (Desert - South-East)
        this.generateIsland(cx + 120, cy + 100, 50, 40, SPRITES.SAND, 'Darashia');

        // 7. Edron (Island - Central East)
        this.generateIsland(cx + 150, cy - 50, 40, 40, SPRITES.GRASS, 'Edron');

        // Populate specific zones (POIs)
        this.generateDwarfMines(cx - 50, cy - 20); // Near Carlin/Thais
        this.generateOrcFortress(cx + 100, cy - 40); // North of Venore
        this.generateDragonPeak(cx, cy - 100); // North Center

        // Populate Mobs
        this.populateGlobalWorld();
    }

    initializeOcean() {
        for (let y = 0; y < this.height; y++) {
            this.landMap[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.landMap[y][x] = false;
                const tile = this.map.getTile(x, y);
                if (tile) tile.baseId = SPRITES.WATER;
            }
        }
    }

    // Generate an Island with a central point and rough edges
    generateIsland(cx: number, cy: number, rx: number, ry: number, biomeBase: number, name: string) {
        console.log(`[MapGen] Generating Island: ${name} at ${cx},${cy}`);
        for (let y = cy - ry - 20; y < cy + ry + 20; y++) {
            if (y < 0 || y >= this.height) continue;
            // Ensure landMap row exists
            if (!this.landMap[y]) this.landMap[y] = [];

            for (let x = cx - rx - 20; x < cx + rx + 20; x++) {
                if (x < 0 || x >= this.width) continue;

                const dist = ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2);
                const noise = (Math.sin(x * 0.1) + Math.cos(y * 0.1)) * 0.15;

                if (dist + noise <= 1.0) {
                    this.landMap[y][x] = true;
                    // Biome Base
                    const tile = this.map.getTile(x, y);
                    if (tile) {
                        tile.baseId = biomeBase;

                        // Coastline check
                        if (dist + noise > 0.85 && biomeBase !== SPRITES.SNOW && biomeBase !== SPRITES.SWAMP_MUD) {
                            tile.baseId = SPRITES.SAND;
                        }
                    }
                }
            }
        }
        // Build City Center?
        if (['Thais', 'Carlin', 'Rookgaard', 'Venore', 'Edron'].includes(name)) {
            this.buildTownData(cx, cy, name);
        }
    }

    generateLandmass(cx: number, cy: number, rx: number, ry: number, biomeBase: number, name: string) {
        this.generateIsland(cx, cy, rx, ry, biomeBase, name);
    }

    buildTownData(cx: number, cy: number, name: string) {
        // Simple Town Gen
        const wall = SPRITES.WALL;

        // Temple
        this.buildBuilding(cx - 5, cy - 5, 10, 10, wall, SPRITES.TEMPLE_FLOOR);
        this.entities.push({ type: 'sign', x: (cx) * 32, y: (cy + 6) * 32, label: `Welcome to ${name}` });

        // Depot
        this.buildBuilding(cx + 8, cy - 2, 8, 8, wall, SPRITES.FLOOR_WOOD);

        // Houses
        this.buildBuilding(cx - 15, cy + 5, 6, 6, wall, SPRITES.FLOOR_WOOD);
        this.buildBuilding(cx - 5, cy + 8, 6, 6, wall, SPRITES.FLOOR_WOOD);

        // Sewer Grate (Rookgaard/City Style)
        if (name === 'Rookgaard' || name === 'Thais') {
            const sx = cx + 2;
            const sy = cy + 12; // Near temple/center
            const tile = this.map.getTile(sx, sy);
            if (tile) tile.baseId = SPRITES.SEWER_GRATE;
        }
    }

    populateGlobalWorld() {
        console.log("[MapGen] Populating World with Creatures...");
        // Iterate all tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.landMap[y] || !this.landMap[y][x]) continue;

                // Random Spawns based on Biome (Texture check)
                const tile = this.map.getTile(x, y);
                // Check items length instead of wallId
                if (!tile || tile.items.length > 0) continue;

                const id = tile.baseId;
                const r = this.rng.next();

                if (id === SPRITES.SNOW && r < 0.02) tile.addItem(new Item(SPRITES.POLAR_BEAR));
                else if (id === SPRITES.SAND && r < 0.02) tile.addItem(new Item(SPRITES.SCORPION_KING));
                else if (id === SPRITES.SWAMP_MUD && r < 0.02) tile.addItem(new Item(SPRITES.SLIME_PUDDLE));
                else if (id === SPRITES.GRASS && r < 0.01) tile.addItem(new Item(SPRITES.WOLF_DEAD));

                // Trees
                if (id === SPRITES.GRASS && r > 0.95) tile.addItem(new Item(SPRITES.TREE_OAK));
                if (id === SPRITES.SNOW && r > 0.95) tile.addItem(new Item(SPRITES.PINE_TREE));
            }
        }
    }

    buildBuilding(bx: number, by: number, w: number, h: number, wallId: number, floorId: number) {
        // Floor
        for (let y = by; y < by + h; y++) {
            for (let x = bx; x < bx + w; x++) {
                const tile = this.map.getTile(x, y);
                if (tile) tile.baseId = floorId;
            }
        }
        // Walls
        // 1. Horizontal Walls (Top and Bottom) - Use Lidded Wall
        for (let x = bx; x < bx + w; x++) {
            this.placeWall(x, by, wallId);
            this.placeWall(x, by + h - 1, wallId);
        }

        // 2. Vertical Walls (Left and Right) - Use Vertical Wall (No Lid)
        // Skip corners (by and by+h-1) to keep the lids there
        for (let y = by + 1; y < by + h - 1; y++) {
            this.placeWall(bx, y, SPRITES.WALL_VERTICAL);
            this.placeWall(bx + w - 1, y, SPRITES.WALL_VERTICAL);
        }

        // Door (Center Bottom)
        const doorX = bx + Math.floor(w / 2);
        const doorY = by + h - 1;

        // Clear Wall at Door
        const tile = this.map.getTile(doorX, doorY);
        if (tile) {
            tile.items = []; // Clear current items (walls)
            tile.baseId = floorId;
        }
    }

    generateDwarfMines(cx: number, cy: number) {
        console.log(`[MapGen] Generating Dwarf Mines at ${cx},${cy}`);
        const r = 12;

        // Clear area for Mine Entrance
        for (let y = cy - r; y < cy + r; y++) {
            for (let x = cx - r; x < cx + r; x++) {
                if (this.isValid(x, y)) {
                    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    if (dist < r) {
                        this.landMap[y][x] = true; // Force Land
                        const tile = this.map.getTile(x, y)!;
                        tile.baseId = SPRITES.FLOOR_STONE; // Grey Stone Floor

                        // Scatter Rocks
                        if (this.rng.next() < 0.3) {
                            tile.addItem(new Item(SPRITES.ROCK_LARGE));
                        }
                    }
                }
            }
        }
    }

    generateOrcFortress(cx: number, cy: number) {
        console.log(`[MapGen] Generating Orc Fortress at ${cx},${cy}`);
        const r = 10;

        // Wood Floor / Dirt Patch
        for (let y = cy - r; y < cy + r; y++) {
            for (let x = cx - r; x < cx + r; x++) {
                if (this.isValid(x, y)) {
                    this.landMap[y][x] = true;
                    const tile = this.map.getTile(x, y)!;

                    // Irregular shape
                    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    if (dist < r) {
                        tile.baseId = SPRITES.FLOOR_WOOD; // or DIRT
                        // Fence Perimeter
                        if (dist > r - 2 && this.rng.next() < 0.9) {
                            tile.addItem(new Item(SPRITES.CUSTOM_WOOD_FENCE));
                        }
                    }
                }
            }
        }
    }

    generateDragonPeak(cx: number, cy: number) {
        console.log(`[MapGen] Generating Dragon Peak at ${cx},${cy}`);
        const r = 8;

        // Circular Island
        for (let y = cy - r; y < cy + r; y++) {
            for (let x = cx - r; x < cx + r; x++) {
                if (this.isValid(x, y)) {
                    if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) < r) {
                        this.landMap[y][x] = true;
                        const tile = this.map.getTile(x, y)!;
                        tile.baseId = SPRITES.FLOOR_STONE; // Stone ground
                        // Loot Piles
                        if (this.rng.next() < 0.1) tile.addItem(new Item(SPRITES.GOLD));
                    }
                }
            }
        }
    }

    placeWall(x: number, y: number, type: number) {
        const tile = this.map.getTile(x, y);
        if (tile) {
            tile.addItem(new Item(type));
        }
    }

    isValid(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}
