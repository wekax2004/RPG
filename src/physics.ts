
export const PHYSICS = {
    // Solid Item IDs
    SOLIDS: new Set([
        17, // Wall
        18, // Old Tree
        19, // Old Rock
        34, // Old Bush
        37, // Cactus
        57, // Dead Tree
        100, // Generic Block
        200, // Water
        202, // Deep Water
        20,  // Altar (Old?)
        21,  // Altar (MapGen)
        50,  // Chest
        // New Forest Props
        50, // Tree Pine
        51, // Tree Oak
        6, // Large Rock
        7, // Bush
        30, // Barrel
        31, // Crate
        // OTSP Walls
        210, 211, 212, 213, 214, 215, 216, 217, 218,
        // Custom Water
        304,
        // Standard Water
        13, 26
    ]),

    isSolid(id: number): boolean {
        return this.SOLIDS.has(id);
    }
};
