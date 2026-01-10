
export const SHEET_TILE_SIZE = 32;
export const SHEET_COLS = 8; // Restored for compatibility

// Map sprite names to IDs
export const SPRITES = {
    // Characters (Procedural)
    // Characters (Procedural)
    PLAYER: 0,
    // Directional mappings (Mapped to Knight Sheet Rows)
    PLAYER_DOWN: 900,
    PLAYER_UP: 901,
    PLAYER_RIGHT: 902,
    PLAYER_LEFT: 903,

    PLAYER_BACK: 901, // Alias for legacy code
    PLAYER_SIDE: 902, // Alias for legacy code
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
    CHEST: 50, // Added Chest ID

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

    getImage(key: string): HTMLImageElement | undefined {
        return this.images.get(key);
    }

    async load(): Promise<void> {
        console.log('[AssetManager] Loading Spritesheets...');

        // 1. Load Main Sheets (Resized & Cleaned)
        await this.loadImage('knight_sheet', '/sprites/final_knight.png?v=6', false); // Transparency baked in
        await this.loadImage('world_tiles', '/sprites/final_tiles.png?v=7', false);   // Transparency baked in, preserves Marble Floor
        await this.loadImage('monsters', '/sprites/monsters.png?v=2', true);
        await this.loadImage('grass_tile', '/sprites/grass_tile.png?v=2', true);

        // 2. Configure Sheets (32x32 Grid, 32px Stride)
        const sheet32 = { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 };
        this.sheetConfigs.set('knight_sheet', sheet32);
        this.sheetConfigs.set('monsters', sheet32);
        this.sheetConfigs.set('grass_tile', sheet32);

        // 2. Tiles (32x32 per tile on sheet, map 16=MainGrass)
        await this.loadImage('tiles', '/sprites/final_tiles.png?v=8', true);
        this.sheetConfigs.set('tiles', sheet32); // Configure the new 'tiles' sheet

        // 3. Props (Trees, Rocks, Bushes) -- 64x64 High Res
        await this.loadImage('props', '/sprites/props.png?v=40', true);
        // Explicitly set 64px tile size for props
        this.sheetConfigs.set('props', { tileSize: 64, stride: 64, offsetX: 0, offsetY: 0 }); // (64x64)
        // Col 0: Tree, Col 1: Rock, Col 2: Bush

        this.loaded = true;
        this.buildSpriteCache();
        console.log('[AssetManager] Assets loaded.');
    }

    async loadImage(key: string, src: string, applyChroma: boolean = false) {
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Required for canvas manimpulation
            img.src = src;
            img.onload = () => {
                console.log('Successfully loaded:', src); // Log success
                console.log('Successfully loaded:', src); // Log success
                // Chroma Key REMOVED per user request
                this.images.set(key, img);
                resolve();
            };
            img.onerror = (e) => {
                console.error(`Failed to load image: ${src}`, e);

                // FALLBACK: Generate Placeholder so mapSprite doesn't fail
                const canvas = document.createElement('canvas');
                canvas.width = 32; canvas.height = 32;
                const ctx = canvas.getContext('2d')!;

                // Color Code Fallback
                if (key === 'grass_tile') ctx.fillStyle = '#00FF00'; // Lime Green
                else if (key === 'knight_sheet') ctx.fillStyle = '#0000FF'; // Blue
                else ctx.fillStyle = '#FF0000'; // Red

                ctx.fillRect(0, 0, 32, 32);

                const fallbackImg = new Image();
                fallbackImg.src = canvas.toDataURL();
                fallbackImg.onload = () => {
                    this.images.set(key, fallbackImg); // Set valid image
                    resolve();
                };
            };
        });
    }

    private async loadItems() {
        return new Promise<void>((resolve) => {
            const img = new Image(); img.src = '/assets/items.png'; // Added slash here too
            img.onload = () => { this.images.set('items', img); resolve(); };
            img.onerror = () => {
                const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
                const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, 32, 32);
                const pImg = new Image(); pImg.src = canvas.toDataURL(); this.images.set('items', pImg); resolve();
            }
        });
    }

    private buildSpriteCache() {
        this.spriteCache.clear();

        // 1. KNIGHT (Standard 32x32 Grid)
        // Row 0: Down, Row 1: Up, Row 2: Right, Row 3: Left
        this.mapSprite(SPRITES.PLAYER_DOWN, 'knight_sheet', 0, 0); // Down
        this.mapSprite(SPRITES.PLAYER_UP, 'knight_sheet', 0, 1);   // Up
        this.mapSprite(SPRITES.PLAYER_RIGHT, 'knight_sheet', 0, 2); // Right
        this.mapSprite(SPRITES.PLAYER_LEFT, 'knight_sheet', 0, 3);  // Left (Row 3 assumed)

        // Direct IDs mapping
        this.mapSprite(0, 'knight_sheet', 0, 0); // Down
        this.mapSprite(1, 'knight_sheet', 0, 1); // Up

        // ... (Other mappings)

        this.mapSprite(5, 'props', 0, 0); // Oak Tree (ID 5)
        this.mapSprite(6, 'props', 1, 0); // Large Rock (ID 6)
        this.mapSprite(7, 'props', 2, 0); // Bush (ID 7)
        this.mapSprite(18, 'props', 0, 0); // Tree
        this.mapSprite(19, 'props', 1, 0); // Rock
        this.mapSprite(34, 'props', 2, 0); // Bush
        this.mapSprite(50, 'props', 3, 0); // Chest
        this.mapSprite(21, 'props', 4, 0); // Altar (ID 21)
        this.mapSprite(2, 'knight_sheet', 0, 2); // Right
        this.mapSprite(3, 'knight_sheet', 0, 3); // Left

        // 2. WORLD TILES (Standard 32x32 Grid)
        // Row 0: Grass (0,0), Flowers (1,0), Pebbles (2,0)
        this.mapSprite(16, 'world_tiles', 0, 0);   // Grass
        this.mapSprite(161, 'world_tiles', 1, 0);  // Flower Grass
        this.mapSprite(162, 'world_tiles', 2, 0);  // Pebble Grass

        // Row 1: Wall (0,1), Floor (1,1), Altar (2,1)
        this.mapSprite(17, 'world_tiles', 0, 1);   // Wall
        this.mapSprite(SPRITES.TOWN_FLOOR, 'world_tiles', 1, 1); // Floor
        this.mapSprite(201, 'world_tiles', 1, 1);  // Floor ID
        this.mapSprite(20, 'world_tiles', 2, 1);   // Altar
        this.mapSprite(202, 'world_tiles', 2, 1);  // Legacy Altar

        // 3. MONSTERS
        this.mapSprite(SPRITES.ORC, 'monsters', 0, 1);
        this.mapSprite(SPRITES.SKELETON, 'monsters', 0, 1);

        // --- FALLBACKS ---
        this.mapSprite(SPRITES.TOWN_WALL, 'world_tiles', 0, 1);
        this.mapSprite(SPRITES.WATER, 'world_tiles', 0, 0);
    }

    public getSheetConfig(key: string): SheetConfig | undefined {
        return this.sheetConfigs.get(key);
    }

    public rebuildCache() {
        this.buildSpriteCache();
    }

    private mapSprite(id: number, sheet: string, col: number, row: number, cols: number = 1, rows: number = 1) {
        const img = this.images.get(sheet);
        if (!img) return;

        // Dynamic Grid Calculation
        const config = this.sheetConfigs.get(sheet);
        const tileSize = config ? config.tileSize : 32;

        let finalSx = col * tileSize;
        let finalSy = row * tileSize;

        this.spriteCache.set(id, {
            image: img,
            sx: finalSx,
            sy: finalSy,
            sw: cols * tileSize,
            sh: rows * tileSize
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
