import { Quest } from '../components';

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
    }
};
