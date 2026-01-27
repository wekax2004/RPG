import { SPRITE_MAP } from './data/sprites_map';
import { SPRITES as IMG, EDRON_ASSETS } from './constants';

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
        console.log("[AssetManager] Loading All Assets (Synchronous Init + Async External)...");

        this.images[310] = this.createSandstone();   // ID 310: Town Ground
        this.images[311] = this.createTempleFloor(); // ID 311: Temple Floor
        this.images[IMG.MEAT] = this.createMeat();   // ID 148: Meat
        this.images[312] = this.createSewerGrate();  // ID 312: Rat Sewer
        this.images[1050] = this.createStonePillar(); // ID 1050: Wall Pillar

        // Edron Castle Assets
        this.images[IMG.COBBLE] = this.createCobble();
        this.images[IMG.PAVEMENT_LIGHT] = this.createPavementLight();
        this.images[IMG.WHITE_WALL_VERTICAL] = this.createWhiteWall('V');
        this.images[IMG.WHITE_WALL_HORIZONTAL] = this.createWhiteWall('H');
        this.images[IMG.WHITE_WALL_CORNER_TL] = this.createWhiteWall('TL');
        this.images[IMG.WHITE_WALL_CORNER_TR] = this.createWhiteWall('TR');
        this.images[IMG.WHITE_WALL_CORNER_BL] = this.createWhiteWall('BL');
        this.images[IMG.WHITE_WALL_CORNER_BR] = this.createWhiteWall('BR');
        this.images[IMG.FOUNTAIN] = this.createFountain();
        this.images[IMG.MAGIC_FIELD_BLUE] = this.createMagicFieldBlue();

        // Additional Edron Assets
        this.images[EDRON_ASSETS.FLOORS.CHECKERED] = this.createFloorCheckered();
        this.images[EDRON_ASSETS.FLOORS.STONE_FLOOR] = this.createFloorStone();
        this.images[EDRON_ASSETS.FLOORS.WOOD_FLOOR] = this.createFloorWood();
        this.images[EDRON_ASSETS.DECOR.STREET_LAMP] = this.createStreetLamp();
        this.images[EDRON_ASSETS.DECOR.KNIGHT_STATUE] = this.createKnightStatue();
        this.images[EDRON_ASSETS.DECOR.TRASH_CAN] = this.createTrashCan();
        this.images[EDRON_ASSETS.DECOR.POTTED_FLOWER] = this.createPottedFlower();
        this.images[EDRON_ASSETS.FURNITURE.LOCKER] = this.createLocker();
        this.images[EDRON_ASSETS.FURNITURE.BANK_SAFE] = this.createBankSafe();
        this.images[EDRON_ASSETS.FURNITURE.BOOKS] = this.createBooks();
        this.images[EDRON_ASSETS.FURNITURE.BLACKBOARD] = this.createBlackboard();
        this.images[EDRON_ASSETS.DOORS.ARCHWAY] = this.createArchway();
        // Updated to use renamed Edron door function
        this.images[EDRON_ASSETS.DOORS.LOCKED_H] = this.createDoorEdron(true, 'H');
        this.images[EDRON_ASSETS.DOORS.OPEN_H] = this.createDoorEdron(false, 'H');

        // 1. Initial procedural setup
        this.init();

        // 2. Load Sheets and Sheets-mapped sprites
        await this.loadExternalSprites();

        // 3. Load high-quality AI sprites (last, highest priority)
        await this.loadAISprites();

        console.log(`[AssetManager] All assets loaded. Procedural + AI + Sheet Mapped.`);
    }

    // Dither Matrix
    private shouldDither(x: number, y: number, threshold: number): boolean {
        return this.ditherMatrix[y % 4][x % 4] < threshold;
    }

    // Updated signature to accept isTile
    public async registerCustomSprite(id: number, url: string, postProcess?: string, isTile: boolean = false): Promise<boolean> {
        try {
            console.log(`[AssetManager] Loading custom sprite for ID ${id} from ${url}`);
            const rawCanvas = await this.loadExternalImage(url);

            const flags = (postProcess || '').split('|');
            console.error(`!!! DEBUG ASSET LOAD: ID=${id} Flags=${flags.join('|')} Raw=${rawCanvas.width}x${rawCanvas.height}`);

            // SPECIFIC DEBUG for Wolf (201) and Rat (200)
            if (id === 200 || id === 201) {
                console.error(`!!!!! WOLF/RAT SPRITE LOADED: ID=${id} URL=${url} Flags=${flags.join('|')} RawSize=${rawCanvas.width}x${rawCanvas.height}`);
            }

            // Determine Target Size and Region
            let targetW = 32;
            let targetH = 32;
            let srcX = 0;
            let srcY = 0;
            let srcW = rawCanvas.width;
            let srcH = rawCanvas.height;

            // Parse crop_center:W,H (optional X,Y offset)
            const centerFlag = flags.find(f => f.startsWith('crop_center:'));
            const rectFlag = flags.find(f => f.startsWith('crop_rect:'));

            if (rectFlag) {
                // crop_rect:X,Y,W,H
                const parts = rectFlag.split(':')[1].split(',').map(Number);
                if (parts.length === 4) {
                    srcX = parts[0];
                    srcY = parts[1];
                    srcW = parts[2];
                    srcH = parts[3];
                    targetW = srcW;
                    targetH = srcH;
                }
            } else if (centerFlag) {
                // crop_center:W,H
                const parts = centerFlag.split(':')[1].split(',').map(Number);
                if (parts.length >= 2) {
                    const w = parts[0];
                    const h = parts[1];
                    targetW = w;
                    targetH = h;

                    // Calculate center crop
                    srcX = Math.floor((rawCanvas.width - w) / 2);
                    srcY = Math.floor((rawCanvas.height - h) / 2);
                    srcW = w;
                    srcH = h;
                }
            } else if (flags.includes('crop_tall')) {
                // Legacy crop_tall (implies 32x64 centered, or strictly handled here?)
                // The previous code handled 'crop_tall' by targeting 32x64 and cropping from center.
                // Let's preserve that logic explicitly if no other specific crop is given.
                targetW = 32;
                targetH = 64;
                srcW = Math.min(32, rawCanvas.width);
                srcH = Math.min(64, rawCanvas.height);
                srcX = Math.floor((rawCanvas.width - srcW) / 2);
                srcY = Math.floor((rawCanvas.height - srcH) / 2);
            } else if (flags.includes('tile_center')) {
                // Special tile_center logic (existing) handled during draw below
                // We keep targetW/H as 32.
                targetW = 32;
                targetH = 32;
            } else {
                // Default Logic:
                // If the image is LARGE (e.g. 1024x1024 AI generation), we should SCALE it down.
                // If the image is SMALL (e.g. 32x32), we should Center it.
                if (rawCanvas.width > 64 || rawCanvas.height > 64) {
                    // Large Asset -> Scale to Fit
                    // Check aspect ratio for tall sprites
                    if (rawCanvas.height >= rawCanvas.width * 1.5) {
                        targetW = 32;
                        targetH = 64;
                    } else {
                        targetW = 32;
                        targetH = 32;
                    }

                    // Use Full Source
                    srcX = 0;
                    srcY = 0;
                    srcW = rawCanvas.width;
                    srcH = rawCanvas.height;
                } else {
                    // Small Asset -> Center Crop (Legacy/Safe)
                    targetW = 32;
                    targetH = 32;
                    srcW = Math.min(32, rawCanvas.width);
                    srcH = Math.min(32, rawCanvas.height);
                    srcX = Math.floor((rawCanvas.width - srcW) / 2);
                    srcY = Math.floor((rawCanvas.height - srcH) / 2);
                }
            }

            // Create final canvas
            const resized = document.createElement('canvas');
            resized.width = targetW;
            resized.height = targetH;
            const ctx = resized.getContext('2d')!;

            // CRITICAL: Clear canvas to ensure transparency (prevents black/gray boxes)
            ctx.clearRect(0, 0, targetW, targetH);

            if (flags.includes('tile_center')) {
                const cx = Math.floor(rawCanvas.width / 2) - 8;
                const cy = Math.floor(rawCanvas.height / 2) - 8;
                ctx.drawImage(rawCanvas, cx, cy, 16, 16, 0, 0, 16, 16);
                ctx.drawImage(rawCanvas, cx, cy, 16, 16, 16, 0, 16, 16);
                ctx.drawImage(rawCanvas, cx, cy, 16, 16, 0, 16, 16, 16);
                ctx.drawImage(rawCanvas, cx, cy, 16, 16, 16, 16, 16, 16);
            } else {
                // Heuristic: If downscaling significantly (e.g. 1024 -> 32), use smoothing
                if (srcW > targetW * 2) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                } else {
                    ctx.imageSmoothingEnabled = false;
                }
                ctx.drawImage(rawCanvas, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
            }

            // [NEW] Aggressive Black Removal (for noisy assets like lamps)
            if (flags.includes('remove_black')) {
                const imageData = ctx.getImageData(0, 0, targetW, targetH);
                const data = imageData.data;
                let removedCount = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // If dark (near black), make transparent. Threshold 60.
                    if (r < 60 && g < 60 && b < 60) {
                        data[i + 3] = 0;
                        removedCount++;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                console.log(`[AssetManager] Post-processing remove_black applied to ID ${id}. Removed ${removedCount} pixels.`);
            }

            // [NEW] Remove gray/tan background pixels (fixes Wolf/Rat gray box issue)
            if (flags.includes('remove_gray_bg')) {
                // SPECIFIC DEBUG: Log when this block is entered for Wolf/Rat
                if (id === 200 || id === 201) {
                    console.error(`!!!!! WOLF/RAT POST-PROCESS ENTER: ID=${id} targetSize=${targetW}x${targetH}`);
                }
                const imageData = ctx.getImageData(0, 0, targetW, targetH);
                const data = imageData.data;
                let removedCount = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    // Skip already transparent pixels
                    if (a === 0) continue;

                    // Check if it's a grayish/neutral color (R, G, B are similar)
                    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

                    // CASE 1: Semi-transparent grayish pixels (anti-aliasing halos)
                    if (a < 250 && maxDiff < 60) {
                        data[i + 3] = 0;
                        removedCount++;
                        continue;
                    }

                    // CASE 2: OPAQUE gray/tan background pixels (the actual gray boxes)
                    // Target range: grayish (R≈G≈B, 100-220) or tan/beige (R>G>B, warm tones)
                    if (a >= 250) {
                        const avg = (r + g + b) / 3;

                        // Pure gray: all channels similar, mid-range brightness (90-220)
                        const isPureGray = maxDiff < 40 && avg > 90 && avg < 220;

                        // Tan/beige: R>G>B pattern, warm grayish tone (common AI bg)
                        const isTanBg = r > 100 && r < 230 && g > 80 && g < 210 && b > 60 && b < 200 &&
                            r >= g && g >= b && (r - b) < 80 && maxDiff < 70;

                        if (isPureGray || isTanBg) {
                            data[i + 3] = 0;
                            removedCount++;
                        }
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                if (removedCount > 0) {
                    console.log(`[AssetManager] Post-processing remove_gray_bg applied to ID ${id}. Removed ${removedCount} gray/tan background pixels.`);
                } else if (id === 200 || id === 201) {
                    console.error(`!!!!! WOLF/RAT POST-PROCESS: ID=${id} removed 0 pixels!`);
                }
            }

            // Apply Transparency ONLY if not a tile AND not explicitly skipped
            if (!isTile && !flags.includes('skip_transparency')) {
                console.log(`[AssetManager] Applying Transparency for ID ${id} (isTile=false)`);
                this.applyTransparency(ctx, targetW, targetH);
            } else {
                console.log(`[AssetManager] SKIPPING Transparency for ID ${id} (isTile=${isTile}, skipFlag=${flags.includes('skip_transparency')})`);
            }

            this.images[id] = resized;
            console.log(`[AssetManager] Custom sprite ${id} loaded and resized to ${targetW}x${targetH}!`);
            return true;
        } catch (e) {
            console.error(`[AssetManager] Failed to load custom sprite ${url}:`, e);
            // Fallback (use red placeholder?)
            return false;
        }
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
                // NOTE: applyTransparency REMOVED here - now handled by registerCustomSprite
                // which has access to the skip_transparency flag
                resolve(cvs);
            };
            img.onerror = () => {
                console.warn(`[AssetManager] Failed to load: ${url}, using fallback`);
                reject(new Error(`Failed to load ${url}`));
            };
            img.src = url;
        });
    }

    private applyTransparency(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // Helper to get RGB
        const getRGB = (i: number) => {
            const idx = i * 4;
            return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
        };

        const corners = [0, w - 1, (h - 1) * w, (h - 1) * w + w - 1];
        const visited = new Int8Array(w * h);
        const queue: number[] = []; // Temp queue for seeds

        const processSeed = (startIdx: number) => {
            if (visited[startIdx]) return;
            // Reverted alpha check to ensure flood fill runs on potentially messy alpha

            const startColor = getRGB(startIdx);

            // Skip processing if corner is dark (likely part of the sprite, not background)
            // Dark pixels should not trigger flood-fill as they're often part of the art
            if (startColor.r < 50 && startColor.g < 50 && startColor.b < 50) return;

            // Skip processing if corner is green (nature sprites like trees, grass)
            if (startColor.g > 50 && startColor.g > startColor.r && startColor.g > startColor.b) return;

            // Skip processing if corner is brown/tan (wolf, bandit, and other creature sprites)
            if (startColor.r > 80 && startColor.g > 40 && startColor.b < 80) return;

            const localQueue = [startIdx];
            visited[startIdx] = 1;
            const TOL = 25; // Reduced tolerance for more precise transparency

            while (localQueue.length > 0) {
                const idx = localQueue.pop()!;
                const dataIdx = idx * 4;
                data[dataIdx + 3] = 0; // Transparent

                const px = (idx % w);
                const py = Math.floor(idx / w);
                const neighbors = [];
                if (px > 0) neighbors.push(idx - 1);
                if (px < w - 1) neighbors.push(idx + 1);
                if (py > 0) neighbors.push(idx - w);
                if (py < h - 1) neighbors.push(idx + w);

                for (const nIdx of neighbors) {
                    if (visited[nIdx]) continue;
                    const nC = getRGB(nIdx);
                    if (Math.abs(nC.r - startColor.r) < TOL &&
                        Math.abs(nC.g - startColor.g) < TOL &&
                        Math.abs(nC.b - startColor.b) < TOL) {
                        visited[nIdx] = 1;
                        localQueue.push(nIdx);
                    }
                }
            }
        };

        for (const idx of corners) {
            // Process ALL corners. If it's a solid background (White, Black, Magenta), it gets removed.
            processSeed(idx);
        }

        /* OLD LOOP: for (const idx of corners) {
            // MATCHED

            // Check for White or Magenta
            // White: >240, Magenta: R>240 G<50 B>240
            const isWhite = (r > 240 && g > 240 && b > 240);
            const isMagenta = (r > 240 && g < 50 && b > 240);

            if (isWhite || isMagenta) {
                bgR = r; bgG = g; bgB = b;
                startIdx = idx;
                foundBg = true;
                detectionMethod = isWhite ? "Strict White" : "Strict Magenta";
                break;
            }
        }

        // 2. Fallback: Check for Uniform Corners (e.g. Gray placeholders)
        if (!foundBg) {
            // Helper to get RGB
            const getRGB = (i: number) => {
                const idx = i * 4;
                return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
            };
            const c0 = getRGB(corners[0]);
            const c1 = getRGB(corners[1]);
            const c2 = getRGB(corners[2]);
            // 2. Scan corners to find background color (majority vote)
            // Relaxed tolerance for noisy JPEGs/Artifacts (User reported Green Box)
            const TOL_STRICT = 60; // Increased to 60 (Aggressive)

            const match1 = Math.abs(c0.r - c1.r) < TOL_STRICT && Math.abs(c0.g - c1.g) < TOL_STRICT && Math.abs(c0.b - c1.b) < TOL_STRICT;
            const match2 = Math.abs(c0.r - c2.r) < TOL_STRICT && Math.abs(c0.g - c2.g) < TOL_STRICT && Math.abs(c0.b - c2.b) < TOL_STRICT;

            if (match1 && match2) {
                bgR = c0.r; bgG = c0.g; bgB = c0.b;
                startIdx = corners[0];
                foundBg = true;
                detectionMethod = `Uniform Fallback (rgb(${bgR},${bgG},${bgB}))`;
            }
        }

        if (!foundBg) {
            console.warn(`[AssetManager] Transparency Failed: Corners not uniform. ${w}x${h} (R:${bgR} G:${bgG} B:${bgB})`);
        } else {
            // console.log(`[AssetManager] Transparency APPLIED: ${detectionMethod}`);
        }

        if (foundBg) {
            const visited = new Int8Array(w * h);
            const queue: number[] = [startIdx];
            const TOL = 40;

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

                if (Math.abs(r - bgR) < TOL &&
                    Math.abs(g - bgG) < TOL &&
                    Math.abs(b - bgB) < TOL) {

                    data[dataIdx + 3] = 0; // Transparent

                    if (px > 0) queue.push(idx - 1);
                    if (px < w - 1) queue.push(idx + 1);
                    if (py > 0) queue.push(idx - w);
                    if (py < h - 1) queue.push(idx + w);
                }
            }
        } */

        // Always remove Magenta (#FF00FF) globally
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 255) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    // =========================================================
    // ROOKGAARD: SANDSTONE (Town Ground)
    // =========================================================
    private createSandstone(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        // Base: Warm Sandy Beige
        const BASE = '#dccbba';
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);
        // Texture: Scatter subtle darker grains
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            // Mix of lighter and darker grains
            ctx.fillStyle = Math.random() > 0.5 ? '#cbbba0' : '#ebdccb';
            ctx.fillRect(x, y, 1, 1);
        }
        // Irregular flagstone cracks (Subtle)
        ctx.strokeStyle = '#bdaaa0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Draw a few random "cracked" lines to look like worn pavement
        ctx.moveTo(Math.random() * 32, 0);
        ctx.lineTo(Math.random() * 32, 32);
        ctx.stroke();
        return cvs;
    }

    // =========================================================
    // ROOKGAARD: TEMPLE BLOCK (Clean Stone)
    // =========================================================
    private createTempleFloor(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        // Base: Light Grey / White Stone
        const BASE = '#e0e0e0';
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);
        // Border: Distinct white highlight on top/left
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 32, 1);
        ctx.fillRect(0, 0, 1, 32);
        // Shadow: Dark grey on bottom/right
        ctx.fillStyle = '#a0a0a0';
        ctx.fillRect(0, 31, 32, 1);
        ctx.fillRect(31, 0, 1, 32);
        // Inner Pattern: Large centered square tile
        ctx.strokeStyle = '#c0c0c0';
        ctx.strokeRect(4, 4, 24, 24);
        return cvs;
    }

    // =========================================================
    // ROOKGAARD: SEWER GRATE
    // =========================================================
    private createSewerGrate(): HTMLCanvasElement {
        // 1. Draw the floor underneath first (Cobble)
        const cvs = this.createCobble(); // Reuse your existing cobble
        const ctx = cvs.getContext('2d')!;
        // 2. Draw the Iron Bars
        const GRATE = '#222';
        const HIGHLIGHT = '#555';
        ctx.fillStyle = '#111'; // Dark void below
        ctx.fillRect(4, 4, 24, 24);
        // Vertical Bars
        for (let i = 0; i < 3; i++) {
            const x = 10 + (i * 6);
            ctx.fillStyle = GRATE;
            ctx.fillRect(x, 4, 2, 24);
            ctx.fillStyle = HIGHLIGHT; // Metal shine
            ctx.fillRect(x, 4, 1, 24);
        }
        // Horizontal Bars
        for (let i = 0; i < 3; i++) {
            const y = 10 + (i * 6);
            ctx.fillStyle = GRATE;
            ctx.fillRect(4, y, 24, 2);
            ctx.fillStyle = HIGHLIGHT;
            ctx.fillRect(4, y, 24, 1);
        }
        // Frame
        ctx.strokeStyle = '#444';
        ctx.strokeRect(4, 4, 24, 24);
        return cvs;
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
        this.images[23] = this.createWallVertical(); // Vertical Wall (No Lid)
        this.images[17] = this.createWall();     // Stone Wall (alias)
        this.images[311] = this.createSand();    // Sand (Biome)

        // ===== NATURE =====
        this.images[50] = this.createTree();     // Tree Pine (Fallback)
        this.images[51] = this.createTree();     // Tree Oak (SPRITES.TREE_OAK)
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
        // ID 21 is WALL, do not overwrite with backpack

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
        this.images[22] = this.createBackpack(); // Backpack only
        // ID 21 is WALL (created at line 94), must NOT be overwritten

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

        // ===== STARTING GEAR (Rookgaard) =====
        this.images[IMG.STAIRS_DOWN] = this.createStairs(false);
        this.images[IMG.STAIRS_UP] = this.createStairs(true);
        this.images[IMG.WOODEN_SWORD] = this.createWoodenSword();
        this.images[IMG.WOODEN_SHIELD] = this.images[46]; // Reuse existing Wooden Shield
        this.images[IMG.LEATHER_ARMOR] = this.createArmorPlate('#8d6e63', '#5d4037');
        this.images[IMG.LEATHER_BOOTS] = this.createBoots('#8d6e63');
        this.images[IMG.APPLE] = this.createApple();
        this.images[IMG.SMALL_BAG] = this.createSmallBag();

        // ===== NEW MOBS (User Request) =====
        this.images[IMG.ORC] = this.createOrc();
        this.images[IMG.BEAR] = this.createBear('#5d4037'); // Brown
        this.images[IMG.POLAR_BEAR] = this.createPolarBear(); // White with tweaks
        this.images[IMG.YETI] = this.createYeti();
        this.images[IMG.SCORPION] = this.createScorpion();
        this.images[IMG.SNAKE] = this.createSnake();
        this.images[IMG.SPIDER] = this.createSpider();
        // Fallbacks for variants
        this.images[IMG.SLIME] = this.createSlime();
        this.images[IMG.RAT] = this.createRat();
        this.images[IMG.WOLF] = this.createWolf();
        this.images[IMG.SKELETON] = this.createSkeleton();
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
        this.images[230] = this.createGem('#f44336'); // Ruby (GEM_RUBY)
        this.images[231] = this.createGem('#2196f3'); // Sapphire (GEM_SAPPHIRE)
        this.images[172] = this.createGem('#eee');    // Spider Silk (White Gem placeholder)
        this.images[86] = this.createPotion();        // Mana Potion (Reuse Potion)

        // ===== MISSING ARMOR =====
        this.images[2] = this.createArmorPlate('#b0bec5', '#78909c'); // Plate Armor (ID 2)
        this.images[160] = this.createGeneric('#8d6e63'); // Wolf Pelt (Brownish)
        this.images[161] = this.createGeneric('#5d4037'); // Bear Fur (Dark Brown)
        this.images[172] = this.createGeneric('#eeeeee'); // Spider Silk (White)

        // Fix for Wolf Corpse (294) - Use procedural "Meat/Gore" shape for now
        this.images[294] = this.createFood('rotten'); // Reuse rotten flesh shape (pile) but generic? 
        // Or just createGeneric('#8d6e63')
        this.images[294] = this.createGeneric('#8d6e63'); // Brown pile (Wolf Corpse)

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

        // ===== BUILDINGS & ROOFS (Tibia-style Fake 3D) =====
        // Proper roof tiles with shingle patterns
        this.images[580] = this.createRoofTile('#8b4513', '#5d3a1a'); // Brown roof
        this.images[581] = this.createRoofTile('#b71c1c', '#7f0000'); // Red roof
        this.images[582] = this.createTempleDome(); // Grand 80px Dome for Temple
        this.images[587] = this.createGeneric('#8d6e63'); // Chimney
        this.images[588] = this.createWindowTile();       // Window
        this.images[589] = this.createDoorTile('#5d4037'); // Wood door
        this.images[590] = this.createDoorTile('#424242'); // Metal door
        this.images[591] = this.createGeneric('#757575'); // Well
        this.images[592] = this.createGeneric('#87ceeb'); // Fountain
        this.images[593] = this.createGeneric('#8d6e63'); // Signpost
        this.images[594] = this.createTorch();            // Lamppost (reuse torch)
        this.images[595] = this.createCrate();            // Table (reuse crate)
        this.images[596] = this.createGeneric('#ffffff'); // Bed
        this.images[597] = this.createCrate();            // Chest (reuse crate)
        this.images[598] = this.createGold();             // Gold pile
        this.images[599] = this.createGold();             // Coin

        // 3D-looking wall tiles for building edges
        this.images[600] = this.create3DWall();           // 3D wall tile
        this.images[601] = this.createWall3D_L2();        // 2nd story wall
        this.images[602] = this.createTownWall();         // Town perimeter wall

        console.log(`[AssetManager] NPC Sprites: 260=${this.images[260]?.width}x${this.images[260]?.height}, 261=${this.images[261]?.width}x${this.images[261]?.height}, 262=${this.images[262]?.width}x${this.images[262]?.height}`);

        console.log(`[AssetManager] Forged ${Object.keys(this.images).length} Tibia-quality procedural assets.`);
        // Note: loadExternalSprites and loadAISprites should be called via await loadAll()
    }

    private async loadExternalSprites() {
        console.log("[AssetManager] Loading external Tibia sprites...");
        try {
            // 1. Legacy Individual Sprites (REMOVED to prevent overwriting procedural assets)
            // Procedural assets are now the source of truth until a full Sprite Pack is loaded via SPRITE_MAP.

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
                        if (id === 263) console.log(`[AssetDebug] Banker(263) Def:`, def);

                        // Determine target canvas size
                        // For new AI sprites (5000+), we scale to game size (32x32 or 32x64)
                        let canvasWidth = def.width;
                        let canvasHeight = def.height;

                        if (id >= 5000 && id < 8000) {
                            // Tall sprites (walls, lamps) -> 32x64
                            // Ground tiles -> 32x32
                            const isTall = def.height > def.width * 1.5;
                            canvasWidth = isTall ? 32 : 32;
                            canvasHeight = isTall ? 64 : 32;
                        } else if (id >= 8000) {
                            // Item sprites (8000+) -> Always downscale to 32x32
                            canvasWidth = 32;
                            canvasHeight = 32;
                        }

                        const spriteCvs = this.createCanvas(canvasWidth, canvasHeight);
                        const ctx = spriteCvs.getContext('2d')!;

                        // Disable smoothing for atlas sprites (6000+) to preserve magenta for chroma-key
                        // Enable smoothing for AI sprites (5000-5999) and item sprites (8000+) for downscaling
                        ctx.imageSmoothingEnabled = (id >= 5000 && id < 6000) || id >= 8000;

                        // Auto-Scale Handler for AI Generated Images (1024x1024)
                        let sx = def.x;
                        let sy = def.y;
                        let sw = def.width;
                        let sh = def.height;

                        // FIX: Downscale High-Res NPCs to 32x32 at load time
                        if (id >= 263 && id <= 270) {
                            sw = img.width; // Read full source
                            sh = img.height;
                            canvasWidth = 32; // Target 32x32
                            canvasHeight = 32;
                            ctx.imageSmoothingEnabled = true; // High quality scale
                        }

                        // ONLY apply to Custom Assets (ID >= 300) OR Legacy Nature (Tree=50/51, Rock=6). 
                        // OTSP Assets separate from these.
                        const isLegacyNature = (id === 50 || id === 51 || id === 6);
                        if ((id >= 300 && id < 8000 || isLegacyNature) && def.x === 0 && def.y === 0 && img.width >= 128 && img.height >= 128) {
                            sx = 0;
                            sy = 0;
                            sw = img.width;
                            sh = img.height;

                            // CRITICAL: Enable smoothing for massive downscale (1024 -> 32)
                            // Otherwise Nearest Neighbor deletes the tree pixels.
                            ctx.imageSmoothingEnabled = true;
                            // console.log(`[AssetManager] Auto-scaling large asset ${id} (${img.width}x${img.height}) -> 32x32`);
                        }

                        // Draw: source(sx,sy,sw,sh) -> dest(0,0,canvasWidth,canvasHeight)
                        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);

                        // Apply magenta chroma-key for atlas sprites (6000+)
                        if (id >= 6000) {
                            const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
                            const data = imageData.data;
                            let removed = 0;
                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i];
                                const g = data[i + 1];
                                const b = data[i + 2];
                                // Remove magenta (FF00FF) - broader tolerance for AI-generated magenta
                                if (r > 180 && g < 80 && b > 180) {
                                    data[i + 3] = 0; // Set alpha to 0 (transparent)
                                    removed++;
                                }
                            }
                            ctx.putImageData(imageData, 0, 0);
                            console.log(`[AssetManager] Atlas sprite ${id}: ${canvasWidth}x${canvasHeight}, removed ${removed} magenta pixels`);
                        }

                        // Skip flood-fill transparency for item sprites (8000+) - they have colored backgrounds
                        // that should NOT be flood-filled since it removes the items themselves
                        if (id < 8000) {
                            this.applyTransparency(ctx, canvasWidth, canvasHeight);
                        } else {
                            // For 8000+ item sprites, remove background pixels (black or white)
                            const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
                            const data = imgData.data;
                            const isArmorSheet = id >= 8020 && id <= 8031; // Armor has white background
                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i], g = data[i + 1], b = data[i + 2];
                                // Remove near-black pixels (threshold of 30 for AI artifacts)
                                if (r < 30 && g < 30 && b < 30) {
                                    data[i + 3] = 0; // Make transparent
                                }
                                // Also remove near-white pixels for armor sheet
                                if (isArmorSheet && r > 240 && g > 240 && b > 240) {
                                    data[i + 3] = 0; // Make transparent
                                }
                            }
                            ctx.putImageData(imgData, 0, 0);
                        }
                        this.images[id] = spriteCvs;

                        if (id === 10) { // GRASS Debug
                            console.log(`[AssetDebug] Loaded GRASS (10) from ${file} at ${def.x},${def.y}`);
                        }
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
            // Generated Assets (Yeti/Snake)
            321: '/sprites/yeti.png',
            324: '/sprites/snake.png',

            // Corpses
            297: '/sprites/corpse_orc.png',
            293: '/sprites/corpse_wolf.png', // Rat shares? No, Wolf Dead
            // 294: '/sprites/corpse_wolf.png', // USER REPORTED BAD SPRITE (Looks like Undead)
            295: '/sprites/corpse_bear.png',
            296: '/sprites/corpse_spider.png',
            298: '/sprites/corpse_human.png',
            22: '/sprites/corpse_snake.png', // Snake Corpse
            23: '/sprites/corpse_wolf.png', // Rat Corpse (Fallback)
            // Mobs.ts: Rat Corpse = 23.
            // Need to generate/map rat corpse too? User said "Wolf, Bear, Spider, Human, Snake".
            // Rat wasn't mentioned explicitly as fixed, but let's assume Rat Corpse is generic or missing.
            // Using Wolf for Rat? No.
            // Let's stick to what we have.


            // NPCs
            260: '/sprites/npc_merchant.png',
            261: '/sprites/npc_healer.png',
            262: '/sprites/npc_guide.png', // Fallback/Existing

            // Orcs
            9: '/sprites/orc.png',
            252: '/sprites/orc_peon.png',
            253: '/sprites/orc_warlord.png', // Re-verify this ID?

            // Biome Mobs
            332: '/sprites/hydra.png', // Hydra
            333: '/sprites/orc_warlord.png', // Warlord
            330: '/sprites/frost_giant.png', // Frost Giant
            322: '/sprites/scorpion_king.png', // Scorpion King
            323: '/sprites/mummy.png', // Mummy
            320: '/sprites/polar_bear.png', // Polar Bear

            // Standard Mobs (Remapped from generic placeholders)
            202: '/sprites/skeleton.png',
            162: '/sprites/ghost.png', // Ghost ID 162? Check constants
            203: '/sprites/slime.png',
            289: '/sprites/necromancer.png',
            // 22: '/sprites/zombie.png', 
            // Checking Mobs.ts again for IDs.
            // Zombie Live: SPRITES.ZOMBIE (Need to check value, likely 200 range)
            // Let's assume ID map is safest way.
            // Zombie Live ID? Mobs.ts says SPRITES.ZOMBIE.
            // Ghost: SPRITES.GHOST.

            // Constants lookup:
            // SKELETON: 202
            // SLIME: 203
            // GHOST: ? (Need to check constants again, assumed 162 from previous logs or guess)
            // ZOMBIE: ?

            // Let's map strict IDs based on constants.ts file view
            // RAT=200, WOLF=201, SKELETON=202, SLIME=203
            // NECROMANCER=289
            // ORC=9
            // ORC_WARLORD=333
            // HYDRA=332
            // FROST_GIANT=330
            // SCORPION_KING=322
            // MUMMY=323
            // POLAR_BEAR=320
            // SNAKE=324 (Already Mapped)
            // YETI=321 (Already Mapped)
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

                // CRITICAL: Clear canvas to ensure transparency (prevents black/gray boxes)
                ctx.clearRect(0, 0, w, h);

                // Draw image filling entire canvas (will stretch but keeps proportions relative to tile)
                ctx.drawImage(img, 0, 0, w, h);

                // NOTE: applyTransparency REMOVED - these sprites already have proper alpha transparency
                // The flood-fill was incorrectly detecting transparent corners and destroying the sprites

                this.images[id] = cvs;
                console.log(`[AssetManager] Loaded AI sprite ${id} (${w}x${h})`);
            } catch (e) {
                console.warn(`[AssetManager] Failed to load AI sprite ${id}: ${url}`, e);
            }
        }

        // RE-APPLY PROCEDURAL OVERRIDES (To prevent external assets from overwriting them)
        // Only override Dwarf sprites if not present (although they are unique)
        // Removed forced overrides for Cobble (12) and Wall (21) to allow Sprite Map to work.


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
            // console.log(`[AssetDebug] Tree(51):`, s ? `${s.width}x${s.height}` : "MISSING");
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

    getSpriteStyle(id: number): { backgroundImage: string, backgroundPosition: string, backgroundSize: string } {
        const cvs = this.getSprite(id);
        return {
            backgroundImage: `url(${cvs.toDataURL()})`,
            backgroundPosition: '0px 0px',
            backgroundSize: '100% 100%'
        };
    }

    getSheetConfig(): any { return { width: 512, height: 512, tileSize: 32 }; }
    rebuildCache(): void { }
    getSpriteImage(id: number): HTMLCanvasElement { return this.getSprite(id); }

    // Helper to create a canvas of specified size
    private createCanvas(w: number, h: number): HTMLCanvasElement {
        const cvs = document.createElement('canvas');
        cvs.width = w;
        cvs.height = h;
        return cvs;
    }

    // =========================================================
    // TIBIA-QUALITY GRASS (Noise Textured - Seamless Style)
    // =========================================================
    private createGrass(variant: number): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Tibia Green Base (slightly muted, not too bright)
        const BASE = '#3a7a3a';
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);

        // === NOISE TEXTURE LAYER ===
        // Add random green variation specs (low contrast)
        const seed = variant * 1234;
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const hash = ((x * 7 + y * 13 + seed) * 16807) % 2147483647;
                const r = (hash / 2147483647);

                if (r < 0.15) {
                    // Dark specs (dirt/shadow)
                    ctx.fillStyle = '#2a5a2a';
                    ctx.fillRect(x, y, 1, 1);
                } else if (r < 0.30) {
                    // Slightly darker green
                    ctx.fillStyle = '#306030';
                    ctx.fillRect(x, y, 1, 1);
                } else if (r > 0.85) {
                    // Light green highlight
                    ctx.fillStyle = '#4a9a4a';
                    ctx.fillRect(x, y, 1, 1);
                } else if (r > 0.92) {
                    // Bright grass blade tip
                    ctx.fillStyle = '#5aaa5a';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // === DIRT SPECS (Brown spots) ===
        for (let i = 0; i < 8; i++) {
            const hash = ((i * 17 + seed) * 48271) % 2147483647;
            const x = (hash % 30) + 1;
            const y = ((hash >> 8) % 30) + 1;
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(x, y, 1, 1);
        }

        // === GRASS BLADE TUFTS (Subtle) ===
        ctx.strokeStyle = '#2a5a2a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const hash = ((i * 23 + variant * 7) * 16807) % 2147483647;
            const x = (hash % 28) + 2;
            const y = ((hash >> 10) % 24) + 6;
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
    // TIBIA-QUALITY SAND (Noise Textured - Beach Style)
    // =========================================================
    private createSand(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Tibia Sand Base (warmer, less saturated)
        const BASE = '#c4a060';
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, 32, 32);

        // === NOISE TEXTURE LAYER ===
        const seed = 5678;
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const hash = ((x * 11 + y * 17 + seed) * 48271) % 2147483647;
                const r = (hash / 2147483647);

                if (r < 0.12) {
                    // Dark specs (wet sand/stones)
                    ctx.fillStyle = '#9a8050';
                    ctx.fillRect(x, y, 1, 1);
                } else if (r < 0.25) {
                    // Slightly darker sand
                    ctx.fillStyle = '#b49058';
                    ctx.fillRect(x, y, 1, 1);
                } else if (r > 0.85) {
                    // Light sand highlight
                    ctx.fillStyle = '#d4b070';
                    ctx.fillRect(x, y, 1, 1);
                } else if (r > 0.92) {
                    // Very light (sun bleached)
                    ctx.fillStyle = '#e4c080';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // === SMALL STONES/PEBBLES ===
        for (let i = 0; i < 5; i++) {
            const hash = ((i * 31 + seed) * 16807) % 2147483647;
            const x = (hash % 28) + 2;
            const y = ((hash >> 8) % 28) + 2;
            ctx.fillStyle = '#8a7040';
            ctx.fillRect(x, y, 2, 1);
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
    // VERTICAL WALL (No Lid, for seamless stacking)
    // =========================================================
    private createWallVertical(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 64);
        const ctx = cvs.getContext('2d')!;

        const FACE_BASE = '#555566';
        const BRICK_LIGHT = '#666677';
        const BRICK_DARK = '#444455';
        const MORTAR = '#333344';

        ctx.fillStyle = FACE_BASE;
        ctx.fillRect(0, 0, 32, 64);

        for (let row = 0; row < 8; row++) {
            const y = row * 8;
            const offset = (row % 2) * 8;

            for (let col = 0; col < 3; col++) {
                const x = offset + col * 16 - 8;
                if (x < 0 || x >= 32) continue;
                const brickW = Math.min(14, 32 - x);

                ctx.fillStyle = FACE_BASE;
                ctx.fillRect(x, y, brickW, 6);
                ctx.fillStyle = BRICK_LIGHT;
                ctx.fillRect(x, y, brickW, 1);
                ctx.fillRect(x, y, 1, 6);
                ctx.fillStyle = BRICK_DARK;
                ctx.fillRect(x, y + 5, brickW, 1);
                if (x + brickW < 32) {
                    ctx.fillRect(x + brickW - 1, y, 1, 6);
                }
            }
            ctx.fillStyle = MORTAR;
            ctx.fillRect(0, y + 6, 32, 2);
        }
        ctx.fillStyle = '#111122';
        ctx.fillRect(0, 0, 1, 64);
        ctx.fillRect(31, 0, 1, 64);

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
    // TIBIA-QUALITY TREE (64x96 TALL with visible trunk - Oblique Style)
    // =========================================================
    private createTree(): HTMLCanvasElement {
        const cvs = this.createCanvas(64, 96); // Taller for 3D effect
        const ctx = cvs.getContext('2d')!;

        const TRUNK_DARK = '#2a1a10';
        const TRUNK_MID = '#4a3020';
        const TRUNK_LIGHT = '#5a4030';
        const LEAF_DARK = '#1a3a15';
        const LEAF_MID = '#2a5a25';
        const LEAF_LIGHT = '#4a8a45';

        // === TRUNK (Visible, prominent) ===
        const trunkX = 26;
        const trunkW = 12;
        const trunkTop = 40;   // Where trunk meets canopy
        const trunkBottom = 92; // Near bottom

        // Main trunk body
        ctx.fillStyle = TRUNK_MID;
        ctx.fillRect(trunkX, trunkTop, trunkW, trunkBottom - trunkTop);

        // Trunk left highlight (light source from top-left)
        ctx.fillStyle = TRUNK_LIGHT;
        ctx.fillRect(trunkX, trunkTop, 4, trunkBottom - trunkTop);

        // Trunk right shadow
        ctx.fillStyle = TRUNK_DARK;
        ctx.fillRect(trunkX + trunkW - 4, trunkTop, 4, trunkBottom - trunkTop);

        // Bark texture lines
        ctx.strokeStyle = TRUNK_DARK;
        ctx.lineWidth = 1;
        for (let y = trunkTop + 4; y < trunkBottom - 2; y += 6) {
            ctx.beginPath();
            ctx.moveTo(trunkX + 2, y + 0.5);
            ctx.lineTo(trunkX + trunkW - 2, y + 0.5);
            ctx.stroke();
        }

        // Trunk root flare at bottom
        ctx.fillStyle = TRUNK_MID;
        ctx.beginPath();
        ctx.moveTo(trunkX - 3, trunkBottom);
        ctx.lineTo(trunkX, trunkTop + 45);
        ctx.lineTo(trunkX + trunkW, trunkTop + 45);
        ctx.lineTo(trunkX + trunkW + 3, trunkBottom);
        ctx.fill();

        // === CANOPY (Large, layered) ===
        const cx = 32;
        const cy = 30; // Higher up on the sprite

        // Base dark layer
        ctx.fillStyle = LEAF_DARK;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 28, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mid layer with dithering
        for (let y = cy - 22; y < cy + 20; y++) {
            for (let x = cx - 26; x < cx + 26; x++) {
                const dx = (x - cx) / 28;
                const dy = (y - cy) / 24;
                if (dx * dx + dy * dy > 0.9) continue;

                if (this.shouldDither(x, y, 7)) {
                    ctx.fillStyle = LEAF_MID;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Light layer (top-left highlight)
        for (let y = cy - 22; y < cy + 6; y++) {
            for (let x = cx - 26; x < cx + 6; x++) {
                const dx = (x - cx) / 28;
                const dy = (y - cy) / 24;
                if (dx * dx + dy * dy > 0.75) continue;

                if (this.shouldDither(x, y, 5)) {
                    ctx.fillStyle = LEAF_LIGHT;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Shadow layer (bottom-right)
        for (let y = cy; y < cy + 20; y++) {
            for (let x = cx; x < cx + 26; x++) {
                const dx = (x - cx) / 28;
                const dy = (y - cy) / 24;
                if (dx * dx + dy * dy > 0.8) continue;

                if (this.shouldDither(x, y, 4)) {
                    ctx.fillStyle = '#0a2a0a';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Canopy outline
        ctx.strokeStyle = '#0a200a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 28, 24, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Lower foliage clusters (hide trunk join)
        ctx.fillStyle = LEAF_DARK;
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy + 18, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy + 16, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

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

        // Shadow (Wider, flatter)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Organic Puddle Body (Multiple overlapped blobs)
        ctx.fillStyle = 'rgba(60, 180, 60, 0.85)'; // Semi-transparent base

        ctx.beginPath();
        // Base wide puddle
        ctx.ellipse(16, 24, 12, 6, 0, 0, Math.PI * 2);
        // Mid blob
        ctx.ellipse(16, 20, 9, 7, 0, 0, Math.PI * 2);
        // Top blob (offset)
        ctx.ellipse(14, 16, 6, 5, 0.2, 0, Math.PI * 2);
        // Random bulge
        ctx.ellipse(20, 18, 5, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner "Goo" Core (Darker, less transparent)
        ctx.fillStyle = 'rgba(40, 140, 40, 0.9)';
        ctx.beginPath();
        ctx.ellipse(16, 22, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bubbles (Texture)
        ctx.fillStyle = 'rgba(150, 255, 150, 0.6)';
        const bubbles = [
            { x: 12, y: 18, r: 2 },
            { x: 18, y: 14, r: 1.5 },
            { x: 20, y: 22, r: 1 },
            { x: 10, y: 24, r: 1.5 },
            { x: 15, y: 12, r: 2.5 }
        ];
        for (const b of bubbles) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Specular Highlights (Slimy look)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(14, 15, 3, 1.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(18, 19, 2, 1, -0.3, 0, Math.PI * 2);
        ctx.fill();

        this.addOutline(ctx, cvs);
        return cvs;
    }

    // =========================================================
    // SKELETON (Monster 32x48)
    // =========================================================

    // private createCanvas(w: number, h: number): HTMLCanvasElement { ... } // Use existing helper

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

    // =========================================================
    // ROOF TILES (For 3D Building Effect)
    // =========================================================
    private createRoof(baseColor: string, shadowColor: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Triangular roof shape
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(0, 32);
        ctx.lineTo(16, 4);
        ctx.lineTo(32, 32);
        ctx.closePath();
        ctx.fill();

        // Ridge tiles
        ctx.fillStyle = shadowColor;
        for (let i = 0; i < 4; i++) {
            const y = 8 + i * 6;
            ctx.fillRect(0, y, 32, 2);
        }

        // Shadow on left side
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        ctx.moveTo(0, 32);
        ctx.lineTo(16, 4);
        ctx.lineTo(8, 4);
        ctx.lineTo(0, 20);
        ctx.closePath();
        ctx.fill();

        return cvs;
    }

    // =========================================================
    // WEAPON: SHORT SWORD (Iron)
    // =========================================================
    // Duplicate createSword removed.
    // Use the primary createSword at line 1880.

    // =========================================================
    // FOOD: APPLE (Red)
    // =========================================================
    private createApple(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Apple Body (Red circle)
        ctx.fillStyle = '#d32f2f'; // Red
        ctx.beginPath();
        ctx.arc(16, 18, 10, 0, Math.PI * 2);
        ctx.fill();

        // Highlight (White shine)
        ctx.fillStyle = '#ffcdd2';
        ctx.beginPath();
        ctx.arc(12, 14, 3, 0, Math.PI * 2);
        ctx.fill();

        // Stem (Brown)
        ctx.fillStyle = '#795548';
        ctx.fillRect(15, 6, 2, 4);

        // Leaf (Green)
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.ellipse(18, 8, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        return cvs;
    }

    private createTempleRoof(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48); // Taller for dome
        const ctx = cvs.getContext('2d')!;

        // Dome base (White/Gold)
        ctx.fillStyle = '#f5f5dc';
        ctx.beginPath();
        ctx.arc(16, 32, 14, Math.PI, 0); // Top semicircle
        ctx.lineTo(30, 48);
        ctx.lineTo(2, 48);
        ctx.closePath();
        ctx.fill();

        // Dome highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(12, 28, 4, 0, Math.PI * 2);
        ctx.fill();

        // Spire on top
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(20, 18);
        ctx.lineTo(12, 18);
        ctx.closePath();
        ctx.fill();

        // Cross at top
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(14, 0, 4, 8);
        ctx.fillRect(12, 2, 8, 3);

        return cvs;
    }

    private createRoofCorner(corner: 'nw' | 'ne' | 'sw' | 'se'): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = '#8b4513';

        switch (corner) {
            case 'nw':
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(32, 0);
                ctx.lineTo(32, 32);
                ctx.closePath();
                ctx.fill();
                break;
            case 'ne':
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(32, 0);
                ctx.lineTo(0, 32);
                ctx.closePath();
                ctx.fill();
                break;
            case 'sw':
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(32, 32);
                ctx.lineTo(0, 32);
                ctx.closePath();
                ctx.fill();
                break;
            case 'se':
                ctx.beginPath();
                ctx.moveTo(32, 0);
                ctx.lineTo(32, 32);
                ctx.lineTo(0, 32);
                ctx.closePath();
                ctx.fill();
                break;
        }

        return cvs;
    }

    private createChimney(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // Chimney body (brick)
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(10, 16, 12, 32);

        // Brick pattern
        ctx.strokeStyle = '#5d4037';
        for (let y = 20; y < 48; y += 6) {
            ctx.beginPath();
            ctx.moveTo(10, y);
            ctx.lineTo(22, y);
            ctx.stroke();
        }

        // Chimney top
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(8, 12, 16, 6);

        // Smoke
        ctx.fillStyle = 'rgba(128,128,128,0.5)';
        ctx.beginPath();
        ctx.arc(16, 6, 5, 0, Math.PI * 2);
        ctx.arc(20, 2, 4, 0, Math.PI * 2);
        ctx.fill();

        return cvs;
    }

    private createWindow(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Window frame (wood)
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(4, 4, 24, 24);

        // Glass (blue tint)
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(6, 6, 9, 9);
        ctx.fillRect(17, 6, 9, 9);
        ctx.fillRect(6, 17, 9, 9);
        ctx.fillRect(17, 17, 9, 9);

        // Frame cross
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(14, 4, 4, 24);
        ctx.fillRect(4, 14, 24, 4);

        return cvs;
    }

    private createDoor(color: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // Door frame
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(4, 8, 24, 40);

        // Door body
        ctx.fillStyle = color;
        ctx.fillRect(6, 10, 20, 36);

        // Door panels
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(8, 12, 16, 10);
        ctx.fillRect(8, 26, 16, 10);

        // Handle
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(20, 30, 2, 0, Math.PI * 2);
        ctx.fill();

        // Arch top
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(16, 8, 10, Math.PI, 0);
        ctx.fill();

        return cvs;
    }

    private createWellSprite(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // Well base (stone)
        ctx.fillStyle = '#757575';
        ctx.beginPath();
        ctx.ellipse(16, 38, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Well interior (dark)
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.ellipse(16, 36, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Well rim
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(16, 34, 12, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Overhead frame
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(4, 10, 3, 28);
        ctx.fillRect(25, 10, 3, 28);
        ctx.fillRect(4, 8, 24, 4);

        // Rope
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(16, 10);
        ctx.lineTo(16, 30);
        ctx.stroke();

        // Bucket
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(12, 26, 8, 6);

        return cvs;
    }

    private createFountainSprite(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // Base pool
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.ellipse(16, 42, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pool rim
        ctx.strokeStyle = '#757575';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(16, 42, 14, 6, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Center pillar
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(13, 20, 6, 22);

        // Top bowl
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.ellipse(16, 20, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water spray
        ctx.fillStyle = 'rgba(135,206,235,0.6)';
        ctx.beginPath();
        ctx.moveTo(16, 10);
        ctx.lineTo(12, 20);
        ctx.lineTo(20, 20);
        ctx.closePath();
        ctx.fill();

        return cvs;
    }

    private createSignpost(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // Post
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(14, 16, 4, 32);

        // Sign board
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(2, 8, 28, 12);

        // Text placeholder (lines)
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(4, 12, 24, 2);
        ctx.fillRect(8, 16, 16, 1);

        return cvs;
    }

    private createLamppost(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // Post
        ctx.fillStyle = '#424242';
        ctx.fillRect(14, 16, 4, 32);

        // Lamp housing
        ctx.fillStyle = '#757575';
        ctx.fillRect(8, 8, 16, 12);

        // Glass panels
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(10, 10, 5, 8);
        ctx.fillRect(17, 10, 5, 8);

        // Top
        ctx.fillStyle = '#424242';
        ctx.beginPath();
        ctx.moveTo(8, 8);
        ctx.lineTo(16, 2);
        ctx.lineTo(24, 8);
        ctx.closePath();
        ctx.fill();

        // Glow effect
        ctx.fillStyle = 'rgba(255,235,59,0.3)';
        ctx.beginPath();
        ctx.arc(16, 14, 12, 0, Math.PI * 2);
        ctx.fill();

        return cvs;
    }

    private createTableSprite(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Table top
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(2, 8, 28, 6);

        // Table legs
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(4, 14, 4, 16);
        ctx.fillRect(24, 14, 4, 16);

        return cvs;
    }

    private createBed(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Bed frame
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(2, 10, 28, 20);

        // Mattress
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 8, 24, 14);

        // Pillow
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(4, 8, 8, 8);

        // Blanket
        ctx.fillStyle = '#c62828';
        ctx.fillRect(4, 14, 24, 8);

        return cvs;
    }

    private createChestSprite(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Chest body
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(4, 12, 24, 18);

        // Chest lid
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.moveTo(4, 12);
        ctx.quadraticCurveTo(16, 2, 28, 12);
        ctx.closePath();
        ctx.fill();

        // Lock/clasp
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(14, 14, 4, 6);

        // Metal bands
        ctx.fillStyle = '#795548';
        ctx.fillRect(4, 18, 24, 2);
        ctx.fillRect(4, 24, 24, 2);

        return cvs;
    }

    private createGoldPile(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Pile of coins
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 15; i++) {
            const x = 8 + Math.random() * 16;
            const y = 16 + Math.random() * 12;
            ctx.beginPath();
            ctx.ellipse(x, y, 4, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Shadows
        ctx.fillStyle = '#c9a000';
        for (let i = 0; i < 8; i++) {
            const x = 10 + Math.random() * 12;
            const y = 18 + Math.random() * 10;
            ctx.beginPath();
            ctx.ellipse(x, y, 3, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        return cvs;
    }

    private createCoin(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Gold coin
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(16, 16, 10, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.strokeStyle = '#c9a000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(16, 16, 6, 0, Math.PI * 2);
        ctx.stroke();

        // Shine
        ctx.fillStyle = '#fff59d';
        ctx.beginPath();
        ctx.arc(12, 12, 3, 0, Math.PI * 2);
        ctx.fill();

        return cvs;
    }

    // =========================================================
    // TIBIA-STYLE ROOF TILE (with shingle pattern)
    // =========================================================
    private createRoofTile(baseColor: string, shadowColor: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 80); // Taller to sit ON TOP of walls
        const ctx = cvs.getContext('2d')!;

        // Base is at 80. tallOffset is 48. Renders dy - 48.
        // Wall Lid is at dy - 16 to dy.
        // We want roof shingles at dy - 48 to dy - 16 (Top 32px of sprite).

        // Base roof color
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 32, 32);

        // Draw horizontal shingle rows
        ctx.fillStyle = shadowColor;
        for (let row = 0; row < 5; row++) {
            const y = row * 6;
            ctx.fillRect(0, y + 4, 32, 2);

            const offset = (row % 2) * 8;
            for (let col = 0; col < 5; col++) {
                const x = offset + col * 16 - 8;
                if (x >= 0 && x < 32) {
                    ctx.fillRect(x, y, 1, 5);
                }
            }
        }

        // Add subtle highlight on top of shingles
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        for (let row = 0; row < 5; row++) {
            ctx.fillRect(0, row * 6, 32, 2);
        }

        return cvs;
    }

    // =========================================================
    // 2ND STORY WALL (80px Tall)
    // =========================================================
    private createWall3D_L2(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 96); // 96px for 2nd Story
        const ctx = cvs.getContext('2d')!;

        // tallOffset is 64. Renders dy - 64.
        // S2 Lid: y: 0-16. Renders dy - 64 to dy - 48.
        // S2 Face: y: 16-48. Renders dy - 48 to dy - 16. (Sits ON TOP of S1 Lid)

        // === STORY 2 LID (y=0 to 16) ===
        ctx.fillStyle = '#9999aa';
        ctx.fillRect(0, 0, 32, 16);

        // === STORY 2 FACE (y=16 to 48) ===
        ctx.fillStyle = '#666677';
        ctx.fillRect(0, 16, 32, 32);

        // Brick pattern for s2
        ctx.fillStyle = '#444455';
        for (let r = 0; r < 4; r++) {
            ctx.fillRect(0, 16 + r * 8 + 6, 32, 2);
        }

        return cvs;
    }

    // =========================================================
    // ROOKGAARD TOWN WALL (Perimeter)
    // =========================================================
    private createTownWall(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // Lid (Top side)
        ctx.fillStyle = '#555555';
        ctx.fillRect(0, 0, 32, 16);

        // Face (Front side)
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 16, 32, 32);

        // Large stones
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 16, 2, 32);
        ctx.fillRect(30, 16, 2, 32);
        ctx.fillRect(0, 16, 32, 2);
        ctx.fillRect(0, 31, 32, 2);
        ctx.fillRect(0, 46, 32, 2);

        return cvs;
    }

    // =========================================================
    // WINDOW TILE (for building walls)
    // =========================================================
    private createWindowTile(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Wall background
        ctx.fillStyle = '#757575';
        ctx.fillRect(0, 0, 32, 32);

        // Window frame (wood)
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(6, 6, 20, 20);

        // Glass panes (blue tint)
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(8, 8, 7, 7);
        ctx.fillRect(17, 8, 7, 7);
        ctx.fillRect(8, 17, 7, 7);
        ctx.fillRect(17, 17, 7, 7);

        // Frame cross
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(15, 6, 2, 20);
        ctx.fillRect(6, 15, 20, 2);

        // Glass reflection
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(9, 9, 3, 3);
        ctx.fillRect(18, 9, 3, 3);

        return cvs;
    }

    // =========================================================
    // DOOR TILE (for building entrances)
    // =========================================================
    private createDoorTile(color: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Floor under door
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(0, 28, 32, 4);

        // Door frame
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(4, 0, 24, 28);

        // Door body
        ctx.fillStyle = color;
        ctx.fillRect(6, 2, 20, 26);

        // Door panels (darker insets)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(8, 4, 16, 8);
        ctx.fillRect(8, 16, 16, 8);

        // Handle
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(20, 14, 3, 4);

        return cvs;
    }

    // =========================================================
    // 3D WALL (Tibia-style with lid and face)
    // =========================================================
    private create3DWall(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        // === LID (Top surface, y=0 to 16) ===
        ctx.fillStyle = '#888899';
        ctx.fillRect(0, 0, 32, 16);

        // Lid highlight (top edge)
        ctx.fillStyle = '#aaaaaa';
        ctx.fillRect(0, 0, 32, 3);

        // Lid shadow (bottom of lid)
        ctx.fillStyle = '#666677';
        ctx.fillRect(0, 13, 32, 3);

        // === FACE (Front surface, y=16 to 48) ===
        ctx.fillStyle = '#555566';
        ctx.fillRect(0, 16, 32, 32);

        // Brick pattern
        const BRICK_LIGHT = '#666677';
        const BRICK_DARK = '#444455';
        const MORTAR = '#333344';

        for (let row = 0; row < 4; row++) {
            const y = 18 + row * 8;
            const offset = (row % 2) * 8;

            // Mortar line
            ctx.fillStyle = MORTAR;
            ctx.fillRect(0, y + 6, 32, 2);

            // Individual bricks
            for (let col = 0; col < 4; col++) {
                const x = offset + col * 16 - 8;
                if (x < 0) continue;
                const brickW = Math.min(14, 32 - x);

                // Brick highlight
                ctx.fillStyle = BRICK_LIGHT;
                ctx.fillRect(x, y, brickW, 2);

                // Brick shadow
                ctx.fillStyle = BRICK_DARK;
                ctx.fillRect(x, y + 4, brickW, 2);

                // Vertical mortar
                ctx.fillStyle = MORTAR;
                ctx.fillRect(x + brickW, y, 2, 8);
            }
        }

        return cvs;
    }

    // =========================================================
    // TALL TEMPLE DOME (80px to sit on L2 walls)
    // =========================================================
    private createTempleDome(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 96); // 96px to sit on L2 walls
        const ctx = cvs.getContext('2d')!;

        // Dome in the top 48px
        // Renders dy - 64 to dy - 16. (Perfectly on top of S2 face)

        // Shadow/Base of dome
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.arc(16, 40, 14, Math.PI, 0); // Half circle
        ctx.fill();

        // Main dome body
        ctx.fillStyle = '#bdbdbd';
        ctx.beginPath();
        ctx.arc(16, 38, 12, Math.PI, 0);
        ctx.fill();

        // Highlights
        ctx.fillStyle = '#eeeeee';
        ctx.beginPath();
        ctx.arc(12, 32, 4, 0, Math.PI * 2);
        ctx.fill();

        // Gold spire tip
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(15, 10, 2, 10);
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(22, 10);
        ctx.lineTo(16, 2);
        ctx.fill();

        return cvs;
    }
    // =========================================================
    // STARTING GEAR HELPERS
    // =========================================================
    // Duplicate createApple removed. Use the one at line ~2964.

    private createWoodenSword(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);

        // Blade (Wood)
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(-2, -14, 4, 20);
        ctx.fillStyle = '#a1887f';
        ctx.fillRect(0, -14, 2, 20);

        // Guard (Dark Wood)
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-6, 4, 12, 3);

        // Handle
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(-1, 6, 2, 8);

        // Pommel
        ctx.fillStyle = '#5d4037';
        ctx.beginPath(); ctx.arc(0, 15, 2, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
        this.addOutline(ctx, cvs);
        return cvs;
    }

    private createSmallBag(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(16, 26, 8, 3, 0, 0, Math.PI * 2); ctx.fill();

        // Bag Body
        ctx.fillStyle = '#8d6e63'; // Brown leather
        ctx.beginPath();
        ctx.arc(16, 20, 8, 0, Math.PI, false); // Bottom half
        ctx.lineTo(8, 12);
        ctx.lineTo(24, 12);
        ctx.fill();
        ctx.fillRect(8, 12, 16, 8); // Top section

        // Drawstring area
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(10, 10, 12, 3);

        // String
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(12, 9, 1, 4);
        ctx.fillRect(19, 9, 1, 4);

        this.addOutline(ctx, cvs);
        return cvs;
    }

    // =========================================================
    // NEW MOBS (Procedural)
    // =========================================================

    private createOrc(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;

        const SKIN = '#4caf50'; // Green
        const ARMOR = '#757575'; // Grey iron

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(16, 44, 10, 3, 0, 0, Math.PI * 2); ctx.fill();

        // Legs
        ctx.fillStyle = '#5d4037'; // Leather pants
        ctx.fillRect(10, 30, 5, 14);
        ctx.fillRect(17, 30, 5, 14);

        // Torso
        ctx.fillStyle = ARMOR;
        ctx.fillRect(9, 18, 14, 14);
        // Belt
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(9, 30, 14, 2);

        // Arms
        ctx.fillStyle = SKIN;
        ctx.fillRect(4, 20, 5, 12);
        ctx.fillRect(23, 20, 5, 12);

        // Head
        ctx.fillStyle = SKIN;
        ctx.fillRect(11, 8, 10, 10);

        // Face features
        ctx.fillStyle = '#1b5e20'; // Dark green shade
        ctx.fillRect(11, 8, 10, 2); // Hair/Ridge
        ctx.fillStyle = '#000';
        ctx.fillRect(13, 12, 2, 2);
        ctx.fillRect(17, 12, 2, 2);

        // Tusks
        ctx.fillStyle = '#fff';
        ctx.fillRect(12, 16, 1, 2);
        ctx.fillRect(19, 16, 1, 2);

        this.addOutline(ctx, cvs);
        return cvs;
    }

    private createBear(color: string): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48); // Tall for standing bear
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(16, 42, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = color;
        // Body (Big round)
        ctx.beginPath(); ctx.ellipse(16, 30, 12, 14, 0, 0, Math.PI * 2); ctx.fill();

        // Legs
        ctx.fillRect(8, 36, 6, 8);
        ctx.fillRect(18, 36, 6, 8);

        // Head
        ctx.beginPath(); ctx.arc(16, 16, 9, 0, Math.PI * 2); ctx.fill();

        // Ears
        ctx.beginPath(); ctx.arc(9, 10, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(23, 10, 3, 0, Math.PI * 2); ctx.fill();

        // Muzzle
        ctx.fillStyle = '#3e2723'; // Darker snout usually
        if (color === '#fff') ctx.fillStyle = '#e0e0e0'; // Polar snout light grey
        ctx.beginPath(); ctx.ellipse(16, 18, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(15, 17, 2, 1);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 14, 2, 2);
        ctx.fillRect(18, 14, 2, 2);

        this.addOutline(ctx, cvs);
        return cvs;
    }

    private createPolarBear(): HTMLCanvasElement {
        return this.createBear('#fff');
    }

    private createYeti(): HTMLCanvasElement {
        const cvs = this.createCanvas(48, 48); // Bigger canvas
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(24, 44, 14, 4, 0, 0, Math.PI * 2); ctx.fill();

        const FUR = '#eeeeee';
        const SKIN = '#90caf9'; // Blueish skin

        ctx.fillStyle = FUR;
        // Massive Body
        ctx.beginPath(); ctx.ellipse(24, 28, 16, 18, 0, 0, Math.PI * 2); ctx.fill();

        // Arms (Long)
        ctx.fillRect(4, 20, 6, 20);
        ctx.fillRect(38, 20, 6, 20);

        // Legs (Short)
        ctx.fillRect(14, 40, 8, 6);
        ctx.fillRect(26, 40, 8, 6);

        // Head
        ctx.beginPath(); ctx.arc(24, 14, 10, 0, Math.PI * 2); ctx.fill();

        // Face
        ctx.fillStyle = SKIN;
        ctx.beginPath(); ctx.ellipse(24, 16, 6, 5, 0, 0, Math.PI * 2); ctx.fill();

        // Eyes
        ctx.fillStyle = '#d32f2f'; // Red angry eyes
        ctx.fillRect(21, 14, 2, 2);
        ctx.fillRect(25, 14, 2, 2);

        this.addOutline(ctx, cvs);
        return cvs;
    }

    private createScorpion(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(16, 24, 10, 3, 0, 0, Math.PI * 2); ctx.fill();

        const SHELL = '#e65100'; // Orange
        const LEGS = '#bf360c';

        ctx.fillStyle = SHELL;
        // Body
        ctx.beginPath(); ctx.ellipse(16, 20, 6, 8, 0, 0, Math.PI * 2); ctx.fill();

        // Tail
        ctx.strokeStyle = LEGS;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(16, 12);
        ctx.quadraticCurveTo(16, 4, 24, 8);
        ctx.stroke();
        // Stinger
        ctx.fillStyle = '#ff0000';
        ctx.beginPath(); ctx.arc(24, 8, 2, 0, Math.PI * 2); ctx.fill();

        // Claws
        ctx.fillStyle = LEGS;
        ctx.beginPath(); ctx.arc(8, 14, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(24, 14, 3, 0, Math.PI * 2); ctx.fill();

        // Legs lines
        ctx.strokeStyle = LEGS;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 20); ctx.lineTo(4, 18);
        ctx.moveTo(10, 22); ctx.lineTo(4, 24);
        ctx.moveTo(22, 20); ctx.lineTo(28, 18);
        ctx.moveTo(22, 22); ctx.lineTo(28, 24);
        ctx.stroke();

        this.addOutline(ctx, cvs);
        return cvs;
    }

    private createSnake(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(16, 26, 8, 2, 0, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#388e3c'; // Green
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(20, 26);
        ctx.lineTo(12, 26); // Tail coil
        ctx.lineTo(10, 22);
        ctx.lineTo(16, 18); // Body up
        ctx.lineTo(18, 14); // Head pos
        ctx.stroke();

        // Head
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath(); ctx.ellipse(19, 13, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

        // Tongue
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(22, 13, 3, 1);

        this.addOutline(ctx, cvs);
        return cvs;
    }

    private createSpider(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(16, 22, 10, 3, 0, 0, Math.PI * 2); ctx.fill();

        const BODY = '#3e2723';

        ctx.fillStyle = BODY;
        // Abdomen
        ctx.beginPath(); ctx.ellipse(16, 18, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
        // Head
        ctx.beginPath(); ctx.ellipse(16, 24, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 1;

        // Legs (8)
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(16, 20);
            const xDir = i < 2 ? -1 : 1;
            const yOff = (i % 2) * 6;
            ctx.quadraticCurveTo(16 + (xDir * 8), 10 + yOff, 16 + (xDir * 14), 16 + yOff);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(16, 20);
            ctx.quadraticCurveTo(16 + (xDir * 8), 24 + yOff, 16 + (xDir * 14), 30 + (i % 2) * 2);
            ctx.stroke();
        }

        // Eyes (Red dots)
        ctx.fillStyle = '#f00';
        ctx.fillRect(15, 24, 1, 1);
        ctx.fillRect(17, 24, 1, 1);

        this.addOutline(ctx, cvs);
        return cvs;
    }
    createStonePillar(): HTMLCanvasElement {
        const cvs = document.createElement('canvas');
        cvs.width = 32; cvs.height = 32;
        const ctx = cvs.getContext('2d')!;

        // Base/Bottom
        ctx.fillStyle = '#333';
        ctx.fillRect(8, 20, 16, 8);

        // Shaft
        const grad = ctx.createLinearGradient(8, 0, 24, 0);
        grad.addColorStop(0, '#555');
        grad.addColorStop(0.5, '#888');
        grad.addColorStop(1, '#555');
        ctx.fillStyle = grad;
        ctx.fillRect(10, 4, 12, 20);

        // Top Capital
        ctx.fillStyle = '#666';
        ctx.fillRect(8, 2, 16, 4);

        // Details
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(12, 6, 2, 14);
        ctx.fillRect(18, 6, 2, 14);

        return cvs;
    }
    createStairs(up: boolean): HTMLCanvasElement {
        const cvs = document.createElement('canvas');
        cvs.width = 32; cvs.height = 32;
        const ctx = cvs.getContext('2d')!;

        // Base Floor
        ctx.fillStyle = '#795548'; // Brown earth
        ctx.fillRect(0, 0, 32, 32);

        // Steps
        const count = 4;
        const stepH = 32 / count;

        ctx.fillStyle = '#a1887f'; // Lighter brown wood/stone steps

        for (let i = 0; i < count; i++) {
            const y = i * stepH;
            // Shade
            ctx.fillStyle = i % 2 === 0 ? '#8d6e63' : '#a1887f';
            ctx.fillRect(4, y, 24, stepH);
        }

        // Direction Indicator
        ctx.fillStyle = '#000';
        ctx.font = '20px monospace';
        ctx.fillText(up ? 'UP' : 'DN', 4, 24);

        return cvs;
    }

    private createMeat(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#b71c1c'; // Dark red
        ctx.beginPath(); ctx.ellipse(16, 16, 10, 6, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; // Bone
        ctx.fillRect(8, 14, 4, 4);
        return cvs;
    }

    private createPavementLight(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, 32, 32);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(2, 2, 28, 28);
        return cvs;
    }

    private createWhiteWall(type: 'V' | 'H' | 'TL' | 'TR' | 'BL' | 'BR'): HTMLCanvasElement {
        // Enforce 32x64 for Tall Walls (Global Rules)
        const cvs = this.createCanvas(32, 64);
        const ctx = cvs.getContext('2d')!;
        const BASE = '#f0f0f0';
        const SHADE = '#cccccc';
        const LINE = '#aaaaaa';

        ctx.fillStyle = BASE;

        // Draw centered in the 32x64 space (or bottom aligned)
        // Renderer aligns bottom of sprite to TILE_SIZE.
        // So y=32 is "ground level" for the top of the wall? 
        // No, y=64 is bottom. y=32 is where a 32px high wall top would be.
        // A 64px tall wall goes from y=0 to y=64.

        if (type === 'V') {
            // Vertical Wall (Tall)
            ctx.fillRect(10, 0, 12, 64);
            ctx.fillStyle = SHADE; ctx.fillRect(10, 0, 2, 64);
            ctx.strokeStyle = LINE; ctx.strokeRect(10, 0, 12, 64);
        } else if (type === 'H') {
            // Horizontal Wall (Tall or Short?)
            // Usually walls are tall.
            ctx.fillRect(0, 10, 32, 54); // Fill down to bottom
            ctx.fillStyle = SHADE; ctx.fillRect(0, 10, 32, 2);
            ctx.strokeStyle = LINE; ctx.strokeRect(0, 10, 32, 54);

            // Add top detail (battlement?)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 32, 10);
            ctx.strokeRect(0, 0, 32, 10);
        } else {
            // Corner logic
            // Draw a full height pillar for corners
            ctx.fillRect(10, 0, 12, 64);

            // Add side connections
            if (type.includes('L')) ctx.fillRect(0, 10, 10, 54);
            if (type.includes('R')) ctx.fillRect(22, 10, 10, 54);

            ctx.strokeStyle = LINE;
            ctx.strokeRect(10, 0, 12, 64); // Vertical Pillar outline
        }
        return cvs;
    }

    private createFountain(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#aaa';
        ctx.beginPath(); ctx.arc(16, 16, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#44f';
        ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(15, 15, 2, 2);
        return cvs;
    }

    private createMagicFieldBlue(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
        grad.addColorStop(0, 'rgba(0, 0, 255, 0.8)');
        grad.addColorStop(1, 'rgba(0, 0, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
        return cvs;
    }

    private createFloorCheckered(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 16, 16); ctx.fillRect(16, 16, 16, 16);
        ctx.fillStyle = '#fff'; ctx.fillRect(16, 0, 16, 16); ctx.fillRect(0, 16, 16, 16);
        return cvs;
    }

    private createFloorStone(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#888'; ctx.fillRect(0, 0, 32, 32);
        ctx.strokeStyle = '#666'; ctx.strokeRect(1, 1, 30, 30);
        return cvs;
    }

    private createFloorWood(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#5d4037'; ctx.fillRect(0, 0, 32, 32);
        ctx.strokeStyle = '#3e2723';
        for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i * 8, 0); ctx.lineTo(i * 8, 32); ctx.stroke(); }
        return cvs;
    }

    private createStreetLamp(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 64);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#333'; ctx.fillRect(14, 10, 4, 50); // Pole
        ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(16, 15, 6, 0, Math.PI * 2); ctx.fill(); // Glow
        ctx.strokeStyle = '#333'; ctx.strokeRect(10, 10, 12, 10); // Glass frame
        return cvs;
    }

    private createKnightStatue(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 48);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#aaa'; ctx.fillRect(8, 32, 16, 16); // Plinth
        ctx.fillStyle = '#ccc'; ctx.fillRect(10, 10, 12, 22); // Body
        ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(16, 8, 5, 0, Math.PI * 2); ctx.fill(); // Head
        return cvs;
    }

    private createTrashCan(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#5d4037'; ctx.fillRect(8, 8, 16, 20);
        ctx.strokeStyle = '#3e2723'; ctx.strokeRect(8, 8, 16, 20);
        return cvs;
    }

    private createPottedFlower(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#a1887f'; ctx.fillRect(10, 20, 12, 10); // Pot
        ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(16, 14, 4, 0, Math.PI * 2); ctx.fill(); // Flower
        ctx.fillStyle = '#0a0'; ctx.fillRect(15, 18, 2, 4); // Stem
        return cvs;
    }

    private createLocker(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#555'; ctx.fillRect(4, 4, 24, 24);
        ctx.strokeStyle = '#333'; ctx.strokeRect(4, 4, 24, 24);
        ctx.fillStyle = '#777'; ctx.fillRect(8, 8, 16, 4); // Slot
        return cvs;
    }

    private createBankSafe(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#222'; ctx.fillRect(2, 2, 28, 28);
        ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2; ctx.strokeRect(2, 2, 28, 28);
        ctx.beginPath(); ctx.arc(16, 16, 6, 0, Math.PI * 2); ctx.stroke(); // Dial
        return cvs;
    }

    private createBooks(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        const colors = ['#f00', '#00f', '#0a0', '#ff0'];
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i]; ctx.fillRect(4 + i * 6, 10, 5, 20);
        }
        return cvs;
    }

    private createBlackboard(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#222'; ctx.fillRect(2, 6, 28, 20);
        ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 2; ctx.strokeRect(2, 6, 28, 20);
        ctx.fillStyle = '#fff'; ctx.font = '8px Arial'; ctx.fillText('E=mc^2', 6, 18);
        return cvs;
    }

    private createArchway(): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, 32, 32);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(16, 24, 12, Math.PI, 0); ctx.lineTo(28, 32); ctx.lineTo(4, 32); ctx.closePath(); ctx.fill();
        return cvs;
    }

    // Renamed to avoid overlap
    private createDoorEdron(locked: boolean, orientation: 'H' | 'V'): HTMLCanvasElement {
        const cvs = this.createCanvas(32, 32);
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#5d4037';
        if (orientation === 'H') ctx.fillRect(0, 10, 32, 12);
        else ctx.fillRect(10, 0, 12, 32);
        if (locked) { ctx.fillStyle = '#ff0'; ctx.fillRect(14, 14, 4, 4); }
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




