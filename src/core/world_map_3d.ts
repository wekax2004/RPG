/**
 * 3D World Map with Z-Axis Support (Tibia-Style)
 * 
 * Floor Layout (Standard Tibia):
 *   Z=0-6:  Sky/Above ground
 *   Z=7:    Ground level (surface)
 *   Z=8-15: Underground/Caves
 * 
 * Total: 16 floors (0-15)
 */

import { Tile, MapItem as Item, TILE_SIZE } from './types';

export const GROUND_FLOOR = 7;
export const TOTAL_FLOORS = 16;

// Floor metadata
export interface FloorInfo {
    z: number;
    name: string;
    isUnderground: boolean;
    ambientLight: number; // 0-1, 0 = dark, 1 = bright
}

export const FLOOR_INFO: FloorInfo[] = [
    { z: 0, name: 'Sky +7', isUnderground: false, ambientLight: 1.0 },
    { z: 1, name: 'Sky +6', isUnderground: false, ambientLight: 1.0 },
    { z: 2, name: 'Sky +5', isUnderground: false, ambientLight: 1.0 },
    { z: 3, name: 'Sky +4', isUnderground: false, ambientLight: 1.0 },
    { z: 4, name: 'Sky +3', isUnderground: false, ambientLight: 1.0 },
    { z: 5, name: 'Sky +2', isUnderground: false, ambientLight: 1.0 },
    { z: 6, name: 'Sky +1', isUnderground: false, ambientLight: 1.0 },
    { z: 7, name: 'Ground', isUnderground: false, ambientLight: 1.0 },
    { z: 8, name: 'Underground -1', isUnderground: true, ambientLight: 0.3 },
    { z: 9, name: 'Underground -2', isUnderground: true, ambientLight: 0.2 },
    { z: 10, name: 'Underground -3', isUnderground: true, ambientLight: 0.15 },
    { z: 11, name: 'Underground -4', isUnderground: true, ambientLight: 0.1 },
    { z: 12, name: 'Underground -5', isUnderground: true, ambientLight: 0.08 },
    { z: 13, name: 'Underground -6', isUnderground: true, ambientLight: 0.05 },
    { z: 14, name: 'Underground -7', isUnderground: true, ambientLight: 0.03 },
    { z: 15, name: 'Underground -8', isUnderground: true, ambientLight: 0.02 }
];

/**
 * 3D World Map supporting multiple Z-levels
 */
export class WorldMap3D {
    width: number;
    height: number;
    floors: number;

    // 3D tile storage: floors[z][y * width + x]
    private tileData: Map<number, Tile[]>;

    // Track which floors are "active" (have been generated)
    private activeFloors: Set<number>;

    constructor(width: number, height: number, floors: number = TOTAL_FLOORS) {
        this.width = width;
        this.height = height;
        this.floors = floors;
        this.tileData = new Map();
        this.activeFloors = new Set();

        // Initialize ground floor (Z=7) by default
        this.initializeFloor(GROUND_FLOOR);
    }

    /**
     * Initialize a floor with empty tiles
     */
    initializeFloor(z: number): void {
        if (this.tileData.has(z)) return; // Already initialized

        const tiles: Tile[] = [];
        for (let i = 0; i < this.width * this.height; i++) {
            tiles.push(new Tile(0)); // Empty ground
        }
        this.tileData.set(z, tiles);
        this.activeFloors.add(z);
        console.log(`[WorldMap3D] Initialized floor Z=${z}`);
    }

    /**
     * Get tile at specific 3D coordinate
     */
    getTile(x: number, y: number, z: number = GROUND_FLOOR): Tile | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        if (z < 0 || z >= this.floors) return null;

        const floor = this.tileData.get(z);
        if (!floor) return null;

        return floor[y * this.width + x];
    }

    /**
     * Set tile at specific 3D coordinate
     */
    setTile(x: number, y: number, z: number, tile: Tile): void {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        if (z < 0 || z >= this.floors) return;

        // Initialize floor if needed
        if (!this.tileData.has(z)) {
            this.initializeFloor(z);
        }

        const floor = this.tileData.get(z)!;
        floor[y * this.width + x] = tile;
    }

    /**
     * Get all tiles for a specific floor (for rendering)
     */
    getFloor(z: number): Tile[] | null {
        return this.tileData.get(z) || null;
    }

    /**
     * Check if floor has been generated
     */
    isFloorActive(z: number): boolean {
        return this.activeFloors.has(z);
    }

    /**
     * Get floor info
     */
    getFloorInfo(z: number): FloorInfo | null {
        return FLOOR_INFO[z] || null;
    }

    /**
     * Helper: Check if coordinate is valid
     */
    isValid(x: number, y: number, z: number = GROUND_FLOOR): boolean {
        return x >= 0 && x < this.width &&
            y >= 0 && y < this.height &&
            z >= 0 && z < this.floors;
    }

    /**
     * Helper: Get tile's base sprite ID
     */
    getBaseId(x: number, y: number, z: number = GROUND_FLOOR): number {
        const tile = this.getTile(x, y, z);
        return tile?.baseId || 0;
    }

    /**
     * Helper: Set tile's base sprite ID
     */
    setBaseId(x: number, y: number, z: number, baseId: number): void {
        const tile = this.getTile(x, y, z);
        if (tile) tile.baseId = baseId;
    }

    /**
     * Helper: Add item to tile
     */
    addItem(x: number, y: number, z: number, item: Item): void {
        const tile = this.getTile(x, y, z);
        if (tile) tile.addItem(item);
    }

    /**
     * Convert 2D (legacy) WorldMap tiles to ground floor
     * For backwards compatibility
     */
    importFrom2D(tiles: Tile[]): void {
        const floor = this.tileData.get(GROUND_FLOOR);
        if (!floor) return;

        for (let i = 0; i < Math.min(tiles.length, floor.length); i++) {
            floor[i] = tiles[i];
        }
    }

    /**
     * Export ground floor as 2D array
     * For backwards compatibility
     */
    exportTo2D(): Tile[] {
        return this.tileData.get(GROUND_FLOOR) || [];
    }
}

/**
 * Ramp/Teleporter data for floor transitions
 */
export interface FloorTransition {
    fromX: number;
    fromY: number;
    fromZ: number;
    toX: number;
    toY: number;
    toZ: number;
    type: 'ramp' | 'stairs' | 'ladder' | 'hole' | 'teleport';
    direction?: 'north' | 'east' | 'south' | 'west';
    requiresClick?: boolean; // True for ladders
}

/**
 * Registry for floor transitions (ramps, stairs, holes)
 */
export class FloorTransitionRegistry {
    private transitions: FloorTransition[] = [];

    /**
     * Register a floor transition
     */
    add(transition: FloorTransition): void {
        this.transitions.push(transition);
    }

    /**
     * Find transition at position
     */
    findAt(x: number, y: number, z: number): FloorTransition | null {
        return this.transitions.find(t =>
            t.fromX === x && t.fromY === y && t.fromZ === z
        ) || null;
    }

    /**
     * Get all transitions for a floor
     */
    getFloorTransitions(z: number): FloorTransition[] {
        return this.transitions.filter(t => t.fromZ === z);
    }

    /**
     * Clear all transitions
     */
    clear(): void {
        this.transitions = [];
    }

    /**
     * Get all transitions
     */
    getAll(): FloorTransition[] {
        return [...this.transitions];
    }
}
