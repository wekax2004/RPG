const fs = require('fs');
const path = 'src/game.ts';
let content = fs.readFileSync(path, 'utf8');

const startMarker = 'if (type === "wolf") {';
const endMarker = "// Collider: Body-sized collision box for enemies";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    // Find the closing brace of the bandit/tint block logic
    // The code was: 
    // ... Tint(...)
    // }

    const closingBraceIndex = content.indexOf('}', endIndex);
    if (closingBraceIndex === -1) { console.log("Closing brace not found"); process.exit(1); }

    const blockEndIndex = closingBraceIndex + 1; // Include '}'

    const newLogic = `
                const def = MOB_REGISTRY[type];
                if (def) {
                     world.addComponent(e, new Sprite(def.spriteIndex, 32));
                     world.addComponent(e, new AI(def.speed)); 
                     
                     const maxHp = Math.floor(def.hp * hpScale);
                     world.addComponent(e, new Health(maxHp, maxHp));
                     world.addComponent(e, new Name(def.name));
                     
                     // Loot Generation
                     const lootItems = generateLoot(def.lootTable || type);
                     world.addComponent(e, new Lootable(lootItems));

                     // Equipment Interaction
                     if (def.equipment) {
                         const inv = new Inventory();
                         // Populate slots
                         if (def.equipment.rhand) inv.equip('rhand', new ItemInstance(createItemFromRegistry(def.equipment.rhand), 1));
                         if (def.equipment.lhand) inv.equip('lhand', new ItemInstance(createItemFromRegistry(def.equipment.lhand), 1));
                         if (def.equipment.body) inv.equip('body', new ItemInstance(createItemFromRegistry(def.equipment.body), 1));
                         if (def.equipment.head) inv.equip('head', new ItemInstance(createItemFromRegistry(def.equipment.head), 1));
                         
                         world.addComponent(e, inv);
                     }
                } else {
                    console.warn(\`[Game] Unknown Mob Type: \${type}\`);
                    world.addComponent(e, new Sprite(SPRITES.ORC || 58, 32));
                    world.addComponent(e, new AI(20));
                    world.addComponent(e, new Health(50, 50));
                    world.addComponent(e, new Name("Unknown " + type));
                }`;

    const newContent = content.substring(0, startIndex) + newLogic + content.substring(blockEndIndex);
    fs.writeFileSync(path, newContent);
    console.log("Updated createEnemy logic successfully.");
} else {
    console.log("Markers not found.");
    console.log("Start: " + startIndex);
    console.log("End: " + endIndex);
}
