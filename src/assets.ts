
export const SHEET_TILE_SIZE = 32;
export const SHEET_COLS = 8; // Restored for compatibility

// Map sprite names to IDs
export const SPRITES = {
    // Characters (Procedural)
    PLAYER: 0,
    PLAYER_BACK: 900, // New reserved ID for directional
    PLAYER_SIDE: 901,
    MAGE: 1,
    RANGER: 2,
    NPC: 3,
    HUNTER: 4,
    GUARD: 5,
    PRIEST: 6,
    KNIGHT: 30,
    NECROMANCER: 45,
    FROST_MAGE: 85,

    // Enemies (Procedural)
    SKELETON: 8,
    ORC: 9,
    WOLF: 12,
    GHOST: 10,
    SLIME: 11,
    ZOMBIE: 13,
    BEAR: 41,
    SPIDER: 42,
    BANDIT: 43,
    SCORPION: 59,
    MUMMY: 60,
    SCARAB: 61,
    ICE_WOLF: 84,
    YETI: 86,
    CRAB: 105,
    SIREN: 106,
    HYDRA: 107,
    GOLEM: 111,
    BASILISK: 112,

    // Environment (Visual Upgrade)
    GRASS: 16,     // Procedural Grass (safe backdrop)
    WALL: 17,
    WATER: 18,
    WOOD: 19,
    STAIRS: 20,
    WEB: 21,
    BONES: 22,
    STONE: 23,
    MOSSY: 24,
    DARK: 25,
    TREE: 34,      // FROM TILESET
    PINE_TREE: 40, // FROM TILESET
    ROCK: 46,      // FROM TILESET
    BUSH: 64,      // FROM TILESET
    CACTUS: 45,
    SNOW: 47,
    ICE_ROCK: 48,
    ICE_CRYSTAL: 101,
    WATER_CRYSTAL: 104,
    WATER_FLOOR: 108,
    EARTH_WALL: 109,
    EARTH_CRYSTAL: 110,

    // Terrain Variety
    GRASS_DARK: 62,
    GRASS_LIGHT: 63,
    FLOWERS: 64,

    // Structure
    TEMPLE: 76,
    CAVE_ENTRANCE: 77,
    FISHING_SPOT: 78,
    WELL: 79,
    CAMPFIRE: 80,
    DOOR_CLOSED: 95,
    DOOR_OPEN: 96,

    // New Safe IDs for Town
    TOWN_WALL: 200,
    TOWN_FLOOR: 201,

    // Misc / Items
    SWORD: 26,
    POTION: 27,
    COIN: 28,
    COIN_ITEM: 66,
    WOODEN_SWORD: 31,
    WOODEN_SHIELD: 33,
    NOBLE_SWORD: 32,
    AXE: 35,
    CLUB: 36,
    ARMOR: 44,
    MANA_POTION: 65,
    MEAT: 47,
    ROTTEN_MEAT: 48,
    SHIELD: 68,
    FIRE_SWORD: 113,
    ICE_BOW: 114,
    THUNDER_STAFF: 115,
    MAGMA_ARMOR: 116,
    FROST_HELM: 117,

    FIREBALL: 100,
    BLOOD: 129,
    SPARKLE: 130
};

export interface SpriteSource {
    image: HTMLImageElement;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}

interface SheetConfig {
    tileSize: number;
    stride?: number;
    offsetX: number;
    offsetY: number;
}

export class AssetManager {
    private images: Map<string, HTMLImageElement> = new Map();
    private sheetConfigs: Map<string, SheetConfig> = new Map();
    private spriteCache: Map<number, SpriteSource> = new Map();
    private loaded: boolean = false;

