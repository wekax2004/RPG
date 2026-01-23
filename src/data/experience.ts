// src/data/experience.ts

/**
 * Tibia Experience Formula
 * Level 1: 0
 * Level 2: 100
 * Level 8: 4200
 */
export function getExpForLevel(level: number): number {
    if (level <= 1) return 0;
    // Formula: 50 * (level^3 - 5.5*level^2 + 15*level - 5) / 3
    return Math.floor(50 * (Math.pow(level, 3) - 5.5 * Math.pow(level, 2) + 15 * level - 5) / 3);
}
