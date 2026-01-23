/**
 * Tibia-Style Map Generator
 * 
 * Uses:
 * - Simplex noise for natural terrain distribution
 * - Bitmasking for auto-borders
 * - Z-axis support for multi-floor worlds (16 floors, Z=7 surface)
 * - Rule-based population for towns, monsters, POIs
 */

import { WorldMap3D, GROUND_FLOOR, FloorTransition, FloorTransitionRegistry } from './world_map_3d';
import { Tile, Item } from './types';
import { RNG } from '../rng';
import { SPRITES } from '../constants';

// Noise functions
import { generateHeightMap, applyIslandMask, generateIslandMask, TERRAIN, fbm } from './noise';

// Border calculations
import {
    calculateAllBorders,
    calculateMountainWalls,
    placeRamps,
    MountainWall,
    BorderOverlay,
    MOUNTAIN_IDS,
    RAMP_IDS,
    VERTICAL_IDS
} from './borders';

// Spawn rules for biome-based monster placement
import { getMonsterForBiome, getMonsterDefinition, TERRAIN_TYPE } from '../data/spawn_rules';

// Terrain type to sprite mapping
const TERRAIN_SPRITES: Record<number, number> = {
    [TERRAIN.DEEP_WATER]: SPRITES.WATER,
    [TERRAIN.SHALLOW_WATER]: SPRITES.WATER, // Could use different sprite
    [TERRAIN.SAND]: SPRITES.SAND,
    [TERRAIN.GRASS]: SPRITES.GRASS,
    [TERRAIN.MOUNTAIN]: SPRITES.FLOOR_STONE // Mountain base
};

// Town data structure
interface TownData {
    name: string;
    centerX: number;
    centerY: number;
    hasSewer: boolean;
}

// Spawn point data
// Spawn point data
interface SpawnData {
    x: number;
    y: number;
    z: number;
    mobType: number;
    isBoss?: boolean;
    customName?: string; // Added for quest targets
    difficulty?: number; // Added for scaling
}

/**
 * New Tibia-Style Map Generator
 */
export class TibiaMapGenerator {
    private map3D: WorldMap3D;
    private width: number;
    private height: number;
    private rng: RNG;
    private seed: number;

    // Generated data
    private heightMap: number[][] = [];
    private towns: TownData[] = [];
    private spawns: SpawnData[] = [];
    private transitions: FloorTransitionRegistry;

    constructor(width: number, height: number, seed: number) {
        this.width = width;
        this.height = height;
        this.seed = seed;
        this.rng = new RNG(seed);
        this.map3D = new WorldMap3D(width, height);
        this.transitions = new FloorTransitionRegistry();
    }

    /**
     * Generate the entire world
     */
    generate(): WorldMap3D {
        console.log(`[TibiaMapGen] Generating world ${this.width}x${this.height} with seed ${this.seed}`);

        // Phase 1: Generate height map (terrain matrix)
        this.generateTerrain();

        // Phase 2: Apply terrain to tiles
        this.applyTerrainToTiles();

        // Phase 3: Calculate and apply borders
        this.applyBorders();

        // Phase 4: Generate mountains (Z=6)
        this.generateMountains();

        // Phase 5: Place ramps for floor transitions
        this.placeFloorTransitions();

        // Phase 6: Find and build towns
        this.generateTowns();

        // Phase 6b: Generate Sewers (Z=8)
        this.generateSewers();

        // Phase 7: Populate with monsters
        this.populateMonsters();

        // Phase 8: Add nature (trees, rocks)
        this.addNature();

        console.log(`[TibiaMapGen] World generation complete`);
        console.log(`[TibiaMapGen] Towns: ${this.towns.length}, Spawns: ${this.spawns.length}`);

        return this.map3D;
    }

