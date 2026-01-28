
import { World, Entity, InputHandler } from '../engine';
import {
    Position, Velocity, Sprite, PlayerControllable, Name,
    Health, Experience, Mana, Facing, QuestLog, LightSource,
    SpellBook, ActiveSpell, SkillPoints, Stats, CombatState,
    Target, RegenState, Skills, Passives, Vocation, VOCATIONS,
    Inventory, Item, ItemInstance, Collider, Hotbar
} from '../components';
import { SPRITES } from '../constants';
import { createItemFromRegistry } from '../data/items';
import { gameEvents, EVENTS } from './events';

// ============================================================
// PLAYER FACTORY
// ============================================================
export function createPlayer(world: World, x: number, y: number, input: InputHandler, vocationKey: string = 'knight'): Entity {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y, 6)); // Z=6 = Elevated city floor
    world.addComponent(e, new Velocity(0, 0));

    // Set sprite based on vocation
    const vocationSpriteMap: Record<string, number> = {
        'knight': SPRITES.PLAYER,  // 0 - Knight in full armor
        'mage': SPRITES.MAGE,      // 1 - Blue wizard robes
        'ranger': SPRITES.RANGER,  // 2 - Green leather with bow
        'paladin': SPRITES.GUARD   // 5 - White/gold armor (use Guard sprite for now)
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

    // Default Hotbar (Added in Refactor)
    world.addComponent(e, new Hotbar());

    // Lantern: Dimmer to avoid blinding
    world.addComponent(e, new LightSource(64, '#cc8844', true));

    // Magic System State
    const sb = new SpellBook();
    if (!sb.knownSpells.has("Fireball")) sb.knownSpells.set("Fireball", 1);
    world.addComponent(e, sb);
    world.addComponent(e, new ActiveSpell('adori flam')); // Default Fireball

    world.addComponent(e, new SkillPoints(0, 0));
    world.addComponent(e, new Stats(10, 5, 0.5)); // 2.0s Cooldown (Tibia Standard)
    world.addComponent(e, new CombatState());
    world.addComponent(e, new Target(null));
    world.addComponent(e, new RegenState());

    // RPG Depth
    const vocData = VOCATIONS[vocationKey as keyof typeof VOCATIONS] || VOCATIONS.knight;
    world.addComponent(e, new Skills());
    world.addComponent(e, new Passives()); // New Passive System
    world.addComponent(e, new Vocation(vocData.name, vocData.hpGain, vocData.manaGain, vocData.capGain));

    // Update stats based on vocation
    const hp = world.getComponent(e, Health)!;
    hp.max = vocData.startHp;
    hp.current = vocData.startHp;

    const mana = world.getComponent(e, Mana)!;
    mana.max = vocData.startMana;
    mana.current = vocData.startMana;

    // Equipment Interaction
    const inv = world.getComponent(e, Inventory)!;
    inv.gold = 100; // Start with some gold

    ensureStartingEquipment(world, e); // Ensure gear (New or Partial Save)

    world.addComponent(e, new Collider(20, 12, 6, 20)); // 20x12 box at bottom center

    console.log(`[PlayerFactory] Created Player (Vocation: ${vocationKey}) at ${x},${y}`);
    return e;
}

export function ensureStartingEquipment(world: World, e: number) {
    const inv = world.getComponent(e, Inventory);
    if (!inv) return;

    // === KNIGHT STARTING EQUIPMENT ===
    // Check and Equip individually to handle partial saves/updates

    // 1. Small Bag
    if (!inv.getEquipped('backpack')) {
        const bagItem = new Item("Small Bag", "backpack", SPRITES.SMALL_BAG, 0, 30, "A small leather bag. Limited storage.", "none", "common", 0, 0, 0, 0, 0, true, 8);
        const bagInst = new ItemInstance(bagItem, 1);

        // Add starting consumables to bag
        const apple = new Item("Apple", "none", SPRITES.APPLE, 0, 2, "Restores 10 HP.", "none", "common");
        const potion = new Item("Health Potion", "none", SPRITES.POTION, 0, 50, "Restores 50 HP.", "none", "common");
        bagInst.contents.push(new ItemInstance(apple, 5)); // 5 Apples
        bagInst.contents.push(new ItemInstance(potion, 2)); // 2 Health Potions

        inv.equip('backpack', bagInst);
        console.log("[PlayerFactory] Retroactively equipped Backpack.");
    }

    // 2. Knight's Weapon: Wooden Sword
    if (!inv.getEquipped('rhand')) {
        const weapon = new Item("Wooden Sword", "rhand", SPRITES.WOODEN_SWORD, 8, 20, "A practice sword. Deals 8 damage.", "sword", "common", 0);
        inv.equip('rhand', new ItemInstance(weapon, 1));
        console.log("[PlayerFactory] Retroactively equipped Wooden Sword.");
    }

    // 3. Knight's Armor: Leather Armor
    if (!inv.getEquipped('body')) {
        const armor = new Item("Leather Armor", "body", SPRITES.LEATHER_ARMOR, 0, 50, "Basic leather protection.", "none", "common", 4);
        inv.equip('body', new ItemInstance(armor, 1));
        console.log("[PlayerFactory] Retroactively equipped Leather Armor.");
    }

    // 4. Knight's Shield: Wooden Shield
    if (!inv.getEquipped('lhand')) {
        const shield = new Item("Wooden Shield", "lhand", SPRITES.WOODEN_SHIELD, 0, 40, "A simple wooden shield.", "none", "common", 5);
        inv.equip('lhand', new ItemInstance(shield, 1));
        console.log("[PlayerFactory] Retroactively equipped Wooden Shield.");
    }

    // 5. Knight's Boots: Leather Boots
    if (!inv.getEquipped('boots')) {
        const boots = new Item("Leather Boots", "boots", SPRITES.LEATHER_BOOTS, 0, 25, "Simple leather boots.", "none", "common", 1);
        inv.equip('boots', new ItemInstance(boots, 1));
        console.log("[PlayerFactory] Retroactively equipped Leather Boots.");
    }
}