    constructor() {
        this.images = new Map();
        this.sheetConfigs = new Map();

        // 1. CONFIG: Standard 32x32
        const keys = ['mage', 'knight', 'old_man', 'orc', 'skeleton', 'guard', 'wolf', 'forest', 'items'];
        keys.forEach(k => {
            this.sheetConfigs.set(k, { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        });
    }

    async load(): Promise<void> {
        console.log('[AssetManager] Loading Spritesheets...');

        // 1. Load Main Sheets
        // Note: You must ensure these files exist in public/sprites/ or public/assets/
        // I will assume they are in 'sprites/' for consistency with previous setup.
        await this.loadImage('knight_sheet', 'sprites/knight_sheet.png');
        await this.loadImage('world_tiles', 'sprites/world_tiles.png');
        await this.loadImage('monsters', 'sprites/monsters.png');

        // 2. Configure Sheets (32x32 Grid, 32px Stride)
        const sheet32 = { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 };
        this.sheetConfigs.set('knight_sheet', sheet32);
        this.sheetConfigs.set('world_tiles', sheet32);
        this.sheetConfigs.set('monsters', sheet32);

        // Load Items (Legacy support / Inventory)
        await this.loadItems();

        this.loaded = true;
        this.buildSpriteCache();
        console.log('[AssetManager] Assets loaded.');
    }

    async loadImage(key: string, src: string) {
        const img = new Image();
        img.src = src;
        await new Promise(r => img.onload = r);
        this.images.set(key, img);
    }

    private async loadItems() {
        return new Promise<void>((resolve) => {
            const img = new Image(); img.src = 'assets/items.png';
            img.onload = () => { this.images.set('items', img); resolve(); };
            img.onerror = () => {
                const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
                const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, 32, 32);
                const pImg = new Image(); pImg.src = canvas.toDataURL(); this.images.set('items', pImg); resolve();
            }
        });
    }

    private buildSpriteCache() {
        if (!this.images.size) return;

        // --- MAPPING CORE SPRITES ---

        // 1. Player (Knight Sheet)
        // Col 0, Row 0 = Default Front
        this.mapSprite(SPRITES.PLAYER, 'knight_sheet', 0, 0);
        // Col 1, Row 0 = Back
        this.mapSprite(SPRITES.PLAYER_BACK, 'knight_sheet', 1, 0);
        // Col 2, Row 0 = Side (Use flipX in renderer for Left/Right)
        this.mapSprite(SPRITES.PLAYER_SIDE, 'knight_sheet', 2, 0);

        this.mapSprite(SPRITES.KNIGHT, 'knight_sheet', 0, 0);

        // 2. World Tiles (Ground, Walls)
        // Grass -> Col 1, Row 0
        this.mapSprite(SPRITES.GRASS, 'world_tiles', 1, 0);
        // Wall -> Col 2, Row 4
        this.mapSprite(SPRITES.WALL, 'world_tiles', 2, 4);

        // 3. Monsters
        // Orc -> Col 0, Row 1
        this.mapSprite(SPRITES.ORC, 'monsters', 0, 1);
        // Map other enemies to Orc for visibility until we have their sprites
        this.mapSprite(SPRITES.SKELETON, 'monsters', 0, 1);

        // --- FALLBACKS ---
        // Map critical missing IDs to something visible to prevent crashes
        this.mapSprite(SPRITES.TOWN_FLOOR, 'world_tiles', 1, 0); // Grass
        this.mapSprite(SPRITES.TOWN_WALL, 'world_tiles', 2, 4);  // Wall
        this.mapSprite(SPRITES.WATER, 'world_tiles', 1, 0);      // Blue? Use Grass for now.
    }

    private mapSprite(id: number, sheet: string, col: number, row: number, cols: number = 1, rows: number = 1) {
        const img = this.images.get(sheet);
        if (!img) return;

        const config = this.sheetConfigs.get(sheet) || { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 };
        const stride = config.stride || config.tileSize;

        this.spriteCache.set(id, {
            image: img,
            sx: config.offsetX + col * stride,
            sy: config.offsetY + row * stride,
            sw: cols * config.tileSize,
            sh: rows * config.tileSize
        });
    }

    getSpriteSource(id: number): SpriteSource | undefined {
        return this.spriteCache.get(id);
    }

    getSpriteStyle(id: number): { backgroundImage: string, backgroundPosition: string, backgroundSize: string } {
        const source = this.spriteCache.get(id);
        if (!source || !source.image) return { backgroundImage: 'none', backgroundPosition: '0 0', backgroundSize: 'auto' };
        return {
            backgroundImage: `url(${source.image.src})`,
            backgroundPosition: `-${source.sx}px -${source.sy}px`,
            backgroundSize: `auto`
        };
    }

    isLoaded() { return this.loaded; }
}

export const assetManager = new AssetManager();
export const spriteSheet = new Image();
export const spriteCanvas = document.createElement('canvas');
