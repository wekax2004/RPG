
export interface ManifestItem {
    id: string; // Unique String ID (e.g. "fire_sword")
    name: string;
    type: 'weapon' | 'armor' | 'container' | 'food' | 'other' | 'item';
    imagePath?: string; // Optional path to custom PNG (relative to public/)
    postProcess?: string; // e.g. 'tile_center'
    spriteId: number; // For now manual, later auto-assigned
    stats: {
        attack?: number;
        defense?: number;
        heal?: number;
        slot?: string;
        price?: number;
    };
    description?: string;
}

export const MANIFEST: ManifestItem[] = [
    {
        id: "fire_sword",
        name: "Fire Sword",
        type: "weapon",
        imagePath: "items/fire_sword.png",
        spriteId: 2000,
        stats: {
            attack: 45,
            price: 5000,
            slot: "rhand"
        },
        description: "A blade wreathed in eternal flame."
    },
    {
        id: "ice_bow",
        name: "Ice Bow",
        type: "weapon",
        imagePath: "items/ice_bow.png",
        spriteId: 2001,
        stats: {
            attack: 35,
            price: 3000,
            slot: "lhand"
        },
        description: "Freezes enemies on contact."
    },
    {
        id: "mega_backpack",
        name: "Mega Backpack",
        type: "container",
        imagePath: "items/mega_backpack.png",
        spriteId: 2002,
        stats: {
            slot: "backpack",
            price: 200
        },
        description: "Holds 40 slots! (Implementation limit may apply)"
    },
    // --- TERRAIN OVERRIDES ---
    {
        id: "cobblestone_custom",
        name: "Custom Cobblestone",
        type: "other",
        imagePath: "tiles/custom_cobble.png",
        spriteId: 446, // OVERRIDES SPRITES.COBBLE
        stats: {},
        description: "A custom pavement."
    },
    // --- EDRON OVERRIDES ---
    {
        id: "edron_wall_v",
        name: "Edron Wall (Vertical)",
        type: "other",
        imagePath: "tiles/edron/wall_white.png", // Use polished WHITE MARBLE
        spriteId: 1054,
        stats: {}
    },
    {
        id: "edron_wall_h",
        name: "Edron Wall (Horizontal)",
        type: "other",
        imagePath: "tiles/edron/wall_white.png", // Use polished WHITE MARBLE
        spriteId: 1052,
        stats: {}
    },
    {
        id: "edron_decor_lamp",
        name: "Edron Street Lamp",
        type: "other",
        imagePath: "tiles/edron/lamp_post.png",
        postProcess: "crop_center:32,64|remove_black",
        spriteId: 1060,
        stats: {}
    },
    {
        id: "edron_decor_statue",
        name: "Edron Hero Statue",
        type: "other",
        imagePath: "tiles/edron/statue_hero.png",
        spriteId: 1061,
        stats: {}
    },
    {
        id: "edron_floor_ornate",
        name: "Edron Ornate Floor",
        type: "other",
        imagePath: "tiles/edron/floor_ornate.png",
        spriteId: 1065,
        stats: {}
    },
    {
        id: "edron_floor_wood",
        name: "Edron Clean Wood Floor",
        type: "other",
        imagePath: "tiles/edron/floor_wood_clean.png",
        spriteId: 1066,
        stats: {}
    },
    {
        id: "edron_shop_counter",
        name: "Edron Shop Counter",
        type: "other",
        imagePath: "tiles/edron/shop_counter.png",
        spriteId: 1075,
        stats: {}
    },
    {
        id: "edron_pillar",
        name: "Edron Pillar",
        type: "other",
        imagePath: "tiles/edron/pillar.png",
        spriteId: 1050,
        stats: {}
    },
    // MOBS
    {
        id: "mob_bandit",
        name: "Bandit Custom",
        type: "other",
        imagePath: "sprites/bandit.png",
        postProcess: "skip_transparency",
        spriteId: 210, // Must match constants.ts BANDIT
        stats: {}
    },
    {
        id: "edron_dirt_road",
        name: "Edron Dirt Road",
        type: "other",
        imagePath: "tiles/edron/floor_dirt.png",
        spriteId: 6013,
        stats: {}
    },
    {
        id: "mob_cyclops",
        name: "Cyclops Custom",
        type: "other",
        imagePath: "sprites/cyclops.png",
        spriteId: 7003, // Must match constants.ts CYCLOPS
        stats: {}
    },
    // CORNERS (Sharing one sprite for now)
    { id: "edron_corner_tl", name: "Edron Corner TL", type: "other", imagePath: "tiles/edron/wall_corner.png", spriteId: 1056, stats: {} },
    { id: "edron_corner_tr", name: "Edron Corner TR", type: "other", imagePath: "tiles/edron/wall_corner.png", spriteId: 1055, stats: {} },
    { id: "edron_corner_bl", name: "Edron Corner BL", type: "other", imagePath: "tiles/edron/wall_corner.png", spriteId: 1058, stats: {} },
    { id: "edron_corner_br", name: "Edron Corner BR", type: "other", imagePath: "tiles/edron/wall_corner.png", spriteId: 1057, stats: {} },

    // FLOORS
    { id: "edron_pavement", name: "Edron Pavement", type: "other", imagePath: "tiles/edron/floor_pavement.png", spriteId: 450, stats: {} },
    { id: "edron_checkered", name: "Edron Checkered", type: "other", imagePath: "tiles/edron/floor_checkered.png", spriteId: 406, stats: {} },
    { id: "edron_stone", name: "Edron Stone Floor", type: "other", imagePath: "tiles/edron/floor_stone.png", spriteId: 405, stats: {} },
    { id: "edron_wood", name: "Edron Wood Floor", type: "other", imagePath: "tiles/edron/floor_wood.png", spriteId: 401, stats: {} },
    {
        id: "mob_rat",
        name: "Rat",
        type: "other",
        imagePath: "sprites/giant_rat.png", // Using Giant Rat for now
        postProcess: "skip_transparency",
        spriteId: 200, // SPRITES.RAT
        stats: {}
    },
    {
        id: "mob_wolf",
        name: "Wolf",
        type: "other",
        imagePath: "sprites/wolf_standalone.png",
        postProcess: "skip_transparency",
        spriteId: 201, // SPRITES.WOLF
        stats: {}
    },
    {
        id: "mob_skeleton",
        name: "Skeleton",
        type: "other",
        imagePath: "sprites/skeleton.png",
        postProcess: "skip_transparency",
        spriteId: 202, // SPRITES.SKELETON
        stats: {}
    },
    {
        id: "mob_slime",
        name: "Slime",
        type: "other",
        imagePath: "sprites/slime.png",
        spriteId: 203, // SPRITES.SLIME
        stats: {}
    },
    {
        id: "mob_bear",
        name: "Bear",
        type: "other",
        // I see polar_bear.png but no brown bear.png?
        // Checking file list... 'otsp_creatures_01.png'.
        // I'll skip Bear if I don't have a file.
        // But I have 'polar_bear.png'.
        spriteId: 204, // SPRITES.BEAR
        stats: {}
    },
    {
        id: "mob_polar_bear",
        name: "Polar Bear",
        type: "other",
        imagePath: "sprites/polar_bear.png",
        spriteId: 320, // SPRITES.POLAR_BEAR
        stats: {}
    },
    {
        id: "mob_orc",
        name: "Orc",
        type: "other",
        imagePath: "sprites/orc.png",
        spriteId: 9, // SPRITES.ORC (Wait, constants said 9?)
        stats: {}
    },
    {
        id: "mob_orc_warrior",
        name: "Orc Warrior",
        type: "other",
        imagePath: "sprites/orc_warrior.png",
        spriteId: 58, // SPRITES.ORC default was 58 in mobs.ts? 
        // constants.ts says ORC=9.
        // I'll register 58 too just in case.
        stats: {}
    },
    {
        id: "mob_orc_warlord",
        name: "Orc Warlord",
        type: "other",
        imagePath: "sprites/orc_warlord.png",
        spriteId: 333, // SPRITES.ORC_WARLORD
        stats: {}
    },
    {
        id: "mob_ghost",
        name: "Ghost",
        type: "other",
        imagePath: "sprites/ghost.png",
        spriteId: 301, // SPRITES.GHOST (implied from mobs.ts?)
        // constants.ts didn't explicitly list GHOST=301 but mobs.ts used it.
        // I will assume 301.
        stats: {}
    },
    {
        id: "mob_zombie",
        name: "Zombie",
        type: "other",
        imagePath: "sprites/zombie.png",
        spriteId: 300, // SPRITES.ZOMBIE
        postProcess: "remove_black",
        stats: {}
    },
    {
        id: "mob_snake",
        name: "Snake",
        type: "other",
        imagePath: "sprites/snake.png",
        spriteId: 324, // SPRITES.SNAKE
        stats: {}
    },
    {
        id: "mob_yeti",
        name: "Yeti",
        type: "other",
        imagePath: "sprites/yeti.png",
        spriteId: 321, // SPRITES.YETI
        stats: {}
    },
    {
        id: "mob_hydra",
        name: "Hydra",
        type: "other",
        imagePath: "sprites/hydra.png",
        spriteId: 332, // SPRITES.HYDRA
        stats: {}
    },
    {
        id: "mob_frost_giant",
        name: "Frost Giant",
        type: "other",
        imagePath: "sprites/frost_giant.png",
        spriteId: 330, // SPRITES.FROST_GIANT
        stats: {}
    },
    {
        id: "mob_necromancer",
        name: "Necromancer",
        type: "other",
        imagePath: "sprites/necromancer.png",
        spriteId: 289, // SPRITES.NECROMANCER
        stats: {}
    },
    {
        id: "mob_scorpion_king",
        name: "Scorpion King",
        type: "other",
        imagePath: "sprites/scorpion_king.png",
        spriteId: 322, // SPRITES.SCORPION_KING
        stats: {}
    },
    {
        id: "mob_mummy",
        name: "Mummy",
        type: "other",
        imagePath: "sprites/mummy.png",
        spriteId: 323, // SPRITES.MUMMY
        stats: {}
    },
    {
        id: "npc_banker",
        name: "Banker NPC",
        type: "other",
        imagePath: "sprites/npc_banker.png",
        spriteId: 263, // SPRITES.NPC_BANKER
        stats: {}
    },
    {
        id: "npc_guide",
        name: "Guide NPC",
        type: "other",
        imagePath: "sprites/npc_guide.png",
        spriteId: 262, // SPRITES.NPC_GUIDE
        stats: {}
    },
    {
        id: "npc_blacksmith",
        name: "Blacksmith NPC",
        type: "other",
        imagePath: "sprites/npc_blacksmith.png",
        spriteId: 265, // SPRITES.NPC_BLACKSMITH
        stats: {}
    },
    {
        id: "npc_wizard",
        name: "Wizard NPC",
        type: "other",
        imagePath: "sprites/npc_wizard.png",
        spriteId: 264, // SPRITES.NPC_WIZARD
        stats: {}
    },
    {
        id: "npc_priest",
        name: "Priest NPC",
        type: "other",
        imagePath: "sprites/npc_priest.png",
        spriteId: 266,
        stats: {}
    },
    {
        id: "npc_merchant",
        name: "Merchant NPC",
        type: "other",
        imagePath: "sprites/npc_merchant.png",
        spriteId: 260,
        stats: {}
    },
    {
        id: "npc_healer",
        name: "Healer NPC",
        type: "other",
        imagePath: "sprites/npc_healer.png",
        spriteId: 261,
        stats: {}
    },
    {
        id: "mob_royal_guard",
        name: "Royal Guard",
        type: "other",
        imagePath: "sprites/royal_guard.png",
        spriteId: 267, // SPRITES.GUARD
        stats: {}
    },
    {
        id: "gold_coin",
        name: "Gold Coin",
        type: "other",
        imagePath: "items/gold_coin.png",
        spriteId: 40, // SPRITES.GOLD
        stats: {
            price: 1,
            heal: 50,
            // stackable: true // Not in stats type
        }
    }
];
