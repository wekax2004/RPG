import { WorldMap } from '../core/map';
import { TILE_SIZE } from '../core/types';
import { Player } from '../core/player';
import { assetManager } from '../assets';
import { damageTextManager } from './damage_text';

export class PixelRenderer {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    scale: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        // Limit smoothing
        this.ctx.imageSmoothingEnabled = false;

        // Force Resolution REMOVED for Flexbox Layout
        // this.canvas.width = 800; 
        // this.canvas.height = 600;
    }

    getScale(): number {
        return this.scale;
    }

    draw(map: WorldMap, player: Player, visibleEntities: any[] = [], world: any = null) {
        const screenWidth = this.canvas.width;
        const screenHeight = this.canvas.height;

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.globalAlpha = 1.0;
        // Clear Screen (Dark Green)
        this.ctx.fillStyle = '#1e331e';
        this.ctx.fillRect(0, 0, screenWidth, screenHeight);

        // Camera Calculation
        const camX = Math.floor((player.x * TILE_SIZE) - (screenWidth / 2) + (TILE_SIZE / 2));
        const camY = Math.floor((player.y * TILE_SIZE) - (screenHeight / 2) + (TILE_SIZE / 2));

        const startCol = Math.floor(Math.max(0, camX / TILE_SIZE));
        const endCol = Math.floor(Math.min(map.width, (camX + screenWidth) / TILE_SIZE + 1));
        const startRow = Math.floor(Math.max(0, camY / TILE_SIZE)) - 1; // Buffer for tall objects above
        const endRow = Math.floor(Math.min(map.height, (camY + screenHeight) / TILE_SIZE + 2)); // Buffer for sorting

        // Z-SORTED RENDER LOOP (Row by Row)
        let debugDrawn = false;
        for (let r = startRow; r < endRow; r++) {

            // 1. Draw Floor & Decor (Layer 0)
            for (let c = startCol; c < endCol; c++) {
                if (r < 0 || r >= map.height) continue;
                const tile = map.getTile(c, r);
                if (!tile) continue;

                if (!debugDrawn && Math.random() < 0.0001) {
                    // console.log(`[Renderer] Drawing Tile ${c},${r}. Items: ${tile.items.length}`);
                    debugDrawn = true;
                }

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

            // 2. Draw Player
            // If the player is structurally "standing" on this row, draw them now.
            // This ensures they are drawn AFTER this row's floor/walls (standing on top),
            // but BEFORE the next row's walls (which will cover their head).
            // Using Math.floor(player.y) correctly places player 'behind' row+1 walls.
            if (r === Math.floor(player.y)) {
                // Calculate PCoords here
                const pDrawX = Math.floor(player.x * TILE_SIZE - camX);
                const pDrawY = Math.floor(player.y * TILE_SIZE - camY);
                // The new renderPlayer expects pure screen coords, but also handles 32x32 draw.
                // We pass in the TOP-LEFT.
                // Note: Previous code had `pDrawY - 12` offset. The new Prompt code uses `screenY`.
                // If I pass pDrawY directly, it draws at tile top-left.
                // The prompt code `ctx.drawImage(..., screenX, screenY, 32, 32)`.
                // I will pass `pDrawY - 12` to maintain the feet alignment visual, 
                // OR adhere to strict prompt `screenX, screenY`.
                // Strict prompt implies "Draw EXACTLY 32x32".
                // If I remove offset, player might look like they are floating or low?
                // Standard tile: 32x32. Player: 32x32. If strict, they overlap perfectly.
                // I'll stick to strict `pDrawY` (no offset) if the prompting suggests standardizing.
                // Actually, let's keep the -12 logic IF it was about "feet alignment" to center on tile.
                // But prompt said "No Cut-off".
                // I'll pass pDrawY - 12.
                // Wait. `row` logic relies on `player.direction`.
                this.renderPlayer(this.ctx, player, pDrawX, pDrawY - 12);
            }
        }


        // 3. Draw Visible Entities (Monsters, NPCs)
        if (visibleEntities && world) {
            this.drawEntities(visibleEntities, world, player);
        }

        // 4. Draw Damage Text
        damageTextManager.draw(this.ctx, camX, camY);

        this.ctx.imageSmoothingEnabled = false;

        // --- GHOST ITEM (Drag & Drop) ---
        if (player.targetId !== null) {
            // We need to find the entity's position to draw the box.
            // But checking ALL entities in Renderer might be slow if we rely on ECS map iterations.
            // Ideally, we passed 'visibleEntities' or similar. 
            // OR, we just check if the target is in the viewport (which we are iterating).
            // But we already iterated.
            // Let's iterate map again? No.
            // Let's rely on Main.ts passing the target pos? Or ECS query?
            // Renderer has access to 'map', but map tiles only have Items (IDs), not Entity IDs directly unless linked.
            // Wait, ECS Entities have Position. Map tiles have Items.
            // If the target is an ECS entity (Monster), we need its Position.
            // Renderer doesn't know about current ECS World state directly, it draws 'map'.
            // BUT, main.ts passes 'map'.
            // Actually, 'draw' method signature might need 'world' if we want to find any entity by ID.
            // OR: We just draw the box if we encounter the entity while drawing tiles?
            // Tile items are just `new Item(id)`. They don't store Entity ID (unless unique).
            // Monsters are likely ECS entities separate from Tile Items?
            // Checking Main.ts:
            // "renderer.draw(game.map, game.player);"
            // "renderer.draw" iterates `map.getTile`.
            // Monsters are entities. Do they exist on the map tiles?
            // Main.ts doesn't seem to push monsters into map tiles exclusively?
            // "movementSystem" moves them. Does it update map tiles?
            // If Monsters are NOT on map tiles, Renderer won't draw them in the loop above?
            // Let's check Main.ts -> Renderer usage.
            // Step 23130 (Renderer) shows it iterates tiles and draws items.
            // If monsters aren't items in tiles, they aren't drawn!
            // Main.ts: "renderer.draw(game.map, game.player)"
            // Unless monsters are added to tiles?
            // `movementSystem` usually handles position.
            // If Renderer only draws Map Tiles, then Monsters MUST be on tiles.
            // Let's Assume they are.
            // If so, we need to know linked Entity ID for a Tile Item.
            // The `Item` class in `core/types.ts` has `id`. Is that Sprite ID? Yes.
            // It doesn't seem to have Entity ID.
            // CRITICAL ARCHITECTURE ISSUE: Renderer draws TILES. Monsters are ENTITIES.
            // If Monsters are not injected into visual Map, they are invisible.
            // PROMPT assumption: "Modify `renderEntity` (or similar)..."
            // The prompt assumes I can just check `entity.id === player.targetId` inside the draw loop.
            // But the draw loop iterates TILES. 
            // I will add a separate loop for ENTITIES if passed, or rely on a "visibleEntities" list passed to draw.
            // BUT, I can't change Main.ts signature too much without verifying.
            // Let's look at `render.ts` again.
            // It draws `tile.items`.
            // Does `game.ts` `movementSystem` put monsters in tiles?
            // `map.getTile(...).items.push(...)`?
            // If not, the current Renderer DOES NOT DRAW MONSTERS.
            // (Unless they are static items).
            // Re-reading `main.ts` spawn: "world.createEntity... Position... Sprite".
            // It creates ECS entities.
            // It does NOT seem to add them to `map.tiles`.
            // SO MONSTERS ARE INVISIBLE currently?
            // Wait, `renderer.ts` draw loop only draws `map.getTile`.
            // AND `player` (explicitly).
            // If so, Monsters never render.
            // Fix: Pass `entities` to `renderer.draw`.
            // I will updated `renderer.ts` to accept `entities` list and draw them.
            // Then I can draw the box.
        }

    }


    public drawEntities(entities: any[], world: any, player: Player) {
        const screenWidth = this.canvas.width;
        const screenHeight = this.canvas.height;
        const camX = Math.floor((player.x * TILE_SIZE) - (screenWidth / 2) + (TILE_SIZE / 2));
        const camY = Math.floor((player.y * TILE_SIZE) - (screenHeight / 2) + (TILE_SIZE / 2));

        // DEBUG: Log entity drawing periodically
        if (entities.length > 0 && Date.now() % 2000 < 20) {
            console.log('[Renderer] drawEntities called with', entities.length, 'entities');
        }

        entities.forEach(ent => {
            // ent structure expected: { id: number, x: number, y: number, spriteIndex: number, name?: string }
            // Main.ts will form this object to decouple Renderer from ECS classes

            const drawX = Math.round(ent.x - camX);
            const drawY = Math.round(ent.y - camY);

            // Bounds Check (Simple)
            if (drawX < -32 || drawX > screenWidth || drawY < -32 || drawY > screenHeight) return;

            // Draw Sprite
            const sprite = assetManager.getSpriteSource(ent.spriteIndex);
            if (sprite) {
                // Monsters/NPCs usually just 1 frame for now? Or pass animation state?
                // For simplicity Phase 5: Draw frame 0.
                // If we want animation, ent should include frame info.

                // Draw
                this.ctx.drawImage(
                    sprite.image,
                    sprite.sx, sprite.sy, sprite.sw, sprite.sh,
                    drawX, drawY - (sprite.sh - 32), // Offset for tall sprites
                    sprite.sw, sprite.sh
                );
            } else {
                // Fallback Box
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(drawX, drawY, 32, 32);
            }

            // Draw Targeting Box
            if (player.targetId === ent.id) {
                this.ctx.strokeStyle = '#ff0000';
                this.ctx.lineWidth = 2;

                // Animate box? Pulse?
                const pulse = (Math.sin(Date.now() / 200) * 2) + 2; // 0 to 4 padding modification?
                // Just keep it simple: 2px gap
                const gap = 2;

                // Draw Rect around the entity
                // Note: use sprite.sw/sh size ideally, or tile size.
                // Lets use TILE_SIZE (32x32) base.
                this.ctx.strokeRect(drawX - gap, drawY - (sprite ? sprite.sh - 32 : 0) - gap, 32 + (gap * 2), (sprite ? sprite.sh : 32) + (gap * 2));

                // Add "Target" text?
                // this.ctx.fillStyle = '#ff0000';
                // this.ctx.font = '10px Arial';
                // this.ctx.fillText('TARGET', drawX, drawY - 10);
            }
        });
    }
    // Updated renderPlayer (Matches User 'Master Fix')
    public renderPlayer(ctx: CanvasRenderingContext2D, player: Player, screenX: number, screenY: number) {
        // 0. Get Sprite (AssetManager)
        const sheet = assetManager.getImage('knight_sheet');
        if (!sheet) return;

        // 1. SAFE Direction (Row 0-3)
        let row = player.direction || 0;
        if (row > 3) row = 0;

        // 2. SAFE Animation (Column 0-3)
        // 150ms per frame. If not moving, show frame 0.
        const col = player.isMoving
            ? Math.floor(Date.now() / 150) % 4
            : 0;

        // 3. Draw EXACTLY 32x32 pixels
        // Source: 32x32 | Dest: 32x32
        ctx.drawImage(
            sheet,
            col * 32, row * 32,  // Source X, Y
            32, 32,              // Source W, H
            screenX, screenY,    // Dest X, Y
            32, 32               // Dest W, H
        );
    }
}
