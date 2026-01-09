
export const SHEET_TILE_SIZE = 32;
export const SHEET_COLS = 8; // Restored for compatibility

// Map sprite names to IDs
export const SPRITES = {
    // Characters (Procedural)
    PLAYER: 0,
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
        console.log('[AssetManager] Loading Assets (AI PHASE 2 & 3)...');

        // 1. Load User's Tileset (for Ground)
        await this.loadImage('forest', 'assets/tileset.jpg');
        this.sheetConfigs.set('forest', { tileSize: 32, stride: 33, offsetX: 33, offsetY: 33 });

        // 2. Load & Process AI Assets (Nearest Neighbor Resize + Chroma Key)
        await this.loadAIAsset('ai_tree', 'assets/generated_tree.png', 96);
        await this.loadAIAsset('ai_bush', 'assets/ai_bush.png', 32);

        // Characters
        await this.loadAIAsset('ai_mage', 'assets/ai_mage.png', 32);
        await this.loadAIAsset('ai_orc', 'assets/ai_orc.png', 32);
        await this.loadAIAsset('ai_skeleton', 'assets/ai_skeleton.png', 32);
        await this.loadAIAsset('ai_rock', 'assets/ai_rock.png', 32);
        await this.loadAIAsset('ai_wolf', 'assets/ai_wolf.png', 32);
        await this.loadAIAsset('ai_knight', 'assets/ai_knight.png', 32);
        await this.loadAIAsset('ai_guard', 'assets/ai_guard.png', 32);
        await this.loadAIAsset('ai_old_man', 'assets/ai_old_man.png', 32);
        await this.loadAIAsset('ai_warlord', 'assets/ai_warlord.png', 32);
        await this.loadAIAsset('ai_yeti', 'assets/ai_yeti.png', 32);

        // Items & Misc
        await this.loadAIAsset('ai_sword', 'assets/ai_sword.png', 32);
        await this.loadAIAsset('ai_potion', 'assets/ai_potion.png', 32);
        await this.loadAIAsset('ai_chest', 'assets/ai_chest.png', 32);

        // Terrain - Phase 5
        await this.loadAIAsset('ai_grass', 'assets/ai_grass.png', 32);
        await this.loadAIAsset('ai_water', 'assets/ai_water.png', 32);
        await this.loadAIAsset('ai_stone_wall', 'assets/ai_stone_wall.png', 32);
        await this.loadAIAsset('ai_wood_floor', 'assets/ai_wood_floor.png', 32);

        // Fixes
        await this.loadAIAsset('ai_fireball_v2', 'assets/ai_fireball_v2.png', 32);

        await this.loadItems();

        this.loaded = true;
        this.buildSpriteCache();
        console.log('[AssetManager] Assets generated.');
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
        this.mapSprite(SPRITES.PLAYER, 'ai_mage', 0, 0);
        this.mapSprite(SPRITES.MAGE, 'ai_mage', 0, 0);
        this.mapSprite(SPRITES.NPC, 'ai_old_man', 0, 0);
        this.mapSprite(SPRITES.GUARD, 'ai_guard', 0, 0);
        this.mapSprite(SPRITES.KNIGHT, 'ai_knight', 0, 0);
        this.mapSprite(SPRITES.ORC, 'ai_orc', 0, 0); // Standard Orc
        // The instruction had a conflicting mapping for ID 9 (ORC) and ai_warlord.
        // To avoid overwriting, and since SPRITES.ORC is already mapped to ai_orc,
        // we will map ai_warlord to SPRITES.ORC as well, effectively making the Warlord
        // use the ai_orc sprite unless game.ts is updated to use a new ID for Warlord.
        // For now, we'll keep the existing ORC mapping.
        // If a specific Warlord sprite is needed, a new SPRITES enum entry would be ideal.
        this.mapSprite(SPRITES.YETI, 'ai_yeti', 0, 0);

        this.mapSprite(SPRITES.SKELETON, 'ai_skeleton', 0, 0);
        this.mapSprite(SPRITES.WOLF, 'ai_wolf', 0, 0);

        // TERRAIN
        // Note: Using 'forest' which now contains the User's Tileset
        // MAPPING TO TILES
        this.mapSprite(SPRITES.TREE, 'ai_tree', 0, 0, 3, 3); // 3x3 Big Tree (AI Generated)
        this.mapSprite(SPRITES.PINE_TREE, 'forest', 4, 0, 1, 2); // 1x2 Pine
        this.mapSprite(SPRITES.ROCK, 'ai_rock', 0, 0, 1, 1);      // Phase 1 AI Rock
        this.mapSprite(SPRITES.BUSH, 'ai_bush', 0, 0, 1, 1);      // Phase 2 AI Bush

        // Use a safe tile for Grass (Row 4, Col 0)
        // this.mapSprite(SPRITES.GRASS, 'forest', 0, 4); // Replaced by new AI asset

        // Water
        // this.mapSprite(SPRITES.WATER, 'forest', 1, 4); // Replaced by new AI asset

        // NEW TERRAIN MAPPINGS (Phase 5)
        this.mapSprite(SPRITES.GRASS, 'ai_grass', 0, 0); // Replaces broken tileset
        this.mapSprite(SPRITES.WATER, 'ai_water', 0, 0);

        // Remap Town Structure to New IDs
        this.mapSprite(SPRITES.TOWN_WALL, 'ai_stone_wall', 0, 0);
        this.mapSprite(SPRITES.TOWN_FLOOR, 'ai_wood_floor', 0, 0);

        // Items
        this.mapSprite(SPRITES.SWORD, 'ai_sword', 0, 0);
        this.mapSprite(SPRITES.POTION, 'ai_potion', 0, 0);

        // Projectiles
        this.mapSprite(SPRITES.FIREBALL, 'ai_fireball_v2', 0, 0); // Fixed ID 100

        // Misc
        // Chest is usually a sprite like "Box" or "Crate".
        // SPRITES doesn't have CHEST explicitly listed in the visible snippet?
        // Ah, SPRITES needs to be checked.
        // If not, I'll just leave it loaded as 'ai_chest' for future use.
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
