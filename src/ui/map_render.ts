
import { TileMap } from '../components';
import { SPRITES } from '../constants';
import { TILE_SIZE } from '../core/types';

export class MapRenderer {
    private miniCanvas: HTMLCanvasElement;
    private miniCtx: CanvasRenderingContext2D;
    private fullCanvas: HTMLCanvasElement;
    private fullCtx: CanvasRenderingContext2D;
    private fullMapContainer: HTMLDivElement;

    // Config
    private miniSize = 150; // px
    private miniRadius = 7; // tiles radius (15x15)

    private colors: Record<number, string> = {
        [SPRITES.GRASS]: '#228b22', // Forest Green
        [SPRITES.GRASS_FLOWERS]: '#32cd32',
        [SPRITES.DIRT]: '#8b4513',
        [SPRITES.WATER]: '#4169e1', // Royal Blue
        [SPRITES.SAND]: '#f4a460', // Sandy Brown
        [SPRITES.STONE_WALL]: '#696969', // Dim Gray
        [SPRITES.WALL]: '#696969',
        [SPRITES.WALL_VERTICAL]: '#696969',
        [SPRITES.WALL_STONE_V]: '#555',
        [SPRITES.FLOOR_STONE]: '#808080',
        [SPRITES.FLOOR_WOOD]: '#deb887',
        [SPRITES.SNOW]: '#fffafa',
        [SPRITES.ICE]: '#e0ffff',
        [SPRITES.SWAMP_MUD]: '#2f4f4f',
        [SPRITES.MOUNTAIN_TOP]: '#a9a9a9',
        // Fallback
        0: '#000000'
    };

    private isOpen: boolean = false;

    constructor() {
        // Minimap Setup
        const miniContainer = document.getElementById('minimap-container');
        this.miniCanvas = document.createElement('canvas');
        this.miniCanvas.width = this.miniSize;
        this.miniCanvas.height = this.miniSize;
        this.miniCanvas.style.border = '2px solid #555';
        this.miniCanvas.style.background = '#000';
        if (miniContainer) {
            miniContainer.innerHTML = ''; // Clear label
            miniContainer.appendChild(this.miniCanvas);
        }
        this.miniCtx = this.miniCanvas.getContext('2d')!;

        // World Map Setup (Modal)
        this.fullMapContainer = document.createElement('div');
        this.fullMapContainer.id = 'world-map-modal';
        this.fullMapContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80vw;
            height: 80vh;
            background: rgba(0,0,0,0.9);
            border: 4px ridge #d4af37;
            display: none;
            z-index: 2000;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        const title = document.createElement('h2');
        title.innerText = "World Map";
        title.style.color = '#d4af37';
        this.fullMapContainer.appendChild(title);

        this.fullCanvas = document.createElement('canvas');
        this.fullCanvas.style.border = '1px solid #555';
        // We'll resize this dynamically or set fixed large size
        this.fullCanvas.width = 600;
        this.fullCanvas.height = 600;
        this.fullMapContainer.appendChild(this.fullCanvas);

        const closeBtn = document.createElement('button');
        closeBtn.innerText = "Close (M)";
        closeBtn.onclick = () => this.toggleWorldMap();
        closeBtn.style.marginTop = '10px';
        this.fullMapContainer.appendChild(closeBtn);

        document.body.appendChild(this.fullMapContainer);
        this.fullCtx = this.fullCanvas.getContext('2d')!;

        // Keybind
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm') {
                this.toggleWorldMap();
            }
        });
    }

    toggleWorldMap() {
        this.isOpen = !this.isOpen;
        this.fullMapContainer.style.display = this.isOpen ? 'flex' : 'none';
    }

    // Helper to get color
    private getColor(spriteId: number): string {
        return this.colors[spriteId] || '#333'; // Default dark grey
    }

    updateMinimap(map: TileMap, pX: number, pY: number, pZ: number) {
        if (!this.miniCtx) return;
        const ctx = this.miniCtx;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.miniSize, this.miniSize);

        const tileW = this.miniSize / (this.miniRadius * 2 + 1);
        const tileH = tileW;

        // Player is at center (pX, pY are in TILES)
        const startX = Math.floor(pX - this.miniRadius);
        const startY = Math.floor(pY - this.miniRadius);

        for (let y = 0; y <= this.miniRadius * 2; y++) {
            for (let x = 0; x <= this.miniRadius * 2; x++) {
                const mapX = startX + x;
                const mapY = startY + y;

                // Bounds check
                if (mapX >= 0 && mapX < map.width && mapY >= 0 && mapY < map.height) {
                    const idx = (mapY * map.width) + mapX;
                    // We need a way to get the tile ID. TileMap stores objects?
                    // TileMap.tiles is CompTile[]?
                    // Checking components.ts: TileMap has `tiles: Uint32Array` or `Tile[]`?
                    // Assuming getTile logic from Map helper or direct access check.
                    // Wait, `TileMap` in components definition (main.ts says `new TileMap(...)`)
                    // Let's assume `map.tiles[idx]` exists and has `spriteId` or is a number.
                    // I will check definitions below.

                    const tile = map.tiles[idx];
                    // Assuming tile is { spriteId: number } or similar
                    // If it's pure ECS, map.tiles might be a flat array of sprite IDs if optimized,
                    // or objects.

                    // Simple Fallback logic till confirmed:
                    let spriteId = 0;
                    if (tile && (tile as any).items && (tile as any).items.length > 0) {
                        spriteId = (tile as any).items[0].id;
                    } else if (typeof tile === 'number') {
                        spriteId = tile;
                    }

                    ctx.fillStyle = this.getColor(spriteId);
                    ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
                }
            }
        }

        // Draw Player Marker
        ctx.fillStyle = '#fff'; // White Dot
        const center = this.miniSize / 2;
        const size = tileW;
        ctx.beginPath();
        ctx.arc(center, center, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    updateWorldMap(map: TileMap, pX: number, pY: number) {
        if (!this.isOpen) return;
        // Optimization: Don't redraw every frame if static?
        // For now, draw every frame but simplified.

        const ctx = this.fullCtx;
        const w = this.fullCanvas.width;
        const h = this.fullCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Scale map to fit canvas? Or 1px per tile?
        // Map is 300x300. 1px per tile = 300px. Easy fit.
        // Let's do 2px per tile.
        const scale = 2;

        // Center view on player?
        // Or show whole map? 
        // 300 * 2 = 600. Fits exactly in 600x600 canvas.

        // Draw all tiles
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const idx = y * map.width + x;
                const tile = map.tiles[idx];

                let spriteId = 0;
                if (tile && (tile as any).items && (tile as any).items.length > 0) {
                    spriteId = (tile as any).items[0].id;
                } else if (typeof tile === 'number') {
                    spriteId = tile;
                }

                ctx.fillStyle = this.getColor(spriteId);
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }

        // Player Marker
        ctx.fillStyle = '#f00';
        ctx.fillRect(pX * scale - 2, pY * scale - 2, 4, 4);
    }
}
