export namespace SPRITES {
    export const GRASS = 10;
    export const GRASS_FLOWERS = 16;
    export const DIRT = 11;
    export const COBBLE = 446;
    export const PAVEMENT_LIGHT = 450;
    export const WATER = 13;
    export const FLOOR_WOOD = 14;
    export const FLOOR_STONE = 15;

    export const WALL = 21;
    export const WALL_VERTICAL = 23;
    export const STONE_WALL = 17;
    export const STONE_PILLAR = 1050; // New Pillar Sprite

    // Edron White Stone Walls
    export const WHITE_WALL_VERTICAL = 1054;
    export const WHITE_WALL_HORIZONTAL = 1052;
    export const WHITE_WALL_CORNER_TL = 1056;
    export const WHITE_WALL_CORNER_TR = 1055;
    export const WHITE_WALL_CORNER_BL = 1058;
    export const WHITE_WALL_CORNER_BR = 1057;
    export const WHITE_STONE_PILLAR = 1050; // Edron Pillar
    export const EDRON_LAMP = 1060;         // Edron Lamp Post
    export const EDRON_STATUE = 1061;       // Edron Hero Statue
    export const EDRON_FLOOR_ORNATE = 1065; // Edron Interior Floor
    export const EDRON_FLOOR_WOOD = 1066;   // Clean Wood Floor
    export const EDRON_SHOP_COUNTER = 1075; // Shop Counter

    export const BARREL = 30;
    export const CRATE = 31;
    export const TORCH = 32;
    export const BACKPACK = 8043;
    export const SMALL_BAG = 8042;
    export const ZOMBIE = 300;
    export const GHOST = 301;

    export const GOLD = 8008;
    export const POTION = 8006;
    export const APPLE = 8040;
    export const MEAT = 8041;
    export const MANA_POTION = 8007;
    export const SHOVEL = 8053;
    export const ROPE = 8052;
    export const MACHETE = 43;
    export const PICKAXE = 8054;
    export const HOLE = 125; // Sprite for open hole
    export const ROPE_SPOT = 126; // Sprite for rope spot/ceiling hole
    export const CORPSE = 299;

    // Interactive Objects
    export const DOOR_LOCKED_H = 1080;
    export const DOOR_LOCKED_V = 1081;
    export const CHEST = 1082;
    export const CHEST_OPEN = 1083;
    export const IRON_KEY = 1084;

    // UI Sprites
    export const SWORD = 42;
    export const ARMOR = 43;
    export const LEGS = 45;
    export const SHIELD = 46;

    // Legendary Sets
    export const GOLDEN_HELMET = 100;
    export const GOLDEN_ARMOR = 101;
    export const GOLDEN_LEGS = 102;
    export const GOLDEN_BOOTS = 103;
    export const GOLDEN_SHIELD = 104;

    // Elf / Ranger Set
    export const ELF_ICICLE_BOW = 110; // Placeholder name for the weapon
    export const ELF_ARMOR = 111;
    export const ELF_LEGS = 112;
    export const ELF_BOOTS = 113;

    // Dwarf Set
    export const DWARF_HELMET = 120;
    export const DWARF_ARMOR = 121;
    export const DWARF_LEGS = 122;
    export const DWARF_SHIELD = 123;
    // DWARF_GUARD moved to MOBS section (ID 251)

    // Weapons
    export const AXE = 130;
    export const CLUB = 131;

    // Bulk Integration - Nature & Decor
    // Bulk Integration - Nature & Decor
    // Reverting to Procedural Assets (Safe Fallback)
    export const TREE_PINE = 50;
    export const TREE_OAK = 51; // Procedural Tree
    export const ROCK_LARGE = 6;  // Procedural Rock
    export const GEM_RUBY = 230;    // Changed from 203 to avoid conflict with SLIME
    export const GEM_SAPPHIRE = 231; // Changed from 204 to avoid conflict with BEAR/GHOST/ZOMBIE

