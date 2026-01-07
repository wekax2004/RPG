
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

    // 4: HUNTER NPC (Green leather, bow)
    drawHumanoid(128, 0, '#db9', '#3a5a2a', '#4a3a1a', null, '#2a4a1a', 'bow');
    // Hunting cap
    ctx.fillStyle = '#3a5a2a';
    ctx.fillRect(128 + 8, 0, 16, 6);
    ctx.fillStyle = '#2a4a1a';
    ctx.fillRect(128 + 10, 2, 12, 4);
    // Feather
    ctx.fillStyle = '#8a3a1a';
    ctx.fillRect(128 + 22, 0, 2, 6);

    // 5: GUARD NPC (Armor, spear)
    const gx = 160;
    // Metallic armor body
    ctx.fillStyle = '#6a6a7a'; ctx.fillRect(gx + 8, 12, 16, 12);
    ctx.fillStyle = '#8a8a9a'; ctx.fillRect(gx + 10, 14, 4, 8);
    ctx.fillStyle = '#5a5a6a'; ctx.fillRect(gx + 18, 14, 4, 8);
    // Head (with helmet)
    ctx.fillStyle = '#6a6a7a'; ctx.fillRect(gx + 10, 2, 12, 10);
    ctx.fillStyle = '#db9'; ctx.fillRect(gx + 12, 6, 8, 6); // Face opening
    // Eyes
    ctx.fillStyle = '#000'; ctx.fillRect(gx + 13, 8, 2, 2); ctx.fillRect(gx + 17, 8, 2, 2);
    // Helmet crest
    ctx.fillStyle = '#8a1a1a'; ctx.fillRect(gx + 14, 0, 4, 4);
    // Legs
    ctx.fillStyle = '#5a5a6a'; ctx.fillRect(gx + 10, 24, 5, 8); ctx.fillRect(gx + 17, 24, 5, 8);
    // Spear
    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(gx + 26, 4, 3, 26);
    ctx.fillStyle = '#aaa'; ctx.fillRect(gx + 25, 0, 5, 6);

    // 6: PRIEST NPC (White robes, cross)
    const px = 192;
    // White robe body
    ctx.fillStyle = '#eee'; ctx.fillRect(px + 6, 12, 20, 18);
    ctx.fillStyle = '#ccc'; ctx.fillRect(px + 8, 14, 4, 14); // Shadow
    ctx.fillStyle = '#ddd'; ctx.fillRect(px + 20, 14, 4, 14);
    // Gold trim
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(px + 6, 28, 20, 2);
    ctx.fillRect(px + 14, 14, 4, 16);
    // Head
    ctx.fillStyle = '#db9'; ctx.fillRect(px + 10, 2, 12, 10);
    ctx.fillStyle = '#000'; ctx.fillRect(px + 12, 6, 2, 2); ctx.fillRect(px + 18, 6, 2, 2);
    // Bald/shaved head
    ctx.fillStyle = '#c8a'; ctx.fillRect(px + 10, 0, 12, 4);
    // Held cross
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(px + 4, 14, 2, 10);
    ctx.fillRect(px + 2, 16, 6, 2);
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

    // 12: WOLF (Tibia-style - Detailed grey/brown fur, fierce)
    const wx = 128, wy = r1;
    // Body (horizontal, 4-legged beast)
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(wx + 6, wy + 12, 20, 12);
    // Fur layers (light to dark for depth)
    ctx.fillStyle = '#7a6a5a';
    ctx.fillRect(wx + 8, wy + 13, 8, 4); ctx.fillRect(wx + 18, wy + 14, 6, 5);
    ctx.fillStyle = '#8a7a6a';
    ctx.fillRect(wx + 10, wy + 14, 4, 2); ctx.fillRect(wx + 20, wy + 16, 3, 2);
    // Dark underbelly
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(wx + 10, wy + 20, 12, 4);
    // Head (fierce, angular)
    ctx.fillStyle = '#6a5a4a'; ctx.fillRect(wx + 2, wy + 10, 10, 12);
    // Snout (elongated)
    ctx.fillStyle = '#4a3a2a'; ctx.fillRect(wx, wy + 16, 6, 6);
    ctx.fillStyle = '#2a1a0a'; ctx.fillRect(wx, wy + 20, 4, 2); // Nose
    // Eyes (fierce yellow)
    ctx.fillStyle = '#ffaa00'; ctx.fillRect(wx + 6, wy + 12, 3, 2);
    ctx.fillStyle = '#ff0000'; ctx.fillRect(wx + 7, wy + 12, 1, 1); // Pupil
    // Teeth/fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wx + 1, wy + 20, 2, 3); ctx.fillRect(wx + 4, wy + 20, 2, 2);
    // Ears (pointed)
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(wx + 3, wy + 6, 3, 5); ctx.fillRect(wx + 8, wy + 7, 3, 4);
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(wx + 4, wy + 7, 1, 3);
    // Legs (muscular)
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(wx + 6, wy + 24, 4, 6); ctx.fillRect(wx + 12, wy + 24, 4, 6);
    ctx.fillRect(wx + 20, wy + 24, 4, 6);
    // Paws
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(wx + 5, wy + 29, 6, 2); ctx.fillRect(wx + 11, wy + 29, 6, 2);
    ctx.fillRect(wx + 19, wy + 29, 6, 2);
    // Tail (bushy)
    ctx.fillStyle = '#6a5a4a'; ctx.fillRect(wx + 26, wy + 10, 5, 6);
    ctx.fillStyle = '#4a3a2a'; ctx.fillRect(wx + 28, wy + 12, 3, 3);

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

    // 16: GRASS (Clean Tibia-style - solid green with subtle variation)
    // Base green fill
    ctx.fillStyle = '#3a7a2a'; ctx.fillRect(0, r2, 32, 32);
    // Lighter green patches (subtle, seamless)
    ctx.fillStyle = '#4a8a3a';
    ctx.fillRect(2, r2 + 2, 6, 5); ctx.fillRect(16, r2 + 4, 8, 6);
    ctx.fillRect(6, r2 + 16, 10, 8); ctx.fillRect(22, r2 + 20, 8, 8);
    ctx.fillRect(4, r2 + 26, 6, 4);
    // Darker green shadows (very subtle)
    ctx.fillStyle = '#2a6a1a';
    ctx.fillRect(12, r2 + 8, 4, 4); ctx.fillRect(24, r2 + 10, 4, 4);
    ctx.fillRect(8, r2 + 22, 4, 4); ctx.fillRect(18, r2 + 14, 4, 4);
    // Tiny grass blade highlights
    ctx.fillStyle = '#5a9a4a';
    ctx.fillRect(4, r2 + 4, 1, 2); ctx.fillRect(18, r2 + 6, 1, 2);
    ctx.fillRect(8, r2 + 18, 1, 2); ctx.fillRect(24, r2 + 22, 1, 2);

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

    // 30: IRON ARMOR / CHESTPLATE (Use for generic Armor icon)
    // Silvery chestplate shape
    ctx.fillStyle = '#889';
    ctx.beginPath();
    ctx.moveTo(192 + 8, r3 + 4);
    ctx.lineTo(192 + 24, r3 + 4); // Shoulders
    ctx.lineTo(192 + 22, r3 + 26); // Waist
    ctx.lineTo(192 + 10, r3 + 26);
    ctx.fill();
    // Shinier highlight
    ctx.fillStyle = '#ccd';
    ctx.fillRect(192 + 12, r3 + 8, 8, 8); // Breastplate shine
    // Trim
    ctx.strokeStyle = '#556'; ctx.lineWidth = 1;
    ctx.strokeRect(192 + 8, r3 + 4, 16, 22);

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

    // 34: TREE (Tall Sprite - 32x64, Distinct darker blue-green foliage)
    const tx = 64;
    const ty = 128; // Row 4

    // Trunk (Base) with bark texture - make more prominent
    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(tx + 10, ty + 44, 12, 20);
    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(tx + 12, ty + 46, 4, 16);
    ctx.fillStyle = '#4a2a0a'; ctx.fillRect(tx + 18, ty + 48, 3, 12);

    // Shadow on ground
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(tx + 16, ty + 62, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Foliage (Darker blue-green to contrast with grass)
    // Bottom tier - very dark
    ctx.fillStyle = '#0a3a2a';
    ctx.beginPath(); ctx.moveTo(tx + 16, ty + 22); ctx.lineTo(tx + 31, ty + 52); ctx.lineTo(tx + 1, ty + 52); ctx.fill();
    // Leaf clusters
    ctx.fillStyle = '#1a4a3a';
    ctx.fillRect(tx + 4, ty + 40, 8, 8); ctx.fillRect(tx + 20, ty + 42, 8, 7);
    ctx.fillRect(tx + 10, ty + 36, 10, 8);

    // Mid tier
    ctx.fillStyle = '#1a5a4a';
    ctx.beginPath(); ctx.moveTo(tx + 16, ty + 8); ctx.lineTo(tx + 29, ty + 36); ctx.lineTo(tx + 3, ty + 36); ctx.fill();
    // Leaf texture
    ctx.fillStyle = '#2a6a5a';
    ctx.fillRect(tx + 6, ty + 26, 6, 6); ctx.fillRect(tx + 18, ty + 24, 7, 6);
    ctx.fillRect(tx + 11, ty + 18, 8, 7);

    ctx.fillStyle = '#3a9a8a';
    ctx.fillRect(tx + 11, ty + 2, 5, 5); ctx.fillRect(tx + 16, ty + 6, 5, 5);

    // Dark shadow details
    ctx.fillStyle = '#0a2a1a';
    ctx.fillRect(tx + 4, ty + 42, 3, 4); ctx.fillRect(tx + 24, ty + 38, 3, 5);

    // 36: CLUB (Row 4, Col 4 - 128, 128)
    const cx = 128; const cy = 128;
    // Handle
    ctx.fillStyle = '#864'; ctx.fillRect(cx + 14, cy + 16, 4, 14);
    // Head (Spiked)
    ctx.fillStyle = '#642'; ctx.fillRect(cx + 10, cy + 4, 12, 12);
    // Spikes
    ctx.fillStyle = '#bbb';
    ctx.fillRect(cx + 8, cy + 8, 2, 4); ctx.fillRect(cx + 22, cy + 8, 2, 4);
    ctx.fillRect(cx + 14, cy + 2, 4, 2);

    // --- ROW 5: DEEP FOREST (37-44) ---
    const r5y = 160;

    // 37: PINE TREE (Dark Forest)
    const ptx = 0; const pty = r5y;
    // Trunk
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(ptx + 12, pty + 48, 8, 16);
    // Foliage (Dark Pine Needle layers)
    ctx.fillStyle = '#1a3a1a'; // Darkest bottom
    ctx.beginPath(); ctx.moveTo(ptx + 4, pty + 50); ctx.lineTo(ptx + 28, pty + 50); ctx.lineTo(ptx + 16, pty + 20); ctx.fill();
    ctx.fillStyle = '#2a4a2a'; // Mid
    ctx.beginPath(); ctx.moveTo(ptx + 6, pty + 36); ctx.lineTo(ptx + 26, pty + 36); ctx.lineTo(ptx + 16, pty + 10); ctx.fill();
    ctx.fillStyle = '#3a5a3a'; // Top
    ctx.beginPath(); ctx.moveTo(ptx + 8, pty + 22); ctx.lineTo(ptx + 24, pty + 22); ctx.lineTo(ptx + 16, pty + 0); ctx.fill();

    // 38: BEAR (Brown, bulky)
    const bx = 32; const by = r5y;
    ctx.fillStyle = '#5a3a1a'; // Fur
    ctx.fillRect(bx + 4, by + 10, 24, 16); // Body
    ctx.fillRect(bx + 6, by + 2, 12, 10); // Head
    ctx.fillRect(bx + 2, by + 2, 4, 4); ctx.fillRect(bx + 16, by + 2, 4, 4); // Ears
    ctx.fillRect(bx + 6, by + 24, 6, 8); ctx.fillRect(bx + 20, by + 24, 6, 8); // Legs
    // Face
    ctx.fillStyle = '#000'; ctx.fillRect(bx + 8, by + 6, 2, 2);
    ctx.fillStyle = '#3a1a0a'; ctx.fillRect(bx + 14, by + 6, 4, 4); // Snout

    // 39: SPIDER (Black/Red, creepy)
    const spx = 64; const spy = r5y;
    ctx.fillStyle = '#222'; // Body
    ctx.beginPath(); ctx.ellipse(spx + 16, spy + 16, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
    // Legs
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const lo = (i < 2 ? -1 : 1);
        ctx.beginPath(); ctx.moveTo(spx + 16, spy + 16); ctx.lineTo(spx + 16 + (lo * 12), spy + 8 + (i * 6)); ctx.stroke();
    }
    // Eyes (Red glowing)
    ctx.fillStyle = '#f00'; ctx.fillRect(spx + 14, spy + 12, 2, 2); ctx.fillRect(spx + 17, spy + 12, 2, 2);

    // 40: BANDIT (Hooded)
    const bdx = 96; const bdy = r5y;
    drawHumanoid(96, r5y, '#db9', '#333', '#111', null, '#522', 'dagger');
    // Hood
    ctx.fillStyle = '#222';
    ctx.fillRect(bdx + 10, bdy, 12, 8);
    // Bandana mask
    ctx.fillStyle = '#a22';
    ctx.fillRect(bdx + 11, bdy + 8, 10, 4);

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
    HUNTER: 4,
    GUARD: 5,
    PRIEST: 6,

    // Enemies
    SKELETON: 8,
    ORC: 9,
    WOLF: 12,
    GHOST: 10,
    SLIME: 11,
    ZOMBIE: 13,
    BEAR: 38,
    SPIDER: 39,
    BANDIT: 40,

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
    PINE_TREE: 37,

    // Items
    SWORD: 26,
    POTION: 27,
    COIN: 28,
    WOODEN_SWORD: 31,
    WOODEN_SHIELD: 33,
    NOBLE_SWORD: 32,
    AXE: 35,
    CLUB: 36,

    // Other
    KNIGHT: 30, // Using Shield as "Knight" icon for armor for now? Or keep it generic map icon

    // Effects
    FIREBALL: 29,
    SPARKLE: 29,
    BLOOD: 29,
    GRAVE: 22
};

// Generate Sprites on Load
drawPixelArt();
