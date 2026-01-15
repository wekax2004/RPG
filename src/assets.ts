import { SPRITE_MAP } from './data/sprites_map';

export class AssetManager {
    images: Record<number, HTMLCanvasElement> = {};
    private loadedImages: Record<string, HTMLImageElement> = {};
    private loadPromises: Promise<void>[] = [];
    private sheetCache: Record<string, HTMLImageElement> = {};

    // Bayer 4x4 Ordered Dithering Matrix (Tibia-style pixel art)
    private ditherMatrix = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
    ];

    constructor() {
        this.init();
    }

    async loadAll() {
        console.log("[AssetManager] Loading External Assets...");

        // 1. Identify unique sheets
        const uniqueFiles = new Set<string>();
        Object.values(SPRITE_MAP).forEach(def => uniqueFiles.add(def.file));

        // 2. Load Sheets (Parallel)
        const sheetMap = new Map<string, HTMLCanvasElement>();
        await Promise.all(Array.from(uniqueFiles).map(async (file) => {
            try {
                const cvs = await this.loadExternalImage(file);
                sheetMap.set(file, cvs);
            } catch (e) {
                console.warn(`[AssetManager] Failed to load sheet: ${file}`);
            }
        }));

        // 3. Slice Sprites
        Object.entries(SPRITE_MAP).forEach(([key, def]) => {
            const id = parseInt(key);
            const sheet = sheetMap.get(def.file);
            if (sheet) {
                const cvs = this.createCanvas(def.width, def.height);
                const ctx = cvs.getContext('2d')!;
                // Draw slice
                ctx.drawImage(sheet, def.x, def.y, def.width, def.height, 0, 0, def.width, def.height);
                this.images[id] = cvs;
            }
        });
        console.log(`[AssetManager] Loaded ${Object.keys(SPRITE_MAP).length} external sprites.`);
    }

    // Check if pixel should be dithered based on position and threshold
    private shouldDither(x: number, y: number, threshold: number): boolean {
        return this.ditherMatrix[y % 4][x % 4] < threshold;
    }

    // Load external image and convert to canvas
    private loadExternalImage(url: string): Promise<HTMLCanvasElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const cvs = document.createElement('canvas');
                cvs.width = img.width;
                cvs.height = img.height;
                const ctx = cvs.getContext('2d')!;
                ctx.drawImage(img, 0, 0);
                resolve(cvs);
            };
            img.onerror = () => {
                console.warn(`[AssetManager] Failed to load: ${url}, using fallback`);
                reject(new Error(`Failed to load ${url}`));
            };
            img.src = url;
        });
    }

    init() {
        console.log("[AssetManager] Forging Tibia-Quality Textures...");

        // 1. Generate ALL Procedural Assets Synchronously (Immediate availability)

        // ===== TERRAIN =====
        this.images[10] = this.createGrass(0);   // Grass (Fallback)
        this.images[16] = this.createGrass(1);   // Alt Grass (Fallback)
        this.images[11] = this.createDirt();     // Dirt
        this.images[12] = this.createCobble();   // Cobblestone
        this.images[13] = this.createWater();    // Water
        this.images[14] = this.createWoodFloor();// Wood Floor
        this.images[15] = this.createStoneFloor();// Stone Floor

        // ===== ARCHITECTURE (2.5D Tall) =====
        this.images[21] = this.createWall();     // Stone Wall
        this.images[17] = this.createWall();     // Stone Wall (alias)

        // ===== NATURE =====
        this.images[50] = this.createTree();     // Oak Tree (Fallback)
        this.images[5] = this.images[50];        // Tree (alias)
        this.images[6] = this.createRock();      // Rock

        // ===== DECORATIONS =====
        this.images[30] = this.createBarrel();   // Barrel
        this.images[31] = this.createCrate();    // Crate
        this.images[32] = this.createTorch();    // Torch

        // ===== LOOT ITEMS =====
        this.images[40] = this.createGold();     // Gold Coins
        this.images[41] = this.createPotion();   // Health Potion
        this.images[42] = this.createSword();    // Sword
        this.images[46] = this.createShield();   // Shield
        this.images[22] = this.createBackpack(); // Backpack
        this.images[21] = this.createBackpack(); // Bag (Reuse for now)

        // ===== WEAPONS: AXES =====
        this.images[130] = this.createAxe('hand');    // Hand Axe
        this.images[131] = this.createAxe('battle');  // Battle Axe

        // ===== ARMOR: DWARVEN SET =====
        this.images[120] = this.createHelmet();  // Dwarven Helmet
        this.images[122] = this.createLegs();    // Dwarven Legs

        // ===== MONSTERS (2.5D Tall) =====
        this.images[200] = this.createRat();     // Rat
        this.images[201] = this.createWolf();    // Wolf
        this.images[202] = this.createSkeleton();// Skeleton
        this.images[203] = this.createSlime();   // Slime
        this.images[202] = this.createSkeleton(); // Skeleton

        // ===== TERRAIN =====
        this.images[13] = this.createWater();
        this.images[14] = this.createWoodFloor();
        this.images[15] = this.createStoneFloor();

        // ===== DECOR =====
        this.images[30] = this.createBarrel();
        this.images[31] = this.createCrate();
        this.images[32] = this.createTorch();

        // ===== LOOT =====
        this.images[40] = this.createGold();
        this.images[41] = this.createPotion();
        this.images[42] = this.createSword();
        this.images[22] = this.createBackpack();
        this.images[21] = this.createBackpack();

        // ===== PLAYER =====
        this.images[199] = this.createPlayer();  // Red Knight (Player)
        this.images[299] = this.createCorpse();  // Corpse (Bones)

        // ===== GOLDEN SET (Legendary) =====
        this.images[100] = this.createHelmetGen('#ffd700', '#fff'); // Golden Helmet
        this.images[101] = this.createArmorPlate('#ffd700', '#fff'); // Golden Armor
        this.images[102] = this.createLegsPlate('#ffd700');          // Golden Legs
        this.images[103] = this.createBoots('#ffd700');             // Golden Boots
        this.images[104] = this.createShieldGen('#ffd700', '#fff'); // Golden Shield

        // ===== ELF SET (Green/Wood) =====
        this.images[110] = this.createBow();                        // Elven Bow
        this.images[111] = this.createArmorPlate('#4caf50', '#8bc34a'); // Elven Armor
        this.images[112] = this.createLegsPlate('#4caf50');         // Elven Legs

        // ===== DWARF SET (Iron/Earth) - Completing =====
        // 120 (Helmet) & 122 (Legs) already done above
        this.images[121] = this.createArmorPlate('#795548', '#5d4037'); // Dwarven Armor
        this.images[123] = this.createShieldGen('#795548', '#5d4037');  // Dwarven Shield

        // ===== WEAPONS: AXES =====
        this.images[132] = this.createAxe('battle'); // Orc Axe (reuse battle style)
        this.images[133] = this.createAxe('battle'); // War Axe
        this.images[134] = this.createAxe('battle'); // Executioner

        // ===== WEAPONS: CLUBS =====
        this.images[140] = this.createClub('#8d6e63', false); // Wooden Club
        this.images[141] = this.createClub('#757575', true);  // Iron Mace
        this.images[142] = this.createClub('#424242', false); // Warhammer
        this.images[143] = this.createClub('#212121', true);  // Morning Star

        // ===== WEAPONS: SWORDS =====
        this.images[150] = this.createSwordGen('#8d6e63', '#5d4037', false); // Rusty
        this.images[151] = this.createSwordGen('#a1887f', '#795548', false); // Wooden
        this.images[152] = this.createSwordGen('#e0e0e0', '#9e9e9e', true);  // Iron
        this.images[153] = this.createSwordGen('#fff9c4', '#fbc02d', true);  // Bone
        this.images[154] = this.createSwordGen('#b0bec5', '#607d8b', true);  // Steel
        this.images[155] = this.createSwordGen('#ffcdd2', '#c62828', true);  // Demon
        this.images[156] = this.createSwordGen('#e1bee7', '#8e24aa', true);  // Noble
        this.images[157] = this.createSwordGen('#c8e6c9', '#388e3c', false); // Venom Dagger

        // ===== ARMOR: MISC =====
        this.images[160] = this.createArmorPlate('#bcaaa4', '#8d6e63'); // Wolf Pelt
        this.images[161] = this.createArmorPlate('#795548', '#4e342e'); // Bear Fur
        this.images[162] = this.createArmorPlate('#a1887f', '#5d4037'); // Orc Armor
        this.images[163] = this.createHelmetGen('#9e9e9e', '#000');     // Skull Helm
        this.images[164] = this.createHelmetGen('#5d4037', '#3e2723');  // Bandit Hood
        this.images[165] = this.createHelmetGen('#ffd700', '#f44336');  // Crown
        this.images[166] = this.createShieldGen('#c62828', '#ffd700');  // Dragon Shield
        this.images[167] = this.createShieldGen('#5d4037', '#9e9e9e');  // Orc Shield

        // ===== TOOLS (Fixed uIndex) =====
        this.images[124] = this.createTool('shovel'); // ID 124
        this.images[65] = this.createTool('rope');    // ID 65
        this.images[43] = this.createTool('machete'); // ID 43
        this.images[66] = this.createTool('pickaxe'); // ID 66

        // ===== GEMS / DECOR =====
        this.images[203] = this.createGem('#f44336'); // Ruby
        this.images[204] = this.createGem('#2196f3'); // Sapphire
        this.images[172] = this.createGem('#eee');    // Spider Silk (White Gem placeholder)
        this.images[86] = this.createPotion();        // Mana Potion (Reuse Potion)

        // ===== MISSING ARMOR =====
        this.images[2] = this.createArmorPlate('#b0bec5', '#78909c'); // Plate Armor (ID 2)

        // ===== TOWN NPCS (Fallback) =====
        this.images[260] = this.createNPC('#4a3070', '#8a60a0'); // Merchant (Purple)
        this.images[261] = this.createNPC('#ffffff', '#a0d0f0'); // Healer (White)
        this.images[262] = this.createNPC('#306030', '#60a060'); // Guide (Green)

        // ===== NEW MAPPINGS =====
        this.images[33] = this.createParcel();
        this.images[170] = this.createFood('meat');
        this.images[171] = this.createFood('rotten');
        this.images[301] = this.createGeneric('#fff59d'); // Sand
        this.images[302] = this.createFence();
        this.images[305] = this.createGeneric('#8d6e63'); // Dirt Path
        this.images[306] = this.createGeneric('#5d4037'); // Wooden Door
        this.images[125] = this.createHole();
        this.images[126] = this.createHole(); // Rope Spot
        this.images[140] = this.createClub('#8d6e63', false); // Wooden Club

        // ===== MISSING MOBS =====
        // ORCS (Green Skin)
        this.images[9] = this.createNPC('#4caf50', '#5d4037');   // Orc (Generic)
        this.images[252] = this.createNPC('#8bc34a', '#795548'); // Orc Peon (Lighter Green)
        this.images[253] = this.createNPC('#1b5e20', '#3e2723'); // Orc Warlord (Dark Green, Dark Armor)

        // DWARVES (Unique Sprites)
        this.images[251] = this.createDwarf('#ffcc80', '#607d8b', '#37474f'); // Dwarf Guard (Iron/Grey)
        this.images[254] = this.createDwarf('#ffcc80', '#795548', '#3e2723'); // Dwarf Miner (Brown)
        this.images[255] = this.createDwarf('#ffcc80', '#9c27b0', '#eeeeee'); // Dwarf Geomancer (Purple/White)

        // DRAGON (Use Red Wolf/Lizard logic or just a Red NPC for now?)
        // Let's use createWolf but Red and Bigger?
        // Or just a Red Player/Knight (Dragon Humanoid?)
        // Let's use a generic Red "Beast" using createWolf logic but modified?
        // Actually, createWolf is quad. Dragon Hatchling...
        // Let's map it to a Red Wolf for now (Better than nothing)
        const dragon = this.createWolf();
        // Tint it Red? We can't tint here easily without modifying pixels. 
        // But the Mob Spawner applies Tint!
        // main.ts line 297: world.addComponent(e, new Tint("#FF4444BA"));
        // So we just need a base sprite.
        // Let's use the Wolf sprite for Hatchling (ID 303).
        this.images[303] = this.createWolf();

        console.log(`[AssetManager] NPC Sprites: 260=${this.images[260]?.width}x${this.images[260]?.height}, 261=${this.images[261]?.width}x${this.images[261]?.height}, 262=${this.images[262]?.width}x${this.images[262]?.height}`);

        console.log(`[AssetManager] Forged ${Object.keys(this.images).length} Tibia-quality procedural assets.`);

        // 2. Start Loading External Sprites (Async Overwrite)
        this.loadExternalSprites();
    }

    private async loadExternalSprites() {
        console.log("[AssetManager] Loading external Tibia sprites...");
        try {
            // 1. Load Legacy Individual Sprites
            try {
                const grass1 = await this.loadExternalImage('/grass1.png');
                const grass2 = await this.loadExternalImage('/grass2.png');
                const grass3 = await this.loadExternalImage('/grass3.png');
                const rock = await this.loadExternalImage('/rock.png');
                this.images[10] = grass1;
                this.images[16] = grass2;
                this.images[161] = grass3;
                this.images[6] = rock;
            } catch (ignore) { /* Optional */ }

            // 2. Load Mapped Sprites from Sheets
            // Dynamic Import to avoid cycle if necessary, or just top-level
            const { SPRITE_MAP, SPRITE_SHEET_BASE_PATH } = await import('./data/sprites_map');

            // Group by Sheet to minimize network requests
            const sheetGroups: Record<string, number[]> = {};
            for (const [idStr, def] of Object.entries(SPRITE_MAP)) {
                if (!sheetGroups[def.file]) sheetGroups[def.file] = [];
                sheetGroups[def.file].push(Number(idStr));
            }

            // Load Sheets
            for (const [file, ids] of Object.entries(sheetGroups)) {
                const url = SPRITE_SHEET_BASE_PATH + file;
                try {
                    let img = this.sheetCache[file];
                    if (!img) {
                        img = await this.loadImageElement(url);
                        this.sheetCache[file] = img;
                    }

                    // Slice Sprites & Chroma Key
                    for (const id of ids) {
                        const def = SPRITE_MAP[id];
                        const spriteCvs = this.createCanvas(def.width, def.height);
                        const ctx = spriteCvs.getContext('2d')!;
                        ctx.imageSmoothingEnabled = false; // Disable smoothing for pixel art

                        // Auto-Scale Handler for AI Generated Images (1024x1024)
                        let sx = def.x;
                        let sy = def.y;
                        let sw = def.width;
                        let sh = def.height;

                        // ONLY apply to Custom Assets (ID >= 300) OR Legacy Nature (Tree=50/51, Rock=6). 
                        // OTSP Assets separate from these.
                        const isLegacyNature = (id === 50 || id === 51 || id === 6);
                        if ((id >= 300 || isLegacyNature) && def.x === 0 && def.y === 0 && img.width >= 128 && img.height >= 128) {
                            sx = 0;
                            sy = 0;
                            sw = img.width;
                            sh = img.height;

                            // CRITICAL: Enable smoothing for massive downscale (1024 -> 32)
                            // Otherwise Nearest Neighbor deletes the tree pixels.
                            ctx.imageSmoothingEnabled = true;
                            // console.log(`[AssetManager] Auto-scaling large asset ${id} (${img.width}x${img.height}) -> 32x32`);
                        }

                        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, def.width, def.height);



                        // BFS Flood Fill Transparency
                        // Removes contiguous background starting from (0,0)
                        // Preserves internal whites (eyes, shines)

                        const imageData = ctx.getImageData(0, 0, def.width, def.height);
                        const data = imageData.data;
                        const w = def.width;
                        const h = def.height;

                        // Get Target Color from (0,0)
                        const bgR = data[0];
                        const bgG = data[1];
                        const bgB = data[2];
                        const bgA = data[3];

                        const shouldFill = (id >= 300 || isLegacyNature);
                        if (shouldFill) {
                            if (bgA > 200) {
                                // Proceed with Fill
                                const visited = new Int8Array(w * h);
                                const queue: number[] = [0];
                                const TOL = 40; // Increased Tolerance slightly

                                // ... (rest of logic continues below)
                                // I need to be careful not to break the structure.
                                // The previous code had `if ((id >= 300 || isLegacyNature) && bgA > 200) {`
                                // I will replace that block header.
                            } else {
                                console.warn(`[AssetDebug] SKIPPING Flood Fill for ID ${id}. BG Alpha too low? (${bgA}) or Color: ${bgR},${bgG},${bgB}`);
                            }
                        }

                        // RE-INSERTING THE BLOCK HEADER CORRECTLY
                        if (shouldFill && bgA > 200) {
                            const visited = new Int8Array(w * h); // 0=unvisited, 1=visited
                            const queue: number[] = [0]; // Start at index 0 (0,0)
                            const TOL = 40; // Hardcoded increased tolerance

                            while (queue.length > 0) {
                                const idx = queue.pop()!;
                                if (visited[idx]) continue;
                                visited[idx] = 1;

                                const px = (idx % w);
                                const py = Math.floor(idx / w);
                                const dataIdx = idx * 4;

                                const r = data[dataIdx];
                                const g = data[dataIdx + 1];
                                const b = data[dataIdx + 2];

                                // Check if match
                                if (Math.abs(r - bgR) < TOL &&
                                    Math.abs(g - bgG) < TOL &&
                                    Math.abs(b - bgB) < TOL) {

                                    // Remove Pixel
                                    data[dataIdx + 3] = 0;

                                    // Add Neighbors
                                    if (px > 0) queue.push(idx - 1);
                                    if (px < w - 1) queue.push(idx + 1);
                                    if (py > 0) queue.push(idx - w);
                                    if (py < h - 1) queue.push(idx + w);
                                }
                            }
                        }

                        // Always remove Magenta (#FF00FF) globally just in case
                        for (let i = 0; i < data.length; i += 4) {
                            if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 255) {
                                data[i + 3] = 0;
                            }
                        }

                        ctx.putImageData(imageData, 0, 0);

                        this.images[id] = spriteCvs;
                        // console.log(`[AssetManager] Loaded Sprite ${id} from ${file}`);
                    }
                } catch (e) {
                    console.error(`[AssetManager] FAILED to process sprite ${file} for IDs: ${ids}`, e);
                }
            }

            console.log("[AssetManager] Successfully upgraded to external Tibia sprites!");

            // 3. Load AI-Generated NPC Sprites (high quality)
            await this.loadAISprites();
        } catch (e) {
            console.warn("[AssetManager] External load failed, satisfying with procedural assets.", e);
        }
    }

    // Load high-quality AI-generated sprites
    private async loadAISprites(): Promise<void> {
        const aiSprites: { [id: number]: string } = {
            // NPCs
            260: '/sprites/npc_merchant.png',
            261: '/sprites/npc_healer.png',
            262: '/sprites/npc_guide.png',
            262: '/sprites/npc_guide.png',
            // Orcs
            9: '/sprites/orc_warrior.png',
            252: '/sprites/orc_peon.png',
            253: '/sprites/orc_warlord.png',
        };

        for (const [idStr, url] of Object.entries(aiSprites)) {
            const id = parseInt(idStr);
            try {
                const img = await this.loadImageElement(url);

                // Use 32x64 canvas (same as player sprite) so renderer scales correctly
                // Renderer uses: dstW = 32, dstH = 32 * (h/w) 
                // So 32x64 -> renders at 32x64 (2 tiles tall, same as player)
                const w = 32;
                const h = 64;

                const cvs = this.createCanvas(w, h);
                const ctx = cvs.getContext('2d')!;
                ctx.imageSmoothingEnabled = false;

                // Draw image filling entire canvas (will stretch but keeps proportions relative to tile)
                ctx.drawImage(img, 0, 0, w, h);

                // Remove Magenta (#FF00FF) background
                const imageData = ctx.getImageData(0, 0, w, h);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    // Magenta and near-magenta tolerance
                    if (r > 200 && g < 100 && b > 200) {
                        data[i + 3] = 0; // Make transparent
                    }
                }
                ctx.putImageData(imageData, 0, 0);

                this.images[id] = cvs;
                console.log(`[AssetManager] Loaded AI sprite ${id} (${w}x${h})`);
            } catch (e) {
                console.warn(`[AssetManager] Failed to load AI sprite ${id}: ${url}`, e);
            }
        }

        // RE-APPLY PROCEDURAL OVERRIDES (To prevent external assets from overwriting them)
        this.images[251] = this.createDwarf('#ffcc80', '#607d8b', '#37474f'); // Dwarf Guard
        this.images[254] = this.createDwarf('#ffcc80', '#795548', '#3e2723'); // Dwarf Miner
        this.images[255] = this.createDwarf('#ffcc80', '#9c27b0', '#eeeeee'); // Dwarf Geomancer
    }

    private loadImageElement(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load ${url}`));
            img.src = url;
        });
    }

    getSprite(id: number): HTMLCanvasElement {
        if (id === 51 && Math.random() < 0.01) {
            const s = this.images[id];
            console.log(`[AssetDebug] Tree(51):`, s ? `${s.width}x${s.height}` : "MISSING");
        }
        return this.images[id] || this.images[10];
    }

    getSpriteSource(id: number): { image: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number } {
        const cvs = this.getSprite(id);
        return { image: cvs, sx: 0, sy: 0, sw: cvs.width, sh: cvs.height };
    }

    getSpriteRect(id: number): { x: number, y: number, w: number, h: number } {
        const cvs = this.getSprite(id);
        return { x: 0, y: 0, w: cvs.width, h: cvs.height };
    }

    // =========================================================
    // TIBIA-QUALITY GRASS (Ordered Dithering)
    // =========================================================
    private createGrass(variant: number): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Base Green
        const BASE = variant === 0 ? '#4caf50' : '#43a047';
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);

        // Subtle Noise (No pattern)
        for (let i = 0; i < 128; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            ctx.fillStyle = Math.random() > 0.5 ? '#66bb6a' : '#2e7d32'; // Lighter or Darker
            ctx.fillRect(x, y, 1, 1);
        }

        // Grass Tufts (keeping the V shape but lighter)
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const x = (variant * 7 + i * 5) % 28 + 2;
            const y = (variant * 3 + i * 7) % 26 + 4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 1, y - 2);
            ctx.moveTo(x, y);
            ctx.lineTo(x + 1, y - 2);
            ctx.stroke();
        }

        return cvs;
    }

    // =========================================================
    // TIBIA-QUALITY DIRT TILE
    // =========================================================
    private createDirt(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        const BASE = '#5d4037'; // Dirt Brown
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);

        // Noise
        for (let i = 0; i < 128; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            ctx.fillStyle = Math.random() > 0.5 ? '#795548' : '#4e342e'; // Light/Dark
            ctx.fillRect(x, y, 1, 1);
        }

        return cvs;
    }

    // =========================================================
    // TIBIA-QUALITY COBBLESTONE
    // =========================================================
    private createCobble(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        const DARK = '#4a4a4a';
        const MID = '#6a6a6a';
        const LIGHT = '#8a8a8a';
        const MORTAR = '#3a3a3a';

        // Base mortar
        ctx.fillStyle = MORTAR;
        ctx.fillRect(0, 0, 32, 32);

        // Draw cobblestones in grid
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = col * 8 + (row % 2) * 4;
                const y = row * 8;

                // Stone base
                ctx.fillStyle = MID;
                ctx.fillRect(x + 1, y + 1, 6, 6);

                // Highlight (top-left)
                ctx.fillStyle = LIGHT;
                ctx.fillRect(x + 1, y + 1, 5, 1);
                ctx.fillRect(x + 1, y + 1, 1, 5);

                // Shadow (bottom-right)
                ctx.fillStyle = DARK;
                ctx.fillRect(x + 2, y + 6, 5, 1);
                ctx.fillRect(x + 6, y + 2, 1, 5);
            }
        }

        return cvs;
    }

    // =========================================================
    // TIBIA-QUALITY COBBLESTONE (Restored & Polished)
    // =========================================================
    private createCobble(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        const BASE = '#757575'; // Grey base
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);

        // Noise
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const shade = Math.random();
            if (shade < 0.33) ctx.fillStyle = '#616161';      // Darker
            else if (shade < 0.66) ctx.fillStyle = '#9e9e9e'; // Lighter
            else ctx.fillStyle = '#424242';                   // Darkest
            ctx.fillRect(x, y, 1, 1);
        }

        // Stones (light outlines)
        ctx.strokeStyle = '#505050';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 24;
            const y = Math.random() * 24;
            ctx.strokeRect(x, y, 6, 6);
        }

        return cvs;
    }
    // TIBIA-QUALITY WALL (2.5D with detailed bricks)
    // =========================================================
    private createWall(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 64);
        const ctx = cvs.getContext('2d')!;

        // Colors
        const LID_LIGHT = '#aaaaaa';
        const LID_MID = '#888899';
        const LID_DARK = '#666677';
        const FACE_BASE = '#555566';
        const BRICK_LIGHT = '#666677';
        const BRICK_DARK = '#444455';
        const MORTAR = '#333344';

        // ===== LID (Top surface, y=0 to 20) =====
        ctx.fillStyle = LID_MID;
        ctx.fillRect(0, 0, 32, 20);

        // Lid highlight gradient (top edge)
        ctx.fillStyle = LID_LIGHT;
        ctx.fillRect(0, 0, 32, 3);

        // Lid shadow gradient (bottom of lid)
        ctx.fillStyle = LID_DARK;
        ctx.fillRect(0, 17, 32, 3);

        // Dithered lid texture
        for (let y = 3; y < 17; y++) {
            for (let x = 0; x < 32; x++) {
                if (this.shouldDither(x, y, 4)) {
                    ctx.fillStyle = LID_LIGHT;
                    ctx.fillRect(x, y, 1, 1);
                } else if (this.shouldDither(x, y, 12)) {
                    ctx.fillStyle = LID_DARK;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // ===== FACE (Front surface, y=20 to 64) =====
        ctx.fillStyle = FACE_BASE;
        ctx.fillRect(0, 20, 32, 44);

        // Draw brick pattern
        for (let row = 0; row < 5; row++) {
            const y = 22 + row * 8;
            const offset = (row % 2) * 8;

            for (let col = 0; col < 3; col++) {
                const x = offset + col * 16 - 8;
                if (x < 0 || x >= 32) continue;

                const brickW = Math.min(14, 32 - x);

                // Brick base
                ctx.fillStyle = FACE_BASE;
                ctx.fillRect(x, y, brickW, 6);

                // Brick highlight (top & left)
                ctx.fillStyle = BRICK_LIGHT;
                ctx.fillRect(x, y, brickW, 1);
                ctx.fillRect(x, y, 1, 6);

                // Brick shadow (bottom & right)
                ctx.fillStyle = BRICK_DARK;
                ctx.fillRect(x, y + 5, brickW, 1);
                if (x + brickW < 32) {
                    ctx.fillRect(x + brickW - 1, y, 1, 6);
                }
            }

            // Mortar line
            ctx.fillStyle = MORTAR;
            ctx.fillRect(0, y + 6, 32, 2);
        }

        // ===== OUTLINE (Seamless - no left/right edges) =====
        ctx.fillStyle = '#111122';
        ctx.fillRect(0, 0, 32, 1);   // Top
        ctx.fillRect(0, 63, 32, 1);  // Bottom shadow

        return cvs;
    }

    // =========================================================
    // TIBIA-QUALITY PLAYER (Red Knight with outline)
    // =========================================================
    private createPlayer(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 64);
        const ctx = cvs.getContext('2d')!;

        // Colors
        const OUTLINE = '#000000';
        const HELMET = '#707080';
        const HELMET_LIGHT = '#909090';
        const HELMET_DARK = '#505060';
        const TUNIC = '#aa2020';
        const TUNIC_DARK = '#801010';
        const CROSS = '#e0e0e0';
        const LEGS = '#404040';
        const LEGS_LIGHT = '#606060';
        const SKIN = '#d0a080';
        const SWORD = '#a0a0b0';
        const HILT = '#c0a020';

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(16, 60, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // === LEGS (Greaves) ===
        ctx.fillStyle = LEGS;
        ctx.fillRect(9, 48, 6, 14);
        ctx.fillRect(17, 48, 6, 14);
        // Leg highlight
        ctx.fillStyle = LEGS_LIGHT;
        ctx.fillRect(9, 48, 2, 14);
        ctx.fillRect(17, 48, 2, 14);

        // === BODY (Tunic) ===
        ctx.fillStyle = TUNIC;
        ctx.fillRect(7, 26, 18, 22);
        // Tunic shading
        ctx.fillStyle = TUNIC_DARK;
        ctx.fillRect(7, 40, 18, 8);
        // White cross
        ctx.fillStyle = CROSS;
        ctx.fillRect(14, 28, 4, 18);
        ctx.fillRect(9, 34, 14, 4);

        // === HEAD (Helmet) ===
        ctx.fillStyle = HELMET;
        ctx.fillRect(9, 12, 14, 14);
        // Helmet highlight
        ctx.fillStyle = HELMET_LIGHT;
        ctx.fillRect(9, 12, 14, 3);
        ctx.fillRect(9, 12, 3, 14);
        // Helmet shadow
        ctx.fillStyle = HELMET_DARK;
        ctx.fillRect(20, 12, 3, 14);
        ctx.fillRect(9, 23, 14, 3);
        // Visor slit
        ctx.fillStyle = '#000000';
        ctx.fillRect(11, 18, 10, 2);
        // Face behind visor
        ctx.fillStyle = SKIN;
        ctx.fillRect(12, 20, 8, 3);

        // === SWORD ===
        ctx.save();
        ctx.translate(26, 35);
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = SWORD;
        ctx.fillRect(-2, -18, 4, 22);
        // Sword highlight
        ctx.fillStyle = '#c0c0d0';
        ctx.fillRect(-2, -18, 1, 22);
        // Hilt
        ctx.fillStyle = HILT;
        ctx.fillRect(-4, 2, 8, 4);
        // Grip
        ctx.fillStyle = '#603000';
        ctx.fillRect(-1, 4, 2, 6);
        ctx.restore();

        // === BLACK OUTLINE (1px around everything) ===
        this.addOutline(ctx, cvs);

        return cvs;
    }

    // Helper: Add 1px black outline around non-transparent pixels
    private addOutline(ctx: CanvasRenderingContext2D, cvs: HTMLCanvasElement): void {
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const data = imgData.data;
        const w = cvs.width;
        const h = cvs.height;

        const isOpaque = (x: number, y: number): boolean => {
            if (x < 0 || x >= w || y < 0 || y >= h) return false;
            return data[(y * w + x) * 4 + 3] > 128;
        };

        const outline: Array<[number, number]> = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (!isOpaque(x, y)) {
                    // Check if adjacent to opaque pixel
                    if (isOpaque(x - 1, y) || isOpaque(x + 1, y) ||
                        isOpaque(x, y - 1) || isOpaque(x, y + 1)) {
                        outline.push([x, y]);
                    }
                }
            }
        }

        ctx.fillStyle = '#000000';
        outline.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
    }

    // =========================================================
    // TIBIA-QUALITY TREE (64x64 with layered canopy)
    // =========================================================
    private createTree(): HTMLCanvasElement {
        const cvs = this.createCanvas(64, 64);
        const ctx = cvs.getContext('2d')!;

        const TRUNK_DARK = '#2a1a10';
        const TRUNK_MID = '#4a3020';
        const TRUNK_LIGHT = '#5a4030';
        const LEAF_DARK = '#1a3a15';
        const LEAF_MID = '#2a5a25';
        const LEAF_LIGHT = '#4a8a45';

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(32, 60, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // === TRUNK ===
        const trunkX = 27;
        const trunkW = 10;
        ctx.fillStyle = TRUNK_MID;
        ctx.fillRect(trunkX, 38, trunkW, 24);

        // Trunk highlight
        ctx.fillStyle = TRUNK_LIGHT;
        ctx.fillRect(trunkX, 38, 3, 24);

        // Trunk shadow
        ctx.fillStyle = TRUNK_DARK;
        ctx.fillRect(trunkX + trunkW - 3, 38, 3, 24);

        // Bark lines
        ctx.strokeStyle = TRUNK_DARK;
        ctx.lineWidth = 1;
        for (let y = 42; y < 60; y += 5) {
            ctx.beginPath();
            ctx.moveTo(trunkX, y + 0.5);
            ctx.lineTo(trunkX + trunkW, y + 0.5);
            ctx.stroke();
        }

        // === CANOPY (Layered ellipses) ===
        const cx = 32, cy = 24;

        // Base layer (dark)
        ctx.fillStyle = LEAF_DARK;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 26, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mid layer with dithering
        for (let y = cy - 18; y < cy + 16; y++) {
            for (let x = cx - 24; x < cx + 24; x++) {
                const dx = (x - cx) / 26;
                const dy = (y - cy) / 20;
                if (dx * dx + dy * dy > 0.9) continue;

                if (this.shouldDither(x, y, 8)) {
                    ctx.fillStyle = LEAF_MID;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Light layer (top-left highlight)
        for (let y = cy - 18; y < cy + 5; y++) {
            for (let x = cx - 24; x < cx + 5; x++) {
                const dx = (x - cx) / 26;
                const dy = (y - cy) / 20;
                if (dx * dx + dy * dy > 0.8) continue;

                if (this.shouldDither(x, y, 6)) {
                    ctx.fillStyle = LEAF_LIGHT;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Shadow layer (bottom-right)
        for (let y = cy; y < cy + 16; y++) {
            for (let x = cx; x < cx + 24; x++) {
                const dx = (x - cx) / 26;
                const dy = (y - cy) / 20;
                if (dx * dx + dy * dy > 0.85) continue;

                if (this.shouldDither(x, y, 5)) {
                    ctx.fillStyle = '#0a2a0a';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Canopy outline
        ctx.strokeStyle = '#0a200a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 26, 20, 0, 0, Math.PI * 2);
        ctx.stroke();

        return cvs;
    }

    // =========================================================
    // TIBIA-QUALITY ROCK (Faceted with chamfer)
    // =========================================================
    private createRock(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        const BASE = '#707070';
        const LIGHT = '#a0a0a0';
        const DARK = '#404040';
        const SHADOW = '#202020';

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(16, 27, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rock shape (irregular polygon)
        const pts = [
            { x: 7, y: 14 }, { x: 10, y: 7 }, { x: 18, y: 5 }, { x: 25, y: 9 },
            { x: 27, y: 17 }, { x: 24, y: 24 }, { x: 14, y: 26 }, { x: 6, y: 20 }
        ];

        ctx.fillStyle = BASE;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();

        // Chamfer highlight (top-left edge)
        ctx.strokeStyle = LIGHT;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, 20);
        ctx.lineTo(7, 14);
        ctx.lineTo(10, 7);
        ctx.lineTo(18, 5);
        ctx.stroke();

        // Chamfer shadow (bottom-right edge)
        ctx.strokeStyle = SHADOW;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(18, 5);
        ctx.lineTo(25, 9);
        ctx.lineTo(27, 17);
        ctx.lineTo(24, 24);
        ctx.lineTo(14, 26);
        ctx.lineTo(6, 20);
        ctx.stroke();

        // Outline
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();

        return cvs;
    }

    // =========================================================
    // WATER TILE (Animated look with dithering)
    // =========================================================
    private createWater(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        const DEEP = '#1a4a6a';
        const MID = '#2a6a8a';
        const LIGHT = '#4a9aba';

        ctx.fillStyle = MID;
        ctx.fillRect(0, 0, 32, 32);

        // Dithered waves
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const wave = Math.sin((x + y) * 0.3) * 0.5 + 0.5;
                if (this.shouldDither(x, y, wave * 12)) {
                    ctx.fillStyle = wave > 0.5 ? LIGHT : DEEP;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Wave highlights
        ctx.fillStyle = '#6abaDA';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(i * 7 + 2, (i * 5) % 28 + 2, 3, 1);
        }

        return cvs;
    }

    // =========================================================
    // WOOD FLOOR (Planks)
    // =========================================================
    private createWoodFloor(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Base Wood
        const BASE = '#8d6e63';
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);

        // Wood Grain (Horizontal stripes with noise)
        for (let row = 0; row < 4; row++) {
            const y = row * 8;

            // Plank Separator
            ctx.fillStyle = '#4e342e'; // Dark gap
            ctx.fillRect(0, y, 32, 1);

            // Grain Noise
            for (let i = 0; i < 64; i++) {
                const px = Math.random() * 32;
                const py = y + 1 + Math.random() * 6;
                ctx.fillStyle = Math.random() > 0.5 ? '#6d4c41' : '#a1887f';
                ctx.fillRect(px, py, 2 + Math.random() * 4, 1);
            }
        }

        return cvs;
    }

    // =========================================================
    // STONE FLOOR (Dungeon)
    // =========================================================
    private createStoneFloor(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Base Stone
        const BASE = '#9e9e9e';
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);

        // Stone Texture Noise
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const shade = Math.random();
            if (shade < 0.33) ctx.fillStyle = '#757575';
            else if (shade < 0.66) ctx.fillStyle = '#bdbdbd';
            else ctx.fillStyle = '#616161';
            ctx.fillRect(x, y, 1, 1);
        }

        // Tile Borders (2x2 Grid)
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Cross
        ctx.moveTo(16, 0); ctx.lineTo(16, 32);
        ctx.moveTo(0, 16); ctx.lineTo(32, 16);
        ctx.stroke();

        // Outer Border
        ctx.strokeRect(0, 0, 32, 32);

        return cvs;
    }

    // =========================================================
    // BARREL (Decoration)
    // =========================================================
    private createBarrel(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Barrel body
        ctx.fillStyle = '#6a4a30';
        ctx.fillRect(8, 8, 16, 18);
        ctx.fillStyle = '#8a6a50';
        ctx.fillRect(8, 8, 4, 18);
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(20, 8, 4, 18);

        // Metal bands
        ctx.fillStyle = '#505050';
        ctx.fillRect(7, 10, 18, 2);
        ctx.fillRect(7, 22, 18, 2);

        // Outline
        ctx.strokeStyle = '#2a1a10';
        ctx.lineWidth = 1;
        ctx.strokeRect(7.5, 7.5, 17, 19);

        return cvs;
    }

    // =========================================================
    // CRATE (Decoration)
    // =========================================================
    private createCrate(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(7, 25, 20, 4);

        // Crate body
        ctx.fillStyle = '#7a5a40';
        ctx.fillRect(6, 6, 20, 20);

        // Highlights
        ctx.fillStyle = '#9a7a60';
        ctx.fillRect(6, 6, 20, 2);
        ctx.fillRect(6, 6, 2, 20);

        // Shadows
        ctx.fillStyle = '#5a3a20';
        ctx.fillRect(6, 24, 20, 2);
        ctx.fillRect(24, 6, 2, 20);

        // Cross planks
        ctx.strokeStyle = '#4a3020';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, 6);
        ctx.lineTo(26, 26);
        ctx.moveTo(26, 6);
        ctx.lineTo(6, 26);
        ctx.stroke();

        return cvs;
    }

    // =========================================================
    // TORCH (Decoration with flame)
    // =========================================================
    private createTorch(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Handle
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(14, 16, 4, 14);

        // Flame (yellow-orange gradient)
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.ellipse(16, 12, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.ellipse(16, 10, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.ellipse(16, 9, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        return cvs;
    }

    // =========================================================
    // GOLD COINS (Loot)
    // =========================================================
    private createGold(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Stack of coins
        for (let i = 0; i < 5; i++) {
            const x = 10 + (i % 3) * 5;
            const y = 16 + Math.floor(i / 3) * 4;

            ctx.fillStyle = '#c0a020';
            ctx.beginPath();
            ctx.ellipse(x, y, 5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e0c040';
            ctx.beginPath();
            ctx.ellipse(x, y - 1, 4, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        return cvs;
    }

    // =========================================================
    // HEALTH POTION (Loot)
    // =========================================================
    private createPotion(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Bottle body
        ctx.fillStyle = '#cc2020';
        ctx.fillRect(12, 14, 8, 12);
        ctx.fillStyle = '#ff4040';
        ctx.fillRect(12, 14, 3, 12);

        // Bottle neck
        ctx.fillStyle = '#aa8060';
        ctx.fillRect(14, 10, 4, 4);

        // Cork
        ctx.fillStyle = '#6a5040';
        ctx.fillRect(14, 8, 4, 3);

        // Liquid highlight
        ctx.fillStyle = '#ff6060';
        ctx.fillRect(13, 16, 2, 4);

        return cvs;
    }

    // =========================================================
    // SWORD (Loot)
    // =========================================================
    private createSword(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);

        // Blade
        ctx.fillStyle = '#a0a0b0';
        ctx.fillRect(-2, -14, 4, 20);
        ctx.fillStyle = '#c0c0d0';
        ctx.fillRect(-2, -14, 1, 20);

        // Guard
        ctx.fillStyle = '#c0a020';
        ctx.fillRect(-6, 4, 12, 3);

        // Handle
        ctx.fillStyle = '#5a3020';
        ctx.fillRect(-1, 6, 2, 8);

        // Pommel
        ctx.fillStyle = '#c0a020';
        ctx.beginPath();
        ctx.arc(0, 15, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        return cvs;
    }

    // =========================================================
    // AXE (Loot) - Hand Axe / Battle Axe
    // =========================================================
    private createAxe(variant: 'hand' | 'battle' = 'hand'): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);

        // Handle (wood)
        ctx.fillStyle = '#5a3020';
        const handleLen = variant === 'battle' ? 20 : 14;
        ctx.fillRect(-1, -2, 2, handleLen);
        ctx.fillStyle = '#704030';
        ctx.fillRect(-1, -2, 1, handleLen);

        // Axe head (metal)
        ctx.fillStyle = '#7a7a8a';
        if (variant === 'battle') {
            // Double-headed battle axe
            ctx.beginPath();
            ctx.moveTo(-8, -6);
            ctx.lineTo(-2, -2);
            ctx.lineTo(-2, 4);
            ctx.lineTo(-8, 8);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(8, -6);
            ctx.lineTo(2, -2);
            ctx.lineTo(2, 4);
            ctx.lineTo(8, 8);
            ctx.closePath();
            ctx.fill();
        } else {
            // Single-headed hand axe
            ctx.beginPath();
            ctx.moveTo(-8, -4);
            ctx.lineTo(-2, -1);
            ctx.lineTo(-2, 5);
            ctx.lineTo(-8, 8);
            ctx.closePath();
            ctx.fill();
        }

        // Axe head highlight
        ctx.fillStyle = '#a0a0b0';
        ctx.fillRect(-7, -3, 2, 2);

        ctx.restore();
        return cvs;
    }

    // =========================================================
    // HELMET (Armor) - Dwarven Helmet
    // =========================================================
    private createHelmet(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Base helmet (metal)
        ctx.fillStyle = '#6a5a4a';
        ctx.beginPath();
        ctx.arc(16, 18, 10, 0, Math.PI * 2);
        ctx.fill();

        // Helmet top
        ctx.fillStyle = '#7a6a5a';
        ctx.fillRect(8, 10, 16, 8);

        // Highlight
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(8, 10, 16, 3);
        ctx.fillRect(8, 10, 3, 8);

        // Visor
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(10, 16, 12, 4);

        // Nose guard
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(14, 14, 4, 10);

        // Horns (dwarven style)
        ctx.fillStyle = '#4a3a2a';
        ctx.beginPath();
        ctx.moveTo(6, 12);
        ctx.lineTo(2, 4);
        ctx.lineTo(8, 10);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(26, 12);
        ctx.lineTo(30, 4);
        ctx.lineTo(24, 10);
        ctx.closePath();
        ctx.fill();

        return cvs;
    }

    // =========================================================
    // LEGS (Armor) - Dwarven Legs
    // =========================================================
    private createLegs(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Left leg
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(6, 4, 8, 24);
        // Left leg highlight
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(6, 4, 2, 24);

        // Right leg
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(18, 4, 8, 24);
        // Right leg highlight
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(18, 4, 2, 24);

        // Belt
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(4, 2, 24, 4);
        // Belt buckle
        ctx.fillStyle = '#c0a020';
        ctx.fillRect(14, 2, 4, 4);

        // Knee guards
        ctx.fillStyle = '#7a6a5a';
        ctx.fillRect(7, 14, 6, 4);
        ctx.fillRect(19, 14, 6, 4);

        return cvs;
    }

    // =========================================================
    // RAT (Monster 32x32)
    // =========================================================
    private createRat(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#6a5040';
        ctx.beginPath();
        ctx.ellipse(16, 18, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#7a6050';
        ctx.beginPath();
        ctx.ellipse(22, 16, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#8a7060';
        ctx.beginPath();
        ctx.arc(20, 12, 2, 0, Math.PI * 2);
        ctx.arc(24, 12, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(23, 15, 2, 2);

        // Tail
        ctx.strokeStyle = '#8a7060';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 18);
        ctx.quadraticCurveTo(4, 14, 4, 20);
        ctx.stroke();

        this.addOutline(ctx, cvs);
        return cvs;
    }

    // =========================================================
    // WOLF (Monster 32x48) - Timber Wolf (Feral)
    // =========================================================
    private createWolf(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 44, 11, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fur Colors (Timber Wolf / Dark Grey)
        const FUR_DARK = '#212121'; // Almost Black
        const FUR_MID = '#424242';  // Dark Grey
        const FUR_LIGHT = '#616161'; // Steel Grey

        // Back Legs (Muscular)
        ctx.fillStyle = FUR_DARK;
        ctx.fillRect(7, 32, 6, 12);
        ctx.fillRect(19, 32, 6, 12);

        // Body (Chest/Torso) - Bulkier
        ctx.fillStyle = FUR_MID;
        ctx.beginPath();
        ctx.ellipse(16, 30, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Front Mane/Chest (Bushy)
        ctx.fillStyle = FUR_LIGHT;
        ctx.beginPath();
        ctx.ellipse(16, 26, 10, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head (Aggressive slant)
        ctx.fillStyle = FUR_MID;
        ctx.beginPath();
        ctx.ellipse(16, 18, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snout (Longer)
        ctx.fillStyle = FUR_DARK;
        ctx.beginPath();
        ctx.ellipse(16, 22, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Nose tip
        ctx.fillStyle = '#000000';
        ctx.fillRect(15, 24, 2, 2);

        // Ears (Pointy & Tall)
        ctx.fillStyle = FUR_DARK;
        ctx.beginPath();
        ctx.moveTo(9, 14);
        ctx.lineTo(7, 4); // Taller
        ctx.lineTo(13, 12);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(23, 14);
        ctx.lineTo(25, 4); // Taller
        ctx.lineTo(19, 12);
        ctx.fill();

        // Eyes (Glowing Red - Feral)
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(11, 16, 3, 2);
        ctx.fillRect(18, 16, 3, 2);
        // Pupils
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(12, 16, 1, 1);
        ctx.fillRect(19, 16, 1, 1);

        // Fangs (White pixels)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, 26, 1, 2);
        ctx.fillRect(17, 26, 1, 2);

        this.addOutline(ctx, cvs);
        return cvs;
    }

    // =========================================================
    // SKELETON (Monster 32x64)
    // =========================================================
    private createSkeleton(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 64);
        const ctx = cvs.getContext('2d')!;

        const BONE = '#e0d8c8';
        const BONE_DARK = '#a09888';

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 60, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = BONE;
        ctx.fillRect(10, 44, 3, 16);
        ctx.fillRect(19, 44, 3, 16);
        ctx.fillStyle = BONE_DARK;
        ctx.fillRect(12, 44, 1, 16);
        ctx.fillRect(21, 44, 1, 16);

        // Pelvis
        ctx.fillStyle = BONE;
        ctx.fillRect(9, 40, 14, 6);

        // Ribcage
        ctx.fillStyle = BONE;
        ctx.fillRect(10, 26, 12, 14);
        ctx.fillStyle = '#1a1a1a';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(12, 28 + i * 3, 8, 1);
        }

        // Skull
        ctx.fillStyle = BONE;
        ctx.beginPath();
        ctx.arc(16, 18, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eye sockets
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(12, 16, 3, 4);
        ctx.fillRect(17, 16, 3, 4);

        // Teeth
        ctx.fillStyle = BONE;
        ctx.fillRect(12, 22, 8, 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(14, 22, 1, 2);
        ctx.fillRect(17, 22, 1, 2);

        // Arms
        ctx.fillStyle = BONE;
        ctx.fillRect(6, 28, 3, 12);
        ctx.fillRect(23, 28, 3, 12);

        this.addOutline(ctx, cvs);
        return cvs;
    }

    // =========================================================
    // SLIME (Monster 32x32)
    // =========================================================
    private createSlime(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body (blob)
        ctx.fillStyle = '#40a040';
        ctx.beginPath();
        ctx.ellipse(16, 18, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#60c060';
        ctx.beginPath();
        ctx.ellipse(12, 14, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(12, 16, 3, 0, Math.PI * 2);
        ctx.arc(20, 16, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(13, 16, 1.5, 0, Math.PI * 2);
        ctx.arc(21, 16, 1.5, 0, Math.PI * 2);
        ctx.fill();

        this.addOutline(ctx, cvs);
        return cvs;
    }

    // =========================================================
    // SKELETON (Monster 32x48)
    // =========================================================
    private createSkeleton(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(16, 44, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(10, 36, 4, 10); ctx.fillRect(18, 36, 4, 10); // Legs
        ctx.fillRect(14, 24, 4, 12); // Spine
        ctx.fillRect(10, 26, 12, 6); // Ribs
        ctx.fillRect(8, 24, 4, 10); ctx.fillRect(20, 24, 4, 10); // Arms
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath(); ctx.arc(16, 18, 7, 0, Math.PI * 2); ctx.fill(); // Skull
        ctx.fillStyle = '#000000';
        ctx.fillRect(13, 16, 2, 2); ctx.fillRect(17, 16, 2, 2); // Eyes
        this.addOutline(ctx, cvs);
        return cvs;
    }

    // =========================================================
    // WATER (Animated Dithered)
    // =========================================================
    private createWater(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#0069c0';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#2196f3';
        for (let i = 0; i < 32; i += 2) {
            for (let j = 0; j < 32; j += 2) {
                if ((i + j) % 4 === 0) ctx.fillRect(i, j, 1, 1);
            }
        }
        return cvs;
    }

    // =========================================================
    // FLOORS (Wood / Stone)
    // =========================================================
    private createWoodFloor(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#3e2723';
        for (let i = 0; i < 32; i += 8) ctx.fillRect(0, i, 32, 1); // Planks
        ctx.fillRect(10, 0, 1, 8); ctx.fillRect(20, 8, 1, 8); ctx.fillRect(5, 16, 1, 8);
        return cvs;
    }
    private createStoneFloor(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#757575';
        for (let i = 0; i < 32; i += 16) {
            for (let j = 0; j < 32; j += 16) {
                ctx.strokeRect(i, j, 16, 16);
            }
        }
        return cvs;
    }

    // =========================================================
    // DECOR
    // =========================================================
    private createBarrel(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#795548';
        ctx.beginPath(); ctx.ellipse(16, 24, 10, 8, 0, 0, Math.PI * 2); ctx.fill(); // Bottom
        ctx.restore();
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(8, 12, 16, 14);
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(8, 14, 16, 2); ctx.fillRect(8, 22, 16, 2); // Bands
        this.addOutline(ctx, cvs);
        return cvs;
    }
    private createCrate(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(6, 12, 20, 18);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.strokeRect(7, 13, 18, 16);
        ctx.beginPath(); ctx.moveTo(7, 13); ctx.lineTo(25, 29); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(25, 13); ctx.lineTo(7, 29); ctx.stroke();
        this.addOutline(ctx, cvs);
        return cvs;
    }
    private createTorch(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(14, 18, 4, 10); // Handle
        ctx.fillStyle = '#ff5722';
        ctx.beginPath(); ctx.arc(16, 16, 4, 0, Math.PI * 2); ctx.fill(); // Fire
        this.addOutline(ctx, cvs);
        return cvs;
    }

    // =========================================================
    // LOOT
    // =========================================================
    private createGold(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#ffc107';
        ctx.beginPath(); ctx.arc(16, 24, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffecb3';
        ctx.beginPath(); ctx.arc(15, 23, 1, 0, Math.PI * 2); ctx.fill();
        this.addOutline(ctx, cvs);
        return cvs;
    }
    private createPotion(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#f44336';
        ctx.beginPath(); ctx.arc(16, 22, 6, 0, Math.PI * 2); ctx.fill(); // Flask
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(14, 14, 4, 4); // Neck
        this.addOutline(ctx, cvs);
        return cvs;
    }
    private createSword(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.save();
        ctx.translate(16, 16); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#b0bec5'; ctx.fillRect(-2, -10, 4, 20); // Blade
        ctx.fillStyle = '#8d6e63'; ctx.fillRect(-3, 10, 6, 2); // Guard
        ctx.fillStyle = '#5d4037'; ctx.fillRect(-1, 12, 2, 4); // Hilt
        ctx.restore();
        this.addOutline(ctx, cvs);
        return cvs;
    }
    private createCanvas(w: number, h: number): HTMLCanvasElement {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    }

    // =========================================================
    // TIBIA-QUALITY BACKPACK (Volumetric)
    // =========================================================
    private createBackpack(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        const DARK = '#3e2723';
        const BASE = '#5d4037';
        const LIGHT = '#795548';
        const STRAP = '#ffb300';
        const BUCKLE = '#ffd54f';

        // Main Body (Rounded Rect)
        ctx.fillStyle = BASE;
        ctx.fillRect(4, 4, 24, 24);

        // Shading (Roundness)
        ctx.fillStyle = DARK;
        ctx.fillRect(4, 24, 24, 4); // Bottom shadow
        ctx.fillRect(24, 4, 4, 24); // Right shadow

        // Highlight (Top Left)
        ctx.fillStyle = LIGHT;
        ctx.fillRect(4, 4, 20, 2);
        ctx.fillRect(4, 4, 2, 20);

        // Flap
        ctx.fillStyle = LIGHT;
        ctx.fillRect(4, 4, 24, 12);
        ctx.fillStyle = DARK; // Shadow under flap
        ctx.fillRect(4, 16, 24, 1);

        // Pockets (Side)
        ctx.fillStyle = BASE;
        ctx.fillRect(2, 10, 2, 12);
        ctx.fillRect(28, 10, 2, 12);

        // Straps/Buckles
        ctx.fillStyle = STRAP;
        ctx.fillRect(10, 10, 2, 8);
        ctx.fillRect(20, 10, 2, 8);

        ctx.fillStyle = BUCKLE;
        ctx.fillRect(9, 16, 4, 3);
        ctx.fillRect(19, 16, 4, 3);

        return cvs;
    }

    // =========================================================
    // TIBIA-QUALITY SHIELD (Wooden)
    // =========================================================
    private createShield(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        const WOOD_DARK = '#3e2723';
        const WOOD_MID = '#5d4037';
        const WOOD_LIGHT = '#795548';
        const IRON = '#9e9e9e';

        // Shield Shape (Round)
        ctx.fillStyle = WOOD_MID;
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fill();

        // Rim
        ctx.strokeStyle = IRON;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Planks
        ctx.fillStyle = WOOD_DARK;
        ctx.fillRect(10, 6, 1, 20);
        ctx.fillRect(21, 6, 1, 20);

        // Center Boss
        ctx.fillStyle = IRON;
        ctx.beginPath();
        ctx.arc(16, 16, 4, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#fff';
        ctx.fillRect(14, 14, 2, 2);

        return cvs;
    }

    // =========================================================
    // TIBIA-QUALITY NPC (Detailed Robed Figure with Accessories)
    // =========================================================
    private createNPC(robeColor: string, highlightColor: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 64);
        const ctx = cvs.getContext('2d')!;

        // Parse colors for shading
        const darken = (hex: string, amt: number) => {
            const num = parseInt(hex.replace('#', ''), 16);
            const r = Math.max(0, (num >> 16) - amt);
            const g = Math.max(0, ((num >> 8) & 0xFF) - amt);
            const b = Math.max(0, (num & 0xFF) - amt);
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        };

        const ROBE_DARK = darken(robeColor, 40);
        const ROBE_SHADOW = darken(robeColor, 70);
        const SKIN = '#d0a080';
        const SKIN_SHADOW = '#a07050';
        const HAIR = '#4a3020';
        const BELT = '#8b7355';
        const BELT_BUCKLE = '#c0a020';

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(16, 60, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // === ROBE (Base Layer) ===
        // Main robe body
        ctx.fillStyle = robeColor;
        ctx.fillRect(8, 28, 16, 30); // Main body

        // Robe bottom (wider)
        ctx.fillRect(6, 50, 20, 8);

        // Robe shading (right side darker)
        ctx.fillStyle = ROBE_DARK;
        ctx.fillRect(18, 28, 6, 30);
        ctx.fillRect(20, 50, 6, 8);

        // Robe highlight (left side lighter)
        ctx.fillStyle = highlightColor;
        ctx.fillRect(8, 28, 4, 28);

        // Robe shadow (bottom folds)
        ctx.fillStyle = ROBE_SHADOW;
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(8 + i * 6, 52, 4, 1);
            ctx.fillRect(9 + i * 6, 55, 3, 1);
        }

        // === BELT ===
        ctx.fillStyle = BELT;
        ctx.fillRect(8, 40, 16, 3);
        // Belt buckle
        ctx.fillStyle = BELT_BUCKLE;
        ctx.fillRect(14, 40, 4, 3);
        ctx.fillStyle = '#fff';
        ctx.fillRect(15, 41, 2, 1);

        // === ARMS (Sleeves) ===
        ctx.fillStyle = robeColor;
        ctx.fillRect(4, 30, 4, 14); // Left arm
        ctx.fillRect(24, 30, 4, 14); // Right arm

        // Arm shading
        ctx.fillStyle = ROBE_DARK;
        ctx.fillRect(26, 30, 2, 14);
        ctx.fillStyle = highlightColor;
        ctx.fillRect(4, 30, 2, 12);

        // === HANDS ===
        ctx.fillStyle = SKIN;
        ctx.fillRect(4, 42, 4, 4); // Left hand
        ctx.fillRect(24, 42, 4, 4); // Right hand
        ctx.fillStyle = SKIN_SHADOW;
        ctx.fillRect(6, 44, 2, 2);
        ctx.fillRect(26, 44, 2, 2);

        // === HEAD ===
        ctx.fillStyle = SKIN;
        ctx.fillRect(11, 14, 10, 12);

        // Face shading
        ctx.fillStyle = SKIN_SHADOW;
        ctx.fillRect(18, 16, 3, 8);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(13, 18, 2, 2);
        ctx.fillRect(17, 18, 2, 2);
        // Eye highlights
        ctx.fillStyle = '#fff';
        ctx.fillRect(13, 18, 1, 1);
        ctx.fillRect(17, 18, 1, 1);

        // Mouth
        ctx.fillStyle = '#804040';
        ctx.fillRect(14, 22, 4, 1);

        // === HOOD ===
        ctx.fillStyle = robeColor;
        // Hood shape
        ctx.beginPath();
        ctx.arc(16, 14, 9, Math.PI, 0, false);
        ctx.fill();
        ctx.fillRect(7, 14, 18, 6);

        // Hood shading
        ctx.fillStyle = ROBE_DARK;
        ctx.fillRect(20, 10, 5, 10);
        ctx.fillStyle = highlightColor;
        ctx.fillRect(7, 10, 4, 8);

        // Hood inner shadow
        ctx.fillStyle = ROBE_SHADOW;
        ctx.fillRect(10, 12, 12, 2);

        // === HAIR (visible under hood) ===
        ctx.fillStyle = HAIR;
        ctx.fillRect(11, 12, 10, 3);

        // === STAFF (for Healer/Guide) ===
        if (highlightColor === '#a0d0f0' || highlightColor === '#60a060') {
            ctx.fillStyle = '#5a4030';
            ctx.fillRect(2, 20, 2, 38);
            // Staff highlight
            ctx.fillStyle = '#7a6050';
            ctx.fillRect(2, 20, 1, 36);
            // Staff orb (for healer)
            if (highlightColor === '#a0d0f0') {
                ctx.fillStyle = '#60c0ff';
                ctx.beginPath();
                ctx.arc(3, 18, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#a0e0ff';
                ctx.fillRect(2, 15, 2, 2);
            }
            // Staff top (for guide)
            if (highlightColor === '#60a060') {
                ctx.fillStyle = '#c0a020';
                ctx.fillRect(0, 18, 6, 3);
            }
        }

        // === POUCH (for Merchant) ===
        if (highlightColor === '#8a60a0') {
            ctx.fillStyle = '#604020';
            ctx.fillRect(22, 44, 5, 6);
            ctx.fillStyle = '#806040';
            ctx.fillRect(22, 44, 2, 4);
            // Gold coins peeking out
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(23, 44, 2, 2);
        }

        // === BLACK OUTLINE (1px around everything) ===
        this.addOutline(ctx, cvs);

        return cvs;
    }

    private createCorpse(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Bones / Skull pile
        ctx.fillStyle = '#aaaaaa';
        // Skull
        ctx.fillRect(12, 10, 8, 8);
        // Ribs/Bones
        ctx.fillRect(8, 20, 16, 4);
        ctx.fillRect(14, 18, 4, 8);

        ctx.fillStyle = '#555555';
        ctx.fillRect(14, 12, 2, 2); // Eye L
        ctx.fillRect(18, 12, 2, 2); // Eye R

        // Black Outline
        this.addOutline(ctx, cvs);

        return cvs;
    }
    // =========================================================
    // GENERIC ARMOR GENERATOR
    // =========================================================
    private createArmorPlate(color: string, trim: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Chest
        ctx.fillStyle = color;
        ctx.fillRect(8, 6, 16, 20);

        // Shoulders
        ctx.fillStyle = trim;
        ctx.fillRect(6, 6, 4, 6);
        ctx.fillRect(22, 6, 4, 6);

        // Detail
        ctx.fillStyle = trim;
        ctx.fillRect(14, 8, 4, 18); // Center stripe

        return cvs;
    }

    private createLegsPlate(color: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = color;
        // Left Leg
        ctx.fillRect(10, 4, 5, 24);
        // Right Leg
        ctx.fillRect(17, 4, 5, 24);
        // Waist
        ctx.fillRect(10, 4, 12, 4);

        return cvs;
    }

    private createBoots(color: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = color;
        // Left Boot
        ctx.fillRect(8, 20, 6, 8);
        ctx.fillRect(8, 24, 8, 4);
        // Right Boot
        ctx.fillRect(18, 20, 6, 8);
        ctx.fillRect(18, 24, 8, 4);

        return cvs;
    }

    // =========================================================
    // GENERIC HELMET & SHIELD
    // =========================================================
    private createHelmetGen(color: string, trim: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = trim;
        ctx.fillRect(15, 6, 2, 20);
        ctx.fillRect(6, 15, 20, 2);

        return cvs;
    }

    private createShieldGen(color: string, trim: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(6, 6); ctx.lineTo(26, 6);
        ctx.lineTo(26, 20); ctx.lineTo(16, 28); ctx.lineTo(6, 20);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = trim;
        ctx.lineWidth = 3;
        ctx.stroke();

        return cvs;
    }

    // =========================================================
    // GENERIC WEAPON GENERATOR
    // =========================================================
    private createClub(headColor: string, spikes: boolean): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);

        // Handle
        ctx.fillStyle = '#5a3020';
        ctx.fillRect(-2, -4, 4, 16);

        // Head
        ctx.fillStyle = headColor;
        ctx.beginPath();
        ctx.arc(0, -10, 6, 0, Math.PI * 2);
        ctx.fill();

        if (spikes) {
            ctx.fillStyle = '#aaa';
            ctx.fillRect(-8, -10, 16, 2);
            ctx.fillRect(0, -18, 2, 16);
        }

        ctx.restore();
        return cvs;
    }

    private createSwordGen(bladeColor: string, hiltColor: string, complex: boolean): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);

        // Blade
        ctx.fillStyle = bladeColor;
        const width = complex ? 4 : 3;
        const len = complex ? 24 : 20;
        ctx.fillRect(-width / 2, -len + 6, width, len);

        // Guard
        ctx.fillStyle = hiltColor;
        ctx.fillRect(-6, 4, 12, 3);

        // Handle
        ctx.fillStyle = '#4a2010';
        ctx.fillRect(-1, 6, 2, 6);

        ctx.restore();
        return cvs;
    }

    private createBow(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);

        ctx.strokeStyle = '#8a6a4a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 12, Math.PI, 0);
        ctx.stroke();

        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(12, 0);
        ctx.stroke();

        ctx.restore();
        return cvs;
    }

    // =========================================================
    // TOOLS & MISC
    // =========================================================
    private createTool(type: 'shovel' | 'pickaxe' | 'rope' | 'machete'): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.save();
        ctx.translate(16, 16);

        if (type === 'rope') {
            ctx.strokeStyle = '#d2b48c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();
            return cvs;
        }

        ctx.rotate(-Math.PI / 4);

        // Handle
        ctx.fillStyle = '#6a4a3a';
        ctx.fillRect(-1, -4, 2, 20);

        // Head
        ctx.fillStyle = '#889';
        if (type === 'shovel') {
            ctx.fillRect(-4, -10, 8, 8);
        } else if (type === 'pickaxe') {
            ctx.beginPath();
            ctx.moveTo(-10, -6);
            ctx.quadraticCurveTo(0, -12, 10, -6);
            ctx.lineTo(8, -4);
            ctx.quadraticCurveTo(0, -10, -8, -4);
            ctx.fill();
        } else if (type === 'machete') {
            ctx.fillStyle = '#ccc';
            ctx.fillRect(-2, -14, 4, 14);
        }

        ctx.restore();
        return cvs;
    }

    private createGem(color: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(16, 8);
        ctx.lineTo(24, 16);
        ctx.lineTo(16, 24);
        ctx.lineTo(8, 16);
        ctx.closePath();
        ctx.fill();

        // Shine
        ctx.fillStyle = '#fff';
        ctx.fillRect(14, 12, 4, 4);

        return cvs;
    }
    // ===================================
    // NEW GENERATORS
    // ===================================
    private createParcel(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(4, 8, 24, 20); // Box
        ctx.fillStyle = '#fff'; // String
        ctx.fillRect(15, 8, 2, 20);
        ctx.fillRect(4, 18, 24, 2);
        this.addOutline(ctx, cvs);
        return cvs;
    }

    private createFood(type: 'meat' | 'rotten'): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = type === 'meat' ? '#ef5350' : '#7cb342';
        ctx.beginPath();
        ctx.ellipse(16, 20, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = type === 'meat' ? '#b71c1c' : '#33691e';
        ctx.beginPath();
        ctx.arc(14, 18, 2, 0, Math.PI * 2);
        ctx.fill(); // Bone/Spot
        this.addOutline(ctx, cvs);
        return cvs;
    }

    private createGeneric(color: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 32, 32);
        // Noise
        for (let i = 0; i < 32; i++) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(Math.random() * 32, Math.random() * 32, 1, 1);
        }
        return cvs;
    }

    private createFence(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#795548';
        ctx.fillRect(4, 0, 4, 32); // Post L
        ctx.fillRect(24, 0, 4, 32); // Post R
        ctx.fillRect(0, 8, 32, 4); // Rail Top
        ctx.fillRect(0, 20, 32, 4); // Rail Bot
        return cvs;
    }

    private createHole(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(16, 16, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        return cvs;
    }
    // =========================================================
    // DWARF (Procedural)
    // =========================================================
    public createDwarf(skin: string, clothes: string, beard: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 64);
        const ctx = cvs.getContext('2d')!;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 60, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Short Legs
        ctx.fillStyle = clothes;
        ctx.fillRect(10, 52, 5, 12);
        ctx.fillRect(17, 52, 5, 12);

        // Body (Stout)
        ctx.fillStyle = clothes;
        ctx.fillRect(8, 38, 16, 16);

        // Details (Belt)
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(8, 50, 16, 2);

        // Arms (Muscular/Wide)
        ctx.fillStyle = skin;
        ctx.fillRect(4, 40, 4, 12);
        ctx.fillRect(24, 40, 4, 12);

        // Head (Lower than human)
        const HEAD_Y = 28;
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.arc(16, HEAD_Y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Beard (Crucial)
        ctx.fillStyle = beard;
        ctx.beginPath();
        ctx.moveTo(9, HEAD_Y + 2);
        ctx.lineTo(23, HEAD_Y + 2);
        ctx.lineTo(20, HEAD_Y + 14); // Long beard
        ctx.lineTo(12, HEAD_Y + 14);
        ctx.closePath();
        ctx.fill();

        // Helmet/Hair?
        ctx.fillStyle = beard; // Hair matches beard
        ctx.fillRect(11, HEAD_Y - 7, 10, 4);

        this.addOutline(ctx, cvs);
        return cvs;
    }
}

// Export singleton
export const assetManager = new AssetManager();

// ================================================
// COMPATIBILITY EXPORTS
// ================================================
export const spriteSheet = document.createElement('canvas');
export const spriteCanvas = document.createElement('canvas');
export const SHEET_TILE_SIZE = 32;
export const SHEET_COLS = 16;

// Re-export constants
export { SPRITES } from './constants';


// Compatibility methods

AssetManager.prototype.getSpriteStyle = function (): string { return ''; };
AssetManager.prototype.getSheetConfig = function (): any { return { width: 512, height: 512, tileSize: 32 }; };
AssetManager.prototype.rebuildCache = function (): void { };
AssetManager.prototype.getSpriteImage = function (id: number): HTMLCanvasElement { return this.getSprite(id); };