    // Bulk Integration - Walls/Floors
    // Bulk Integration - Walls/Floors
    export const ICE_SHARD = 3160;
    export const WALL_STONE_V = 210; // Vertical (Index 3)
    export const WALL_STONE_H = 211; // Horizontal (Index 1)
    export const WALL_STONE_NW = 215; // Corner NW (Index 0)
    export const WALL_STONE_NE = 216; // Corner NE (Index 2)
    export const WALL_STONE_SW = 217; // Corner SW (Index 4)
    export const WALL_STONE_SE = 218; // Corner SE (Index 5)
    export const FLOOR_DIRT = 11;    // Procedural Dirt (Keep)
    export const FLOOR_GRASS_VAR = 16; // Procedural Grass Var

    // Rookgaard
    export const SANDSTONE = 310;
    export const TEMPLE_FLOOR = 311;
    export const SEWER_GRATE = 312;

    // --- CUSTOM GENERATED ASSETS ---
    export const CUSTOM_SAND = 301;
    export const CUSTOM_WOOD_FENCE = 302;
    export const CUSTOM_DRAGON_HATCHLING = 303;
    export const DRAGON_LORD = 310;
    export const CUSTOM_WATER = 304;
    export const CUSTOM_DIRT_PATH = 305;
    export const CUSTOM_DOOR_WOODEN = 306;

    export const PLAYER = 199; // Changed from 100 to avoid conflict with GOLDEN_HELMET

    export const TREE = 50;
    export const OAK_TREE = 51; // Was 5 (Unmapped)
    export const ROCK = 6;

    export const RAT = 200;
    export const WOLF = 201;
    export const SKELETON = 202;
    export const SLIME = 203;
    export const BEAR = 204;

    // MOBS
    // MOBS & VARIANTS
    export const ORC = 9;
    export const ORC_PEON = 252;
    // ORC_WARLORD moved to BOSSES section (ID 333)

    export const ORC_RIDER = 253;
    export const DWARF_GUARD = 251;
    export const DWARF_MINER = 254;
    export const DWARF_GEOMANCER = 255; // Mage

    // TOWN NPCS
    export const NPC_MERCHANT = 260; // Generic
    export const NPC_HEALER = 261;   // Generic
    export const NPC_GUIDE = 262;    // Generic

    // SPECIFIC NPCS
    export const NPC_BANKER = 263;
    export const NPC_WIZARD = 264;
    export const NPC_BLACKSMITH = 265;
    export const NPC_PRIEST = 266;
    export const NPC_BEGGAR = 267;

    // --- MISSING PLACEHOLDERS ---
    export const MAGE = 265;
    export const RANGER = 266;
    export const GUARD = 267;
    export const ICE_WOLF = 270;
    export const FROST_MAGE = 271;
    export const THUNDER_STAFF = 272;
    // YETI moved to BIOME MOBS section (ID 321)
    export const FROST_HELM = 274;
    export const ICE_BOW = 275;
    export const CRAB = 276;
    export const SIREN = 277;

    // NEW MOBS
    export const BANDIT = 212;
    export const CYCLOPS = 7003;
    export const CYCLOPS_DRONE = 7004;
    export const CYCLOPS_SMITH = 7005;
    export const SCARAB = 7006;
    export const LARVA = 7007;
    export const PALM_TREE = 52;
    // HYDRA moved to BOSSES section (ID 332)
    export const GOLEM = 279;
    export const BASILISK = 280;
    export const WOODEN_SWORD = 281;
    export const WOODEN_SHIELD = 282;
    export const STAIRS = 283;
    export const SCORPION = 284;
    // MUMMY moved to BIOME MOBS section (ID 323)
    export const SPIDER = 286;
    export const MAGMA_ARMOR = 287;
    // FIRE_SWORD moved to ELEMENTAL WEAPONS section (ID 500)
    export const NECROMANCER = 289;
    export const FIREBALL = 290;
    export const SPARKLE = 291;
    export const BONES = 292;

