
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
        20,  // Altar
        50,  // Chest
        // New Forest Props
        5, // Oak Tree
        6, // Large Rock
        7  // Bush
    ]),

    isSolid(id: number): boolean {
        return this.SOLIDS.has(id);
    }
};
