
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
        await this.loadImage('knight_sheet', '/sprites/final_knight.png?v=7', false); // Transparency baked in
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

        // 3. FOREST PROPS & TILES (The "Tibia Forest" Set)
        // -------------------------------------------------

        // Props
        await this.loadImage('tree', '/sprites/tree.png?v=FOREST', true);
        await this.loadImage('chest', '/sprites/chest.png?v=FOREST', true);
        await this.loadImage('rock', '/sprites/rock.png?v=FOREST', true);

        // Floors (Isolated & Seamless)
        await this.loadImage('wall', '/sprites/wall.png?v=FOREST', true);
        await this.loadImage('grass', '/sprites/grass.png?v=FOREST', true);
        await this.loadImage('flowers', '/sprites/grass_flowers.png?v=FOREST', true);
        await this.loadImage('pebbles', '/sprites/grass_pebbles.png?v=FOREST', true);

        // Legacy Support (Tibia Floors strip still used for Marble)
        await this.loadImage('tibia_floors', '/sprites/tibia_floors.png?v=MARBLE', true);

        // No shared config needed for individual mappings, but we set strides just in case
        this.sheetConfigs.set('tree', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('chest', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('rock', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });

        // Map Props [Tree, Chest, Rock]

        // Tree (5): tibia_tree.png (32x64)
        this.mapSprite(5, 'tree', 0, 0, 1, 2);

        // Chest (50): chest.png. Full image (32x32).
        this.mapSprite(50, 'chest', 0, 0, 1, 1);

        // Rock (6): rock.png. Full image (32x32).
        this.mapSprite(6, 'rock', 0, 0, 1, 1);

        // Bush (7): Fallback to Rock
        this.mapSprite(7, 'rock', 0, 0, 1, 1);
        this.buildSpriteCache();
        console.log('[AssetManager] Assets loaded.');
    }

    async loadImage(key: string, src: string, applyChroma: boolean = false) {
        return new Promise<void>((resolve, reject) => {
            // Sanitize Base64: Remove any whitespace/newlines that might have crept in
            if (src.startsWith('data:')) {
                src = src.replace(/\s/g, '');
            }

            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Required for canvas manimpulation
            img.src = src;
            img.onload = () => {
                console.log(`Successfully loaded: ${key}`);
                this.images.set(key, img);
                resolve();
            };
            img.onerror = (e) => {
                console.error(`[AssetManager] FAILED to load: ${key}`, e);
                // Create a placeholder based on type
                const placeholder = document.createElement('canvas');
                placeholder.width = 32;
                placeholder.height = 32;
                const ctx = placeholder.getContext('2d');
                if (ctx) {
                    if (key === 'tree') ctx.fillStyle = '#2ecc71'; // Green
                    else if (key === 'rock') ctx.fillStyle = '#95a5a6'; // Grey
                    else if (key === 'chest') ctx.fillStyle = '#e67e22'; // Brown
                    else ctx.fillStyle = '#ff00ff'; // Pink (Generic Error)

                    ctx.fillRect(0, 0, 32, 32);
                    // Add a border so we know it's a fallback
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, 32, 32);
                }
                const pImg = new Image();
                pImg.src = placeholder.toDataURL();
                this.images.set(key, pImg);
                resolve();
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
        // Add Padding 2 to remove "black box" artifacts
        this.mapSprite(SPRITES.PLAYER_DOWN, 'knight_sheet', 0, 0, 1, 1, 2);
        this.mapSprite(SPRITES.PLAYER_UP, 'knight_sheet', 0, 1, 1, 1, 2);
        this.mapSprite(SPRITES.PLAYER_RIGHT, 'knight_sheet', 0, 2, 1, 1, 2);
        this.mapSprite(SPRITES.PLAYER_LEFT, 'knight_sheet', 0, 3, 1, 1, 2);

        // Direct IDs mapping
        this.mapSprite(0, 'knight_sheet', 0, 0, 1, 1, 2);
        this.mapSprite(1, 'knight_sheet', 0, 1, 1, 1, 2);

        // ... (Other mappings)

        // ... (Other mappings)

        // ---------------------------------------------------------
        // 3. PROPS (NEW 2.5D ASSETS) - FIXED MAPPINGS
        // ---------------------------------------------------------

        // Define Configs (Ensure they exist)
        this.sheetConfigs.set('tibia_floors', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('wall', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('grass', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('flowers', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('pebbles', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('tree', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('chest', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
        this.sheetConfigs.set('rock', { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });

        // Tree (ID 5) -> 'tree' sheet (32x64)
        this.mapSprite(5, 'tree', 0, 0, 1, 2);
        this.mapSprite(SPRITES.TREE, 'tree', 0, 0, 1, 2);

        // Rock (ID 6) -> 'rock' sheet (32x32)
        this.mapSprite(6, 'rock', 0, 0, 1, 1);
        this.mapSprite(SPRITES.ROCK, 'rock', 0, 0, 1, 1);

        // Chest (ID 50) -> 'chest' sheet (32x32)
        this.mapSprite(50, 'chest', 0, 0, 1, 1);
        this.mapSprite(SPRITES.CHEST, 'chest', 0, 0, 1, 1);

        // Bush (ID 7) -> Mapping to Rock for now to prevent glitches (or create a bush sheet later)
        this.mapSprite(7, 'rock', 0, 0, 1, 1);
        this.mapSprite(SPRITES.BUSH, 'rock', 0, 0, 1, 1);

        // Altar (ID 21) -> 'world_tiles' (2,1)
        this.mapSprite(21, 'world_tiles', 2, 1);

        // Character Directions (Legacy)
        this.mapSprite(2, 'knight_sheet', 0, 2); // Right
        this.mapSprite(3, 'knight_sheet', 0, 3); // Left

        // 2. WORLD TILES (Standard 32x32 Grid)
        // Row 0: Grass (0,0), Flowers (1,0), Pebbles (2,0)

        // Grass (16) -> 'grass.png' (32x32) [HD Texture]
        this.mapSprite(16, 'grass', 0, 0);
        this.mapSprite(SPRITES.GRASS, 'grass', 0, 0);

        // Wall (17) -> 'wall.png' (32x64) [Tall Object]
        this.mapSprite(17, 'wall', 0, 0, 1, 2);
        this.mapSprite(200, 'wall', 0, 0, 1, 2);
        this.mapSprite(SPRITES.WALL, 'wall', 0, 0, 1, 2);

        // Variants (New Isolated Forest Files)
        this.mapSprite(161, 'flowers', 0, 0);  // Flower Grass
        this.mapSprite(162, 'pebbles', 0, 0);  // Pebble Grass
        this.mapSprite(SPRITES.FLOWERS, 'flowers', 0, 0);

        // Floor (Marble)
        this.mapSprite(201, 'tibia_floors', 4, 0);  // Marble
        this.mapSprite(1, 'tibia_floors', 4, 0);

        // Altar (Legacy fallback)
        this.mapSprite(20, 'world_tiles', 2, 1);
        this.mapSprite(202, 'world_tiles', 2, 1);

        // ... (Other mappings)

        // --- FALLBACKS ---
        this.mapSprite(SPRITES.WATER, 'grass', 0, 0); // Fallback water to grass

    }

    public getSheetConfig(key: string): SheetConfig | undefined {
        return this.sheetConfigs.get(key);
    }

    public rebuildCache() {
        this.buildSpriteCache();
    }

    private mapSprite(id: number, sheet: string, col: number, row: number, cols: number = 1, rows: number = 1, padding: number = 0) {
        const img = this.images.get(sheet);
        if (!img) return;

        // Dynamic Grid Calculation
        const config = this.sheetConfigs.get(sheet);
        const tileSize = config ? config.tileSize : 32;

        let finalSx = (col * tileSize) + padding;
        let finalSy = (row * tileSize) + padding;
        let finalSw = (cols * tileSize) - (padding * 2);
        let finalSh = (rows * tileSize) - (padding * 2);

        this.spriteCache.set(id, {
            image: img,
            sx: finalSx,
            sy: finalSy,
            sw: finalSw,
            sh: finalSh
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