    // CORPSE VARIANTS
    export const RAT_DEAD = 293;
    export const WOLF_DEAD = 294;
    export const BEAR_DEAD = 295;
    export const SPIDER_DEAD = 296;
    export const ORC_DEAD = 297;
    export const HUMAN_CORPSE = 298; // Bandit/Necro
    export const ZOMBIE_DEAD = 22; // Reuse BONES for now or 299
    export const SLIME_PUDDLE = 26; // Reuse

    // --- BIOME TILES ---
    export const SNOW = 310;
    export const SAND = 311;
    export const SWAMP_MUD = 312;
    export const ICE = 313;
    // export const SANDSTONE = 314; // Duplicate, using 310
    export const JUNGLE_GRASS = 315;

    // --- NATURE ---
    export const PINE_TREE = 50; // Reuse/Alias
    export const CACTUS = 53;    // New ID needed? Using placeholder
    export const DROWNED_TREE = 54;
    export const STAIRS_DOWN = 283; // Reuse stairs
    export const STAIRS_UP = 284;

    // --- BIOME MOBS ---
    export const POLAR_BEAR = 320;
    export const YETI = 321;
    export const SCORPION_KING = 322; // Boss?
    export const MUMMY = 323; // Override 285 if needed or alias
    export const SNAKE = 324;
    export const CROCODILE = 325;

    // --- BOSSES ---
    export const FROST_GIANT = 330;
    // SCORPION_KING already defined above at 322
    export const HYDRA = 332;
    export const ORC_WARLORD = 333;

    // --- WEAPONS: SWORDS ---
    export const RAPIER = 8000;
    export const SABRE = 8001;
    export const BROADSWORD = 8002;
    export const SPIKE_SWORD = 8055;
    export const BRIGHT_SWORD = 404;
    export const ICE_RAPIER = 8058; // Glass cannon
    export const GIANT_SWORD = 406; // Two-handed
    export const MAGIC_SWORD = 8056; // End game

    // --- WEAPONS: AXES ---
    export const HAND_AXE = 8029;
    export const HATCHET = 8060;
    export const ORC_AXE = 412; // Barbarian Axe
    export const BATTLE_AXE = 8030;
    export const DOUBLE_AXE = 8050; // Using silver double axe from misc
    export const GREAT_AXE = 8031; // Two-handed
    export const STONE_CUTTER_AXE = 416; // End game

    // --- WEAPONS: CLUBS ---
    export const STUDDED_CLUB = 8048;
    export const MACE = 8049;
    export const MORNING_STAR = 8051;
    export const WAR_HAMMER = 423; // Two-handed
    export const SKULL_STAFF = 424; // Necro staff
    export const THUNDER_HAMMER = 425; // End game

    // --- ARMOR SETS ---
    // Leather (Basic)
    export const LEATHER_HELMET = 8020;
    export const LEATHER_ARMOR = 8009;
    export const LEATHER_LEGS = 432;
    export const LEATHER_BOOTS = 433;

    // Chain/Brass (Mid)
    export const CHAIN_HELMET = 8021;
    export const CHAIN_ARMOR = 8010;
    export const CHAIN_LEGS = 436;

    // Plate (High-Mid)
    export const PLATE_HELMET = 8022; // Using Knight Helm for now as high-mid
    // Note: PLATE_ARMOR/LEGS exist (ID 2, 4). We can alias or replace.

    // Knight (High)
    export const KNIGHT_HELMET = 8022;
    export const KNIGHT_ARMOR = 8011;
    export const KNIGHT_LEGS = 442;
    export const STEEL_BOOTS = 444; // 443 reserved?

    // --- KEYS ---
    export const KEY_ORCHARD = 450;
    export const KEY_MINE = 451;

    // --- MISC ITEMS / LOOT ---

    export const WOLF_PELT = 8041;
    export const BEAR_FUR = 161;
    export const VENOM_DAGGER = 157;

    // --- MISSING EQUIPMENT ---
    export const BONE_SWORD = 8057; // Using void sword as bone/dark sword
    export const SKULL_HELMET = 8023;
    export const DRAGON_SHIELD = 8028;
    export const DRAGON_SCALE_ARMOR = 162; // Placeholder

