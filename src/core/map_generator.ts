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

    constructor(map: WorldMap, seed: number) {
        this.map = map;
        this.width = map.width;
        this.height = map.height;
        this.rng = new RNG(seed);
        this.landMap = [];
    }

    teleporters: { x: number, y: number, tx: number, ty: number }[] = [];

    generate() {
        // 1. Initialize Ocean
        this.initializeOcean();

        // 2. Grow Continents (Organic Shapes)
        this.generateLandmasses();

        // 3. Paint Terrain (Biomes based on Land)
        this.paintTerrain();

        // 4. Generate Main Town (On Largest Landmass)
        this.generateTown();

        // 5. Generate Interiors (Off-map / Void area)
        this.generateInteriors();

        // 6. Populate Mobs & Assets
        this.populateWorld();
    }

    // ... (Existing methods until generateTown) ...

    initializeOcean() {
        this.landMap = [];
        for (let y = 0; y < this.height; y++) {
            this.landMap[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.landMap[y][x] = false; // Default to Ocean
                const tile = this.map.getTile(x, y);
                if (tile) tile.baseId = SPRITES.WATER; // Visual
            }
        }
    }

    generateLandmasses() {
        // Simple Random Walk for Continents
        const numIslands = 5;
        for (let i = 0; i < numIslands; i++) {
            let cx = Math.floor(this.rng.next() * this.width);
            let cy = Math.floor(this.rng.next() * this.height);
            let size = 200 + Math.floor(this.rng.next() * 500);

            // Force center island to be big
            if (i === 0) {
                cx = Math.floor(this.width / 2);
                cy = Math.floor(this.height / 2);
                size = 1500; // Larger main continent
            }

            for (let j = 0; j < size; j++) {
                if (this.isValid(cx, cy)) {
                    this.landMap[cy][cx] = true;
                    // Expand a bit to make it less wormy
                    if (this.isValid(cx + 1, cy)) this.landMap[cy][cx + 1] = true;
                    if (this.isValid(cx, cy + 1)) this.landMap[cy + 1][cx] = true;
                }
                cx += Math.floor(this.rng.next() * 3) - 1;
                cy += Math.floor(this.rng.next() * 3) - 1;
            }
        }
    }

    paintTerrain() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.landMap[y][x]) {
                    const tile = this.map.getTile(x, y);
                    if (tile) tile.baseId = SPRITES.GRASS;
                }
            }
        }
    }

    generateTown() {
        // Place Town at Center of Map (assuming Land exists there)
        const cx = Math.floor(this.width / 2);
        const cy = Math.floor(this.height / 2);

        // Force Land at Center
        for (let y = cy - 15; y < cy + 15; y++) {
            for (let x = cx - 15; x < cx + 15; x++) {
                if (this.isValid(x, y)) {
                    this.landMap[y][x] = true;
                    this.map.getTile(x, y)!.baseId = SPRITES.GRASS;
                }
            }
        }

        // Generate Town Walled Area
        const w = 20;
        const h = 20;
        const tx = cx - 10;
        const ty = cy - 10;

        // Floor
        for (let y = ty; y < ty + h; y++) {
            for (let x = tx; x < tx + w; x++) {
                const tile = this.map.getTile(x, y);
                if (tile) tile.baseId = SPRITES.FLOOR_DIRT;
            }
        }

        // Walls
        for (let x = tx; x < tx + w; x++) {
            this.placeWall(x, ty, SPRITES.WALL_STONE_H);
            this.placeWall(x, ty + h - 1, SPRITES.WALL_STONE_H);
        }
        for (let y = ty; y < ty + h; y++) {
            this.placeWall(tx, y, SPRITES.WALL_STONE_V);
            this.placeWall(tx + w - 1, y, SPRITES.WALL_STONE_V);
        }

        // Corners
        this.placeWall(tx, ty, SPRITES.WALL_STONE_NW);
        this.placeWall(tx + w - 1, ty, SPRITES.WALL_STONE_NE);
        this.placeWall(tx, ty + h - 1, SPRITES.WALL_STONE_SW);
        this.placeWall(tx + w - 1, ty + h - 1, SPRITES.WALL_STONE_SE);

        // --- BUILDINGS ---

        // 1. Smithy (West Side)
        const smithyX = tx + 2; const smithyY = ty + 2;
        this.buildBuilding(smithyX, smithyY, 6, 6, SPRITES.WALL_STONE_H, SPRITES.FLOOR_STONE);
        this.map.getTile(smithyX + 2, smithyY + 2)!.addItem(new Item(SPRITES.CRATE));
        // Door: Link to Interior (5, 5)
        // Door is at center bottom of building: sx + 3, sy + 5
        const sDoorX = smithyX + 3; const sDoorY = smithyY + 5;
        this.map.getTile(sDoorX, sDoorY)!.baseId = SPRITES.FLOOR_STONE; // Clear wall
        this.map.getTile(sDoorX, sDoorY)!.removeWall();
        this.teleporters.push({ x: sDoorX, y: sDoorY, tx: 5 + 3, ty: 5 + 4 }); // To Interior

        // 2. Magic Shop (East Side)
        const magicX = tx + w - 8; const magicY = ty + 2;
        this.buildBuilding(magicX, magicY, 6, 6, SPRITES.WALL_STONE_H, SPRITES.FLOOR_WOOD);
        this.map.getTile(magicX + 2, magicY + 2)!.addItem(new Item(SPRITES.BARREL));
        // Door
        const mDoorX = magicX + 3; const mDoorY = magicY + 5;
        this.map.getTile(mDoorX, mDoorY)!.baseId = SPRITES.FLOOR_WOOD;
        this.map.getTile(mDoorX, mDoorY)!.removeWall();
        this.teleporters.push({ x: mDoorX, y: mDoorY, tx: 15 + 3, ty: 5 + 4 }); // To Interior at 15,5

        // 3. Temple (South/Center)
        this.buildBuilding(tx + 6, ty + 12, 8, 8, SPRITES.WALL_STONE_H, SPRITES.COBBLE);
        this.map.getTile(tx + 4, ty + 15)!.addItem(new Item(SPRITES.GOLD));

        // 4. Gates
        // Remove center walls for North/South gates
        this.map.getTile(cx, ty)!.baseId = SPRITES.FLOOR_DIRT;
        this.map.getTile(cx, ty)!.removeWall();
        this.map.getTile(cx, ty + h - 1)!.baseId = SPRITES.FLOOR_DIRT;
        this.map.getTile(cx, ty + h - 1)!.removeWall();
    }

    generateInteriors() {
        console.log("[MapGen] Generating Interiors at 0,0...");

        // 1. Smithy Interior (5, 5)
        // 8x8 Room
        const sX = 5; const sY = 5;
        this.buildBuilding(sX, sY, 8, 8, SPRITES.WALL_STONE_H, SPRITES.FLOOR_STONE);
        // Decor
        this.map.getTile(sX + 1, sY + 1)!.addItem(new Item(SPRITES.CRATE));
        this.map.getTile(sX + 6, sY + 1)!.addItem(new Item(SPRITES.AXE)); // Display
        // Exit Door (South)
        const sExitX = sX + 3; const sExitY = sY + 7;
        this.map.getTile(sExitX, sExitY)!.baseId = SPRITES.FLOOR_STONE;
        this.map.getTile(sExitX, sExitY)!.removeWall();
        // Teleport back to Town (Smithy Door: ~56+3, 56+5+1 -> 59, 62)
        // Wait, need exact coords. Calculated above as sDoorX, sDoorY.
        // Let's assume Town Center is 64,64.
        const cx = Math.floor(this.width / 2);
        const cy = Math.floor(this.height / 2);
        const tx = cx - 10; const ty = cy - 10;
        const sDoorX = tx + 2 + 3; const sDoorY = ty + 2 + 5;

        // Exit to just OUTSIDE the door (y+1)
        this.teleporters.push({ x: sExitX, y: sExitY, tx: sDoorX, ty: sDoorY + 1 });

        // 2. Magic Shop Interior (15, 5)
        const mX = 15; const mY = 5;
        this.buildBuilding(mX, mY, 8, 8, SPRITES.WALL_STONE_H, SPRITES.FLOOR_WOOD);
        // Decor
        this.map.getTile(mX + 1, mY + 1)!.addItem(new Item(SPRITES.BARREL));
        this.map.getTile(mX + 6, mY + 1)!.addItem(new Item(SPRITES.POTION));
        // Exit Door
        const mExitX = mX + 3; const mExitY = mY + 7;
        this.map.getTile(mExitX, mExitY)!.baseId = SPRITES.FLOOR_WOOD;
        this.map.getTile(mExitX, mExitY)!.removeWall();

        const mDoorX = tx + 20 - 8 + 3; const mDoorY = ty + 2 + 5;
        this.teleporters.push({ x: mExitX, y: mExitY, tx: mDoorX, ty: mDoorY + 1 });
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
        for (let x = bx; x < bx + w; x++) {
            this.placeWall(x, by, wallId);
            this.placeWall(x, by + h - 1, wallId);
        }
        for (let y = by; y < by + h; y++) {
            this.placeWall(bx, y, wallId);
            this.placeWall(bx + w - 1, y, wallId); // Use Horizontal sprite for vertical walls for now? Or pass vertical ID?
            // Actually, let's just use the ID passed. 
            // Ideally we'd distinguish, but OTSP walls might need corner logic.
            // For now, let's just use the passed ID (STONE_H) which looks like a generic block?
            // Wait, STONE_H is horizontal. STONE_V is vertical. 
            // Let's refine buildBuilding to accept wallVId if needed, or just cheat by using STONE_H everywhere for 'blocky' walls.
            // Let's cheat for simplicity or improve.
            // Improvement:
            this.placeWall(bx, y, SPRITES.WALL_STONE_V);
            this.placeWall(bx + w - 1, y, SPRITES.WALL_STONE_V);
        }
        // Door (Center Bottom)
        const doorX = bx + Math.floor(w / 2);
        const doorY = by + h - 1;
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

        // Entrance Arch / Structure (Optional)
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

    populateWorld() {
        // Generate Specific POIs randomly
        // 1. Dwarf Mine (West)
        let mineX = Math.floor(this.width * 0.2);
        let mineY = Math.floor(this.height * 0.5);
        this.generateDwarfMines(mineX, mineY);

        // 2. Orc Fortress (East)
        let fortX = Math.floor(this.width * 0.8);
        let fortY = Math.floor(this.height * 0.7);
        this.generateOrcFortress(fortX, fortY);

        // 3. Dragon Peak (North)
        let peakX = Math.floor(this.width * 0.5);
        let peakY = Math.floor(this.height * 0.15);
        this.generateDragonPeak(peakX, peakY);

        // Simple Biome Population
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.landMap[y][x]) continue; // Skip Water

                // Skip Safe Zone (Center)
                const dist = Math.sqrt((x - this.width / 2) ** 2 + (y - this.height / 2) ** 2);
                if (dist < 25) continue;

                // Random Population
                const r = this.rng.next();
                const tile = this.map.getTile(x, y);
                if (tile && tile.items.length === 0 && tile.baseId !== SPRITES.CUSTOM_SAND) {

                    // Trees (Forests)
                    if (r < 0.05) tile.addItem(new Item(SPRITES.TREE_PINE));
                    else if (r < 0.08) tile.addItem(new Item(SPRITES.TREE_OAK));

                    // Mobs (Handled by Main for now, or add mob spawners later)
                    else if (r < 0.09) tile.addItem(new Item(SPRITES.ROCK_LARGE));
                }
            }
        }
    }

    placeWall(x: number, y: number, type: number) {
        const tile = this.map.getTile(x, y);
        if (tile) {
            tile.baseId = SPRITES.WALL_STONE_H;
            tile.addItem(new Item(type));
        }
    }

    isValid(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}