    /**
     * Phase 1: Generate terrain height map using noise
     */
    private generateTerrain(): void {
        console.log('[TibiaMapGen] Phase 1: Generating terrain...');

        // Generate base noise map
        this.heightMap = generateHeightMap(this.width, this.height, this.seed, 0.015);

        // Apply island mask for continent shapes
        const mask = generateIslandMask(this.width, this.height, 2.0);
        applyIslandMask(this.heightMap, mask);

        console.log('[TibiaMapGen] Terrain heightmap generated');
    }

    /**
     * Phase 2: Convert height map to actual tiles
     */
    private applyTerrainToTiles(): void {
        console.log('[TibiaMapGen] Phase 2: Applying terrain to tiles...');

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const terrainType = this.heightMap[y][x];
                const spriteId = TERRAIN_SPRITES[terrainType] || SPRITES.GRASS;

                const tile = this.map3D.getTile(x, y, GROUND_FLOOR);
                if (tile) {
                    tile.baseId = spriteId;
                }
            }
        }
    }

    /**
     * Phase 3: Calculate and apply auto-borders
     */
    private applyBorders(): void {
        console.log('[TibiaMapGen] Phase 3: Applying auto-borders...');

        const borders = calculateAllBorders(this.heightMap);

        for (const border of borders) {
            const tile = this.map3D.getTile(border.x, border.y, GROUND_FLOOR);
            if (tile) {
                // Add border as overlay item on top of ground
                tile.addItem(new Item(border.spriteId));
            }
        }

        console.log(`[TibiaMapGen] Applied ${borders.length} border overlays`);
    }

    /**
     * Phase 4: Generate mountain areas (Z=6)
     */
    private generateMountains(): void {
        console.log('[TibiaMapGen] Phase 4: Generating mountains...');

        // Initialize mountain floor (Z=6)
        this.map3D.initializeFloor(6);

        // Calculate mountain walls from height map
        let walls = calculateMountainWalls(this.heightMap, GROUND_FLOOR);

        // Convert some walls to ramps (10% chance)
        walls = placeRamps(walls, this.heightMap, 0.08, this.seed);

        let rampCount = 0;

        for (const wall of walls) {
            const tile = this.map3D.getTile(wall.x, wall.y, GROUND_FLOOR);
            if (tile) {
                tile.addItem(new Item(wall.spriteId));

                // If this is a ramp, register the floor transition
                if (wall.isRamp && wall.rampDirection) {
                    rampCount++;

                    // Calculate destination based on ramp direction
                    let destX = wall.x;
                    let destY = wall.y;

                    switch (wall.rampDirection) {
                        case 'north': destY--; break;
                        case 'south': destY++; break;
                        case 'east': destX++; break;
                        case 'west': destX--; break;
                    }

                    // Register transition (walk onto ramp -> go up to Z=6)
                    this.transitions.add({
                        fromX: wall.x,
                        fromY: wall.y,
                        fromZ: GROUND_FLOOR,
                        toX: destX,
                        toY: destY,
                        toZ: 6, // One floor up
                        type: 'ramp',
                        direction: wall.rampDirection,
                        requiresClick: false
                    });

                    // Ensure destination tile on Z=6 is walkable
                    const destTile = this.map3D.getTile(destX, destY, 6);
                    if (destTile) {
                        destTile.baseId = SPRITES.FLOOR_STONE;
                    }
                }
            }
        }

        // Fill mountain tops (Z=6) with ground
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.heightMap[y][x] === TERRAIN.MOUNTAIN) {
                    // Check if this is interior (all neighbors are also mountain)
                    const n = this.heightMap[y - 1]?.[x] === TERRAIN.MOUNTAIN;
                    const s = this.heightMap[y + 1]?.[x] === TERRAIN.MOUNTAIN;
                    const e = this.heightMap[y]?.[x + 1] === TERRAIN.MOUNTAIN;
                    const w = this.heightMap[y]?.[x - 1] === TERRAIN.MOUNTAIN;

                    if (n && s && e && w) {
                        const tile = this.map3D.getTile(x, y, 6);
                        if (tile) {
                            tile.baseId = SPRITES.FLOOR_STONE;
                        }
                    }
                }
            }
        }

        console.log(`[TibiaMapGen] Placed ${walls.length} mountain walls, ${rampCount} ramps`);
    }

    /**
     * Phase 5: Place floor transitions (caves, holes)
     */
    private placeFloorTransitions(): void {
        console.log('[TibiaMapGen] Phase 5: Placing floor transitions...');

        // Initialize first underground floor (Z=8)
        this.map3D.initializeFloor(8);

        let holeCount = 0;

        // Place random cave entrances on grass tiles
        for (let y = 10; y < this.height - 10; y++) {
            for (let x = 10; x < this.width - 10; x++) {
                if (this.heightMap[y][x] === TERRAIN.GRASS) {
                    // 0.5% chance for a hole
                    if (this.rng.next() < 0.005) {
                        const tile = this.map3D.getTile(x, y, GROUND_FLOOR);
                        if (tile && tile.items.length < 2) {
                            // Place hole on surface
                            tile.addItem(new Item(VERTICAL_IDS.HOLE_DOWN));
                            holeCount++;

                            // Register transition (fall down)
                            this.transitions.add({
                                fromX: x,
                                fromY: y,
                                fromZ: GROUND_FLOOR,
                                toX: x,
                                toY: y,
                                toZ: 8,
                                type: 'hole',
                                requiresClick: false
                            });

                            // Place rope spot and ladder below
                            const underTile = this.map3D.getTile(x, y, 8);
                            if (underTile) {
                                underTile.baseId = SPRITES.FLOOR_STONE;
                                underTile.addItem(new Item(VERTICAL_IDS.LADDER_UP));
                            }

                            // Register climb up transition (requires click)
                            this.transitions.add({
                                fromX: x,
                                fromY: y,
                                fromZ: 8,
                                toX: x,
                                toY: y,
                                toZ: GROUND_FLOOR,
                                type: 'ladder',
                                requiresClick: true
                            });
                        }
                    }
                }
            }
        }

        console.log(`[TibiaMapGen] Placed ${holeCount} cave entrances`);
    }

    /**
     * Phase 6: Generate towns on flat grass areas
     */
    private generateTowns(): void {
        console.log('[TibiaMapGen] Phase 6: Generating towns...');

        const townNames = ['Rookgaard', 'Thais', 'Carlin', 'Venore', 'Edron'];
        let townsPlaced = 0;

        // Find suitable 20x20 flat grass areas
        for (let attempts = 0; attempts < 100 && townsPlaced < 5; attempts++) {
            const tx = Math.floor(this.rng.next() * (this.width - 40)) + 20;
            const ty = Math.floor(this.rng.next() * (this.height - 40)) + 20;

            if (this.isFlatGrassArea(tx, ty, 20)) {
                const town: TownData = {
                    name: townNames[townsPlaced] || `Town ${townsPlaced + 1}`,
                    centerX: tx + 10,
                    centerY: ty + 10,
                    hasSewer: townsPlaced < 2 // First 2 towns have sewers
                };

                this.buildTown(town);
                this.towns.push(town);
                townsPlaced++;

                console.log(`[TibiaMapGen] Built ${town.name} at ${town.centerX}, ${town.centerY}`);
            }
        }

        console.log(`[TibiaMapGen] Generated ${townsPlaced} towns`);
    }

    /**
     * Phase 6b: Generate Sewers under towns
     */
    /**
     * Phase 6b: Generate Sewers under towns (Enhanced)
     */
    private generateSewers(): void {
        console.log('[TibiaMapGen] Phase 6b: Generating enhanced sewers...');
        // Initialize Z=8 if not already
        this.map3D.initializeFloor(8);

        let sewerCount = 0;

        for (const town of this.towns) {
            if (!town.hasSewer) continue;

            const cx = town.centerX;
            const cy = town.centerY;
            const grateX = cx + 2;
            const grateY = cy + 12;

            // 1. Central Room (Under Grate)
            const hubW = 10;
            const hubH = 10;
            const hubX = grateX - 5;
            const hubY = grateY - 5;

            this.digRoom(hubX, hubY, hubW, hubH, 8, SPRITES.FLOOR_STONE, SPRITES.WALL_STONE_H);

            // Grate Transitions
            this.transitions.add({
                fromX: grateX, fromY: grateY, fromZ: GROUND_FLOOR,
                toX: grateX, toY: grateY, toZ: 8,
                type: 'hole', requiresClick: false
            });

            // Ladder Up
            const ladderTile = this.map3D.getTile(grateX, grateY, 8);
            if (ladderTile) {
                ladderTile.items = [];
                ladderTile.baseId = SPRITES.FLOOR_STONE;
                ladderTile.addItem(new Item(SPRITES.LADDER_UP));
            }
            this.transitions.add({
                fromX: grateX, fromY: grateY, fromZ: 8,
                toX: grateX, toY: grateY, toZ: GROUND_FLOOR,
                type: 'ladder', requiresClick: true
            });

            // Hub Monsters - Slimes (Weak)
            this.spawnMonstersInRect(hubX, hubY, hubW, hubH, 8, SPRITES.SLIME, "Sewer Slime", 1.0, 3);

            // 2. Corridors & Side Rooms
            // North Corridor -> Rat Room
            const northLen = 15;
            this.digRoom(grateX - 1, hubY - northLen, 3, northLen, 8, SPRITES.FLOOR_STONE, SPRITES.WALL_STONE_H); // Tunnel
            const ratRoomW = 12;
            const ratRoomH = 12;
            this.digRoom(grateX - 6, hubY - northLen - ratRoomH, ratRoomW, ratRoomH, 8, SPRITES.FLOOR_STONE, SPRITES.WALL_STONE_H);

            // Spawn Rats
            this.spawnMonstersInRect(grateX - 6, hubY - northLen - ratRoomH, ratRoomW, ratRoomH, 8, SPRITES.RAT, "Giant Rat", 0.8, 5);

            // 3. Boss Corridor (East)
            const eastLen = 20;
            this.digRoom(hubX + hubW, grateY - 1, eastLen, 3, 8, SPRITES.FLOOR_STONE, SPRITES.WALL_STONE_H);

            // Boss Room
            const bossRoomX = hubX + hubW + eastLen;
            const bossRoomY = grateY - 6;
            const bossRoomW = 14;
            const bossRoomH = 14;
            this.digRoom(bossRoomX, bossRoomY, bossRoomW, bossRoomH, 8, SPRITES.FLOOR_STONE, SPRITES.WALL_STONE_H);

            // Spawn Boss - Sewer King
            this.spawns.push({
                x: bossRoomX + Math.floor(bossRoomW / 2),
                y: bossRoomY + Math.floor(bossRoomH / 2),
                z: 8,
                mobType: SPRITES.RAT,
                customName: "Sewer King",
                difficulty: 2.5,
                isBoss: true
            });

            // Boss Minions
            this.spawnMonstersInRect(bossRoomX, bossRoomY, bossRoomW, bossRoomH, 8, SPRITES.SLIME, "King's Guard", 1.2, 3);

            sewerCount++;
        }
        console.log(`[TibiaMapGen] Generated ${sewerCount} enhanced sewers`);
    }

    private digRoom(x: number, y: number, w: number, h: number, z: number, floor: number, wall: number): void {
        for (let ry = y; ry < y + h; ry++) {
            for (let rx = x; rx < x + w; rx++) {
                const tile = this.map3D.getTile(rx, ry, z);
                if (tile) {
                    tile.baseId = floor;
                    tile.items = []; // Clear existing rock/walls
                    if (rx === x || rx === x + w - 1 || ry === y || ry === y + h - 1) {
                        tile.addItem(new Item(wall));
                    }
                }
            }
        }
    }

    private spawnMonstersInRect(x: number, y: number, w: number, h: number, z: number, type: number, name: string, diff: number, count: number): void {
        for (let i = 0; i < count; i++) {
            const mx = x + 2 + Math.floor(this.rng.next() * (w - 4));
            const my = y + 2 + Math.floor(this.rng.next() * (h - 4));
            this.spawns.push({
                x: mx, y: my, z, mobType: type, customName: name, difficulty: diff
            });
        }
    }

    /**
     * Check if area is flat grass
     */
    private isFlatGrassArea(x: number, y: number, size: number): boolean {
        for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
                const terrain = this.heightMap[y + dy]?.[x + dx];
                if (terrain !== TERRAIN.GRASS) return false;
            }
        }
        return true;
    }

    /**
     * Build a town at given location
     */
    private buildTown(town: TownData): void {
        const cx = town.centerX;
        const cy = town.centerY;
        const wall = SPRITES.WALL;
        const floor = SPRITES.TEMPLE_FLOOR;

        // Temple (center)
        this.buildBuilding(cx - 5, cy - 5, 10, 10, wall, floor);

        // Depot (east)
        this.buildBuilding(cx + 7, cy - 3, 8, 6, wall, SPRITES.FLOOR_WOOD);

        // Houses
        this.buildBuilding(cx - 12, cy + 2, 6, 5, wall, SPRITES.FLOOR_WOOD);
        this.buildBuilding(cx - 4, cy + 7, 5, 5, wall, SPRITES.FLOOR_WOOD);
        this.buildBuilding(cx + 5, cy + 6, 6, 5, wall, SPRITES.FLOOR_WOOD);

        // Sewer entrance
        if (town.hasSewer) {
            const sx = cx + 2;
            const sy = cy + 12;
            const tile = this.map3D.getTile(sx, sy, GROUND_FLOOR);
            if (tile) {
                tile.baseId = SPRITES.SEWER_GRATE;
            }
        }
    }

    /**
     * Build a rectangular building
     */
    private buildBuilding(bx: number, by: number, w: number, h: number, wallId: number, floorId: number): void {
        // Floor
        for (let y = by; y < by + h; y++) {
            for (let x = bx; x < bx + w; x++) {
                const tile = this.map3D.getTile(x, y, GROUND_FLOOR);
                if (tile) tile.baseId = floorId;
            }
        }

        // Walls (horizontal)
        for (let x = bx; x < bx + w; x++) {
            this.placeWall(x, by, wallId);
            this.placeWall(x, by + h - 1, wallId);
        }

        // Walls (vertical)
        for (let y = by + 1; y < by + h - 1; y++) {
            this.placeWall(bx, y, SPRITES.WALL_VERTICAL);
            this.placeWall(bx + w - 1, y, SPRITES.WALL_VERTICAL);
        }

        // Door (center bottom)
        const doorX = bx + Math.floor(w / 2);
        const doorY = by + h - 1;
        const tile = this.map3D.getTile(doorX, doorY, GROUND_FLOOR);
        if (tile) {
            tile.items = [];
            tile.baseId = floorId;
        }
    }

    /**
     * Place a wall item
     */
    private placeWall(x: number, y: number, type: number): void {
        const tile = this.map3D.getTile(x, y, GROUND_FLOOR);
        if (tile) tile.addItem(new Item(type));
    }

    /**
     * Phase 7: Populate world with monsters using Biome Spawn System
     */
    private populateMonsters(): void {
        console.log('[TibiaMapGen] Phase 7: Populating monsters...');

        // Terrain type mapping (using imported TERRAIN_TYPE)
        const TERRAIN_TO_TYPE: Record<number, string> = {
            [TERRAIN.DEEP_WATER]: TERRAIN_TYPE.DEEP_WATER,
            [TERRAIN.SHALLOW_WATER]: TERRAIN_TYPE.SHALLOW_WATER,
            [TERRAIN.SAND]: TERRAIN_TYPE.SAND,
            [TERRAIN.GRASS]: TERRAIN_TYPE.GRASS,
            [TERRAIN.MOUNTAIN]: TERRAIN_TYPE.MOUNTAIN
        };

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const terrain = this.heightMap[y][x];
                const r = this.rng.next();

                // Skip water tiles
                if (terrain <= TERRAIN.SHALLOW_WATER) continue;

                // Determine if near town
                const nearTown = this.isNearTown(x, y, 30);

                // Spawn chance based on terrain
                let spawnChance = 0;
                if (terrain === TERRAIN.GRASS) spawnChance = 0.008;
                else if (terrain === TERRAIN.SAND) spawnChance = 0.006;
                else if (terrain === TERRAIN.MOUNTAIN) spawnChance = 0.012;

                if (r > spawnChance) continue;

                // Get terrain type string
                const terrainType = TERRAIN_TO_TYPE[terrain] || TERRAIN_TYPE.GRASS;

                // Calculate difficulty based on distance from center (simplified)
                const centerDist = Math.sqrt((x - this.width / 2) ** 2 + (y - this.height / 2) ** 2);
                const difficulty = Math.min(10, Math.floor(centerDist / 40) + 1);

                // Use noise value for additional filtering
                const noiseValue = this.heightMap[y][x] / 5; // Normalize to ~0-1

                // Get monster from biome spawn system
                const monsterId = getMonsterForBiome(terrainType, difficulty, GROUND_FLOOR, noiseValue, nearTown);

                if (monsterId) {
                    const monsterDef = getMonsterDefinition(monsterId);
                    if (monsterDef) {
                        this.spawns.push({
                            x,
                            y,
                            z: GROUND_FLOOR,
                            mobType: monsterDef.spriteId
                        });

                        // Mark tile for game.ts to spawn ECS entities
                        const tile = this.map3D.getTile(x, y, GROUND_FLOOR);
                        if (tile) {
                            tile.addItem(new Item(monsterDef.spriteId));
                        }
                    }
                }
            }
        }

        console.log(`[TibiaMapGen] Spawned ${this.spawns.length} monsters using Biome Spawn System`);
    }

    /**
     * Check if position is near any town
     */
    private isNearTown(x: number, y: number, radius: number): boolean {
        for (const town of this.towns) {
            const dist = Math.sqrt((x - town.centerX) ** 2 + (y - town.centerY) ** 2);
            if (dist < radius) return true;
        }
        return false;
    }

    /**
     * Phase 8: Add nature (trees, rocks)
     */
    private addNature(): void {
        console.log('[TibiaMapGen] Phase 8: Adding nature...');

        let treeCount = 0;
        let rockCount = 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const terrain = this.heightMap[y][x];
                const r = this.rng.next();

                // Skip non-grass and town areas
                if (terrain !== TERRAIN.GRASS) continue;
                if (this.isNearTown(x, y, 25)) continue;

                const tile = this.map3D.getTile(x, y, GROUND_FLOOR);
                if (!tile || tile.items.length > 1) continue;

                // Trees (3% chance)
                if (r > 0.97) {
                    tile.addItem(new Item(r > 0.985 ? SPRITES.TREE_OAK : SPRITES.TREE_PINE));
                    treeCount++;
                }
                // Rocks (1% chance)
                else if (r < 0.01) {
                    tile.addItem(new Item(SPRITES.ROCK_LARGE));
                    rockCount++;
                }
            }
        }

        console.log(`[TibiaMapGen] Added ${treeCount} trees, ${rockCount} rocks`);
    }

    // ============================================================
    // ACCESSORS
    // ============================================================

    getMap3D(): WorldMap3D {
        return this.map3D;
    }

    getTowns(): TownData[] {
        return this.towns;
    }

    getSpawns(): SpawnData[] {
        return this.spawns;
    }

    getTransitions(): FloorTransitionRegistry {
        return this.transitions;
    }

    /**
     * Get legacy 2D tiles (for backwards compatibility)
     */
    getLegacyTiles(): Tile[] {
        return this.map3D.exportTo2D();
    }
}

// ============================================================
// LEGACY EXPORT (for game.ts compatibility)
// ============================================================

// Re-export old MapGenerator for gradual migration
export { MapGenerator } from './map_generator_legacy';