    // --- ELEMENTAL WEAPONS ---
    // Fire
    export const FIRE_SWORD = 8003;
    export const FIRE_AXE = 501;
    export const INFERNO_BLADE = 502;
    // Ice
    export const FROST_BLADE = 8059;
    export const GLACIAL_AXE = 511;
    export const FROZEN_MACE = 512;
    // Lightning
    export const STORM_BLADE = 520;
    export const THUNDER_AXE = 521;
    export const LIGHTNING_ROD = 522;
    // Poison
    export const VENOM_BLADE = 530;
    export const POISON_AXE = 531;
    export const TOXIC_MACE = 532;

    // --- ELEMENTAL ARMOR ---
    // Fire
    export const FLAME_ARMOR = 540;
    export const FLAME_HELMET = 8025;
    export const FLAME_LEGS = 542;
    export const FLAME_BOOTS = 543;
    // Ice
    export const FROST_ARMOR = 550;
    export const FROST_HELMET = 551;
    export const FROST_LEGS = 552;
    export const FROST_BOOTS = 553;
    // Lightning
    export const STORM_ARMOR = 560;
    export const STORM_HELMET = 561;
    export const STORM_LEGS = 562;
    export const STORM_BOOTS = 563;
    // Poison
    export const VENOM_ARMOR = 570;
    export const VENOM_HELMET = 571;
    export const VENOM_LEGS = 572;
    export const VENOM_BOOTS = 573;

    // --- BUILDINGS & ROOFS ---
    // For 3D-looking buildings with depth
    export const ROOF_BROWN = 580;        // Brown tiled roof
    export const ROOF_RED = 581;          // Red tiled roof  
    export const ROOF_TEMPLE = 582;       // Temple dome/spire
    export const ROOF_CORNER_NW = 583;    // Roof corner pieces
    export const ROOF_CORNER_NE = 584;
    export const ROOF_CORNER_SW = 585;
    export const ROOF_CORNER_SE = 586;
    export const CHIMNEY = 587;           // Chimney on roof
    export const WINDOW = 588;            // Window in wall
    export const DOOR_WOOD = 589;         // Wooden door
    export const DOOR_METAL = 590;        // Metal door
    export const WELL = 591;              // Town well
    export const FOUNTAIN = 1373;
    export const SIGNPOST = 593;          // Signpost
    export const LAMPPOST = 594;          // Street lamp
    export const TABLE = 595;             // Table
    export const BED = 596;               // Bed
    // export const CHEST = 597;             // Treasure chest (Duplicate)
    export const GOLD_PILE = 598;         // Pile of gold
    export const COIN = 599;              // Single coin
    export const WALL_3D = 600;           // 3D-looking wall (thick/deep)
    export const WALL_L2 = 601;           // 2nd story wall (tall)
    export const TOWN_WALL = 602;         // Rookgaard perimeter wall

    // ============================================================
    // AUTO-BORDER SPRITES (Tibia 8.60 Bitmasking System)
    // ============================================================

    // Grass Borders (Overlay tiles - placed on top of ground)
    export const GRASS_BORDER_N = 4542;   // North edge
    export const GRASS_BORDER_E = 4543;   // East edge
    export const GRASS_BORDER_S = 4544;   // South edge
    export const GRASS_BORDER_W = 4545;   // West edge
    export const GRASS_INNER_NE = 4546;   // Inner corner NE
    export const GRASS_INNER_SE = 4547;   // Inner corner SE
    export const GRASS_INNER_SW = 4548;   // Inner corner SW
    export const GRASS_INNER_NW = 4549;   // Inner corner NW
    export const GRASS_OUTER_NW = 4550;   // Outer corner NW
    export const GRASS_OUTER_NE = 4551;   // Outer corner NE
    export const GRASS_OUTER_SE = 4552;   // Outer corner SE
    export const GRASS_OUTER_SW = 4553;   // Outer corner SW

    // Sand Borders
    export const SAND_BORDER_N = 4554;
    export const SAND_BORDER_E = 4555;
    export const SAND_BORDER_S = 4556;
    export const SAND_BORDER_W = 4557;
    export const SAND_INNER_NE = 4558;
    export const SAND_INNER_SE = 4559;
    export const SAND_INNER_SW = 4560;
    export const SAND_INNER_NW = 4561;

