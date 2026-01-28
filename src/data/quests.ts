

import { Quest } from '../components';

export const QUEST_REGISTRY: Record<string, Quest> = {
    'q_sewer_duty': {
        id: 'q_sewer_duty',
        name: 'Sewer Duty',
        description: 'Old Man Jory needs you to clear out the sewers. Kill 10 Sewer Slimes.',
        type: 'KILL',
        targetId: 'Sewer Slime',
        targetCount: 10,
        current: 0,
        reward: { gold: 100, xp: 200, items: ['Rusty Key'] },
        completed: false,
        turnedIn: false
    },
    'q_the_clue': {
        id: 'q_the_clue',
        name: 'The Clue',
        description: 'You found a dirty note. Use it to decipher the text.',
        type: 'USE',
        targetId: 'Dirty Note',
        targetCount: 1,
        current: 0,
        reward: { gold: 0, xp: 50 }, // Reward is mostly the unlock
        completed: false,
        turnedIn: false // Auto-turn in?
    },
    'q_finding_grom': {
        id: 'q_finding_grom',
        name: 'Finding Grom',
        description: 'Find the entrance to Grom\'s Cave based on the clue.',
        type: 'EXPLORE',
        targetId: 'cave_entrance',
        targetCount: 1,
        current: 0,
        prereq: 'q_the_clue',
        reward: { gold: 50, xp: 100 },
        completed: false,
        turnedIn: false
    },
    'q_kings_beef': {
        id: 'q_kings_beef',
        name: 'The King\'s Beef',
        description: 'Grom wants the King\'s Roast Chicken. Steal it from the castle kitchen.',
        type: 'FETCH',
        targetId: 'Roast Chicken',
        targetCount: 1,
        current: 0,
        prereq: 'q_finding_grom', // Must meet Grom first
        reward: { gold: 500, xp: 500, items: ['Orcish Peace Treaty'] },
        completed: false,
        turnedIn: false
    },
    'rat_catcher': {
        id: 'rat_catcher',
        name: 'Rat Catcher',
        description: 'The village is overrun by rats. Kill 5 Rats.',
        type: 'KILL',
        targetId: 'Rat',
        targetCount: 5,
        current: 0,
        reward: { gold: 50, xp: 50 },
        completed: false,
        turnedIn: false
    },
    'wolf_hunt': {
        id: 'wolf_hunt',
        name: 'Wolf Hunt',
        description: 'Wolves are attacking the livestock. Kill 3 Wolves.',
        type: 'KILL',
        targetId: 'Wolf',
        targetCount: 3,
        current: 0,
        prereq: 'rat_catcher',
        reward: { gold: 100, xp: 150, items: ['Leather Legs'] },
        completed: false,
        turnedIn: false
    },
    'orc_menace': {
        id: 'orc_menace',
        name: 'Orc Menace',
        description: 'Orcs have been spotted near the east gate. Kill 5 Orcs.',
        type: 'KILL',
        targetId: 'Orc',
        targetCount: 5,
        current: 0,
        prereq: 'wolf_hunt',
        reward: { gold: 200, xp: 300, items: ['Iron Helmet'] },
        completed: false,
        turnedIn: false
    },
    'slay_warlord': {
        id: 'slay_warlord',
        name: 'Slay the Warlord',
        description: 'The Orc Warlord must be stopped. Kill 1 Orc Warlord.',
        type: 'KILL',
        targetId: 'Orc Warlord',
        targetCount: 1,
        current: 0,
        prereq: 'orc_menace',
        reward: { gold: 1000, xp: 1000, items: ['Knight Armor'] },
        completed: false,
        turnedIn: false
    }
};
