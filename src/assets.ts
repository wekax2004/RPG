
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
    // 0: KNIGHT (Tibia-style - Cleaner proportions)
    // Using drawHumanoid but with better colors
    const kx = 0, ky = 0;
    // Body (Chain mail)
    ctx.fillStyle = '#707070'; ctx.fillRect(kx + 8, ky + 12, 16, 12);
    // Head
    ctx.fillStyle = '#d4a574'; ctx.fillRect(kx + 10, ky + 4, 12, 10);
    // Helmet
    ctx.fillStyle = '#909090'; ctx.fillRect(kx + 9, ky + 2, 14, 6);
    ctx.fillStyle = '#606060'; ctx.fillRect(kx + 9, ky + 2, 14, 2); // Visor
    // Eyes
    ctx.fillStyle = '#000'; ctx.fillRect(kx + 12, ky + 8, 2, 2); ctx.fillRect(kx + 18, ky + 8, 2, 2);
    // Legs
    ctx.fillStyle = '#505050'; ctx.fillRect(kx + 10, ky + 24, 5, 6); ctx.fillRect(kx + 17, ky + 24, 5, 6);
    // Arms
    ctx.fillStyle = '#707070'; ctx.fillRect(kx + 4, ky + 12, 4, 8); ctx.fillRect(kx + 24, ky + 12, 4, 8);
    // Sword
    ctx.fillStyle = '#c0c0c0'; ctx.fillRect(kx + 26, ky + 6, 3, 18);
    ctx.fillStyle = '#8b4513'; ctx.fillRect(kx + 25, ky + 20, 5, 3);
    // Shield
    ctx.fillStyle = '#8b0000'; ctx.fillRect(kx + 2, ky + 14, 6, 8);
    ctx.fillStyle = '#ffd700'; ctx.fillRect(kx + 4, ky + 17, 2, 2);

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

    // 8: SKELETON (Tibia-style)
    const sx = 0, sy = r1;
    // Skull
    ctx.fillStyle = '#e8e8d8'; ctx.fillRect(sx + 10, sy + 2, 12, 12);
    ctx.fillStyle = '#000'; ctx.fillRect(sx + 12, sy + 6, 3, 3); ctx.fillRect(sx + 17, sy + 6, 3, 3); // Eyes
    ctx.fillRect(sx + 14, sy + 10, 4, 2); // Mouth
    // Ribcage
    ctx.fillStyle = '#d8d8c8'; ctx.fillRect(sx + 10, sy + 14, 12, 10);
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 4; i++) ctx.fillRect(sx + 11, sy + 15 + i * 2, 10, 1);
    // Arms (bones)
    ctx.fillStyle = '#e8e8d8';
    ctx.fillRect(sx + 4, sy + 14, 6, 2); ctx.fillRect(sx + 22, sy + 14, 6, 2);
    ctx.fillRect(sx + 4, sy + 18, 2, 6); ctx.fillRect(sx + 26, sy + 18, 2, 6);
    // Legs
    ctx.fillRect(sx + 12, sy + 24, 3, 8); ctx.fillRect(sx + 17, sy + 24, 3, 8);
    // Sword
    ctx.fillStyle = '#a0a0a0'; ctx.fillRect(sx + 26, sy + 8, 2, 14);

    // 9: ORC (Tibia-style - Bright Green warrior)
    const ox = 32, oy = r1;
    // Head (bright green skin)
    ctx.fillStyle = '#2a8a2a'; ctx.fillRect(ox + 10, oy + 2, 12, 12);
    // Face shading
    ctx.fillStyle = '#1a6a1a'; ctx.fillRect(ox + 10, oy + 8, 12, 6);
    // Eyes (yellow/angry)
    ctx.fillStyle = '#ffff00'; ctx.fillRect(ox + 12, oy + 5, 2, 2); ctx.fillRect(ox + 18, oy + 5, 2, 2);
    // Tusks (white, prominent)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 11, oy + 10, 2, 5); ctx.fillRect(ox + 19, oy + 10, 2, 5);
    // Body (leather vest)
    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(ox + 10, oy + 14, 12, 10);
    // Arms (green muscular)
    ctx.fillStyle = '#2a8a2a';
    ctx.fillRect(ox + 4, oy + 14, 6, 8); ctx.fillRect(ox + 22, oy + 14, 6, 8);
    // Hands
    ctx.fillStyle = '#1a7a1a';
    ctx.fillRect(ox + 4, oy + 20, 4, 4); ctx.fillRect(ox + 24, oy + 20, 4, 4);
    // Legs (brown leather)
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(ox + 12, oy + 24, 4, 6); ctx.fillRect(ox + 16, oy + 24, 4, 6);
    // Club weapon
    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(ox + 26, oy + 4, 4, 20);
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(ox + 25, oy + 2, 6, 4); // Club head

    // 10: GHOST
    ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
    ctx.beginPath(); ctx.arc(64 + 16, r1 + 12, 10, 0, Math.PI * 2); ctx.fill(); // Head
    ctx.beginPath(); ctx.moveTo(64 + 6, r1 + 20); ctx.lineTo(64 + 26, r1 + 20); ctx.lineTo(64 + 16, r1 + 32); ctx.fill(); // Tail body

    // 11: SLIME
    ctx.fillStyle = '#4f4';
    ctx.beginPath(); ctx.arc(96 + 16, r1 + 22, 9, 0, Math.PI, true); ctx.fill();
    ctx.fillRect(96 + 7, r1 + 22, 18, 6);
    ctx.fillStyle = '#000'; ctx.fillRect(96 + 12, r1 + 18, 2, 2); ctx.fillRect(96 + 18, r1 + 18, 2, 2);

    // 12: WOLF (Tibia-style - Grey fur, aggressive)
    const wx = 128, wy = r1;
    // Body (horizontal orientation for 4-legged)
    ctx.fillStyle = '#6a6a6a'; ctx.fillRect(wx + 8, wy + 14, 18, 10);
    // Fur texture
    ctx.fillStyle = '#808080';
    ctx.fillRect(wx + 10, wy + 15, 4, 3); ctx.fillRect(wx + 18, wy + 16, 4, 3);
    // Head (left side, snout)
    ctx.fillStyle = '#7a7a7a'; ctx.fillRect(wx + 2, wy + 12, 10, 10);
    ctx.fillStyle = '#5a5a5a'; ctx.fillRect(wx + 2, wy + 18, 6, 4); // Snout
    // Eyes
    ctx.fillStyle = '#ffcc00'; ctx.fillRect(wx + 6, wy + 14, 2, 2);
    // Teeth
    ctx.fillStyle = '#ffffff'; ctx.fillRect(wx + 3, wy + 20, 2, 2);
    // Ears 
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath(); ctx.moveTo(wx + 6, wy + 12); ctx.lineTo(wx + 4, wy + 6); ctx.lineTo(wx + 10, wy + 12); ctx.fill();
    // Legs (front and back)
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(wx + 8, wy + 24, 3, 6); ctx.fillRect(wx + 14, wy + 24, 3, 6);
    ctx.fillRect(wx + 20, wy + 24, 3, 6); ctx.fillRect(wx + 24, wy + 24, 3, 6);
    // Tail
    ctx.fillRect(wx + 26, wy + 12, 4, 4);

    // 13: ZOMBIE (Tibia-style - Undead, tattered)
    const zx = 160, zy = r1;
    // Body (tattered brown clothes)
    ctx.fillStyle = '#4a3a2a'; ctx.fillRect(zx + 8, zy + 12, 16, 14);
    // Torn edges
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(zx + 8, zy + 24, 4, 2); ctx.fillRect(zx + 18, zy + 22, 4, 3);
    // Head (grey-blue rotting skin)
    ctx.fillStyle = '#6a7a8a'; ctx.fillRect(zx + 10, zy + 2, 12, 12);
    // Rotting patches
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(zx + 12, zy + 4, 3, 3); ctx.fillRect(zx + 18, zy + 8, 3, 2);
    // Red glowing eyes
    ctx.fillStyle = '#ff2222'; ctx.fillRect(zx + 12, zy + 6, 2, 2); ctx.fillRect(zx + 18, zy + 6, 2, 2);
    // Arms (grey-blue, reaching)
    ctx.fillStyle = '#5a6a7a';
    ctx.fillRect(zx + 4, zy + 12, 4, 12); ctx.fillRect(zx + 24, zy + 14, 4, 10);
    // Clawed hands
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(zx + 3, zy + 22, 6, 3); ctx.fillRect(zx + 24, zy + 22, 5, 3);
    // Legs
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(zx + 10, zy + 26, 4, 6); ctx.fillRect(zx + 18, zy + 26, 4, 6);

    // --- ROW 2: TERRAIN (16-23) ---
    const r2 = 64;

    // 16: GRASS (Seamless Tibia-style)
    // Base color - solid fill for seamless tiling
    ctx.fillStyle = '#3d7a2e'; ctx.fillRect(0, r2, 32, 32);
    // Subtle variation using small random patches (avoid edges for seamless)
    ctx.fillStyle = '#4d8a3e';
    ctx.fillRect(6, r2 + 6, 4, 3); ctx.fillRect(16, r2 + 12, 5, 4);
    ctx.fillRect(8, r2 + 22, 4, 3); ctx.fillRect(20, r2 + 8, 4, 3);
    // Darker patches away from edges
    ctx.fillStyle = '#2d6a1e';
    ctx.fillRect(12, r2 + 16, 3, 3); ctx.fillRect(22, r2 + 20, 3, 3);

    // 17: WALL (Tibia-style - Single tile, no tall extension to avoid overwriting Row 1)
    const wallX = 32;
    // Front Face (Warmer brick colors)
    ctx.fillStyle = '#8b6b4f'; ctx.fillRect(wallX, r2, 32, 32);
    // Brick pattern
    ctx.fillStyle = '#6b4b3f';
    for (let by = 0; by < 4; by++) {
        for (let bx = 0; bx < 2; bx++) {
            const brickOx = bx * 16 + (by % 2 === 0 ? 0 : 8);
            ctx.fillRect(wallX + brickOx, r2 + by * 8, 14, 6);
        }
    }
    // Mortar lines
    ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) ctx.strokeRect(wallX, r2 + i * 8, 32, 8);
    // Top edge highlight (instead of tall section)
    ctx.fillStyle = '#3a1a0a'; ctx.fillRect(wallX, r2, 32, 3);
    ctx.fillStyle = '#9b7b5f'; ctx.fillRect(wallX, r2 + 28, 32, 2);

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

    // 23: STONE FLOOR (Seamless Tibia-style)
    ctx.fillStyle = '#686868'; ctx.fillRect(224, r2, 32, 32);
    // Grid pattern for seamless tiling
    ctx.strokeStyle = '#484848'; ctx.lineWidth = 1;
    ctx.strokeRect(224, r2, 16, 16);
    ctx.strokeRect(224 + 16, r2 + 16, 16, 16);
    // Subtle highlights (center of tiles)
    ctx.fillStyle = '#787878';
    ctx.fillRect(224 + 4, r2 + 4, 8, 8);
    ctx.fillRect(224 + 20, r2 + 20, 8, 8);

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

    // 34: TREE (Tall Sprite - 32x64)
    // We draw across Row 4 (Base) and Row 3 (Top) visually?
    // No, standard is Top-Left.
    // So we draw at Row 4 (Y=128) and extend DOWN? Or UP?
    // Sprite Slot 34 is the "Source".
    // If we want the tree to be logically at "Base", the sprite usually starts there.
    // Let's settle: Source Rect will be 32x64.
    // We draw the tree in the canvas at 64, 128 (Row 4, Col 2).
    // And it extends to 64, 192.
    // Ensuring we don't overwrite anything there.

    // Draw Grass Backing? 
    // No, we will handle this in render system by drawing grass under the tree tile.

    // Draw Tree
    const tx = 64;
    const ty = 128; // Row 4

    // Trunk (Base)
    ctx.fillStyle = '#532'; ctx.fillRect(tx + 12, ty + 48, 8, 16);

    // Foliage (Tall Cone)
    // Bottom Tier
    ctx.fillStyle = '#141';
    ctx.beginPath(); ctx.moveTo(tx + 16, ty + 20); ctx.lineTo(tx + 30, ty + 50); ctx.lineTo(tx + 2, ty + 50); ctx.fill();

    // Mid Tier
    ctx.fillStyle = '#282';
    ctx.beginPath(); ctx.moveTo(tx + 16, ty + 5); ctx.lineTo(tx + 26, ty + 35); ctx.lineTo(tx + 6, ty + 35); ctx.fill();

    // Top Tier
    ctx.fillStyle = '#4b4';
    ctx.beginPath(); ctx.moveTo(tx + 16, ty - 10); ctx.lineTo(tx + 22, ty + 15); ctx.lineTo(tx + 10, ty + 15); ctx.fill();

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
    ZOMBIE: 13,

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
    TREE: 34,

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

// Generate Sprites on Load
drawPixelArt();