    // Mountain Walls (Blocking - Tibia 8.60)
    export const MOUNTAIN_N = 4468;       // North wall
    export const MOUNTAIN_W = 4469;       // West wall
    export const MOUNTAIN_S = 4470;       // South wall
    export const MOUNTAIN_E = 4471;       // East wall
    export const MOUNTAIN_INNER_NE = 4472; // Inner corner NE
    export const MOUNTAIN_INNER_SE = 4473; // Inner corner SE
    export const MOUNTAIN_INNER_SW = 4474; // Inner corner SW
    export const MOUNTAIN_INNER_NW = 4475; // Inner corner NW
    export const MOUNTAIN_OUTER_NE = 4476; // Outer corner NE
    export const MOUNTAIN_OUTER_SE = 4477; // Outer corner SE
    export const MOUNTAIN_OUTER_SW = 4478; // Outer corner SW
    export const MOUNTAIN_OUTER_NW = 4479; // Outer corner NW
    export const MOUNTAIN_TOP = 4480;      // Mountain top ground

    export const MOUNTAIN_ASSETS = {
        // STRAIGHT WALLS
        NORTH: 4469,  // Top edge
        EAST: 4472,   // Right edge
        SOUTH: 4475,  // Bottom edge
        WEST: 4471,   // Left edge

        // OUTER CORNERS (The "tips" of the mountain)
        CORNER_NW: 4468, // Top-Left
        CORNER_NE: 4470, // Top-Right
        CORNER_SW: 4474, // Bottom-Left
        CORNER_SE: 4473, // Bottom-Right

        // INNER CORNERS (The "coves" or inside turns)
        INNER_NW: 4476,
        INNER_NE: 4477,
        INNER_SW: 4479,
        INNER_SE: 4478
    };

    // Ramps (Auto Z-change when walked on)
    export const RAMP_N = 1950;           // North ramp (walk up)
    export const RAMP_E = 1951;           // East ramp
    export const RAMP_S = 1952;           // South ramp
    export const RAMP_W = 1953;           // West ramp

    // Vertical Navigation (Ladders/Holes)
    export const HOLE_DOWN = 594;         // Hole to fall through
    export const ROPE_SPOT_FLOOR = 384;   // Floor under hole (rope usable)
    export const LADDER_UP = 1386;        // Ladder (click to climb)
    export const STAIRS_STONE_DOWN = 1390; // Stone stairs down
    export const STAIRS_STONE_UP = 1391;   // Stone stairs up

    export const MAGIC_FIELD_BLUE = 1492;
}

