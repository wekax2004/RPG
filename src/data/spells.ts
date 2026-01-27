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
    // --- Generic ---
    "exura": {
        name: "Light Healing",
        words: "exura",
        mana: 20,
        level: 8,
        cooldown: 1.0,
        type: 'instant',
        effect: 'heal',
        power: 30
    },
    "utani hur": {
        name: "Haste",
        words: "utani hur",
        mana: 60,
        level: 14,
        cooldown: 2.0,
        type: 'instant',
        effect: 'haste',
        power: 1.3
    },
    "paralize": {
        name: "Paralize Rune",
        words: "adana ani",
        mana: 1400,
        level: 54,
        cooldown: 2.0,
        type: 'rune',
        effect: 'damage_aoe',
        power: 0
    },
    "utevo lux": {
        name: "Light",
        words: "utevo lux",
        mana: 20,
        level: 8,
        cooldown: 1.0,
        type: 'instant',
        effect: 'haste', // Using haste hook for now, ideally needs light logic
        power: 0 // No speed boost
    },

    // --- Knight ---
    "exori": {
        name: "Berserk",
        words: "exori",
        mana: 110, // Classic 7.4 was Mana based (Percent later)
        level: 35,
        cooldown: 4.0,
        type: 'instant',
        effect: 'damage_aoe',
        power: 150
    },
    "exori gran": {
        name: "Fierce Berserk",
        words: "exori gran",
        mana: 340,
        level: 90,
        cooldown: 6.0,
        type: 'instant',
        effect: 'damage_aoe',
        power: 300
    },

    // --- Paladin ---
    "exura san": {
        name: "Divine Healing",
        words: "exura san",
        mana: 160,
        level: 60,
        cooldown: 1.0,
        type: 'instant',
        effect: 'heal',
        power: 200
    },
    "exori con": {
        name: "Ethereal Spear",
        words: "exori con",
        mana: 25,
        level: 23,
        cooldown: 2.0,
        type: 'instant',
        effect: 'damage_aoe', // Needs targeted logic really
        power: 80
    },

    // --- Mages (Sorc/Druid) ---
    "exura gran": {
        name: "Intense Healing",
        words: "exura gran",
        mana: 70,
        level: 20,
        cooldown: 1.0,
        type: 'instant',
        effect: 'heal',
        power: 150 // Stronger than exura
    },
    "exori vis": {
        name: "Energy Strike",
        words: "exori vis",
        mana: 20,
        level: 12,
        cooldown: 2.0,
        type: 'instant',
        effect: 'damage_aoe', // Frontal cone typically, using AOE for now
        power: 60
    },
    "exori flam": {
        name: "Fire Strike",
        words: "exori flam",
        mana: 20,
        level: 12,
        cooldown: 2.0,
        type: 'instant',
        effect: 'damage_aoe',
        power: 60
    },
    "exevo gran mas vis": {
        name: "Rage of the Skies",
        words: "exevo gran mas vis",
        mana: 600, // Expensive
        level: 60,
        cooldown: 10.0,
        type: 'instant',
        effect: 'damage_aoe', // Big AOE
        power: 600 // Nuke
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
