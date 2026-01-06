
export const spriteSheet = new Image();
// spriteSheet.src = '/sprites.png'; // DISABLED: suspected bad file

const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128; // 8x8 grid of 16px sprites

function generateSpriteSheet() {
    console.log("Generating Procedural Sprites...");
    const ctx = canvas.getContext('2d')!;
    // Colors
    const drawTile = (idx: number, color: string, icon?: (ctx: CanvasRenderingContext2D, x: number, y: number) => void) => {
        const x = (idx % 8) * 16;
        const y = Math.floor(idx / 8) * 16;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 16, 16);
        if (icon) icon(ctx, x, y);
    };

    drawTile(0, '#0000', (c, x, y) => { c.fillStyle = '#33f'; c.fillRect(x + 4, y + 2, 8, 12); c.fillStyle = '#fc9'; c.fillRect(x + 5, y + 3, 6, 4); }); // Player
    drawTile(1, '#0000', (c, x, y) => { c.fillStyle = '#151'; c.fillRect(x + 2, y + 2, 12, 12); c.fillStyle = '#f00'; c.fillRect(x + 4, y + 5, 2, 2); c.fillRect(x + 10, y + 5, 2, 2); }); // Orc
    drawTile(2, '#0000', (c, x, y) => { c.fillStyle = '#a63'; c.fillRect(x + 4, y + 2, 8, 12); c.fillStyle = '#fc9'; c.fillRect(x + 5, y + 3, 6, 4); }); // NPC
    drawTile(3, '#0000', (c, x, y) => { c.fillStyle = '#888'; c.fillRect(x + 2, y + 6, 12, 8); c.fillRect(x + 10, y + 3, 5, 5); c.fillStyle = '#f00'; c.fillRect(x + 11, y + 4, 1, 1); }); // Wolf
    drawTile(4, '#0000', (c, x, y) => { c.fillStyle = '#ddd'; c.fillRect(x + 6, y + 2, 4, 4); c.fillRect(x + 7, y + 6, 2, 8); c.fillRect(x + 4, y + 6, 8, 2); c.fillRect(x + 5, y + 14, 2, 2); c.fillRect(x + 9, y + 14, 2, 2); }); // Skeleton
    drawTile(5, '#0000', (c, x, y) => { c.fillStyle = '#ccf'; c.globalAlpha = 0.7; c.fillRect(x + 4, y + 2, 8, 10); c.fillRect(x + 2, y + 8, 12, 6); c.globalAlpha = 1.0; c.fillStyle = '#000'; c.fillRect(x + 5, y + 4, 2, 2); c.fillRect(x + 9, y + 4, 2, 2); }); // Ghost
    drawTile(6, '#0000', (c, x, y) => { c.fillStyle = '#4f4'; c.beginPath(); c.arc(x + 8, y + 10, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#000'; c.fillRect(x + 6, y + 8, 1, 1); c.fillRect(x + 9, y + 8, 1, 1); }); // Slime

    drawTile(16, '#2a2', (c, x, y) => { c.fillStyle = '#4c4'; c.fillRect(x + 2, y + 2, 2, 2); }); // Grass
    drawTile(17, '#777', (c, x, y) => { c.fillStyle = '#555'; c.fillRect(x, y + 3, 16, 1); c.fillRect(x, y + 13, 16, 1); c.fillRect(x + 8, y + 3, 1, 5); }); // Wall
    drawTile(18, '#44f', (c, x, y) => { c.fillStyle = '#66f'; c.fillRect(x + 2, y + 4, 12, 2); }); // Water
    drawTile(19, '#752', (c, x, y) => { c.fillStyle = '#541'; c.fillRect(x, y + 4, 16, 1); }); // Wood
    drawTile(20, '#000', (c, x, y) => { c.fillStyle = '#444'; c.fillRect(x + 2, y + 2, 12, 12); c.fillStyle = '#777'; c.fillRect(x + 3, y + 3, 10, 2); c.fillRect(x + 4, y + 6, 8, 2); c.fillRect(x + 5, y + 9, 6, 2); }); // Stairs
    drawTile(21, '#0000', (c, x, y) => { c.strokeStyle = '#eee'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16, y + 16); c.moveTo(x + 16, y); c.lineTo(x, y + 16); c.stroke(); }); // Web
    drawTile(22, '#0000', (c, x, y) => { c.fillStyle = '#ccc'; c.fillRect(x + 6, y + 6, 4, 2); c.fillRect(x + 5, y + 5, 2, 2); c.fillRect(x + 9, y + 5, 2, 2); }); // Bones

    drawTile(23, '#445', (c, x, y) => { c.fillStyle = '#556'; c.fillRect(x + 1, y + 1, 14, 14); c.fillStyle = '#334'; c.fillRect(x, y, 16, 1); c.fillRect(x, y, 1, 16); }); // Stone Floor (Lev 1)
    drawTile(24, '#343', (c, x, y) => { c.fillStyle = '#454'; c.fillRect(x + 1, y + 1, 14, 14); c.fillStyle = '#232'; c.fillRect(x + 4, y + 4, 4, 4); c.fillRect(x + 10, y + 10, 2, 2); }); // Mossy Floor (Lev 2)
    drawTile(25, '#223', (c, x, y) => { c.fillStyle = '#334'; c.fillRect(x, y, 16, 16); c.fillStyle = '#112'; c.beginPath(); c.moveTo(x + 2, y + 2); c.lineTo(x + 14, y + 14); c.stroke(); }); // Dark Cracked (Lev 3)

    drawTile(32, '#0000', (c, x, y) => { c.fillStyle = '#f00'; c.beginPath(); c.arc(x + 8, y + 10, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ccc'; c.fillRect(x + 6, y + 3, 4, 3); }); // Potion
    drawTile(33, '#0000', (c, x, y) => { c.fillStyle = '#44a'; c.fillRect(x + 3, y + 3, 10, 10); c.fillStyle = '#ea0'; c.strokeRect(x + 3.5, y + 3.5, 9, 9); }); // Shield
    drawTile(34, '#0000', (c, x, y) => { c.fillStyle = '#aaa'; c.fillRect(x + 6, y + 2, 4, 10); c.fillStyle = '#420'; c.fillRect(x + 4, y + 10, 8, 2); }); // Sword
    drawTile(35, '#0000', (c, x, y) => { c.fillStyle = '#642'; c.beginPath(); c.arc(x + 8, y + 8, 6, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#853'; c.stroke(); c.fillStyle = '#999'; c.fillRect(x + 7, y + 7, 2, 2); }); // Wooden Shield
    drawTile(36, '#0000', (c, x, y) => { c.fillStyle = '#fd0'; c.fillRect(x + 6, y + 2, 4, 10); c.fillStyle = '#408'; c.fillRect(x + 4, y + 10, 8, 2); c.fillStyle = '#f0f'; c.fillRect(x + 7, y + 12, 2, 3); }); // Noble Sword
    drawTile(37, '#0000', (c, x, y) => { c.fillStyle = '#853'; c.fillRect(x + 6, y + 2, 4, 10); c.fillStyle = '#642'; c.fillRect(x + 4, y + 10, 8, 2); });
    drawTile(40, '#0000', (c, x, y) => { c.fillStyle = '#f40'; c.beginPath(); c.arc(x + 8, y + 8, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ff0'; c.beginPath(); c.arc(x + 8, y + 8, 2, 0, Math.PI * 2); c.fill(); }); // Fireball

    spriteSheet.src = canvas.toDataURL();
}

generateSpriteSheet();

export const SHEET_TILE_SIZE = 16;
export const SHEET_COLS = 8;
export const SPRITES = {
    PLAYER: 0, ORC: 1, NPC: 2, WOLF: 3, SKELETON: 4, GHOST: 5, SLIME: 6,
    GRASS: 16, WALL: 17, WATER: 18, WOOD: 19, STAIRS: 20, WEB: 21, BONES: 22,
    STONE: 23, MOSSY: 24, DARK: 25,
    POTION: 32, SHIELD: 33, SWORD: 34, WOODEN_SHIELD: 35, NOBLE_SWORD: 36, WOODEN_SWORD: 37,
    FIREBALL: 40
};
