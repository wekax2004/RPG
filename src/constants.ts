export namespace SPRITES {
    export const GRASS = 10;
    export const GRASS_FLOWERS = 16;
    export const DIRT = 11;
    export const COBBLE = 12;
    export const WATER = 13;
    export const FLOOR_WOOD = 14;
    export const FLOOR_STONE = 15;

    export const WALL = 21;
    export const STONE_WALL = 17;

    export const BARREL = 30;
    export const CRATE = 31;
    export const TORCH = 32;
    export const BACKPACK = 22;
    export const SMALL_BAG = 142;
    export const ZOMBIE = 300;
    export const GHOST = 301;

    export const GOLD = 40;
    export const POTION = 41;
    export const APPLE = 147;
    export const MANA_POTION = 86; // New Sprite ID for Mana Potion? Check assets. Assuming 86 or similar.
    export const SHOVEL = 124;
    export const ROPE = 65;
    export const MACHETE = 43;
    export const PICKAXE = 66;
    export const HOLE = 125; // Sprite for open hole
    export const ROPE_SPOT = 126; // Sprite for rope spot/ceiling hole

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
    export const WALL_STONE_V = 210; // Vertical (Index 3)
    export const WALL_STONE_H = 211; // Horizontal (Index 1)
    export const WALL_STONE_NW = 215; // Corner NW (Index 0)
    export const WALL_STONE_NE = 216; // Corner NE (Index 2)
    export const WALL_STONE_SW = 217; // Corner SW (Index 4)
    export const WALL_STONE_SE = 218; // Corner SE (Index 5)
    export const FLOOR_DIRT = 11;    // Procedural Dirt (Keep)
    export const FLOOR_GRASS_VAR = 16; // Procedural Grass Var

    // --- CUSTOM GENERATED ASSETS ---
    export const CUSTOM_GRASS_FLOWERS = 300;
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

    export const DWARF_GUARD = 251;
    export const DWARF_MINER = 254;
    export const DWARF_GEOMANCER = 255; // Mage

    // TOWN NPCS
    export const NPC_MERCHANT = 260;
    export const NPC_HEALER = 261;
    export const NPC_GUIDE = 262;
    export const NPC = 262; // Generic NPC
    export const CORPSE = 299; // Generic Corpse Sprite (Skull/Skeleton)

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
    export const SANDSTONE = 314;
    export const JUNGLE_GRASS = 315;

    // --- NATURE ---
    export const PINE_TREE = 50; // Reuse/Alias
    export const CACTUS = 53;    // New ID needed? Using placeholder
    export const DROWNED_TREE = 54;
    export const STAIRS_DOWN = 283; // Reuse stairs

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
    export const RAPIER = 400;
    export const SABRE = 401;
    export const BROADSWORD = 402;
    export const SPIKE_SWORD = 403;
    export const BRIGHT_SWORD = 404;
    export const ICE_RAPIER = 405; // Glass cannon
    export const GIANT_SWORD = 406; // Two-handed
    export const MAGIC_SWORD = 407; // End game

    // --- WEAPONS: AXES ---
    export const HAND_AXE = 410;
    export const HATCHET = 411;
    export const ORC_AXE = 412; // Barbarian Axe
    export const BATTLE_AXE = 413;
    export const DOUBLE_AXE = 414;
    export const GREAT_AXE = 415; // Two-handed
    export const STONE_CUTTER_AXE = 416; // End game

    // --- WEAPONS: CLUBS ---
    export const STUDDED_CLUB = 420;
    export const MACE = 421;
    export const MORNING_STAR = 422;
    export const WAR_HAMMER = 423; // Two-handed
    export const SKULL_STAFF = 424; // Necro staff
    export const THUNDER_HAMMER = 425; // End game

    // --- ARMOR SETS ---
    // Leather (Basic)
    export const LEATHER_HELMET = 430;
    export const LEATHER_ARMOR = 431;
    export const LEATHER_LEGS = 432;
    export const LEATHER_BOOTS = 433;

    // Chain/Brass (Mid)
    export const CHAIN_HELMET = 434;
    export const CHAIN_ARMOR = 435;
    export const CHAIN_LEGS = 436;

    // Plate (High-Mid)
    export const PLATE_HELMET = 437; // Distinct from Iron Helm
    // Note: PLATE_ARMOR/LEGS exist (ID 2, 4). We can alias or replace.

    // Knight (High)
    export const KNIGHT_HELMET = 440;
    export const KNIGHT_ARMOR = 441;
    export const KNIGHT_LEGS = 442;
    export const STEEL_BOOTS = 444; // 443 reserved?

    // --- KEYS ---
    export const KEY_ORCHARD = 450;
    export const KEY_MINE = 451;

    // --- MISC ITEMS / LOOT ---

    export const WOLF_PELT = 160;
    export const BEAR_FUR = 161;
    export const VENOM_DAGGER = 157;

    // --- MISSING EQUIPMENT ---
    export const BONE_SWORD = 153; // Legacy ID or new range? Keeping legacy for now.
    export const SKULL_HELMET = 163;
    export const DRAGON_SHIELD = 166;
    export const DRAGON_SCALE_ARMOR = 162; // Placeholder

    // --- ELEMENTAL WEAPONS ---
    // Fire
    export const FIRE_SWORD = 500;
    export const FIRE_AXE = 501;
    export const INFERNO_BLADE = 502;
    // Ice
    export const FROST_BLADE = 510;
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
    export const FLAME_HELMET = 541;
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
    export const FOUNTAIN = 592;          // Fountain
    export const SIGNPOST = 593;          // Signpost
    export const LAMPPOST = 594;          // Street lamp
    export const TABLE = 595;             // Table
    export const BED = 596;               // Bed
    export const CHEST = 597;             // Treasure chest
    export const GOLD_PILE = 598;         // Pile of gold
    export const COIN = 599;              // Single coin
    export const WALL_3D = 600;           // 3D-looking wall (thick/deep)
    export const WALL_L2 = 601;           // 2nd story wall (tall)
    export const TOWN_WALL = 602;         // Rookgaard perimeter wall
}
