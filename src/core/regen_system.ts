
import { Health, Mana, Vocation, VOCATIONS, RegenState } from '../components';

export const regenSystem = (world: any, dt: number) => {
    // Query entities with RegenState (Must also have Health/Mana)
    // If an entity has Vocation but NO RegenState, we should probably initialize it?
    // For now, assume we add RegenState in main.ts
    const entities = world.query([Health, Mana, Vocation, RegenState]);

    for (const id of entities) {
        const hp = world.getComponent(id, Health)!;
        const mana = world.getComponent(id, Mana)!;
        const vocComp = world.getComponent(id, Vocation)!;
        const regen = world.getComponent(id, RegenState)!;

        // Defaults (if Vocation not found)
        let hpRate = 4.0;
        let manaRate = 4.0;

        // Config (Tibia)
        const vName = vocComp.name.toLowerCase();
        if (vName === 'knight') { hpRate = 3.0; manaRate = 6.0; }
        else if (vName === 'mage' || vName === 'sorcerer' || vName === 'druid') { hpRate = 6.0; manaRate = 3.0; }
        else if (vName === 'paladin') { hpRate = 4.0; manaRate = 4.0; }

        // Update HP
        regen.hpTimer += dt;
        if (regen.hpTimer >= hpRate) {
            if (hp.current < hp.max) {
                hp.current++;
                regen.hpTimer = 0;
            }
        }

        // Update Mana (2 every X seconds -> 1 every X/2)
        regen.manaTimer += dt;
        if (regen.manaTimer >= (manaRate / 2)) {
            if (mana.current < mana.max) {
                mana.current++;
                regen.manaTimer = 0;
            }
        }
    }
};
