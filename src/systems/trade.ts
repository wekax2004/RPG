import { player, world } from "../main_v4";
import { ITEM_IDS } from "../constants";
import { ShopOffer } from "../data/shops";
import { Inventory, ItemInstance, Item as ItemComp } from "../components";
import { createItemFromRegistry } from "../data/items";

// Helper: Count total gold in inventory
function getPlayerGold(): number {
    const inv = world.getComponent(player.id, Inventory);
    if (!inv) return 0;
    return inv.gold;
}

// Helper: Remove gold from inventory
function removePlayerGold(amount: number): boolean {
    const inv = world.getComponent(player.id, Inventory);
    if (!inv || inv.gold < amount) return false;
    inv.gold -= amount;
    return true;
}

export function buyItem(offer: ShopOffer, amount: number) {
    const inv = world.getComponent(player.id, Inventory);
    if (!inv) return;

    const totalCost = (offer.buyPrice || 0) * amount;

    if (inv.gold >= totalCost) {
        // Add item to inventory (Backpack)
        const backpack = inv.getEquipped('backpack');
        if (backpack && backpack.contents) {
            const itemData = createItemFromRegistry(offer.itemId);
            if (itemData) {
                // Check for stackable in registry def? For now just create instance
                const instance = new ItemInstance(itemData, amount);

                // Try to stack or find empty slot
                let stacked = false;
                for (let i = 0; i < backpack.contents.length; i++) {
                    const slot = backpack.contents[i];
                    if (slot && slot.item.uIndex === offer.itemId && slot.count < 100) {
                        slot.count += amount;
                        stacked = true;
                        break;
                    }
                }

                if (!stacked) {
                    if (backpack.contents.length < 20) {
                        backpack.contents.push(instance);
                    } else {
                        alert("Backpack is full!");
                        return;
                    }
                }

                inv.gold -= totalCost;
                console.log(`Bought ${amount} ${offer.name} for ${totalCost} gp`);

                // Trigger UI update through event if possible, or just log
                // In this project, UI update is usually triggered by animation frames reading components
            }
        } else {
            alert("You need a backpack to buy items!");
        }
    } else {
        alert("You do not have enough gold.");
    }
}

export function sellItem(offer: ShopOffer, amount: number) {
    const inv = world.getComponent(player.id, Inventory);
    if (!inv) return;

    // Check if player has item in backpack
    const backpack = inv.getEquipped('backpack');
    if (!backpack || !backpack.contents) return;

    const itemIdx = backpack.contents.findIndex(inst => inst && inst.item.uIndex === offer.itemId);
    if (itemIdx !== -1) {
        const inst = backpack.contents[itemIdx];
        if (inst.count >= amount) {
            inst.count -= amount;
            if (inst.count <= 0) {
                backpack.contents.splice(itemIdx, 1);
            }
            inv.gold += (offer.sellPrice || 0) * amount;
            console.log(`Sold ${amount} ${offer.name} for ${(offer.sellPrice || 0) * amount} gp`);
        } else {
            alert("You don't have enough of that item.");
        }
    } else {
        alert("Item not found in your backpack.");
    }
}
