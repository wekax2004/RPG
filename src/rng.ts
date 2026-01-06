export class RNG {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    // Linear Congruential Generator (LCG)
    // Parameters from numerical recipes or similar standard constants
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    // Returns integer in [0, max-1]
    nextInt(max: number): number {
        return Math.floor(this.next() * max);
    }
}
