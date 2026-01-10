import { WorldMap } from '../core/map';
import { TILE_SIZE } from '../core/types';
import { Player } from '../core/player';
import { assetManager } from '../assets';

export class PixelRenderer {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    scale: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        // Disable smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;

        // Force Resolution (Canvas Size Fix)
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    getScale(): number {
        return this.scale;
    }

    draw(map: WorldMap, player: Player) {
        const screenWidth = this.canvas.width;
        const screenHeight = this.canvas.height;

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.globalAlpha = 1.0;
        // Clear Screen (Dark Green)
        this.ctx.fillStyle = '#1e331e';
        this.ctx.fillRect(0, 0, screenWidth, screenHeight);

        // Camera Calculation
        const camX = Math.round((player.x * TILE_SIZE) - (screenWidth / 2) + (TILE_SIZE / 2));
        const camY = Math.round((player.y * TILE_SIZE) - (screenHeight / 2) + (TILE_SIZE / 2));

        const startCol = Math.floor(Math.max(0, camX / TILE_SIZE));
        const endCol = Math.floor(Math.min(map.width, (camX + screenWidth) / TILE_SIZE + 1));
        const startRow = Math.floor(Math.max(0, camY / TILE_SIZE)) - 1; // Buffer for tall objects above
        const endRow = Math.floor(Math.min(map.height, (camY + screenHeight) / TILE_SIZE + 2)); // Buffer for sorting

        const playerVisualRow = Math.round(player.y);

        // Z-SORTED RENDER LOOP (Row by Row)
        for (let r = startRow; r < endRow; r++) {

            // 1. Draw Floor & Decor (Layer 0)
            for (let c = startCol; c < endCol; c++) {
                if (r < 0 || r >= map.height) continue;
                const tile = map.getTile(c, r);
                if (!tile) continue;

                const drawX = Math.round(c * TILE_SIZE - camX);
                const drawY = Math.round(r * TILE_SIZE - camY);

                // Render floor items FIRST
                for (const item of tile.items) {
                    // Skip 'Tall' items here? No, we just exclude Player.
                    // Ideally we should distinguish "Floor" vs "Object"
                    // Hack: ID 0=Player. ID 17=Wall (Tall). ID 5=Tree (Tall).

                    if (item.id === 0) continue; // Skip Player (handled specifically)

                    const sprite = assetManager.getSpriteSource(item.id);
                    if (sprite) {
                        // Tall Object Logic is baked into drawY offset
                        const tallOffset = sprite.sh - 32;

                        // FIX: seamless tiles & connected walls
                        // We use "Aggressive Overlap" to hide texture borders and connect pillars.

                        const isFloor = sprite.sh === 32;

                        // Floor: Overlap all sides to hide grid gaps
                        // Wall: Overlap width to connect pillars, keep height strict
                        const dilateX = 1; // -1 to +2 (Total 2px extra width)
                        const dilateY = isFloor ? 1 : 0; // Only dilate floors vertically

                        // Draw Position: x - 1, y - 1
                        // Draw Size: w + 2, h + 2

                        this.ctx.drawImage(
                            sprite.image,
                            sprite.sx, sprite.sy, sprite.sw, sprite.sh,
                            drawX - dilateX, drawY - tallOffset - dilateY,
                            sprite.sw + (dilateX * 2), sprite.sh + (dilateY * 2)
                        );
                    } else {
                        this.ctx.fillStyle = '#ff00ff';
                        this.ctx.fillRect(drawX, drawY, 32, 32);
                    }
                }
            }

            // 2. Draw Player? 
            // If the player is structurally "standing" on this row, draw them now.
            // This ensures they are drawn AFTER this row's floor/walls (standing on top),
            // but BEFORE the next row's walls (which will cover their head).
            if (r === playerVisualRow) {
                this.drawPlayer(player, camX, camY);
            }
        }
    }

    private drawPlayer(player: Player, camX: number, camY: number) {
        const pDrawX = Math.floor(player.x * TILE_SIZE - camX);
        const pDrawY = Math.floor(player.y * TILE_SIZE - camY);
        const pSprite = assetManager.getSpriteSource(player.spriteId);

        if (pSprite) {
            const frameOffset = (player.frame || 0) * 32;
            const offset = pSprite.sh - 32;
            const destY = pDrawY - offset;

            this.ctx.save();
            if (player.flipX) {
                this.ctx.translate(pDrawX + pSprite.sw, destY);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(pSprite.image, pSprite.sx + frameOffset, pSprite.sy, pSprite.sw, pSprite.sh, 0, 0, pSprite.sw, pSprite.sh);
            } else {
                this.ctx.drawImage(pSprite.image, pSprite.sx + frameOffset, pSprite.sy, pSprite.sw, pSprite.sh, pDrawX, destY, pSprite.sw, pSprite.sh);
            }
            this.ctx.restore();
        } else {
            this.ctx.fillStyle = '#3fb950';
            this.ctx.fillRect(pDrawX + 4, pDrawY + 4, 32 - 8, 32 - 8);
        }
    }
}
