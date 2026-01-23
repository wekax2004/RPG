/**
 * Simplex/Perlin Noise Implementation for Tibia-Style Map Generation
 * Used to create natural-looking terrain distributions
 */

// Permutation table for noise generation
const PERM: number[] = [];
const GRAD3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];

// Initialize permutation table with seed
function initPerm(seed: number): void {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) p[i] = i;

    // Fisher-Yates shuffle with seed
    let n = seed;
    for (let i = 255; i > 0; i--) {
        n = (n * 16807) % 2147483647;
        const j = n % (i + 1);
        [p[i], p[j]] = [p[j], p[i]];
    }

    // Duplicate for overflow
    for (let i = 0; i < 512; i++) {
        PERM[i] = p[i & 255];
    }
}

// Dot product helper
function dot2(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
}

// Fast floor
function fastFloor(x: number): number {
    return x > 0 ? Math.floor(x) : Math.floor(x) - 1;
}

/**
 * 2D Simplex Noise
 * Returns value between -1 and 1
 */
export function simplex2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    // Skew input space
    const s = (x + y) * F2;
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);

    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;

    // Determine simplex
    let i1: number, j1: number;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    // Hash coordinates
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = PERM[ii + PERM[jj]] % 12;
    const gi1 = PERM[ii + i1 + PERM[jj + j1]] % 12;
    const gi2 = PERM[ii + 1 + PERM[jj + 1]] % 12;

    // Calculate contributions
    let n0 = 0, n1 = 0, n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
        t0 *= t0;
        n0 = t0 * t0 * dot2(GRAD3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
        t1 *= t1;
        n1 = t1 * t1 * dot2(GRAD3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
        t2 *= t2;
        n2 = t2 * t2 * dot2(GRAD3[gi2], x2, y2);
    }

    // Scale to [-1, 1]
    return 70 * (n0 + n1 + n2);
}

/**
 * Fractal Brownian Motion (fBm)
 * Combines multiple octaves of noise for natural terrain
 */
export function fbm(x: number, y: number, octaves: number = 4, persistence: number = 0.5): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        total += simplex2D(x * frequency, y * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }

    return total / maxValue;
}

/**
 * Generate a height map matrix
 * Returns 2D array with values 0-3:
 *   0 = Deep Water
 *   1 = Shallow Water (Coast)
 *   2 = Sand
 *   3 = Grass
 *   4 = Mountain (high elevation)
 */
export function generateHeightMap(
    width: number,
    height: number,
    seed: number,
    scale: number = 0.02
): number[][] {
    initPerm(seed);

    const map: number[][] = [];

    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
            // Get noise value (-1 to 1), normalize to (0 to 1)
            const n = (fbm(x * scale, y * scale, 6, 0.5) + 1) / 2;

            // Apply thresholds for terrain types
            if (n < 0.35) map[y][x] = 0;       // Deep Water
            else if (n < 0.42) map[y][x] = 1;  // Shallow Water
            else if (n < 0.48) map[y][x] = 2;  // Sand
            else if (n < 0.75) map[y][x] = 3;  // Grass
            else map[y][x] = 4;                 // Mountain
        }
    }

    return map;
}

/**
 * Generate island mask (for isolated landmasses)
 * Creates falloff from center to edges
 */
export function generateIslandMask(
    width: number,
    height: number,
    falloffStrength: number = 2.5
): number[][] {
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    const mask: number[][] = [];

    for (let y = 0; y < height; y++) {
        mask[y] = [];
        for (let x = 0; x < width; x++) {
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            const normalized = dist / maxDist;
            // Exponential falloff
            mask[y][x] = Math.max(0, 1 - Math.pow(normalized, falloffStrength));
        }
    }

    return mask;
}

/**
 * Apply island mask to height map
 * Combines noise with falloff for island-shaped continents
 */
export function applyIslandMask(heightMap: number[][], mask: number[][]): void {
    const height = heightMap.length;
    const width = heightMap[0].length;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // If mask is low (near edges), force water
            if (mask[y][x] < 0.3) {
                heightMap[y][x] = 0; // Deep water
            } else if (mask[y][x] < 0.4 && heightMap[y][x] > 1) {
                heightMap[y][x] = 1; // Force shallow near edges
            }
        }
    }
}

// Terrain type constants (for clarity)
export const TERRAIN = {
    DEEP_WATER: 0,
    SHALLOW_WATER: 1,
    SAND: 2,
    GRASS: 3,
    MOUNTAIN: 4
} as const;

export type TerrainType = typeof TERRAIN[keyof typeof TERRAIN];
