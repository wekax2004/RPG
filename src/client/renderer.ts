import { WorldMap } from '../core/map';
import { TILE_SIZE } from '../core/types';
import { Player } from '../core/player';
import { assetManager } from '../assets';
import { damageTextManager } from './damage_text';
import { Tint } from '../components';

// Define RenderItem type based on its usage in the original code
type RenderItem = { y: number, draw: () => void, debugId?: string };

export class PixelRenderer {
    canvas: HTMLCanvasElement;
    scale: number = 1;
    private hasLogged: boolean = false; // Debug flag
    private loggedMissing: Record<number, boolean> = {}; // Track missing sprites to avoid log spam
    private ctx: CanvasRenderingContext2D;
    private renderList: RenderItem[] = [];
    private scratchCanvas: HTMLCanvasElement;
    private scratchCtx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
        this.ctx.imageSmoothingEnabled = false;

        // Scratch Canvas for Tinting
        this.scratchCanvas = document.createElement('canvas');
        this.scratchCanvas.width = 128; // Max sprite size
        this.scratchCanvas.height = 128;
        this.scratchCtx = this.scratchCanvas.getContext('2d')!;
        this.scratchCtx.imageSmoothingEnabled = false;
    }

    getScale(): number {
        return this.scale;
    }

    // RENDERABLE SORTING STRUCTURE
    // We collect all items, entities, and player into this list
    // then sort by Y coordinate before drawing.
    private renderList: Array<{ y: number, draw: () => void }> = [];

    draw(map: WorldMap, player: Player, visibleEntities: any[] = [], world: any = null) {
        const screenWidth = this.canvas.width;
        const screenHeight = this.canvas.height;
        // TIBIA GREEN BACKGROUND: Masks gaps in "jagged" grass tiles
        this.ctx.fillStyle = '#426829'; // Tibia Grass Green
        this.ctx.fillRect(0, 0, screenWidth, screenHeight);

        // PIXEL ART MODE: Disable Smoothing (Fixes "Blurry" sprites)
        this.ctx.imageSmoothingEnabled = false;

        const pX = player ? player.x : 0;
        const pY = player ? player.y : 0;
        const camX = Math.floor((pX * TILE_SIZE) - (screenWidth / 2) + (TILE_SIZE / 2));
        const camY = Math.floor((pY * TILE_SIZE) - (screenHeight / 2) + (TILE_SIZE / 2));

        const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
        const endCol = Math.min(map.width, Math.ceil((camX + screenWidth) / TILE_SIZE) + 1);
        const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
        const endRow = Math.min(map.height, Math.ceil((camY + screenHeight) / TILE_SIZE) + 1);

        // STEP 1: Draw Floor (Always Bottom)
        // STEP 1: Draw Floor (Always Bottom)
        // Check sprite existence and size to decide if we skip (Tall objects draw later)

        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                if (c >= 0 && c < map.width && r >= 0 && r < map.height) {
                    const idx = r * map.width + c;
                    const tile = map.tiles[idx];
                    if (tile && tile.items.length > 0) {
                        const itemId = tile.items[0].id;
                        // Check Height
                        const rect = assetManager.getSpriteRect(itemId);
                        const isTall = rect.h > 32;

                        // Only draw as floor if NOT tall
                        if (!isTall) {
                            this.drawItem(itemId, c, r, camX, camY);
                        }
                    }
                }
            }
        }

        // STEP 2: Collect Sortables (Layer 1 Items, Entities, Player, Tall Layer 0 Items)
        this.renderList = [];

        // A. World Items
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                if (c >= 0 && c < map.width && r >= 0 && r < map.height) {
                    const idx = r * map.width + c;
                    const tile = map.tiles[idx];
                    if (tile && tile.items.length > 0) {
                        // Check ALL items
                        for (let i = 0; i < tile.items.length; i++) {
                            const itemId = tile.items[i].id;
                            const rect = assetManager.getSpriteRect(itemId);
                            const isTall = rect.h > 32;

                            // If it's tall OR it's a stacked item (index > 0), add to sort list
                            if (isTall || i > 0) {
                                this.renderList.push({
                                    y: (r + 1) * TILE_SIZE, // Base of the tile
                                    draw: () => this.drawItem(itemId, c, r, camX, camY),
                                    debugId: isTall ? "TALL_OBJ" : "OBJ"
                                } as any);
                            }
                        }
                    }
                }
            }
        }

        // B. Entities (Mobs)
        visibleEntities.forEach(ent => {
            const baseX = Math.round(ent.x - camX);
            const baseY = Math.round(ent.y - camY);
            // Sort Key: Entity Y + Height (approx 32)
            this.renderList.push({
                y: ent.y * TILE_SIZE + 32,
                draw: () => {
                    const tint = ent.tint;
                    const sprite = assetManager.getSpriteSource(ent.spriteIndex);
                    if (sprite && sprite.image) {
                        // 2.5D Projection using sprite source
                        const ratio = sprite.sh / sprite.sw;
                        const dstW = TILE_SIZE;
                        const dstH = Math.round(TILE_SIZE * ratio);
                        const verticalOffset = dstH - TILE_SIZE;
                        const drawY = baseY - verticalOffset;

                        let renderSource: CanvasImageSource = sprite.image;
                        let sx = sprite.sx;
                        let sy = sprite.sy;
                        let sw = sprite.sw;
                        let sh = sprite.sh;

                        if (tint) {
                            // CLEAR scratch
                            this.scratchCtx.clearRect(0, 0, sw, sh);
                            // DRAW sprite
                            this.scratchCtx.globalCompositeOperation = 'source-over';
                            this.scratchCtx.drawImage(sprite.image, sx, sy, sw, sh, 0, 0, sw, sh);
                            // TINT
                            this.scratchCtx.globalCompositeOperation = 'source-atop';
                            this.scratchCtx.fillStyle = tint.color;
                            this.scratchCtx.fillRect(0, 0, sw, sh);

                            // Use Scratch
                            renderSource = this.scratchCanvas;
                            sx = 0; sy = 0;
                        }

                        this.ctx.globalAlpha = 1.0;
                        this.ctx.drawImage(
                            renderSource,
                            sx, sy, sw, sh,
                            baseX, drawY,
                            dstW, dstH
                        );

                        // --- EQUIPMENT OVERLAY ---
                        if ((ent as any).equipment) { // Use type assertion or access directly
                            const eq = (ent as any).equipment;
                            const slots = ['body', 'head', 'lhand', 'rhand']; // Draw Order
                            slots.forEach((slot: string) => {
                                const itemSpriteId = eq[slot];
                                if (itemSpriteId) {
                                    const iSprite = assetManager.getSpriteSource(itemSpriteId);
                                    if (iSprite && iSprite.image) {
                                        const iDstW = TILE_SIZE;
                                        const iDstH = Math.round(TILE_SIZE * (iSprite.sh / iSprite.sw));

                                        // Align Bottoms to match 2.5D Entity
                                        const iDrawY = (drawY + dstH) - iDstH;

                                        this.ctx.drawImage(
                                            iSprite.image,
                                            iSprite.sx, iSprite.sy, iSprite.sw, iSprite.sh,
                                            baseX, iDrawY,
                                            iDstW, iDstH
                                        );
                                    }
                                }
                            });
                        }

                        // NAME & HEALTH BAR
                        if (ent.name) {
                            this.ctx.font = '10px monospace';
                            this.ctx.textAlign = 'center';
                            const cx = baseX + 16;
                            const cy = drawY - 12;

                            // Name
                            this.ctx.fillStyle = '#000';
                            this.ctx.fillText(ent.name, cx + 1, cy + 1);
                            this.ctx.fillStyle = '#fff'; // Green? No, white for name
                            if (ent.tint) this.ctx.fillStyle = ent.tint.color; // Match tint? No, stick to white/green
                            this.ctx.fillStyle = '#0f0'; // Tibia Green Names
                            this.ctx.fillText(ent.name, cx, cy);

                            // Health Bar
                            if (ent.health) {
                                const pct = ent.health.current / ent.health.max;
                                const barW = 26;
                                const barH = 4;
                                const bx = cx - barW / 2;
                                const by = cy + 2;

                                // Bg
                                this.ctx.fillStyle = '#000';
                                this.ctx.fillRect(bx, by, barW, barH);
                                // Fg
                                const hpColor = pct > 0.5 ? '#0f0' : (pct > 0.2 ? '#ff0' : '#f00');
                                this.ctx.fillStyle = hpColor;
                                this.ctx.fillRect(bx + 1, by + 1, (barW - 2) * pct, barH - 2);
                            }
                        }
                    } else {
                        // DEBUG: Log first few failures
                        if (Math.random() < 0.01) console.warn(`[Renderer] Missing Sprite Image for Entity ID ${ent.spriteIndex}. Obj:`, sprite);
                        this.ctx.fillStyle = '#ff0000';
                        this.ctx.fillRect(baseX, baseY, 32, 32);
                    }

                    // --- TARGET INDICATOR ---
                    if ((ent as any).isTarget) {
                        this.ctx.strokeStyle = '#ff0000';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(baseX - 1, drawY, 32 + 2, Math.round(TILE_SIZE * (sprite ? sprite.sh / sprite.sw : 1)));
                        // Also a small marker above head?
                        this.ctx.fillStyle = '#ff0000';
                        this.ctx.beginPath();
                        this.ctx.moveTo(baseX + 16, drawY - 4);
                        this.ctx.lineTo(baseX + 12, drawY - 10);
                        this.ctx.lineTo(baseX + 20, drawY - 10);
                        this.ctx.fill();
                    }
                },
                debugId: "ENTITY"
            });
        });

        // C. Player (The Hero)
        const pScreenX = Math.floor(pX * TILE_SIZE - camX);
        const pScreenY = Math.floor(pY * TILE_SIZE - camY);


        // Check Player Sprite Height for offset
        // Assuming player matches current logic, but let's be safe inside renderPlayer or here.
        // renderPlayer handles drawing, but we need sort key.

        this.renderList.push({
            y: (pY + 1) * TILE_SIZE - 4, // Player feet
            draw: () => this.renderPlayer(this.ctx, player, pScreenX, pScreenY),
            debugId: "PLAYER"
        } as any);

        // STEP 3: SORT & EXECUTE

        // STEP 3: SORT & EXECUTE
        // Sort ascending by Y (lower Y draws first/behind, higher Y draws last/front)
        this.renderList.sort((a, b) => a.y - b.y);

        this.renderList.forEach(item => item.draw());

        // STEP 4: Render Floating Text (Always Top)
        damageTextManager.render(this.ctx, camX, camY);
    }

    // Deprecated renderLayer (Kept empty or removed, replaced by loop above)
    // We can remove it to clean up.
    private noOp() { }

    private spyItem: boolean = false;

    private drawItem(id: number, tx: number, ty: number, camX: number, camY: number) {
        // Reset Alpha (Safety)
        this.ctx.globalAlpha = 1.0;

        const drawX = Math.round(tx * TILE_SIZE - camX);
        const baseY = Math.round(ty * TILE_SIZE - camY);

        const sprite = assetManager.getSpriteSource(id);

        if (sprite) {
            // 2.5D PROJECTION FIX:
            // For 32x64 sprites (walls), we must:
            // 1. Use the ACTUAL sprite height (not force 32x32)
            // 2. Apply vertical offset so sprite "stands" on the tile

            // Calculate destination size from source sprite
            // For procedural 32x64 walls: sw=32, sh=64
            // We want dstW=32, dstH=64 (1:1 pixel ratio for our procedural sprites)
            const dstW = TILE_SIZE; // Always 32px wide

            // Calculate height: Use sprite aspect ratio
            // For 32x64 source: ratio = 64/32 = 2.0, so dstH = 32 * 2 = 64
            const ratio = sprite.sh / sprite.sw;
            const dstH = Math.round(TILE_SIZE * ratio);

            // THE VERTICAL OFFSET (The Key to 2.5D):
            // Formula: drawY = baseY - (spriteHeight - 32)
            // This makes tall sprites "stand" on the tile, projecting upward
            const verticalOffset = dstH - TILE_SIZE;
            const drawY = baseY - verticalOffset;


            this.ctx.drawImage(
                sprite.image,
                sprite.sx, sprite.sy, sprite.sw, sprite.sh,
                drawX, drawY,
                dstW, dstH
            );
        } else {
            // Fallback Debug Box
            if (id !== 0) {
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.fillRect(drawX, baseY, 32, 32);
            }
        }
    }

    public renderPlayer(ctx: CanvasRenderingContext2D, player: Player, screenX: number, screenY: number) {
        ctx.globalAlpha = 1.0; // Reset Alpha

        // Force Override Checking
        if (player.spriteId !== 199) {
            console.warn(`[Renderer] Player Sprite ID was ${player.spriteId}, FORCING 199`);
            player.spriteId = 199;
        }

        // Get player sprite using unified system
        const sprite = assetManager.getSpriteSource(player.spriteId);

        if (!sprite || !sprite.image) return;

        // 2.5D PROJECTION FIX for Player:
        // Player sprites are 32x64, same as walls
        const TILE_SIZE = 32;
        const ratio = sprite.sh / sprite.sw;  // For 32x64: ratio = 2.0
        const dstW = TILE_SIZE;  // Always 32px wide
        const dstH = Math.round(TILE_SIZE * ratio);  // 64px for tall player

        // Vertical Offset: Player "stands" on the tile, head projects up
        // Formula: drawY = screenY - (dstH - TILE_SIZE)
        const verticalOffset = dstH - TILE_SIZE;
        const drawY = screenY - verticalOffset;

        ctx.drawImage(
            sprite.image,
            sprite.sx, sprite.sy, sprite.sw, sprite.sh,
            screenX, drawY,
            dstW, dstH
        );
    }
    private hasLoggedPlayer = false;

    public drawEntities(entities: any[], camX: number, camY: number) {
        const screenWidth = this.canvas.width;
        const screenHeight = this.canvas.height;

        entities.forEach(ent => {
            const baseX = Math.round(ent.x - camX);
            const baseY = Math.round(ent.y - camY);

            if (baseX < -64 || baseX > screenWidth || baseY < -64 || baseY > screenHeight) return;

            // Use unified sprite source for entities
            const sprite = assetManager.getSpriteSource(ent.spriteIndex);

            if (sprite && sprite.image) {
                // 2.5D Projection for entities
                const ratio = sprite.sh / sprite.sw;
                const dstW = TILE_SIZE;
                const dstH = Math.round(TILE_SIZE * ratio);
                const verticalOffset = dstH - TILE_SIZE;
                const drawY = baseY - verticalOffset;

                this.ctx.drawImage(
                    sprite.image,
                    sprite.sx, sprite.sy, sprite.sw, sprite.sh,
                    baseX, drawY,
                    dstW, dstH
                );
            } else {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(baseX, baseY, 32, 32);
            }
        });
    }

    // Hit Detection Helper
    public getObjectAt(map: WorldMap, player: Player, worldX: number, worldY: number) {
        const centerC = Math.floor(worldX / TILE_SIZE);
        const centerR = Math.floor(worldY / TILE_SIZE);

        for (let r = centerR + 1; r >= centerR - 1; r--) {
            for (let c = centerC + 1; c >= centerC - 1; c--) {
                const tile = map.getTile(c, r);
                if (!tile || tile.items.length === 0) continue;

                for (let i = tile.items.length - 1; i >= 0; i--) {
                    const item = tile.items[i];
                    // Strict Grid Match for now
                    const itemWorldX = c * TILE_SIZE;
                    const itemWorldY = r * TILE_SIZE;

                    if (
                        worldX >= itemWorldX &&
                        worldX < itemWorldX + 32 &&
                        worldY >= itemWorldY &&
                        worldY < itemWorldY + 32
                    ) {
                        return { x: c, y: r, item: item, stackIndex: i };
                    }
                }
            }
        }
        return null;
    }
}
