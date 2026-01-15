"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

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
      304
    ]),
    isSolid(id) {
      return this.SOLIDS.has(id);
    }
  };

  // src/game.ts
  var import_types2 = __require("./core/types");
  var import_items = __require("./data/items");

  // src/components/npc.ts
  var NPC2 = class {
    constructor(type, dialog) {
      this.type = type;
      this.dialog = dialog;
    }
  };

  // src/ai/states.ts
  function getStateName(state) {
    switch (state) {
      case 0 /* IDLE */:
        return "IDLE";
      case 1 /* CHASE */:
        return "CHASE";
      case 2 /* ATTACK */:
        return "ATTACK";
      case 3 /* FLEE */:
        return "FLEE";
      default:
        return "UNKNOWN";
    }
  }

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
  var Tile = class {
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
      this.tiles = Array(width * height).fill(null).map(() => new Tile());
    }
    tiles;
  };
  var PlayerControllable = class {
    facingX = 0;
    facingY = 1;
    footstepTimer = 0;
  };
  var RemotePlayer = class {
    constructor(id, x = 0, y = 0) {
      this.id = id;
      this.targetX = x;
      this.targetY = y;
    }
    targetX;
    targetY;
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
  var RARITY_COLORS = {
    common: "#ffffff",
    uncommon: "#00ff00",
    rare: "#0088ff",
    epic: "#aa00ff",
    legendary: "#ff8800"
  };
  var RARITY_MULTIPLIERS = {
    common: 1,
    uncommon: 1.15,
    rare: 1.3,
    epic: 1.5,
    legendary: 2
  };
  var Item = class {
    constructor(name, slotType, uIndex = 0, frame = 0, direction = 0, damage = 0, price = 10, description = "", weaponType = "none", rarity = "common", defense = 0, bonusHp = 0, bonusMana = 0, isContainer = false, containerSize = 0, glowColor = void 0, glowRadius = 0) {
      this.name = name;
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
  var Container = class {
    constructor(size = 20) {
      this.size = size;
      this.items = new Array(size).fill(null);
    }
    // Represents a grid of items
    // Fixed size (e.g. 20 for backpack)
    items;
    addItem(newItem) {
      for (let i = 0; i < this.items.length; i++) {
        const slot = this.items[i];
        if (slot && slot.item.name === newItem.item.name && slot.count < 100) {
          slot.count += newItem.count;
          return true;
        }
      }
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i] === null) {
          this.items[i] = newItem;
          return true;
        }
      }
      return false;
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
    findItemByName(name) {
      for (const [slot, inst] of this.equipment) {
        if (inst.item.name === name) return { instance: inst, container: "equipment", slot };
      }
      const bag = this.equipment.get("backpack");
      if (bag && bag.contents) {
        const found = bag.contents.find((i) => i && i.item.name === name);
        if (found) return { instance: found, container: "backpack", parent: bag };
      }
      return null;
    }
    // Check if player has item
    hasItem(name) {
      return !!this.findItemByName(name);
    }
    // Remove item (Decrements count or removes)
    removeItem(name, count = 1) {
      const result = this.findItemByName(name);
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
  var ScreenShake = class {
    constructor(duration, intensity) {
      this.duration = duration;
      this.intensity = intensity;
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
  var MainQuest = class {
    fire = false;
    ice = false;
    water = false;
    earth = false;
  };
  var QuestGiver = class {
    constructor(availableQuests, name = "Quest Giver") {
      this.availableQuests = availableQuests;
      this.name = name;
    }
  };
  var Facing = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  var Projectile = class {
    constructor(damage, life, ownerType, vx = 0, vy = 0, speed = 200, targetX = 0, targetY = 0) {
      this.damage = damage;
      this.life = life;
      this.ownerType = ownerType;
      this.vx = vx;
      this.vy = vy;
      this.speed = speed;
      this.targetX = targetX;
      this.targetY = targetY;
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
    constructor(name, hpGain, manaGain, capGain) {
      this.name = name;
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
  var NetworkItem = class {
    constructor(id) {
      this.id = id;
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
  var Consumable = class {
    constructor(type, amount, text) {
      this.type = type;
      this.amount = amount;
      this.text = text;
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
  var Temple = class {
    constructor(name = "Temple") {
      this.name = name;
    }
  };
  var MobResistance = class {
    constructor(physicalImmune = false, magicImmune = false, fireResist = 0, iceResist = 0, poisonImmune = false) {
      this.physicalImmune = physicalImmune;
      this.magicImmune = magicImmune;
      this.fireResist = fireResist;
      this.iceResist = iceResist;
      this.poisonImmune = poisonImmune;
    }
  };
  var SplitOnDeath = class {
    constructor(splitCount = 2, splitType = "slime", minHealth = 10) {
      this.splitCount = splitCount;
      this.splitType = splitType;
      this.minHealth = minHealth;
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
  var BleedEffect = class {
    constructor(stacks = 1, duration = 5, damagePerTick = 3) {
      this.stacks = stacks;
      this.duration = duration;
      this.damagePerTick = damagePerTick;
    }
  };
  var PoisonEffect = class {
    constructor(duration = 8, damagePerTick = 2) {
      this.duration = duration;
      this.damagePerTick = damagePerTick;
    }
  };
  var FreezeEffect = class {
    constructor(duration = 3, slowPercent = 50) {
      this.duration = duration;
      this.slowPercent = slowPercent;
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
  var Locked = class {
    constructor(keyIds, message = "Locked") {
      this.keyIds = keyIds;
      this.message = message;
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

  // src/assets.ts
  var import_sprites_map = __require("./data/sprites_map");

  // src/constants.ts
  var SPRITES;
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

  // src/assets.ts
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
      Object.values(import_sprites_map.SPRITE_MAP).forEach((def) => uniqueFiles.add(def.file));
      const sheetMap = /* @__PURE__ */ new Map();
      await Promise.all(Array.from(uniqueFiles).map(async (file) => {
        try {
          const cvs = await this.loadExternalImage(file);
          sheetMap.set(file, cvs);
        } catch (e) {
          console.warn(`[AssetManager] Failed to load sheet: ${file}`);
        }
      }));
      Object.entries(import_sprites_map.SPRITE_MAP).forEach(([key, def]) => {
        const id = parseInt(key);
        const sheet = sheetMap.get(def.file);
        if (sheet) {
          const cvs = this.createCanvas(def.width, def.height);
          const ctx = cvs.getContext("2d");
          ctx.drawImage(sheet, def.x, def.y, def.width, def.height, 0, 0, def.width, def.height);
          this.images[id] = cvs;
        }
      });
      console.log(`[AssetManager] Loaded ${Object.keys(import_sprites_map.SPRITE_MAP).length} external sprites.`);
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
      this.images[100] = this.images[199];
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
        const { SPRITE_MAP: SPRITE_MAP2, SPRITE_SHEET_BASE_PATH } = await import("./data/sprites_map");
        const sheetGroups = {};
        for (const [idStr, def] of Object.entries(SPRITE_MAP2)) {
          if (!sheetGroups[def.file]) sheetGroups[def.file] = [];
          sheetGroups[def.file].push(Number(idStr));
        }
        for (const [file, ids] of Object.entries(sheetGroups)) {
          const url = SPRITE_SHEET_BASE_PATH + file;
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
  };
  var assetManager = new AssetManager();
  var spriteSheet = document.createElement("canvas");
  var spriteCanvas = document.createElement("canvas");
  var SHEET_TILE_SIZE = 32;
  var SHEET_COLS = 16;
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
  var import_types = __require("./core/types");
  function generateOverworld(width, height, seed) {
    const rng = new RNG(seed);
    const tiles = Array(width * height).fill(null).map(() => new import_types.Tile());
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
    const tiles = Array(width * height).fill(null).map(() => new import_types.Tile());
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
      const map = new Int8Array(width * height);
      for (let i = 0; i < width * height; i++) map[i] = rng.next() < 0.45 ? 1 : 0;
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
                else if (map[ny * width + nx] === 1) walls++;
              }
            }
            const idx = y * width + x;
            if (map[idx] === 1) newMap[idx] = walls >= 4 ? 1 : 0;
            else newMap[idx] = walls >= 5 ? 1 : 0;
          }
        }
        for (let i = 0; i < width * height; i++) map[i] = newMap[i];
      }
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          tiles[idx].add(FLOOR);
          if (map[idx] === 1 || x === 0 || x === width - 1 || y === 0 || y === height - 1) {
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

  // src/game.ts
  var import_spells = __require("./data/spells");
  var import_mobs = __require("./data/mobs");
  var import_loot_tables = __require("./data/loot_tables");
  var import_bulk_constants = __require("./data/bulk_constants");
  var DEBUG_COLLIDERS = true;
  var DEBUG_AI_STATES = true;
  var TEMPLE_POS = { x: 25 * 32, y: 25 * 32 };
  var Dialogue = class {
    constructor(lines = [], currentLine = 0, name = "Unknown") {
      this.lines = lines;
      this.currentLine = currentLine;
      this.name = name;
    }
  };
  var lastAttackTime = 0;
  function attemptCastSpell(world, player, text, ui) {
    const spell = (0, import_spells.findSpellByWords)(text);
    if (!spell) return false;
    const mana = world.getComponent(player, Mana);
    if (!mana || mana.current < spell.mana) {
      if (ui.console) ui.console.addSystemMessage("Not enough mana.");
      return true;
    }
    mana.current -= spell.mana;
    const pPos = world.getComponent(player, Position);
    switch (spell.effect) {
      case "heal":
        const hp = world.getComponent(player, Health);
        if (hp) {
          hp.current = Math.min(hp.max, hp.current + spell.power);
          spawnFloatingText(world, pPos.x, pPos.y, `+${spell.power}`, "#5f5");
          spawnParticle(world, pPos.x, pPos.y, "#5f5");
        }
        break;
      case "haste":
        const passive = world.getComponent(player, Passives);
        if (passive) {
          world.addComponent(player, new StatusEffect("haste", 10, spell.power));
          spawnFloatingText(world, pPos.x, pPos.y, "Haste!", "#ff5");
        }
        break;
      case "damage_aoe":
        const enemies = world.query([Health, Position, Name]);
        let hitCount = 0;
        for (const eid of enemies) {
          if (world.getComponent(eid, PlayerControllable)) continue;
          const ePos = world.getComponent(eid, Position);
          const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
          if (dist < 50) {
            const eHp = world.getComponent(eid, Health);
            eHp.current -= spell.power;
            spawnFloatingText(world, ePos.x, ePos.y, `${spell.power}`, "#f55");
            spawnBloodEffect(world, ePos.x, ePos.y);
            hitCount++;
            if (eHp.current <= 0) {
            }
          }
        }
        if (hitCount === 0) {
          if (ui.console) ui.console.addSystemMessage("No target for Exori.");
        }
        spawnParticle(world, pPos.x, pPos.y, "#f33");
        break;
      case "create_food":
        createItem(world, pPos.x, pPos.y, createItemFromRegistry(SPRITES.BARREL));
        break;
    }
    if (ui.console) ui.console.addSystemMessage(`Cast ${spell.name}.`);
    return true;
  }
  function teleportSystem(world, ui) {
    const player = world.query([PlayerControllable, Position])[0];
    if (player === void 0) return;
    const pPos = world.getComponent(player, Position);
    const teleporters = world.query([Teleporter, Position]);
    for (const tid of teleporters) {
      const tPos = world.getComponent(tid, Position);
      const dest = world.getComponent(tid, Teleporter);
      const pad = 10;
      if (pPos.x + pad < tPos.x + 32 && pPos.x + 32 - pad > tPos.x && pPos.y + pad < tPos.y + 32 && pPos.y + 32 - pad > tPos.y) {
        console.log(`[Game] Teleporting logic triggered to ${dest.targetX}, ${dest.targetY}`);
        pPos.x = dest.targetX * import_types2.TILE_SIZE;
        pPos.y = dest.targetY * import_types2.TILE_SIZE;
        if (ui.console) ui.console.addSystemMessage("Teleported.");
        return;
      }
    }
  }
  function autoAttackSystem(world, dt, ui) {
    const player = world.query([PlayerControllable, Target, Position])[0];
    if (player === void 0) return;
    const targetComp = world.getComponent(player, Target);
    const pPos = world.getComponent(player, Position);
    const pStats = world.getComponent(player, Skills);
    const pPassives = world.getComponent(player, Passives);
    const pInv = world.getComponent(player, Inventory);
    const targetId = targetComp.targetId;
    const tHp = world.getComponent(targetId, Health);
    const tPos = world.getComponent(targetId, Position);
    if (!tHp || !tPos || tHp.current <= 0) {
      world.removeComponent(player, Target);
      if (ui.console) ui.console.addSystemMessage("Target lost.");
      return;
    }
    const range = 50;
    const dist = Math.sqrt(Math.pow(tPos.x - pPos.x, 2) + Math.pow(tPos.y - pPos.y, 2));
    if (dist <= range) {
      const now = Date.now();
      if (now - lastAttackTime >= 2e3) {
        lastAttackTime = now;
        let weaponDmg = 0;
        if (pInv) {
          const rhand = pInv.getEquipped("rhand");
          if (rhand && rhand.item.damage > 0) weaponDmg = rhand.item.damage;
          else {
            const lhand = pInv.getEquipped("lhand");
            if (lhand && lhand.item.damage > 0) weaponDmg = lhand.item.damage;
          }
        }
        let skillVal = 10;
        if (pStats) {
          skillVal = pStats.sword.level;
          pStats.sword.xp += 1;
          const reqXp = Math.floor(10 * Math.pow(1.1, pStats.sword.level));
          if (pStats.sword.xp >= reqXp) {
            pStats.sword.level++;
            pStats.sword.xp = 0;
            spawnFloatingText(world, pPos.x, pPos.y, "Skill Up!", "#ff0");
            if (ui.console) ui.console.addSystemMessage(`You advanced to Sword Fighting level ${pStats.sword.level}.`);
          }
        }
        let might = 0;
        if (pPassives) might = pPassives.might * 2;
        const maxDmg = Math.floor(weaponDmg * 0.6 + skillVal * 1.5 + might);
        const minDmg = Math.floor(maxDmg * 0.2);
        const damage = Math.floor(minDmg + Math.random() * (maxDmg - minDmg));
        tHp.current -= damage;
        if (tHp.current < 0) tHp.current = 0;
        spawnBloodEffect(world, tPos.x, tPos.y);
        spawnFloatingText(world, tPos.x, tPos.y, damage.toString(), "#a33");
        if (damage > 0) {
        }
        if (tHp.current <= 0) {
          world.removeComponent(player, Target);
          const pXp = world.getComponent(player, Experience);
          if (pXp) {
            const gain = 50;
            pXp.current += gain;
            if (ui.console) ui.console.addSystemMessage(`You dealt ${damage} damage. Target died.`);
          }
          const loot = [];
          if (Math.random() < 0.5) {
            loot.push(createItemFromRegistry(SPRITES.GOLD));
          }
          if (Math.random() < 0.2) {
            loot.push(createItemFromRegistry(SPRITES.SWORD));
          }
          if (Math.random() < 0.2) {
            loot.push(createItemFromRegistry(SPRITES.POTION));
          }
          if (loot.length > 0) {
            createCorpse(world, tPos.x, tPos.y, loot);
          } else {
            createCorpse(world, tPos.x, tPos.y, []);
          }
        } else {
        }
      }
    }
  }
  function inputSystem(world, input) {
    const entities = world.query([PlayerControllable, Velocity]);
    for (const id of entities) {
      let speed = 100;
      const passives = world.getComponent(id, Passives);
      if (passives) speed += passives.agility * 5;
      const vel = world.getComponent(id, Velocity);
      const pc = world.getComponent(id, PlayerControllable);
      const sprite = world.getComponent(id, Sprite);
      const pos = world.getComponent(id, Position);
      vel.x = 0;
      vel.y = 0;
      let dir = input.getDirection();
      let isMoving = dir.x !== 0 || dir.y !== 0;
      if (!isMoving) {
        const targetComp = world.getComponent(id, Target);
        if (targetComp) {
          const tPos = world.getComponent(targetComp.targetId, Position);
          const tHp = world.getComponent(targetComp.targetId, Health);
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
            world.removeComponent(id, Target);
          }
        }
      }
      if (isMoving) {
        if (input.getDirection().x !== 0 || input.getDirection().y !== 0) {
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
      if (input.isDown("KeyU")) {
        pos.x = 4096;
        pos.y = 4096;
      }
      if (input.isDown("KeyH") && input.isJustPressed("KeyH")) {
        pos.x = 4096;
        pos.y = 4096;
        spawnFloatingText(world, 4096, 4096, "\u2193\u2193 VILLAGE \u2193\u2193", "#ff00ff");
      }
    }
  }
  function createNPC(world, x, y, text = "Hello!", name = "Villager", spriteIndex = SPRITES.NPC) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(spriteIndex));
    world.addComponent(e, new Facing(0, 1));
    world.addComponent(e, new Interactable("Press E to talk"));
    world.addComponent(e, new Name(name));
    let lines = ["Hello there.", "Nice weather today."];
    if (name === "Old Man") {
      lines = [
        "Greetings, traveler.",
        "The temple ahead is dangerous.",
        "Take this sword, it's dangerous alone!"
      ];
    } else if (name === "Merchant") {
      lines = ["I have wares, if you have coin."];
    }
    world.addComponent(e, new Dialogue(lines, 0, name));
  }
  function interactionSystem(world, input, ui) {
    if (input.isJustPressed("e")) {
      const player = world.query([PlayerControllable, Position])[0];
      if (player === void 0) return;
      const pPos = world.getComponent(player, Position);
      const npcs = world.query([NPC, Position]);
      for (const eid of npcs) {
        const dPos = world.getComponent(eid, Position);
        const dist = Math.sqrt(Math.pow(dPos.x - pPos.x, 2) + Math.pow(dPos.y - pPos.y, 2));
        if (dist < 48) {
          const npc = world.getComponent(eid, NPC);
          const name = world.getComponent(eid, Name);
          const npcName = name ? name.value : "Villager";
          const qGiver = world.getComponent(eid, QuestGiver);
          const merchant = world.getComponent(eid, Merchant);
          if (merchant) {
            const pInv = world.getComponent(player, Inventory);
            if (pInv) {
              ui.renderShop(merchant, pInv);
              ui.showDialogue(npc.dialog[0], npcName);
            }
          } else if (qGiver) {
            let qLog = world.getComponent(player, QuestLog);
            if (!qLog) {
              qLog = new QuestLog();
              world.addComponent(player, qLog);
            }
            if (qGiver.availableQuests.length > 0) {
              const questTemplate = qGiver.availableQuests[0];
              const existing = qLog.quests.find((q) => q.id === questTemplate.id);
              if (!existing) {
                const newQuest = { ...questTemplate, current: 0, completed: false, turnedIn: false };
                qLog.quests.push(newQuest);
                ui.showDialogue(`[Quest] ${newQuest.name}: ${newQuest.description}`, npcName);
                if (ui.console) ui.console.addSystemMessage(`Quest Accepted: ${newQuest.name}`);
              } else if (existing.completed && !existing.turnedIn) {
                existing.turnedIn = true;
                qLog.completedQuestIds.push(existing.id);
                const inv = world.getComponent(player, Inventory);
                if (inv) inv.gold += existing.reward.gold;
                ui.showDialogue("Thank you! Here is your reward.", npcName);
              } else {
                ui.showDialogue(`Quest Progress: ${existing.current}/${existing.required}`, npcName);
              }
            } else {
              ui.showDialogue(npc.dialog[0], npcName);
            }
          } else {
            ui.showDialogue(npc.dialog[0], npcName);
          }
          return;
        }
      }
      const talkers = world.query([Dialogue, Position]);
      for (const eid of talkers) {
        const dPos = world.getComponent(eid, Position);
        const dist = Math.sqrt(Math.pow(dPos.x - pPos.x, 2) + Math.pow(dPos.y - pPos.y, 2));
        if (dist < 48) {
          const dialogue = world.getComponent(eid, Dialogue);
          const uiEl = document.getElementById("dialogue-ui");
          const nameEl = document.getElementById("dialogue-name");
          const textEl = document.getElementById("dialogue-text");
          if (uiEl && nameEl && textEl) {
            if (uiEl.style.display === "none") {
              uiEl.style.display = "block";
              dialogue.currentLine = 0;
              nameEl.innerText = dialogue.name;
              textEl.innerText = dialogue.lines[dialogue.currentLine];
            } else {
              dialogue.currentLine++;
              if (dialogue.currentLine >= dialogue.lines.length) {
                uiEl.style.display = "none";
                dialogue.currentLine = 0;
              } else {
                textEl.innerText = dialogue.lines[dialogue.currentLine];
              }
            }
          }
          return;
        }
      }
    }
    if (input.isJustPressed("MouseLeft")) {
      const mx = input.mouse.x;
      const my = input.mouse.y;
      let camX = 0, camY = 0;
      const cam = world.query([Camera])[0];
      if (cam !== void 0) {
        const cPos = world.getComponent(cam, Camera);
        camX = Math.floor(cPos.x);
        camY = Math.floor(cPos.y);
      }
      const worldX = mx + camX;
      const worldY = my + camY;
      const interactables2 = world.query([Interactable, Position]);
      let clickedInteractable = false;
      for (const id of interactables2) {
        const pos2 = world.getComponent(id, Position);
        if (worldX >= pos2.x && worldX <= pos2.x + 32 && worldY >= pos2.y && worldY <= pos2.y + 32) {
          const player = world.query([PlayerControllable, Position])[0];
          if (player) {
            const pPos = world.getComponent(player, Position);
            const dx = pPos.x + 16 - (pos2.x + 16);
            const dy = pPos.y + 16 - (pos2.y + 16);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 80) {
              const lootable = world.getComponent(id, Lootable);
              const merchant = world.getComponent(id, Merchant);
              const questGiver = world.getComponent(id, QuestGiver);
              if (lootable) {
                const playerInv = world.getComponent(player, Inventory);
                ui.openLoot(lootable, id, playerInv);
                clickedInteractable = true;
              } else if (merchant) {
                const playerInv = world.getComponent(player, Inventory);
                ui.currentMerchant = merchant;
                ui.activeMerchantId = id;
                const mName = world.getComponent(id, Name)?.value || "Merchant";
                ui.toggleShop(merchant, mName);
                clickedInteractable = true;
              } else if (questGiver) {
                const playerQLog = world.getComponent(player, QuestLog);
                const playerInv = world.getComponent(player, Inventory);
                const playerXp = world.getComponent(player, Experience);
                if (playerQLog) {
                  for (const quest of playerQLog.quests) {
                    if (quest.completed && !quest.turnedIn) {
                      const giverQuest = questGiver.availableQuests.find((q) => q.id === quest.id);
                      if (giverQuest) {
                        quest.turnedIn = true;
                        playerQLog.completedQuestIds.push(quest.id);
                        playerQLog.quests = playerQLog.quests.filter((q) => q.id !== quest.id);
                        if (playerInv) playerInv.gold += quest.reward.gold;
                        if (playerXp) {
                          playerXp.current += quest.reward.xp;
                          if (playerXp.current >= playerXp.next) {
                            playerXp.level++;
                            playerXp.current -= playerXp.next;
                            playerXp.next = Math.floor(playerXp.next * 1.5);
                          }
                        }
                        if (ui.console) {
                          ui.console.addSystemMessage(`Quest Complete: "${quest.name}"!`);
                          ui.console.addSystemMessage(`Reward: ${quest.reward.gold} gold, ${quest.reward.xp} XP`);
                        }
                        clickedInteractable = true;
                        break;
                      }
                    }
                  }
                  if (!clickedInteractable) {
                    for (const quest of questGiver.availableQuests) {
                      const hasQuest = playerQLog.quests.some((q) => q.id === quest.id);
                      const completedQuest = playerQLog.completedQuestIds.includes(quest.id);
                      if (!hasQuest && !completedQuest) {
                        const newQuest = { ...quest, current: 0, completed: false, turnedIn: false };
                        playerQLog.quests.push(newQuest);
                        if (ui.console) {
                          ui.console.addSystemMessage(`New Quest: "${quest.name}"`);
                          ui.console.addSystemMessage(quest.description);
                        }
                        clickedInteractable = true;
                        break;
                      }
                    }
                  }
                  if (!clickedInteractable) {
                    const npcNameComp = world.getComponent(id, Name);
                    const npcName = npcNameComp ? npcNameComp.value : "NPC";
                    if (ui.console) ui.console.addSystemMessage(`${npcName}: "Check back later."`);
                    clickedInteractable = true;
                  }
                }
              }
            } else {
              if (ui.console) ui.console.addSystemMessage("Too far away.");
              clickedInteractable = true;
            }
          }
          if (clickedInteractable) break;
        }
      }
      if (clickedInteractable) return;
      const enemies = world.query([Health, Position, Name]);
      let clickedTarget = false;
      for (const eId of enemies) {
        if (world.getComponent(eId, PlayerControllable)) continue;
        const pos2 = world.getComponent(eId, Position);
        if (worldX >= pos2.x && worldX <= pos2.x + 32 && worldY >= pos2.y && worldY <= pos2.y + 32) {
          const player = world.query([PlayerControllable])[0];
          if (player !== void 0) {
            const currentTarget = world.getComponent(player, Target);
            if (!currentTarget || currentTarget.targetId !== eId) {
              if (currentTarget) world.removeComponent(player, Target);
              world.addComponent(player, new Target(eId));
              if (ui.console) ui.console.addSystemMessage("Target Locked.");
            }
            clickedTarget = true;
          }
          break;
        }
      }
      if (!clickedTarget) {
        const player = world.query([PlayerControllable])[0];
        if (player !== void 0) {
          if (world.getComponent(player, Target)) {
            world.removeComponent(player, Target);
            if (ui.console) ui.console.addSystemMessage("Target Lost.");
          }
        }
      }
    }
    if (!input.isJustPressed("Space")) return;
    if (ui.isShowing()) {
      ui.hideDialogue();
      return;
    }
    const playerEntity = world.query([PlayerControllable, Position])[0];
    if (playerEntity === void 0) return;
    const pos = world.getComponent(playerEntity, Position);
    const interactRadius = 60;
    const interactables = world.query([Interactable, Position]);
    let closestId = -1;
    let minDist = interactRadius;
    for (const id of interactables) {
      const iPos = world.getComponent(id, Position);
      const dx = pos.x + 16 - (iPos.x + 16);
      const dy = pos.y + 16 - (iPos.y + 16);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closestId = id;
      }
    }
    if (closestId !== -1) {
      const interact = world.getComponent(closestId, Interactable);
      const qGiver = world.getComponent(closestId, QuestGiver);
      const merchant = world.getComponent(closestId, Merchant);
      const lootable = world.getComponent(closestId, Lootable);
      if (lootable) {
        const playerInv = world.getComponent(playerEntity, Inventory);
        ui.openLoot(lootable, closestId, playerInv);
        return;
      }
      if (merchant) {
        const playerInv = world.getComponent(playerEntity, Inventory);
        ui.currentMerchant = merchant;
        ui.activeMerchantId = closestId;
        ui.renderShop(merchant, playerInv);
        ui.shopPanel.classList.remove("hidden");
        return;
      }
      if (qGiver) {
        let qLog = world.getComponent(playerEntity, QuestLog);
        if (!qLog) {
          qLog = new QuestLog();
          world.addComponent(playerEntity, qLog);
        }
        if (qGiver.availableQuests.length > 0) {
          const questTemplate = qGiver.availableQuests[0];
          const existing = qLog.quests.find((q) => q.id === questTemplate.id);
          if (!existing) {
            const newQuest = { ...questTemplate, current: 0, completed: false, turnedIn: false };
            qLog.quests.push(newQuest);
            ui.showDialogue("Objective: " + newQuest.name);
          } else if (existing.completed && !existing.turnedIn) {
            existing.turnedIn = true;
            qLog.completedQuestIds.push(existing.id);
            ui.showDialogue("Thank you!");
            const inv = world.getComponent(playerEntity, Inventory);
            if (inv) inv.gold += existing.reward.gold;
          } else {
            ui.showDialogue("Progress: " + existing.current + "/" + existing.required);
          }
        }
      }
    }
  }
  function magicSystem(world, input, ui) {
    const playerEntity = world.query([PlayerControllable, ActiveSpell])[0];
    if (!playerEntity) return;
    const activeSpell = world.getComponent(playerEntity, ActiveSpell);
    let changed = false;
    if (input.isJustPressed("Digit1")) {
      activeSpell.spellName = "adori flam";
      changed = true;
    }
    if (input.isJustPressed("Digit2")) {
      activeSpell.spellName = "exori";
      changed = true;
    }
    if (input.isJustPressed("Digit3")) {
      activeSpell.spellName = "exura";
      changed = true;
    }
    if (input.isJustPressed("Digit4")) {
      activeSpell.spellName = "adori frigo";
      changed = true;
    }
    if (changed) {
      ui.updateMagicHud(activeSpell.spellName);
    }
    if (!ui.isShowing() && input.isJustPressed("KeyR")) {
      castSpell(world, ui, activeSpell.spellName);
    }
    if (input.isJustPressed("KeyK")) {
      const spells = world.getComponent(playerEntity, SpellBook);
      const points = world.getComponent(playerEntity, SkillPoints);
      const passives = world.getComponent(playerEntity, Passives);
      const vocation = world.getComponent(playerEntity, Vocation);
      const vocName = vocation ? vocation.name.toLowerCase() : "knight";
      if (spells && points) {
        ui.toggleSkillTree(spells, points, vocName, passives, () => {
          updateStatsFromPassives(world, playerEntity);
        });
      }
    }
    if (!ui.isShowing() && input.isJustPressed("KeyF")) {
      castSpell(world, ui, "exori");
    }
  }
  function floatingTextSystem(world, dt) {
    const entities = world.query([FloatingText]);
    for (const id of entities) {
      const ft = world.getComponent(id, FloatingText);
      ft.life -= dt;
      if (ft.life <= 0) {
        world.removeEntity(id);
      }
    }
  }
  function particleSystem(world, dt) {
    const entities = world.query([Position, Particle]);
    for (const id of entities) {
      const pos = world.getComponent(id, Position);
      const part = world.getComponent(id, Particle);
      pos.x += part.vx * dt;
      pos.y += part.vy * dt;
      part.life -= dt;
      if (part.life <= 0) {
        world.removeEntity(id);
      }
    }
  }
  function spawnBloodEffect(world, x, y) {
    const count = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const e = world.createEntity();
      world.addComponent(e, new Position(x + 8, y + 8));
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 30;
      const shade = Math.floor(Math.random() * 100);
      const color = `rgb(${180 + shade}, ${20 + Math.floor(shade * 0.3)}, ${10 + Math.floor(shade * 0.2)})`;
      world.addComponent(e, new Particle(0.4 + Math.random() * 0.3, 0.7, color, 2 + Math.floor(Math.random() * 2), vx, vy));
    }
  }
  function spawnMagicEffect(world, x, y, colorScheme = "blue") {
    const count = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const e = world.createEntity();
      world.addComponent(e, new Position(x + Math.random() * 16, y + Math.random() * 16));
      const vx = (Math.random() - 0.5) * 30;
      const vy = -20 - Math.random() * 40;
      let color;
      if (colorScheme === "green") {
        color = `rgb(${50 + Math.floor(Math.random() * 50)}, ${200 + Math.floor(Math.random() * 55)}, ${80 + Math.floor(Math.random() * 50)})`;
      } else if (colorScheme === "yellow") {
        color = `rgb(${220 + Math.floor(Math.random() * 35)}, ${200 + Math.floor(Math.random() * 55)}, ${50 + Math.floor(Math.random() * 50)})`;
      } else {
        color = `rgb(${100 + Math.floor(Math.random() * 80)}, ${150 + Math.floor(Math.random() * 80)}, ${220 + Math.floor(Math.random() * 35)})`;
      }
      world.addComponent(e, new Particle(0.5 + Math.random() * 0.4, 0.9, color, 2, vx, vy));
    }
  }
  function triggerScreenShake(world, intensity = 5, duration = 0.3) {
    const e = world.createEntity();
    world.addComponent(e, new ScreenShake(duration, intensity));
  }
  var shakeOffsetX = 0;
  var shakeOffsetY = 0;
  function screenShakeSystem(world, dt) {
    const entities = world.query([ScreenShake]);
    shakeOffsetX = 0;
    shakeOffsetY = 0;
    for (const id of entities) {
      const shake = world.getComponent(id, ScreenShake);
      shake.duration -= dt;
      if (shake.duration > 0) {
        shakeOffsetX = (Math.random() - 0.5) * shake.intensity;
        shakeOffsetY = (Math.random() - 0.5) * shake.intensity;
      } else {
        world.removeEntity(id);
      }
    }
  }
  function remotePlayerInterpolationSystem(world, dt) {
    const entities = world.query([RemotePlayer, Position]);
    const lerpFactor = 10 * dt;
    for (const id of entities) {
      const rp = world.getComponent(id, RemotePlayer);
      const pos = world.getComponent(id, Position);
      pos.x += (rp.targetX - pos.x) * lerpFactor;
      pos.y += (rp.targetY - pos.y) * lerpFactor;
      const dist = Math.abs(pos.x - rp.targetX) + Math.abs(pos.y - rp.targetY);
      if (dist > 50) {
        pos.x = rp.targetX;
        pos.y = rp.targetY;
      }
      if (Math.abs(rp.targetX - pos.x) > 1) {
      }
    }
  }
  function statusEffectSystem(world, dt) {
    const entities = world.query([StatusEffect, AI]);
    for (const id of entities) {
      const status = world.getComponent(id, StatusEffect);
      const ai = world.getComponent(id, AI);
      status.duration -= dt;
      if (status.type === "frozen") {
        if (ai) {
        }
      }
      if (status.duration <= 0) {
        world.removeComponent(id, StatusEffect);
      }
    }
  }
  function aiSystem(world, dt) {
    const players = world.query([PlayerControllable, Position, Health]);
    if (players.length === 0) return;
    const pPos = world.getComponent(players[0], Position);
    const pHp = world.getComponent(players[0], Health);
    const entities = world.query([AI, Position, Velocity]);
    for (const id of entities) {
      const ai = world.getComponent(id, AI);
      const pos = world.getComponent(id, Position);
      const vel = world.getComponent(id, Velocity);
      const hp = world.getComponent(id, Health);
      const targetComp = world.getComponent(id, Target);
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
          const sprite = world.getComponent(id, Sprite);
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
  function uiInteractionSystem(world, ui, input, player, map, renderer) {
    const TILE_SIZE2 = 32;
    const canvas = renderer.ctx.canvas;
    const camX = Math.floor(player.x * TILE_SIZE2 - canvas.width / 2 + TILE_SIZE2 / 2);
    const camY = Math.floor(player.y * TILE_SIZE2 - canvas.height / 2 + TILE_SIZE2 / 2);
    const worldMouseX = input.mouse.x + camX;
    const worldMouseY = input.mouse.y + camY;
    if (input.isJustPressed("KeyE")) {
      console.log("[Game] Key E pressed. Checking interactables...");
      const pPos = world.getComponent(player.id, Position);
      const interactables = world.query([Position, Interactable, Merchant]);
      console.log(`[Game] Found ${interactables.length} merchants.`);
      let foundMerchant = false;
      for (const eid of interactables) {
        const ePos = world.getComponent(eid, Position);
        const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
        console.log(`[Game] Distance to merchant ${eid}: ${dist}`);
        if (dist < 96) {
          const merchant = world.getComponent(eid, Merchant);
          const name = world.getComponent(eid, Name);
          console.log(`Interacting with Merchant: ${name ? name.value : "Unknown"}`);
          ui.toggleShop(merchant, name ? name.value : "Merchant");
          foundMerchant = true;
          break;
        }
      }
      if (!foundMerchant) {
        const lootables = world.query([Position, Lootable]);
        for (const eid of lootables) {
          const ePos = world.getComponent(eid, Position);
          const dist = Math.sqrt((ePos.x - pPos.x) ** 2 + (ePos.y - pPos.y) ** 2);
          if (dist < 48) {
            const lootComp = world.getComponent(eid, Lootable);
            const nameComp = world.getComponent(eid, Name);
            const entName = nameComp ? nameComp.value : "Remains";
            console.log(`[Game] Opening Loot Container: ${entName}`);
            ui.toggleLoot(eid, entName, lootComp.items);
            foundMerchant = true;
            break;
          }
        }
      }
    }
    if (input.isJustPressed("MouseRight")) {
      const hit = renderer.getObjectAt(map, player, worldMouseX, worldMouseY);
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
          ui.openContainer(runtimeItem);
        } else {
          console.log("Used item (not implemented)");
        }
      }
    }
    if (input.isJustPressed("MouseLeft")) {
      const uiHit = ui.getContainerSlotAt(input.mouse.x, input.mouse.y);
      if (uiHit) {
        const container = ui.openContainers[uiHit.containerIndex].item;
        if (container.inventory && container.inventory[uiHit.slotIndex]) {
          const itemInst = container.inventory[uiHit.slotIndex];
          ui.draggedItem = itemInst.item;
          ui.draggedItem = container.inventory[uiHit.slotIndex];
          ui.draggingFrom = { type: "container", index: uiHit.slotIndex, containerIndex: uiHit.containerIndex };
        }
      } else {
        const hit = renderer.getObjectAt(map, player, worldMouseX, worldMouseY);
        if (hit && hit.item && hit.item.id !== 0) {
          ui.draggedItem = hit.item;
          ui.draggingFrom = { type: "world", index: 0 };
          ui.draggingFrom = { type: "world", index: 0 };
          const tileIdx = hit.y * map.width + hit.x;
          ui.draggingFrom = { type: "world", index: tileIdx };
        }
      }
    }
    if (ui.draggedItem && !input.isDown("MouseLeft")) {
      const dropX = input.mouse.x;
      const dropY = input.mouse.y;
      const uiHit = ui.getContainerSlotAt(dropX, dropY);
      if (uiHit) {
        const targetCont = ui.openContainers[uiHit.containerIndex].item;
        if (!targetCont.inventory) targetCont.inventory = [];
        targetCont.inventory.push(ui.draggedItem);
        removeFromSource(ui, map);
        console.log("Dropped in Container");
      } else {
        const dropWorldX = dropX + camX;
        const dropWorldY = dropY + camY;
        const tx = Math.floor(dropWorldX / TILE_SIZE2);
        const ty = Math.floor(dropWorldY / TILE_SIZE2);
        const tile = map.getTile(tx, ty);
        if (tile) {
          tile.addItem(ui.draggedItem);
          removeFromSource(ui, map);
        }
      }
      ui.draggedItem = null;
      ui.draggingFrom = null;
    }
  }
  function removeFromSource(ui, map) {
    if (!ui.draggingFrom) return;
    if (ui.draggingFrom.type === "container") {
      const cIdx = ui.draggingFrom.containerIndex;
      const sIdx = ui.draggingFrom.index;
      const cont = ui.openContainers[cIdx].item;
      if (cont && cont.inventory) {
        cont.inventory.splice(sIdx, 1);
      }
    } else if (ui.draggingFrom.type === "world") {
      const tIdx = ui.draggingFrom.index;
      const tile = map.tiles[tIdx];
      if (tile) {
        tile.removeItem();
      }
    }
  }
  function createItemFromRegistry(id) {
    const def = import_items.ItemRegistry[id];
    if (def) {
      const spriteId = def.uIndex !== void 0 ? def.uIndex : id;
      return new Item(
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
    return new Item(String(id), "other", id);
  }
  function movementSystem(world, dt, audio, network, ui) {
    const entities = world.query([Position, Velocity]);
    const mapEntity = world.query([TileMap])[0];
    let map;
    if (mapEntity !== void 0) {
      map = world.getComponent(mapEntity, TileMap);
    }
    for (const id of entities) {
      const pos = world.getComponent(id, Position);
      const vel = world.getComponent(id, Velocity);
      const sprite = world.getComponent(id, Sprite);
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
        const facing = world.getComponent(id, Facing);
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
      if (map) {
        const centerX = pos.x + 16;
        const centerY = pos.y + 16;
        const tile = map.getTile(Math.floor(centerX / 32), Math.floor(centerY / 32));
        if (tile) {
          if (tile.has(28) || tile.has(SPRITES.WATER)) speedMult = 0.5;
          else if (tile.has(27)) speedMult = 0.7;
        }
      }
      const nextX = pos.x + vel.x * speedMult * dt;
      const nextY = pos.y + vel.y * speedMult * dt;
      if (map) {
        const myCollider = world.getComponent(id, Collider);
        let blockedByEntity = false;
        if (myCollider) {
          const myBoxNextX = nextX + myCollider.offsetX;
          const myBoxNextY = nextY + myCollider.offsetY;
          const myBoxW = myCollider.width;
          const myBoxH = myCollider.height;
          const collidables = world.query([Collider, Position]);
          for (const otherId of collidables) {
            if (otherId === id) continue;
            const otherPos = world.getComponent(otherId, Position);
            const otherCollider = world.getComponent(otherId, Collider);
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
          if (!map) return false;
          if (x < 0 || x >= map.width * map.tileSize || y < 0 || y >= map.height * map.tileSize) {
            if (debug) console.log(`[Collision] Out of bounds: ${x}, ${y}`);
            return true;
          }
          const tileX = Math.floor(x / map.tileSize);
          const tileY = Math.floor(y / map.tileSize);
          const idx = tileY * map.width + tileX;
          if (idx < 0 || idx >= map.tiles.length) return true;
          const tile = map.tiles[idx];
          for (const item of tile.items) {
            if (PHYSICS.isSolid(item.id)) {
              if (debug) console.log(`[Collision] Solid Item: ${item.id} at ${tileX},${tileY}`);
              return true;
            }
          }
          return false;
        };
        const updateOccupancy = (oldX, oldY, newX, newY) => {
          if (!map) return;
          const oldTx = Math.floor((oldX + 8) / map.tileSize);
          const oldTy = Math.floor((oldY + 8) / map.tileSize);
          const newTx = Math.floor((newX + 8) / map.tileSize);
          const newTy = Math.floor((newY + 8) / map.tileSize);
          if (oldTx !== newTx || oldTy !== newTy) {
            if (oldTx >= 0 && oldTx < map.width && oldTy >= 0 && oldTy < map.height) {
              const oldIdx = oldTy * map.width + oldTx;
              if (map.tiles[oldIdx].creature === id) {
                map.tiles[oldIdx].creature = null;
              }
            }
            if (newTx >= 0 && newTx < map.width && newTy >= 0 && newTy < map.height) {
              const newIdx = newTy * map.width + newTx;
              map.tiles[newIdx].creature = id;
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
        if (world.getComponent(id, PlayerControllable)) {
          if (network) network.sendMove(pos.x, pos.y);
          const teleporters = world.query([Teleporter, Position]);
          for (const tId of teleporters) {
            const tPos = world.getComponent(tId, Position);
            const tData = world.getComponent(tId, Teleporter);
            if (Math.abs(pos.x + 8 - (tPos.x + 8)) < 12 && Math.abs(pos.y + 8 - (tPos.y + 8)) < 12) {
              pos.x = tData.targetX;
              pos.y = tData.targetY;
              if (network) network.sendMove(pos.x, pos.y);
              return;
            }
          }
          const pc = world.getComponent(id, PlayerControllable);
          pc.footstepTimer -= dt;
          if (pc.footstepTimer <= 0) {
            let material = "grass";
            if (map) {
              const tx = Math.floor((pos.x + 8) / map.tileSize);
              const ty = Math.floor((pos.y + 8) / map.tileSize);
              if (tx >= 0 && tx < map.width && ty >= 0 && ty < map.height) {
                const tile = map.tiles[ty * map.width + tx];
                const top = tile.items.length > 0 ? tile.items[tile.items.length - 1].id : 0;
                if (top === 19 || top === 20) material = "wood";
                else if (top >= 23 || top === 17) material = "stone";
              }
            }
            audio.playFootstep(material);
            pc.footstepTimer = 0.4;
          }
        }
      }
    }
  }
  function cameraSystem(world, mapWidth, mapHeight) {
    const playerEntity = world.query([PlayerControllable, Position])[0];
    if (playerEntity === void 0) return;
    const pos = world.getComponent(playerEntity, Position);
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity === void 0) return;
    const cam = world.getComponent(cameraEntity, Camera);
    let targetX = pos.x - 320 / 2;
    let targetY = pos.y - 240 / 2;
    targetX = Math.max(0, Math.min(targetX, mapWidth - 320));
    targetY = Math.max(0, Math.min(targetY, mapHeight - 240));
    cam.x = targetX;
    cam.y = targetY;
  }
  function combatSystem(world, input, audio, ui, network, pvpEnabled = false) {
    const playerEntity = world.query([PlayerControllable, Position, Inventory])[0];
    if (playerEntity === void 0) return;
    const targetComp = world.getComponent(playerEntity, Target);
    let autoAttack = false;
    const now = Date.now();
    if (now - lastAttackTime < 1e3) return;
    if (targetComp) {
      const tPos = world.getComponent(targetComp.targetId, Position);
      if (tPos) {
        const pPos = world.getComponent(playerEntity, Position);
        const dx = tPos.x + 8 - (pPos.x + 8);
        const dy = tPos.y + 8 - (pPos.y + 8);
        if (Math.abs(dx) <= 24 && Math.abs(dy) <= 24) {
          autoAttack = true;
        }
      }
    }
    if (!autoAttack && !input.isDown("KeyF")) return;
    lastAttackTime = now;
    if (input.isDown("KeyF")) audio.playAttack();
    if (autoAttack) audio.playAttack();
    const pos = world.getComponent(playerEntity, Position);
    const pc = world.getComponent(playerEntity, PlayerControllable);
    const inv = world.getComponent(playerEntity, Inventory);
    const skills = world.getComponent(playerEntity, Skills);
    const xp = world.getComponent(playerEntity, Experience);
    const targetX = pos.x + 8 + pc.facingX * 24;
    const targetY = pos.y + 8 + pc.facingY * 24;
    let damage = 0;
    let skillLevel = 10;
    const weapon = inv.getEquipped("rhand");
    if (weapon) {
      damage = weapon.item.damage;
      if (skills) {
        let skillType = weapon.item.weaponType || "sword";
        if (weapon.item.name.includes("Sword")) skillType = "sword";
        else if (weapon.item.name.includes("Axe")) skillType = "axe";
        else if (weapon.item.name.includes("Club")) skillType = "club";
        const skill = skills[skillType];
        if (skill) {
          const passives = world.getComponent(playerEntity, Passives);
          const mightBonus = passives ? passives.might : 0;
          skillLevel = skill.level + mightBonus * 3;
          const missChance = Math.max(0.05, 0.35 - skillLevel * 0.01);
          if (Math.random() < missChance) {
            damage = 0;
            spawnFloatingText(world, targetX, targetY, "MISS", "#aaaaaa");
          } else {
            const playerLevel = xp ? xp.level : 1;
            const skillDmg = skillLevel * weapon.item.damage * 0.06 + playerLevel * 0.2;
            damage = Math.floor(skillDmg + Math.random() * (damage * 0.5));
            if (Math.random() < 0.05) {
              damage *= 2;
              spawnFloatingText(world, targetX, targetY, "CRIT!", "#ff0000");
              const s = world.createEntity();
              world.addComponent(s, new ScreenShake(0.2, 5));
            }
          }
          skill.xp += 1;
          const nextXp = Math.floor(50 * Math.pow(1.1, skill.level - 10));
          if (skill.xp >= nextXp) {
            skill.xp = 0;
            skill.level++;
            if (ui.console) ui.console.addSystemMessage(`You advanced to ${skillType} fighting level ${skill.level}.`);
            audio.playLevelUp();
          }
        }
      }
    } else {
      damage = 1 + (skills ? Math.floor(skills.club.level * 0.2) : 0);
    }
    const attackRadius = 24;
    const enemies = world.query([Health, Position]);
    let hit = false;
    let targetId = -1;
    const lockedTarget = world.getComponent(playerEntity, Target);
    if (lockedTarget) {
      const tPos = world.getComponent(lockedTarget.targetId, Position);
      if (tPos) {
        const dx = pos.x + 8 - (tPos.x + 8);
        const dy = pos.y + 8 - (tPos.y + 8);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= attackRadius) {
          targetId = lockedTarget.targetId;
        }
      }
    }
    if (targetId === -1) {
      const targets = [];
      for (const id of enemies) {
        if (id === playerEntity) continue;
        const ePos = world.getComponent(id, Position);
        const dx = pos.x + 8 - (ePos.x + 8);
        const dy = pos.y + 8 - (ePos.y + 8);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= attackRadius) targets.push({ id, dist });
      }
      targets.sort((a, b) => a.dist - b.dist);
      if (targets.length > 0) targetId = targets[0].id;
    }
    if (targetId !== -1) {
      const ePos = world.getComponent(targetId, Position);
      const rp = world.getComponent(targetId, RemotePlayer);
      if (rp && ui.network && ui.network.connected) {
        if (pvpEnabled) {
          ui.network.sendAttack(rp.id);
          const ft = world.createEntity();
          world.addComponent(ft, new Position(ePos.x, ePos.y - 10));
          world.addComponent(ft, new Velocity(0, -10));
          world.addComponent(ft, new FloatingText("Attack!", "#ff5555", 0.5, 0.5));
        } else {
          if (ui.console) ui.console.addSystemMessage("PvP is Disabled. Press 'P' to enable.");
        }
      } else {
        const health = world.getComponent(targetId, Health);
        if (health) {
          health.current -= damage;
          audio.playSpatialSound("hit", ePos.x, ePos.y, pos.x, pos.y);
          if (ui.console) ui.console.sendMessage(`You hit Enemy for ${damage} dmg.`);
          spawnBloodEffect(world, ePos.x, ePos.y);
          const ft = world.createEntity();
          world.addComponent(ft, new Position(ePos.x, ePos.y));
          world.addComponent(ft, new Velocity(0, -20));
          world.addComponent(ft, new FloatingText(`-${damage}`, "#ff3333"));
          if (health.current <= 0) {
            const nameComp = world.getComponent(targetId, Name);
            const enemyName = nameComp ? nameComp.value : "Enemy";
            if (ui.console) ui.console.sendMessage(`${enemyName} died.`);
            const qLog = world.getComponent(playerEntity, QuestLog);
            if (qLog) {
              for (const quest of qLog.quests) {
                if (!quest.completed && quest.type === "kill" && quest.target.toLowerCase() === enemyName.toLowerCase()) {
                  quest.current++;
                  if (ui.console) ui.console.sendMessage(`Quest "${quest.name}": ${quest.current}/${quest.required} ${quest.target}s`);
                  if (quest.current >= quest.required) {
                    quest.completed = true;
                    if (ui.console) ui.console.addSystemMessage(`Quest Complete! Return to turn in "${quest.name}"`);
                  }
                }
              }
            }
            const loot = generateLoot(enemyName.toLowerCase());
            gainExperience(world, 50, ui, audio);
            createCorpse(world, ePos.x, ePos.y, loot);
            world.removeEntity(targetId);
          }
        }
      }
      const shake = world.createEntity();
      world.addComponent(shake, new ScreenShake(0.2, 2));
      for (let i = 0; i < 5; i++) {
        const p = world.createEntity();
        world.addComponent(p, new Position(ePos.x + 8, ePos.y + 8));
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 50 + 20;
        const life = Math.random() * 0.3 + 0.2;
        world.addComponent(p, new Particle(life, life, "#a00", 2, Math.cos(angle) * speed, Math.sin(angle) * speed));
      }
      hit = true;
    }
    if (!hit) {
      if (ui.console) ui.console.addSystemMessage("You swing at the air.");
    }
  }
  function projectileSystem(world, dt, ui, audio) {
    const projectiles = world.query([Position, Projectile]);
    const targets = world.query([Position, Health, Name]);
    for (const pId of projectiles) {
      const pPos = world.getComponent(pId, Position);
      const proj = world.getComponent(pId, Projectile);
      let hit = false;
      for (const tId of targets) {
        if (pId === tId) continue;
        const tName = world.getComponent(tId, Name);
        if (proj.ownerType === "player" && world.getComponent(tId, PlayerControllable)) continue;
        if (proj.ownerType === "enemy" && !world.getComponent(tId, PlayerControllable)) continue;
        if (proj.ownerType === "player_ice" && world.getComponent(tId, PlayerControllable)) continue;
        const tPos = world.getComponent(tId, Position);
        if (pPos.x < tPos.x + 12 && pPos.x + 8 > tPos.x + 4 && pPos.y < tPos.y + 12 && pPos.y + 8 > tPos.y + 4) {
          const tHp = world.getComponent(tId, Health);
          tHp.current -= proj.damage;
          spawnFloatingText(world, tPos.x, tPos.y, `-${proj.damage}`, "#ff0");
          if (proj.ownerType === "player_ice") {
            world.addComponent(tId, new StatusEffect("frozen", 3, 0.5));
            spawnFloatingText(world, tPos.x, tPos.y - 10, "*Froze*", "#0ff");
          }
          if (tHp.current <= 0) {
            const name = tName.value.toLowerCase();
            const loot = generateLoot(name);
            createCorpse(world, tPos.x, tPos.y, loot);
            world.removeEntity(tId);
            gainExperience(world, 20, ui, audio);
          }
          hit = true;
          break;
        }
      }
      if (hit) {
        world.removeEntity(pId);
      }
    }
  }
  function drawSprite(ctx, uIndex, dx, dy, size = 0, flipX = false) {
    let source = assetManager.getSpriteSource(uIndex);
    if (uIndex >= 100 && uIndex < 200) {
    }
    if (!source) {
      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(Math.floor(dx), Math.floor(dy), 32, 32);
      return;
    }
    if (source) {
      const sw = source.sw;
      const sh = source.sh;
      const tallOffset = sh - 32;
      const drawY = dy - tallOffset;
      if (flipX) {
        ctx.save();
        ctx.translate(dx + sw, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(source.image, source.sx, source.sy, sw, sh, 0, 0, sw, sh);
        ctx.restore();
      } else {
        ctx.drawImage(source.image, source.sx, source.sy, sw, sh, dx, drawY, sw, sh);
      }
    } else {
      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(Math.floor(dx), Math.floor(dy), 32, 32);
    }
  }
  function tileRenderSystem(world, ctx) {
  }
  function renderSystem(world, ctx) {
    ctx.imageSmoothingEnabled = false;
    let camX = 0, camY = 0;
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity !== void 0) {
      const cam = world.getComponent(cameraEntity, Camera);
      camX = Math.floor(cam.x + (typeof shakeOffsetX !== "undefined" ? shakeOffsetX : 0));
      camY = Math.floor(cam.y + (typeof shakeOffsetY !== "undefined" ? shakeOffsetY : 0));
    }
    const mapEntities = world.query([TileMap])[0];
    if (mapEntities === void 0) return;
    const map = world.getComponent(mapEntities, TileMap);
    const viewportW = ctx.canvas.width;
    const viewportH = ctx.canvas.height;
    const startCol = Math.floor(Math.max(0, camX / map.tileSize));
    const endCol = Math.floor(Math.min(map.width, (camX + viewportW) / map.tileSize + 1));
    const startRow = Math.floor(Math.max(0, camY / map.tileSize));
    const endRow = Math.floor(Math.min(map.height, (camY + viewportH) / map.tileSize + 1));
    const overlays = [];
    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const idx = r * map.width + c;
        const tile = map.tiles[idx];
        if (!tile) continue;
        const drawX = Math.floor(c * map.tileSize - camX);
        const drawY = Math.floor(r * map.tileSize - camY);
        for (const item of tile.items) {
          drawSprite(ctx, item.id, drawX, drawY, map.tileSize);
        }
        if (tile.creature) {
          const id = tile.creature;
          const pos = world.getComponent(id, Position);
          const sprite = world.getComponent(id, Sprite);
          if (pos && sprite) {
            const px = Math.floor(pos.x - camX);
            const py = Math.floor(pos.y - camY);
            drawSprite(ctx, sprite.uIndex, px, py, sprite.size, sprite.flipX);
            overlays.push(id);
          }
        }
      }
    }
    const projectiles = world.query([Position, Projectile, Sprite]);
    for (const pid of projectiles) {
      const pos = world.getComponent(pid, Position);
      const sprite = world.getComponent(pid, Sprite);
      if (pos.x - camX > -32 && pos.x - camX < 320 && pos.y - camY > -32 && pos.y - camY < 240) {
        drawSprite(ctx, sprite.uIndex, Math.floor(pos.x - camX), Math.floor(pos.y - camY), sprite.size, sprite.flipX);
      }
    }
    for (const id of overlays) {
      drawOverlays(world, ctx, id, camX, camY);
    }
    const player = world.query([PlayerControllable, Target])[0];
    if (player !== void 0) {
      const targetComp = world.getComponent(player, Target);
      const tPos = world.getComponent(targetComp.targetId, Position);
      if (tPos) {
        const tx = Math.floor(tPos.x - camX);
        const ty = Math.floor(tPos.y - camY);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 1;
      }
    }
    if (DEBUG_COLLIDERS) {
      const colliders = world.query([Position, Collider]);
      for (const id of colliders) {
        const pos = world.getComponent(id, Position);
        const collider = world.getComponent(id, Collider);
        const colX = Math.floor(pos.x + collider.offsetX - camX);
        const colY = Math.floor(pos.y + collider.offsetY - camY);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 1;
      }
    }
    if (DEBUG_AI_STATES) {
      const aiEntities = world.query([Position, Sprite, AI]);
      for (const id of aiEntities) {
        const pos = world.getComponent(id, Position);
        const sprite = world.getComponent(id, Sprite);
        const aiComp = world.getComponent(id, AI);
        const isPlayer = world.getComponent(id, PlayerControllable);
        if (!isPlayer) {
          const stateX = Math.floor(pos.x - camX + sprite.size / 2);
          const stateY = Math.floor(pos.y - camY) - 18;
          const stateName = getStateName(aiComp.currentState);
          let stateColor = "#888888";
          if (aiComp.currentState === 1 /* CHASE */) stateColor = "#ff8800";
          else if (aiComp.currentState === 2 /* ATTACK */) stateColor = "#ff0000";
          else if (aiComp.currentState === 3 /* FLEE */) stateColor = "#00ff00";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#000";
          ctx.fillText(stateName, stateX + 1, stateY + 1);
          ctx.fillStyle = stateColor;
          ctx.fillText(stateName, stateX, stateY);
        }
      }
    }
  }
  function drawOverlays(world, ctx, id, camX, camY) {
    const pos = world.getComponent(id, Position);
    const sprite = world.getComponent(id, Sprite);
    const health = world.getComponent(id, Health);
    const nameComp = world.getComponent(id, Name);
    const isPlayer = world.getComponent(id, PlayerControllable);
    if (health && !isPlayer && health.current < health.max) {
      const barWidth = sprite.size;
      const barHeight = 4;
      const barX = Math.floor(pos.x - camX);
      const barY = Math.floor(pos.y - camY) - 6;
      const healthPercent = health.current / health.max;
      ctx.fillStyle = "#400";
      ctx.fillRect(barX, barY, barWidth, barHeight);
      if (healthPercent > 0.5) {
        ctx.fillStyle = "#0a0";
      } else if (healthPercent > 0.25) {
        ctx.fillStyle = "#aa0";
      } else {
        ctx.fillStyle = "#a00";
      }
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
    }
    const isQuestGiver = world.getComponent(id, QuestGiver);
    const isInteractable = world.getComponent(id, Interactable);
    if (nameComp && (isQuestGiver || isInteractable) && !isPlayer) {
      const nameX = Math.floor(pos.x - camX + sprite.size / 2);
      const nameY = Math.floor(pos.y - camY) - 6;
      ctx.font = 'bold 12px "VT323", monospace';
      ctx.textAlign = "center";
      const textWidth = ctx.measureText(nameComp.value).width;
      ctx.fillStyle = "#000000";
      ctx.fillRect(nameX - textWidth / 2 - 3, nameY - 11, textWidth + 6, 14);
      ctx.fillStyle = "#000";
      ctx.fillText(nameComp.value, nameX + 1, nameY + 1);
      ctx.fillStyle = isQuestGiver ? "#ffd700" : "#ffffff";
      ctx.fillText(nameComp.value, nameX, nameY);
    }
  }
  function textRenderSystem(world, ctx) {
    let camX = 0, camY = 0;
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity !== void 0) {
      const cam = world.getComponent(cameraEntity, Camera);
      camX = Math.floor(cam.x);
      camY = Math.floor(cam.y);
    }
    const entities = world.query([Position, FloatingText]);
    ctx.save();
    ctx.font = '14px "VT323", monospace';
    ctx.textAlign = "center";
    for (const id of entities) {
      const pos = world.getComponent(id, Position);
      const ft = world.getComponent(id, FloatingText);
      const drawX = Math.round(pos.x - camX + 8);
      const drawY = Math.round(pos.y - camY);
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.fillText(ft.text, drawX, drawY);
    }
    const particles = world.query([Position, Particle]);
    for (const id of particles) {
      const pos = world.getComponent(id, Position);
      const part = world.getComponent(id, Particle);
      const drawX = Math.round(pos.x - camX);
      const drawY = Math.round(pos.y - camY);
      ctx.globalAlpha = Math.max(0, part.life / part.maxLife);
      ctx.fillStyle = part.color;
      ctx.fillRect(drawX, drawY, part.size, part.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function consumableSystem(world, input, ui) {
    if (!input.isDown("KeyH")) return;
    const now = Date.now();
    if (consumableSystem.lastTime && now - consumableSystem.lastTime < 500) return;
    consumableSystem.lastTime = now;
    const playerEntity = world.query([PlayerControllable, Inventory, Health])[0];
    if (playerEntity === void 0) return;
    const inv = world.getComponent(playerEntity, Inventory);
    const health = world.getComponent(playerEntity, Health);
    const potion = inv.findItemByName("Small Health Potion");
    if (potion) {
      if (health.current < health.max) {
        health.current = Math.min(health.current + 20, health.max);
        inv.removeItem(potion.instance.item.name, 1);
        if (ui.console) ui.console.sendMessage("Used Potion. +20 HP.");
        const pos = world.getComponent(playerEntity, Position);
        const ft = world.createEntity();
        world.addComponent(ft, new Position(pos.x, pos.y));
        world.addComponent(ft, new Velocity(0, -20));
        world.addComponent(ft, new FloatingText(`+20 Returns`, "#00ff00"));
      }
    } else {
      if (ui.console) ui.console.sendMessage("No Potions!");
    }
  }
  function enemyCombatSystem(world, dt, ui, audio) {
    const playerEntity = world.query([PlayerControllable, Position, Health, Inventory])[0];
    if (playerEntity === void 0) return;
    const pPos = world.getComponent(playerEntity, Position);
    const pHealth = world.getComponent(playerEntity, Health);
    const pInv = world.getComponent(playerEntity, Inventory);
    const enemies = world.query([AI, Position]);
    if (!enemyCombatSystem.cooldowns) enemyCombatSystem.cooldowns = /* @__PURE__ */ new Map();
    const cooldowns = enemyCombatSystem.cooldowns;
    const now = Date.now();
    for (const id of enemies) {
      const ePos = world.getComponent(id, Position);
      const dx = pPos.x + 8 - (ePos.x + 8);
      const dy = pPos.y + 8 - (ePos.y + 8);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 16) {
        const last = cooldowns.get(id) || 0;
        if (now - last > 1e3) {
          cooldowns.set(id, now);
          let damage = 5;
          const skills = world.getComponent(playerEntity, Skills);
          const armor = pInv.getEquipped("armor");
          if (armor) {
            const reduction = Math.floor(armor.item.damage * 0.5);
            const absorbed = Math.floor(Math.random() * (armor.item.damage + 1));
            damage -= absorbed;
            if (absorbed > 0 && ui.console) ui.console.sendMessage(`Armor absorbed ${absorbed} dmg.`);
          }
          const helm = pInv.getEquipped("head");
          if (helm) {
            const absorbed = Math.floor(Math.random() * (helm.item.damage + 1));
            damage -= absorbed;
          }
          const shield = pInv.getEquipped("lhand");
          if (shield) {
            let mitigation = shield.item.damage;
            if (skills) {
              const shSkill = skills.shielding;
              mitigation += Math.floor(shield.item.damage * (shSkill.level * 0.05));
              shSkill.xp += 1;
              const nextXp = Math.floor(50 * Math.pow(1.1, shSkill.level - 10));
              if (shSkill.xp >= nextXp) {
                shSkill.xp = 0;
                shSkill.level++;
                if (ui.console) ui.console.addSystemMessage(`You advanced to shielding level ${shSkill.level}.`);
                audio.playLevelUp();
              }
            }
            damage = Math.max(0, damage - mitigation);
            if (ui.console && mitigation > 0) ui.console.sendMessage(`Blocked ${mitigation} dmg!`);
          }
          if (damage > 0) {
            const status = world.getComponent(playerEntity, StatusEffect);
            let manaShieldActive = false;
            if (status && status.type === "mana_shield") {
              const pMana = world.getComponent(playerEntity, Mana);
              if (pMana && pMana.current > 0) {
                manaShieldActive = true;
                if (pMana.current >= damage) {
                  pMana.current -= damage;
                  if (ui.console) ui.console.sendMessage(`Mana Shield absorbed ${damage} dmg.`);
                  spawnFloatingText(world, pPos.x, pPos.y, `-${damage}`, "#0000ff");
                } else {
                  damage -= pMana.current;
                  pMana.current = 0;
                  if (ui.console) ui.console.sendMessage(`Mana Shield broken!`);
                  world.removeComponent(playerEntity, StatusEffect);
                }
              }
            }
            if (damage > 0) {
              pHealth.current = Math.max(0, pHealth.current - damage);
              if (ui.console) ui.console.sendMessage(`Ouch! Took ${damage} dmg.`);
              audio.playSpatialSound("hit", ePos.x, ePos.y, pPos.x, pPos.y);
              triggerScreenShake(world, 6, 0.2);
              spawnBloodEffect(world, pPos.x, pPos.y);
              const ft = world.createEntity();
              world.addComponent(ft, new Position(pPos.x, pPos.y));
              world.addComponent(ft, new Velocity(0, -20));
              world.addComponent(ft, new FloatingText(`-${damage}`, "#f00"));
              if (pHealth.current <= 0) {
                if (ui.console) ui.console.addSystemMessage("YOU DIED!");
                audio.playDeath();
              }
            }
          }
        }
      }
    }
  }
  function switchMap(world, type, dungeonType = "temple", seed = 0) {
    const players = world.query([PlayerControllable]);
    if (players.length === 0) return;
    const playerEntity = players[0];
    const all = world.query([Position]);
    for (const id of all) {
      if (id !== playerEntity && !world.getComponent(id, PlayerControllable)) {
        world.removeEntity(id);
      }
    }
    let mapData;
    if (type === "overworld") {
      mapData = generateOverworld(256, 256, seed);
    } else {
      mapData = generateDungeon(64, 64, seed + Math.random(), dungeonType);
    }
    const mapEntity = world.query([TileMap])[0];
    if (mapEntity !== void 0) {
      const map = world.getComponent(mapEntity, TileMap);
      map.width = mapData.width;
      map.height = mapData.height;
      map.tileSize = mapData.tileSize;
      map.tiles = mapData.tiles;
    }
    for (const ent of mapData.entities) {
      if (ent.type === "player") {
        const pPos = world.getComponent(playerEntity, Position);
        pPos.x = ent.x;
        pPos.y = ent.y;
        const cam = world.query([Camera])[0];
        if (cam) {
          const cPos = world.getComponent(cam, Camera);
          cPos.x = ent.x - 160;
          cPos.y = ent.y - 120;
        }
      } else if (ent.type === "dungeon_entrance") {
        const portal = world.createEntity();
        world.addComponent(portal, new Position(ent.x, ent.y));
        world.addComponent(portal, new Sprite(77, 32));
        world.addComponent(portal, new DungeonEntrance(ent.dungeonType, ent.label));
        world.addComponent(portal, new Interactable(`Enter ${ent.label}`));
        world.addComponent(portal, new Name(ent.label));
      } else if (ent.type === "dungeon_exit") {
        const portal = world.createEntity();
        world.addComponent(portal, new Position(ent.x, ent.y));
        world.addComponent(portal, new Sprite(77, 32));
        world.addComponent(portal, new DungeonExit(ent.label));
        world.addComponent(portal, new Interactable(ent.label));
        world.addComponent(portal, new Name(ent.label));
      } else if (ent.type === "enemy") {
        createEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "fire_enemy") {
        createFireEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "ice_enemy") {
        createIceEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "water_enemy") {
        createWaterEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "earth_enemy") {
        createEarthEnemy(world, ent.x, ent.y, ent.enemyType, ent.difficulty);
      } else if (ent.type === "item") {
        createItem(world, ent.x, ent.y, ent.name, ent.slot, ent.uIndex, ent.damage);
      } else if (ent.type === "static") {
        const s = world.createEntity();
        world.addComponent(s, new Position(ent.x, ent.y));
        world.addComponent(s, new Sprite(ent.sprite, ent.size));
      } else if (ent.type === "boss") {
        if (ent.enemyType === "hydra") {
          createWaterEnemy(world, ent.x, ent.y, "hydra", 2);
        } else {
          createBoss(world, ent.x, ent.y);
        }
      }
    }
  }
  function dungeonSystem(world, input, ui) {
    if (!input.isJustPressed("Space")) return;
    const playerEntity = world.query([PlayerControllable, Position])[0];
    if (!playerEntity) return;
    const pos = world.getComponent(playerEntity, Position);
    const entrances = world.query([DungeonEntrance, Position]);
    for (const id of entrances) {
      const pPos = world.getComponent(id, Position);
      const dx = pos.x + 16 - (pPos.x + 16);
      const dy = pos.y + 16 - (pPos.y + 16);
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        const entrance = world.getComponent(id, DungeonEntrance);
        const locked = world.getComponent(id, Locked);
        if (locked) {
          const inv = world.getComponent(playerEntity, Inventory);
          if (!inv) return;
          const missingKeys = [];
          for (const key of locked.keyIds) {
            if (!inv.hasItem(key)) missingKeys.push(key);
          }
          if (missingKeys.length > 0) {
            ui.console?.addSystemMessage(locked.message);
            return;
          } else {
            ui.console?.addSystemMessage("The seal shatters!");
            world.removeComponent(id, Locked);
          }
        }
        if (ui.console) ui.console.addSystemMessage(`Entering ${entrance.label}...`);
        switchMap(world, "dungeon", entrance.dungeonType, Date.now());
        return;
      }
    }
    const exits = world.query([DungeonExit, Position]);
    for (const id of exits) {
      const pPos = world.getComponent(id, Position);
      const dx = pos.x + 16 - (pPos.x + 16);
      const dy = pos.y + 16 - (pPos.y + 16);
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        if (ui.console) ui.console.addSystemMessage(`Leaving Dungeon...`);
        switchMap(world, "overworld", "main", Date.now());
        return;
      }
    }
  }
  var MAP_CACHE = /* @__PURE__ */ new Map();
  function toolSystem(world, input, ui) {
    if (input.isJustPressed("MouseLeft")) {
      const uiAny = ui;
      if (uiAny.targetingItem) {
        const mx = input.mouse.x;
        const my = input.mouse.y;
        const cam = world.query([Camera])[0];
        let camX = 0, camY = 0;
        if (cam) {
          const cPos = world.getComponent(cam, Camera);
          camX = cPos.x;
          camY = cPos.y;
        }
        const wx = mx + camX;
        const wy = my + camY;
        const tx = Math.floor(wx / import_types2.TILE_SIZE);
        const ty = Math.floor(wy / import_types2.TILE_SIZE);
        const game = window.game;
        if (!game || !game.map) return;
        const tile = game.map.getTile(tx, ty);
        const player = world.query([PlayerControllable, Position])[0];
        if (player) {
          const pPos = world.getComponent(player, Position);
          const dx = pPos.x - wx;
          const dy = pPos.y - wy;
          if (Math.sqrt(dx * dx + dy * dy) > 100) {
            if (ui.console) ui.console.sendMessage("Too far away.");
            uiAny.targetingItem = null;
            document.body.style.cursor = "default";
            return;
          }
        }
        if (!tile) return;
        if (uiAny.targetingItem.name === "Shovel") {
          if (!tile.has(17)) {
            if (!tile.has(SPRITES.HOLE)) {
              const hole = world.createEntity();
              world.addComponent(hole, new Position(tx * 32, ty * 32));
              world.addComponent(hole, new Sprite(SPRITES.HOLE));
              world.addComponent(hole, new DungeonEntrance("cave", "Secret Cave"));
              if (ui.console) ui.console.sendMessage("You dug a hole.");
            } else {
              if (ui.console) ui.console.sendMessage("There is already a hole here.");
            }
          } else {
            if (ui.console) ui.console.sendMessage("You cannot dig this.");
          }
        } else if (uiAny.targetingItem.name === "Rope") {
          if (tile.has(SPRITES.ROPE_SPOT) || tile.has(SPRITES.HOLE)) {
            if (ui.console) ui.console.sendMessage("You rope yourself up.");
            switchMap(world, "overworld", "main", 1337);
          } else {
            if (ui.console) ui.console.sendMessage("Nothing to rope here.");
          }
        }
        uiAny.targetingItem = null;
        document.body.style.cursor = "default";
      }
    }
  }
  function createPlayer(world, x, y, input, vocationKey = "knight") {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    const vocationSpriteMap = {
      "knight": SPRITES.PLAYER,
      // 0 - Knight in full armor
      "mage": SPRITES.MAGE,
      // 1 - Blue wizard robes
      "ranger": SPRITES.RANGER,
      // 2 - Green leather with bow
      "paladin": SPRITES.GUARD
      // 5 - White/gold armor (use Guard sprite for now)
    };
    const spriteIndex = vocationSpriteMap[vocationKey] ?? SPRITES.PLAYER;
    world.addComponent(e, new Sprite(spriteIndex, 32));
    world.addComponent(e, new PlayerControllable());
    world.addComponent(e, new Inventory());
    world.addComponent(e, new Health(200, 200));
    world.addComponent(e, new Experience(0, 100, 1));
    world.addComponent(e, new Mana(50, 50));
    world.addComponent(e, new Facing(0, 1));
    world.addComponent(e, new QuestLog());
    world.addComponent(e, new LightSource(64, "#cc8844", true));
    world.addComponent(e, new ActiveSpell("adori flam"));
    const vocData = VOCATIONS[vocationKey] || VOCATIONS.knight;
    world.addComponent(e, new Skills());
    world.addComponent(e, new Passives());
    world.addComponent(e, new Vocation(vocData.name, vocData.hpGain, vocData.manaGain, vocData.capGain));
    const hp = world.getComponent(e, Health);
    hp.max = vocData.startHp;
    hp.current = vocData.startHp;
    const mana = world.getComponent(e, Mana);
    mana.max = vocData.startMana;
    mana.current = vocData.startMana;
    const inv = world.getComponent(e, Inventory);
    inv.cap = vocData.startCap;
    world.addComponent(e, new Collider(20, 12, 6, 20));
    return e;
  }
  function createEnemy(world, x, y, type = "orc", difficulty = 1) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    const def = import_mobs.MOB_REGISTRY[type];
    if (def) {
      world.addComponent(e, new Sprite(def.spriteIndex, 32));
      world.addComponent(e, new AI(def.speed));
      const maxHp = Math.floor(def.hp * hpScale);
      world.addComponent(e, new Health(maxHp, maxHp));
      world.addComponent(e, new Name(def.name));
      const lootItems = generateLoot(def.lootTable || type);
      world.addComponent(e, new Lootable(lootItems));
      if (def.equipment) {
        const inv = new Inventory();
        if (def.equipment.rhand) inv.equip("rhand", new ItemInstance(createItemFromRegistry(def.equipment.rhand), 1));
        if (def.equipment.lhand) inv.equip("lhand", new ItemInstance(createItemFromRegistry(def.equipment.lhand), 1));
        if (def.equipment.body) inv.equip("body", new ItemInstance(createItemFromRegistry(def.equipment.body), 1));
        if (def.equipment.head) inv.equip("head", new ItemInstance(createItemFromRegistry(def.equipment.head), 1));
        world.addComponent(e, inv);
      }
    } else {
      console.warn(`[Game] Unknown Mob Type: ${type}`);
      world.addComponent(e, new Sprite(SPRITES.ORC || 58, 32));
      world.addComponent(e, new AI(20));
      world.addComponent(e, new Health(50, 50));
      world.addComponent(e, new Name("Unknown " + type));
    }
    world.addComponent(e, new Collider(20, 12, 6, 20));
    return e;
  }
  function createBoss(world, x, y) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    world.addComponent(e, new Sprite(SPRITES.ORC, 48));
    world.addComponent(e, new AI(40));
    world.addComponent(e, new Health(200, 200));
    world.addComponent(e, new Name("Orc Warlord"));
    return e;
  }
  function createIceEnemy(world, x, y, type = "ice_wolf", difficulty = 1) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    if (type === "ice_wolf") {
      world.addComponent(e, new Sprite(SPRITES.ICE_WOLF, 32));
      world.addComponent(e, new AI(55));
      world.addComponent(e, new Health(45 * hpScale, 45 * hpScale));
      world.addComponent(e, new Name("Ice Wolf"));
      world.addComponent(e, new StatusOnHit("bleed", 0.35, 6, 4));
    } else if (type === "frost_mage") {
      world.addComponent(e, new Sprite(SPRITES.FROST_MAGE, 32));
      world.addComponent(e, new AI(25));
      world.addComponent(e, new Health(80 * hpScale, 80 * hpScale));
      world.addComponent(e, new Name("Frost Mage"));
      world.addComponent(e, new StatusOnHit("freeze", 0.6, 4, 50));
      world.addComponent(e, new Lootable([
        new Item("Ice Shard", "currency", 101, 0, 5, "Cold to the touch", "none", "common", 0, 0, 0, false, 0, void 0, void 0),
        new Item("Thunder Staff", "rhand", SPRITES.THUNDER_STAFF, 25, 600, "Crackles with energy", "staff", "rare", 0, 0, 20, false, 0, "#00ffff", 40)
      ]));
    } else if (type === "yeti") {
      world.addComponent(e, new Sprite(SPRITES.YETI, 32));
      world.addComponent(e, new AI(18));
      world.addComponent(e, new Health(250 * hpScale, 250 * hpScale));
      world.addComponent(e, new Name("Yeti"));
      world.addComponent(e, new StatusOnHit("bleed", 0.5, 8, 8));
      world.addComponent(e, new Lootable([
        new Item("Frost Helm", "head", SPRITES.FROST_HELM, 0, 800, "Icy protection", "none", "epic", 8, 0, 0, false, 0, "#ccffff", 30),
        new Item("Ice Bow", "rhand", SPRITES.ICE_BOW, 35, 700, "Freezes enemies", "bow", "rare", 0, 0, 0, false, 0, "#99ffff", 35)
      ]));
    }
    return e;
  }
  function createWaterEnemy(world, x, y, type = "crab", difficulty = 1) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    if (type === "crab") {
      world.addComponent(e, new Sprite(SPRITES.CRAB, 32));
      world.addComponent(e, new AI(20));
      world.addComponent(e, new Health(60 * hpScale, 60 * hpScale));
      world.addComponent(e, new Name("Crab"));
    } else if (type === "siren") {
      world.addComponent(e, new Sprite(SPRITES.SIREN, 32));
      world.addComponent(e, new AI(45));
      world.addComponent(e, new Health(50 * hpScale, 50 * hpScale));
      world.addComponent(e, new Name("Siren"));
    } else if (type === "hydra") {
      world.addComponent(e, new Sprite(SPRITES.HYDRA, 32));
      world.addComponent(e, new AI(25));
      world.addComponent(e, new Health(300 * hpScale, 300 * hpScale));
      world.addComponent(e, new Name("Hydra"));
      world.addComponent(e, new StatusOnHit("poison", 0.5, 5, 10));
      world.addComponent(e, new Lootable([
        new Item("Thunder Staff", "rhand", SPRITES.THUNDER_STAFF, 25, 600, "Crackles with energy", "staff", "rare", 0, 0, 20, false, 0, "#00ffff", 40),
        new Item("Water Essence", "currency", 100, 0, 50, "Pure water energy", "none", "rare", 0, 0, 0, false, 0, void 0, void 0)
      ]));
    }
    return e;
  }
  function createEarthEnemy(world, x, y, type = "golem", difficulty = 1) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    if (type === "golem") {
      world.addComponent(e, new Sprite(SPRITES.GOLEM, 32));
      world.addComponent(e, new AI(15));
      world.addComponent(e, new Health(120 * hpScale, 120 * hpScale));
      world.addComponent(e, new Name("Golem"));
      world.addComponent(e, new Lootable([
        new Item("Earth Essence", "currency", 110, 0, 50, "Solid earth energy", "none", "rare", 0, 0, 0, void 0, void 0, void 0, void 0),
        new Item("Obsidian Shard", "currency", 103, 0, 15, "Sharp black stone", "none", "common", 0, 0, 0, void 0, void 0, void 0, void 0)
      ]));
    } else if (type === "basilisk") {
      world.addComponent(e, new Sprite(SPRITES.BASILISK, 32));
      world.addComponent(e, new AI(45));
      world.addComponent(e, new Health(60 * hpScale, 60 * hpScale));
      world.addComponent(e, new Name("Basilisk"));
      world.addComponent(e, new StatusOnHit("poison", 0.4, 4, 8));
    }
    return e;
  }
  function createMerchant(world, x, y) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(SPRITES.NPC, 32));
    world.addComponent(e, new Interactable("Open Shop"));
    world.addComponent(e, new Name("Merchant"));
    const merch = new Merchant();
    merch.items.push(new Item("Health Potion", "consumable", SPRITES.POTION, 0, 30, "Restores 50 health", "none", "common", 0, 0, 0, void 0, void 0, void 0, void 0));
    merch.items.push(new Item("Mana Potion", "consumable", SPRITES.MANA_POTION, 0, 40, "Restores 30 mana", "none", "common", 0, 0, 0, void 0, void 0, void 0, void 0));
    merch.items.push(new Item("Wooden Sword", "rhand", SPRITES.WOODEN_SWORD, 3, 10, "Training weapon", "sword", "common", 0, 0, 0, void 0, void 0, void 0, void 0));
    merch.items.push(new Item("Wooden Club", "rhand", SPRITES.CLUB, 4, 15, "Heavy branch", "club", "common", 2, 0, 0, void 0, void 0, void 0, void 0));
    merch.items.push(new Item("Hand Axe", "rhand", SPRITES.AXE, 7, 25, "Woodcutter's tool", "axe", "common", 0, 0, 0, void 0, void 0, void 0, void 0));
    merch.items.push(new Item("Wooden Shield", "lhand", SPRITES.WOODEN_SHIELD, 0, 20, "Simple plank shield", "none", "common", 3, 0, 0, void 0, void 0, void 0, void 0));
    merch.items.push(new Item("Leather Armor", "body", SPRITES.ARMOR, 0, 50, "Basic protection", "none", "uncommon", 6, 0, 0, void 0, void 0, void 0, void 0));
    world.addComponent(e, merch);
    return e;
  }
  function createTeleporter(world, x, y, targetX, targetY) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Teleporter(targetX, targetY));
    world.addComponent(e, new Sprite(SPRITES.STAIRS, 32));
    return e;
  }
  function createFireEnemy(world, x, y, type = "scorpion", difficulty = 1) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    const hpScale = difficulty;
    if (type === "scorpion") {
      world.addComponent(e, new Sprite(SPRITES.SCORPION, 32));
      world.addComponent(e, new AI(55));
      world.addComponent(e, new Health(30 * hpScale, 30 * hpScale));
      world.addComponent(e, new Name("Scorpion"));
      world.addComponent(e, new StatusOnHit("poison", 0.5, 4, 6));
    } else if (type === "mummy") {
      world.addComponent(e, new Sprite(SPRITES.MUMMY, 32));
      world.addComponent(e, new AI(20));
      world.addComponent(e, new Health(80 * hpScale, 80 * hpScale));
      world.addComponent(e, new Name("Mummy"));
      world.addComponent(e, new StatusOnHit("curse", 0.2, 5, 20));
    } else if (type === "spider") {
      world.addComponent(e, new Sprite(SPRITES.SPIDER, 32));
      world.addComponent(e, new AI(45));
      world.addComponent(e, new Health(35 * hpScale, 35 * hpScale));
      world.addComponent(e, new Name("Spider"));
      world.addComponent(e, new StatusOnHit("slow", 0.4, 3, 2));
      world.addComponent(e, new Lootable([
        new Item("Spider Silk", "currency", 102, 0, 5, "Sticky silk", "none", "common", 0, 0, 0, void 0, void 0, void 0, void 0)
      ]));
    } else if (type === "fire_guardian") {
      world.addComponent(e, new Sprite(SPRITES.SCORPION, 48));
      world.addComponent(e, new AI(35));
      world.addComponent(e, new Health(250 * hpScale, 250 * hpScale));
      world.addComponent(e, new Name("Fire Guardian"));
      world.addComponent(e, new StatusOnHit("burn", 0.5, 6, 20));
      world.addComponent(e, new Lootable([
        new Item("Magma Armor", "armor", SPRITES.MAGMA_ARMOR, 0, 800, "Forged in fire", "none", "epic", 10, 0, 0, false, 0, "#ff4400", 50),
        new Item("Fire Sword", "rhand", SPRITES.FIRE_SWORD, 30, 700, "Burns on contact", "sword", "rare", 0, 0, 0, false, 0, "#ffaa00", 40)
      ]));
    }
    return e;
  }
  function createFinalBoss(world, x, y) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Velocity(0, 0));
    world.addComponent(e, new Sprite(SPRITES.NECROMANCER, 64));
    world.addComponent(e, new AI(45));
    world.addComponent(e, new Health(1e3, 1e3));
    world.addComponent(e, new Name("Void Bringer"));
    world.addComponent(e, new StatusOnHit("curse", 1, 10, 50));
    return e;
  }
  function createSealedGate(world, x, y) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(98, 32));
    world.addComponent(e, new Name("Sealed Gate"));
    world.addComponent(e, new Interactable("Inspect Gate"));
    world.addComponent(e, new DungeonEntrance("final", "Final Arena"));
    world.addComponent(e, new Locked(["Water Essence", "Ice Essence", "Fire Essence", "Earth Essence"], "The gate is sealed by 4 Elemental Essences."));
    return e;
  }
  function createItem(world, x, y, name, slot, uIndex, damage = 0, price = 10, description = "", weaponType = "", rarity = "common", defense = 0, bonusHp = 0, bonusMana = 0, glowColor, glowRadius, network, networkItem) {
    if (network && network.connected && !networkItem) {
      network.sendSpawnItem(x, y, uIndex, name);
      return;
    }
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(uIndex, 24));
    if (slot === "potion") price = 50;
    if (slot === "lhand") price = 100;
    if (slot === "rhand") price = 150;
    if (name === "Potion") price = 50;
    if (name === "Wooden Shield") price = 50;
    if (name === "Wooden Sword") price = 50;
    if (name === "Tower Shield") price = 200;
    if (name === "Noble Sword") price = 400;
    world.addComponent(e, new Item(name, slot, uIndex, damage, price, description, weaponType, rarity, defense, bonusHp, bonusMana, false, 0, glowColor, glowRadius));
    if (networkItem) {
      world.addComponent(e, networkItem);
    }
    return e;
  }
  function itemPickupSystem(world, ui, audio, network) {
    const playerEntity = world.query([PlayerControllable, Position, Inventory])[0];
    if (playerEntity === void 0) return;
    const pPos = world.getComponent(playerEntity, Position);
    const inventory = world.getComponent(playerEntity, Inventory);
    const items = world.query([Item, Position]);
    for (const id of items) {
      const iPos = world.getComponent(id, Position);
      if (pPos.x < iPos.x + 12 && pPos.x + 16 > iPos.x + 4 && pPos.y < iPos.y + 12 && pPos.y + 16 > iPos.y + 4) {
        const netItem = world.getComponent(id, NetworkItem);
        if (netItem && network) {
          network.sendPickupItem(netItem.id);
        }
        const item = world.getComponent(id, Item);
        if (item.slotType === "currency") {
          const amount = 10;
          inventory.gold = (inventory.gold || 0) + amount;
          iPos.x = -1e3;
          if (ui.console) ui.console.sendMessage(`You picked up ${amount} Gold.`);
          audio.playCoin();
          world.removeEntity(id);
          continue;
        }
        if (inventory.addItem(item)) {
          iPos.x = -1e3;
          if (ui.console) ui.console.sendMessage(`You picked up a ${item.name}.`);
          audio.playCoin();
          if (spriteSheet.complete) ui.updateInventory(inventory);
        } else {
          if (ui.console) ui.console.sendMessage(`No space for ${item.name}.`);
        }
        world.removeEntity(id);
      }
    }
  }
  function autocloseSystem(world, ui) {
    if (ui.activeMerchantId !== null) {
      const playerEntity = world.query([PlayerControllable, Position])[0];
      if (!playerEntity) return;
      const pos = world.getComponent(playerEntity, Position);
      const mPos = world.getComponent(ui.activeMerchantId, Position);
      if (!mPos) {
        ui.hideDialogue();
        return;
      }
      const dx = pos.x + 8 - (mPos.x + 8);
      const dy = pos.y + 8 - (mPos.y + 8);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 32) ui.hideDialogue();
    }
    if (ui.activeLootEntityId !== null) {
      const playerEntity = world.query([PlayerControllable, Position])[0];
      if (!playerEntity) return;
      const pos = world.getComponent(playerEntity, Position);
      const lPos = world.getComponent(ui.activeLootEntityId, Position);
      if (!lPos) {
        ui.hideDialogue();
        return;
      }
      const dx = pos.x + 8 - (lPos.x + 8);
      const dy = pos.y + 8 - (lPos.y + 8);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 32) ui.hideDialogue();
    }
  }
  function consumeItem(world, entity, item, audio, ui) {
    const hp = world.getComponent(entity, Health);
    const mana = world.getComponent(entity, Mana);
    let consumed = false;
    if (item.name === "Health Potion") {
      if (hp) {
        const old = hp.current;
        hp.current = Math.min(hp.max, hp.current + 50);
        if (ui.console) ui.console.sendMessage(`You drank a Health Potion (+${hp.current - old} HP).`);
        audio.playLevelUp();
        consumed = true;
      }
    } else if (item.name === "Mana Potion") {
      if (mana) {
        const old = mana.current;
        mana.current = Math.min(mana.max, mana.current + 50);
        if (ui.console) ui.console.sendMessage(`You drank a Mana Potion (+${mana.current - old} MP).`);
        audio.playLevelUp();
        consumed = true;
      }
    }
    return consumed;
  }
  function safeZoneRegenSystem(world, dt, ui) {
    const playerEntity = world.query([PlayerControllable, Position, Health, Mana])[0];
    if (playerEntity === void 0) return;
    const pos = world.getComponent(playerEntity, Position);
    const hp = world.getComponent(playerEntity, Health);
    const mana = world.getComponent(playerEntity, Mana);
    const dist = Math.sqrt(Math.pow(pos.x - 100, 2) + Math.pow(pos.y - 100, 2));
    if (dist < 200) {
      hp.current = Math.min(hp.max, hp.current + 20 * dt);
      mana.current = Math.min(mana.max, mana.current + 20 * dt);
      if (Math.random() < 0.05 && (hp.current < hp.max || mana.current < mana.max)) {
        const p = world.createEntity();
        world.addComponent(p, new Position(pos.x, pos.y - 10));
        world.addComponent(p, new Velocity(0, -10));
        world.addComponent(p, new FloatingText("+", "#00ff00"));
      }
    }
  }
  function deathSystem(world, ui, spawnX = TEMPLE_POS.x, spawnY = TEMPLE_POS.y) {
    const healths = world.query([Health]);
    for (const id of healths) {
      const hp = world.getComponent(id, Health);
      if (hp.current <= 0) {
        const isPlayer = world.getComponent(id, PlayerControllable);
        if (isPlayer) {
          if (ui.console) ui.console.addSystemMessage("You have died! Respawning at temple...");
          hp.current = hp.max;
          const pos = world.getComponent(id, Position);
          if (pos) {
            pos.x = spawnX;
            pos.y = spawnY;
          }
          const mana = world.getComponent(id, Mana);
          if (mana) mana.current = mana.max;
          continue;
        }
        const name = world.getComponent(id, Name);
        if (name && !world.getComponent(id, PlayerControllable)) {
        }
      }
    }
  }
  function castSpell(world, ui, spellName, network) {
    const playerEntity = world.query([PlayerControllable, Health, Mana, Position, Facing])[0];
    if (playerEntity === void 0) return;
    const hp = world.getComponent(playerEntity, Health);
    const mana = world.getComponent(playerEntity, Mana);
    const pos = world.getComponent(playerEntity, Position);
    const facing = world.getComponent(playerEntity, Facing);
    const skills = world.getComponent(playerEntity, Skills);
    const spellBook = world.getComponent(playerEntity, SpellBook);
    const vocation = world.getComponent(playerEntity, Vocation);
    const console2 = ui.console;
    const vocName = vocation ? vocation.name.toLowerCase() : "knight";
    const spellKey = spellName.toLowerCase();
    const canCast = (allowedClasses) => {
      if (!allowedClasses.includes(vocName)) {
        if (console2) console2.addSystemMessage("Your vocation cannot use this spell.");
        spawnFloatingText(world, pos.x, pos.y, "Restricted", "#ccc");
        return false;
      }
      return true;
    };
    const getLevel = (key) => {
      return spellBook ? spellBook.knownSpells.get(key) || 1 : 1;
    };
    if (spellKey === "exura") {
      if (mana.current >= 30) {
        mana.current -= 30;
        const magicLevel = skills ? skills.magic.level : 0;
        const healAmount = 50 + magicLevel * 10;
        hp.current = Math.min(hp.current + healAmount, hp.max);
        spawnFloatingText(world, pos.x, pos.y, `+${healAmount}`, "#00ff00");
        world.addComponent(world.createEntity(), new Position(pos.x, pos.y));
        if (console2) console2.addSystemMessage("exura!");
      } else {
        if (console2) console2.addSystemMessage(`Not enough mana.`);
        spawnFloatingText(world, pos.x, pos.y, "No Mana", "#fff");
      }
    } else if (spellKey === "exura gran") {
      if (!canCast(["mage"])) return;
      if (mana.current >= 70) {
        mana.current -= 70;
        const oldHp = hp.current;
        const magicLevel = skills ? skills.magic.level : 1;
        const spellLvl = getLevel("exura gran");
        const healAmount = 50 + magicLevel * 4 + spellLvl * 15;
        hp.current = Math.min(hp.current + healAmount, hp.max);
        const healed = hp.current - oldHp;
        const ft = world.createEntity();
        world.addComponent(ft, new Position(pos.x, pos.y));
        world.addComponent(ft, new Velocity(0, -20));
        world.addComponent(ft, new FloatingText(`+${healed}`, "#0000ff"));
        if (console2) console2.addSystemMessage(`You healed ${healed} HP (exura gran).`);
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
        spawnFloatingText(world, pos.x, pos.y, "No Mana", "#fff");
      }
    } else if (spellKey === "adori flam") {
      if (!canCast(["mage"])) return;
      if (mana.current >= 20) {
        mana.current -= 20;
        const pId = world.createEntity();
        world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));
        const targetComp = world.getComponent(playerEntity, Target);
        let vx = facing.x * 150;
        let vy = facing.y * 150;
        if (targetComp) {
          const targetPos = world.getComponent(targetComp.targetId, Position);
          if (targetPos) {
            const dx = targetPos.x + 8 - (pos.x + 8);
            const dy = targetPos.y + 8 - (pos.y + 8);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              vx = dx / dist * 150;
              vy = dy / dist * 150;
            }
          } else {
            world.removeComponent(playerEntity, Target);
          }
        }
        world.addComponent(pId, new Velocity(vx, vy));
        world.addComponent(pId, new Sprite(SPRITES.FIREBALL, 8));
        const magicLevel = skills ? skills.magic.level : 0;
        const dmg = 30 + magicLevel * 5;
        world.addComponent(pId, new Projectile(dmg, 1, "player"));
        if (console2) console2.addSystemMessage("adori flam!");
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
        spawnFloatingText(world, pos.x, pos.y, "No Mana", "#fff");
      }
    } else if (spellKey === "adori frigo") {
      if (!canCast(["mage"])) return;
      if (mana.current >= 15) {
        mana.current -= 15;
        const pId = world.createEntity();
        world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));
        const targetComp = world.getComponent(playerEntity, Target);
        let vx = facing.x * 200;
        let vy = facing.y * 200;
        if (targetComp) {
          const targetPos = world.getComponent(targetComp.targetId, Position);
          if (targetPos) {
            const dx = targetPos.x + 8 - (pos.x + 8);
            const dy = targetPos.y + 8 - (pos.y + 8);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              vx = dx / dist * 200;
              vy = dy / dist * 200;
            }
          }
        }
        world.addComponent(pId, new Velocity(vx, vy));
        world.addComponent(pId, new Sprite(SPRITES.SPARKLE, 8));
        const magicLevel = skills ? skills.magic.level : 0;
        const dmg = 20 + magicLevel * 4;
        world.addComponent(pId, new Projectile(dmg, 1, "player_ice"));
        if (console2) console2.addSystemMessage("adori frigo!");
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
        spawnFloatingText(world, pos.x, pos.y, "No Mana", "#fff");
      }
    } else if (spellKey === "exori") {
      if (!canCast(["knight"])) return;
      if (mana.current >= 20) {
        mana.current -= 20;
        const shake = world.createEntity();
        world.addComponent(shake, new ScreenShake(0.3, 3));
        const targetX = pos.x + facing.x * 16;
        const targetY = pos.y + facing.y * 16;
        const enemies = world.query([Health, Position, Name]);
        let hit = false;
        for (const eId of enemies) {
          if (world.getComponent(eId, PlayerControllable)) continue;
          const ePos = world.getComponent(eId, Position);
          const dx = targetX + 8 - (ePos.x + 8);
          const dy = targetY + 8 - (ePos.y + 8);
          if (Math.abs(dx) < 16 && Math.abs(dy) < 16) {
            const eHp = world.getComponent(eId, Health);
            const swordSkill = skills ? skills.sword.level : 10;
            const dmg = 30 + swordSkill * 3;
            eHp.current -= dmg;
            spawnFloatingText(world, ePos.x, ePos.y - 10, `${dmg}`, "#ff0000");
            hit = true;
            if (eHp.current <= 0) {
              const nameComp = world.getComponent(eId, Name);
              const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
              const loot = generateLoot(enemyType);
              createCorpse(world, ePos.x, ePos.y, loot);
              world.removeEntity(eId);
            }
          }
        }
        if (console2) console2.addSystemMessage("exori!");
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
        spawnFloatingText(world, pos.x, pos.y, "No Mana", "#fff");
      }
    } else if (spellKey === "exori mas") {
      if (!canCast(["knight"])) return;
      if (mana.current >= 40) {
        mana.current -= 40;
        const shake = world.createEntity();
        world.addComponent(shake, new ScreenShake(0.2, 4));
        const enemies = world.query([Health, Position, Name]);
        let hitCount = 0;
        const range = 24;
        for (const eId of enemies) {
          if (world.getComponent(eId, PlayerControllable)) continue;
          const ePos = world.getComponent(eId, Position);
          const dx = pos.x + 8 - (ePos.x + 8);
          const dy = pos.y + 8 - (ePos.y + 8);
          if (Math.abs(dx) <= range && Math.abs(dy) <= range) {
            const eHp = world.getComponent(eId, Health);
            const swordSkill = skills ? skills.sword.level : 10;
            const dmg = 50 + swordSkill * 4;
            eHp.current -= dmg;
            spawnFloatingText(world, ePos.x, ePos.y - 10, `${dmg}`, "#ff0000");
            hitCount++;
            if (eHp.current <= 0) {
              const nameComp = world.getComponent(eId, Name);
              const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
              const loot = generateLoot(enemyType);
              createCorpse(world, ePos.x, ePos.y, loot);
              world.removeEntity(eId);
            }
          }
        }
        if (console2) console2.addSystemMessage(`exori mas: ${hitCount} hits!`);
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
        spawnFloatingText(world, pos.x, pos.y, "No Mana", "#fff");
      }
    } else if (spellKey === "exevo gran vis lux") {
      if (!canCast(["mage"])) return;
      if (mana.current >= 60) {
        mana.current -= 60;
        const spellLvl = getLevel("exevo gran vis lux");
        const magicLevel = skills ? skills.magic.level : 1;
        const baseDmg = 40 + magicLevel * 3 + spellLvl * 5;
        const enemies = world.query([Health, Position, Name]);
        let currentPos = { x: pos.x, y: pos.y };
        let excludeIds = /* @__PURE__ */ new Set();
        let jumps = 4;
        let hits = 0;
        for (let i = 0; i < jumps; i++) {
          let closestId = -1;
          let closestDist = 150;
          for (const eId of enemies) {
            if (excludeIds.has(eId)) continue;
            if (world.getComponent(eId, PlayerControllable)) continue;
            const ePos = world.getComponent(eId, Position);
            const dx = ePos.x - currentPos.x;
            const dy = ePos.y - currentPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < closestDist) {
              closestDist = dist;
              closestId = eId;
            }
          }
          if (closestId !== -1) {
            excludeIds.add(closestId);
            const ePos = world.getComponent(closestId, Position);
            const chunks = 5;
            for (let p = 0; p < chunks; p++) {
              const t = p / chunks;
              const lx = currentPos.x + (ePos.x - currentPos.x) * t;
              const ly = currentPos.y + (ePos.y - currentPos.y) * t;
              const part = world.createEntity();
              world.addComponent(part, new Position(lx + 4, ly + 4));
              world.addComponent(part, new Particle(0.3, 0.3, "#ff0", 2, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10));
            }
            const eHp = world.getComponent(closestId, Health);
            const dmg = Math.floor(baseDmg * (1 - i * 0.15));
            eHp.current -= dmg;
            spawnFloatingText(world, ePos.x, ePos.y - 10, `${dmg}`, "#ffff00");
            hits++;
            if (eHp.current <= 0) {
              const nameComp = world.getComponent(closestId, Name);
              const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
              const loot = generateLoot(enemyType);
              createCorpse(world, ePos.x, ePos.y, loot);
              world.removeEntity(closestId);
            }
            currentPos = { x: ePos.x, y: ePos.y };
          } else {
            break;
          }
        }
        if (console2) console2.addSystemMessage(`exevo gran vis lux: ${hits} hits!`);
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
        spawnFloatingText(world, pos.x, pos.y, "No Mana", "#fff");
      }
    } else if (spellKey === "utito san") {
      if (!canCast(["ranger"])) return;
      if (mana.current >= 20) {
        mana.current -= 20;
        const pId = world.createEntity();
        world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));
        const targetComp = world.getComponent(playerEntity, Target);
        let vx = facing.x * 250;
        let vy = facing.y * 250;
        if (targetComp) {
          const targetPos = world.getComponent(targetComp.targetId, Position);
          if (targetPos) {
            const dx = targetPos.x + 8 - (pos.x + 8);
            const dy = targetPos.y + 8 - (pos.y + 8);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              vx = dx / dist * 250;
              vy = dy / dist * 250;
            }
          }
        }
        world.addComponent(pId, new Velocity(vx, vy));
        world.addComponent(pId, new Sprite(SPRITES.FIREBALL, 8));
        const distSkill = skills ? skills.distance.level : 10;
        const dmg = 40 + distSkill * 3;
        world.addComponent(pId, new Projectile(dmg, 0.8, "player"));
        if (console2) console2.addSystemMessage("utito san!");
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
        spawnFloatingText(world, pos.x, pos.y, "No Mana", "#fff");
      }
    } else if (spellKey === "exeta res") {
      if (!canCast(["knight"])) return;
      if (mana.current >= 30) {
        mana.current -= 30;
        spawnFloatingText(world, pos.x, pos.y, "CHALLENGE!", "#ff0000");
        const shake = world.createEntity();
        world.addComponent(shake, new ScreenShake(0.2, 2));
        const enemies = world.query([AI, Position]);
        let pulled = 0;
        for (const eId of enemies) {
          const ePos = world.getComponent(eId, Position);
          const dx = ePos.x - pos.x;
          const dy = ePos.y - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const vel = world.getComponent(eId, Velocity);
            if (vel) {
              vel.x = -dx * 2;
              vel.y = -dy * 2;
            }
            spawnFloatingText(world, ePos.x, ePos.y - 16, "!", "#ff0000");
            pulled++;
          }
        }
        if (console2) console2.addSystemMessage(`exeta res: ${pulled} enemies challenged.`);
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
      }
    } else if (spellKey === "utamo vita") {
      if (!canCast(["mage"])) return;
      if (mana.current >= 50) {
        mana.current -= 50;
        const status = world.getComponent(playerEntity, StatusEffect);
        if (status) world.removeComponent(playerEntity, StatusEffect);
        world.addComponent(playerEntity, new StatusEffect("mana_shield", 60));
        spawnFloatingText(world, pos.x, pos.y, "Mana Shield", "#0000ff");
        if (console2) console2.addSystemMessage("utamo vita: Magic protects you.");
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
      }
    } else if (spellKey === "exevo gran mas frigo") {
      if (!canCast(["mage"])) return;
      if (mana.current >= 120) {
        mana.current -= 120;
        const shake = world.createEntity();
        world.addComponent(shake, new ScreenShake(0.5, 5));
        spawnFloatingText(world, pos.x, pos.y, "ETERNAL WINTER", "#00ffff");
        const enemies = world.query([Health, Position]);
        let frozen = 0;
        for (const eId of enemies) {
          if (world.getComponent(eId, PlayerControllable)) continue;
          const ePos = world.getComponent(eId, Position);
          const dx = ePos.x - pos.x;
          const dy = ePos.y - pos.y;
          if (Math.abs(dx) < 120 && Math.abs(dy) < 120) {
            const eHp = world.getComponent(eId, Health);
            const magicLevel = skills ? skills.magic.level : 1;
            const dmg = 80 + magicLevel * 6;
            eHp.current -= dmg;
            spawnFloatingText(world, ePos.x, ePos.y, `${dmg}`, "#00ffff");
            const status = world.getComponent(eId, StatusEffect);
            if (status) world.removeComponent(eId, StatusEffect);
            world.addComponent(eId, new StatusEffect("frozen", 4));
            frozen++;
            if (eHp.current <= 0) {
              const nameComp = world.getComponent(eId, Name);
              const enemyType = nameComp ? nameComp.value.toLowerCase() : "orc";
              const loot = generateLoot(enemyType);
              createCorpse(world, ePos.x, ePos.y, loot);
              world.removeEntity(eId);
            }
          }
        }
        if (console2) console2.addSystemMessage(`exevo gran mas frigo: Frozen ${frozen} enemies.`);
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
      }
    } else if (spellKey === "exura san") {
      if (!canCast(["paladin", "ranger"])) return;
      if (mana.current >= 60) {
        mana.current -= 60;
        const magicLevel = skills ? skills.magic.level : 1;
        const heal = 80 + magicLevel * 8;
        hp.current = Math.min(hp.current + heal, hp.max);
        spawnFloatingText(world, pos.x, pos.y, `+${heal}`, "#ffff00");
        if (console2) console2.addSystemMessage("exura san!");
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
      }
    } else if (spellKey === "exori san") {
      if (!canCast(["paladin"])) return;
      if (mana.current >= 40) {
        mana.current -= 40;
        const pId = world.createEntity();
        world.addComponent(pId, new Position(pos.x + 8, pos.y + 8));
        const targetComp = world.getComponent(playerEntity, Target);
        let vx = facing.x * 250;
        let vy = facing.y * 250;
        if (targetComp) {
          const targetPos = world.getComponent(targetComp.targetId, Position);
          if (targetPos) {
            const dx = targetPos.x + 8 - (pos.x + 8);
            const dy = targetPos.y + 8 - (pos.y + 8);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              vx = dx / dist * 250;
              vy = dy / dist * 250;
            }
          }
        }
        world.addComponent(pId, new Velocity(vx, vy));
        world.addComponent(pId, new Sprite(SPRITES.SPARKLE, 8));
        const magicLevel = skills ? skills.magic.level : 1;
        const distSkill = skills ? skills.distance.level : 10;
        const dmg = 40 + distSkill * 2 + magicLevel * 3;
        world.addComponent(pId, new Projectile(dmg, 0.8, "player_holy"));
        if (console2) console2.addSystemMessage("exori san!");
      } else {
        if (console2) console2.addSystemMessage("Not enough Mana!");
      }
    }
  }
  function spawnFloatingText(world, x, y, text, color) {
    const ft = world.createEntity();
    world.addComponent(ft, new Position(x, y));
    world.addComponent(ft, new Velocity(0, -20));
    world.addComponent(ft, new FloatingText(text, color));
  }
  function gainExperience(world, amount, ui, audio) {
    const playerEntity = world.query([PlayerControllable, Experience, Health, Mana, Position])[0];
    if (playerEntity === void 0) return;
    const xp = world.getComponent(playerEntity, Experience);
    const hp = world.getComponent(playerEntity, Health);
    const mana = world.getComponent(playerEntity, Mana);
    const pos = world.getComponent(playerEntity, Position);
    const gameConsole = ui.console;
    xp.current += amount;
    if (gameConsole) gameConsole.sendMessage(`You gained ${amount} experience.`);
    const ft = world.createEntity();
    world.addComponent(ft, new Position(pos.x, pos.y - 12));
    world.addComponent(ft, new Velocity(0, -15));
    world.addComponent(ft, new FloatingText(`${amount} XP`, "#fff"));
    while (xp.current >= xp.next) {
      xp.current -= xp.next;
      xp.level++;
      xp.next = Math.floor(xp.next * 1.5);
      const voc = world.getComponent(playerEntity, Vocation);
      const inv2 = world.getComponent(playerEntity, Inventory);
      if (voc) {
        hp.max += voc.hpGain;
        if (mana) {
          console.log(`[LevelUp] Mana Gain: ${voc.manaGain}. Old Max: ${mana.max}`);
          mana.max += voc.manaGain;
          console.log(`[LevelUp] New Max: ${mana.max}`);
        }
        if (inv2) inv2.cap += voc.capGain;
      } else {
        hp.max += 10;
        if (mana) mana.max += 10;
      }
      hp.current = hp.max;
      if (mana) mana.current = mana.max;
      if (gameConsole) gameConsole.sendMessage(`You advanced to Level ${xp.level}.`);
      if (gameConsole && voc) gameConsole.sendMessage(`HP: +${voc.hpGain}, MP: +${voc.manaGain}, Cap: +${voc.capGain}`);
      audio.playLevelUp();
      const lu = world.createEntity();
      world.addComponent(lu, new Position(pos.x, pos.y - 20));
      world.addComponent(lu, new Velocity(0, -10));
      world.addComponent(lu, new FloatingText("LEVEL UP!", "#ffd700", 3));
      world.addComponent(lu, new FloatingText("LEVEL UP!", "#ffd700", 3));
    }
    const inv = world.getComponent(playerEntity, Inventory);
    const skills = world.getComponent(playerEntity, Skills);
    const curLevel = xp.level;
    const curXP = xp.current;
    const nextXP = xp.next;
    const curHP = hp.current;
    const maxHP = hp.max;
    const curMana = mana ? mana.current : 0;
    const maxMana = mana ? mana.max : 0;
    const curCap = inv ? inv.cap : 0;
    const curGold = inv ? inv.gold : 0;
    ui.updateStatus(curHP, maxHP, curMana, maxMana, curCap, curGold, curLevel, curXP, nextXP, skills);
  }
  function updateStatsFromPassives(world, playerEntity) {
    const passives = world.getComponent(playerEntity, Passives);
    const hp = world.getComponent(playerEntity, Health);
    const mana = world.getComponent(playerEntity, Mana);
    const voc = world.getComponent(playerEntity, Vocation);
    if (!hp || !mana || !voc) return;
    const xp = world.getComponent(playerEntity, Experience);
    const level = xp && !isNaN(xp.level) ? xp.level : 1;
    const vocKey = voc && voc.name ? voc.name.toLowerCase() : "knight";
    const vocData = VOCATIONS[vocKey] || VOCATIONS["knight"];
    const startHp = vocData.startHp;
    const startMana = vocData.startMana;
    const hpGain = voc && voc.hpGain ? voc.hpGain : vocData.hpGain;
    const manaGain = voc && voc.manaGain ? voc.manaGain : vocData.manaGain;
    const baseHp = startHp + (level - 1) * hpGain;
    const baseMana = startMana + (level - 1) * manaGain;
    const bonusHp = passives && !isNaN(passives.vitality) ? passives.vitality * 10 : 0;
    const bonusMana = passives && !isNaN(passives.spirit) ? passives.spirit * 10 : 0;
    hp.max = Math.floor(baseHp + bonusHp);
    mana.max = Math.floor(baseMana + bonusMana);
    if (isNaN(hp.current) || hp.current === null || hp.current === void 0) {
      hp.current = hp.max;
    }
    if (isNaN(mana.current) || mana.current === null || mana.current === void 0) {
      mana.current = mana.max;
    }
  }
  function generateLoot(enemyType = "orc") {
    const items = [];
    const tableKey = enemyType.toLowerCase();
    const table = import_loot_tables.LOOT_TABLES[tableKey] || import_loot_tables.LOOT_TABLES["orc"];
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
  var lightCanvas = null;
  var lightCtx = null;
  function lightingRenderSystem(world, ctx, ambientLight = 0.9) {
    let camX = 0, camY = 0;
    const cameraEntity = world.query([Camera])[0];
    if (cameraEntity !== void 0) {
      const cam = world.getComponent(cameraEntity, Camera);
      camX = Math.floor(cam.x + (typeof shakeOffsetX !== "undefined" ? shakeOffsetX : 0));
      camY = Math.floor(cam.y + (typeof shakeOffsetY !== "undefined" ? shakeOffsetY : 0));
    }
    const lights = world.query([Position, LightSource]);
    if (!lightCanvas) {
      lightCanvas = document.createElement("canvas");
      lightCanvas.width = ctx.canvas.width;
      lightCanvas.height = ctx.canvas.height;
      lightCtx = lightCanvas.getContext("2d");
    }
    if (lightCanvas && lightCtx) {
      if (lightCanvas.width !== ctx.canvas.width || lightCanvas.height !== ctx.canvas.height) {
        lightCanvas.width = ctx.canvas.width;
        lightCanvas.height = ctx.canvas.height;
      }
      lightCtx.save();
      lightCtx.globalCompositeOperation = "source-over";
      lightCtx.fillStyle = `rgba(0, 0, 0, ${ambientLight})`;
      lightCtx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);
      lightCtx.globalCompositeOperation = "destination-out";
      for (const id of lights) {
        const pos = world.getComponent(id, Position);
        const light = world.getComponent(id, LightSource);
        const lx = Math.round(pos.x - camX + 8);
        const ly = Math.round(pos.y - camY + 8);
        let radius = light.radius;
        if (light.flickers) {
          radius += (Math.random() - 0.5) * 4;
        }
        const gradient = lightCtx.createRadialGradient(lx, ly, 0, lx, ly, radius);
        gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        lightCtx.fillStyle = gradient;
        lightCtx.beginPath();
        lightCtx.arc(lx, ly, radius, 0, Math.PI * 2);
        lightCtx.fill();
      }
      lightCtx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(lightCanvas, 0, 0);
      ctx.restore();
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.6;
    for (const id of lights) {
      const light = world.getComponent(id, LightSource);
      if (light.color && light.color !== "#000000") {
        const pos = world.getComponent(id, Position);
        const lx = Math.round(pos.x - camX + 8);
        const ly = Math.round(pos.y - camY + 8);
        let radius = light.radius;
        if (light.flickers) radius += (Math.random() - 0.5) * 4;
        const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
        gradient.addColorStop(0, light.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(lx, ly, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  function equipmentLightSystem(world) {
    const players = world.query([PlayerControllable, Inventory]);
    for (const playerEntity of players) {
      const inv = world.getComponent(playerEntity, Inventory);
      let bestColor = null;
      let maxRadius = 0;
      for (const [_, inst] of inv.equipment) {
        const item = inst.item;
        if (item.glowColor) {
          if (item.glowRadius > maxRadius) {
            maxRadius = item.glowRadius;
            bestColor = item.glowColor;
          }
        }
      }
      const light = world.getComponent(playerEntity, LightSource);
      if (bestColor) {
        if (light) {
          light.color = bestColor;
          light.radius = maxRadius;
          light.flickers = true;
        } else {
          world.addComponent(playerEntity, new LightSource(maxRadius, bestColor, true));
        }
      } else {
        if (light && (light.color !== "#ffffff" || light.radius > 32)) {
          light.radius = 32;
          light.color = "#ffffff";
          light.flickers = false;
        }
      }
    }
  }
  function createCorpse(world, x, y, loot = []) {
    for (let i = 0; i < 12; i++) {
      const p = world.createEntity();
      world.addComponent(p, new Position(x + 16, y + 16));
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 40;
      const life = Math.random() * 0.4 + 0.2;
      const colors = ["#a00", "#800", "#600", "#400", "#300"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      world.addComponent(p, new Particle(life, life, color, Math.random() * 3 + 2, Math.cos(angle) * speed, Math.sin(angle) * speed - 30));
    }
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y));
    world.addComponent(e, new Sprite(SPRITES.BONES || 22, 16));
    world.addComponent(e, new Decay(300));
    world.addComponent(e, new Interactable("Loot Corpse"));
    if (loot.length > 0) {
      world.addComponent(e, new Lootable(loot));
      const glowingItem = loot.find((item) => item.glowColor);
      if (glowingItem) {
        world.addComponent(e, new LightSource(glowingItem.glowRadius || 40, glowingItem.glowColor, true));
      }
    }
    return e;
  }
  function decaySystem(world, dt) {
    const entities = world.query([Decay]);
    for (const id of entities) {
      const decay = world.getComponent(id, Decay);
      decay.life -= dt;
      if (decay.life <= 0) {
        world.removeEntity(id);
      }
    }
  }
  function uiControlSystem(world, input, ui) {
    if (input.isJustPressed("KeyEscape")) {
      console.log("ESC Pressed - Closing UI");
      ui.shopPanel.classList.add("hidden");
      ui.bagPanel.classList.add("hidden");
      ui.lootPanel.classList.add("hidden");
      ui.currentMerchant = null;
      ui.activeMerchantId = null;
      ui.activeLootEntityId = null;
      const inspectPanel = document.getElementById("inspect-panel");
      if (inspectPanel) inspectPanel.classList.add("hidden");
    }
  }
  function moveItem(world, source, target, ui) {
    const player = world.query([PlayerControllable, Position, Inventory])[0];
    if (!player) return;
    const pPos = world.getComponent(player, Position);
    const inv = world.getComponent(player, Inventory);
    let targetPos = { x: pPos.x, y: pPos.y };
    if (source.type === "ground") {
      targetPos = { x: source.x * 32, y: source.y * 32 };
    } else if (target.type === "ground") {
      targetPos = { x: target.x * 32, y: target.y * 32 };
    }
    const dist = Math.sqrt(Math.pow(targetPos.x - pPos.x, 2) + Math.pow(targetPos.y - pPos.y, 2));
    if (dist > 80) {
      if (ui.console) ui.console.addSystemMessage("Too far away.");
      return;
    }
    let item = null;
    let sourceContainer = null;
    const game = window.game;
    if (!game) return;
    const map = game.map;
    if (source.type === "ground") {
      const tile = map.getTile(source.x, source.y);
      if (tile && tile.items.length > 0) {
        item = tile.items[tile.items.length - 1];
        if (item.id === 0) return;
        sourceContainer = tile.items;
      }
    } else if (source.type === "slot") {
      const slotName = source.id.replace("slot-", "");
      const equipped = inv.getEquipped(slotName);
      if (equipped) {
        item = equipped.item;
      }
    }
    if (!item) return;
    if (source.type === "ground") {
      sourceContainer.pop();
    } else if (source.type === "slot") {
      inv.unequip(source.id.replace("slot-", ""));
    }
    if (target.type === "ground") {
      const tile = map.getTile(target.x, target.y);
      if (tile) {
        if (typeof item.id === "number") {
          tile.items.push({ id: item.id, count: 1 });
        } else {
          const id = item.uIndex !== void 0 ? item.uIndex : item.id;
          tile.items.push({ id, count: 1 });
        }
      }
    } else if (target.type === "slot") {
      const slotName = target.id.replace("slot-", "");
      let properItem = item;
      if (!item.name) {
        properItem = {
          id: item.id,
          uIndex: item.id,
          name: "Item " + item.id,
          type: "misc",
          damage: 0,
          defense: 0,
          value: 0,
          spriteId: item.id,
          slotType: "any"
        };
      }
      if (properItem.item) {
        inv.equip(slotName, properItem);
      } else {
        inv.equip(slotName, { item: properItem, count: 1, contents: [] });
      }
    }
    calculatePlayerStats(world, player);
    ui.update(player);
  }
  function calculatePlayerStats(world, playerEntity) {
    const inv = world.getComponent(playerEntity, Inventory);
    if (!inv) return;
    let attack = 0;
    let defense = 0;
    const slots = ["head", "body", "legs", "boots", "lhand", "rhand", "amulet", "ring"];
    for (const slot of slots) {
      const equipped = inv.getEquipped(slot);
      if (equipped && equipped.item) {
        const uIndex = equipped.item.uIndex !== void 0 ? equipped.item.uIndex : equipped.item.id;
        const def = import_items.ItemRegistry[uIndex];
        if (def) {
          if (def.attack) attack += def.attack;
          if (def.defense) defense += def.defense;
        }
      }
    }
    const game = window.game;
    if (game && game.player) {
      game.player.attack = attack;
      game.player.defense = defense;
      if (attack > 0 || defense > 0) {
        console.log(`[Stats] Updated: Atk ${attack}, Def ${defense}`);
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
  function spawnDebugSet(world, ui) {
    const playerEntity = world.query([PlayerControllable, Position])[0];
    if (playerEntity === void 0) return;
    const pos = world.getComponent(playerEntity, Position);
    const game = window.game;
    const map = game.map;
    console.log("[Debug] Spawning Museum of All Assets...");
    if (ui && ui.console) ui.console.addSystemMessage("Spawning Museum of 50+ Assets...");
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
    const bulkIds = Object.values(import_bulk_constants.BULK_SPRITES);
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
})();
