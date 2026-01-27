import { ItemRegistry, ItemDef } from '../data/items';
import { MANIFEST } from '../data/asset_manifest';

export class ManifestLoader {
    static async load() {
        console.log("[ManifestLoader] Loading custom assets...");

        // Ensure AssetManager is accessible
        const am = (window as any).assetManager || ((window as any).game && (window as any).game.assetManager);

        if (!am) {
            console.error("[ManifestLoader] AssetManager NOT FOUND. Skipping custom assets.");
            return;
        }

        const promises: Promise<boolean>[] = [];

        for (const mItem of MANIFEST) {
            const defId = mItem.spriteId;

            // map ManifestItem -> ItemDef
            const def: ItemDef = {
                name: mItem.name,
                type: mItem.type,
                uIndex: defId,
                description: mItem.description,
                price: mItem.stats.price,
                attack: mItem.stats.attack,
                defense: mItem.stats.defense,
                heal: mItem.stats.heal,
                slot: mItem.stats.slot,
                stackable: mItem.type === 'food' || mItem.type === 'other'
            };

            // Inject into Registry
            ItemRegistry[defId] = def;
            console.log(`[ManifestLoader] Registered ${mItem.name} as ID ${defId}`);

            // Load Custom Image
            if (mItem.imagePath) {
                // Heuristic: Check ID AND Name for tile keywords
                const searchStr = (mItem.id + mItem.name).toLowerCase();
                const isTile = (searchStr.includes('floor') ||
                    searchStr.includes('pavement') ||
                    searchStr.includes('checkered') ||
                    searchStr.includes('cobble') ||
                    searchStr.includes('grass') ||
                    searchStr.includes('stone') ||
                    searchStr.includes('ground') ||
                    searchStr.includes('wood') ||
                    searchStr.includes('road'));

                console.log(`[ManifestLoader] ID: ${mItem.id}, Name: ${mItem.name}, isTile: ${isTile}`);

                if (defId === 1060) {
                    console.error(`!!! DEBUG MANIFEST LOAD: Found Edron Lamp 1060. Image: ${mItem.imagePath}, PostProcess: ${mItem.postProcess}`);
                }

                // Push promise to array
                // Passing fourth arg: isTile
                promises.push(am.registerCustomSprite(defId, mItem.imagePath, mItem.postProcess, isTile));
            }
        }

        // Wait for all images to load
        await Promise.all(promises);
        console.log(`[ManifestLoader] All ${promises.length} custom assets loaded.`);
    }
}
