
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
        console.log('[AssetManager] Loading Placeholder Assets...');

        // 1. Load the Placeholders you just generated
        // Note: We use 'sprites/' because Vite serves 'public/' as root
        await this.loadImage('knight', 'sprites/player_knight.png');
        await this.loadImage('mage', 'sprites/player_mage.png');
        await this.loadImage('ranger', 'sprites/player_ranger.png');
        await this.loadImage('orc', 'sprites/enemy_orc.png');
        await this.loadImage('grass', 'sprites/tile_grass.png');
        await this.loadImage('wall', 'sprites/tile_wall.png');

        // Define how to read them (Simple 32x32 single tiles)
        const singleTile = { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 };

        this.sheetConfigs.set('knight', singleTile);
        this.sheetConfigs.set('mage', singleTile);
        this.sheetConfigs.set('ranger', singleTile);
        this.sheetConfigs.set('orc', singleTile);
        this.sheetConfigs.set('grass', singleTile);
        this.sheetConfigs.set('wall', singleTile);

        // Load Items (fallback to keep inventory working)
        await this.loadItems();

        this.loaded = true;
        this.buildSpriteCache();
        console.log('[AssetManager] Placeholders loaded.');
    }

    async loadImage(key: string, src: string) {
        const img = new Image();
        img.src = src;
        await new Promise(r => img.onload = r);
        this.images.set(key, img);
    }

    async loadAIAsset(key: string, src: string, size: number) {
        return new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = src;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;

                // RESIZE
                canvas.width = size;
                canvas.height = size;

                // Draw Resized (Nearest Neighbor for Pixel Art feel)
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, size, size);

                // CHROMA KEY: Remove White Background
                const imageData = ctx.getImageData(0, 0, size, size);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // If pixel is white/near-white, make transparent
                    if (r > 240 && g > 240 && b > 240) {
                        data[i + 3] = 0;
                    }

                    // Special Case for AI Grass/Water/Walls (Don't transparent the whole thing if it's white? 
                    // Actually, texture gen usually has no bg. 
                    // But if it DOES have white highlights, Chroma Key might kill them.
                    // Let's assume Generated Images "Background: Solid white background" works for sprites.
                    // For textures (Prompt said "seamless", "no dark borders").
                    // Let's keep Chroma Key for now, hoping prompt didn't put white INSIDE the texture.
                    // Actually, Grass/Water might need to be OPAQUE.
                }

                // If it's a seamless tile (Grass/Water/Floor/Wall), we probably want it OPAQUE.
                // Hacks based on key name.
                if (key.includes('grass') || key.includes('water') || key.includes('wall') || key.includes('floor')) {
                    // Restore original alpha (unless it was actually transparent)
                    ctx.putImageData(imageData, 0, 0);
                    // Wait, if we chroma keyed it we lost it.
                    // For seamless tiles, we typically DON'T want chroma keying if the generator made a full tile.
                    // Let's just reloading the image if we messed up? 
                    // Better: Conditional Chroma Key.
                    ctx.drawImage(img, 0, 0, size, size); // Redraw over cleanly
                } else {
                    ctx.putImageData(imageData, 0, 0);
                }

                const cleanImg = new Image();
                cleanImg.src = canvas.toDataURL();
                this.images.set(key, cleanImg);

                // Config for AI Asset
                this.sheetConfigs.set(key, { tileSize: 32, stride: 32, offsetX: 0, offsetY: 0 });
                console.log(`[AssetManager] Processed AI Asset: ${key}`);
                resolve();
            };
        });
    }

    // Using the Lush Generator for better quality characters
    private generateLushCharacter(key: string, main: string, accent: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(16, 28, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(16, 12, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(7, 18, 18, 11);
        ctx.fillStyle = main; ctx.fillRect(8, 19, 16, 9);
        ctx.fillStyle = '#ffccaa'; ctx.beginPath(); ctx.arc(16, 12, 10, 0, Math.PI * 2); ctx.fill();
        if (key === 'mage') { ctx.fillStyle = main; ctx.beginPath(); ctx.arc(16, 12, 11, Math.PI, 0); ctx.fill(); }
        const img = new Image(); img.src = canvas.toDataURL();
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

        // CHARACTERS (Mapped to Phase 1-4 AI Assets)
        // PLAYER MAPPED TO SHEET (Cols: 3, Rows: 1)
        // Load the sheet first in load()!

        // Mapping PLAYER to the sheet. 
        // 0,0 is Front. 
        // We will need logic in Renderer to pick the right column based on Facing.
        // For now, map sprite 0 to the whole sheet or first frame?
        // mapSprite takes (id, sheet, col, row, cols, rows)
        // Let's map ID 0 to the First Frame (Front)
        this.mapSprite(SPRITES.PLAYER, 'ai_mage_sheet', 0, 0);

        // We might need separate IDs for directions if the renderer isn't smart yet.
        // OR we rely on the Renderer to use (BaseID + Offset).
        // Standard RPGs often use: ID (Front), ID+1 (Back), ID+2 (Side).
        // ASSETS.TS SPRITES: PLAYER=0.
        // So let's map:
        // 0 -> Front
        // 1 -> Back? No, 1 is Mage (which is also Player).
        // game.ts inputSystem sets facingX/Y.

        // Let's Check Renderer Logic or Sprite Component.
        // Viewed files: game.ts uses `new Sprite(spriteIndex)`.
        // It doesn't seem to dynamically change Sprite ID based on facing yet.
        // Phase 6 Goal: "Directional Sprites".
        // I need to UPDATE game.ts/renderer.ts to support this.
        // --- MAP THE IDS TO YOUR NEW FILES ---

        // Characters
        this.mapSprite(SPRITES.PLAYER, 'knight', 0, 0); // Default Knight
        this.mapSprite(SPRITES.KNIGHT, 'knight', 0, 0);
        this.mapSprite(SPRITES.MAGE, 'mage', 0, 0);
        this.mapSprite(SPRITES.RANGER, 'ranger', 0, 0);
        this.mapSprite(SPRITES.ORC, 'orc', 0, 0);

        // Map other enemies to Orc for now (so they aren't invisible)
        this.mapSprite(SPRITES.SKELETON, 'orc', 0, 0);
        this.mapSprite(SPRITES.ZOMBIE, 'orc', 0, 0);

        // Terrain
        this.mapSprite(SPRITES.GRASS, 'grass', 0, 0);      // ID 16
        this.mapSprite(SPRITES.WALL, 'wall', 0, 0);      // ID 17

        // Map "Town" tiles to standard tiles for now
        this.mapSprite(SPRITES.TOWN_FLOOR, 'grass', 0, 0);
        this.mapSprite(SPRITES.TOWN_WALL, 'wall', 0, 0);

        // Fallbacks for missing generated files
        // Use 'grass' for things like Water/Wood so they aren't black
        this.mapSprite(SPRITES.WATER, 'grass', 0, 0);
        this.mapSprite(SPRITES.WOOD, 'grass', 0, 0);

        // Directional Fallbacks (until proper sheets exist)
        this.mapSprite(SPRITES.PLAYER_BACK, 'knight', 0, 0);
        this.mapSprite(SPRITES.PLAYER_SIDE, 'knight', 0, 0);
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
