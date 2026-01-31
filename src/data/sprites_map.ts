
import { SPRITES } from "../constants";
import { BULK_SPRITES } from "./bulk_constants";

// Helper to cut sprites from edron_v2.png with safety margin (remove magenta lines)
const cut = (x: number, y: number, w: number, h: number): SpriteDefinition => {
    return { file: 'sprites/edron_v2.png', x: x + 2, y: y + 2, width: w - 4, height: h - 4 };
};

export interface SpriteDefinition {
    file: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

// Mapping of Sprite ID -> Sheet Definition
export const SPRITE_MAP: Record<number, SpriteDefinition> = {
    // --- OTSP TILES (Biomes) ---
    // Mapping based on scan_tiles.js results
    // [SPRITES.GRASS] - REMOVED: User requested procedural generation.
    [SPRITES.DIRT]: { file: 'sprites/otsp_tiles_01.png', x: 32, y: 160, width: 32, height: 32 }, // Brown Dirt found at Row 5, Col 1
    [SPRITES.SAND]: { file: 'sprites/otsp_tiles_01.png', x: 160, y: 224, width: 32, height: 32 }, // Beige Sand
    [SPRITES.FLOOR_STONE]: { file: 'sprites/otsp_tiles_01.png', x: 96, y: 0, width: 32, height: 32 },
    [SPRITES.FLOOR_WOOD]: { file: 'sprites/otsp_tiles_01.png', x: 128, y: 0, width: 32, height: 32 },
    [SPRITES.COBBLE]: { file: 'sprites/otsp_tiles_01.png', x: 160, y: 0, width: 32, height: 32 },
    [SPRITES.WATER]: { file: 'sprites/otsp_tiles_01.png', x: 320, y: 1568, width: 32, height: 32 }, // Blue Water found at Row 49, Col 10

    // --- OTSP WALLS ---
    [SPRITES.STONE_WALL]: { file: 'sprites/otsp_walls_01.png', x: 0, y: 0, width: 32, height: 32 },
    [SPRITES.WALL]: { file: 'sprites/otsp_walls_01.png', x: 32, y: 0, width: 32, height: 32 },
    [SPRITES.WALL_STONE_H]: { file: 'sprites/otsp_walls_01.png', x: 64, y: 0, width: 32, height: 32 },
    [SPRITES.WALL_STONE_V]: { file: 'sprites/otsp_walls_01.png', x: 96, y: 0, width: 32, height: 32 },
    [SPRITES.WALL_STONE_NW]: { file: 'sprites/otsp_walls_01.png', x: 128, y: 0, width: 32, height: 32 },
    [SPRITES.WALL_STONE_NE]: { file: 'sprites/otsp_walls_01.png', x: 160, y: 0, width: 32, height: 32 },
    [SPRITES.WALL_STONE_SW]: { file: 'sprites/otsp_walls_01.png', x: 192, y: 0, width: 32, height: 32 },
    [SPRITES.WALL_STONE_SE]: { file: 'sprites/otsp_walls_01.png', x: 224, y: 0, width: 32, height: 32 },


    // --- MOBS ---
    [SPRITES.ORC]: { file: 'sprites/orc_sprites.png', x: 32, y: 0, width: 32, height: 32 },       // Warrior
    [SPRITES.ORC_PEON]: { file: 'sprites/orc_sprites.png', x: 0, y: 0, width: 32, height: 32 },  // Peon
    [SPRITES.ORC_WARLORD]: { file: 'sprites/orc_sprites.png', x: 64, y: 0, width: 32, height: 32 }, // Warlord

    // --- DWARVES ---
    [SPRITES.DWARF_MINER]: { file: 'sprites/dwarf_sprites.png', x: 0, y: 0, width: 32, height: 32 },
    [SPRITES.DWARF_GUARD]: { file: 'sprites/dwarf_sprites.png', x: 32, y: 0, width: 32, height: 32 },
    [SPRITES.DWARF_GEOMANCER]: { file: 'sprites/dwarf_sprites.png', x: 64, y: 0, width: 32, height: 32 },

    // --- DRAGONS ---
    [SPRITES.CUSTOM_DRAGON_HATCHLING]: { file: 'sprites/dragon_sprites.png', x: 32, y: 32, width: 32, height: 32 },
    [SPRITES.DRAGON_LORD]: { file: 'sprites/dragon_sprites.png', x: 0, y: 0, width: 64, height: 64 },

    // --- WEAPONS (Basic) ---
    // [SPRITES.SWORD] - REMOVED: Using procedural createSword() instead.
    [SPRITES.AXE]: { file: 'sprites/items_basic.png', x: 32, y: 0, width: 32, height: 32 },
    [SPRITES.CLUB]: { file: 'sprites/items_basic.png', x: 64, y: 0, width: 32, height: 32 },
    [SPRITES.SHIELD]: { file: 'sprites/items_basic.png', x: 96, y: 0, width: 32, height: 32 },

    // --- NATURE / TREES ---
    // ID 50: Standard Tree
    50: { file: 'sprites/tibia_tree.png', x: 0, y: 0, width: 64, height: 64 },
    // ID 51: Oak Tree
    51: { file: 'sprites/tree.png', x: 0, y: 0, width: 64, height: 64 },
    // ID 6: Small Rock
    6: { file: 'sprites/otsp_tiles_01.png', x: 32, y: 0, width: 32, height: 32 }, // Rock on row 1

    // --- ARMOR ---
    [SPRITES.ARMOR]: { file: 'sprites/armor_icons.png', x: 0, y: 0, width: 32, height: 32 },
    [SPRITES.LEGS]: { file: 'sprites/armor_icons.png', x: 32, y: 0, width: 32, height: 32 },
    [SPRITES.DWARF_HELMET]: { file: 'sprites/armor_icons.png', x: 64, y: 0, width: 32, height: 32 },
    [SPRITES.GOLDEN_ARMOR]: { file: 'sprites/armor_icons.png', x: 96, y: 0, width: 32, height: 32 },
    [SPRITES.GOLDEN_LEGS]: { file: 'sprites/armor_icons.png', x: 128, y: 0, width: 32, height: 32 },
    [SPRITES.GOLDEN_HELMET]: { file: 'sprites/armor_icons.png', x: 160, y: 0, width: 32, height: 32 },


    // NOTE: AI-Generated Armor, Weapons, Axes, Shields are mapped via explicit 8000+ IDs below


    // ITEMS (BACKPACK is now mapped via 8043 below)

    // === EDRON V2 (Safety Cuts - No Purple Edges) ===
    // All coordinates have +2px inset and -4px dimensions to avoid magenta bleeding
    // Row 0: Walls | Row 1: Floors | Row 2: Mountains | Row 3: Decor

    // === EDRON V2 (Safety Cuts via Helper) ===
    // All coordinates have +2px inset and -4px dimensions to avoid magenta bleeding

    // --- ROW 0: WALLS ---
    6000: cut(8, 10, 34, 110),     // Vertical Wall
    6001: cut(160, 20, 32, 90),    // Horizontal Wall
    6002: cut(265, 10, 50, 110),   // Pillar
    6003: cut(395, 10, 70, 110),   // Door

    // --- ROW 1: FLOORS ---
    6010: cut(5, 133, 118, 118),   // Cobblestone
    6011: cut(133, 133, 118, 118), // Pavement
    6012: cut(261, 133, 118, 118), // Grass
    6013: cut(389, 133, 118, 118), // Dirt

    // --- ROW 2: MOUNTAINS ---
    6020: cut(5, 261, 118, 118),   // Cliff Side
    6021: cut(133, 261, 118, 118), // Cliff Corner
    6022: cut(261, 261, 118, 118), // Cliff Top
    6023: cut(389, 261, 118, 118), // Stairs

    // --- ROW 3: DECOR ---
    6030: { file: 'sprites/walls.png', x: 262, y: 1024, width: 253, height: 248 }, // Street Lamp (Safe Cut manually applied)
    6031: cut(155, 415, 70, 80),   // Barrel
    6032: cut(285, 415, 80, 80),   // Crate
    6033: cut(415, 415, 80, 80),   // Flower Pot

    // === NEW MOBS (AI-Generated Sprites) ===
    // 7000-range IDs for mob sprites
    7000: { file: 'sprites/king_tibianus.png', x: 0, y: 0, width: 512, height: 512 },   // King Tibianus
    7001: { file: 'sprites/royal_guard.png', x: 0, y: 0, width: 512, height: 512 },     // Royal Guard
    7002: { file: 'sprites/giant_rat.png', x: 0, y: 0, width: 512, height: 512 },       // Giant Rat
    // 7003 removed (duplicate of SPRITES.CYCLOPS below)

    // --- NEW MOBS ---
    [SPRITES.BANDIT]: { file: 'sprites/bandit.png', x: 0, y: 0, width: 32, height: 32 },
    [SPRITES.CYCLOPS]: { file: 'sprites/cyclops.png', x: 0, y: 0, width: 512, height: 512 },

    // --- NPC PLACEHOLDERS ---
    [SPRITES.NPC_MERCHANT]: { file: 'sprites/dwarf_sprites.png', x: 0, y: 0, width: 32, height: 32 }, // Use Miner
    [SPRITES.NPC_HEALER]: { file: 'sprites/dwarf_sprites.png', x: 64, y: 0, width: 32, height: 32 }, // Use Geomancer
    [SPRITES.NPC_GUIDE]: { file: 'sprites/dwarf_sprites.png', x: 32, y: 0, width: 32, height: 32 },  // Use Guard

    // --- SPECIFIC NPCS ---
    [SPRITES.NPC_BANKER]: { file: 'sprites/npc_banker.png', x: 0, y: 0, width: 512, height: 512 },
    [SPRITES.NPC_WIZARD]: { file: 'sprites/npc_wizard.png', x: 0, y: 0, width: 512, height: 512 },
    [SPRITES.NPC_BLACKSMITH]: { file: 'sprites/npc_blacksmith.png', x: 0, y: 0, width: 512, height: 512 },
    [SPRITES.NPC_PRIEST]: { file: 'sprites/npc_priest.png', x: 0, y: 0, width: 512, height: 512 },
    [SPRITES.NPC_BEGGAR]: { file: 'sprites/npc_beggar.png', x: 0, y: 0, width: 512, height: 512 },

    // --- CORPSES ---
    // 22 removed (duplicate?) Check constants.
    // 299: { file: 'sprites/corpse.png', x: 0, y: 0, width: 512, height: 512 }, // Corpse

    // === AI-GENERATED ITEM SPRITES ===
    // item_sprites_weapons.png (1024x1024, 3 cols x 4 rows)
    // Grid: ~341px width, 256px height per cell
    // Row 0: Short Sword, Dark Sword, Steel Sword
    8000: { file: 'sprites/item_sprites_weapons.png', x: 0, y: 0, width: 341, height: 256 },       // Short Sword
    8001: { file: 'sprites/item_sprites_weapons.png', x: 341, y: 0, width: 341, height: 256 },     // Dark Sword
    8002: { file: 'sprites/item_sprites_weapons.png', x: 682, y: 0, width: 342, height: 256 },     // Steel Sword
    // Row 1: Fire Sword, Ice Rapier, Void Sword
    8003: { file: 'sprites/item_sprites_weapons.png', x: 0, y: 256, width: 341, height: 256 },     // Fire Sword
    8004: { file: 'sprites/item_sprites_weapons.png', x: 341, y: 256, width: 341, height: 256 },   // Ice Rapier
    8005: { file: 'sprites/item_sprites_weapons.png', x: 682, y: 256, width: 342, height: 256 },   // Void Sword
    // Row 2: Health Potion, Mana Potion, Gold Coins
    8006: { file: 'sprites/item_sprites_weapons.png', x: 0, y: 512, width: 341, height: 256 },     // Health Potion
    8007: { file: 'sprites/item_sprites_weapons.png', x: 341, y: 512, width: 341, height: 256 },   // Mana Potion
    8008: { file: 'sprites/item_sprites_weapons.png', x: 682, y: 512, width: 342, height: 256 },   // Gold Coins
    // Row 3: Leather Armor, Chain Armor, Knight Armor
    8009: { file: 'sprites/item_sprites_weapons.png', x: 0, y: 768, width: 341, height: 256 },     // Leather Armor
    8010: { file: 'sprites/item_sprites_weapons.png', x: 341, y: 768, width: 341, height: 256 },   // Chain Armor
    8011: { file: 'sprites/item_sprites_weapons.png', x: 682, y: 768, width: 342, height: 256 },   // Knight Armor


    // item_sprites_armor.png (1024x1024, 3 cols x 4 rows)
    // NOTE: This sheet has WHITE background, not black
    // Grid: ~341px width, 256px height per cell
    // Row 0: Leather Helmet, Chain Helmet, Knight Helmet
    8020: { file: 'sprites/item_sprites_armor.png', x: 0, y: 0, width: 341, height: 256 },       // Leather Helmet
    8021: { file: 'sprites/item_sprites_armor.png', x: 341, y: 0, width: 341, height: 256 },     // Chain Helmet
    8022: { file: 'sprites/item_sprites_armor.png', x: 682, y: 0, width: 342, height: 256 },     // Knight Helmet
    // Row 1: Skull Helm, Crown of Kings, Flame Helmet
    8023: { file: 'sprites/item_sprites_armor.png', x: 0, y: 256, width: 341, height: 256 },     // Skull Helm
    8024: { file: 'sprites/item_sprites_armor.png', x: 341, y: 256, width: 341, height: 256 },   // Crown of Kings
    8025: { file: 'sprites/item_sprites_armor.png', x: 682, y: 256, width: 342, height: 256 },   // Flame Helmet
    // Row 2: Wooden Shield, Steel Shield, Dragon Shield
    8026: { file: 'sprites/item_sprites_armor.png', x: 0, y: 512, width: 341, height: 256 },     // Wooden Shield
    8027: { file: 'sprites/item_sprites_armor.png', x: 341, y: 512, width: 341, height: 256 },   // Steel Shield
    8028: { file: 'sprites/item_sprites_armor.png', x: 682, y: 512, width: 342, height: 256 },   // Dragon Shield
    // Row 3: Hand Axe, Battle Axe, Great Axe
    8029: { file: 'sprites/item_sprites_armor.png', x: 0, y: 768, width: 341, height: 256 },     // Hand Axe
    8030: { file: 'sprites/item_sprites_armor.png', x: 341, y: 768, width: 341, height: 256 },   // Battle Axe
    8031: { file: 'sprites/item_sprites_armor.png', x: 682, y: 768, width: 342, height: 256 },   // Great Axe

    // item_sprites_misc.png (1024x1024, 4 cols x 4 rows)
    // Grid: 256px width, 256px height per cell
    // Row 0: Apple, Meat, Bag, Backpack
    8040: { file: 'sprites/item_sprites_misc.png', x: 0, y: 0, width: 256, height: 256 },       // Apple
    8041: { file: 'sprites/item_sprites_misc.png', x: 256, y: 0, width: 256, height: 256 },     // Wolf Meat
    8042: { file: 'sprites/item_sprites_misc.png', x: 512, y: 0, width: 256, height: 256 },     // Bag
    8043: { file: 'sprites/item_sprites_misc.png', x: 768, y: 0, width: 256, height: 256 },     // Backpack
    // Row 1: Ruby, Sapphire, Parcel, Box
    8044: { file: 'sprites/item_sprites_misc.png', x: 0, y: 256, width: 256, height: 256 },     // Ruby
    8045: { file: 'sprites/item_sprites_misc.png', x: 256, y: 256, width: 256, height: 256 },   // Sapphire
    8046: { file: 'sprites/item_sprites_misc.png', x: 512, y: 256, width: 256, height: 256 },   // Parcel
    8047: { file: 'sprites/item_sprites_misc.png', x: 768, y: 256, width: 256, height: 256 },   // Box
    // Row 2: Club, Mace, Silver Double-Axe, Flail
    8048: { file: 'sprites/item_sprites_misc.png', x: 0, y: 512, width: 256, height: 256 },     // Wooden Club
    8049: { file: 'sprites/item_sprites_misc.png', x: 256, y: 512, width: 256, height: 256 },   // Spiked Mace
    8050: { file: 'sprites/item_sprites_misc.png', x: 512, y: 512, width: 256, height: 256 },   // Silver Double-Axe
    8051: { file: 'sprites/item_sprites_misc.png', x: 768, y: 512, width: 256, height: 256 },   // Spiked Flail
    // Row 3: Rope, Shovel, Pickaxe-L, Pickaxe-R
    8052: { file: 'sprites/item_sprites_misc.png', x: 0, y: 768, width: 256, height: 256 },     // Rope
    8053: { file: 'sprites/item_sprites_misc.png', x: 256, y: 768, width: 256, height: 256 },   // Shovel
    8054: { file: 'sprites/item_sprites_misc.png', x: 512, y: 768, width: 256, height: 256 },   // Pickaxe L
    8055: { file: 'sprites/item_sprites_misc.png', x: 768, y: 768, width: 256, height: 256 },   // Pickaxe R
};


export const SPRITE_SHEET_BASE_PATH = './';
