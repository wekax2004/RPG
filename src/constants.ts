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

    export const GOLD = 40;
    export const POTION = 41;
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
    export const GEM_RUBY = 203;
    export const GEM_SAPPHIRE = 204;

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

    // MOBS
    // MOBS & VARIANTS
    export const ORC = 9;
    export const ORC_PEON = 252;
    export const ORC_WARLORD = 253;

    export const DWARF_GUARD = 251;
    export const DWARF_MINER = 254;
    export const DWARF_GEOMANCER = 255; // Mage

    // TOWN NPCS
    export const NPC_MERCHANT = 260;
    export const NPC_HEALER = 261;
    export const NPC_GUIDE = 262;
    export const NPC = 262; // Generic NPC
    export const CORPSE = 299; // Generic Corpse Sprite (Skull/Skeleton)
}
