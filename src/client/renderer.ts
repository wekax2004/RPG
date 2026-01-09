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
    }

    getScale(): number {
        return this.scale;
    }

    draw(map: WorldMap, player: Player) {
        const screenWidth = this.canvas.width;
        const screenHeight = this.canvas.height;

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

                    // Try to get sprite
                    const sprite = assetManager.getSpriteSource(item.id);

                    if (sprite) {
                        this.ctx.drawImage(
                            sprite.image,
                            sprite.sx, sprite.sy, TILE_SIZE, TILE_SIZE, // Source (Force 32x32 for now)
                            drawX, drawY, TILE_SIZE, TILE_SIZE          // Dest
                        );
                    } else {
                        // Fallback Rendering
                        if (item.id === 16) { // Grass
                            this.ctx.fillStyle = '#2dba4e';
                        } else if (item.id === 17) { // Wall
                            this.ctx.fillStyle = '#6e7681';
                        } else {
                            this.ctx.fillStyle = '#ff0000';
                        }
                        this.ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
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
            this.ctx.save();
            if (player.flipX) {
                // Flip Logic: Scale(-1, 1) and translate coordinate
                this.ctx.translate(pDrawX + TILE_SIZE, pDrawY);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(pSprite.image, pSprite.sx, pSprite.sy, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
            } else {
                this.ctx.drawImage(pSprite.image, pSprite.sx, pSprite.sy, TILE_SIZE, TILE_SIZE, pDrawX, pDrawY, TILE_SIZE, TILE_SIZE);
            }
            this.ctx.restore();
        } else {
            // Fallback Box
            this.ctx.fillStyle = '#3fb950'; // Player Color
            this.ctx.fillRect(pDrawX + 4, pDrawY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        }
    }
}
