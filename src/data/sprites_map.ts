
import { SPRITES } from "../constants";
import { BULK_SPRITES } from "./bulk_constants";

export interface SpriteDefinition {
    file: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

// Mapping of Sprite ID -> Sheet Definition
export const SPRITE_MAP: Record<number, SpriteDefinition> = {
    // --- PLAYER (Placeholder: Dwarf Miner) ---
    // [SPRITES.PLAYER]: { file: '/sprites/dwarf_sprites.png', x: 0, y: 0, width: 32, height: 32 },

    // --- ORCS ---
    [SPRITES.ORC]: { file: '/sprites/orc_sprites.png', x: 32, y: 0, width: 32, height: 32 },       // Warrior
    [SPRITES.ORC_PEON]: { file: '/sprites/orc_sprites.png', x: 0, y: 0, width: 32, height: 32 },  // Peon
    [SPRITES.ORC_WARLORD]: { file: '/sprites/orc_sprites.png', x: 64, y: 0, width: 32, height: 32 }, // Warlord

    // --- DWARVES ---
    [SPRITES.DWARF_MINER]: { file: '/sprites/dwarf_sprites.png', x: 0, y: 0, width: 32, height: 32 },
    [SPRITES.DWARF_GUARD]: { file: '/sprites/dwarf_sprites.png', x: 32, y: 0, width: 32, height: 32 },
    [SPRITES.DWARF_GEOMANCER]: { file: '/sprites/dwarf_sprites.png', x: 64, y: 0, width: 32, height: 32 },

    // --- DRAGONS ---
    [SPRITES.CUSTOM_DRAGON_HATCHLING]: { file: '/sprites/dragon_sprites.png', x: 32, y: 32, width: 32, height: 32 }, // Middle (Small)
    [SPRITES.DRAGON_LORD]: { file: '/sprites/dragon_sprites.png', x: 0, y: 0, width: 64, height: 64 }, // Big Dragon (Guessing size 64x64 or 32x32?)
    // If red box persists, resize to 32x32 or check sheet layout.
    // For now assuming 64x64 for "Lord" status or just 32x32 at 0,0.
    // Let's stick to safe 32x32 first unless engine supports large sprites.
    // Previous analysis showed engine handles size in drawSprite.
    // Let's try 32x32 first to be safe, or 64x64 if supported.
    // AssetManager log said: "NPC Sprites: ... 260=32x64".
    // Let's try 64x64 if it's a big boss.


    // --- WEAPONS (Basic) ---
    [SPRITES.SWORD]: { file: '/sprites/items_basic.png', x: 0, y: 0, width: 32, height: 32 },
    [SPRITES.AXE]: { file: '/sprites/items_basic.png', x: 32, y: 0, width: 32, height: 32 },
    [SPRITES.CLUB]: { file: '/sprites/items_basic.png', x: 64, y: 0, width: 32, height: 32 },
    [SPRITES.SHIELD]: { file: '/sprites/items_basic.png', x: 96, y: 0, width: 32, height: 32 }, // Wooden Shield

    // --- WALLS (Stone) ---
    [SPRITES.WALL_STONE_NW]: { file: '/sprites/terrain_batch_1.png', x: 0, y: 0, width: 32, height: 32 },       // Vertical? (Using batch 1 layout guess)
    [SPRITES.WALL_STONE_H]: { file: '/sprites/terrain_batch_1.png', x: 32, y: 0, width: 32, height: 32 },      // Horizontal?
    [SPRITES.WALL_STONE_NE]: { file: '/sprites/terrain_batch_1.png', x: 0, y: 0, width: 32, height: 32 },      // Placeholder
    [SPRITES.WALL_STONE_V]: { file: '/sprites/terrain_batch_1.png', x: 0, y: 0, width: 32, height: 32 },       // Vertical
    [SPRITES.WALL_STONE_SW]: { file: '/sprites/terrain_batch_1.png', x: 0, y: 0, width: 32, height: 32 },      // Placeholder
    [SPRITES.WALL_STONE_SE]: { file: '/sprites/terrain_batch_1.png', x: 0, y: 0, width: 32, height: 32 },      // Placeholder

    // --- ARMOR (Plate & Golden) ---
    [SPRITES.ARMOR]: { file: '/sprites/armor_icons.png', x: 0, y: 0, width: 32, height: 32 },        // Plate Armor
    [SPRITES.LEGS]: { file: '/sprites/armor_icons.png', x: 32, y: 0, width: 32, height: 32 },         // Plate Legs
    [SPRITES.DWARF_HELMET]: { file: '/sprites/armor_icons.png', x: 64, y: 0, width: 32, height: 32 }, // Steel Helmet

    [SPRITES.GOLDEN_ARMOR]: { file: '/sprites/armor_icons.png', x: 96, y: 0, width: 32, height: 32 },
    [SPRITES.GOLDEN_LEGS]: { file: '/sprites/armor_icons.png', x: 128, y: 0, width: 32, height: 32 },
    [SPRITES.GOLDEN_HELMET]: { file: '/sprites/armor_icons.png', x: 160, y: 0, width: 32, height: 32 },

    // --- RARE WEAPONS ---
    // [SPRITES.GIANT_SWORD] ... need constants for these

    // Fallbacks for others
    // RAT and WOLF use procedural assets from AssetManager.createRat() and createWolf()

    // RESTORED MAPPINGS (Fixes Grey Square Bug)
    [SPRITES.COBBLE]: { file: '/sprites/terrain_batch_1.png', x: 128, y: 0, width: 32, height: 32 },
    [SPRITES.STONE_WALL]: { file: '/sprites/terrain_batch_1.png', x: 0, y: 0, width: 32, height: 32 }, // Wall Stone NW (Reuse)
    [SPRITES.WALL]: { file: '/sprites/terrain_batch_1.png', x: 0, y: 0, width: 32, height: 32 },       // Generic Wall

    // ITEMS
    [SPRITES.BACKPACK]: { file: '/sprites/items_basic.png', x: 0, y: 0, width: 32, height: 32 }, // Placeholder (Sword?) - Just to prove it works
    [SPRITES.DIRT]: { file: '/sprites/terrain_batch_1.png', x: 160, y: 0, width: 32, height: 32 },
};


export const SPRITE_SHEET_BASE_PATH = '';

