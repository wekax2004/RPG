export interface SpellDefinition {
    name: string;
    words: string;
    mana: number;
    level: number; // Magic Level required
    cooldown: number; // Seconds
    type: 'instant' | 'rune' | 'passive';
    effect: 'heal' | 'haste' | 'damage_aoe' | 'create_food';
    power: number; // Base power (healing amount, damage, speed boost)
    icon?: number; // Sprite ID for UI
}

export const SPELLS: Record<string, SpellDefinition> = {
    "exura": {
        name: "Light Healing",
        words: "exura",
        mana: 20,
        level: 1,
        cooldown: 1.0,
        type: 'instant',
        effect: 'heal',
        power: 30
    },
    "utani hur": {
        name: "Haste",
        words: "utani hur",
        mana: 60,
        level: 4,
        cooldown: 2.0,
        type: 'instant',
        effect: 'haste',
        power: 1.5 // 50% Speed boost
    },
    "exori": {
        name: "Berserk",
        words: "exori",
        mana: 100,
        level: 5,
        cooldown: 4.0,
        type: 'instant',
        effect: 'damage_aoe',
        power: 150
    },
    "exevo pan": {
        name: "Create Food",
        words: "exevo pan",
        mana: 40,
        level: 2,
        cooldown: 10.0,
        type: 'instant',
        effect: 'create_food',
        power: 1
    }
};

// Helper to find spell by words
export function findSpellByWords(text: string): SpellDefinition | undefined {
    const lower = text.toLowerCase().trim();
    return Object.values(SPELLS).find(s => s.words === lower);
}
