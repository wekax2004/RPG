"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };

  // src/constants.ts
  var SPRITES;
  var init_constants = __esm({
    "src/constants.ts"() {
      "use strict";
      ((SPRITES2) => {
        SPRITES2.GRASS = 10;
        SPRITES2.GRASS_FLOWERS = 16;
        SPRITES2.DIRT = 11;
        SPRITES2.COBBLE = 12;
        SPRITES2.WATER = 13;
        SPRITES2.FLOOR_WOOD = 14;
        SPRITES2.FLOOR_STONE = 15;
        SPRITES2.WALL = 21;
        SPRITES2.STONE_WALL = 17;
        SPRITES2.BARREL = 30;
        SPRITES2.CRATE = 31;
        SPRITES2.TORCH = 32;
        SPRITES2.BACKPACK = 22;
        SPRITES2.GOLD = 40;
        SPRITES2.POTION = 41;
        SPRITES2.MANA_POTION = 86;
        SPRITES2.SHOVEL = 124;
        SPRITES2.ROPE = 65;
        SPRITES2.MACHETE = 43;
        SPRITES2.PICKAXE = 66;
        SPRITES2.HOLE = 125;
        SPRITES2.ROPE_SPOT = 126;
        SPRITES2.SWORD = 42;
        SPRITES2.ARMOR = 43;
        SPRITES2.LEGS = 45;
        SPRITES2.SHIELD = 46;
        SPRITES2.GOLDEN_HELMET = 100;
        SPRITES2.GOLDEN_ARMOR = 101;
        SPRITES2.GOLDEN_LEGS = 102;
        SPRITES2.GOLDEN_BOOTS = 103;
        SPRITES2.GOLDEN_SHIELD = 104;
        SPRITES2.ELF_ICICLE_BOW = 110;
        SPRITES2.ELF_ARMOR = 111;
        SPRITES2.ELF_LEGS = 112;
        SPRITES2.ELF_BOOTS = 113;
        SPRITES2.DWARF_HELMET = 120;
        SPRITES2.DWARF_ARMOR = 121;
        SPRITES2.DWARF_LEGS = 122;
        SPRITES2.DWARF_SHIELD = 123;
        SPRITES2.AXE = 130;
        SPRITES2.CLUB = 131;
        SPRITES2.TREE_PINE = 50;
        SPRITES2.TREE_OAK = 51;
        SPRITES2.ROCK_LARGE = 6;
        SPRITES2.GEM_RUBY = 203;
        SPRITES2.GEM_SAPPHIRE = 204;
        SPRITES2.WALL_STONE_V = 210;
        SPRITES2.WALL_STONE_H = 211;
        SPRITES2.WALL_STONE_NW = 215;
        SPRITES2.WALL_STONE_NE = 216;
        SPRITES2.WALL_STONE_SW = 217;
        SPRITES2.WALL_STONE_SE = 218;
        SPRITES2.FLOOR_DIRT = 11;
        SPRITES2.FLOOR_GRASS_VAR = 16;
        SPRITES2.CUSTOM_GRASS_FLOWERS = 300;
        SPRITES2.CUSTOM_SAND = 301;
        SPRITES2.CUSTOM_WOOD_FENCE = 302;
        SPRITES2.CUSTOM_DRAGON_HATCHLING = 303;
        SPRITES2.CUSTOM_WATER = 304;
        SPRITES2.CUSTOM_DIRT_PATH = 305;
        SPRITES2.CUSTOM_DOOR_WOODEN = 306;
        SPRITES2.PLAYER = 199;
        SPRITES2.TREE = 50;
        SPRITES2.OAK_TREE = 51;
        SPRITES2.ROCK = 6;
        SPRITES2.RAT = 200;
        SPRITES2.WOLF = 201;
        SPRITES2.SKELETON = 202;
        SPRITES2.SLIME = 203;
        SPRITES2.ORC = 9;
        SPRITES2.ORC_PEON = 252;
        SPRITES2.ORC_WARLORD = 253;
        SPRITES2.DWARF_GUARD = 251;
        SPRITES2.DWARF_MINER = 254;
        SPRITES2.DWARF_GEOMANCER = 255;
        SPRITES2.NPC_MERCHANT = 260;
        SPRITES2.NPC_HEALER = 261;
        SPRITES2.NPC_GUIDE = 262;
        SPRITES2.NPC = 262;
        SPRITES2.CORPSE = 299;
      })(SPRITES || (SPRITES = {}));
    }
  });

  // src/data/sprites_map.ts
  var sprites_map_exports = {};
  __export(sprites_map_exports, {
    SPRITE_MAP: () => SPRITE_MAP,
    SPRITE_SHEET_BASE_PATH: () => SPRITE_SHEET_BASE_PATH
  });
  var SPRITE_MAP, SPRITE_SHEET_BASE_PATH;
  var init_sprites_map = __esm({
    "src/data/sprites_map.ts"() {
      "use strict";
      init_constants();
      SPRITE_MAP = {
        // --- PLAYER (Placeholder: Dwarf Miner) ---
        // [SPRITES.PLAYER]: { file: '/sprites/dwarf_sprites.png', x: 0, y: 0, width: 32, height: 32 },
        // --- ORCS ---
        [SPRITES.ORC]: { file: "/sprites/orc_sprites.png", x: 32, y: 0, width: 32, height: 32 },
        // Warrior
        [SPRITES.ORC_PEON]: { file: "/sprites/orc_sprites.png", x: 0, y: 0, width: 32, height: 32 },
        // Peon
        [SPRITES.ORC_WARLORD]: { file: "/sprites/orc_sprites.png", x: 64, y: 0, width: 32, height: 32 },
        // Warlord
        // --- DWARVES ---
        [SPRITES.DWARF_MINER]: { file: "/sprites/dwarf_sprites.png", x: 0, y: 0, width: 32, height: 32 },
        [SPRITES.DWARF_GUARD]: { file: "/sprites/dwarf_sprites.png", x: 32, y: 0, width: 32, height: 32 },
        [SPRITES.DWARF_GEOMANCER]: { file: "/sprites/dwarf_sprites.png", x: 64, y: 0, width: 32, height: 32 },
        // --- DRAGONS ---
        [SPRITES.CUSTOM_DRAGON_HATCHLING]: { file: "/sprites/dragon_sprites.png", x: 32, y: 32, width: 32, height: 32 },
        // Middle (Small)
        // Need to check Dragon constants to map Big Dragons if they exist
        // --- WEAPONS (Basic) ---
        [SPRITES.SWORD]: { file: "/sprites/items_basic.png", x: 0, y: 0, width: 32, height: 32 },
        [SPRITES.AXE]: { file: "/sprites/items_basic.png", x: 32, y: 0, width: 32, height: 32 },
        [SPRITES.CLUB]: { file: "/sprites/items_basic.png", x: 64, y: 0, width: 32, height: 32 },
        [SPRITES.SHIELD]: { file: "/sprites/items_basic.png", x: 96, y: 0, width: 32, height: 32 },
        // Wooden Shield
        // --- WALLS (Stone) ---
        [SPRITES.WALL_STONE_NW]: { file: "/sprites/terrain_batch_1.png", x: 0, y: 0, width: 32, height: 32 },
        // Vertical? (Using batch 1 layout guess)
        [SPRITES.WALL_STONE_H]: { file: "/sprites/terrain_batch_1.png", x: 32, y: 0, width: 32, height: 32 },
        // Horizontal?
        [SPRITES.WALL_STONE_NE]: { file: "/sprites/terrain_batch_1.png", x: 0, y: 0, width: 32, height: 32 },
        // Placeholder
        [SPRITES.WALL_STONE_V]: { file: "/sprites/terrain_batch_1.png", x: 0, y: 0, width: 32, height: 32 },
        // Vertical
        [SPRITES.WALL_STONE_SW]: { file: "/sprites/terrain_batch_1.png", x: 0, y: 0, width: 32, height: 32 },
        // Placeholder
        [SPRITES.WALL_STONE_SE]: { file: "/sprites/terrain_batch_1.png", x: 0, y: 0, width: 32, height: 32 },
        // Placeholder
        // --- ARMOR (Plate & Golden) ---
        [SPRITES.ARMOR]: { file: "/sprites/armor_icons.png", x: 0, y: 0, width: 32, height: 32 },
        // Plate Armor
        [SPRITES.LEGS]: { file: "/sprites/armor_icons.png", x: 32, y: 0, width: 32, height: 32 },
        // Plate Legs
        [SPRITES.DWARF_HELMET]: { file: "/sprites/armor_icons.png", x: 64, y: 0, width: 32, height: 32 },
        // Steel Helmet
        [SPRITES.GOLDEN_ARMOR]: { file: "/sprites/armor_icons.png", x: 96, y: 0, width: 32, height: 32 },
        [SPRITES.GOLDEN_LEGS]: { file: "/sprites/armor_icons.png", x: 128, y: 0, width: 32, height: 32 },
        [SPRITES.GOLDEN_HELMET]: { file: "/sprites/armor_icons.png", x: 160, y: 0, width: 32, height: 32 },
        // --- RARE WEAPONS ---
        // [SPRITES.GIANT_SWORD] ... need constants for these
        // Fallbacks for others
        [SPRITES.RAT]: { file: "/sprites/dwarf_sprites.png", x: 0, y: 0, width: 32, height: 32 },
        // Placeholder
        [SPRITES.WOLF]: { file: "/sprites/orc_sprites.png", x: 0, y: 0, width: 32, height: 32 }
        // Placeholder
        // [SPRITES.COBBLE]: { file: '/sprites/terrain_batch_1.png', x: 128, y: 0, width: 32, height: 32 }, // Cobble (from Batch 1)
        // [SPRITES.FLOOR_STONE]: { file: '/sprites/terrain_batch_1.png', x: 128, y: 0, width: 32, height: 32 }, // Reuse cobble
        // [SPRITES.DIRT]: { file: '/sprites/terrain_batch_1.png', x: 160, y: 0, width: 32, height: 32 }, // Dirt (from Batch 1)
      };
      SPRITE_SHEET_BASE_PATH = "";
    }
  });

  // src/assets.ts
  init_sprites_map();
  init_constants();
  var AssetManager = class {
    images = {};
    loadedImages = {};
    loadPromises = [];
    sheetCache = {};
    // Bayer 4x4 Ordered Dithering Matrix (Tibia-style pixel art)
    ditherMatrix = [
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
      const uniqueFiles = /* @__PURE__ */ new Set();
      Object.values(SPRITE_MAP).forEach((def) => uniqueFiles.add(def.file));
      const sheetMap = /* @__PURE__ */ new Map();
      await Promise.all(Array.from(uniqueFiles).map(async (file) => {
        try {
          const cvs = await this.loadExternalImage(file);
          sheetMap.set(file, cvs);
        } catch (e) {
          console.warn(`[AssetManager] Failed to load sheet: ${file}`);
        }
      }));
      Object.entries(SPRITE_MAP).forEach(([key, def]) => {
        const id = parseInt(key);
        const sheet = sheetMap.get(def.file);
        if (sheet) {
          const cvs = this.createCanvas(def.width, def.height);
          const ctx = cvs.getContext("2d");
          ctx.drawImage(sheet, def.x, def.y, def.width, def.height, 0, 0, def.width, def.height);
          this.images[id] = cvs;
        }
      });
      console.log(`[AssetManager] Loaded ${Object.keys(SPRITE_MAP).length} external sprites.`);
    }
    // Check if pixel should be dithered based on position and threshold
    shouldDither(x, y, threshold) {
      return this.ditherMatrix[y % 4][x % 4] < threshold;
    }
    // Load external image and convert to canvas
    loadExternalImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const cvs = document.createElement("canvas");
          cvs.width = img.width;
          cvs.height = img.height;
          const ctx = cvs.getContext("2d");
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
      this.images[10] = this.createGrass(0);
      this.images[16] = this.createGrass(1);
      this.images[11] = this.createDirt();
      this.images[12] = this.createCobble();
      this.images[13] = this.createWater();
      this.images[14] = this.createWoodFloor();
      this.images[15] = this.createStoneFloor();
      this.images[21] = this.createWall();
      this.images[17] = this.createWall();
      this.images[50] = this.createTree();
      this.images[5] = this.images[50];
      this.images[6] = this.createRock();
      this.images[30] = this.createBarrel();
      this.images[31] = this.createCrate();
      this.images[32] = this.createTorch();
      this.images[40] = this.createGold();
      this.images[41] = this.createPotion();
      this.images[42] = this.createSword();
      this.images[46] = this.createShield();
      this.images[22] = this.createBackpack();
      this.images[21] = this.createBackpack();
      this.images[130] = this.createAxe("hand");
      this.images[131] = this.createAxe("battle");
      this.images[120] = this.createHelmet();
      this.images[122] = this.createLegs();
      this.images[200] = this.createRat();
      this.images[201] = this.createWolf();
      this.images[202] = this.createSkeleton();
      this.images[203] = this.createSlime();
      this.images[202] = this.createSkeleton();
      this.images[13] = this.createWater();
      this.images[14] = this.createWoodFloor();
      this.images[15] = this.createStoneFloor();
      this.images[30] = this.createBarrel();
      this.images[31] = this.createCrate();
      this.images[32] = this.createTorch();
      this.images[40] = this.createGold();
      this.images[41] = this.createPotion();
      this.images[42] = this.createSword();
      this.images[22] = this.createBackpack();
      this.images[21] = this.createBackpack();
      this.images[199] = this.createPlayer();
      this.images[299] = this.createCorpse();
      this.images[100] = this.createHelmetGen("#ffd700", "#fff");
      this.images[101] = this.createArmorPlate("#ffd700", "#fff");
      this.images[102] = this.createLegsPlate("#ffd700");
      this.images[103] = this.createBoots("#ffd700");
      this.images[104] = this.createShieldGen("#ffd700", "#fff");
      this.images[110] = this.createBow();
      this.images[111] = this.createArmorPlate("#4caf50", "#8bc34a");
      this.images[112] = this.createLegsPlate("#4caf50");
      this.images[121] = this.createArmorPlate("#795548", "#5d4037");
      this.images[123] = this.createShieldGen("#795548", "#5d4037");
      this.images[132] = this.createAxe("battle");
      this.images[133] = this.createAxe("battle");
      this.images[134] = this.createAxe("battle");
      this.images[140] = this.createClub("#8d6e63", false);
      this.images[141] = this.createClub("#757575", true);
      this.images[142] = this.createClub("#424242", false);
      this.images[143] = this.createClub("#212121", true);
      this.images[150] = this.createSwordGen("#8d6e63", "#5d4037", false);
      this.images[151] = this.createSwordGen("#a1887f", "#795548", false);
      this.images[152] = this.createSwordGen("#e0e0e0", "#9e9e9e", true);
      this.images[153] = this.createSwordGen("#fff9c4", "#fbc02d", true);
      this.images[154] = this.createSwordGen("#b0bec5", "#607d8b", true);
      this.images[155] = this.createSwordGen("#ffcdd2", "#c62828", true);
      this.images[156] = this.createSwordGen("#e1bee7", "#8e24aa", true);
      this.images[157] = this.createSwordGen("#c8e6c9", "#388e3c", false);
      this.images[160] = this.createArmorPlate("#bcaaa4", "#8d6e63");
      this.images[161] = this.createArmorPlate("#795548", "#4e342e");
      this.images[162] = this.createArmorPlate("#a1887f", "#5d4037");
      this.images[163] = this.createHelmetGen("#9e9e9e", "#000");
      this.images[164] = this.createHelmetGen("#5d4037", "#3e2723");
      this.images[165] = this.createHelmetGen("#ffd700", "#f44336");
      this.images[166] = this.createShieldGen("#c62828", "#ffd700");
      this.images[167] = this.createShieldGen("#5d4037", "#9e9e9e");
      this.images[210] = this.createTool("shovel");
      this.images[211] = this.createTool("rope");
      this.images[212] = this.createTool("machete");
      this.images[213] = this.createTool("pickaxe");
      this.images[203] = this.createGem("#f44336");
      this.images[204] = this.createGem("#2196f3");
      this.images[172] = this.createGem("#eee");
      this.images[260] = this.createNPC("#4a3070", "#8a60a0");
      this.images[261] = this.createNPC("#ffffff", "#a0d0f0");
      this.images[262] = this.createNPC("#306030", "#60a060");
      console.log(`[AssetManager] NPC Sprites: 260=${this.images[260]?.width}x${this.images[260]?.height}, 261=${this.images[261]?.width}x${this.images[261]?.height}, 262=${this.images[262]?.width}x${this.images[262]?.height}`);
      console.log(`[AssetManager] Forged ${Object.keys(this.images).length} Tibia-quality procedural assets.`);
      this.loadExternalSprites();
    }
    async loadExternalSprites() {
      console.log("[AssetManager] Loading external Tibia sprites...");
      try {
        try {
          const grass1 = await this.loadExternalImage("/grass1.png");
          const grass2 = await this.loadExternalImage("/grass2.png");
          const grass3 = await this.loadExternalImage("/grass3.png");
          const rock = await this.loadExternalImage("/rock.png");
          this.images[10] = grass1;
          this.images[16] = grass2;
          this.images[161] = grass3;
          this.images[6] = rock;
        } catch (ignore) {
        }
        const { SPRITE_MAP: SPRITE_MAP2, SPRITE_SHEET_BASE_PATH: SPRITE_SHEET_BASE_PATH2 } = await Promise.resolve().then(() => (init_sprites_map(), sprites_map_exports));
        const sheetGroups = {};
        for (const [idStr, def] of Object.entries(SPRITE_MAP2)) {
          if (!sheetGroups[def.file]) sheetGroups[def.file] = [];
          sheetGroups[def.file].push(Number(idStr));
        }
        for (const [file, ids] of Object.entries(sheetGroups)) {
          const url = SPRITE_SHEET_BASE_PATH2 + file;
          try {
            let img = this.sheetCache[file];
            if (!img) {
              img = await this.loadImageElement(url);
              this.sheetCache[file] = img;
            }
            for (const id of ids) {
              const def = SPRITE_MAP2[id];
              const spriteCvs = this.createCanvas(def.width, def.height);
              const ctx = spriteCvs.getContext("2d");
              ctx.imageSmoothingEnabled = false;
              let sx = def.x;
              let sy = def.y;
              let sw = def.width;
              let sh = def.height;
              const isLegacyNature = id === 50 || id === 51 || id === 6;
              if ((id >= 300 || isLegacyNature) && def.x === 0 && def.y === 0 && img.width >= 128 && img.height >= 128) {
                sx = 0;
                sy = 0;
                sw = img.width;
                sh = img.height;
                ctx.imageSmoothingEnabled = true;
              }
              ctx.drawImage(img, sx, sy, sw, sh, 0, 0, def.width, def.height);
              const imageData = ctx.getImageData(0, 0, def.width, def.height);
              const data = imageData.data;
              const w = def.width;
              const h = def.height;
              const bgR = data[0];
              const bgG = data[1];
              const bgB = data[2];
              const bgA = data[3];
              const shouldFill = id >= 300 || isLegacyNature;
              if (shouldFill) {
                if (bgA > 200) {
                  const visited = new Int8Array(w * h);
                  const queue = [0];
                  const TOL = 40;
                } else {
                  console.warn(`[AssetDebug] SKIPPING Flood Fill for ID ${id}. BG Alpha too low? (${bgA}) or Color: ${bgR},${bgG},${bgB}`);
                }
              }
              if (shouldFill && bgA > 200) {
                const visited = new Int8Array(w * h);
                const queue = [0];
                const TOL = 40;
                while (queue.length > 0) {
                  const idx = queue.pop();
                  if (visited[idx]) continue;
                  visited[idx] = 1;
                  const px = idx % w;
                  const py = Math.floor(idx / w);
                  const dataIdx = idx * 4;
                  const r = data[dataIdx];
                  const g = data[dataIdx + 1];
                  const b = data[dataIdx + 2];
                  if (Math.abs(r - bgR) < TOL && Math.abs(g - bgG) < TOL && Math.abs(b - bgB) < TOL) {
                    data[dataIdx + 3] = 0;
                    if (px > 0) queue.push(idx - 1);
                    if (px < w - 1) queue.push(idx + 1);
                    if (py > 0) queue.push(idx - w);
                    if (py < h - 1) queue.push(idx + w);
                  }
                }
              }
              for (let i = 0; i < data.length; i += 4) {
                if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 255) {
                  data[i + 3] = 0;
                }
              }
              ctx.putImageData(imageData, 0, 0);
              this.images[id] = spriteCvs;
            }
          } catch (e) {
            console.error(`[AssetManager] FAILED to process sprite ${file} for IDs: ${ids}`, e);
          }
        }
        console.log("[AssetManager] Successfully upgraded to external Tibia sprites!");
        await this.loadAISprites();
      } catch (e) {
        console.warn("[AssetManager] External load failed, satisfying with procedural assets.", e);
      }
    }
    // Load high-quality AI-generated sprites
    async loadAISprites() {
      const aiSprites = {
        // NPCs
        260: "/sprites/npc_merchant.png",
        261: "/sprites/npc_healer.png",
        262: "/sprites/npc_guide.png",
        // Orcs
        9: "/sprites/orc_warrior.png",
        252: "/sprites/orc_peon.png",
        253: "/sprites/orc_warlord.png"
      };
      for (const [idStr, url] of Object.entries(aiSprites)) {
        const id = parseInt(idStr);
        try {
          const img = await this.loadImageElement(url);
          const w = 32;
          const h = 64;
          const cvs = this.createCanvas(w, h);
          const ctx = cvs.getContext("2d");
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (r > 200 && g < 100 && b > 200) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imageData, 0, 0);
          this.images[id] = cvs;
          console.log(`[AssetManager] Loaded AI sprite ${id} (${w}x${h})`);
        } catch (e) {
          console.warn(`[AssetManager] Failed to load AI sprite ${id}: ${url}`, e);
        }
      }
    }
    loadImageElement(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load ${url}`));
        img.src = url;
      });
    }
    getSprite(id) {
      if (id === 51 && Math.random() < 0.01) {
        const s = this.images[id];
        console.log(`[AssetDebug] Tree(51):`, s ? `${s.width}x${s.height}` : "MISSING");
      }
      return this.images[id] || this.images[10];
    }
    getSpriteSource(id) {
      const cvs = this.getSprite(id);
      return { image: cvs, sx: 0, sy: 0, sw: cvs.width, sh: cvs.height };
    }
    getSpriteRect(id) {
      const cvs = this.getSprite(id);
      return { x: 0, y: 0, w: cvs.width, h: cvs.height };
    }
    // =========================================================
    // TIBIA-QUALITY GRASS (Ordered Dithering)
    // =========================================================
    createGrass(variant) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const BASE = variant === 0 ? "#4caf50" : "#43a047";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, 32, 32);
      for (let i = 0; i < 128; i++) {
        const x = Math.random() * 32;
        const y = Math.random() * 32;
        ctx.fillStyle = Math.random() > 0.5 ? "#66bb6a" : "#2e7d32";
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.strokeStyle = "#81c784";
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
    createDirt() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const BASE = "#5d4037";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, 32, 32);
      for (let i = 0; i < 128; i++) {
        const x = Math.random() * 32;
        const y = Math.random() * 32;
        ctx.fillStyle = Math.random() > 0.5 ? "#795548" : "#4e342e";
        ctx.fillRect(x, y, 1, 1);
      }
      return cvs;
    }
    // =========================================================
    // TIBIA-QUALITY COBBLESTONE
    // =========================================================
    createCobble() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const DARK = "#4a4a4a";
      const MID = "#6a6a6a";
      const LIGHT = "#8a8a8a";
      const MORTAR = "#3a3a3a";
      ctx.fillStyle = MORTAR;
      ctx.fillRect(0, 0, 32, 32);
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const x = col * 8 + row % 2 * 4;
          const y = row * 8;
          ctx.fillStyle = MID;
          ctx.fillRect(x + 1, y + 1, 6, 6);
          ctx.fillStyle = LIGHT;
          ctx.fillRect(x + 1, y + 1, 5, 1);
          ctx.fillRect(x + 1, y + 1, 1, 5);
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
    createCobble() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const BASE = "#757575";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, 32, 32);
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * 32;
        const y = Math.random() * 32;
        const shade = Math.random();
        if (shade < 0.33) ctx.fillStyle = "#616161";
        else if (shade < 0.66) ctx.fillStyle = "#9e9e9e";
        else ctx.fillStyle = "#424242";
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.strokeStyle = "#505050";
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * 24;
        const y = Math.random() * 24;
        ctx.strokeRect(x, y, 6, 6);
      }
      return cvs;
    }
    // TIBIA-QUALITY WALL (2.5D with detailed bricks)
    // =========================================================
    createWall() {
      const cvs = this.createCanvas(32, 64);
      const ctx = cvs.getContext("2d");
      const LID_LIGHT = "#aaaaaa";
      const LID_MID = "#888899";
      const LID_DARK = "#666677";
      const FACE_BASE = "#555566";
      const BRICK_LIGHT = "#666677";
      const BRICK_DARK = "#444455";
      const MORTAR = "#333344";
      ctx.fillStyle = LID_MID;
      ctx.fillRect(0, 0, 32, 20);
      ctx.fillStyle = LID_LIGHT;
      ctx.fillRect(0, 0, 32, 3);
      ctx.fillStyle = LID_DARK;
      ctx.fillRect(0, 17, 32, 3);
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
      ctx.fillStyle = FACE_BASE;
      ctx.fillRect(0, 20, 32, 44);
      for (let row = 0; row < 5; row++) {
        const y = 22 + row * 8;
        const offset = row % 2 * 8;
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
      ctx.fillStyle = "#111122";
      ctx.fillRect(0, 0, 32, 1);
      ctx.fillRect(0, 63, 32, 1);
      return cvs;
    }
    // =========================================================
    // TIBIA-QUALITY PLAYER (Red Knight with outline)
    // =========================================================
    createPlayer() {
      const cvs = this.createCanvas(32, 64);
      const ctx = cvs.getContext("2d");
      const OUTLINE = "#000000";
      const HELMET = "#707080";
      const HELMET_LIGHT = "#909090";
      const HELMET_DARK = "#505060";
      const TUNIC = "#aa2020";
      const TUNIC_DARK = "#801010";
      const CROSS = "#e0e0e0";
      const LEGS = "#404040";
      const LEGS_LIGHT = "#606060";
      const SKIN = "#d0a080";
      const SWORD = "#a0a0b0";
      const HILT = "#c0a020";
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(16, 60, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = LEGS;
      ctx.fillRect(9, 48, 6, 14);
      ctx.fillRect(17, 48, 6, 14);
      ctx.fillStyle = LEGS_LIGHT;
      ctx.fillRect(9, 48, 2, 14);
      ctx.fillRect(17, 48, 2, 14);
      ctx.fillStyle = TUNIC;
      ctx.fillRect(7, 26, 18, 22);
      ctx.fillStyle = TUNIC_DARK;
      ctx.fillRect(7, 40, 18, 8);
      ctx.fillStyle = CROSS;
      ctx.fillRect(14, 28, 4, 18);
      ctx.fillRect(9, 34, 14, 4);
      ctx.fillStyle = HELMET;
      ctx.fillRect(9, 12, 14, 14);
      ctx.fillStyle = HELMET_LIGHT;
      ctx.fillRect(9, 12, 14, 3);
      ctx.fillRect(9, 12, 3, 14);
      ctx.fillStyle = HELMET_DARK;
      ctx.fillRect(20, 12, 3, 14);
      ctx.fillRect(9, 23, 14, 3);
      ctx.fillStyle = "#000000";
      ctx.fillRect(11, 18, 10, 2);
      ctx.fillStyle = SKIN;
      ctx.fillRect(12, 20, 8, 3);
      ctx.save();
      ctx.translate(26, 35);
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = SWORD;
      ctx.fillRect(-2, -18, 4, 22);
      ctx.fillStyle = "#c0c0d0";
      ctx.fillRect(-2, -18, 1, 22);
      ctx.fillStyle = HILT;
      ctx.fillRect(-4, 2, 8, 4);
      ctx.fillStyle = "#603000";
      ctx.fillRect(-1, 4, 2, 6);
      ctx.restore();
      this.addOutline(ctx, cvs);
      return cvs;
    }
    // Helper: Add 1px black outline around non-transparent pixels
    addOutline(ctx, cvs) {
      const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const data = imgData.data;
      const w = cvs.width;
      const h = cvs.height;
      const isOpaque = (x, y) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return false;
        return data[(y * w + x) * 4 + 3] > 128;
      };
      const outline = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!isOpaque(x, y)) {
            if (isOpaque(x - 1, y) || isOpaque(x + 1, y) || isOpaque(x, y - 1) || isOpaque(x, y + 1)) {
              outline.push([x, y]);
            }
          }
        }
      }
      ctx.fillStyle = "#000000";
      outline.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
    }
    // =========================================================
    // TIBIA-QUALITY TREE (64x64 with layered canopy)
    // =========================================================
    createTree() {
      const cvs = this.createCanvas(64, 64);
      const ctx = cvs.getContext("2d");
      const TRUNK_DARK = "#2a1a10";
      const TRUNK_MID = "#4a3020";
      const TRUNK_LIGHT = "#5a4030";
      const LEAF_DARK = "#1a3a15";
      const LEAF_MID = "#2a5a25";
      const LEAF_LIGHT = "#4a8a45";
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(32, 60, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      const trunkX = 27;
      const trunkW = 10;
      ctx.fillStyle = TRUNK_MID;
      ctx.fillRect(trunkX, 38, trunkW, 24);
      ctx.fillStyle = TRUNK_LIGHT;
      ctx.fillRect(trunkX, 38, 3, 24);
      ctx.fillStyle = TRUNK_DARK;
      ctx.fillRect(trunkX + trunkW - 3, 38, 3, 24);
      ctx.strokeStyle = TRUNK_DARK;
      ctx.lineWidth = 1;
      for (let y = 42; y < 60; y += 5) {
        ctx.beginPath();
        ctx.moveTo(trunkX, y + 0.5);
        ctx.lineTo(trunkX + trunkW, y + 0.5);
        ctx.stroke();
      }
      const cx = 32, cy = 24;
      ctx.fillStyle = LEAF_DARK;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 26, 20, 0, 0, Math.PI * 2);
      ctx.fill();
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
      for (let y = cy; y < cy + 16; y++) {
        for (let x = cx; x < cx + 24; x++) {
          const dx = (x - cx) / 26;
          const dy = (y - cy) / 20;
          if (dx * dx + dy * dy > 0.85) continue;
          if (this.shouldDither(x, y, 5)) {
            ctx.fillStyle = "#0a2a0a";
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      ctx.strokeStyle = "#0a200a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 26, 20, 0, 0, Math.PI * 2);
      ctx.stroke();
      return cvs;
    }
    // =========================================================
    // TIBIA-QUALITY ROCK (Faceted with chamfer)
    // =========================================================
    createRock() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const BASE = "#707070";
      const LIGHT = "#a0a0a0";
      const DARK = "#404040";
      const SHADOW = "#202020";
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(16, 27, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      const pts = [
        { x: 7, y: 14 },
        { x: 10, y: 7 },
        { x: 18, y: 5 },
        { x: 25, y: 9 },
        { x: 27, y: 17 },
        { x: 24, y: 24 },
        { x: 14, y: 26 },
        { x: 6, y: 20 }
      ];
      ctx.fillStyle = BASE;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = LIGHT;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, 20);
      ctx.lineTo(7, 14);
      ctx.lineTo(10, 7);
      ctx.lineTo(18, 5);
      ctx.stroke();
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
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.stroke();
      return cvs;
    }
    // =========================================================
    // WATER TILE (Animated look with dithering)
    // =========================================================
    createWater() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const DEEP = "#1a4a6a";
      const MID = "#2a6a8a";
      const LIGHT = "#4a9aba";
      ctx.fillStyle = MID;
      ctx.fillRect(0, 0, 32, 32);
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const wave = Math.sin((x + y) * 0.3) * 0.5 + 0.5;
          if (this.shouldDither(x, y, wave * 12)) {
            ctx.fillStyle = wave > 0.5 ? LIGHT : DEEP;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      ctx.fillStyle = "#6abaDA";
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(i * 7 + 2, i * 5 % 28 + 2, 3, 1);
      }
      return cvs;
    }
    // =========================================================
    // WOOD FLOOR (Planks)
    // =========================================================
    createWoodFloor() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const BASE = "#8d6e63";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, 32, 32);
      for (let row = 0; row < 4; row++) {
        const y = row * 8;
        ctx.fillStyle = "#4e342e";
        ctx.fillRect(0, y, 32, 1);
        for (let i = 0; i < 64; i++) {
          const px = Math.random() * 32;
          const py = y + 1 + Math.random() * 6;
          ctx.fillStyle = Math.random() > 0.5 ? "#6d4c41" : "#a1887f";
          ctx.fillRect(px, py, 2 + Math.random() * 4, 1);
        }
      }
      return cvs;
    }
    // =========================================================
    // STONE FLOOR (Dungeon)
    // =========================================================
    createStoneFloor() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const BASE = "#9e9e9e";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, 32, 32);
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 32;
        const y = Math.random() * 32;
        const shade = Math.random();
        if (shade < 0.33) ctx.fillStyle = "#757575";
        else if (shade < 0.66) ctx.fillStyle = "#bdbdbd";
        else ctx.fillStyle = "#616161";
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.strokeStyle = "#424242";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(16, 32);
      ctx.moveTo(0, 16);
      ctx.lineTo(32, 16);
      ctx.stroke();
      ctx.strokeRect(0, 0, 32, 32);
      return cvs;
    }
    // =========================================================
    // BARREL (Decoration)
    // =========================================================
    createBarrel() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a4a30";
      ctx.fillRect(8, 8, 16, 18);
      ctx.fillStyle = "#8a6a50";
      ctx.fillRect(8, 8, 4, 18);
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(20, 8, 4, 18);
      ctx.fillStyle = "#505050";
      ctx.fillRect(7, 10, 18, 2);
      ctx.fillRect(7, 22, 18, 2);
      ctx.strokeStyle = "#2a1a10";
      ctx.lineWidth = 1;
      ctx.strokeRect(7.5, 7.5, 17, 19);
      return cvs;
    }
    // =========================================================
    // CRATE (Decoration)
    // =========================================================
    createCrate() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(7, 25, 20, 4);
      ctx.fillStyle = "#7a5a40";
      ctx.fillRect(6, 6, 20, 20);
      ctx.fillStyle = "#9a7a60";
      ctx.fillRect(6, 6, 20, 2);
      ctx.fillRect(6, 6, 2, 20);
      ctx.fillStyle = "#5a3a20";
      ctx.fillRect(6, 24, 20, 2);
      ctx.fillRect(24, 6, 2, 20);
      ctx.strokeStyle = "#4a3020";
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
    createTorch() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#5a4030";
      ctx.fillRect(14, 16, 4, 14);
      ctx.fillStyle = "#ff6600";
      ctx.beginPath();
      ctx.ellipse(16, 12, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffaa00";
      ctx.beginPath();
      ctx.ellipse(16, 10, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.ellipse(16, 9, 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      return cvs;
    }
    // =========================================================
    // GOLD COINS (Loot)
    // =========================================================
    createGold() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      for (let i = 0; i < 5; i++) {
        const x = 10 + i % 3 * 5;
        const y = 16 + Math.floor(i / 3) * 4;
        ctx.fillStyle = "#c0a020";
        ctx.beginPath();
        ctx.ellipse(x, y, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e0c040";
        ctx.beginPath();
        ctx.ellipse(x, y - 1, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      return cvs;
    }
    // =========================================================
    // HEALTH POTION (Loot)
    // =========================================================
    createPotion() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#cc2020";
      ctx.fillRect(12, 14, 8, 12);
      ctx.fillStyle = "#ff4040";
      ctx.fillRect(12, 14, 3, 12);
      ctx.fillStyle = "#aa8060";
      ctx.fillRect(14, 10, 4, 4);
      ctx.fillStyle = "#6a5040";
      ctx.fillRect(14, 8, 4, 3);
      ctx.fillStyle = "#ff6060";
      ctx.fillRect(13, 16, 2, 4);
      return cvs;
    }
    // =========================================================
    // SWORD (Loot)
    // =========================================================
    createSword() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = "#a0a0b0";
      ctx.fillRect(-2, -14, 4, 20);
      ctx.fillStyle = "#c0c0d0";
      ctx.fillRect(-2, -14, 1, 20);
      ctx.fillStyle = "#c0a020";
      ctx.fillRect(-6, 4, 12, 3);
      ctx.fillStyle = "#5a3020";
      ctx.fillRect(-1, 6, 2, 8);
      ctx.fillStyle = "#c0a020";
      ctx.beginPath();
      ctx.arc(0, 15, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return cvs;
    }
    // =========================================================
    // AXE (Loot) - Hand Axe / Battle Axe
    // =========================================================
    createAxe(variant = "hand") {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = "#5a3020";
      const handleLen = variant === "battle" ? 20 : 14;
      ctx.fillRect(-1, -2, 2, handleLen);
      ctx.fillStyle = "#704030";
      ctx.fillRect(-1, -2, 1, handleLen);
      ctx.fillStyle = "#7a7a8a";
      if (variant === "battle") {
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
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(-2, -1);
        ctx.lineTo(-2, 5);
        ctx.lineTo(-8, 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = "#a0a0b0";
      ctx.fillRect(-7, -3, 2, 2);
      ctx.restore();
      return cvs;
    }
    // =========================================================
    // HELMET (Armor) - Dwarven Helmet
    // =========================================================
    createHelmet() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#6a5a4a";
      ctx.beginPath();
      ctx.arc(16, 18, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7a6a5a";
      ctx.fillRect(8, 10, 16, 8);
      ctx.fillStyle = "#8a7a6a";
      ctx.fillRect(8, 10, 16, 3);
      ctx.fillRect(8, 10, 3, 8);
      ctx.fillStyle = "#3a3a4a";
      ctx.fillRect(10, 16, 12, 4);
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(14, 14, 4, 10);
      ctx.fillStyle = "#4a3a2a";
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
    createLegs() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(6, 4, 8, 24);
      ctx.fillStyle = "#6a5a4a";
      ctx.fillRect(6, 4, 2, 24);
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(18, 4, 8, 24);
      ctx.fillStyle = "#6a5a4a";
      ctx.fillRect(18, 4, 2, 24);
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(4, 2, 24, 4);
      ctx.fillStyle = "#c0a020";
      ctx.fillRect(14, 2, 4, 4);
      ctx.fillStyle = "#7a6a5a";
      ctx.fillRect(7, 14, 6, 4);
      ctx.fillRect(19, 14, 6, 4);
      return cvs;
    }
    // =========================================================
    // RAT (Monster 32x32)
    // =========================================================
    createRat() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(16, 26, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a5040";
      ctx.beginPath();
      ctx.ellipse(16, 18, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7a6050";
      ctx.beginPath();
      ctx.ellipse(22, 16, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8a7060";
      ctx.beginPath();
      ctx.arc(20, 12, 2, 0, Math.PI * 2);
      ctx.arc(24, 12, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(23, 15, 2, 2);
      ctx.strokeStyle = "#8a7060";
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
    createWolf() {
      const cvs = this.createCanvas(32, 48);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(16, 44, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      const FUR_DARK = "#212121";
      const FUR_MID = "#424242";
      const FUR_LIGHT = "#616161";
      ctx.fillStyle = FUR_DARK;
      ctx.fillRect(7, 32, 6, 12);
      ctx.fillRect(19, 32, 6, 12);
      ctx.fillStyle = FUR_MID;
      ctx.beginPath();
      ctx.ellipse(16, 30, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = FUR_LIGHT;
      ctx.beginPath();
      ctx.ellipse(16, 26, 10, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = FUR_MID;
      ctx.beginPath();
      ctx.ellipse(16, 18, 9, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = FUR_DARK;
      ctx.beginPath();
      ctx.ellipse(16, 22, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.fillRect(15, 24, 2, 2);
      ctx.fillStyle = FUR_DARK;
      ctx.beginPath();
      ctx.moveTo(9, 14);
      ctx.lineTo(7, 4);
      ctx.lineTo(13, 12);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(23, 14);
      ctx.lineTo(25, 4);
      ctx.lineTo(19, 12);
      ctx.fill();
      ctx.fillStyle = "#cc0000";
      ctx.fillRect(11, 16, 3, 2);
      ctx.fillRect(18, 16, 3, 2);
      ctx.fillStyle = "#ffff00";
      ctx.fillRect(12, 16, 1, 1);
      ctx.fillRect(19, 16, 1, 1);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(14, 26, 1, 2);
      ctx.fillRect(17, 26, 1, 2);
      this.addOutline(ctx, cvs);
      return cvs;
    }
    // =========================================================
    // SKELETON (Monster 32x64)
    // =========================================================
    createSkeleton() {
      const cvs = this.createCanvas(32, 64);
      const ctx = cvs.getContext("2d");
      const BONE = "#e0d8c8";
      const BONE_DARK = "#a09888";
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(16, 60, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = BONE;
      ctx.fillRect(10, 44, 3, 16);
      ctx.fillRect(19, 44, 3, 16);
      ctx.fillStyle = BONE_DARK;
      ctx.fillRect(12, 44, 1, 16);
      ctx.fillRect(21, 44, 1, 16);
      ctx.fillStyle = BONE;
      ctx.fillRect(9, 40, 14, 6);
      ctx.fillStyle = BONE;
      ctx.fillRect(10, 26, 12, 14);
      ctx.fillStyle = "#1a1a1a";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(12, 28 + i * 3, 8, 1);
      }
      ctx.fillStyle = BONE;
      ctx.beginPath();
      ctx.arc(16, 18, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(12, 16, 3, 4);
      ctx.fillRect(17, 16, 3, 4);
      ctx.fillStyle = BONE;
      ctx.fillRect(12, 22, 8, 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(14, 22, 1, 2);
      ctx.fillRect(17, 22, 1, 2);
      ctx.fillStyle = BONE;
      ctx.fillRect(6, 28, 3, 12);
      ctx.fillRect(23, 28, 3, 12);
      this.addOutline(ctx, cvs);
      return cvs;
    }
    // =========================================================
    // SLIME (Monster 32x32)
    // =========================================================
    createSlime() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(16, 26, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#40a040";
      ctx.beginPath();
      ctx.ellipse(16, 18, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#60c060";
      ctx.beginPath();
      ctx.ellipse(12, 14, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(12, 16, 3, 0, Math.PI * 2);
      ctx.arc(20, 16, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
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
    createSkeleton() {
      const cvs = this.createCanvas(32, 48);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(16, 44, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(10, 36, 4, 10);
      ctx.fillRect(18, 36, 4, 10);
      ctx.fillRect(14, 24, 4, 12);
      ctx.fillRect(10, 26, 12, 6);
      ctx.fillRect(8, 24, 4, 10);
      ctx.fillRect(20, 24, 4, 10);
      ctx.fillStyle = "#f0f0f0";
      ctx.beginPath();
      ctx.arc(16, 18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.fillRect(13, 16, 2, 2);
      ctx.fillRect(17, 16, 2, 2);
      this.addOutline(ctx, cvs);
      return cvs;
    }
    // =========================================================
    // WATER (Animated Dithered)
    // =========================================================
    createWater() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#0069c0";
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = "#2196f3";
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
    createWoodFloor() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = "#3e2723";
      for (let i = 0; i < 32; i += 8) ctx.fillRect(0, i, 32, 1);
      ctx.fillRect(10, 0, 1, 8);
      ctx.fillRect(20, 8, 1, 8);
      ctx.fillRect(5, 16, 1, 8);
      return cvs;
    }
    createStoneFloor() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#9e9e9e";
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = "#757575";
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
    createBarrel() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#795548";
      ctx.beginPath();
      ctx.ellipse(16, 24, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(8, 12, 16, 14);
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(8, 14, 16, 2);
      ctx.fillRect(8, 22, 16, 2);
      this.addOutline(ctx, cvs);
      return cvs;
    }
    createCrate() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#8d6e63";
      ctx.fillRect(6, 12, 20, 18);
      ctx.strokeStyle = "#3e2723";
      ctx.lineWidth = 2;
      ctx.strokeRect(7, 13, 18, 16);
      ctx.beginPath();
      ctx.moveTo(7, 13);
      ctx.lineTo(25, 29);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(25, 13);
      ctx.lineTo(7, 29);
      ctx.stroke();
      this.addOutline(ctx, cvs);
      return cvs;
    }
    createTorch() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(14, 18, 4, 10);
      ctx.fillStyle = "#ff5722";
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      this.addOutline(ctx, cvs);
      return cvs;
    }
    // =========================================================
    // LOOT
    // =========================================================
    createGold() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#ffc107";
      ctx.beginPath();
      ctx.arc(16, 24, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffecb3";
      ctx.beginPath();
      ctx.arc(15, 23, 1, 0, Math.PI * 2);
      ctx.fill();
      this.addOutline(ctx, cvs);
      return cvs;
    }
    createPotion() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#f44336";
      ctx.beginPath();
      ctx.arc(16, 22, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(14, 14, 4, 4);
      this.addOutline(ctx, cvs);
      return cvs;
    }
    createSword() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#b0bec5";
      ctx.fillRect(-2, -10, 4, 20);
      ctx.fillStyle = "#8d6e63";
      ctx.fillRect(-3, 10, 6, 2);
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(-1, 12, 2, 4);
      ctx.restore();
      this.addOutline(ctx, cvs);
      return cvs;
    }
    createCanvas(w, h) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return c;
    }
    // =========================================================
    // TIBIA-QUALITY BACKPACK (Volumetric)
    // =========================================================
    createBackpack() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const DARK = "#3e2723";
      const BASE = "#5d4037";
      const LIGHT = "#795548";
      const STRAP = "#ffb300";
      const BUCKLE = "#ffd54f";
      ctx.fillStyle = BASE;
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = DARK;
      ctx.fillRect(4, 24, 24, 4);
      ctx.fillRect(24, 4, 4, 24);
      ctx.fillStyle = LIGHT;
      ctx.fillRect(4, 4, 20, 2);
      ctx.fillRect(4, 4, 2, 20);
      ctx.fillStyle = LIGHT;
      ctx.fillRect(4, 4, 24, 12);
      ctx.fillStyle = DARK;
      ctx.fillRect(4, 16, 24, 1);
      ctx.fillStyle = BASE;
      ctx.fillRect(2, 10, 2, 12);
      ctx.fillRect(28, 10, 2, 12);
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
    createShield() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      const WOOD_DARK = "#3e2723";
      const WOOD_MID = "#5d4037";
      const WOOD_LIGHT = "#795548";
      const IRON = "#9e9e9e";
      ctx.fillStyle = WOOD_MID;
      ctx.beginPath();
      ctx.arc(16, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = IRON;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = WOOD_DARK;
      ctx.fillRect(10, 6, 1, 20);
      ctx.fillRect(21, 6, 1, 20);
      ctx.fillStyle = IRON;
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(14, 14, 2, 2);
      return cvs;
    }
    // =========================================================
    // TIBIA-QUALITY NPC (Detailed Robed Figure with Accessories)
    // =========================================================
    createNPC(robeColor, highlightColor) {
      const cvs = this.createCanvas(32, 64);
      const ctx = cvs.getContext("2d");
      const darken = (hex, amt) => {
        const num = parseInt(hex.replace("#", ""), 16);
        const r = Math.max(0, (num >> 16) - amt);
        const g = Math.max(0, (num >> 8 & 255) - amt);
        const b = Math.max(0, (num & 255) - amt);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
      };
      const ROBE_DARK = darken(robeColor, 40);
      const ROBE_SHADOW = darken(robeColor, 70);
      const SKIN = "#d0a080";
      const SKIN_SHADOW = "#a07050";
      const HAIR = "#4a3020";
      const BELT = "#8b7355";
      const BELT_BUCKLE = "#c0a020";
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(16, 60, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = robeColor;
      ctx.fillRect(8, 28, 16, 30);
      ctx.fillRect(6, 50, 20, 8);
      ctx.fillStyle = ROBE_DARK;
      ctx.fillRect(18, 28, 6, 30);
      ctx.fillRect(20, 50, 6, 8);
      ctx.fillStyle = highlightColor;
      ctx.fillRect(8, 28, 4, 28);
      ctx.fillStyle = ROBE_SHADOW;
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(8 + i * 6, 52, 4, 1);
        ctx.fillRect(9 + i * 6, 55, 3, 1);
      }
      ctx.fillStyle = BELT;
      ctx.fillRect(8, 40, 16, 3);
      ctx.fillStyle = BELT_BUCKLE;
      ctx.fillRect(14, 40, 4, 3);
      ctx.fillStyle = "#fff";
      ctx.fillRect(15, 41, 2, 1);
      ctx.fillStyle = robeColor;
      ctx.fillRect(4, 30, 4, 14);
      ctx.fillRect(24, 30, 4, 14);
      ctx.fillStyle = ROBE_DARK;
      ctx.fillRect(26, 30, 2, 14);
      ctx.fillStyle = highlightColor;
      ctx.fillRect(4, 30, 2, 12);
      ctx.fillStyle = SKIN;
      ctx.fillRect(4, 42, 4, 4);
      ctx.fillRect(24, 42, 4, 4);
      ctx.fillStyle = SKIN_SHADOW;
      ctx.fillRect(6, 44, 2, 2);
      ctx.fillRect(26, 44, 2, 2);
      ctx.fillStyle = SKIN;
      ctx.fillRect(11, 14, 10, 12);
      ctx.fillStyle = SKIN_SHADOW;
      ctx.fillRect(18, 16, 3, 8);
      ctx.fillStyle = "#000";
      ctx.fillRect(13, 18, 2, 2);
      ctx.fillRect(17, 18, 2, 2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(13, 18, 1, 1);
      ctx.fillRect(17, 18, 1, 1);
      ctx.fillStyle = "#804040";
      ctx.fillRect(14, 22, 4, 1);
      ctx.fillStyle = robeColor;
      ctx.beginPath();
      ctx.arc(16, 14, 9, Math.PI, 0, false);
      ctx.fill();
      ctx.fillRect(7, 14, 18, 6);
      ctx.fillStyle = ROBE_DARK;
      ctx.fillRect(20, 10, 5, 10);
      ctx.fillStyle = highlightColor;
      ctx.fillRect(7, 10, 4, 8);
      ctx.fillStyle = ROBE_SHADOW;
      ctx.fillRect(10, 12, 12, 2);
      ctx.fillStyle = HAIR;
      ctx.fillRect(11, 12, 10, 3);
      if (highlightColor === "#a0d0f0" || highlightColor === "#60a060") {
        ctx.fillStyle = "#5a4030";
        ctx.fillRect(2, 20, 2, 38);
        ctx.fillStyle = "#7a6050";
        ctx.fillRect(2, 20, 1, 36);
        if (highlightColor === "#a0d0f0") {
          ctx.fillStyle = "#60c0ff";
          ctx.beginPath();
          ctx.arc(3, 18, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#a0e0ff";
          ctx.fillRect(2, 15, 2, 2);
        }
        if (highlightColor === "#60a060") {
          ctx.fillStyle = "#c0a020";
          ctx.fillRect(0, 18, 6, 3);
        }
      }
      if (highlightColor === "#8a60a0") {
        ctx.fillStyle = "#604020";
        ctx.fillRect(22, 44, 5, 6);
        ctx.fillStyle = "#806040";
        ctx.fillRect(22, 44, 2, 4);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(23, 44, 2, 2);
      }
      this.addOutline(ctx, cvs);
      return cvs;
    }
    createCorpse() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#aaaaaa";
      ctx.fillRect(12, 10, 8, 8);
      ctx.fillRect(8, 20, 16, 4);
      ctx.fillRect(14, 18, 4, 8);
      ctx.fillStyle = "#555555";
      ctx.fillRect(14, 12, 2, 2);
      ctx.fillRect(18, 12, 2, 2);
      this.addOutline(ctx, cvs);
      return cvs;
    }
    // =========================================================
    // GENERIC ARMOR GENERATOR
    // =========================================================
    createArmorPlate(color, trim) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(8, 6, 16, 20);
      ctx.fillStyle = trim;
      ctx.fillRect(6, 6, 4, 6);
      ctx.fillRect(22, 6, 4, 6);
      ctx.fillStyle = trim;
      ctx.fillRect(14, 8, 4, 18);
      return cvs;
    }
    createLegsPlate(color) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(10, 4, 5, 24);
      ctx.fillRect(17, 4, 5, 24);
      ctx.fillRect(10, 4, 12, 4);
      return cvs;
    }
    createBoots(color) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(8, 20, 6, 8);
      ctx.fillRect(8, 24, 8, 4);
      ctx.fillRect(18, 20, 6, 8);
      ctx.fillRect(18, 24, 8, 4);
      return cvs;
    }
    // =========================================================
    // GENERIC HELMET & SHIELD
    // =========================================================
    createHelmetGen(color, trim) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = trim;
      ctx.fillRect(15, 6, 2, 20);
      ctx.fillRect(6, 15, 20, 2);
      return cvs;
    }
    createShieldGen(color, trim) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(26, 6);
      ctx.lineTo(26, 20);
      ctx.lineTo(16, 28);
      ctx.lineTo(6, 20);
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
    createClub(headColor, spikes) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = "#5a3020";
      ctx.fillRect(-2, -4, 4, 16);
      ctx.fillStyle = headColor;
      ctx.beginPath();
      ctx.arc(0, -10, 6, 0, Math.PI * 2);
      ctx.fill();
      if (spikes) {
        ctx.fillStyle = "#aaa";
        ctx.fillRect(-8, -10, 16, 2);
        ctx.fillRect(0, -18, 2, 16);
      }
      ctx.restore();
      return cvs;
    }
    createSwordGen(bladeColor, hiltColor, complex) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = bladeColor;
      const width = complex ? 4 : 3;
      const len = complex ? 24 : 20;
      ctx.fillRect(-width / 2, -len + 6, width, len);
      ctx.fillStyle = hiltColor;
      ctx.fillRect(-6, 4, 12, 3);
      ctx.fillStyle = "#4a2010";
      ctx.fillRect(-1, 6, 2, 6);
      ctx.restore();
      return cvs;
    }
    createBow() {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(-Math.PI / 4);
      ctx.strokeStyle = "#8a6a4a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 12, Math.PI, 0);
      ctx.stroke();
      ctx.strokeStyle = "#eee";
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
    createTool(type) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.save();
      ctx.translate(16, 16);
      if (type === "rope") {
        ctx.strokeStyle = "#d2b48c";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
        return cvs;
      }
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = "#6a4a3a";
      ctx.fillRect(-1, -4, 2, 20);
      ctx.fillStyle = "#889";
      if (type === "shovel") {
        ctx.fillRect(-4, -10, 8, 8);
      } else if (type === "pickaxe") {
        ctx.beginPath();
        ctx.moveTo(-10, -6);
        ctx.quadraticCurveTo(0, -12, 10, -6);
        ctx.lineTo(8, -4);
        ctx.quadraticCurveTo(0, -10, -8, -4);
        ctx.fill();
      } else if (type === "machete") {
        ctx.fillStyle = "#ccc";
        ctx.fillRect(-2, -14, 4, 14);
      }
      ctx.restore();
      return cvs;
    }
    createGem(color) {
      const cvs = this.createCanvas(32, 32);
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(16, 8);
      ctx.lineTo(24, 16);
      ctx.lineTo(16, 24);
      ctx.lineTo(8, 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(14, 12, 4, 4);
      return cvs;
    }
  };
  var assetManager = new AssetManager();
  var spriteSheet = document.createElement("canvas");
  var spriteCanvas = document.createElement("canvas");
  AssetManager.prototype.getSpriteStyle = function() {
    return "";
  };
  AssetManager.prototype.getSheetConfig = function() {
    return { width: 512, height: 512, tileSize: 32 };
  };
  AssetManager.prototype.rebuildCache = function() {
  };
  AssetManager.prototype.getSpriteImage = function(id) {
    return this.getSprite(id);
  };

  // src/main.ts
  init_constants();

  // src/core/types.ts
  var TILE_SIZE = 32;
  var Item = class {
    id;
    count;
    weight;
    capacity = 4;
    // Default container size
    isContainer;
    inventory;
    properties = {};
    constructor(id, count = 1, properties = {}) {
      this.id = id;
      this.count = count;
      this.properties = properties;
      this.weight = 10;
      this.isContainer = false;
      this.inventory = null;
      if (id === 22) {
        this.isContainer = true;
        this.inventory = [];
      }
    }
  };
  var Tile = class {
    items = [];
    constructor(groundId = 0) {
      if (groundId !== 0) {
        this.addGround(groundId);
      }
    }
    addGround(id) {
      this.items.push(new Item(id));
    }
    peek() {
      return this.items[this.items.length - 1];
    }
    // Helper compatibility for map_gen
    add(id) {
      this.addItem(new Item(id));
    }
    has(id) {
      return this.items.some((i) => i.id === id);
    }
    pop() {
      this.removeItem();
    }
    addItem(item) {
      this.items.push(item);
    }
    removeItem() {
      return this.items.pop();
    }
    get baseId() {
      return this.items.length > 0 ? this.items[0].id : 0;
    }
    set baseId(id) {
      if (this.items.length === 0) {
        this.items.push(new Item(id));
      } else {
        this.items[0].id = id;
      }
    }
    removeWall() {
      if (this.items.length > 1) {
        this.items.pop();
      }
    }
  };

  // src/client/damage_text.ts
  var DamageText = class {
    x;
    y;
    text;
    color;
    life;
    maxLife;
    velocityY;
    constructor(x, y, text, color = "#ff0000") {
      this.x = x;
      this.y = y;
      this.text = text;
      this.color = color;
      this.life = 1;
      this.maxLife = 1;
      this.velocityY = -20;
    }
  };
  var DamageTextManager = class {
    texts = [];
    addText(x, y, text, color = "#ff0000") {
      this.texts.push(new DamageText(x, y, text, color));
    }
    update(dt) {
      for (let i = this.texts.length - 1; i >= 0; i--) {
        const txt = this.texts[i];
        txt.y += txt.velocityY * dt;
        txt.life -= dt;
        if (txt.life <= 0) {
          this.texts.splice(i, 1);
        }
      }
    }
    render(ctx, cameraX, cameraY) {
      ctx.save();
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      for (const txt of this.texts) {
        const alpha = Math.max(0, txt.life / txt.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = txt.color;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
        const screenX = Math.floor(txt.x - cameraX);
        const screenY = Math.floor(txt.y - cameraY);
        ctx.strokeText(txt.text, screenX, screenY);
        ctx.fillText(txt.text, screenX, screenY);
      }
      ctx.restore();
    }
  };
  var damageTextManager = new DamageTextManager();

  // src/client/renderer.ts
  var PixelRenderer = class {
    canvas;
    scale = 1;
    hasLogged = false;
    // Debug flag
    loggedMissing = {};
    // Track missing sprites to avoid log spam
    ctx;
    renderList = [];
    scratchCanvas;
    scratchCtx;
    constructor(canvas2) {
      this.canvas = canvas2;
      this.ctx = canvas2.getContext("2d", { alpha: false });
      this.ctx.imageSmoothingEnabled = false;
      this.scratchCanvas = document.createElement("canvas");
      this.scratchCanvas.width = 128;
      this.scratchCanvas.height = 128;
      this.scratchCtx = this.scratchCanvas.getContext("2d");
      this.scratchCtx.imageSmoothingEnabled = false;
    }
    getScale() {
      return this.scale;
    }
    // RENDERABLE SORTING STRUCTURE
    // We collect all items, entities, and player into this list
    // then sort by Y coordinate before drawing.
    renderList = [];
    draw(map2, player2, visibleEntities = [], world2 = null) {
      const screenWidth = this.canvas.width;
      const screenHeight = this.canvas.height;
      this.ctx.fillStyle = "#426829";
      this.ctx.fillRect(0, 0, screenWidth, screenHeight);
      this.ctx.imageSmoothingEnabled = false;
      const pX = player2 ? player2.x : 0;
      const pY = player2 ? player2.y : 0;
      const camX = Math.floor(pX * TILE_SIZE - screenWidth / 2 + TILE_SIZE / 2);
      const camY = Math.floor(pY * TILE_SIZE - screenHeight / 2 + TILE_SIZE / 2);
      const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
      const endCol = Math.min(map2.width, Math.ceil((camX + screenWidth) / TILE_SIZE) + 1);
      const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
      const endRow = Math.min(map2.height, Math.ceil((camY + screenHeight) / TILE_SIZE) + 1);
      for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
          if (c >= 0 && c < map2.width && r >= 0 && r < map2.height) {
            const idx = r * map2.width + c;
            const tile = map2.tiles[idx];
            if (tile && tile.items.length > 0) {
              const itemId = tile.items[0].id;
              const rect = assetManager.getSpriteRect(itemId);
              const isTall = rect.h > 32;
              if (!isTall) {
                this.drawItem(itemId, c, r, camX, camY);
              }
            }
          }
        }
      }
      this.renderList = [];
      for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
          if (c >= 0 && c < map2.width && r >= 0 && r < map2.height) {
            const idx = r * map2.width + c;
            const tile = map2.tiles[idx];
            if (tile && tile.items.length > 0) {
              for (let i = 0; i < tile.items.length; i++) {
                const itemId = tile.items[i].id;
                const rect = assetManager.getSpriteRect(itemId);
                const isTall = rect.h > 32;
                if (isTall || i > 0) {
                  this.renderList.push({
                    y: (r + 1) * TILE_SIZE,
                    // Base of the tile
                    draw: () => this.drawItem(itemId, c, r, camX, camY),
                    debugId: isTall ? "TALL_OBJ" : "OBJ"
                  });
                }
              }
            }
          }
        }
      }
      visibleEntities.forEach((ent) => {
        const baseX = Math.round(ent.x - camX);
        const baseY = Math.round(ent.y - camY);
        this.renderList.push({
          y: ent.y * TILE_SIZE + 32,
          draw: () => {
            const tint = ent.tint;
            const sprite = assetManager.getSpriteSource(ent.spriteIndex);
            if (sprite && sprite.image) {
              const ratio = sprite.sh / sprite.sw;
              const dstW = TILE_SIZE;
              const dstH = Math.round(TILE_SIZE * ratio);
              const verticalOffset = dstH - TILE_SIZE;
              const drawY = baseY - verticalOffset;
              let renderSource = sprite.image;
              let sx = sprite.sx;
              let sy = sprite.sy;
              let sw = sprite.sw;
              let sh = sprite.sh;
              if (tint) {
                this.scratchCtx.clearRect(0, 0, sw, sh);
                this.scratchCtx.globalCompositeOperation = "source-over";
                this.scratchCtx.drawImage(sprite.image, sx, sy, sw, sh, 0, 0, sw, sh);
                this.scratchCtx.globalCompositeOperation = "source-atop";
                this.scratchCtx.fillStyle = tint.color;
                this.scratchCtx.fillRect(0, 0, sw, sh);
                renderSource = this.scratchCanvas;
                sx = 0;
                sy = 0;
              }
              this.ctx.globalAlpha = 1;
              this.ctx.drawImage(
                renderSource,
                sx,
                sy,
                sw,
                sh,
                baseX,
                drawY,
                dstW,
                dstH
              );
              if (ent.equipment) {
                const eq = ent.equipment;
                const slots = ["body", "head", "lhand", "rhand"];
                slots.forEach((slot) => {
                  const itemSpriteId = eq[slot];
                  if (itemSpriteId) {
                    const iSprite = assetManager.getSpriteSource(itemSpriteId);
                    if (iSprite && iSprite.image) {
                      const iDstW = TILE_SIZE;
                      const iDstH = Math.round(TILE_SIZE * (iSprite.sh / iSprite.sw));
                      const iDrawY = drawY + dstH - iDstH;
                      this.ctx.drawImage(
                        iSprite.image,
                        iSprite.sx,
                        iSprite.sy,
                        iSprite.sw,
                        iSprite.sh,
                        baseX,
                        iDrawY,
                        iDstW,
                        iDstH
                      );
                    }
                  }
                });
              }
              if (ent.name) {
                this.ctx.font = "10px monospace";
                this.ctx.textAlign = "center";
                const cx = baseX + 16;
                const cy = drawY - 12;
                this.ctx.fillStyle = "#000";
                this.ctx.fillText(ent.name, cx + 1, cy + 1);
                this.ctx.fillStyle = "#fff";
                if (ent.tint) this.ctx.fillStyle = ent.tint.color;
                this.ctx.fillStyle = "#0f0";
                this.ctx.fillText(ent.name, cx, cy);
                if (ent.health) {
                  const pct = ent.health.current / ent.health.max;
                  const barW = 26;
                  const barH = 4;
                  const bx = cx - barW / 2;
                  const by = cy + 2;
                  this.ctx.fillStyle = "#000";
                  this.ctx.fillRect(bx, by, barW, barH);
                  const hpColor = pct > 0.5 ? "#0f0" : pct > 0.2 ? "#ff0" : "#f00";
                  this.ctx.fillStyle = hpColor;
                  this.ctx.fillRect(bx + 1, by + 1, (barW - 2) * pct, barH - 2);
                }
              }
            } else {
              if (Math.random() < 0.01) console.warn(`[Renderer] Missing Sprite Image for Entity ID ${ent.spriteIndex}. Obj:`, sprite);
              this.ctx.fillStyle = "#ff0000";
              this.ctx.fillRect(baseX, baseY, 32, 32);
            }
          },
          debugId: "ENTITY"
        });
      });
      const pScreenX = Math.floor(pX * TILE_SIZE - camX);
      const pScreenY = Math.floor(pY * TILE_SIZE - camY);
      this.renderList.push({
        y: (pY + 1) * TILE_SIZE - 4,
        // Player feet
        draw: () => this.renderPlayer(this.ctx, player2, pScreenX, pScreenY),
        debugId: "PLAYER"
      });
      this.renderList.sort((a, b) => a.y - b.y);
      this.renderList.forEach((item) => item.draw());
      damageTextManager.render(this.ctx, camX, camY);
    }
    // Deprecated renderLayer (Kept empty or removed, replaced by loop above)
    // We can remove it to clean up.
    noOp() {
    }
    spyItem = false;
    drawItem(id, tx, ty, camX, camY) {
      this.ctx.globalAlpha = 1;
      const drawX = Math.round(tx * TILE_SIZE - camX);
      const baseY = Math.round(ty * TILE_SIZE - camY);
      const sprite = assetManager.getSpriteSource(id);
      if (sprite) {
        const dstW = TILE_SIZE;
        const ratio = sprite.sh / sprite.sw;
        const dstH = Math.round(TILE_SIZE * ratio);
        const verticalOffset = dstH - TILE_SIZE;
        const drawY = baseY - verticalOffset;
        this.ctx.drawImage(
          sprite.image,
          sprite.sx,
          sprite.sy,
          sprite.sw,
          sprite.sh,
          drawX,
          drawY,
          dstW,
          dstH
        );
      } else {
        if (id !== 0) {
          this.ctx.fillStyle = "#ff00ff";
          this.ctx.fillRect(drawX, baseY, 32, 32);
        }
      }
    }
    renderPlayer(ctx, player2, screenX, screenY) {
      ctx.globalAlpha = 1;
      if (player2.spriteId !== 199) {
        console.warn(`[Renderer] Player Sprite ID was ${player2.spriteId}, FORCING 199`);
        player2.spriteId = 199;
      }
      const sprite = assetManager.getSpriteSource(player2.spriteId);
      if (!sprite || !sprite.image) return;
      const TILE_SIZE2 = 32;
      const ratio = sprite.sh / sprite.sw;
      const dstW = TILE_SIZE2;
      const dstH = Math.round(TILE_SIZE2 * ratio);
      const verticalOffset = dstH - TILE_SIZE2;
      const drawY = screenY - verticalOffset;
      ctx.drawImage(
        sprite.image,
        sprite.sx,
        sprite.sy,
        sprite.sw,
        sprite.sh,
        screenX,
        drawY,
        dstW,
        dstH
      );
    }
    hasLoggedPlayer = false;
    drawEntities(entities, camX, camY) {
      const screenWidth = this.canvas.width;
      const screenHeight = this.canvas.height;
      entities.forEach((ent) => {
        const baseX = Math.round(ent.x - camX);
        const baseY = Math.round(ent.y - camY);
        if (baseX < -64 || baseX > screenWidth || baseY < -64 || baseY > screenHeight) return;
        const sprite = assetManager.getSpriteSource(ent.spriteIndex);
        if (sprite && sprite.image) {
          const ratio = sprite.sh / sprite.sw;
          const dstW = TILE_SIZE;
          const dstH = Math.round(TILE_SIZE * ratio);
          const verticalOffset = dstH - TILE_SIZE;
          const drawY = baseY - verticalOffset;
          this.ctx.drawImage(
            sprite.image,
            sprite.sx,
            sprite.sy,
            sprite.sw,
            sprite.sh,
            baseX,
            drawY,
            dstW,
            dstH
          );
        } else {
          this.ctx.fillStyle = "#ff0000";
          this.ctx.fillRect(baseX, baseY, 32, 32);
        }
      });
    }
    // Hit Detection Helper
    getObjectAt(map2, player2, worldX, worldY) {
      const centerC = Math.floor(worldX / TILE_SIZE);
      const centerR = Math.floor(worldY / TILE_SIZE);
      for (let r = centerR + 1; r >= centerR - 1; r--) {
        for (let c = centerC + 1; c >= centerC - 1; c--) {
          const tile = map2.getTile(c, r);
          if (!tile || tile.items.length === 0) continue;
          for (let i = tile.items.length - 1; i >= 0; i--) {
            const item = tile.items[i];
            const itemWorldX = c * TILE_SIZE;
            const itemWorldY = r * TILE_SIZE;
            if (worldX >= itemWorldX && worldX < itemWorldX + 32 && worldY >= itemWorldY && worldY < itemWorldY + 32) {
              return { x: c, y: r, item, stackIndex: i };
            }
          }
        }
      }
      return null;
    }
  };

  // src/core/map.ts
  var WorldMap = class {
    width;
    height;
    tiles;
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.tiles = [];
      this.initializeMap();
    }
    initializeMap() {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.tiles.push(new Tile(16));
        }
      }
    }
    getTile(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return null;
      }
      return this.tiles[y * this.width + x];
    }
    moveItem(fromX, fromY, toX, toY) {
      const sourceTile = this.getTile(fromX, fromY);
      const targetTile = this.getTile(toX, toY);
      if (!sourceTile || !targetTile) return false;
      const item = sourceTile.removeItem();
      if (item) {
        targetTile.addItem(item);
        return true;
      }
      return false;
    }
    generateSimpleMap() {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (Math.abs(x - this.width / 2) < 5 && Math.abs(y - this.height / 2) < 5) continue;
          if (Math.random() < 0.1) {
            const tile = this.getTile(x, y);
            if (tile) {
              tile.addItem(new Item(17));
            }
          }
        }
      }
    }
  };

  // src/core/player.ts
  var Player = class {
    x;
    y;
    nextMoveTime = 0;
    queuedDx = 0;
    queuedDy = 0;
    // ECS Link
    id = 0;
    // Visual State
    spriteId = 100;
    // Default: 100 (Hero)
    flipX = false;
    frame = 0;
    // Animation Frame (0-2)
    direction = 0;
    // Targeting
    targetId = null;
    // Stats (Synced from ECS for Logic/UI)
    hp = 100;
    maxHp = 100;
    mana = 50;
    maxMana = 50;
    capacity = 400;
    level = 1;
    xp = 0;
    nextXp = 100;
    gold = 0;
    attack = 0;
    defense = 0;
    get isMoving() {
      return this.queuedDx !== 0 || this.queuedDy !== 0;
    }
    constructor(startX, startY) {
      this.x = startX;
      this.y = startY;
    }
    tryMove(direction, map2) {
      if (Date.now() < this.nextMoveTime) {
        return false;
      }
      let targetX = this.x;
      let targetY = this.y;
      switch (direction) {
        case "north":
          targetY--;
          break;
        case "south":
          targetY++;
          break;
        case "west":
          targetX--;
          break;
        case "east":
          targetX++;
          break;
      }
      const tile = map2.getTile(targetX, targetY);
      if (!tile) return false;
      const isBlocked = tile.items.some((item) => item.id === 17);
      if (isBlocked) {
        return false;
      }
      this.x = targetX;
      this.y = targetY;
      this.nextMoveTime = Date.now() + 200;
      return true;
    }
    queueMove(dx, dy) {
      this.queuedDx = dx;
      this.queuedDy = dy;
    }
    tick(map2, now) {
      if (this.queuedDx !== 0 || this.queuedDy !== 0) {
        let dir = null;
        if (this.queuedDy === -1) dir = "north";
        else if (this.queuedDy === 1) dir = "south";
        else if (this.queuedDx === -1) dir = "west";
        else if (this.queuedDx === 1) dir = "east";
        if (dir) {
          if (this.tryMove(dir, map2)) {
          }
        }
      }
    }
  };

  // src/engine.ts
  var InputHandler = class {
    keys = /* @__PURE__ */ new Set();
    justPressedMap = /* @__PURE__ */ new Set();
    mouse = { x: 0, y: 0 };
    screenMouse = { x: 0, y: 0 };
    mouseKeys = /* @__PURE__ */ new Set();
    constructor() {
      window.addEventListener("keydown", (e) => {
        if (!this.keys.has(e.code)) {
          this.justPressedMap.add(e.code);
          console.log(`[Input] KeyDown: ${e.code}`);
        }
        this.keys.add(e.code);
      });
      window.addEventListener("keyup", (e) => {
        this.keys.delete(e.code);
        console.log(`[Input] KeyUp: ${e.code}. Remaining: ${Array.from(this.keys)}`);
      });
      window.addEventListener("blur", () => {
        this.keys.clear();
        this.mouseKeys.clear();
      });
      window.addEventListener("mousemove", (e) => {
        this.screenMouse.x = e.clientX;
        this.screenMouse.y = e.clientY;
        const canvas2 = document.getElementById("gameCanvas");
        if (!canvas2) return;
        const rect = canvas2.getBoundingClientRect();
        const scaleX = canvas2.width / rect.width;
        const scaleY = canvas2.height / rect.height;
        this.mouse.x = (e.clientX - rect.left - canvas2.clientLeft) * scaleX;
        this.mouse.y = (e.clientY - rect.top - canvas2.clientTop) * scaleY;
      });
      window.addEventListener("mousedown", (e) => {
        this.mouseKeys.add(e.button);
        if (e.button === 0) {
          if (!this.keys.has("MouseLeft")) this.justPressedMap.add("MouseLeft");
          this.keys.add("MouseLeft");
        }
        if (e.button === 2) {
          if (!this.keys.has("MouseRight")) this.justPressedMap.add("MouseRight");
          this.keys.add("MouseRight");
        }
      });
      window.addEventListener("mouseup", (e) => {
        this.mouseKeys.delete(e.button);
        if (e.button === 0) {
          this.keys.delete("MouseLeft");
        }
        if (e.button === 2) {
          this.keys.delete("MouseRight");
        }
      });
      window.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    }
    isDown(code) {
      return this.keys.has(code);
    }
    isJustPressed(code) {
      return this.justPressedMap.has(code);
    }
    getDirection() {
      let dx = 0;
      let dy = 0;
      if (this.keys.has("ArrowUp") || this.keys.has("KeyW")) dy = -1;
      if (this.keys.has("ArrowDown") || this.keys.has("KeyS")) dy = 1;
      if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) dx = -1;
      if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) dx = 1;
      return { x: dx, y: dy };
    }
    update() {
      this.justPressedMap.clear();
    }
    shouldIgnoreInput() {
      const tag = document.activeElement?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA";
    }
    getMouseWorldCoordinates(camera) {
      const worldX = this.mouse.x + camera.x;
      const worldY = this.mouse.y + camera.y;
      return {
        x: Math.floor(worldX / 32),
        y: Math.floor(worldY / 32)
      };
    }
  };
  var World = class {
    nextEntityId = 0;
    // Map<ComponentClassName, Map<EntityId, ComponentInstance>>
    components = /* @__PURE__ */ new Map();
    entities = /* @__PURE__ */ new Set();
    createEntity() {
      const id = this.nextEntityId++;
      this.entities.add(id);
      return id;
    }
    removeEntity(entity) {
      this.entities.delete(entity);
      for (const [key, map2] of this.components) {
        map2.delete(entity);
      }
    }
    addComponent(entity, component) {
      const typeName = component.constructor.name;
      if (!this.components.has(typeName)) {
        this.components.set(typeName, /* @__PURE__ */ new Map());
      }
      this.components.get(typeName).set(entity, component);
    }
    removeComponent(entity, type) {
      const typeName = type.name;
      if (this.components.has(typeName)) {
        this.components.get(typeName).delete(entity);
      }
    }
    getComponent(entity, type) {
      return this.components.get(type.name)?.get(entity);
    }
    // Returns entities that have ALL the specified component types
    query(types) {
      const result = [];
      for (const entity of this.entities) {
        const hasAll = types.every((t) => this.components.get(t.name)?.has(entity));
        if (hasAll) result.push(entity);
      }
      return result;
    }
  };

  // src/physics.ts
  var PHYSICS = {
    // Solid Item IDs
    SOLIDS: /* @__PURE__ */ new Set([
      17,
      // Wall
      18,
      // Old Tree
      19,
      // Old Rock
      34,
      // Old Bush
      37,
      // Cactus
      57,
      // Dead Tree
      100,
      // Generic Block
      200,
      // Water
      202,
      // Deep Water
      20,
      // Altar (Old?)
      21,
      // Altar (MapGen)
      50,
      // Chest
      // New Forest Props
      50,
      // Tree Pine
      51,
      // Tree Oak
      6,
      // Large Rock
      7,
      // Bush
      30,
      // Barrel
      31,
      // Crate
      // OTSP Walls
      210,
      211,
      212,
      213,
      214,
      215,
      216,
      217,
      218,
      // Custom Water
      304,
      // Standard Water
      13,
      26
    ]),
    isSolid(id) {
      return this.SOLIDS.has(id);
    }
  };

  // src/data/items.ts
  var ItemRegistry = {
    42: { name: "Short Sword", type: "weapon", attack: 10, slot: "rhand", uIndex: 42 },
    2: { name: "Plate Armor", type: "armor", defense: 8, slot: "body", uIndex: 2 },
    // Armor sprite? Need to check assets
    40: { name: "Gold Coin", type: "other", stackable: true, uIndex: 40 },
    5: { name: "Wooden Shield", type: "armor", defense: 5, slot: "lhand", uIndex: 46 },
    // Fixed: 5 was Tree, using 46 (Shield)
    41: { name: "Health Potion", type: "food", heal: 25, uIndex: 41 },
    22: { name: "Backpack", type: "container", slot: "backpack", stackable: false, uIndex: 22 },
    30: { name: "Parcel", type: "container", stackable: false, uIndex: 30 },
    21: { name: "Bag", type: "container", slot: "backpack", stackable: false, uIndex: 21 },
    // Legendary Sets (Golden)
    100: { name: "Golden Helmet", type: "armor", defense: 12, slot: "head", uIndex: 100 },
    101: { name: "Golden Armor", type: "armor", defense: 18, slot: "body", uIndex: 101 },
    102: { name: "Golden Legs", type: "armor", defense: 15, slot: "legs", uIndex: 102 },
    103: { name: "Golden Boots", type: "armor", defense: 5, slot: "boots", uIndex: 103 },
    104: { name: "Golden Shield", type: "armor", defense: 35, slot: "lhand", uIndex: 104 },
    // Elf Set
    110: { name: "Elvish Bow", type: "weapon", attack: 28, slot: "both", uIndex: 110 },
    111: { name: "Elvish Armor", type: "armor", defense: 12, slot: "body", uIndex: 111 },
    112: { name: "Elvish Legs", type: "armor", defense: 8, slot: "legs", uIndex: 112 },
    // Dwarf Set
    120: { name: "Dwarven Helmet", type: "armor", defense: 10, slot: "head", uIndex: 120 },
    121: { name: "Dwarven Armor", type: "armor", defense: 16, slot: "body", uIndex: 121 },
    122: { name: "Dwarven Legs", type: "armor", defense: 12, slot: "legs", uIndex: 122 },
    123: { name: "Dwarven Shield", type: "armor", defense: 30, slot: "lhand", uIndex: 123 },
    // --- WEAPONS: AXES (High Dmg, Low Def) ---
    // Common
    130: { name: "Hand Axe", type: "weapon", attack: 15, slot: "rhand", uIndex: 130 },
    // Uncommon
    131: { name: "Battle Axe", type: "weapon", attack: 45, slot: "both", uIndex: 131 },
    132: { name: "Orc Axe", type: "weapon", attack: 80, slot: "rhand", uIndex: 132 },
    // Rare
    133: { name: "War Axe", type: "weapon", attack: 150, slot: "rhand", uIndex: 133 },
    // Epic
    134: { name: "Executioner Axe", type: "weapon", attack: 350, slot: "rhand", uIndex: 134 },
    // --- WEAPONS: CLUBS (Modest Dmg, +Defense) ---
    140: { name: "Wooden Club", type: "weapon", attack: 8, slot: "rhand", uIndex: 131 },
    // Reusing 131 sprite? No, use correct ID
    141: { name: "Iron Mace", type: "weapon", attack: 45, slot: "rhand", uIndex: 141 },
    142: { name: "Warhammer", type: "weapon", attack: 130, slot: "rhand", uIndex: 142 },
    143: { name: "Morning Star", type: "weapon", attack: 320, slot: "rhand", uIndex: 143 },
    // --- WEAPONS: SWORDS ---
    150: { name: "Rusty Sword", type: "weapon", attack: 10, slot: "rhand", uIndex: 150 },
    151: { name: "Wooden Sword", type: "weapon", attack: 5, slot: "rhand", uIndex: 151 },
    152: { name: "Iron Sword", type: "weapon", attack: 40, slot: "rhand", uIndex: 152 },
    153: { name: "Bone Sword", type: "weapon", attack: 25, slot: "rhand", uIndex: 153 },
    154: { name: "Steel Sword", type: "weapon", attack: 120, slot: "rhand", uIndex: 154 },
    155: { name: "Demon Blade", type: "weapon", attack: 300, slot: "rhand", uIndex: 155 },
    156: { name: "Noble Sword", type: "weapon", attack: 500, slot: "rhand", uIndex: 156 },
    157: { name: "Venom Dagger", type: "weapon", attack: 150, slot: "rhand", uIndex: 157 },
    // --- ARMOR / MISC ---
    160: { name: "Wolf Pelt", type: "armor", defense: 5, slot: "body", uIndex: 160 },
    161: { name: "Bear Fur", type: "armor", defense: 25, slot: "body", uIndex: 161 },
    162: { name: "Orc Armor", type: "armor", defense: 40, slot: "body", uIndex: 162 },
    163: { name: "Skull Helm", type: "armor", defense: 10, slot: "head", uIndex: 163 },
    164: { name: "Bandit Hood", type: "armor", defense: 8, slot: "head", uIndex: 164 },
    165: { name: "Crown of Kings", type: "armor", defense: 25, slot: "head", uIndex: 165 },
    166: { name: "Dragon Shield", type: "armor", defense: 55, slot: "lhand", uIndex: 166 },
    167: { name: "Orc Shield", type: "armor", defense: 18, slot: "lhand", uIndex: 167 },
    // --- CONSUMABLES / MATS ---
    170: { name: "Wolf Meat", type: "food", heal: 15, uIndex: 170 },
    171: { name: "Rotten Flesh", type: "food", heal: -5, uIndex: 171 },
    172: { name: "Spider Silk", type: "other", uIndex: 172 },
    173: { name: "Mana Potion", type: "food", heal: 50, uIndex: 41 },
    // Visual same as potion
    // Bulk / Decor
    203: { name: "Ruby", type: "other", stackable: true, uIndex: 203 },
    204: { name: "Sapphire", type: "other", stackable: true, uIndex: 204 },
    200: { name: "Pine Tree", type: "other", uIndex: 50 },
    201: { name: "Oak Tree", type: "other", uIndex: 51 },
    202: { name: "Large Rock", type: "other", uIndex: 6 },
    // Tools
    210: { name: "Shovel", type: "weapon", attack: 8, slot: "both", uIndex: 124 },
    211: { name: "Rope", type: "other", stackable: false, uIndex: 65 },
    212: { name: "Machete", type: "weapon", attack: 15, slot: "rhand", uIndex: 43 },
    213: { name: "Pickaxe", type: "weapon", attack: 25, slot: "both", uIndex: 66 }
  };

  // src/components/npc.ts
  var NPC2 = class {
    constructor(type, dialog) {
      this.type = type;
      this.dialog = dialog;
    }
  };

  // src/components.ts
  var Position = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  var Velocity = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  var Sprite = class {
    // uIndex: Sprite ID (can include directional/anim offset)
    // frame: Animation frame (0-2)
    constructor(uIndex, size = 16, flipX = false, frame = 0, direction = 0, animState = "idle", animTimer = 0, frameDuration = 0.15) {
      this.uIndex = uIndex;
      this.size = size;
      this.flipX = flipX;
      this.frame = frame;
      this.direction = direction;
      this.animState = animState;
      this.animTimer = animTimer;
      this.frameDuration = frameDuration;
    }
  };
  var TileItem = class {
    constructor(id, count = 1) {
      this.id = id;
      this.count = count;
    }
  };
  var Tile2 = class {
    items = [];
    // Stack: [Ground, ..., TopItem]
    creature = null;
    // Entity ID of creature on this tile
    // Helper to add items easily
    add(id) {
      this.items.push(new TileItem(id));
    }
    // Helper to get top item
    top() {
      return this.items.length > 0 ? this.items[this.items.length - 1] : null;
    }
    // Helper to check if stack has a specific item ID
    has(id) {
      return this.items.some((i) => i.id === id);
    }
    // Helper to remove top item
    pop() {
      return this.items.pop();
    }
  };
  var TileMap = class {
    constructor(width, height, tileSize) {
      this.width = width;
      this.height = height;
      this.tileSize = tileSize;
      this.tiles = Array(width * height).fill(null).map(() => new Tile2());
    }
    tiles;
    getTile(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return null;
      }
      return this.tiles[y * this.width + x];
    }
  };
  var PlayerControllable2 = class {
    facingX = 0;
    facingY = 1;
    footstepTimer = 0;
  };
  var AI = class {
    // Random wander destination Y
    constructor(speed = 30, behavior = "melee", attackRange = 40, attackCooldown = 2, detectionRadius = 200, fleeHealthThreshold = 0.2) {
      this.speed = speed;
      this.behavior = behavior;
      this.attackRange = attackRange;
      this.attackCooldown = attackCooldown;
      this.detectionRadius = detectionRadius;
      this.fleeHealthThreshold = fleeHealthThreshold;
    }
    cooldownTimer = 0;
    currentState = 0 /* IDLE */;
    wanderTimer = 0;
    // Time until next wander direction
    wanderTargetX = 0;
    // Random wander destination X
    wanderTargetY = 0;
  };
  var Item2 = class {
    constructor(name2, slotType, uIndex = 0, frame = 0, direction = 0, damage = 0, price = 10, description = "", weaponType = "none", rarity = "common", defense = 0, bonusHp = 0, bonusMana = 0, isContainer = false, containerSize = 0, glowColor = void 0, glowRadius = 0) {
      this.name = name2;
      this.slotType = slotType;
      this.uIndex = uIndex;
      this.frame = frame;
      this.direction = direction;
      this.damage = damage;
      this.price = price;
      this.description = description;
      this.weaponType = weaponType;
      this.rarity = rarity;
      this.defense = defense;
      this.bonusHp = bonusHp;
      this.bonusMana = bonusMana;
      this.isContainer = isContainer;
      this.containerSize = containerSize;
      this.glowColor = glowColor;
      this.glowRadius = glowRadius;
    }
  };
  var ItemInstance2 = class {
    constructor(item, count = 1, contents = []) {
      this.item = item;
      this.count = count;
      this.contents = contents;
    }
  };
  var Inventory = class {
    // Equipment Slots
    // key: 'head', 'body', 'legs', 'boots', 'lhand', 'rhand', 'amulet', 'ring', 'ammo', 'backpack'
    equipment = /* @__PURE__ */ new Map();
    gold = 0;
    cap = 400;
    // The Main Backpack Container is usually the item in the 'backpack' slot.
    // However, for ease of access, we might reference the "Active Container" here.
    // Or we just read equipment.get('backpack').contents
    constructor() {
    }
    // Helper
    getEquipped(slot) {
      return this.equipment.get(slot);
    }
    equip(slot, item) {
      this.equipment.set(slot, item);
    }
    unequip(slot) {
      this.equipment.delete(slot);
    }
    // --- Legacy / Convenience Helpers ---
    // Find an item instance by name (searches equipment + backpack)
    findItemByName(name2) {
      for (const [slot, inst] of this.equipment) {
        if (inst.item.name === name2) return { instance: inst, container: "equipment", slot };
      }
      const bag = this.equipment.get("backpack");
      if (bag && bag.contents) {
        const found = bag.contents.find((i) => i && i.item.name === name2);
        if (found) return { instance: found, container: "backpack", parent: bag };
      }
      return null;
    }
    // Check if player has item
    hasItem(name2) {
      return !!this.findItemByName(name2);
    }
    // Remove item (Decrements count or removes)
    removeItem(name2, count = 1) {
      const result = this.findItemByName(name2);
      if (!result) return false;
      const { instance, container, slot, parent } = result;
      if (instance.count > count) {
        instance.count -= count;
        return true;
      } else {
        if (container === "equipment" && slot) {
          this.equipment.delete(slot);
        } else if (container === "backpack" && parent) {
          parent.contents = parent.contents.filter((i) => i !== instance);
        }
        return true;
      }
    }
    // Add item to backpack (or first empty slot logic later)
    addItem(item, count = 1) {
      const bag = this.equipment.get("backpack");
      if (!bag) {
        if (item.name === "Backpack") {
          this.equip("backpack", new ItemInstance2(item, count));
          return true;
        }
        return false;
      }
      const stackMatch = bag.contents.find((i) => i.item.name === item.name);
      if (stackMatch) {
        stackMatch.count += count;
        return true;
      }
      if (bag.contents.length < 20) {
        bag.contents.push(new ItemInstance2(item, count));
        return true;
      }
      return false;
    }
  };
  var Health = class {
    constructor(current, max) {
      this.current = current;
      this.max = max;
    }
  };
  var Camera = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  var Particle = class {
    constructor(life, maxLife, color, size, vx, vy) {
      this.life = life;
      this.maxLife = maxLife;
      this.color = color;
      this.size = size;
      this.vx = vx;
      this.vy = vy;
    }
  };
  var FloatingText = class {
    constructor(text, color = "#fff", life = 1, maxLife = 1) {
      this.text = text;
      this.color = color;
      this.life = life;
      this.maxLife = maxLife;
    }
  };
  var Name = class {
    constructor(value) {
      this.value = value;
    }
  };
  var QuestLog = class {
    quests = [];
    completedQuestIds = [];
  };
  var QuestGiver = class {
    constructor(availableQuests, name2 = "Quest Giver") {
      this.availableQuests = availableQuests;
      this.name = name2;
    }
  };
  var Facing = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  var Corpse = class {
    constructor(decayTimer = 300) {
      this.decayTimer = decayTimer;
    }
  };
  var Mana = class {
    constructor(current, max) {
      this.current = current;
      this.max = max;
    }
  };
  var Experience = class {
    constructor(current, next, level) {
      this.current = current;
      this.next = next;
      this.level = level;
    }
  };
  var Skill = class {
    constructor(level = 10, xp = 0) {
      this.level = level;
      this.xp = xp;
    }
  };
  var Skills = class {
    sword = new Skill();
    axe = new Skill();
    club = new Skill();
    distance = new Skill();
    shielding = new Skill();
    magic = new Skill(0, 0);
    // Magic Level (0 start)
  };
  var SpellBook = class {
    // Spell Name -> Level (0 = locked, 1+ = learned)
    knownSpells = /* @__PURE__ */ new Map();
    constructor() {
      this.knownSpells.set("Fireball", 1);
    }
  };
  var SkillPoints = class {
    constructor(current = 0, total = 0) {
      this.current = current;
      this.total = total;
    }
  };
  var ActiveSpell = class {
    constructor(spellName = "Fireball") {
      this.spellName = spellName;
    }
  };
  var StatusEffect = class {
    // Type: 'frozen', 'burning', 'poison'
    constructor(type, duration, power = 0) {
      this.type = type;
      this.duration = duration;
      this.power = power;
    }
  };
  var Vocation = class {
    constructor(name2, hpGain, manaGain, capGain) {
      this.name = name2;
      this.hpGain = hpGain;
      this.manaGain = manaGain;
      this.capGain = capGain;
    }
  };
  var VOCATIONS = {
    knight: { name: "Knight", hpGain: 15, manaGain: 5, capGain: 25, startHp: 150, startMana: 20, startCap: 450 },
    mage: { name: "Mage", hpGain: 5, manaGain: 30, capGain: 10, startHp: 80, startMana: 100, startCap: 300 },
    ranger: { name: "Ranger", hpGain: 10, manaGain: 15, capGain: 20, startHp: 100, startMana: 60, startCap: 380 },
    paladin: { name: "Paladin", hpGain: 10, manaGain: 15, capGain: 20, startHp: 120, startMana: 60, startCap: 400 }
    // Balanced Hybrid
  };
  var Target = class {
    constructor(targetId) {
      this.targetId = targetId;
    }
  };
  var Teleporter = class {
    constructor(targetX, targetY) {
      this.targetX = targetX;
      this.targetY = targetY;
    }
  };
  var Tint = class {
    constructor(color) {
      this.color = color;
    }
  };
  var LightSource = class {
    constructor(radius, color, flickers = false) {
      this.radius = radius;
      this.color = color;
      this.flickers = flickers;
    }
  };
  var Decay = class {
    constructor(life) {
      this.life = life;
    }
  };
  var Lootable = class {
    constructor(items = []) {
      this.items = items;
    }
  };
  var Passives = class {
    constructor(vitality = 0, spirit = 0, agility = 0, might = 0) {
      this.vitality = vitality;
      this.spirit = spirit;
      this.agility = agility;
      this.might = might;
    }
  };
  var StatusOnHit = class {
    constructor(effectType, chance = 0.3, duration = 5, power = 5) {
      this.effectType = effectType;
      this.chance = chance;
      this.duration = duration;
      this.power = power;
    }
  };
  var DungeonEntrance = class {
    constructor(dungeonType, label = "Enter Dungeon") {
      this.dungeonType = dungeonType;
      this.label = label;
    }
  };
  var DungeonExit = class {
    constructor(label = "Exit to World") {
      this.label = label;
    }
  };
  var Collider = class {
    constructor(width, height, offsetX = 0, offsetY = 0) {
      this.width = width;
      this.height = height;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
    }
  };
  var Stats = class {
    constructor(attack = 10, defense = 0, attackSpeed = 1, range = 48) {
      this.attack = attack;
      this.defense = defense;
      this.attackSpeed = attackSpeed;
      this.range = range;
    }
  };
  var CombatState = class {
    lastAttackTime = 0;
    constructor() {
    }
  };
  var Interactable = class {
    constructor(actionName = "Interact") {
      this.actionName = actionName;
    }
  };
  var Merchant = class {
    constructor(items = []) {
      this.items = items;
    }
  };
  var RegenState = class {
    hpTimer = 0;
    manaTimer = 0;
    constructor() {
    }
  };

  // src/map_gen.ts
  init_constants();

  // src/rng.ts
  var RNG = class {
    seed;
    constructor(seed) {
      this.seed = seed;
    }
    // Linear Congruential Generator (LCG)
    // Parameters from numerical recipes or similar standard constants
    next() {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    }
    // Returns integer in [0, max-1]
    nextInt(max) {
      return Math.floor(this.next() * max);
    }
  };

  // src/map_gen.ts
  function generateOverworld(width, height, seed) {
    const rng = new RNG(seed);
    const tiles = Array(width * height).fill(null).map(() => new Tile());
    const entities = [];
    const GRASS = SPRITES.GRASS_FLOWERS;
    const WALL = SPRITES.STONE_WALL;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const townRadius = 12;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          tiles[index].add(WALL);
          continue;
        }
        const rand = rng.next();
        if (rand > 0.95) tiles[index].add(SPRITES.GRASS_FLOWERS);
        else if (rand > 0.9) tiles[index].add(SPRITES.DIRT);
        else tiles[index].add(SPRITES.GRASS);
        const dist = Math.abs(x - centerX) + Math.abs(y - centerY);
        if (dist > 3) {
          if (rng.next() > 0.96) {
            const obs = rng.next() > 0.6 ? SPRITES.OAK_TREE : SPRITES.ROCK;
            tiles[index].add(obs);
          }
        }
      }
    }
    for (let y = centerY - townRadius; y <= centerY + townRadius; y++) {
      for (let x = centerX - townRadius; x <= centerX + townRadius; x++) {
        const index = y * width + x;
        const isBorder = x === centerX - townRadius || x === centerX + townRadius || y === centerY - townRadius || y === centerY + townRadius;
        if (isBorder) {
          if (!tiles[index].has(WALL)) tiles[index].add(WALL);
        } else {
          while (tiles[index].has(WALL)) tiles[index].pop();
          tiles[index].items = [];
          tiles[index].add(SPRITES.COBBLE);
        }
      }
    }
    const templeRadius = 2;
    const FLOOR_TEMPLE = SPRITES.FLOOR_STONE;
    for (let y = centerY - templeRadius; y <= centerY + templeRadius; y++) {
      for (let x = centerX - templeRadius; x <= centerX + templeRadius; x++) {
        const index = y * width + x;
        tiles[index].items = [];
        tiles[index].add(FLOOR_TEMPLE);
        if (x === centerX - templeRadius || x === centerX + templeRadius || y === centerY - templeRadius || y === centerY + templeRadius) {
          if (x === centerX && y === centerY + templeRadius) {
          } else {
            tiles[index].add(SPRITES.WALL);
          }
        }
      }
    }
    const altarIdx = centerY * width + centerX;
    tiles[altarIdx].add(SPRITES.TORCH);
    const chestIdx = centerY * width + (centerX + 1);
    tiles[chestIdx].add(SPRITES.CRATE);
    const openGate = (x, y) => {
      const idx = y * width + x;
      while (tiles[idx].has(WALL)) tiles[idx].pop();
      if (tiles[idx].items.length === 0) tiles[idx].add(SPRITES.COBBLE);
    };
    openGate(centerX, centerY - townRadius);
    openGate(centerX - 1, centerY - townRadius);
    openGate(centerX, centerY + townRadius);
    openGate(centerX - 1, centerY + townRadius);
    openGate(centerX + townRadius, centerY);
    openGate(centerX - townRadius, centerY);
    const enemyCount = 60;
    for (let i = 0; i < enemyCount; i++) {
      let ex = 0, ey = 0, attempts = 0;
      let valid = false;
      while (!valid && attempts < 50) {
        ex = rng.nextInt(width);
        ey = rng.nextInt(height);
        attempts++;
        const idx = ey * width + ex;
        if (tiles[idx].has(WALL) || tiles[idx].has(SPRITES.WALL)) continue;
        const distFromCenter = Math.abs(ex - centerX) + Math.abs(ey - centerY);
        if (distFromCenter > townRadius + 8) {
          valid = true;
        }
      }
      if (valid) {
        const roll = rng.next();
        let monsterKey = "rat";
        if (roll > 0.9) monsterKey = "slime";
        else if (roll > 0.8) monsterKey = "orc";
        else if (roll > 0.7) monsterKey = "skeleton";
        else if (roll > 0.4) monsterKey = "wolf";
        entities.push({
          type: "enemy",
          x: ex * 32,
          y: ey * 32,
          enemyType: monsterKey
          // Passed as string to Game
        });
      }
    }
    const testIdx = 26 * width + 26;
    if (tiles[testIdx]) {
      while (tiles[testIdx].has(WALL)) tiles[testIdx].pop();
      tiles[testIdx].add(SPRITES.TREE_OAK);
      console.log(`[MapGen] FORCED TREE(51) at 26,26. Tile Items NOW:`, tiles[testIdx].items.map((i) => i.id));
    }
    const boxIdx = 27 * width + 27;
    if (tiles[boxIdx]) {
      while (tiles[boxIdx].has(WALL)) tiles[boxIdx].pop();
      tiles[boxIdx].add(SPRITES.ROCK_LARGE);
    }
    const waterIdx = (centerY + 5) * width + (centerX + 5);
    tiles[waterIdx].items = [];
    tiles[waterIdx].add(SPRITES.WATER);
    console.log("[MapGen] Town and Walls Generated (Stack Mode).");
    return { width, height, tileSize: 32, tiles, entities };
  }
  function generateDungeon(width, height, type = "dungeon") {
    const tiles = Array(width * height).fill(null).map(() => new Tile());
    const entities = [];
    const rng = new RNG(1337);
    const WALL_STONE = SPRITES.WALL_STONE;
    const FLOOR_STONE = SPRITES.FLOOR_STONE;
    const WALL_CAVE = SPRITES.WALL_CAVE || 17;
    const FLOOR_CAVE = SPRITES.FLOOR_DIRT || 11;
    const WALL = type === "cave" ? WALL_CAVE : WALL_STONE;
    const FLOOR = type === "cave" ? FLOOR_CAVE : FLOOR_STONE;
    if (type === "dungeon") {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          tiles[idx].add(FLOOR);
          if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            tiles[idx].add(WALL);
          }
        }
      }
    } else {
      const map2 = new Int8Array(width * height);
      for (let i = 0; i < width * height; i++) map2[i] = rng.next() < 0.45 ? 1 : 0;
      for (let iter = 0; iter < 4; iter++) {
        const newMap = new Int8Array(width * height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let walls = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) walls++;
                else if (map2[ny * width + nx] === 1) walls++;
              }
            }
            const idx = y * width + x;
            if (map2[idx] === 1) newMap[idx] = walls >= 4 ? 1 : 0;
            else newMap[idx] = walls >= 5 ? 1 : 0;
          }
        }
        for (let i = 0; i < width * height; i++) map2[i] = newMap[i];
      }
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          tiles[idx].add(FLOOR);
          if (map2[idx] === 1 || x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            tiles[idx].add(WALL_CAVE);
          } else {
            if (rng.next() > 0.98) tiles[idx].add(SPRITES.ROCK);
          }
        }
      }
    }
    let exitPlaced = false;
    let attempts = 0;
    while (!exitPlaced && attempts < 100) {
      const x = Math.floor(width / 2) + Math.floor((rng.next() - 0.5) * 10);
      const y = Math.floor(height / 2) + Math.floor((rng.next() - 0.5) * 10);
      const idx = y * width + x;
      if (x > 1 && x < width - 1 && y > 1 && y < height - 1) {
        const hasWall = tiles[idx].items.some((i) => i.id === WALL || i.id === WALL_CAVE);
        if (!hasWall) {
          tiles[idx].add(SPRITES.ROPE_SPOT);
          entities.push({ type: "dungeon_exit", x: x * 32, y: y * 32 });
          exitPlaced = true;
        }
      }
      attempts++;
    }
    console.log(`[MapGen] Generated ${type} map.`);
    return { width, height, tileSize: 32, tiles, entities };
  }

  // src/data/spells.ts
  var SPELLS = {
    "exura": {
      name: "Light Healing",
      words: "exura",
      mana: 20,
      level: 1,
      cooldown: 1,
      type: "instant",
      effect: "heal",
      power: 30
    },
    "utani hur": {
      name: "Haste",
      words: "utani hur",
      mana: 60,
      level: 4,
      cooldown: 2,
      type: "instant",
      effect: "haste",
      power: 1.5
      // 50% Speed boost
    },
    "exori": {
      name: "Berserk",
      words: "exori",
      mana: 100,
      level: 5,
      cooldown: 4,
      type: "instant",
      effect: "damage_aoe",
      power: 150
    },
    "exevo pan": {
      name: "Create Food",
      words: "exevo pan",
      mana: 40,
      level: 2,
      cooldown: 10,
      type: "instant",
      effect: "create_food",
      power: 1
    }
  };
  function findSpellByWords(text) {
    const lower = text.toLowerCase().trim();
    return Object.values(SPELLS).find((s) => s.words === lower);
  }

  // src/data/mobs.ts
  init_constants();
  var MOB_REGISTRY = {
    "wolf": {
      name: "Wolf",
      hp: 60,
      speed: 70,
      xp: 35,
      spriteIndex: SPRITES.WOLF,
      behavior: "aggressive",
      lootTable: "wolf"
    },
    "bear": {
      name: "Bear",
      hp: 140,
      speed: 55,
      xp: 90,
      spriteIndex: SPRITES.BEAR,
      behavior: "neutral",
      lootTable: "bear"
    },
    "spider": {
      name: "Giant Spider",
      hp: 80,
      speed: 90,
      xp: 60,
      spriteIndex: SPRITES.SPIDER || 44,
      // Fallback if missing
      behavior: "aggressive",
      lootTable: "spider"
    },
    "orc": {
      name: "Orc Warrior",
      hp: 120,
      speed: 60,
      xp: 110,
      spriteIndex: SPRITES.ORC || 58,
      behavior: "aggressive",
      lootTable: "orc",
      equipment: {
        rhand: 132,
        // Orc Axe
        lhand: 167,
        // Orc Shield
        body: 162
        // Orc Armor
      }
    },
    "bandit": {
      name: "Bandit",
      hp: 90,
      speed: 80,
      xp: 65,
      spriteIndex: 56,
      // Human sprite?
      behavior: "aggressive",
      lootTable: "bandit",
      equipment: {
        rhand: 152,
        // Iron Sword
        head: 164
        // Hood
      }
    },
    "skeleton": {
      name: "Skeleton",
      hp: 45,
      speed: 50,
      xp: 40,
      spriteIndex: SPRITES.SKELETON,
      behavior: "aggressive",
      lootTable: "skeleton",
      equipment: {
        rhand: 153
        // Bone Sword
      }
    },
    "zombie": {
      name: "Zombie",
      hp: 100,
      speed: 30,
      // Slow
      xp: 55,
      spriteIndex: SPRITES.ZOMBIE,
      behavior: "aggressive",
      lootTable: "zombie"
    },
    "ghost": {
      name: "Ghost",
      hp: 60,
      speed: 60,
      xp: 75,
      spriteIndex: SPRITES.GHOST,
      behavior: "aggressive",
      lootTable: "ghost"
    },
    "slime": {
      name: "Slime",
      hp: 30,
      speed: 25,
      xp: 15,
      spriteIndex: SPRITES.SLIME,
      behavior: "aggressive",
      lootTable: "slime"
    },
    "necromancer": {
      name: "Necromancer",
      hp: 300,
      speed: 65,
      xp: 600,
      spriteIndex: SPRITES.NECROMANCER,
      behavior: "aggressive",
      lootTable: "necromancer",
      equipment: {
        head: 163
        // Skull Helm
      }
    }
  };

  // src/data/loot_tables.ts
  var LOOT_TABLES = {
    // --- ANIMALS ---
    "wolf": [
      { itemId: 170, chance: 0.3, min: 1, max: 1 },
      // Meat
      { itemId: 160, chance: 0.15 }
      // Pelt
    ],
    "bear": [
      { itemId: 161, chance: 0.2 },
      // Bear Fur
      { itemId: 170, chance: 0.6, min: 1, max: 3 }
      // Meat
    ],
    "spider": [
      { itemId: 172, chance: 0.4 },
      // Silk
      { itemId: 157, chance: 0.05 }
      // Venom Dagger
    ],
    // --- HUMANOIDS ---
    "bandit": [
      { itemId: 40, chance: 0.5, min: 2, max: 10 },
      // Gold
      { itemId: 164, chance: 0.15 },
      // Hood
      { itemId: 152, chance: 0.1 },
      // Iron Sword
      { itemId: 41, chance: 0.25 }
      // Health Potion
    ],
    "orc": [
      { itemId: 40, chance: 0.4, min: 3, max: 15 },
      { itemId: 132, chance: 0.08 },
      // Orc Axe
      { itemId: 162, chance: 0.03 },
      // Orc Armor
      { itemId: 167, chance: 0.04 },
      // Orc Shield
      { itemId: 41, chance: 0.15 }
      // Potion
    ],
    // --- UNDEAD ---
    "skeleton": [
      { itemId: 153, chance: 0.1 },
      // Bone Sword
      { itemId: 140, chance: 0.15 },
      // Wooden Club
      { itemId: 163, chance: 0.08 },
      // Skull Helm
      { itemId: 40, chance: 0.2, min: 1, max: 5 }
      // Gold
    ],
    "zombie": [
      { itemId: 171, chance: 0.4 },
      // Rotten Flesh
      { itemId: 150, chance: 0.1 },
      // Rusty Sword
      { itemId: 130, chance: 0.08 }
      // Hand Axe
    ],
    "ghost": [
      { itemId: 203, chance: 0.05 },
      // Ruby (Ectoplasm placeholder)
      { itemId: 173, chance: 0.15 }
      // Mana Potion
    ],
    "slime": [
      { itemId: 40, chance: 0.3, min: 1, max: 3 },
      // Gold
      { itemId: 173, chance: 0.1 }
      // Mana Potion
    ],
    "crypt_keeper": [
      { itemId: 153, chance: 0.5 },
      // Bone Sword
      { itemId: 163, chance: 0.3 },
      // Skull Helm
      { itemId: 173, chance: 0.4 }
      // Mana Potion
    ],
    "necromancer": [
      { itemId: 163, chance: 0.2 },
      // Skull Helm
      { itemId: 155, chance: 0.05 },
      // Demon Blade (Legendary!)
      { itemId: 173, chance: 0.6, min: 1, max: 2 },
      // Mana Potions
      { itemId: 203, chance: 0.1 }
      // Ruby
    ],
    // --- BOSSES ---
    "boss": [
      { itemId: 166, chance: 0.5 },
      // Dragon Shield
      { itemId: 165, chance: 0.2 },
      // Crown of Kings
      { itemId: 143, chance: 0.4 },
      // Morning Star
      { itemId: 40, chance: 1, min: 100, max: 500 }
      // Gold
    ]
  };

  // src/data/bulk_constants.ts
  var BULK_SPRITES = {
    REC_2: 1e3,
    VISAN_3: 1001,
    ANDREEW: 1002,
    ANEVIS: 1003,
    ARKAN: 1004,
    BEACHBOYX: 1005,
    BRENONETO: 1006,
    CAT: 1007,
    CELIX: 1008,
    CORVO: 1009,
    DANIEL: 1010,
    DAWTORR: 1011,
    DESPUTE: 1012,
    ELDERDARK: 1013,
    ERICK_ETCHEBEUR: 1014,
    FRENVIUS: 1015,
    GALIANT: 1016,
    GHOSTX: 1017,
    HALFAWAY: 1018,
    HUNTER_KILLER: 1019,
    JACOBS: 1020,
    LANDERA: 1021,
    LESHROT: 1022,
    MADARADA: 1023,
    MADARADA_2: 1024,
    NECHROS: 1025,
    NOGARD: 1026,
    NORDBERG: 1027,
    NOXZ: 1028,
    NU77: 1029,
    PEONSO: 1030,
    RANZOR: 1031,
    SAM_DROST: 1032,
    SAPHRON: 1033,
    SHERICE: 1034,
    SHIVA_SHADOWSONG: 1035,
    SHIVA_SHADOWSONG_2: 1036,
    SLAAKE: 1037,
    SOMNI: 1038,
    THORN: 1039,
    TOKUME: 1040,
    VENESIS: 1041,
    WAY20: 1042,
    WETO: 1043,
    WORR: 1044,
    DAMI1310: 1045,
    LIONKOBIN: 1046,
    MARKINDOOT: 1047,
    MAXMILLERXD: 1048,
    WESLEYT10: 1049
  };

  // src/game.ts
  var TEMPLE_POS = { x: 25 * 32, y: 25 * 32 };
  function attemptCastSpell(world2, player2, text, ui2) {
    const spell = findSpellByWords(text);
    if (!spell) return false;
    const mana = world2.getComponent(player2, Mana);
    if (!mana || mana.current < spell.mana) {
      if (ui2.console) ui2.console.addSystemMessage("Not enough mana.");
      return true;
    }
    mana.current -= spell.mana;
    const pPos = world2.getComponent(player2, Position);
    switch (spell.effect) {
      case "heal":
        const hp = world2.getComponent(player2, Health);
        if (hp) {
          hp.current = Math.min(hp.max, hp.current + spell.power);
          spawnFloatingText(world2, pPos.x, pPos.y, `+${spell.power}`, "#5f5");
          spawnParticle(world2, pPos.x, pPos.y, "#5f5");
        }
        break;
      case "haste":
        const passive = world2.getComponent(player2, Passives);
        if (passive) {
          world2.addComponent(player2, new StatusEffect("haste", 10, spell.power));
          spawnFloatingText(world2, pPos.x, pPos.y, "Haste!", "#ff5");
        }
        break;
      case "damage_aoe":
        const enemies = world2.query([Health, Position, Name]);
        let hitCount = 0;
        for (const eid of enemies) {
          if (world2.getComponent(eid, PlayerControllable2)) continue;
          const ePos = world2.getComponent(eid, Position);
          const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
          if (dist < 50) {
            const eHp = world2.getComponent(eid, Health);
            eHp.current -= spell.power;
            spawnFloatingText(world2, ePos.x, ePos.y, `${spell.power}`, "#f55");
            spawnBloodEffect(world2, ePos.x, ePos.y);
            hitCount++;
            if (eHp.current <= 0) {
            }
          }
        }
        if (hitCount === 0) {
          if (ui2.console) ui2.console.addSystemMessage("No target for Exori.");
        }
        spawnParticle(world2, pPos.x, pPos.y, "#f33");
        break;
      case "create_food":
        createItem(world2, pPos.x, pPos.y, createItemFromRegistry(SPRITES.BARREL));
        break;
    }
    if (ui2.console) ui2.console.addSystemMessage(`Cast ${spell.name}.`);
    return true;
  }
  function teleportSystem(world2, ui2) {
    const player2 = world2.query([PlayerControllable2, Position])[0];
    if (player2 === void 0) return;
    const pPos = world2.getComponent(player2, Position);
    const teleporters = world2.query([Teleporter, Position]);
    for (const tid of teleporters) {
      const tPos = world2.getComponent(tid, Position);
      const dest = world2.getComponent(tid, Teleporter);
      const pad = 10;
      if (pPos.x + pad < tPos.x + 32 && pPos.x + 32 - pad > tPos.x && pPos.y + pad < tPos.y + 32 && pPos.y + 32 - pad > tPos.y) {
        console.log(`[Game] Teleporting logic triggered to ${dest.targetX}, ${dest.targetY}`);
        pPos.x = dest.targetX * TILE_SIZE;
        pPos.y = dest.targetY * TILE_SIZE;
        if (ui2.console) ui2.console.addSystemMessage("Teleported.");
        return;
      }
    }
  }
  function inputSystem(world2, input2) {
    const entities = world2.query([PlayerControllable2, Velocity]);
    for (const id of entities) {
      let speed = 100;
      const passives = world2.getComponent(id, Passives);
      if (passives) speed += passives.agility * 5;
      const vel = world2.getComponent(id, Velocity);
      const pc = world2.getComponent(id, PlayerControllable2);
      const sprite = world2.getComponent(id, Sprite);
      const pos = world2.getComponent(id, Position);
      vel.x = 0;
      vel.y = 0;
      let dir = input2.getDirection();
      let isMoving = dir.x !== 0 || dir.y !== 0;
      if (!isMoving) {
        const targetComp = world2.getComponent(id, Target);
        if (targetComp) {
          const tPos = world2.getComponent(targetComp.targetId, Position);
          const tHp = world2.getComponent(targetComp.targetId, Health);
          if (tPos && tHp && tHp.current > 0) {
            const dx = tPos.x + 8 - (pos.x + 8);
            const dy = tPos.y + 8 - (pos.y + 8);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 20) {
              const moveX = dx / dist;
              const moveY = dy / dist;
              vel.x = moveX * speed;
              vel.y = moveY * speed;
              dir = {
                x: Math.abs(moveX) > 0.5 ? Math.sign(moveX) : 0,
                y: Math.abs(moveY) > 0.5 ? Math.sign(moveY) : 0
              };
              isMoving = true;
            }
          } else {
            world2.removeComponent(id, Target);
          }
        }
      }
      if (isMoving) {
        if (input2.getDirection().x !== 0 || input2.getDirection().y !== 0) {
          vel.x = dir.x * speed;
          vel.y = dir.y * speed;
        }
        if (dir.x < 0) {
          pc.facingX = -1;
          pc.facingY = 0;
          if (sprite) {
            sprite.uIndex = 2;
            sprite.direction = 2;
            sprite.flipX = true;
          }
        } else if (dir.x > 0) {
          pc.facingX = 1;
          pc.facingY = 0;
          if (sprite) {
            sprite.uIndex = 2;
            sprite.direction = 3;
            sprite.flipX = false;
          }
        } else if (dir.y < 0) {
          pc.facingX = 0;
          pc.facingY = -1;
          if (sprite) {
            sprite.uIndex = 1;
            sprite.direction = 1;
            sprite.flipX = false;
          }
        } else if (dir.y > 0) {
          pc.facingX = 0;
          pc.facingY = 1;
          if (sprite) {
            sprite.uIndex = 0;
            sprite.direction = 0;
            sprite.flipX = false;
          }
        }
        if (sprite) {
          const now = Date.now();
          sprite.frame = 1 + Math.floor(now / 150) % 2;
        }
      } else {
        if (sprite) sprite.frame = 1;
      }
      if (input2.isDown("KeyU")) {
        pos.x = 4096;
        pos.y = 4096;
      }
      if (input2.isDown("KeyH") && input2.isJustPressed("KeyH")) {
        pos.x = 4096;
        pos.y = 4096;
        spawnFloatingText(world2, 4096, 4096, "\u2193\u2193 VILLAGE \u2193\u2193", "#ff00ff");
      }
    }
  }
  function spawnBloodEffect(world2, x, y) {
    const count = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const e = world2.createEntity();
      world2.addComponent(e, new Position(x + 8, y + 8));
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 30;
      const shade = Math.floor(Math.random() * 100);
      const color = `rgb(${180 + shade}, ${20 + Math.floor(shade * 0.3)}, ${10 + Math.floor(shade * 0.2)})`;
      world2.addComponent(e, new Particle(0.4 + Math.random() * 0.3, 0.7, color, 2 + Math.floor(Math.random() * 2), vx, vy));
    }
  }
  function aiSystem(world2, dt) {
    const players = world2.query([PlayerControllable2, Position, Health]);
    if (players.length === 0) return;
    const pPos = world2.getComponent(players[0], Position);
    const pHp = world2.getComponent(players[0], Health);
    const entities = world2.query([AI, Position, Velocity]);
    for (const id of entities) {
      const ai = world2.getComponent(id, AI);
      const pos = world2.getComponent(id, Position);
      const vel = world2.getComponent(id, Velocity);
      const hp = world2.getComponent(id, Health);
      const targetComp = world2.getComponent(id, Target);
      const dx = pPos.x + 16 - (pos.x + 16);
      const dy = pPos.y + 16 - (pos.y + 16);
      const dist = Math.sqrt(dx * dx + dy * dy);
      let targetX = ai.wanderTargetX;
      let targetY = ai.wanderTargetY;
      let moveSpeed = 0;
      if (hp && hp.current < hp.max * 0.2) {
        ai.behavior = "flee";
        if (targetComp) targetComp.targetId = null;
      }
      if (ai.behavior === "flee") {
        if (dist < ai.detectionRadius * 1.5) {
          targetX = pos.x - dx;
          targetY = pos.y - dy;
          moveSpeed = ai.speed * 1.5;
        } else {
          moveSpeed = 0;
        }
      } else if (dist < ai.detectionRadius && pHp.current > 0) {
        targetX = pPos.x;
        targetY = pPos.y;
        moveSpeed = ai.speed;
        if (targetComp) targetComp.targetId = players[0];
        if (dist < 40) {
          moveSpeed = 0;
        }
      } else {
        if (targetComp) targetComp.targetId = null;
        ai.wanderTimer -= dt;
        if (ai.wanderTimer <= 0) {
          ai.wanderTimer = 2 + Math.random() * 3;
          const wanderRad = 100;
          ai.wanderTargetX = pos.x + (Math.random() * wanderRad * 2 - wanderRad);
          ai.wanderTargetY = pos.y + (Math.random() * wanderRad * 2 - wanderRad);
        }
        targetX = ai.wanderTargetX;
        targetY = ai.wanderTargetY;
        const wdx = targetX - pos.x;
        const wdy = targetY - pos.y;
        const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
        if (wdist > 10) {
          moveSpeed = ai.speed * 0.5;
        } else {
          moveSpeed = 0;
        }
      }
      if (moveSpeed > 0) {
        const mdx = targetX - pos.x;
        const mdy = targetY - pos.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist > 0) {
          vel.x = mdx / mdist * moveSpeed;
          vel.y = mdy / mdist * moveSpeed;
          const sprite = world2.getComponent(id, Sprite);
          if (sprite) {
            if (Math.abs(mdx) > Math.abs(mdy)) {
              sprite.direction = mdx > 0 ? 3 : 2;
              sprite.flipX = mdx < 0;
            } else {
              sprite.direction = mdy > 0 ? 0 : 1;
            }
          }
        }
      } else {
        vel.x = 0;
        vel.y = 0;
      }
    }
  }
  function uiInteractionSystem(world2, ui2, input2, player2, map2, renderer2) {
    const TILE_SIZE2 = 32;
    const canvas2 = renderer2.ctx.canvas;
    const camX = Math.floor(player2.x * TILE_SIZE2 - canvas2.width / 2 + TILE_SIZE2 / 2);
    const camY = Math.floor(player2.y * TILE_SIZE2 - canvas2.height / 2 + TILE_SIZE2 / 2);
    const worldMouseX = input2.mouse.x + camX;
    const worldMouseY = input2.mouse.y + camY;
    if (input2.isJustPressed("KeyE")) {
      console.log("[Game] Key E pressed. Checking interactables...");
      const pPos = world2.getComponent(player2.id, Position);
      const interactables = world2.query([Position, Interactable, Merchant]);
      console.log(`[Game] Found ${interactables.length} merchants.`);
      let foundMerchant = false;
      for (const eid of interactables) {
        const ePos = world2.getComponent(eid, Position);
        const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
        console.log(`[Game] Distance to merchant ${eid}: ${dist}`);
        if (dist < 200) {
          const merchant = world2.getComponent(eid, Merchant);
          const name2 = world2.getComponent(eid, Name);
          console.log(`Interacting with Merchant: ${name2 ? name2.value : "Unknown"}`);
          ui2.toggleShop(merchant, name2 ? name2.value : "Merchant");
          foundMerchant = true;
          break;
        }
      }
      if (!foundMerchant) {
        const lootables = world2.query([Position, Lootable]);
        for (const eid of lootables) {
          const ePos = world2.getComponent(eid, Position);
          const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
          if (dist < 48) {
            const lootComp = world2.getComponent(eid, Lootable);
            const nameComp = world2.getComponent(eid, Name);
            const entName = nameComp ? nameComp.value : "Remains";
            console.log(`[Game] Opening Loot Container: ${entName}`);
            ui2.toggleLoot(eid, entName, lootComp.items);
            foundMerchant = true;
            break;
          }
        }
      }
    }
    if (input2.isJustPressed("MouseRight")) {
      const lootables = world2.query([Position, Lootable]);
      let interactedWithEntity = false;
      for (const eid of lootables) {
        const pos = world2.getComponent(eid, Position);
        if (worldMouseX >= pos.x && worldMouseX < pos.x + 32 && worldMouseY >= pos.y && worldMouseY < pos.y + 32) {
          const name2 = world2.getComponent(eid, Name);
          const loot = world2.getComponent(eid, Lootable);
          console.log(`[Game] Opening Corpse/Container: ${name2 ? name2.value : "Unknown"} (ID: ${eid})`);
          ui2.toggleLoot(eid, name2 ? name2.value : "Corpse", loot.items || []);
          interactedWithEntity = true;
          break;
        }
      }
      if (interactedWithEntity) {
      } else {
        const hit = renderer2.getObjectAt(map2, player2, worldMouseX, worldMouseY);
        if (hit && hit.item) {
          console.log(`[UI] Right Clicked Item: ${hit.item.id}`);
          const itemDef = createItemFromRegistry(hit.item.id);
          if (itemDef.isContainer) {
            const runtimeItem = hit.item;
            if (!runtimeItem.inventory) {
              runtimeItem.inventory = [
                // Default Loot
                { item: createItemFromRegistry(2), count: 1 },
                // Sword
                { item: createItemFromRegistry(7), count: 3 }
                // Potions
              ];
              runtimeItem.capacity = 8;
            }
            ui2.openContainer(runtimeItem);
          } else {
            console.log("Used item (not implemented)");
            if (itemDef.type === "food") {
            }
          }
        }
      }
    }
    if (input2.isJustPressed("MouseLeft")) {
      const uiHit = ui2.getContainerSlotAt(input2.mouse.x, input2.mouse.y);
      if (uiHit) {
        const container = ui2.openContainers[uiHit.containerIndex].item;
        if (container.inventory && container.inventory[uiHit.slotIndex]) {
          const itemInst = container.inventory[uiHit.slotIndex];
          ui2.draggedItem = itemInst.item;
          ui2.draggedItem = container.inventory[uiHit.slotIndex];
          ui2.draggingFrom = { type: "container", index: uiHit.slotIndex, containerIndex: uiHit.containerIndex };
        }
      } else {
        const hit = renderer2.getObjectAt(map2, player2, worldMouseX, worldMouseY);
        if (hit && hit.item && hit.item.id !== 0) {
          ui2.draggedItem = hit.item;
          ui2.draggingFrom = { type: "world", index: 0 };
          ui2.draggingFrom = { type: "world", index: 0 };
          const tileIdx = hit.y * map2.width + hit.x;
          ui2.draggingFrom = { type: "world", index: tileIdx };
        }
      }
    }
    if (ui2.draggedItem && !input2.isDown("MouseLeft")) {
      const dropX = input2.mouse.x;
      const dropY = input2.mouse.y;
      const uiHit = ui2.getContainerSlotAt(dropX, dropY);
      if (uiHit) {
        const targetCont = ui2.openContainers[uiHit.containerIndex].item;
        if (!targetCont.inventory) targetCont.inventory = [];
        targetCont.inventory.push(ui2.draggedItem);
        removeFromSource(ui2, map2);
        console.log("Dropped in Container");
      } else {
        const dropWorldX = dropX + camX;
        const dropWorldY = dropY + camY;
        const tx = Math.floor(dropWorldX / TILE_SIZE2);
        const ty = Math.floor(dropWorldY / TILE_SIZE2);
        const tile = map2.getTile(tx, ty);
        if (tile) {
          tile.addItem(ui2.draggedItem);
          removeFromSource(ui2, map2);
        }
      }
      ui2.draggedItem = null;
      ui2.draggingFrom = null;
    }
  }
  function removeFromSource(ui2, map2) {
    if (!ui2.draggingFrom) return;
    if (ui2.draggingFrom.type === "container") {
      const cIdx = ui2.draggingFrom.containerIndex;
      const sIdx = ui2.draggingFrom.index;
      const cont = ui2.openContainers[cIdx].item;
      if (cont && cont.inventory) {
        cont.inventory.splice(sIdx, 1);
      }
    } else if (ui2.draggingFrom.type === "world") {
      const tIdx = ui2.draggingFrom.index;
      const tile = map2.tiles[tIdx];
      if (tile) {
        tile.removeItem();
      }
    }
  }
  function createItemFromRegistry(id) {
    const def = ItemRegistry[id];
    if (def) {
      const spriteId = def.uIndex !== void 0 ? def.uIndex : id;
      return new Item2(
        def.name,
        def.slot || "other",
        spriteId,
        // uIndex for sprite
        0,
        // frame
        0,
        // direction
        def.attack || 0,
        // damage
        10,
        // price
        "",
        // description
        def.type === "weapon" ? "melee" : "none",
        // weaponType
        "common",
        // rarity
        def.defense || 0
        // defense
      );
    }
    return new Item2(String(id), "other", id);
  }
  function movementSystem(world2, dt, audio2, network, ui2) {
    const entities = world2.query([Position, Velocity]);
    const mapEntity = world2.query([TileMap])[0];
    let map2;
    if (mapEntity !== void 0) {
      map2 = world2.getComponent(mapEntity, TileMap);
    }
    for (const id of entities) {
      const pos = world2.getComponent(id, Position);
      const vel = world2.getComponent(id, Velocity);
      const sprite = world2.getComponent(id, Sprite);
      if (Math.random() < 0.01 && (vel.x !== 0 || vel.y !== 0)) {
        console.log(`[MoveSys] Entity ${id} Attempting Move. Vel: ${vel.x}, ${vel.y}`);
      }
      if (sprite) {
        if (Math.abs(vel.x) > 0 || Math.abs(vel.y) > 0) {
          if (Math.abs(vel.x) > Math.abs(vel.y)) {
            sprite.direction = vel.x > 0 ? 3 : 2;
          } else {
            sprite.direction = vel.y > 0 ? 0 : 1;
          }
          sprite.animState = "walk";
        } else {
          sprite.animState = "idle";
        }
        if (sprite.animState === "walk") {
          sprite.animTimer += dt;
          if (sprite.animTimer >= sprite.frameDuration) {
            sprite.animTimer = 0;
            sprite.frame = (sprite.frame + 1) % 4;
          }
        } else {
          sprite.frame = 1;
          sprite.animTimer = 0;
        }
      }
      if (vel.x !== 0 || vel.y !== 0) {
        const facing = world2.getComponent(id, Facing);
        if (facing) {
          if (Math.abs(vel.x) > Math.abs(vel.y)) {
            facing.x = Math.sign(vel.x);
            facing.y = 0;
          } else {
            facing.x = 0;
            facing.y = Math.sign(vel.y);
          }
        }
      }
      if (vel.x === 0 && vel.y === 0) continue;
      let speedMult = 1;
      if (map2) {
        const centerX = pos.x + 16;
        const centerY = pos.y + 16;
        const tile = map2.getTile(Math.floor(centerX / 32), Math.floor(centerY / 32));
        if (tile) {
          if (tile.has(28) || tile.has(SPRITES.WATER)) speedMult = 0.5;
          else if (tile.has(27)) speedMult = 0.7;
        }
      }
      const nextX = pos.x + vel.x * speedMult * dt;
      const nextY = pos.y + vel.y * speedMult * dt;
      if (map2) {
        const myCollider = world2.getComponent(id, Collider);
        let blockedByEntity = false;
        if (myCollider) {
          const myBoxNextX = nextX + myCollider.offsetX;
          const myBoxNextY = nextY + myCollider.offsetY;
          const myBoxW = myCollider.width;
          const myBoxH = myCollider.height;
          const collidables = world2.query([Collider, Position]);
          for (const otherId of collidables) {
            if (otherId === id) continue;
            const otherPos = world2.getComponent(otherId, Position);
            const otherCollider = world2.getComponent(otherId, Collider);
            const otherBoxX = otherPos.x + otherCollider.offsetX;
            const otherBoxY = otherPos.y + otherCollider.offsetY;
            const otherBoxW = otherCollider.width;
            const otherBoxH = otherCollider.height;
            if (myBoxNextX < otherBoxX + otherBoxW && myBoxNextX + myBoxW > otherBoxX && myBoxNextY < otherBoxY + otherBoxH && myBoxNextY + myBoxH > otherBoxY) {
              blockedByEntity = true;
              break;
            }
          }
        }
        if (blockedByEntity) continue;
        const checkCollision = (x, y, debug = false) => {
          if (!map2) return false;
          if (x < 0 || x >= map2.width * map2.tileSize || y < 0 || y >= map2.height * map2.tileSize) {
            if (debug) console.log(`[Collision] Out of bounds: ${x}, ${y}`);
            return true;
          }
          const tileX = Math.floor(x / map2.tileSize);
          const tileY = Math.floor(y / map2.tileSize);
          const idx = tileY * map2.width + tileX;
          if (idx < 0 || idx >= map2.tiles.length) return true;
          const tile = map2.tiles[idx];
          for (const item of tile.items) {
            if (PHYSICS.isSolid(item.id)) {
              if (debug) console.log(`[Collision] Solid Item: ${item.id} at ${tileX},${tileY}`);
              return true;
            }
          }
          return false;
        };
        const updateOccupancy = (oldX, oldY, newX, newY) => {
          if (!map2) return;
          const oldTx = Math.floor((oldX + 8) / map2.tileSize);
          const oldTy = Math.floor((oldY + 8) / map2.tileSize);
          const newTx = Math.floor((newX + 8) / map2.tileSize);
          const newTy = Math.floor((newY + 8) / map2.tileSize);
          if (oldTx !== newTx || oldTy !== newTy) {
            if (oldTx >= 0 && oldTx < map2.width && oldTy >= 0 && oldTy < map2.height) {
              const oldIdx = oldTy * map2.width + oldTx;
              if (map2.tiles[oldIdx].creature === id) {
                map2.tiles[oldIdx].creature = null;
              }
            }
            if (newTx >= 0 && newTx < map2.width && newTy >= 0 && newTy < map2.height) {
              const newIdx = newTy * map2.width + newTx;
              map2.tiles[newIdx].creature = id;
            }
          }
        };
        const cx1 = nextX + (vel.x > 0 ? 12 : 4);
        const cy1 = pos.y + 12;
        const cx2 = nextX + (vel.x > 0 ? 12 : 4);
        const cy2 = pos.y + 28;
        if (!checkCollision(cx1, cy1) && !checkCollision(cx2, cy2)) {
          updateOccupancy(pos.x, pos.y, nextX, pos.y);
          pos.x = nextX;
        } else {
          console.log(`[MoveSystem] Blocked X! Pos: ${pos.x}, Target: ${nextX}`);
          checkCollision(cx1, cy1, true);
          vel.x = 0;
        }
        const nextYAfterX = pos.y + vel.y * dt;
        if (!checkCollision(pos.x + 4, nextYAfterX + (vel.y > 0 ? 28 : 12)) && !checkCollision(pos.x + 12, nextYAfterX + (vel.y > 0 ? 28 : 12))) {
          updateOccupancy(pos.x, pos.y, pos.x, nextYAfterX);
          pos.y = nextYAfterX;
        } else {
          vel.y = 0;
        }
        if (world2.getComponent(id, PlayerControllable2)) {
          if (network) network.sendMove(pos.x, pos.y);
          const teleporters = world2.query([Teleporter, Position]);
          for (const tId of teleporters) {
            const tPos = world2.getComponent(tId, Position);
            const tData = world2.getComponent(tId, Teleporter);
            if (Math.abs(pos.x + 8 - (tPos.x + 8)) < 12 && Math.abs(pos.y + 8 - (tPos.y + 8)) < 12) {
              pos.x = tData.targetX;
              pos.y = tData.targetY;
              if (network) network.sendMove(pos.x, pos.y);
              return;
            }
          }
          const pc = world2.getComponent(id, PlayerControllable2);
          pc.footstepTimer -= dt;
          if (pc.footstepTimer <= 0) {
            let material = "grass";
            if (map2) {
              const tx = Math.floor((pos.x + 8) / map2.tileSize);
              const ty = Math.floor((pos.y + 8) / map2.tileSize);
              if (tx >= 0 && tx < map2.width && ty >= 0 && ty < map2.height) {
                const tile = map2.tiles[ty * map2.width + tx];
                const top = tile.items.length > 0 ? tile.items[tile.items.length - 1].id : 0;
                if (top === 19 || top === 20) material = "wood";
                else if (top >= 23 || top === 17) material = "stone";
              }
            }
            audio2.playFootstep(material);
            pc.footstepTimer = 0.4;
          }
        }
      }
    }
  }
  function cameraSystem(world2, mapWidth, mapHeight) {
    const playerEntity = world2.query([PlayerControllable2, Position])[0];
    if (playerEntity === void 0) return;
    const pos = world2.getComponent(playerEntity, Position);
    const cameraEntity = world2.query([Camera])[0];
    if (cameraEntity === void 0) return;
    const cam = world2.getComponent(cameraEntity, Camera);
    let targetX = pos.x - 320 / 2;
    let targetY = pos.y - 240 / 2;
    targetX = Math.max(0, Math.min(targetX, mapWidth - 320));
    targetY = Math.max(0, Math.min(targetY, mapHeight - 240));
    cam.x = targetX;
    cam.y = targetY;
  }
  function switchMap(world2, type, dungeonType = "temple", seed = 0) {
    const players = world2.query([PlayerControllable2]);
    if (players.length === 0) return;
    const playerEntity = players[0];
    const all = world2.query([Position]);
    for (const id of all) {
      if (id !== playerEntity && !world2.getComponent(id, PlayerControllable2)) {
        world2.removeEntity(id);
      }
    }
    let mapData;
    if (type === "overworld") {
      mapData = generateOverworld(256, 256, seed);
    } else {
      mapData = generateDungeon(64, 64, seed + Math.random(), dungeonType);
    }
    const mapEntity = world2.query([TileMap])[0];
    if (mapEntity !== void 0) {
      const map2 = world2.getComponent(mapEntity, TileMap);
      map2.width = mapData.width;
      map2.height = mapData.height;
      map2.tileSize = mapData.tileSize;
      map2.tiles = mapData.tiles;
    }
    for (const ent of mapData.entities) {
      if (ent.type === "player") {
        const pPos = world2.getComponent(playerEntity, Position);
        pPos.x = ent.x;
        pPos.y = ent.y;
        const cam = world2.query([Camera])[0];
        if (cam) {
          const cPos = world2.getComponent(cam, Camera);
          cPos.x = ent.x - 160;
          cPos.y = ent.y - 120;
        }
      } else if (ent.type === "dungeon_entrance") {
        const portal = world2.createEntity();
        world2.addComponent(portal, new Position(ent.x, ent.y));
        world2.addComponent(portal, new Sprite(77, 32));
        world2.addComponent(portal, new DungeonEntrance(ent.dungeonType, ent.label));
        world2.addComponent(portal, new Interactable(`Enter ${ent.label}`));
        world2.addComponent(portal, new Name(ent.label));
      } else if (ent.type === "dungeon_exit") {
        const portal = world2.createEntity();
        world2.addComponent(portal, new Position(ent.x, ent.y));
        world2.addComponent(portal, new Sprite(77, 32));
        world2.addComponent(portal, new DungeonExit(ent.label));
        world2.addComponent(portal, new Interactable(ent.label));
        world2.addComponent(portal, new Name(ent.label));
      } else if (ent.type === "enemy") {
        createEnemy(world2, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "fire_enemy") {
        createFireEnemy(world2, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "ice_enemy") {
        createIceEnemy(world2, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "water_enemy") {
        createWaterEnemy(world2, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "earth_enemy") {
        createEarthEnemy(world2, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "item") {
        createItem(world2, ent.x, ent.y, ent.name, ent.slot, ent.uIndex, ent.damage);
      } else if (ent.type === "static") {
        const s = world2.createEntity();
        world2.addComponent(s, new Position(ent.x, ent.y));
        world2.addComponent(s, new Sprite(ent.sprite, ent.size));
      } else if (ent.type === "boss") {
        if (ent.enemyType === "hydra") {
          createWaterEnemy(world2, ent.x, ent.y, "hydra", 2);
        } else {
          createBoss(world2, ent.x, ent.y);
        }
      }
    }
  }
  function toolSystem(world2, input2, ui2) {
    if (input2.isJustPressed("MouseLeft")) {
      const uiAny = ui2;
      if (uiAny.targetingItem) {
        const mx = input2.mouse.x;
        const my = input2.mouse.y;
        const cam = world2.query([Camera])[0];
        let camX = 0, camY = 0;
        if (cam) {
          const cPos = world2.getComponent(cam, Camera);
          camX = cPos.x;
          camY = cPos.y;
        }
        const wx = mx + camX;
        const wy = my + camY;
        const tx = Math.floor(wx / TILE_SIZE);
        const ty = Math.floor(wy / TILE_SIZE);
        const game = window.game;
        if (!game || !game.map) return;
        const tile = game.map.getTile(tx, ty);
        const player2 = world2.query([PlayerControllable2, Position])[0];
        if (player2) {
          const pPos = world2.getComponent(player2, Position);
          const dx = pPos.x - wx;
          const dy = pPos.y - wy;
          if (Math.sqrt(dx * dx + dy * dy) > 100) {
            if (ui2.console) ui2.console.sendMessage("Too far away.");
            uiAny.targetingItem = null;
            document.body.style.cursor = "default";
            return;
          }
        }
        if (!tile) return;
        if (uiAny.targetingItem.name === "Shovel") {
          if (!tile.has(17)) {
            if (!tile.has(SPRITES.HOLE)) {
              const hole = world2.createEntity();
              world2.addComponent(hole, new Position(tx * 32, ty * 32));
              world2.addComponent(hole, new Sprite(SPRITES.HOLE));
              world2.addComponent(hole, new DungeonEntrance("cave", "Secret Cave"));
              if (ui2.console) ui2.console.sendMessage("You dug a hole.");
            } else {
              if (ui2.console) ui2.console.sendMessage("There is already a hole here.");
            }
          } else {
            if (ui2.console) ui2.console.sendMessage("You cannot dig this.");
          }
        } else if (uiAny.targetingItem.name === "Rope") {
          if (tile.has(SPRITES.ROPE_SPOT) || tile.has(SPRITES.HOLE)) {
            if (ui2.console) ui2.console.sendMessage("You rope yourself up.");
            switchMap(world2, "overworld", "main", 1337);
          } else {
            if (ui2.console) ui2.console.sendMessage("Nothing to rope here.");
          }
        }
        uiAny.targetingItem = null;
        document.body.style.cursor = "default";
      }
    }
  }
  function createEnemy(world2, x, y, type = "orc", difficulty = 1) {
    const e = world2.createEntity();
    world2.addComponent(e, new Position(x, y));
    world2.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    const def = MOB_REGISTRY[type];
    if (def) {
      world2.addComponent(e, new Sprite(def.spriteIndex, 32));
      world2.addComponent(e, new AI(def.speed));
      const maxHp = Math.floor(def.hp * hpScale);
      world2.addComponent(e, new Health(maxHp, maxHp));
      world2.addComponent(e, new Name(def.name));
      const lootItems = generateLoot(def.lootTable || type);
      world2.addComponent(e, new Lootable(lootItems));
      if (def.equipment) {
        const inv = new Inventory();
        if (def.equipment.rhand) inv.equip("rhand", new ItemInstance(createItemFromRegistry(def.equipment.rhand), 1));
        if (def.equipment.lhand) inv.equip("lhand", new ItemInstance(createItemFromRegistry(def.equipment.lhand), 1));
        if (def.equipment.body) inv.equip("body", new ItemInstance(createItemFromRegistry(def.equipment.body), 1));
        if (def.equipment.head) inv.equip("head", new ItemInstance(createItemFromRegistry(def.equipment.head), 1));
        world2.addComponent(e, inv);
      }
    } else {
      console.warn(`[Game] Unknown Mob Type: ${type}`);
      world2.addComponent(e, new Sprite(SPRITES.ORC || 58, 32));
      world2.addComponent(e, new AI(20));
      world2.addComponent(e, new Health(50, 50));
      world2.addComponent(e, new Name("Unknown " + type));
    }
    world2.addComponent(e, new Collider(20, 12, 6, 20));
    return e;
  }
  function createBoss(world2, x, y) {
    const e = world2.createEntity();
    world2.addComponent(e, new Position(x, y));
    world2.addComponent(e, new Velocity(0, 0));
    world2.addComponent(e, new Sprite(SPRITES.ORC, 48));
    world2.addComponent(e, new AI(40));
    world2.addComponent(e, new Health(200, 200));
    world2.addComponent(e, new Name("Orc Warlord"));
    return e;
  }
  function createIceEnemy(world2, x, y, type = "ice_wolf", difficulty = 1) {
    const e = world2.createEntity();
    world2.addComponent(e, new Position(x, y));
    world2.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    if (type === "ice_wolf") {
      world2.addComponent(e, new Sprite(SPRITES.ICE_WOLF, 32));
      world2.addComponent(e, new AI(55));
      world2.addComponent(e, new Health(45 * hpScale, 45 * hpScale));
      world2.addComponent(e, new Name("Ice Wolf"));
      world2.addComponent(e, new StatusOnHit("bleed", 0.35, 6, 4));
    } else if (type === "frost_mage") {
      world2.addComponent(e, new Sprite(SPRITES.FROST_MAGE, 32));
      world2.addComponent(e, new AI(25));
      world2.addComponent(e, new Health(80 * hpScale, 80 * hpScale));
      world2.addComponent(e, new Name("Frost Mage"));
      world2.addComponent(e, new StatusOnHit("freeze", 0.6, 4, 50));
      world2.addComponent(e, new Lootable([
        new Item2("Ice Shard", "currency", 101, 0, 5, "Cold to the touch", "none", "common", 0, 0, 0, false, 0, void 0, void 0),
        new Item2("Thunder Staff", "rhand", SPRITES.THUNDER_STAFF, 25, 600, "Crackles with energy", "staff", "rare", 0, 0, 20, false, 0, "#00ffff", 40)
      ]));
    } else if (type === "yeti") {
      world2.addComponent(e, new Sprite(SPRITES.YETI, 32));
      world2.addComponent(e, new AI(18));
      world2.addComponent(e, new Health(250 * hpScale, 250 * hpScale));
      world2.addComponent(e, new Name("Yeti"));
      world2.addComponent(e, new StatusOnHit("bleed", 0.5, 8, 8));
      world2.addComponent(e, new Lootable([
        new Item2("Frost Helm", "head", SPRITES.FROST_HELM, 0, 800, "Icy protection", "none", "epic", 8, 0, 0, false, 0, "#ccffff", 30),
        new Item2("Ice Bow", "rhand", SPRITES.ICE_BOW, 35, 700, "Freezes enemies", "bow", "rare", 0, 0, 0, false, 0, "#99ffff", 35)
      ]));
    }
    return e;
  }
  function createWaterEnemy(world2, x, y, type = "crab", difficulty = 1) {
    const e = world2.createEntity();
    world2.addComponent(e, new Position(x, y));
    world2.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    if (type === "crab") {
      world2.addComponent(e, new Sprite(SPRITES.CRAB, 32));
      world2.addComponent(e, new AI(20));
      world2.addComponent(e, new Health(60 * hpScale, 60 * hpScale));
      world2.addComponent(e, new Name("Crab"));
    } else if (type === "siren") {
      world2.addComponent(e, new Sprite(SPRITES.SIREN, 32));
      world2.addComponent(e, new AI(45));
      world2.addComponent(e, new Health(50 * hpScale, 50 * hpScale));
      world2.addComponent(e, new Name("Siren"));
    } else if (type === "hydra") {
      world2.addComponent(e, new Sprite(SPRITES.HYDRA, 32));
      world2.addComponent(e, new AI(25));
      world2.addComponent(e, new Health(300 * hpScale, 300 * hpScale));
      world2.addComponent(e, new Name("Hydra"));
      world2.addComponent(e, new StatusOnHit("poison", 0.5, 5, 10));
      world2.addComponent(e, new Lootable([
        new Item2("Thunder Staff", "rhand", SPRITES.THUNDER_STAFF, 25, 600, "Crackles with energy", "staff", "rare", 0, 0, 20, false, 0, "#00ffff", 40),
        new Item2("Water Essence", "currency", 100, 0, 50, "Pure water energy", "none", "rare", 0, 0, 0, false, 0, void 0, void 0)
      ]));
    }
    return e;
  }
  function createEarthEnemy(world2, x, y, type = "golem", difficulty = 1) {
    const e = world2.createEntity();
    world2.addComponent(e, new Position(x, y));
    world2.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    if (type === "golem") {
      world2.addComponent(e, new Sprite(SPRITES.GOLEM, 32));
      world2.addComponent(e, new AI(15));
      world2.addComponent(e, new Health(120 * hpScale, 120 * hpScale));
      world2.addComponent(e, new Name("Golem"));
      world2.addComponent(e, new Lootable([
        new Item2("Earth Essence", "currency", 110, 0, 50, "Solid earth energy", "none", "rare", 0, 0, 0, void 0, void 0, void 0, void 0),
        new Item2("Obsidian Shard", "currency", 103, 0, 15, "Sharp black stone", "none", "common", 0, 0, 0, void 0, void 0, void 0, void 0)
      ]));
    } else if (type === "basilisk") {
      world2.addComponent(e, new Sprite(SPRITES.BASILISK, 32));
      world2.addComponent(e, new AI(45));
      world2.addComponent(e, new Health(60 * hpScale, 60 * hpScale));
      world2.addComponent(e, new Name("Basilisk"));
      world2.addComponent(e, new StatusOnHit("poison", 0.4, 4, 8));
    }
    return e;
  }
  function createFireEnemy(world2, x, y, type = "scorpion", difficulty = 1) {
    const e = world2.createEntity();
    world2.addComponent(e, new Position(x, y));
    world2.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    if (type === "scorpion") {
      world2.addComponent(e, new Sprite(SPRITES.SCORPION, 32));
      world2.addComponent(e, new AI(55));
      world2.addComponent(e, new Health(30 * hpScale, 30 * hpScale));
      world2.addComponent(e, new Name("Scorpion"));
      world2.addComponent(e, new StatusOnHit("poison", 0.5, 4, 6));
    } else if (type === "mummy") {
      world2.addComponent(e, new Sprite(SPRITES.MUMMY, 32));
      world2.addComponent(e, new AI(20));
      world2.addComponent(e, new Health(80 * hpScale, 80 * hpScale));
      world2.addComponent(e, new Name("Mummy"));
      world2.addComponent(e, new StatusOnHit("curse", 0.2, 5, 20));
    } else if (type === "spider") {
      world2.addComponent(e, new Sprite(SPRITES.SPIDER, 32));
      world2.addComponent(e, new AI(45));
      world2.addComponent(e, new Health(35 * hpScale, 35 * hpScale));
      world2.addComponent(e, new Name("Spider"));
      world2.addComponent(e, new StatusOnHit("slow", 0.4, 3, 2));
      world2.addComponent(e, new Lootable([
        new Item2("Spider Silk", "currency", 102, 0, 5, "Sticky silk", "none", "common", 0, 0, 0, void 0, void 0, void 0, void 0)
      ]));
    } else if (type === "fire_guardian") {
      world2.addComponent(e, new Sprite(SPRITES.SCORPION, 48));
      world2.addComponent(e, new AI(35));
      world2.addComponent(e, new Health(250 * hpScale, 250 * hpScale));
      world2.addComponent(e, new Name("Fire Guardian"));
      world2.addComponent(e, new StatusOnHit("burn", 0.5, 6, 20));
      world2.addComponent(e, new Lootable([
        new Item2("Magma Armor", "armor", SPRITES.MAGMA_ARMOR, 0, 800, "Forged in fire", "none", "epic", 10, 0, 0, false, 0, "#ff4400", 50),
        new Item2("Fire Sword", "rhand", SPRITES.FIRE_SWORD, 30, 700, "Burns on contact", "sword", "rare", 0, 0, 0, false, 0, "#ffaa00", 40)
      ]));
    }
    return e;
  }
  function createItem(world2, x, y, name2, slot, uIndex, damage = 0, price = 10, description = "", weaponType = "", rarity = "common", defense = 0, bonusHp = 0, bonusMana = 0, glowColor, glowRadius, network, networkItem) {
    if (network && network.connected && !networkItem) {
      network.sendSpawnItem(x, y, uIndex, name2);
      return;
    }
    const e = world2.createEntity();
    world2.addComponent(e, new Position(x, y));
    world2.addComponent(e, new Sprite(uIndex, 24));
    if (slot === "potion") price = 50;
    if (slot === "lhand") price = 100;
    if (slot === "rhand") price = 150;
    if (name2 === "Potion") price = 50;
    if (name2 === "Wooden Shield") price = 50;
    if (name2 === "Wooden Sword") price = 50;
    if (name2 === "Tower Shield") price = 200;
    if (name2 === "Noble Sword") price = 400;
    world2.addComponent(e, new Item2(name2, slot, uIndex, damage, price, description, weaponType, rarity, defense, bonusHp, bonusMana, false, 0, glowColor, glowRadius));
    if (networkItem) {
      world2.addComponent(e, networkItem);
    }
    return e;
  }
  function spawnFloatingText(world2, x, y, text, color) {
    const ft = world2.createEntity();
    world2.addComponent(ft, new Position(x, y));
    world2.addComponent(ft, new Velocity(0, -20));
    world2.addComponent(ft, new FloatingText(text, color));
  }
  function generateLoot(enemyType = "orc") {
    const items = [];
    const tableKey = enemyType.toLowerCase();
    const table = LOOT_TABLES[tableKey] || LOOT_TABLES["orc"];
    if (table) {
      table.forEach((entry) => {
        if (Math.random() < entry.chance) {
          const count = entry.min ? Math.floor(Math.random() * ((entry.max || 1) - entry.min + 1)) + entry.min : 1;
          const item = createItemFromRegistry(entry.itemId, count);
          items.push(item);
        }
      });
    }
    return items;
  }
  function decaySystem(world2, dt) {
    const entities = world2.query([Decay]);
    for (const id of entities) {
      const decay = world2.getComponent(id, Decay);
      decay.life -= dt;
      if (decay.life <= 0) {
        world2.removeEntity(id);
      }
    }
  }
  function spawnMapItem(x, y, id) {
    const game = window.game;
    if (!game || !game.map) return;
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    const tile = game.map.getTile(tileX, tileY);
    if (tile) {
      tile.items.push({ id, count: 1 });
      console.log(`[Debug] Spawned Map Item ${id} at ${tileX},${tileY}`);
    }
  }
  function spawnDebugSet(world2, ui2) {
    const playerEntity = world2.query([PlayerControllable2, Position])[0];
    if (playerEntity === void 0) return;
    const pos = world2.getComponent(playerEntity, Position);
    const game = window.game;
    const map2 = game.map;
    console.log("[Debug] Spawning Museum of All Assets...");
    if (ui2 && ui2.console) ui2.console.addSystemMessage("Spawning Museum of 50+ Assets...");
    const coreItems = [
      SPRITES.GOLDEN_HELMET,
      SPRITES.GOLDEN_ARMOR,
      SPRITES.GOLDEN_LEGS,
      SPRITES.GOLDEN_BOOTS,
      SPRITES.GOLDEN_SHIELD,
      SPRITES.ELF_ARMOR,
      SPRITES.ELF_LEGS,
      SPRITES.ELF_ICICLE_BOW,
      SPRITES.DWARF_HELMET,
      SPRITES.DWARF_ARMOR,
      SPRITES.DWARF_LEGS,
      SPRITES.DWARF_SHIELD,
      SPRITES.DWARF_GUARD,
      SPRITES.AXE,
      SPRITES.CLUB,
      SPRITES.TREE_PINE,
      SPRITES.TREE_OAK,
      SPRITES.ROCK_LARGE,
      SPRITES.GEM_RUBY,
      SPRITES.GEM_SAPPHIRE,
      SPRITES.ARMOR,
      SPRITES.LEGS,
      SPRITES.SHIELD,
      SPRITES.SHOVEL
    ];
    let row = 0;
    let col = 0;
    const MAX_COLS = 10;
    const START_X = pos.x;
    const START_Y = pos.y + 64;
    const spawnAt = (id, r, c) => {
      const x = START_X + c * 32;
      const y = START_Y + r * 32;
      spawnMapItem(x, y, id);
    };
    for (const id of coreItems) {
      spawnAt(id, row, col);
      col++;
      if (col >= MAX_COLS) {
        col = 0;
        row++;
      }
    }
    row += 2;
    col = 0;
    const bulkIds = Object.values(BULK_SPRITES);
    for (const id of bulkIds) {
      if (typeof id === "number") {
        spawnAt(id, row, col);
        col++;
        if (col >= MAX_COLS) {
          col = 0;
          row++;
        }
      }
    }
  }

  // src/audio.ts
  var AudioController = class {
    ctx;
    masterGain;
    initialized = false;
    bgmTimer = null;
    noteIndex = 0;
    // A Minor Pentatonic: A3, C4, D4, E4, G4, A4
    scale = [220, 261.63, 293.66, 329.63, 392, 440];
    constructor() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
    async init() {
      if (this.initialized) return;
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      this.initialized = true;
      this.startMusic();
    }
    startMusic() {
      if (this.bgmTimer) return;
      const playNext = () => {
        if (!this.initialized) return;
        if (Math.random() > 0.3) {
          const note = this.scale[Math.floor(Math.random() * this.scale.length)];
          this.playTone(note, "triangle", 0.5, 0);
        }
        const delay = 400 + Math.random() * 600;
        this.bgmTimer = setTimeout(playNext, delay);
      };
      playNext();
    }
    stopMusic() {
      if (this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
    playTone(freq, type, duration, startTime = 0) {
      if (!this.initialized) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    }
    playNoise(duration) {
      if (!this.initialized) return;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 1e3;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      noise.connect(noiseFilter);
      noiseFilter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    }
    // SFX Presets
    playAttack() {
      if (!this.initialized) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    }
    playHit() {
      this.playNoise(0.1);
    }
    /**
     * Play a sound with spatial positioning.
     * Volume decreases with distance, pans left/right based on position.
     * @param soundType - Type of sound effect to play
     * @param sourceX - X position of the sound source
     * @param sourceY - Y position of the sound source
     * @param playerX - X position of the player/listener
     * @param playerY - Y position of the player/listener
     */
    playSpatialSound(soundType, sourceX, sourceY, playerX, playerY) {
      if (!this.initialized) return;
      const dx = sourceX - playerX;
      const dy = sourceY - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 500;
      const volume = Math.max(0, 1 - distance / maxDistance);
      if (volume <= 0) return;
      const maxPanDistance = 200;
      const pan = Math.max(-1, Math.min(1, dx / maxPanDistance));
      this.playSpatialEffect(soundType, volume, pan);
    }
    /**
     * Internal: Play a sound with specified volume and pan.
     */
    playSpatialEffect(soundType, volume, pan) {
      const now = this.ctx.currentTime;
      const gainNode = this.ctx.createGain();
      gainNode.gain.value = volume * 0.4;
      const pannerNode = this.ctx.createStereoPanner();
      pannerNode.pan.value = pan;
      gainNode.connect(this.masterGain);
      pannerNode.connect(gainNode);
      switch (soundType) {
        case "hit":
          this.playSpatialNoiseBurst(pannerNode, 0.1);
          break;
        case "attack":
          this.playSpatialSweep(pannerNode, 400, 100, 0.1);
          break;
        case "step":
          this.playSpatialNoiseBurst(pannerNode, 0.05);
          break;
        case "coin":
          this.playSpatialTone(pannerNode, 1200, "sine", 0.1);
          break;
        case "death":
          this.playSpatialSweep(pannerNode, 150, 30, 1);
          break;
      }
    }
    /**
     * Internal: Spatial noise burst (hit, step sounds).
     */
    playSpatialNoiseBurst(destination, duration) {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1e3;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      noise.start();
    }
    /**
     * Internal: Spatial frequency sweep (attack, death sounds).
     */
    playSpatialSweep(destination, startFreq, endFreq, duration) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }
    /**
     * Internal: Spatial tone (coin, pickup sounds).
     */
    playSpatialTone(destination, freq, type, duration) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }
    playCoin() {
      this.playTone(1200, "sine", 0.1, 0);
      this.playTone(1800, "square", 0.1, 0.1);
    }
    playLevelUp() {
      const now = 0;
      this.playTone(440, "square", 0.2, now);
      this.playTone(554, "square", 0.2, now + 0.1);
      this.playTone(659, "square", 0.4, now + 0.2);
    }
    playDeath() {
      if (!this.initialized) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(now + 1.5);
      this.playFootstep("stone");
    }
    // --- New Immersive Audio Methods ---
    playFootstep(material) {
      if (!this.initialized) return;
      const now = this.ctx.currentTime;
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      if (material === "wood") {
        filter.type = "lowpass";
        filter.frequency.value = 200;
        filter.Q.value = 1;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      } else if (material === "stone") {
        filter.type = "highpass";
        filter.frequency.value = 1e3;
        filter.Q.value = 0.5;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      } else {
        filter.type = "bandpass";
        filter.frequency.value = 600;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
      }
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    }
    currentAmbience = null;
    ambienceNodes = [];
    setAmbience(type) {
      if (this.currentAmbience === type) return;
      this.currentAmbience = type;
      this.stopAmbience();
      if (type === "crypt") {
        this.startDrone();
      } else {
        this.startMusic();
      }
    }
    stopAmbience() {
      this.ambienceNodes.forEach((node) => node.disconnect());
      this.ambienceNodes = [];
      this.stopMusic();
    }
    startDrone() {
      if (!this.initialized) return;
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.value = 50;
      lfo.type = "sine";
      lfo.frequency.value = 0.2;
      lfoGain.gain.value = 20;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      filter.type = "lowpass";
      filter.frequency.value = 120;
      gain.gain.value = 0.2;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      lfo.start();
      this.ambienceNodes.push(osc, lfo, lfoGain, gain, filter);
    }
    update(dt, listenerX, listenerY, emitters) {
      if (!this.initialized) return;
      for (const e of emitters) {
        const dx = e.x - listenerX;
        const dy = e.y - listenerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && Math.random() < 0.05) {
          this.playCrackle(1 - dist / 100);
        }
      }
    }
    playCrackle(vol) {
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * vol;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 2e3;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.1 * vol;
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    }
  };

  // src/client/ui_manager.ts
  var UIManager = class {
    battleList;
    chatLog;
    hpBar;
    manaBar;
    // Cache for stats
    hpVal;
    manaVal;
    capVal;
    lvlVal;
    xpVal;
    goldVal;
    // Compatibility Stubs for Game.ts
    shopPanel = document.createElement("div");
    bagPanel = document.createElement("div");
    // Stub for compatibility
    currentMerchant = null;
    activeMerchantId = null;
    console = { addSystemMessage: (msg) => this.log(msg) };
    // Loot Panel Properties
    activeLootEntityId = null;
    lootPanel;
    lootGrid;
    // NPC Dialogue
    dialogPanel;
    dialogText;
    dialogNextBtn;
    _lastBattleUpdate = 0;
    // NEW: List of open windows
    openContainers = [];
    // Dragging State
    draggedItem = null;
    draggingFrom = null;
    mouseX = 0;
    mouseY = 0;
    chatInput;
    // Cache
    equipmentSlots = {};
    skillsPanel = null;
    // New Skills Panel
    inventoryPanel = null;
    // New Inventory Panel
    // Shop
    activeMerchantId = null;
    targetingItem = null;
    // Player Reference (Cached from update)
    player = null;
    constructor() {
      document.addEventListener("contextmenu", (e) => {
        if (this.targetingItem) {
          e.preventDefault();
          this.targetingItem = null;
          document.body.style.cursor = "default";
          document.body.style.cursor = "default";
          this.log("Targeting cancelled.");
        }
      });
      document.addEventListener("mousemove", (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });
      document.addEventListener("mouseup", (e) => {
        if (this.draggedItem) {
          setTimeout(() => {
            if (this.draggedItem) {
              this.log("Drop cancelled.");
              this.draggedItem = null;
              this.draggingFrom = null;
            }
          }, 50);
        }
      });
      this.battleList = document.getElementById("battle-list");
      if (!this.battleList) console.error("UI: #battle-list not found");
      this.chatLog = document.getElementById("chat-log");
      if (!this.chatLog) console.error("UI: #chat-log not found");
      const chatInput = document.getElementById("chat-input");
      if (chatInput) {
        this.chatInput = chatInput;
        chatInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            this.onChatInput();
          }
        });
      }
      this.setupEquipmentUI();
      this.hpBar = document.querySelector(".health-bar");
      this.manaBar = document.querySelector(".mana-bar");
      this.hpVal = document.getElementById("hp-val");
      this.manaVal = document.getElementById("mana-val");
      this.capVal = document.getElementById("cap-val");
      this.lvlVal = document.getElementById("lvl-val");
      this.xpVal = document.getElementById("xp-val");
      this.goldVal = document.getElementById("gold-val");
      this.lootPanel = document.createElement("div");
      this.lootPanel.id = "loot-panel";
      this.lootPanel.innerHTML = `
            <div class="loot-header">
                <span>Loot</span>
                <span class="close-btn" onclick="document.getElementById('loot-panel').style.display='none'">X</span>
            </div>
            <div class="loot-grid" id="loot-grid-content"></div>
        `;
      document.body.appendChild(this.lootPanel);
      this.lootGrid = document.getElementById("loot-grid-content");
      this.dialogPanel = document.createElement("div");
      this.dialogPanel.id = "dialog-panel";
      this.dialogPanel.innerHTML = `
            <div class="dialog-content">
                <p id="dialog-text">...</p>
                <div class="dialog-buttons">
                    <button id="dialog-next">Next</button>
                    <button id="dialog-trade" style="display:none">Trade</button>
                    <button id="dialog-close">Close</button>
                </div>
            </div>
        `;
      document.body.appendChild(this.dialogPanel);
      this.dialogText = document.getElementById("dialog-text");
      this.dialogNextBtn = document.getElementById("dialog-next");
      document.getElementById("dialog-close").onclick = () => this.hideDialogue();
      const closeBtn = this.lootPanel.querySelector(".close-btn");
      closeBtn.onclick = () => this.hideDialogue();
      this.shopPanel = document.createElement("div");
      this.shopPanel.id = "shop-panel";
      this.shopPanel.innerHTML = `
            <div class="shop-header">
                <span>Shop</span>
                <span class="close-btn" onclick="document.getElementById('shop-panel').style.display='none'">X</span>
            </div>
            <div class="shop-tabs">
                <button class="shop-tab active" id="shop-tab-buy">Buy</button>
                <button class="shop-tab" id="shop-tab-sell">Sell</button>
            </div>
            <div class="shop-grid" id="shop-grid-content"></div>
            <div class="shop-grid" id="shop-sell-content" style="display:none"></div>
        `;
      document.body.appendChild(this.shopPanel);
      this.shopPanel.querySelector(".close-btn").addEventListener("click", () => this.hideDialogue());
      const buyTab = this.shopPanel.querySelector("#shop-tab-buy");
      const sellTab = this.shopPanel.querySelector("#shop-tab-sell");
      const buyGrid = this.shopPanel.querySelector("#shop-grid-content");
      const sellGrid = this.shopPanel.querySelector("#shop-sell-content");
      buyTab.onclick = () => {
        buyTab.classList.add("active");
        sellTab.classList.remove("active");
        buyGrid.style.display = "block";
        sellGrid.style.display = "none";
      };
      sellTab.onclick = () => {
        sellTab.classList.add("active");
        buyTab.classList.remove("active");
        sellGrid.style.display = "block";
        buyGrid.style.display = "none";
        this.renderSellGrid();
      };
    }
    /**
     * Updates the Battle List sidebar with visible entities.
     */
    updateBattleList(entities, world2, player2) {
      if (!this.battleList) return;
      const now = Date.now();
      if (this._lastBattleUpdate && now - this._lastBattleUpdate < 250) return;
      this._lastBattleUpdate = now;
      this.battleList.innerHTML = "";
      const playerPos = world2.getComponent(player2.id, Position);
      entities.forEach((entityId) => {
        if (entityId === player2.id) return;
        const nameComp = world2.getComponent(entityId, Name);
        const healthComp = world2.getComponent(entityId, Health);
        const posComp = world2.getComponent(entityId, Position);
        if (!nameComp || healthComp && healthComp.current <= 0 || !posComp) return;
        if (playerPos) {
          const dist = Math.sqrt(Math.pow(playerPos.x - posComp.x, 2) + Math.pow(playerPos.y - posComp.y, 2));
          if (dist > 320) return;
        }
        const entry = document.createElement("div");
        entry.className = "battle-entry";
        const hpPercent = Math.floor(healthComp.current / healthComp.max * 100);
        entry.innerText = `${nameComp.value} [${hpPercent}%]`;
        const currentTarget = world2.getComponent(player2.id, Target);
        const isTargeted = player2.targetId === entityId || currentTarget && currentTarget.targetId === entityId;
        if (isTargeted) {
          entry.style.color = "#ff5555";
          entry.style.border = "1px solid #ff5555";
          entry.style.backgroundColor = "#442222";
        }
        entry.onclick = () => {
          if (isTargeted) {
            player2.targetId = null;
            world2.removeComponent(player2.id, Target);
          } else {
            player2.targetId = entityId;
            if (world2.getComponent(player2.id, Target)) {
              world2.removeComponent(player2.id, Target);
            }
            world2.addComponent(player2.id, new Target(entityId));
          }
          document.body.focus();
          this._lastBattleUpdate = 0;
        };
        this.battleList.appendChild(entry);
      });
    }
    /**
     * Appends a message to the Chat Console.
     * @param message Text to display
     * @param color CSS color string (default white)
     */
    log(message, color = "#ccc") {
      if (!this.chatLog) return;
      const line = document.createElement("div");
      line.style.color = color;
      line.innerText = message;
      const now = /* @__PURE__ */ new Date();
      const time = `[${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}] `;
      const timeSpan = document.createElement("span");
      timeSpan.style.color = "#666";
      timeSpan.innerText = time;
      line.prepend(timeSpan);
      this.chatLog.appendChild(line);
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }
    /**
     * Updates HUD elements (HP, Mana, etc) from the Visual Player state.
     */
    update(player2) {
      this.player = player2;
      if (this.hpVal) this.hpVal.innerText = `${Math.floor(player2.hp)}/${player2.maxHp}`;
      if (this.hpBar) {
        const pct = Math.min(100, Math.max(0, player2.hp / player2.maxHp * 100));
        this.hpBar.style.width = `${pct}%`;
      }
      if (this.manaVal) this.manaVal.innerText = `${Math.floor(player2.mana)}/${player2.maxMana}`;
      if (this.manaBar) {
        const pct = Math.min(100, Math.max(0, player2.mana / player2.maxMana * 100));
        this.manaBar.style.width = `${pct}%`;
      }
      if (this.lvlVal) this.lvlVal.innerText = player2.level.toString();
      if (this.capVal) this.capVal.innerText = player2.capacity.toString();
      if (this.goldVal) this.goldVal.innerText = `${player2.gold} GP`;
      if (this.xpVal) this.xpVal.innerText = `${player2.xp}/${player2.nextXp}`;
    }
    /**
     * Called by Game Logic (gainExperience, etc) to push non-visual-player stats.
     */
    updateStatus(curHP, maxHP, curMana, maxMana, curCap, curGold, curLevel, curXP, nextXP, skills) {
      if (this.hpVal) this.hpVal.innerText = `${curHP}/${maxHP}`;
      if (this.hpBar) this.hpBar.style.width = `${Math.min(100, curHP / maxHP * 100)}%`;
      if (this.manaVal) this.manaVal.innerText = `${curMana}/${maxMana}`;
      if (this.manaBar) this.manaBar.style.width = `${Math.min(100, curMana / maxMana * 100)}%`;
      if (this.lvlVal) this.lvlVal.innerText = curLevel.toString();
      if (this.capVal) this.capVal.innerText = curCap.toString();
      if (this.goldVal) this.goldVal.innerText = `${curGold} GP`;
      if (this.xpVal) this.xpVal.innerText = `${curXP}/${nextXP}`;
      this.updateSkills({ level: curLevel }, skills, { name: "Knight" });
    }
    // --- LOOT / CONTAINER UI ---
    toggleLoot(entityId, name2, items) {
      if (this.activeLootEntityId === entityId) {
        this.lootPanel.style.display = "none";
        this.activeLootEntityId = null;
        return;
      }
      this.activeLootEntityId = entityId;
      this.lootPanel.style.display = "block";
      const header = this.lootPanel.querySelector(".loot-header span");
      if (header) header.innerText = name2;
      this.renderLootGrid(items);
    }
    renderLootGrid(items) {
      if (!this.lootGrid) return;
      this.lootGrid.innerHTML = "";
      items.forEach((item, index) => {
        const slot = document.createElement("div");
        slot.className = "loot-slot";
        const sprite = assetManager.getSpriteSource(item.uIndex);
        if (sprite && sprite.image) {
          const canvas2 = document.createElement("canvas");
          canvas2.width = 32;
          canvas2.height = 32;
          const ctx = canvas2.getContext("2d");
          if (ctx) ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, 32, 32);
          slot.appendChild(canvas2);
        } else {
          slot.innerText = item.name ? item.name.substring(0, 2) : "??";
        }
        this.lootGrid.appendChild(slot);
      });
    }
    renderMinimap(map2, player2) {
      let canvas2 = document.getElementById("minimap-canvas");
      if (!canvas2) {
        const container = document.getElementById("minimap-container");
        if (container) {
          container.innerHTML = "";
          canvas2 = document.createElement("canvas");
          canvas2.id = "minimap-canvas";
          canvas2.width = 150;
          canvas2.height = 150;
          container.appendChild(canvas2);
        } else {
          return;
        }
      }
      const ctx = canvas2.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas2.width, canvas2.height);
      const cx = canvas2.width / 2;
      const cy = canvas2.height / 2;
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(cx - 2, cy - 2, 4, 4);
    }
    // --- STUBS FOR GAME.TS COMPATIBILITY ---
    isShowing() {
      return false;
    }
    hideDialogue() {
      if (this.lootPanel) this.lootPanel.style.display = "none";
      if (this.dialogPanel) this.dialogPanel.style.display = "none";
      this.activeLootEntityId = null;
      this.activeMerchantId = null;
      document.body.focus();
    }
    showDialogue(msg, npcName = "NPC") {
      if (!this.dialogPanel) return;
      this.dialogPanel.style.display = "flex";
      this.dialogText.innerHTML = `<strong>${npcName}:</strong> ${msg}`;
      this.dialogNextBtn.style.display = "none";
      this.log(`[${npcName}] ${msg}`, "#ffe");
    }
    // 3. Replace the old openLoot stub with this:
    openLoot(lootable, entityId, playerInv) {
      this.activeLootEntityId = entityId;
      this.lootPanel.style.display = "flex";
      this.renderLoot(lootable, playerInv);
    }
    // 4. Add this new helper method
    renderLoot(lootable, playerInv) {
      this.lootGrid.innerHTML = "";
      if (lootable.items.length === 0) {
        this.hideDialogue();
        this.log("Corpse is empty.");
        return;
      }
      lootable.items.forEach((item, index) => {
        const slot = document.createElement("div");
        slot.className = "loot-slot";
        slot.innerText = item.name.substring(0, 2);
        slot.title = item.name;
        slot.style.color = item.color || "#fff";
        slot.onclick = () => {
          if (playerInv.addItem(item)) {
            this.log(`Looted: ${item.name}`);
            lootable.items.splice(index, 1);
            this.renderLoot(lootable, playerInv);
          } else {
            this.log("Inventory full!", "#ff5555");
          }
        };
        this.lootGrid.appendChild(slot);
      });
    }
    // --- SKILLS UI ---
    updateSkills(xp, skills, vocation) {
      const els = {
        level: document.getElementById("skill-level"),
        vocation: document.getElementById("skill-vocation"),
        magic: document.getElementById("skill-magic"),
        fist: document.getElementById("skill-fist"),
        club: document.getElementById("skill-club"),
        sword: document.getElementById("skill-sword"),
        axe: document.getElementById("skill-axe"),
        dist: document.getElementById("skill-distance"),
        shield: document.getElementById("skill-shielding")
      };
      if (els.level) els.level.innerText = xp.level.toString();
      if (els.vocation) els.vocation.innerText = vocation ? vocation.name : "None";
      if (els.magic) els.magic.innerText = skills.magic ? skills.magic.level.toString() : "0";
      if (els.fist) els.fist.innerText = (skills.fist ? skills.fist.level : 10).toString();
      if (els.club) els.club.innerText = (skills.club ? skills.club.level : 10).toString();
      if (els.sword) els.sword.innerText = (skills.sword ? skills.sword.level : 10).toString();
      if (els.axe) els.axe.innerText = (skills.axe ? skills.axe.level : 10).toString();
      if (els.dist) els.dist.innerText = (skills.distance ? skills.distance.level : 10).toString();
      if (els.shield) els.shield.innerText = (skills.shielding ? skills.shielding.level : 10).toString();
    }
    // --- SHOP SYSTEM ---
    toggleShop(merchantComp, merchantName) {
      if (this.activeMerchantId === merchantComp) {
      }
      this.shopPanel.style.display = "block";
      const header = this.shopPanel.querySelector(".shop-header span");
      if (header) header.innerText = `Shop: ${merchantName}`;
      this.renderShop(merchantComp);
    }
    renderShop(merchant) {
      this.activeMerchantId = merchant;
      this.shopPanel.style.display = "block";
      const grid = document.getElementById("shop-grid-content");
      if (!grid) return;
      grid.innerHTML = "";
      if (!merchant.items || merchant.items.length === 0) {
        grid.innerText = "Available soon!";
        return;
      }
      merchant.items.forEach((itemId) => {
        const itemDef = ItemRegistry[itemId];
        if (!itemDef) return;
        const card = document.createElement("div");
        card.className = "shop-item-card";
        const spriteInfo = assetManager.getSpriteSource(itemDef.uIndex);
        let imgHtml = '<div class="shop-icon-placeholder"></div>';
        if (spriteInfo && spriteInfo.image) {
        }
        card.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-name">${itemDef.name}</div>
                    <div class="shop-item-price">${itemDef.value || 10} GP</div>
                </div>
                <button class="buy-btn">Buy</button>
             `;
        const iconContainer = document.createElement("div");
        iconContainer.className = "shop-icon";
        if (spriteInfo && spriteInfo.image) {
          const cvs = document.createElement("canvas");
          cvs.width = 32;
          cvs.height = 32;
          const ctx = cvs.getContext("2d");
          if (ctx) ctx.drawImage(spriteInfo.image, spriteInfo.sx, spriteInfo.sy, spriteInfo.sw, spriteInfo.sh, 0, 0, 32, 32);
          iconContainer.appendChild(cvs);
        }
        card.prepend(iconContainer);
        const btn = card.querySelector(".buy-btn");
        btn.onclick = () => {
          const event = new CustomEvent("shopBuy", { detail: { item: itemDef, price: itemDef.value } });
          document.dispatchEvent(event);
        };
        grid.appendChild(card);
      });
    }
    renderSellGrid() {
      const grid = document.getElementById("shop-sell-content");
      if (!grid) return;
      grid.innerHTML = "";
      if (!this.player || !this.player.inventory) {
        grid.innerHTML = '<div style="padding:20px; color:#aaa">Inventory empty or not loaded.</div>';
        return;
      }
      const items = this.player.inventory;
      if (!items || items.length === 0) {
        grid.innerHTML = '<div style="padding:20px; color:#aaa">Nothing to sell.</div>';
        return;
      }
      items.forEach((item, index) => {
        if (!item) return;
        const card = document.createElement("div");
        card.className = "shop-item-card";
        const sellPrice = Math.floor((item.value || 0) * 0.5);
        if (sellPrice <= 0) return;
        const spriteInfo = assetManager.getSpriteSource(item.uIndex);
        let iconHtml = "";
        if (spriteInfo && spriteInfo.image) {
          const cvs = document.createElement("canvas");
          cvs.width = 32;
          cvs.height = 32;
          const ctx = cvs.getContext("2d");
          if (ctx) ctx.drawImage(spriteInfo.image, spriteInfo.sx, spriteInfo.sy, spriteInfo.sw, spriteInfo.sh, 0, 0, 32, 32);
        }
        card.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-price">Sell: ${sellPrice} GP</div>
                </div>
                <button class="buy-btn" style="background:#d44;">Sell</button>
            `;
        const iconContainer = document.createElement("div");
        iconContainer.className = "shop-icon";
        if (spriteInfo && spriteInfo.image) {
          const cvs = document.createElement("canvas");
          cvs.width = 32;
          cvs.height = 32;
          const ctx = cvs.getContext("2d");
          if (ctx) ctx.drawImage(spriteInfo.image, spriteInfo.sx, spriteInfo.sy, spriteInfo.sw, spriteInfo.sh, 0, 0, 32, 32);
          iconContainer.appendChild(cvs);
        }
        card.prepend(iconContainer);
        const btn = card.querySelector("button");
        btn.onclick = () => {
          const event = new CustomEvent("shopSell", { detail: { item, index } });
          document.dispatchEvent(event);
          card.remove();
          setTimeout(() => this.renderSellGrid(), 50);
        };
        grid.appendChild(card);
      });
    }
    // NOTE: buyItem is now handled by event listener in game.ts to avoid coupling UI directly to Inventory logic
    updateMagicHud(spellName) {
    }
    toggleSkillTree(book, points, voc, passives, cb) {
      this.log("Skills not implemented in UI Manager yet.", "#f55");
    }
    // 1. Function to Open a Window
    openContainer(item) {
      if (this.openContainers.find((c) => c.item === item)) return;
      this.openContainers.push({
        uid: Math.random().toString(36),
        item,
        x: 100 + this.openContainers.length * 20,
        // Cascade windows
        y: 100 + this.openContainers.length * 20,
        rows: 2,
        // 2x2 = 4 slots for now
        cols: 2
      });
      this.log("Container opened.");
    }
    // 2. Function to Close
    closeContainer(index) {
      this.openContainers.splice(index, 1);
    }
    // 3. Draw All Windows (Call this in your main loop!)
    renderWindows(ctx, mouseX, mouseY) {
      const SLOT_SIZE = 32;
      const PADDING = 10;
      const HEADER = 20;
      for (let i = 0; i < this.openContainers.length; i++) {
        const win = this.openContainers[i];
        const w = win.cols * SLOT_SIZE + PADDING * 2;
        const h = win.rows * SLOT_SIZE + PADDING * 2 + HEADER;
        ctx.fillStyle = "#b0b0b0";
        ctx.fillRect(win.x, win.y, w, h);
        ctx.strokeStyle = "#404040";
        ctx.lineWidth = 2;
        ctx.strokeRect(win.x, win.y, w, h);
        ctx.fillStyle = "#808080";
        ctx.fillRect(win.x + 2, win.y + 2, w - 4, HEADER);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Arial";
        ctx.fillText("Container", win.x + 5, win.y + 15);
        ctx.fillStyle = "#aa0000";
        ctx.fillRect(win.x + w - 18, win.y + 4, 14, 14);
        const startY = win.y + HEADER + PADDING;
        const startX = win.x + PADDING;
        for (let s = 0; s < win.item.capacity; s++) {
          const col = s % win.cols;
          const row = Math.floor(s / win.cols);
          const slotX = startX + col * SLOT_SIZE;
          const slotY = startY + row * SLOT_SIZE;
          ctx.fillStyle = "#505050";
          ctx.fillRect(slotX, slotY, 32, 32);
          ctx.strokeStyle = "#808080";
          ctx.strokeRect(slotX, slotY, 32, 32);
          if (win.item.inventory[s]) {
            const innerItem = win.item.inventory[s];
            const sprite = assetManager.getSpriteSource(innerItem.id);
            if (sprite) {
              ctx.drawImage(
                sprite.image,
                sprite.sx,
                sprite.sy,
                sprite.sw,
                sprite.sh,
                slotX,
                slotY,
                32,
                32
              );
            }
          }
        }
      }
    }
    // 4. Input Helper: Get Container Slot at Mouse Position
    getContainerSlotAt(screenX, screenY) {
      const SLOT_SIZE = 32;
      const PADDING = 10;
      const HEADER = 20;
      for (let i = this.openContainers.length - 1; i >= 0; i--) {
        const win = this.openContainers[i];
        const startX = win.x + PADDING;
        const startY = win.y + HEADER + PADDING;
        const w = win.cols * SLOT_SIZE + PADDING * 2;
        const h = win.rows * SLOT_SIZE + PADDING * 2 + HEADER;
        if (screenX >= win.x && screenX <= win.x + w && screenY >= win.y && screenY <= win.y + h) {
          for (let s = 0; s < win.item.capacity; s++) {
            const col = s % win.cols;
            const row = Math.floor(s / win.cols);
            const slotX = startX + col * SLOT_SIZE;
            const slotY = startY + row * SLOT_SIZE;
            if (screenX >= slotX && screenX <= slotX + 32 && screenY >= slotY && screenY <= slotY + 32) {
              return { containerIndex: i, slotIndex: s };
            }
          }
        }
      }
      return null;
    }
    renderGhostItem(ctx, item, x, y) {
      if (!item) return;
      ctx.save();
      ctx.globalAlpha = 0.7;
      const sprite = assetManager.getSpriteSource(item.id);
      if (sprite) {
        ctx.drawImage(
          sprite.image,
          sprite.sx,
          sprite.sy,
          sprite.sw,
          sprite.sh,
          x - 16,
          y - 16,
          32,
          32
        );
      } else {
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(x - 16, y - 16, 32, 32);
      }
      ctx.restore();
    }
    renderDragging(ctx, x, y) {
      if (!this.draggedItem) return;
      this.renderGhostItem(ctx, this.draggedItem, x, y);
    }
    setupEquipmentUI() {
      const container = document.getElementById("inventory-container");
      if (!container) return;
      container.innerHTML = `
            <div class="equip-doll">
                <div class="equip-slot" id="slot-amulet" data-slot="amulet"></div>
                <div class="equip-slot" id="slot-head" data-slot="helmet"></div>
                <div class="equip-slot" id="slot-backpack" data-slot="backpack"></div>
                
                <div class="equip-slot" id="slot-lhand" data-slot="lhand"></div>
                <div class="equip-slot" id="slot-body" data-slot="body"></div>
                <div class="equip-slot" id="slot-rhand" data-slot="rhand"></div>

                <div class="equip-slot" id="slot-ring" data-slot="ring"></div>
                <div class="equip-slot" id="slot-legs" data-slot="legs"></div>
                <div class="equip-slot" id="slot-ammo" data-slot="ammo"></div>

                <div class="equip-slot" id="slot-soul" data-slot="soul">Soul:<br>100</div>
                <div class="equip-slot" id="slot-boots" data-slot="boots"></div>
                <div class="equip-slot" id="slot-cap" data-slot="cap">Cap:<br>400</div>
            </div>
            
            <div id="inventory-panel" class="panel">
                 <div class="panel-header">Backpack</div>
                 <div class="inventory-grid" id="bag-grid"></div>
            </div>
        `;
      ["amulet", "head", "backpack", "lhand", "body", "rhand", "ring", "legs", "ammo", "boots"].forEach((slot) => {
        const el = document.getElementById(`slot-${slot}`);
        if (el) {
          this.equipmentSlots[slot] = el;
        }
      });
      this.bagPanel = document.getElementById("inventory-panel");
    }
    // Shop
    updateEquipment(inv) {
      if (!inv) return;
      Object.entries(this.equipmentSlots).forEach(([slotName, el]) => {
        const equipped = inv.getEquipped(slotName);
        el.innerHTML = "";
        if (equipped && equipped.item) {
          const uIndex = equipped.item.uIndex !== void 0 ? equipped.item.uIndex : equipped.item.id;
          const sprite = assetManager.getSpriteSource(uIndex);
          if (sprite && sprite.image) {
            const canvas2 = document.createElement("canvas");
            canvas2.width = 32;
            canvas2.height = 32;
            const ctx = canvas2.getContext("2d");
            if (ctx) ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, 32, 32);
            el.appendChild(canvas2);
          } else {
            el.innerText = equipped.item.name.substring(0, 2);
          }
          el.title = equipped.item.name;
          el.onmousedown = (e) => {
            if (e.button === 0) {
              this.draggedItem = equipped.item;
              this.draggingFrom = { type: "slot", slot: slotName };
            }
          };
          el.onmouseup = (e) => {
            if (e.button === 0 && this.draggedItem) {
              e.stopPropagation();
              this.handleDrop({ type: "slot", slot: slotName });
            }
          };
          el.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const def = ItemRegistry[uIndex];
            if (def) {
              if (def.name === "Shovel" || def.name === "Rope" || def.name === "Pickaxe" || def.name === "Machete") {
                this.targetingItem = def;
                document.body.style.cursor = "crosshair";
                this.log(`Using ${def.name}... select target.`);
              } else if (def.type === "food" || def.name.includes("Potion")) {
                this.log(`You cannot use ${def.name} directly yet.`);
              } else {
                this.log(`You look at separate ${def.name}.`);
              }
            }
          };
        }
      });
      if (this.bagPanel) {
        const grid = this.bagPanel.querySelector(".inventory-grid");
        if (grid) {
          grid.innerHTML = "";
          const bag = inv.getEquipped("backpack");
          if (bag && bag.contents) {
            bag.contents.forEach((inst, idx) => {
              const slot = document.createElement("div");
              slot.className = "loot-slot";
              const uIndex = inst.item.uIndex !== void 0 ? inst.item.uIndex : inst.item.id;
              const sprite = assetManager.getSpriteSource(uIndex);
              if (sprite && sprite.image) {
                const cvs = document.createElement("canvas");
                cvs.width = 32;
                cvs.height = 32;
                const ctx = cvs.getContext("2d");
                if (ctx) ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, 32, 32);
                slot.appendChild(cvs);
              } else {
                slot.innerText = inst.item.name.substring(0, 2);
              }
              slot.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const def = ItemRegistry[uIndex];
                if (def) {
                  if (def.name === "Shovel" || def.name === "Rope" || def.name === "Pickaxe") {
                    this.targetingItem = def;
                    document.body.style.cursor = "crosshair";
                    this.log(`Using ${def.name}... select target.`);
                  } else if (def.type === "food" || def.name.includes("Potion")) {
                    const event = new CustomEvent("playerAction", { detail: { action: "consume", item: def, fromBag: true, index: idx } });
                    document.dispatchEvent(event);
                  }
                }
              };
              slot.onmousedown = (e) => {
                if (e.button === 0) {
                  this.draggedItem = inst.item;
                  this.draggingFrom = { type: "container", containerIndex: 0, index: idx };
                }
              };
              slot.onmouseup = (e) => {
                if (e.button === 0 && this.draggedItem) {
                  e.stopPropagation();
                  this.handleDrop({ type: "container", containerIndex: 0, index: idx });
                }
              };
              grid.appendChild(slot);
            });
          }
        }
      }
    }
    // --- DROP LOGIC ---
    handleDrop(target) {
      if (!this.draggedItem || !this.draggingFrom) return;
      const event = new CustomEvent("playerAction", {
        detail: {
          action: "moveItem",
          item: this.draggedItem,
          from: this.draggingFrom,
          to: target
        }
      });
      document.dispatchEvent(event);
      this.draggedItem = null;
      this.draggingFrom = null;
    }
    // --- SKILLS UI INTERACTION ---
    toggleSkills(skills) {
      this.log("Skills are shown in the right sidebar.");
      const sidebar = document.getElementById("skills-container");
      if (sidebar) {
        sidebar.style.transition = "border-color 0.2s";
        sidebar.style.borderColor = "#ffd700";
        setTimeout(() => {
          sidebar.style.borderColor = "#555";
        }, 500);
      }
    }
    onChatInput() {
      if (!this.chatInput) return;
      const text = this.chatInput.value.trim();
      if (!text) return;
      this.chatInput.value = "";
      if (this.world) {
        const player2 = this.world.query([PlayerControllable])[0];
        if (player2 !== void 0 && attemptCastSpell(this.world, player2, text, this)) {
          return;
        }
      }
      this.log(`You says: "${text}"`, "#fff");
    }
    setWorld(world2) {
      this.world = world2;
    }
  };

  // src/core/combat_system.ts
  init_constants();
  var combatSystem = (world2) => {
    const now = performance.now();
    const combatants = world2.query([CombatState, Position, Stats, Target, Skills]);
    for (const attackerId of combatants) {
      const combat = world2.getComponent(attackerId, CombatState);
      const pos = world2.getComponent(attackerId, Position);
      const stats = world2.getComponent(attackerId, Stats);
      const skills = world2.getComponent(attackerId, Skills);
      const targetComp = world2.getComponent(attackerId, Target);
      if (!stats || !skills) continue;
      const cooldownMs = 1e3 / stats.attackSpeed;
      if (now - combat.lastAttackTime < cooldownMs) continue;
      const targetId = targetComp.targetId;
      if (targetId === null) continue;
      const tPos = world2.getComponent(targetId, Position);
      const tHealth = world2.getComponent(targetId, Health);
      if (!tPos || !tHealth || tHealth.current <= 0) {
        targetComp.targetId = null;
        continue;
      }
      let range = stats.range || 48;
      let skillLevel = skills.sword.level;
      let weaponAtk = stats.attack;
      const dist = Math.sqrt((tPos.x - pos.x) ** 2 + (tPos.y - pos.y) ** 2);
      if (dist <= range) {
        combat.lastAttackTime = now;
        if (Math.random() > 0.9) {
          damageTextManager.addText(tPos.x, tPos.y - 16, "MISS", "#aaaaaa");
          continue;
        }
        let rawDmg = skillLevel * weaponAtk * 0.05;
        const variance = Math.random() * 0.3 - 0.2;
        rawDmg = rawDmg * (1 + variance);
        let isCrit = false;
        if (Math.random() < 0.05) {
          isCrit = true;
          rawDmg *= 1.5;
        }
        let defense = 0;
        const tStats = world2.getComponent(targetId, Stats);
        if (tStats) defense = tStats.defense;
        let damage = Math.max(0, rawDmg - defense);
        damage = Math.floor(damage);
        tHealth.current = Math.max(0, tHealth.current - damage);
        if (damage <= 0) {
          damageTextManager.addText(tPos.x, tPos.y - 16, "BLOCK", "#00aaff");
        } else {
          if (isCrit) {
            damageTextManager.addText(tPos.x, tPos.y - 24, `CRIT ${damage}!`, "#ffff00");
          } else {
            damageTextManager.addText(tPos.x + 8, tPos.y, damage.toString(), "#ff3333");
          }
        }
        if (tHealth.current <= 0) {
          handleDeath(world2, targetId);
          targetComp.targetId = null;
        }
      }
    }
  };
  function handleDeath(world2, victimId) {
    const pos = world2.getComponent(victimId, Position);
    const sprite = world2.getComponent(victimId, Sprite);
    const loot = world2.getComponent(victimId, Lootable);
    if (pos && sprite) {
      const corpseId = world2.createEntity();
      world2.addComponent(corpseId, new Position(pos.x, pos.y));
      const cSprite = new Sprite(SPRITES.CORPSE || 299, 32);
      cSprite.tint = new Tint("#aaaaaa");
      world2.addComponent(corpseId, cSprite);
      const lootItems = [];
      if (loot && loot.items) {
        for (const item of loot.items) {
          if (Math.random() < 0.5) {
            lootItems.push(item);
            console.log(`[Loot] ${name?.value || "Entity"} dropped ${item.name} into corpse.`);
          }
        }
      }
      world2.addComponent(corpseId, new Lootable(lootItems));
      world2.addComponent(corpseId, new Corpse(300));
    }
    world2.removeEntity(victimId);
  }

  // src/core/persistence.ts
  var SAVE_KEY = "retro_rpg_save_v1";
  function saveGame(world2) {
    const pEnt = world2.query([PlayerControllable2, Position, Health, Inventory])[0];
    if (pEnt === void 0) return;
    const pos = world2.getComponent(pEnt, Position);
    const hp = world2.getComponent(pEnt, Health);
    const mana = world2.getComponent(pEnt, Mana);
    const xp = world2.getComponent(pEnt, Experience);
    const skills = world2.getComponent(pEnt, Skills);
    const inv = world2.getComponent(pEnt, Inventory);
    const equippedItems = [];
    inv.equipment.forEach((inst, slot) => {
      if (slot !== "backpack") {
        equippedItems.push({
          slot,
          itemIdx: inst.item.uIndex !== void 0 ? inst.item.uIndex : inst.item.id,
          // Use ID if uIndex missing
          count: inst.count
        });
      }
    });
    const backpackItems = [];
    const bag = inv.getEquipped("backpack");
    if (bag && bag.contents) {
      bag.contents.forEach((inst) => {
        backpackItems.push({
          itemIdx: inst.item.uIndex !== void 0 ? inst.item.uIndex : inst.item.id,
          count: inst.count
        });
      });
    }
    const data = {
      player: {
        position: { x: Math.floor(pos.x), y: Math.floor(pos.y) },
        health: { current: hp.current, max: hp.max },
        mana: { current: mana ? mana.current : 0, max: mana ? mana.max : 0 },
        xp: {
          current: xp ? xp.current : 0,
          next: xp ? xp.next : 100,
          level: xp ? xp.level : 1
        },
        skills: skills ? JSON.parse(JSON.stringify(skills)) : {},
        // Simple clone
        inventory: {
          gold: inv.gold,
          cap: inv.cap,
          equipment: equippedItems,
          backpack: backpackItems
        }
      },
      timestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    console.log("[Persistence] Game Saved.");
  }

  // src/core/regen_system.ts
  var regenSystem = (world2, dt) => {
    const entities = world2.query([Health, Mana, Vocation, RegenState]);
    for (const id of entities) {
      const hp = world2.getComponent(id, Health);
      const mana = world2.getComponent(id, Mana);
      const vocComp = world2.getComponent(id, Vocation);
      const regen = world2.getComponent(id, RegenState);
      let hpRate = 4;
      let manaRate = 4;
      const vName = vocComp.name.toLowerCase();
      if (vName === "knight") {
        hpRate = 3;
        manaRate = 6;
      } else if (vName === "mage" || vName === "sorcerer" || vName === "druid") {
        hpRate = 6;
        manaRate = 3;
      } else if (vName === "paladin") {
        hpRate = 4;
        manaRate = 4;
      }
      regen.hpTimer += dt;
      if (regen.hpTimer >= hpRate) {
        if (hp.current < hp.max) {
          hp.current++;
          regen.hpTimer = 0;
        }
      }
      regen.manaTimer += dt;
      if (regen.manaTimer >= manaRate / 2) {
        if (mana.current < mana.max) {
          mana.current++;
          regen.manaTimer = 0;
        }
      }
    }
  };

  // src/core/map_generator.ts
  init_constants();
  var MapGenerator = class {
    map;
    width;
    height;
    rng;
    landMap;
    // true = land, false = water
    constructor(map2, seed) {
      this.map = map2;
      this.width = map2.width;
      this.height = map2.height;
      this.rng = new RNG(seed);
      this.landMap = [];
    }
    teleporters = [];
    generate() {
      this.initializeOcean();
      this.generateLandmasses();
      this.paintTerrain();
      this.generateTown();
      this.generateInteriors();
      this.populateWorld();
    }
    // ... (Existing methods until generateTown) ...
    initializeOcean() {
      this.landMap = [];
      for (let y = 0; y < this.height; y++) {
        this.landMap[y] = [];
        for (let x = 0; x < this.width; x++) {
          this.landMap[y][x] = false;
          const tile = this.map.getTile(x, y);
          if (tile) tile.baseId = SPRITES.WATER;
        }
      }
    }
    generateLandmasses() {
      const numIslands = 5;
      for (let i = 0; i < numIslands; i++) {
        let cx = Math.floor(this.rng.next() * this.width);
        let cy = Math.floor(this.rng.next() * this.height);
        let size = 200 + Math.floor(this.rng.next() * 500);
        if (i === 0) {
          cx = Math.floor(this.width / 2);
          cy = Math.floor(this.height / 2);
          size = 1500;
        }
        for (let j = 0; j < size; j++) {
          if (this.isValid(cx, cy)) {
            this.landMap[cy][cx] = true;
            if (this.isValid(cx + 1, cy)) this.landMap[cy][cx + 1] = true;
            if (this.isValid(cx, cy + 1)) this.landMap[cy + 1][cx] = true;
          }
          cx += Math.floor(this.rng.next() * 3) - 1;
          cy += Math.floor(this.rng.next() * 3) - 1;
        }
      }
    }
    paintTerrain() {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (this.landMap[y][x]) {
            const tile = this.map.getTile(x, y);
            if (tile) tile.baseId = SPRITES.GRASS;
          }
        }
      }
    }
    generateTown() {
      const cx = Math.floor(this.width / 2);
      const cy = Math.floor(this.height / 2);
      for (let y = cy - 15; y < cy + 15; y++) {
        for (let x = cx - 15; x < cx + 15; x++) {
          if (this.isValid(x, y)) {
            this.landMap[y][x] = true;
            this.map.getTile(x, y).baseId = SPRITES.GRASS;
          }
        }
      }
      const w = 20;
      const h = 20;
      const tx = cx - 10;
      const ty = cy - 10;
      for (let y = ty; y < ty + h; y++) {
        for (let x = tx; x < tx + w; x++) {
          const tile = this.map.getTile(x, y);
          if (tile) tile.baseId = SPRITES.FLOOR_DIRT;
        }
      }
      for (let x = tx; x < tx + w; x++) {
        this.placeWall(x, ty, SPRITES.WALL_STONE_H);
        this.placeWall(x, ty + h - 1, SPRITES.WALL_STONE_H);
      }
      for (let y = ty; y < ty + h; y++) {
        this.placeWall(tx, y, SPRITES.WALL_STONE_V);
        this.placeWall(tx + w - 1, y, SPRITES.WALL_STONE_V);
      }
      this.placeWall(tx, ty, SPRITES.WALL_STONE_NW);
      this.placeWall(tx + w - 1, ty, SPRITES.WALL_STONE_NE);
      this.placeWall(tx, ty + h - 1, SPRITES.WALL_STONE_SW);
      this.placeWall(tx + w - 1, ty + h - 1, SPRITES.WALL_STONE_SE);
      const smithyX = tx + 2;
      const smithyY = ty + 2;
      this.buildBuilding(smithyX, smithyY, 6, 6, SPRITES.WALL_STONE_H, SPRITES.FLOOR_STONE);
      this.map.getTile(smithyX + 2, smithyY + 2).addItem(new Item(SPRITES.CRATE));
      const sDoorX = smithyX + 3;
      const sDoorY = smithyY + 5;
      this.map.getTile(sDoorX, sDoorY).baseId = SPRITES.FLOOR_STONE;
      this.map.getTile(sDoorX, sDoorY).removeWall();
      this.teleporters.push({ x: sDoorX, y: sDoorY, tx: 5 + 3, ty: 5 + 4 });
      const magicX = tx + w - 8;
      const magicY = ty + 2;
      this.buildBuilding(magicX, magicY, 6, 6, SPRITES.WALL_STONE_H, SPRITES.FLOOR_WOOD);
      this.map.getTile(magicX + 2, magicY + 2).addItem(new Item(SPRITES.BARREL));
      const mDoorX = magicX + 3;
      const mDoorY = magicY + 5;
      this.map.getTile(mDoorX, mDoorY).baseId = SPRITES.FLOOR_WOOD;
      this.map.getTile(mDoorX, mDoorY).removeWall();
      this.teleporters.push({ x: mDoorX, y: mDoorY, tx: 15 + 3, ty: 5 + 4 });
      this.buildBuilding(tx + 6, ty + 12, 8, 8, SPRITES.WALL_STONE_H, SPRITES.COBBLE);
      this.map.getTile(tx + 4, ty + 15).addItem(new Item(SPRITES.GOLD));
      this.map.getTile(cx, ty).baseId = SPRITES.FLOOR_DIRT;
      this.map.getTile(cx, ty).removeWall();
      this.map.getTile(cx, ty + h - 1).baseId = SPRITES.FLOOR_DIRT;
      this.map.getTile(cx, ty + h - 1).removeWall();
    }
    generateInteriors() {
      console.log("[MapGen] Generating Interiors at 0,0...");
      const sX = 5;
      const sY = 5;
      this.buildBuilding(sX, sY, 8, 8, SPRITES.WALL_STONE_H, SPRITES.FLOOR_STONE);
      this.map.getTile(sX + 1, sY + 1).addItem(new Item(SPRITES.CRATE));
      this.map.getTile(sX + 6, sY + 1).addItem(new Item(SPRITES.AXE));
      const sExitX = sX + 3;
      const sExitY = sY + 7;
      this.map.getTile(sExitX, sExitY).baseId = SPRITES.FLOOR_STONE;
      this.map.getTile(sExitX, sExitY).removeWall();
      const cx = Math.floor(this.width / 2);
      const cy = Math.floor(this.height / 2);
      const tx = cx - 10;
      const ty = cy - 10;
      const sDoorX = tx + 2 + 3;
      const sDoorY = ty + 2 + 5;
      this.teleporters.push({ x: sExitX, y: sExitY, tx: sDoorX, ty: sDoorY + 1 });
      const mX = 15;
      const mY = 5;
      this.buildBuilding(mX, mY, 8, 8, SPRITES.WALL_STONE_H, SPRITES.FLOOR_WOOD);
      this.map.getTile(mX + 1, mY + 1).addItem(new Item(SPRITES.BARREL));
      this.map.getTile(mX + 6, mY + 1).addItem(new Item(SPRITES.POTION));
      const mExitX = mX + 3;
      const mExitY = mY + 7;
      this.map.getTile(mExitX, mExitY).baseId = SPRITES.FLOOR_WOOD;
      this.map.getTile(mExitX, mExitY).removeWall();
      const mDoorX = tx + 20 - 8 + 3;
      const mDoorY = ty + 2 + 5;
      this.teleporters.push({ x: mExitX, y: mExitY, tx: mDoorX, ty: mDoorY + 1 });
    }
    buildBuilding(bx, by, w, h, wallId, floorId) {
      for (let y = by; y < by + h; y++) {
        for (let x = bx; x < bx + w; x++) {
          const tile = this.map.getTile(x, y);
          if (tile) tile.baseId = floorId;
        }
      }
      for (let x = bx; x < bx + w; x++) {
        this.placeWall(x, by, wallId);
        this.placeWall(x, by + h - 1, wallId);
      }
      for (let y = by; y < by + h; y++) {
        this.placeWall(bx, y, wallId);
        this.placeWall(bx + w - 1, y, wallId);
        this.placeWall(bx, y, SPRITES.WALL_STONE_V);
        this.placeWall(bx + w - 1, y, SPRITES.WALL_STONE_V);
      }
      const doorX = bx + Math.floor(w / 2);
      const doorY = by + h - 1;
    }
    generateDwarfMines(cx, cy) {
      console.log(`[MapGen] Generating Dwarf Mines at ${cx},${cy}`);
      const r = 12;
      for (let y = cy - r; y < cy + r; y++) {
        for (let x = cx - r; x < cx + r; x++) {
          if (this.isValid(x, y)) {
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist < r) {
              this.landMap[y][x] = true;
              const tile = this.map.getTile(x, y);
              tile.baseId = SPRITES.FLOOR_STONE;
              if (this.rng.next() < 0.3) {
                tile.addItem(new Item(SPRITES.ROCK_LARGE));
              }
            }
          }
        }
      }
    }
    generateOrcFortress(cx, cy) {
      console.log(`[MapGen] Generating Orc Fortress at ${cx},${cy}`);
      const r = 10;
      for (let y = cy - r; y < cy + r; y++) {
        for (let x = cx - r; x < cx + r; x++) {
          if (this.isValid(x, y)) {
            this.landMap[y][x] = true;
            const tile = this.map.getTile(x, y);
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist < r) {
              tile.baseId = SPRITES.FLOOR_WOOD;
              if (dist > r - 2 && this.rng.next() < 0.9) {
                tile.addItem(new Item(SPRITES.CUSTOM_WOOD_FENCE));
              }
            }
          }
        }
      }
    }
    generateDragonPeak(cx, cy) {
      console.log(`[MapGen] Generating Dragon Peak at ${cx},${cy}`);
      const r = 8;
      for (let y = cy - r; y < cy + r; y++) {
        for (let x = cx - r; x < cx + r; x++) {
          if (this.isValid(x, y)) {
            if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) < r) {
              this.landMap[y][x] = true;
              const tile = this.map.getTile(x, y);
              tile.baseId = SPRITES.FLOOR_STONE;
              if (this.rng.next() < 0.1) tile.addItem(new Item(SPRITES.GOLD));
            }
          }
        }
      }
    }
    populateWorld() {
      let mineX = Math.floor(this.width * 0.2);
      let mineY = Math.floor(this.height * 0.5);
      this.generateDwarfMines(mineX, mineY);
      let fortX = Math.floor(this.width * 0.8);
      let fortY = Math.floor(this.height * 0.7);
      this.generateOrcFortress(fortX, fortY);
      let peakX = Math.floor(this.width * 0.5);
      let peakY = Math.floor(this.height * 0.15);
      this.generateDragonPeak(peakX, peakY);
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (!this.landMap[y][x]) continue;
          const dist = Math.sqrt((x - this.width / 2) ** 2 + (y - this.height / 2) ** 2);
          if (dist < 25) continue;
          const r = this.rng.next();
          const tile = this.map.getTile(x, y);
          if (tile && tile.items.length === 0 && tile.baseId !== SPRITES.CUSTOM_SAND) {
            if (r < 0.05) tile.addItem(new Item(SPRITES.TREE_PINE));
            else if (r < 0.08) tile.addItem(new Item(SPRITES.TREE_OAK));
            else if (r < 0.09) tile.addItem(new Item(SPRITES.ROCK_LARGE));
          }
        }
      }
    }
    placeWall(x, y, type) {
      const tile = this.map.getTile(x, y);
      if (tile) {
        tile.baseId = SPRITES.WALL_STONE_H;
        tile.addItem(new Item(type));
      }
    }
    isValid(x, y) {
      return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
  };

  // src/save.ts
  var SAVE_KEY2 = "retro-rpg-save-v3";
  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY2);
  }
  function getSavedSeed() {
    const json = localStorage.getItem(SAVE_KEY2);
    if (!json) return null;
    try {
      const data = JSON.parse(json);
      return data.seed || null;
    } catch {
      return null;
    }
  }
  function loadGame(world2, ui2) {
    const json = localStorage.getItem(SAVE_KEY2);
    if (!json) return false;
    try {
      const data = JSON.parse(json);
      console.log("[Save] Loaded Seed: ", data.seed);
      const playerEntity = world2.query([PlayerControllable2, Position, Health, Inventory, QuestLog, Experience])[0];
      if (playerEntity === void 0) return false;
      const pos = world2.getComponent(playerEntity, Position);
      pos.x = data.position.x;
      pos.y = data.position.y;
      const hp = world2.getComponent(playerEntity, Health);
      hp.current = data.health.current;
      hp.max = data.health.max;
      const mana = world2.getComponent(playerEntity, Mana);
      if (mana) {
        if (data.mana) {
          mana.current = data.mana.current;
          mana.max = data.mana.max;
        } else {
          const vocKey = (data.vocation || "knight").toLowerCase();
          const vocData = VOCATIONS[vocKey];
          if (vocData) {
            const lvl = data.experience ? data.experience.level : 1;
            mana.max = vocData.startMana + vocData.manaGain * (lvl - 1);
            mana.current = mana.max;
          }
        }
      }
      if (data.vocation) {
        const vocKey = data.vocation.toLowerCase();
        const vocData = VOCATIONS[vocKey];
        if (vocData) {
          const currentVoc = world2.getComponent(playerEntity, Vocation);
          if (currentVoc) {
            currentVoc.name = vocData.name;
            currentVoc.hpGain = vocData.hpGain;
            currentVoc.manaGain = vocData.manaGain;
            currentVoc.capGain = vocData.capGain;
          } else {
            world2.addComponent(playerEntity, new Vocation(vocData.name, vocData.hpGain, vocData.manaGain, vocData.capGain));
          }
          const vocationSpriteMap = {
            "knight": SPRITES.PLAYER,
            "mage": SPRITES.MAGE,
            "ranger": SPRITES.RANGER,
            "paladin": SPRITES.GUARD
          };
          const spriteIndex = vocationSpriteMap[vocKey] ?? SPRITES.PLAYER;
          const spriteComp = world2.getComponent(playerEntity, Sprite);
          if (spriteComp) {
            spriteComp.uIndex = spriteIndex;
          }
        }
      }
      const inv = world2.getComponent(playerEntity, Inventory);
      inv.gold = data.inventory.gold || 0;
      inv.equipment.clear();
      if (data.inventory.items) {
        data.inventory.items.forEach((i) => {
          const newItem = new Item2(i.name, i.slot || "backpack", i.uIndex, i.damage, i.price, i.description, i.weaponType || "none", "common", i.defense || 0, 0, 0, false, 0);
          const inst = new ItemInstance2(newItem, 1);
          inv.equip(i.slot || "backpack", inst);
        });
      } else if (data.inventory.equipment) {
        data.inventory.equipment.forEach((i) => {
          const newItem = new Item2(
            i.name,
            i.slotType || "none",
            i.uIndex,
            i.damage,
            i.price,
            i.description,
            i.weaponType,
            "common",
            i.defense || 0,
            0,
            0,
            i.name === "Backpack",
            i.name === "Backpack" ? 20 : 0
          );
          const inst = new ItemInstance2(newItem, i.count || 1);
          if (i.contents) {
            i.contents.forEach((c) => {
              const subItem = new Item2(c.name, c.slotType, c.uIndex, c.damage, c.price, c.description, c.weaponType, "common", c.defense);
              inst.contents.push(new ItemInstance2(subItem, c.count));
            });
          }
          inv.equip(i.slotKey, inst);
        });
      }
      const xp = world2.getComponent(playerEntity, Experience);
      if (data.experience) {
        xp.current = data.experience.current;
        xp.next = data.experience.next;
        xp.level = data.experience.level;
      }
      const light = world2.getComponent(playerEntity, LightSource);
      if (light) {
        light.radius = 64;
        light.color = "#cc8844";
        light.flickers = true;
      }
      if (data.magic) {
        const spells = world2.getComponent(playerEntity, SpellBook);
        if (spells) {
          spells.knownSpells = new Map(data.magic.knownSpells);
        } else {
          const sb = new SpellBook();
          sb.knownSpells = new Map(data.magic.knownSpells);
          world2.addComponent(playerEntity, sb);
        }
        const sp = world2.getComponent(playerEntity, SkillPoints);
        if (sp) {
          sp.current = data.magic.skillPoints;
        } else {
          world2.addComponent(playerEntity, new SkillPoints(data.magic.skillPoints, 0));
        }
        const active = world2.getComponent(playerEntity, ActiveSpell);
        if (active) {
          active.spellName = data.magic.activeSpell;
        } else {
          world2.addComponent(playerEntity, new ActiveSpell(data.magic.activeSpell));
        }
      } else {
        const spells = world2.getComponent(playerEntity, SpellBook);
        if (spells && !spells.knownSpells.has("Fireball")) spells.knownSpells.set("Fireball", 1);
        else if (!spells) world2.addComponent(playerEntity, new SpellBook());
        const active = world2.getComponent(playerEntity, ActiveSpell);
        if (!active) {
          world2.addComponent(playerEntity, new ActiveSpell("adori flam"));
        }
        if (!world2.getComponent(playerEntity, SkillPoints)) {
          world2.addComponent(playerEntity, new SkillPoints(0, 0));
        }
      }
      if (data.passives) {
        world2.addComponent(playerEntity, new Passives(
          data.passives.vitality,
          data.passives.spirit,
          data.passives.agility,
          data.passives.might
        ));
      } else {
        if (!world2.getComponent(playerEntity, Passives)) {
          world2.addComponent(playerEntity, new Passives());
        }
      }
      ui2.updateStatus(hp.current, hp.max, 50, 50, 400, inv.gold, xp.level, xp.current, xp.next);
      if (ui2.console) ui2.console.addSystemMessage("Game Loaded.");
      return true;
    } catch (e) {
      console.error("Load failed:", e);
      if (ui2.console) ui2.console.addSystemMessage("Save Corrupt. Starting New Game.");
      return false;
    }
  }

  // src/main.ts
  console.log("[Main] Script Loaded. Imports Success.");
  var CANVAS_WIDTH = 800;
  var MAP_WIDTH = 128;
  var MAP_HEIGHT = 128;
  var canvas = document.getElementById("gameCanvas");
  if (!canvas) throw new Error("No canvas found with id 'gameCanvas'");
  function resize() {
    const container = document.getElementById("viewport");
    if (container && canvas) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }
  window.addEventListener("resize", resize);
  resize();
  var map;
  var player;
  var renderer;
  var world;
  var input;
  var ui;
  var audio = new AudioController();
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  });
  var currentMouseX = 0;
  var currentMouseY = 0;
  async function start() {
    console.log("[Main] Starting Engine... (Version: Visual Polish v3)");
    await assetManager.loadAll();
    world = new World();
    input = new InputHandler();
    ui = new UIManager();
    window.addEventListener("mousedown", (e) => {
      const target = e.target;
      console.log(`[GlobalClick] Target: <${target.tagName} id="${target.id}" class="${target.className}"> at ${e.clientX},${e.clientY}`);
    }, true);
    window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      currentMouseX = (e.clientX - rect.left) * scaleX;
      currentMouseY = (e.clientY - rect.top) * scaleY;
    });
    let seed = getSavedSeed();
    if (seed === null) {
      seed = Math.floor(Math.random() * 1e4);
      console.log(`[Main] New World Seed: ${seed}`);
    } else {
      console.log(`[Main] Loading World Seed: ${seed}`);
    }
    map = new WorldMap(MAP_WIDTH, MAP_HEIGHT);
    const generator = new MapGenerator(map, seed);
    generator.generate();
    console.log("[Main] Map Generated via MapGenerator");
    const centerX = Math.floor(MAP_WIDTH / 2);
    const centerY = Math.floor(MAP_HEIGHT / 2);
    const centerIdx = centerY * MAP_WIDTH + centerX;
    console.log(`[Main] Map Center: ${centerX}, ${centerY}`);
    if (map.tiles[centerIdx]) {
      map.tiles[centerIdx].items = [new Item(16)];
    }
    const swordIdx = centerY * MAP_WIDTH + (centerX + 1);
    if (map.tiles[swordIdx]) {
      if (map.tiles[swordIdx].items.length === 0) map.tiles[swordIdx].addItem(new Item(16));
      map.tiles[swordIdx].addItem(new Item(2));
    }
    if (generator.teleporters) {
      generator.teleporters.forEach((t) => {
        const ent = world.createEntity();
        world.addComponent(ent, new Position(t.x * TILE_SIZE, t.y * TILE_SIZE));
        world.addComponent(ent, new Teleporter(t.tx, t.ty));
        world.addComponent(ent, new Collider(32, 32));
        console.log(`[Main] Spawned Teleporter at ${t.x},${t.y} -> ${t.tx},${t.ty}`);
      });
    }
    const mapEnt = world.createEntity();
    const mapComp = new TileMap(map.width, map.height, TILE_SIZE);
    mapComp.tiles = map.tiles.map((coreTile) => {
      const cTile = new Tile2();
      coreTile.items.forEach((it) => {
        cTile.add(it.id);
      });
      return cTile;
    });
    world.addComponent(mapEnt, mapComp);
    const pe = world.createEntity();
    world.addComponent(pe, new PlayerControllable2());
    let safeX = Math.floor(MAP_WIDTH / 2) * TILE_SIZE;
    let safeY = Math.floor(MAP_HEIGHT / 2) * TILE_SIZE;
    if (map.tiles[centerIdx] && map.tiles[centerIdx].items.some((i) => PHYSICS.isSolid(i.id))) {
      safeX += TILE_SIZE;
    }
    world.addComponent(pe, new Position(safeX, safeY));
    world.addComponent(pe, new Velocity(0, 0));
    world.addComponent(pe, new Sprite(SPRITES.PLAYER));
    world.addComponent(pe, new Inventory());
    world.addComponent(pe, new Passives());
    world.addComponent(pe, new Health(100, 100));
    world.addComponent(pe, new Mana(50, 50));
    world.addComponent(pe, new Experience(0, 100, 1));
    world.addComponent(pe, new Skills());
    world.addComponent(pe, new QuestLog());
    const sb = new SpellBook();
    if (!sb.knownSpells.has("Fireball")) sb.knownSpells.set("Fireball", 1);
    world.addComponent(pe, sb);
    world.addComponent(pe, new ActiveSpell("adori flam"));
    world.addComponent(pe, new SkillPoints(0, 0));
    world.addComponent(pe, new Stats(10, 5, 1.5));
    world.addComponent(pe, new CombatState());
    world.addComponent(pe, new Target(null));
    world.addComponent(pe, new Vocation("Knight", 15, 5, 25));
    world.addComponent(pe, new RegenState());
    player = new Player(safeX / TILE_SIZE, safeY / TILE_SIZE);
    player.id = pe;
    renderer = new PixelRenderer(canvas);
    console.log("[Main] Renderer Created");
    const townCX = 64;
    const townCY = 64;
    const merchant = world.createEntity();
    world.addComponent(merchant, new Position((townCX - 6) * TILE_SIZE, townCY * TILE_SIZE));
    world.addComponent(merchant, new Sprite(SPRITES.NPC_MERCHANT));
    world.addComponent(merchant, new Name("Gorn"));
    world.addComponent(merchant, new Interactable("Trade"));
    world.addComponent(merchant, new Merchant([SPRITES.POTION, SPRITES.TORCH, SPRITES.SHOVEL, SPRITES.CLUB]));
    world.addComponent(merchant, new NPC2("merchant", ["Welcome to my Smithy!", "I sell only the essentials.", "You'll have to find better gear yourself."]));
    const healer = world.createEntity();
    world.addComponent(healer, new Position(townCX * TILE_SIZE, (townCY + 8) * TILE_SIZE));
    world.addComponent(healer, new Sprite(SPRITES.NPC_HEALER));
    world.addComponent(healer, new Name("Adana"));
    world.addComponent(healer, new Interactable("Heal"));
    world.addComponent(healer, new NPC2("healer", ["Blessings upon you.", "Do you need healing?"]));
    const guide = world.createEntity();
    world.addComponent(guide, new Position((townCX + 6) * TILE_SIZE, townCY * TILE_SIZE));
    world.addComponent(guide, new Sprite(SPRITES.NPC_GUIDE));
    world.addComponent(guide, new Name("Oldrak"));
    world.addComponent(guide, new Interactable("Talk"));
    world.addComponent(guide, new NPC2("guide", ["The Dragon Peak lies to the North.", "Beware the Orcs in the East.", "I have a task for you."]));
    world.addComponent(guide, new QuestGiver([
      {
        id: 1,
        name: "Orc Slayer",
        description: "Kill 5 Orcs in the Eastern Fortress.",
        type: "kill",
        target: "Orc",
        required: 5,
        reward: { gold: 100, xp: 200 }
      }
    ]));
    console.log("[Main] Spawning Mobs...");
    for (let i = 0; i < 50; i++) {
      let mx = 0, my = 0;
      let attempts = 0;
      while (attempts < 20) {
        mx = Math.floor(Math.random() * MAP_WIDTH);
        my = Math.floor(Math.random() * MAP_HEIGHT);
        const t = map.getTile(mx, my);
        if (t && !t.solid && t.baseId !== 13 && t.baseId !== 304) {
          break;
        }
        attempts++;
      }
      const e = world.createEntity();
      world.addComponent(e, new Position(mx * TILE_SIZE, my * TILE_SIZE));
      world.addComponent(e, new Health(50, 50));
      const dist = Math.sqrt((mx - MAP_WIDTH / 2) ** 2 + (my - MAP_HEIGHT / 2) ** 2);
      const distToPeak = Math.sqrt((mx - 64) ** 2 + (my - 19) ** 2);
      if (distToPeak < 15) {
        world.addComponent(e, new Sprite(SPRITES.CUSTOM_DRAGON_HATCHLING));
        world.addComponent(e, new Name("Dragon Lord"));
        world.addComponent(e, new Stats(20, 10, 2));
        world.addComponent(e, new Health(200, 200));
        world.addComponent(e, new Tint("#FF4444BA"));
      } else if (Math.random() < 0.3) {
        const roll = Math.random();
        if (roll < 0.6) {
          world.addComponent(e, new Sprite(SPRITES.DWARF_MINER));
          world.addComponent(e, new Name("Dwarf Miner"));
          world.addComponent(e, new Tint("#AAAAAA80"));
        } else if (roll < 0.9) {
          world.addComponent(e, new Sprite(SPRITES.DWARF_GUARD));
          world.addComponent(e, new Name("Dwarf Guard"));
        } else {
          world.addComponent(e, new Sprite(SPRITES.DWARF_GEOMANCER));
          world.addComponent(e, new Name("Dwarf Geomancer"));
          world.addComponent(e, new Tint("#AA44FF80"));
        }
      } else {
        const roll = Math.random();
        if (roll < 0.6) {
          world.addComponent(e, new Sprite(SPRITES.ORC_PEON));
          world.addComponent(e, new Name("Orc Peon"));
          world.addComponent(e, new Tint("#88AA8880"));
        } else if (roll < 0.9) {
          world.addComponent(e, new Sprite(SPRITES.ORC));
          world.addComponent(e, new Name("Orc Warrior"));
        } else {
          world.addComponent(e, new Sprite(SPRITES.ORC_WARLORD));
          world.addComponent(e, new Name("Orc Warlord"));
          world.addComponent(e, new Tint("#FF444480"));
        }
      }
      world.addComponent(e, new CombatState());
      world.addComponent(e, new Target(null));
      world.addComponent(e, new Skills());
      if (!world.getComponent(e, Stats)) {
        world.addComponent(e, new Stats(10, 2, 1));
      }
      world.addComponent(e, new AI(30, "melee", 40));
    }
    const debugOrc = world.createEntity();
    world.addComponent(debugOrc, new Position(safeX + 64, safeY));
    world.addComponent(debugOrc, new Sprite(SPRITES.ORC));
    world.addComponent(debugOrc, new Health(100, 100));
    world.addComponent(debugOrc, new AI(30, "melee", 40));
    world.addComponent(debugOrc, new Name("Debug Orc"));
    world.addComponent(debugOrc, new Stats(8, 2, 0.8));
    if (hasSave()) {
      if (loadGame(world, ui)) {
        const pPos2 = world.getComponent(pe, Position);
        player.x = pPos2.x / TILE_SIZE;
        player.y = pPos2.y / TILE_SIZE;
      }
    } else {
      const pPos2 = world.getComponent(pe, Position);
      pPos2.x = player.x * TILE_SIZE;
      pPos2.y = player.y * TILE_SIZE;
      const inv = world.getComponent(pe, Inventory);
      inv.gold = 50;
      if (createItemFromRegistry) {
        const backpackItem = createItemFromRegistry(SPRITES.BACKPACK);
        if (backpackItem) {
          const bagInst = new ItemInstance2(backpackItem);
          inv.equip("backpack", bagInst);
          const sword = createItemFromRegistry(SPRITES.SWORD);
          const potion = createItemFromRegistry(SPRITES.POTION);
          if (sword) inv.addItem(sword);
          if (potion) inv.addItem(potion, 5);
        }
      }
    }
    const game = {
      update: (dt) => {
        if (world && input) {
          inputSystem(world, input);
          uiInteractionSystem(world, ui, input, player, map, renderer);
          combatSystem(world);
          aiSystem(world, dt);
          regenSystem(world, dt);
          decaySystem(world, dt);
          toolSystem(world, input, ui);
          teleportSystem(world, ui);
          movementSystem(world, dt, audio);
          cameraSystem(world, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
          if (pe !== void 0 && player) {
            const pPos2 = world.getComponent(pe, Position);
            const pSprite = world.getComponent(pe, Sprite);
            const pHp = world.getComponent(pe, Health);
            const pMana = world.getComponent(pe, Mana);
            const pXp = world.getComponent(pe, Experience);
            const pInv = world.getComponent(pe, Inventory);
            if (pPos2) {
              player.x = pPos2.x / TILE_SIZE;
              player.y = pPos2.y / TILE_SIZE;
            }
            if (pSprite) {
              player.spriteId = SPRITES.PLAYER;
              player.frame = pSprite.frame;
              player.direction = pSprite.direction;
            }
            if (pHp) {
              player.hp = pHp.current;
              player.maxHp = pHp.max;
            }
            if (pMana) {
              player.mana = pMana.current;
              player.maxMana = pMana.max;
            }
            if (pXp) {
              player.xp = pXp.current;
              player.nextXp = pXp.next;
              player.level = pXp.level;
            }
            if (pInv) {
              player.gold = pInv.gold;
              player.capacity = pInv.cap;
            }
            const pTarget = world.getComponent(pe, Target);
            if (pTarget) {
              if (player.targetId !== null) {
                const tHealth = world.getComponent(player.targetId, Health);
                if (!tHealth || tHealth.current <= 0) player.targetId = null;
              }
              if (pTarget.targetId !== player.targetId) pTarget.targetId = player.targetId;
            }
          }
          const screenWidth = canvas.width;
          const screenHeight = canvas.height;
          game.camera = {
            x: Math.floor(player.x * TILE_SIZE - screenWidth / 2 + TILE_SIZE / 2),
            y: Math.floor(player.y * TILE_SIZE - screenHeight / 2 + TILE_SIZE / 2)
          };
        }
      },
      getItemAt: (x, y) => {
        if (!map) return null;
        const tile = map.getTile(x, y);
        if (tile && tile.items.length > 0) {
          return tile.items[tile.items.length - 1];
        }
        return null;
      },
      spawnDebugSet: () => {
        spawnDebugSet(world, ui);
      },
      // Initialize Game Components
      map,
      // Keep existing map
      player,
      // Keep existing player
      ui,
      // Keep existing ui
      camera: { x: 0, y: 0 },
      // Placeholder, updated in render/update
      renderer,
      world
    };
    player.x = centerX;
    player.y = centerY;
    player.spriteId = SPRITES.PLAYER;
    console.log(`[Main] Player Spawned. Sprite Forced to: ${player.spriteId}`);
    const pPos = world.getComponent(pe, Position);
    pPos.x = centerX * TILE_SIZE;
    pPos.y = centerY * TILE_SIZE;
    console.log(`[Main] Spawned Player at Center: ${centerX}, ${centerY}`);
    const testMerchant = world.createEntity();
    const mX = (centerX + 2) * TILE_SIZE;
    const mY = centerY * TILE_SIZE;
    world.addComponent(testMerchant, new Position(mX, mY));
    world.addComponent(testMerchant, new Sprite(SPRITES.NPC_MERCHANT));
    world.addComponent(testMerchant, new Name("Gorn"));
    world.addComponent(testMerchant, new Interactable());
    world.addComponent(testMerchant, new Merchant([
      SPRITES.SWORD,
      SPRITES.AXE,
      SPRITES.CLUB,
      SPRITES.SHIELD,
      SPRITES.DWARF_HELMET,
      SPRITES.ARMOR,
      SPRITES.LEGS,
      SPRITES.DWARF_LEGS,
      SPRITES.POTION
    ]));
    console.log(`[Main] Spawned Test Merchant 'Gorn' at ${centerX + 2}, ${centerY}`);
    window.game = game;
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyP") game.spawnDebugSet();
      if (e.code === "KeyN") {
        game.player.spriteId++;
        console.log(`[Debug] New Sprite ID: ${game.player.spriteId}`);
      }
      if (e.code === "KeyB") {
        game.player.spriteId--;
        console.log(`[Debug] New Sprite ID: ${game.player.spriteId}`);
      }
      if (e.code === "KeyK") {
        console.log("[Main] KeyK Pressed - Toggling Skills");
        const skills = world.getComponent(player.id, Skills);
        const xp = world.getComponent(player.id, Experience);
        const combined = {
          ...skills,
          level: xp ? xp.level : 1
        };
        game.ui.toggleSkills(combined);
      }
    });
    let lastTime = performance.now();
    function loop() {
      const now = performance.now();
      const dt = (now - lastTime) / 1e3;
      lastTime = now;
      try {
        game.update(dt);
      } catch (e) {
        console.error("[Update Error]", e);
      }
      const renderEntities = [];
      const battleEntities = [];
      if (world) {
        const allEnts = world.query([Position, Sprite]);
        allEnts.forEach((eid) => {
          if (world.getComponent(eid, PlayerControllable2)) return;
          const pos = world.getComponent(eid, Position);
          const spr = world.getComponent(eid, Sprite);
          renderEntities.push({
            id: eid,
            x: pos.x,
            y: pos.y,
            spriteIndex: spr.uIndex,
            tint: world.getComponent(eid, Tint),
            name: world.getComponent(eid, Name)?.value,
            health: world.getComponent(eid, Health),
            equipment: (() => {
              const inv = world.getComponent(eid, Inventory);
              if (!inv) return void 0;
              const eq = {};
              inv.equipment.forEach((inst, slot) => {
                eq[slot] = inst.item.uIndex || inst.item.id;
              });
              return eq;
            })()
          });
          if (eid === player.id) {
            spr.uIndex = SPRITES.PLAYER;
          }
          if (world.getComponent(eid, Name) && world.getComponent(eid, Health)) {
            battleEntities.push(eid);
          }
        });
      }
      try {
        renderer.draw(game.map, game.player, renderEntities, world);
      } catch (e) {
        console.error("[Render Error]", e);
      }
      const pInv = world.getComponent(player.id, Inventory);
      const pStats = world.getComponent(player.id, Stats);
      const pSkills = world.getComponent(player.id, Skills);
      const pVoc = world.getComponent(player.id, Vocation);
      const pXp = world.getComponent(player.id, Experience);
      if (pInv && game.ui) {
        game.ui.updateEquipment(pInv);
      }
      if (pXp && pSkills && pVoc && game.ui) {
        game.ui.updateSkills(pXp, pSkills, pVoc);
      }
      if (game.ui) {
        game.ui.renderWindows(renderer.ctx, input.mouse.x, input.mouse.y);
        game.ui.renderDragging(renderer.ctx, input.mouse.x, input.mouse.y);
      }
      ui.update(game.player, battleEntities, world, currentMouseX, currentMouseY);
      ui.updateBattleList(battleEntities, world, game.player);
      ui.renderMinimap(game.map, game.player);
      damageTextManager.update(dt);
      input.update();
      requestAnimationFrame(loop);
    }
    if (ui && world) {
      ui.setWorld(world);
    }
    document.addEventListener("shopBuy", (e) => {
      const { item, price } = e.detail;
      console.log(`[Main] Shop Buy Event: ${item.name} (${price} GP)`);
      const pEnt = world.query([PlayerControllable2, Inventory])[0];
      if (pEnt !== void 0) {
        const inv = world.getComponent(pEnt, Inventory);
        if (inv.gold >= price) {
          inv.gold -= price;
          const newItem = {
            item,
            count: 1,
            id: Math.floor(Math.random() * 1e6)
          };
          inv.addItem(newItem);
          ui.log(`Bought ${item.name}.`, "#afa");
          ui.updateEquipment(inv);
          const goldVal = document.getElementById("gold-val");
          if (goldVal) goldVal.innerText = `${inv.gold} GP`;
        } else {
          ui.log("Not enough Gold.", "#f55");
        }
      }
    });
    document.addEventListener("shopSell", (e) => {
      const { item, index } = e.detail;
      const sellPrice = Math.floor((item.value || 10) * 0.5);
      console.log(`[Main] Shop Sell Event: ${item.name} for ${sellPrice} GP`);
      const pEnt = world.query([PlayerControllable2, Inventory])[0];
      if (pEnt !== void 0) {
        const inv = world.getComponent(pEnt, Inventory);
        if (inv.removeItemAt && typeof index === "number") {
          inv.removeItemAt(index);
        } else if (inv.bag && inv.bag[index]) {
          inv.bag.splice(index, 1);
        }
        inv.gold += sellPrice;
        ui.log(`Sold ${item.name} for ${sellPrice} GP.`, "#ffa");
        ui.updateEquipment(inv);
        const goldVal = document.getElementById("gold-val");
        if (goldVal) goldVal.innerText = `${inv.gold} GP`;
      }
    });
    document.addEventListener("playerAction", (e) => {
      const { action, item, from, to, index, slot, fromBag } = e.detail;
      console.log(`[Main] Player Action: ${action}`, e.detail);
      const pEnt = world.query([PlayerControllable2, Inventory])[0];
      if (pEnt === void 0) return;
      const inv = world.getComponent(pEnt, Inventory);
      const hp = world.getComponent(pEnt, Health);
      const mana = world.getComponent(pEnt, Mana);
      if (action === "consume") {
        let consumed = false;
        let msg = "";
        if (item.name === "Health Potion") {
          if (hp) {
            hp.current = Math.min(hp.current + 50, hp.max);
            msg = "You feel better.";
            consumed = true;
            const float = world.createEntity();
            world.addComponent(float, new Position(0, 0));
            const pos = world.getComponent(pEnt, Position);
            if (pos) {
              world.addComponent(float, new Position(pos.x, pos.y - 32));
              world.addComponent(float, new FloatingText("+50", "#ff0000", 1));
            }
          }
        } else if (item.name === "Mana Potion") {
          if (mana) {
            mana.current = Math.min(mana.current + 50, mana.max);
            msg = "You feel re-energized.";
            consumed = true;
          }
        } else if (item.type === "food") {
          if (hp) {
            hp.current = Math.min(hp.current + 10, hp.max);
            msg = "Munch munch.";
            consumed = true;
          }
        }
        if (consumed) {
          if (ui.console) ui.console.addSystemMessage(msg);
          if (fromBag) {
            const bag = inv.getEquipped("backpack");
            if (bag && bag.contents) {
              const slotItem = bag.contents[index];
              if (slotItem.count > 1) slotItem.count--;
              else bag.contents.splice(index, 1);
            }
          } else if (slot) {
            inv.unequip(slot);
          }
          ui.updateEquipment(inv);
        }
      } else if (action === "moveItem") {
        if (from.type === "slot" && to.type === "container") {
          const itemInst = inv.getEquipped(from.slot);
          if (itemInst) {
            inv.unequip(from.slot);
            const bag = inv.getEquipped("backpack");
            if (bag && bag.contents) {
              bag.contents.push(itemInst);
            }
          }
        } else if (from.type === "container" && to.type === "slot") {
          const bag = inv.getEquipped("backpack");
          if (bag && bag.contents && bag.contents[from.index]) {
            const itemInst = bag.contents[from.index];
            bag.contents.splice(from.index, 1);
            const existing = inv.getEquipped(to.slot);
            if (existing) {
              bag.contents.push(existing);
            }
            inv.equip(to.slot, itemInst);
          }
        } else if (from.type === "slot" && to.type === "slot") {
          const itemInst = inv.getEquipped(from.slot);
          if (itemInst) {
            inv.unequip(from.slot);
            inv.equip(to.slot, itemInst);
          }
        }
        ui.updateEquipment(inv);
      }
    });
    setInterval(() => {
      saveGame(world);
      ui.log("Game Saved.", "#888");
      const pEnt = world.query([PlayerControllable2, Experience, Health, Mana, Position, Inventory, Skills])[0];
      if (pEnt !== void 0) {
        const xp = world.getComponent(pEnt, Experience);
        const hp = world.getComponent(pEnt, Health);
        const mana = world.getComponent(pEnt, Mana);
        const inv = world.getComponent(pEnt, Inventory);
        const skills = world.getComponent(pEnt, Skills);
      }
    }, 6e4);
    window.addEventListener("beforeunload", () => {
      saveGame(world);
    });
    if (loadGame(world)) {
      ui.log("Welcome back! Game loaded.", "#afa");
      const pEnt = world.query([PlayerControllable2, Inventory, Skills])[0];
      if (pEnt !== void 0) {
        const inv = world.getComponent(pEnt, Inventory);
        const skills = world.getComponent(pEnt, Skills);
        const xp = world.getComponent(pEnt, Experience);
        const hp = world.getComponent(pEnt, Health);
        const mana = world.getComponent(pEnt, Mana);
        if (inv) ui.updateEquipment(inv);
        if (xp && hp && skills) {
          ui.updateStatus(
            hp.current,
            hp.max,
            mana ? mana.current : 0,
            mana ? mana.max : 0,
            inv ? inv.cap : 400,
            inv ? inv.gold : 0,
            xp.level,
            xp.current,
            xp.next,
            skills
          );
        }
      }
    } else {
      ui.log("Welcome to Retro RPG!", "#fff");
    }
    console.log("[Main] Engine Running. Starting Loop...");
    try {
      loop();
    } catch (e) {
      console.error("[Fatal] Loop Crash:", e);
    }
  }
  start().catch((e) => {
    console.error("[FATAL START ERROR]", e);
  });
  var DEBUG_SHEET = "world_tiles";
  window.addEventListener("keydown", (e) => {
    if (!e.shiftKey) return;
    const config = assetManager.getSheetConfig(DEBUG_SHEET);
    if (!config) return;
    const step = 1;
    if (e.key === "ArrowUp") config.offsetY -= step;
    if (e.key === "ArrowDown") config.offsetY += step;
    if (e.key === "ArrowLeft") config.offsetX -= step;
    if (e.key === "ArrowRight") config.offsetX += step;
    if (e.key === "w" || e.key === "W") {
      if (config.stride) config.stride += 1;
    }
    if (e.key === "s" || e.key === "S") {
      if (config.stride) config.stride -= 1;
    }
    assetManager.rebuildCache();
  });
})();
