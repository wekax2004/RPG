
import { createItemFromRegistry } from '../data/items';

// --- 1. SHOP INVENTORY DATA ---
const SHOP_INVENTORIES: Record<string, any[]> = {
    "Xodet": [
        { name: "Health Potion", price: 45, icon: "🔴" },
        { name: "Mana Potion", price: 50, icon: "🔵" },
    ],
    "Willard": [
        { name: "Dagger", price: 10, icon: "🗡️" },
        { name: "Longsword", price: 150, icon: "⚔️" },
        { name: "Fire Sword", price: 5000, icon: "🔥" },
        { name: "Ice Bow", price: 3000, icon: "❄️" },
        { name: "Steel Shield", price: 200, icon: "🛡️" },
        { name: "Chain Armor", price: 400, icon: "👕" }
    ],
    "Clyde": [
        { name: "Parcel", price: 10, icon: "📦" },
        { name: "Label", price: 1, icon: "🏷️" },
        { name: "Mega Backpack", price: 200, icon: "🎒" }
    ],
    "Merchant": [
        { name: "Apple", price: 5, icon: "🍎" }
    ]
};

// --- 2. SETUP & LOGIC ---
export function setupShopSystem() {
    console.log("[Shop] Setup System Called");
    const shopWindow = document.getElementById("shop-window");
    const closeBtn = document.getElementById("shop-close-btn");

    if (closeBtn && shopWindow) {
        closeBtn.onclick = () => {
            shopWindow.style.display = "none";
        };
        console.log("[Shop] Close Button Bind Success");
    } else {
        console.error("[Shop] Close Button or Window Not Found during Setup");
    }
}

function buyItem(itemName: string, price: number) {
    console.log(`[Shop] Requesting Buy: ${itemName}`);

    // Create a temporary item object for the event
    const tempItem = {
        name: itemName,
        price: price,
        slotType: 'backpack',
        uIndex: 0,
        attack: 0,
        defense: 0,
        armor: 0,
        speed: 0,
        icon: "",
        description: "Bought from shop"
    };

    const event = new CustomEvent("shopBuy", {
        detail: { item: tempItem, price: price }
    });
    document.dispatchEvent(event);
}

// GLOBAL FUNCTION TO OPEN SHOP
export function openShop(npcName: string) {
    console.log(`[Shop] Opening shop for raw name: "${npcName}"`);
    const cleanName = npcName ? npcName.trim() : "Merchant";
    console.log(`[Shop] Using lookup name: "${cleanName}"`);

    const shopWindow = document.getElementById("shop-window");
    const itemsList = document.getElementById("shop-items-list");
    const title = document.getElementById("shop-title");

    if (!shopWindow || !itemsList) {
        console.error("[Shop] Missing DOM Elements: Window=" + !!shopWindow + ", List=" + !!itemsList);
        return;
    }

    // Lookup
    const items = SHOP_INVENTORIES[cleanName] || SHOP_INVENTORIES["Merchant"];
    console.log(`[Shop] Found valid items? ${!!items} (Count: ${items ? items.length : 0})`);

    if (!items || items.length === 0) {
        console.warn(`[Shop] No items found for ${cleanName}`);
        itemsList.innerHTML = "<div style='color:gray; padding:10px;'>Out of Stock</div>";
        shopWindow.style.display = "block";
        return;
    }

    // 1. Show Window
    shopWindow.style.display = "block";
    if (title) title.innerText = `Shop: ${cleanName}`;

    // 2. Clear Old List
    itemsList.innerHTML = "";

    // 3. Populate List
    items.forEach(item => {
        // console.log(`[Shop] Rendering Item: ${item.name}`);
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "8px";
        row.style.borderBottom = "1px solid #444";
        row.style.color = "white";
        row.style.cursor = "pointer";
        row.className = "shop-item-row";

        // Icon/Name
        const left = document.createElement("div");
        left.innerHTML = `<span style="margin-right:8px; font-size:1.2em;">${item.icon}</span> <span>${item.name}</span>`;

        // Price
        const right = document.createElement("div");
        right.style.color = "#ffd700"; // Gold
        right.innerText = `${item.price} gp`;

        row.appendChild(left);
        row.appendChild(right);

        row.onclick = () => {
            buyItem(item.name, item.price);
        };

        row.onmouseenter = () => { row.style.backgroundColor = "#444"; };
        row.onmouseleave = () => { row.style.backgroundColor = "transparent"; };

        itemsList.appendChild(row);
    });
    console.log("[Shop] List Populated Successfully");
};

// Expose
(window as any).openShop = openShop;
