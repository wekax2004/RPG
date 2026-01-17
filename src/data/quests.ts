import { SPRITES } from '../constants';
import { Quest } from '../components';

export const QUEST_REGISTRY: Record<string, Partial<Quest>> = {
    'rat_catcher': {
        name: "Rat Catcher",
        description: "The sewers are overrun! Kill 10 Rats for me.",
        type: 'kill',
        target: 'Rat', // Matches Mob Name
        required: 10,
        current: 0,
        reward: {
            gold: 50,
            xp: 100,
            items: [] // Title handling will be special
        }
    },
    'wolf_hunt': {
        name: "Wolf Hunt",
        description: "Wolves are attacking the livestock. Cull 5 of them.",
        type: 'kill',
        target: 'Wolf',
        required: 5,
        current: 0,
        reward: {
            gold: 100,
            xp: 250,
            items: ['Leather Legs', 'Orchard Key'] // Key ID 101
        }
    },
    'orc_menace': {
        name: "Orc Menace",
        description: "Orcs have taken the mines. Kill 10 Orc Warriors.",
        type: 'kill',
        target: 'Orc Warrior',
        required: 10,
        current: 0,
        reward: {
            gold: 200,
            xp: 500,
            items: ['Chain Armor', 'Mine Key'] // Key ID 102
        }
    },
    'slay_warlord': {
        name: "Slay the Warlord",
        description: "The Orc Warlord commands them. End him.",
        type: 'kill',
        target: 'Orc Warlord',
        required: 1,
        current: 0,
        reward: {
            gold: 1000,
            xp: 2000,
            items: ['Golden Helmet'] // Epic Reward
        }
    }
};

export const MOBS_BY_QUEST: Record<string, string> = {
    'Rat': 'rat_catcher',
    'Wolf': 'wolf_hunt',
    'Orc Warrior': 'orc_menace',
    'Orc Warlord': 'slay_warlord'
};
