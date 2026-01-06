import { TileMap } from './game';
import { RNG } from './rng';

export function generateMap(width: number, height: number, seed: number): { width: number, height: number, tileSize: number, data: number[], entities: any[] } {
    const rng = new RNG(seed);
    const data = new Array(width * height).fill(16); // Fill with Grass (16)
    const entities: any[] = [];

    // Simple Procedural Generation
    // 1. Water Bodies
    // 2. Forests (Trees/Wood)
    // 3. Walls/Dungeons


    // Walls around edges
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                data[y * width + x] = 17; // Wall
            } else {
                // Random noise for terrain
                const rand = rng.next();
                if (rand < 0.05) {
                    data[y * width + x] = 18; // Water
                } else if (rand < 0.15) {
                    data[y * width + x] = 19; // Wood (Forest)
                }
            }
        }
    }

    // Spawn Player in Center
    const centerX = Math.floor(width / 2) * 32;
    const centerY = Math.floor(height / 2) * 32;

    // Clear "Town" Area (Safe Zone)
    const townRadius = 10;
    const centerTileX = Math.floor(centerX / 32);
    const centerTileY = Math.floor(centerY / 32);

    for (let y = centerTileY - townRadius; y <= centerTileY + townRadius; y++) {
        for (let x = centerTileX - townRadius; x <= centerTileX + townRadius; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Border of town
                if (Math.abs(x - centerTileX) === townRadius || Math.abs(y - centerTileY) === townRadius) {
                    // Add gates
                    if (x !== centerTileX && y !== centerTileY) {
                        data[y * width + x] = 17; // Wall
                    } else {
                        data[y * width + x] = 16; // Gate/Grass
                    }
                } else {
                    data[y * width + x] = 16; // Grass/Flooring
                }
            }
        }
    }

    // Spawn Player in Center
    entities.push({ type: 'player', x: centerX, y: centerY });

    // Helper: Generate House
    const generateHouse = (bx: number, by: number, w: number, h: number) => {
        const tx = Math.floor(bx / 32);
        const ty = Math.floor(by / 32);
        for (let y = ty; y < ty + h; y++) {
            for (let x = tx; x < tx + w; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    data[y * width + x] = 19; // Wood floor
                    if (x === tx || x === tx + w - 1 || y === ty || y === ty + h - 1) {
                        if (y === ty + h - 1 && x === tx + 2) {
                            // Door
                            data[y * width + x] = 19;
                        } else {
                            data[y * width + x] = 17; // Wall
                        }
                    }
                }
            }
        }
    };

    // Spawn Merchant House (East of Center)
    generateHouse(centerX + 64, centerY - 32, 5, 5);
    entities.push({ type: 'merchant', x: centerX + 64 + 64, y: centerY + 32 });

    // Spawn NPC House (West of Center)
    generateHouse(centerX - 192, centerY - 32, 5, 5);
    entities.push({ type: 'npc', x: centerX - 128, y: centerY + 32, text: "Beware the deep woods..." });

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
    const levels = 3;

    // Level 1: (80, 80)
    // Level 2: (40, 80)
    // Level 3: (10, 80) [Boss Layer]

    const levelConfigs = [
        { ox: 80, oy: 80, w: 30, h: 30, density: 15, mobs: ['ghost', 'slime'] },
        { ox: 40, oy: 80, w: 30, h: 30, density: 20, mobs: ['ghost', 'ghost', 'slime', 'skeleton'] }, // Harder
        { ox: 10, oy: 80, w: 30, h: 30, density: 10, mobs: ['ghost', 'slime'] } // Boss Room
    ];

    // Village Entrance -> Level 1
    const l1OriginX = levelConfigs[0].ox;
    const l1OriginY = levelConfigs[0].oy;
    const villageStairsX = centerX;
    const villageStairsY = centerY + 64;

    entities.push({
        type: 'teleporter', x: villageStairsX, y: villageStairsY,
        targetX: (l1OriginX + 2) * 32, targetY: (l1OriginY + 2) * 32 + 48
    });
    entities.push({ type: 'teleporter', x: (l1OriginX + 2) * 32, y: (l1OriginY + 2) * 32, targetX: villageStairsX, targetY: villageStairsY + 48 });

    data[Math.floor(villageStairsY / 32) * width + Math.floor(villageStairsX / 32)] = 19; // Wood floor mark

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

        // Enemies
        if (i === levels - 1) {
            // BOSS ROOM
            entities.push({ type: 'boss', x: (ox + cfg.w / 2) * 32, y: (oy + cfg.h / 2) * 32 });
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

    return {
        width,
        height,
        tileSize: 32,
        data,
        entities
    };
}
