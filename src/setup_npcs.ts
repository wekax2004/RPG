import { World } from './engine';
import { Position, Name, Sprite, Interactable, QuestGiver, NPC, Facing } from './components';
import { QUEST_REGISTRY } from './data/quests';
import { Quest } from './components';

export function spawnQuestNPCs(world: World) {
    // Jory (Sewer) - Guide/Villager - Spawn on Z=6 (City Floor)
    createNPC(world, 128 * 32, 128 * 32, 6, "Old Man Jory", 260, [QUEST_REGISTRY['q_sewer_duty']]);

    // Grom (Friendly Orc) - Spawn on Z=6
    createNPC(world, 132 * 32, 128 * 32, 6, "Grom", 162, [QUEST_REGISTRY['q_kings_beef']]);

    console.log("[Setup] Spawned Quest NPCs: Jory and Grom on Z=6");
}

function createNPC(world: World, x: number, y: number, z: number, name: string, spriteId: number, quests: Quest[]) {
    const e = world.createEntity();
    world.addComponent(e, new Position(x, y, z));
    world.addComponent(e, new Sprite(spriteId));
    world.addComponent(e, new Name(name));
    world.addComponent(e, new Interactable('Talk'));
    // NPC constructor: type, dialog[]
    world.addComponent(e, new NPC('guide', ["Hello there!", "Do you have work for me?"]));
    world.addComponent(e, new Facing(0, 1));

    if (quests && quests.length > 0) {
        world.addComponent(e, new QuestGiver(quests));
    }
}
