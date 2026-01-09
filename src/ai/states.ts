/**
 * AI State Machine - Defines the possible states for enemy AI.
 */
export enum AIState {
    IDLE,     // Wandering randomly, looking for player
    CHASE,    // Hunting player, moving toward them
    ATTACK,   // In range, standing still and attacking
    FLEE      // Low health, running away from player
}

/**
 * Get human-readable name for AI state (for debug display).
 */
export function getStateName(state: AIState): string {
    switch (state) {
        case AIState.IDLE: return 'IDLE';
        case AIState.CHASE: return 'CHASE';
        case AIState.ATTACK: return 'ATTACK';
        case AIState.FLEE: return 'FLEE';
        default: return 'UNKNOWN';
    }
}
