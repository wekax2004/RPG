
import { World } from '../engine';
import { Spawner, Position, Health } from '../components';
import { createEnemy } from '../game';

export function spawnerSystem(world: World, dt: number) {
    // dt is in ms, we need seconds for timer
    const dtSeconds = dt / 1000;

    const spawners = world.query([Spawner, Position]);

    for (const id of spawners) {
        const spawner = world.getComponent(id, Spawner)!;
        const pos = world.getComponent(id, Position)!;

        // check if active entity is alive
        let isAlive = false;
        if (spawner.activeEntityId !== -1) {
            const ent = world.getComponent(spawner.activeEntityId, Health);
            // Check if entity exists and is alive (Health > 0)
            if (ent && ent.current > 0) {
                isAlive = true;

                // Optional: Check if mob wandered too far? (Reset logic)
                // For now, simple death respawn is enough.
            } else {
                // Entity is dead or removed
                spawner.activeEntityId = -1;
            }
        }

        if (!isAlive) {
            // Decrement Timer
            spawner.timer -= dtSeconds;

            if (spawner.timer <= 0) {
                // SPAWN!
                // Use Z from position or spawner default
                const z = pos.z !== undefined ? pos.z : (spawner.z || 7);

                console.log(`[Spawner] Spawning ${spawner.mobType} at ${pos.x},${pos.y},${z}`);

                const newMobId = createEnemy(world, pos.x, pos.y, spawner.mobType, 1.0, z);

                spawner.activeEntityId = newMobId;
                spawner.timer = spawner.interval; // Reset timer
            }
        }
    }
}
