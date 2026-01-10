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

        // PIXEL ART SHARPNESS LOCK
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.globalAlpha = 1.0; // Force Opacity

        // Clear Screen
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, screenWidth, screenHeight);

        // Calculate Camera Position (Centered on Player)
        const camX = Math.floor((player.x * TILE_SIZE) - (screenWidth / 2) + (TILE_SIZE / 2));
        const camY = Math.floor((player.y * TILE_SIZE) - (screenHeight / 2) + (TILE_SIZE / 2));

        // Calculate visible range
        const startCol = Math.floor(Math.max(0, camX / TILE_SIZE));
        const endCol = Math.floor(Math.min(map.width, (camX + screenWidth) / TILE_SIZE + 1));
        const startRow = Math.floor(Math.max(0, camY / TILE_SIZE));
        const endRow = Math.floor(Math.min(map.height, (camY + screenHeight) / TILE_SIZE + 1));

        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const tile = map.getTile(c, r);
                if (!tile) continue;

                const drawX = Math.floor(c * TILE_SIZE - camX);
                const drawY = Math.floor(r * TILE_SIZE - camY);

                // ITERATE STACK: Bottom (0) -> Top
                for (let i = 0; i < tile.items.length; i++) {
                    const item = tile.items[i];

                    // JITTER FIX: If this is the Player, use their SMOOTH coordinates
                    const isPlayer = (item.id === 0);

                    let finalX = drawX;
                    let finalY = drawY;

                    if (isPlayer) {
                        finalX = Math.floor(player.x - camX);
                        finalY = Math.floor(player.y - camY);
                    }

                    // Try to get sprite
                    const sprite = assetManager.getSpriteSource(item.id);

                    if (sprite) {
                        // Handle Tall Sprites
                        const offset = sprite.sh - TILE_SIZE;

                        // STANDARD DRAW (64x64 UPSCALE)
                        // All sprites are drawn 64x64 (2x Zoom) for Sharpness
                        this.ctx.drawImage(
                            sprite.image,
                            sprite.sx, sprite.sy, sprite.sw, sprite.sh,
                            finalX, finalY - offset, 64, 64
                        );
                    } else {
                        // Fallback Rendering
                        this.ctx.fillStyle = '#ff00ff'; // Pink background
                        this.ctx.fillRect(drawX, drawY, 64, 64);
                    }

                    // Draw Count if stacked > 1
                    if (item.count > 1) {
                        this.ctx.font = '10px monospace';
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.textAlign = 'right';
                        this.ctx.fillText(item.count.toString(), drawX + TILE_SIZE - 2, drawY + TILE_SIZE - 2);
                    }
                }
            }
        }

        // Draw Player
        const pDrawX = Math.floor(player.x * TILE_SIZE - camX);
        const pDrawY = Math.floor(player.y * TILE_SIZE - camY);

        const pSprite = assetManager.getSpriteSource(player.spriteId);

        if (pSprite) {
            // Animation Frame Offset
            // STRIDE UPDATE: User Calibration says 48px width, so stride is likely 48
            // Animation Frame Offset
            // STRIDE UPDATE: Reverted to 32px (Standard)
            const frameOffset = (player.frame || 0) * 32;
            const offset = pSprite.sh - TILE_SIZE;
            const destY = pDrawY - offset;

            this.ctx.save();
            if (player.flipX) {
                // Flip Left
                this.ctx.translate(pDrawX + 64, destY);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(pSprite.image, pSprite.sx + frameOffset, pSprite.sy, pSprite.sw, pSprite.sh, 0, 0, 64, 64); // Upscaled Height
            } else {
                // Normal
                this.ctx.drawImage(pSprite.image, pSprite.sx + frameOffset, pSprite.sy, pSprite.sw, pSprite.sh, pDrawX, destY, 64, 64); // Upscaled Height
            }
            this.ctx.restore();
        } else {
            // Fallback Box
            this.ctx.fillStyle = '#3fb950';
            this.ctx.fillRect(pDrawX + 4, pDrawY + 4, 64 - 8, 64 - 8);
        }

    }
}