export const EDRON_ASSETS = {
    // 1. STRUCTURE (White Stone Architecture)
    WALLS: {
        PILLAR: 1050,      // The "Joint" column
        HORIZONTAL: 1052,
        VERTICAL: 1054,
        CORNER_TL: 1056,
        CORNER_TR: 1055,
        CORNER_BL: 1058,
        CORNER_BR: 1057,
        WINDOW_H: 1051,    // Wall with Window (South)
        WINDOW_V: 1053     // Wall with Window (East)
    },

    // 2. FLOORING
    FLOORS: {
        COBBLESTONE: 446,      // The main streets
        PAVEMENT_LIGHT: 450,   // Town square / Plaza center
        CHECKERED: 406,        // Depot/Bank floors (Black/White tiles)
        STONE_FLOOR: 405,      // Inside houses
        WOOD_FLOOR: 401        // Inside shops/taverns
    },

    // 3. DOORS (Castle Style)
    DOORS: {
        LOCKED_H: 1634,    // Horizontal Closed
        LOCKED_V: 1637,
        OPEN_H: 1635,
        OPEN_V: 1638,
        ARCHWAY: 1642      // Open stone arch (No door)
    },

    // 4. DECORATION (The "Vibe")
    DECOR: {
        STREET_LAMP: 1442,     // The tall iron lamp
        WALL_TORCH: 1481,      // Torch for inside dungeons/towers
        KNIGHT_STATUE: 1446,   // Edron has many statues
        FOUNTAIN_WATER: 1373,  // Centerpiece for the plaza
        POTTED_FLOWER: 2983,   // Red flowers in pots (Rich look)
        TRASH_CAN: 1728        // Wooden trash barrel (essential for towns)
    },

    // 5. SHOPS & FURNITURE
    FURNITURE: {
        COUNTER_WOOD_H: 1616,  // Shop counter
        COUNTER_WOOD_V: 1615,
        LOCKER: 2589,          // Depot Locker
        BANK_SAFE: 1716,       // Bank Vault
        BOOKS: 1735,           // Library decoration
        BLACKBOARD: 1738       // Magic Academy decoration
    },

    STAIR_ASSETS: {
        // Stone Ramps (Go UP)
        RAMP_NORTH: 1950, // Walk North into this -> Go Up + North
        RAMP_EAST: 1951,  // Walk East into this -> Go Up + East
        RAMP_SOUTH: 1952, // Walk South into this -> Go Up + South
        RAMP_WEST: 1953,  // Walk West into this -> Go Up + West

        // Stairs Down (Go DOWN)
        STAIRS_DOWN: 438, // Generic stone hole/stairs down
    },

    // NEW AI-GENERATED ASSETS (Phase 31)
    NEW_ASSETS: {
        // City Walls (2x2 grid, each 256x256 in source -> 64x64 in game)
        WALL_VERTICAL: 5000,      // North-South wall segment
        WALL_HORIZONTAL: 5001,    // West-East wall segment
        WALL_PILLAR: 5002,        // Corner pillar
        WALL_ARCHWAY: 5003,       // Arched doorway

        // Mountain Cliffs
        CLIFF_NORTH: 5010,        // Rocky face (north edge)
        CLIFF_SOUTH: 5011,        // Grass-topped edge (south)
        CLIFF_EAST: 5012,         // East border
        CLIFF_WEST: 5013,         // West border
        CLIFF_RAMP: 5014,         // Stone ramp/stairs

        // Ground Tiles (seamless 32x32)
        COBBLESTONE_NEW: 5020,    // Grey city road
        FLAGSTONE: 5021,          // Light plaza pavement
        GRASS_NEW: 5022,          // Dark green with texture
        DIRT_PATH: 5023,          // Brown dirt

        // City Props
        LAMP_LIT: 5030,           // Iron street lamp (lit)
        LAMP_UNLIT: 5031,         // Iron street lamp (unlit)
        CRATES_BARRELS: 5032,     // Stacked crates & barrels
        BARREL_SINGLE: 5033,      // Single barrel
        FLOWER_POT: 5034,         // Red flowers
        SHOP_COUNTER: 5035,       // Wooden counter
        SEWER_GRATE_NEW: 5036,    // Round sewer grate
    }
};

// Tibia Standard IDs (Aliases for existing SPRITES)
export const CORPSE_IDS = {
    HUMAN: SPRITES.HUMAN_CORPSE,   // 298
    GOBLIN: SPRITES.ORC_DEAD,      // 297 (Using Orc dead for goblin)
    DRAGON: SPRITES.ZOMBIE_DEAD,   // 22 (Placeholder)
    RAT: SPRITES.RAT_DEAD,         // 293
    DEFAULT: SPRITES.CORPSE        // 299
};

export const ITEM_IDS = {
    GOLD_COIN: 40,                // ItemRegistry key for Gold Coin (uIndex 8008)
    APPLE: SPRITES.APPLE,         // 8040
    MEAT: 170,                    // ItemRegistry key for Wolf Meat (uIndex 8041)
    DAGGER: 42,                   // ItemRegistry key for Short Sword
    LEATHER_LEGS: SPRITES.LEATHER_LEGS,   // 432
    LONG_SWORD: 152,              // ItemRegistry key for Iron Sword
    DRAGON_HAMMER: 142            // ItemRegistry key for Warhammer
};
