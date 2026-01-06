
export const spriteSheet = new Image();

// Create 256x256 Canvas (8x8 Grid of 32px tiles)
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
const ctx = canvas.getContext('2d')!;

function drawPixelArt() {
    console.log("Generating Tibia-Style Humanoid Pixel Art...");

    // Helper: Noise Texture
    const noise = (x: number, y: number, colorBase: number[], variation: number) => {
        for (let i = 0; i < 32; i += 2) {
            for (let j = 0; j < 32; j += 2) {
                if (Math.random() > 0.6) {
                    ctx.fillStyle = `rgb(${colorBase[0] - variation}, ${colorBase[1] - variation}, ${colorBase[2] - variation})`;
                    ctx.fillRect(x + i, y + j, 2, 2);
                }
            }
        }
    };

    // Helper: Draw 3D Humanoid
    const drawHumanoid = (
        bx: number, by: number,
        skinColor: string,
        armorColor: string,
        pantsColor: string,
        helmetColor: string | null,
        capeColor: string | null,
        weaponType: 'sword' | 'staff' | 'bow' | 'none' = 'none'
    ) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(bx + 16, by + 28, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Legs (Apart for stance)
        ctx.fillStyle = pantsColor;
        ctx.fillRect(bx + 10, by + 20, 5, 8); // L
        ctx.fillRect(bx + 17, by + 20, 5, 8); // R

        // Body (Chest) - bulky
        ctx.fillStyle = armorColor;
        ctx.fillRect(bx + 8, by + 10, 16, 14);

        // Shading on Armor (Right side darker)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(bx + 16, by + 10, 8, 14);

        // Arms
        ctx.fillStyle = armorColor; // Sleeves
        ctx.fillRect(bx + 4, by + 10, 4, 10); // L
        ctx.fillRect(bx + 24, by + 10, 4, 10); // R

        // Hands (Skin)
        ctx.fillStyle = skinColor;
        ctx.fillRect(bx + 4, by + 20, 4, 4); // L
        ctx.fillRect(bx + 24, by + 20, 4, 4); // R

        // Cape (Behind)
        if (capeColor) {
            ctx.fillStyle = capeColor;
            ctx.fillRect(bx + 9, by + 8, 14, 18);
        }

        // Head/Helmet
        if (helmetColor) {
            ctx.fillStyle = helmetColor;
            ctx.fillRect(bx + 10, by + 2, 12, 12);
            // Visor/Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(bx + 12, by + 4, 4, 4);
        } else {
            ctx.fillStyle = skinColor; // Face
            ctx.fillRect(bx + 11, by + 4, 10, 10);
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(bx + 13, by + 7, 2, 2);
            ctx.fillRect(bx + 17, by + 7, 2, 2);
        }

        // Weapon
        if (weaponType === 'sword') {
            ctx.fillStyle = '#ccc'; // Blade
            ctx.fillRect(bx + 26, by + 8, 4, 16);
            ctx.fillStyle = '#641'; // Hilt
            ctx.fillRect(bx + 24, by + 20, 8, 2);
        } else if (weaponType === 'staff') {
            ctx.fillStyle = '#642'; // Staff
            ctx.fillRect(bx + 26, by + 4, 2, 24);
            ctx.fillStyle = '#0ff'; // Orb
            ctx.fillRect(bx + 25, by + 2, 4, 4);
        }
    };

    // --- ROW 0: PLAYER & CHARACTERS (0-7) ---
    // 0: KNIGHT (Silver/Red)
    drawHumanoid(0, 0, '#db9', '#99a', '#555', '#99a', '#d00', 'sword');

    // 1: MAGE (Blue/Gold)
    drawHumanoid(32, 0, '#db9', '#228', '#22a', null, null, 'staff');
    // Add Wizard Hat manually
    ctx.fillStyle = '#228';
    ctx.beginPath(); ctx.moveTo(32 + 10, 6); ctx.lineTo(32 + 16, -4); ctx.lineTo(32 + 22, 6); ctx.fill();

    // 2: RANGER (Green/Brown)
    drawHumanoid(64, 0, '#db9', '#262', '#432', null, '#141', 'bow');
    // Hood logic handles internally or add explicitly? 
    // Simple hood overlay
    ctx.fillStyle = '#262';
    ctx.fillRect(64 + 10, 2, 12, 4);

    // 3: NPC (Villager)
    drawHumanoid(96, 0, '#db9', '#c75', '#432', null, null, 'none');

    // --- ROW 1: ENEMIES (8-15) ---
    const r1 = 32;

    // 8: SKELETON
    drawHumanoid(0, r1, '#eee', '#eee', '#eee', null, null, 'sword');
    // Make ribs visible (overwrite chest)
    ctx.fillStyle = '#222';
    ctx.fillRect(0 + 12, r1 + 12, 8, 8);
    ctx.fillStyle = '#eee'; // Ribs
    ctx.fillRect(0 + 12, r1 + 13, 8, 2);
    ctx.fillRect(0 + 12, r1 + 16, 8, 2);

    // 9: ORC (Green skin, Leather armor)
    drawHumanoid(32, r1, '#494', '#632', '#432', null, null, 'none');
    // Tusks
    ctx.fillStyle = '#fff';
    ctx.fillRect(32 + 12, r1 + 10, 2, 3); ctx.fillRect(32 + 18, r1 + 10, 2, 3);

    // 10: GHOST
    ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
    ctx.beginPath(); ctx.arc(64 + 16, r1 + 12, 10, 0, Math.PI * 2); ctx.fill(); // Head
    ctx.beginPath(); ctx.moveTo(64 + 6, r1 + 20); ctx.lineTo(64 + 26, r1 + 20); ctx.lineTo(64 + 16, r1 + 32); ctx.fill(); // Tail body

    // 11: SLIME
    ctx.fillStyle = '#4f4';
    ctx.beginPath(); ctx.arc(96 + 16, r1 + 22, 9, 0, Math.PI, true); ctx.fill();
    ctx.fillRect(96 + 7, r1 + 22, 18, 6);
    ctx.fillStyle = '#000'; ctx.fillRect(96 + 12, r1 + 18, 2, 2); ctx.fillRect(96 + 18, r1 + 18, 2, 2);

    // 12: WOLF
    ctx.fillStyle = '#777';
    ctx.fillRect(128 + 6, r1 + 14, 20, 10); // Body
    ctx.fillRect(128 + 4, r1 + 10, 8, 8); // Head
    ctx.fillRect(128 + 6, r1 + 24, 4, 6); // Leg L
    ctx.fillRect(128 + 20, r1 + 24, 4, 6); // Leg R

    // --- ROW 2: TERRAIN (16-23) ---
    const r2 = 64;

    // 16: GRASS
    ctx.fillStyle = '#2d4c1e'; ctx.fillRect(0, r2, 32, 32);
    noise(0, r2, [60, 110, 50], 15);
    ctx.fillStyle = '#fff'; ctx.fillRect(4, r2 + 8, 2, 2); ctx.fillRect(20, r2 + 20, 2, 2);

    // 17: WALL
    ctx.fillStyle = '#655'; ctx.fillRect(32, r2, 32, 32);
    ctx.fillStyle = '#433'; // Bricks
    ctx.fillRect(32, r2 + 4, 14, 8); ctx.fillRect(32 + 16, r2 + 4, 14, 8); ctx.fillRect(32 + 8, r2 + 18, 14, 8);

    // 18: WATER
    ctx.fillStyle = '#358'; ctx.fillRect(64, r2, 32, 32);
    ctx.fillStyle = '#58b'; ctx.fillRect(64 + 4, r2 + 6, 8, 2); ctx.fillRect(64 + 16, r2 + 20, 12, 2);

    // 19: WOOD
    ctx.fillStyle = '#643'; ctx.fillRect(96, r2, 32, 32);
    ctx.fillStyle = '#421'; ctx.fillRect(96, r2, 2, 32); ctx.fillRect(96 + 10, r2, 2, 32); ctx.fillRect(96 + 20, r2, 2, 32);
    ctx.fillStyle = '#210'; ctx.fillRect(96 + 4, r2 + 4, 2, 2); ctx.fillRect(96 + 14, r2 + 28, 2, 2);

    // 20: STAIRS
    ctx.fillStyle = '#333'; ctx.fillRect(128, r2, 32, 32);
    ctx.fillStyle = '#666'; ctx.fillRect(128 + 2, r2 + 8, 28, 6); ctx.fillRect(128 + 2, r2 + 20, 28, 6);

    // 21: WEB
    ctx.strokeStyle = '#fff'; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(160, r2); ctx.lineTo(160 + 32, r2 + 32); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(160 + 32, r2); ctx.lineTo(160, r2 + 32); ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 22: BONES
    ctx.fillStyle = '#ccc'; ctx.fillRect(192 + 12, r2 + 14, 8, 4); ctx.fillRect(192 + 10, r2 + 12, 4, 4);

    // 23: STONE FLOOR
    ctx.fillStyle = '#666'; ctx.fillRect(224, r2, 32, 32);
    ctx.strokeStyle = '#444'; ctx.strokeRect(224, r2, 32, 32);

    // --- ROW 3 ---
    const r3 = 96;
    // 24: MOSSY
    ctx.fillStyle = '#454'; ctx.fillRect(0, r3, 32, 32);
    // 25: DARK
    ctx.fillStyle = '#222'; ctx.fillRect(32, r3, 32, 32);

    // 26: SWORD
    ctx.fillStyle = '#ddd'; ctx.fillRect(64 + 14, r3 + 6, 4, 20); ctx.fillStyle = '#631'; ctx.fillRect(64 + 10, r3 + 24, 12, 4); ctx.fillRect(64 + 14, r3 + 28, 4, 4);

    // 27: POTION
    ctx.fillStyle = '#f22'; ctx.beginPath(); ctx.arc(96 + 16, r3 + 20, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(96 + 14, r3 + 10, 4, 6);

    // 28: GOLD
    ctx.fillStyle = '#fd0'; ctx.beginPath(); ctx.arc(128 + 16, r3 + 16, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fa0'; ctx.beginPath(); ctx.arc(128 + 20, r3 + 20, 6, 0, Math.PI * 2); ctx.fill();

    // 29: FIREBALL
    ctx.fillStyle = '#f80'; ctx.beginPath(); ctx.arc(160 + 16, r3 + 16, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(160 + 16, r3 + 16, 8, 0, Math.PI * 2); ctx.fill();

    // 30: TOWER SHIELD (Metal) - Was Generic
    ctx.fillStyle = '#889'; ctx.fillRect(192 + 8, r3 + 4, 16, 24); // Plate
    ctx.strokeStyle = '#bbe'; ctx.lineWidth = 2; ctx.strokeRect(192 + 8, r3 + 4, 16, 24); // Rim
    ctx.fillStyle = '#445'; ctx.fillRect(192 + 14, r3 + 8, 4, 16); // Cross detail

    // 31: WOODEN SWORD
    ctx.fillStyle = '#b85';
    ctx.fillRect(224 + 14, r3 + 6, 4, 20); // Blade
    ctx.fillStyle = '#642'; ctx.fillRect(224 + 10, r3 + 24, 12, 4); // Guard
    ctx.fillRect(224 + 14, r3 + 28, 4, 4); // Pommel

    // 32: NOBLE SWORD (Row 4, Col 0)
    const r4y = 128;
    ctx.fillStyle = '#aaf'; ctx.fillRect(0 + 13, r4y + 4, 6, 22); // Blue-tint blade
    ctx.fillStyle = '#fe0'; ctx.fillRect(0 + 8, r4y + 22, 16, 4); // Gold Left/Right
    ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(0 + 16, r4y + 24, 2, 0, Math.PI * 2); ctx.fill(); // Ruby

    // 33: WOODEN SHIELD (Row 4, Col 1)
    ctx.fillStyle = '#753'; ctx.beginPath(); ctx.arc(32 + 16, r4y + 16, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#542'; ctx.beginPath(); ctx.arc(32 + 16, r4y + 16, 4, 0, Math.PI * 2); ctx.fill(); // Boss
    ctx.strokeStyle = '#431'; ctx.lineWidth = 2; ctx.stroke();

    spriteSheet.src = canvas.toDataURL();
}

drawPixelArt();

// Export Canvas directly for Game Rendering (No flicker)
export const spriteCanvas = canvas;

// Config
export const SHEET_TILE_SIZE = 32;
export const SHEET_COLS = 8;

export const SPRITES = {
    // Characters
    PLAYER: 0,
    MAGE: 1,
    RANGER: 2,
    NPC: 3,

    // Enemies
    SKELETON: 8,
    ORC: 9,
    WOLF: 12,
    GHOST: 10,
    SLIME: 11,

    // Environment
    GRASS: 16,
    WALL: 17,
    WATER: 18,
    WOOD: 19,
    STAIRS: 20,
    WEB: 21,
    BONES: 22,
    STONE: 23,
    MOSSY: 24,
    DARK: 25,

    // Items
    SWORD: 26,
    POTION: 27,
    GOLD: 28,

    WOODEN_SWORD: 31,
    NOBLE_SWORD: 32,
    BOW: 26,    // reuse
    WAND: 26,   // reuse
    SHIELD: 30, // Tower/Iron
    WOODEN_SHIELD: 33,

    // Effects
    FIREBALL: 29,
    SPARKLE: 29,
    BLOOD: 29,
    GRAVE: 22
};
