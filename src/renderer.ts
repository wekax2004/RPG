/**
 * PixelRenderer - Virtual Console Architecture
 * 
 * Renders to a fixed-resolution off-screen buffer (320x240) and upscales
 * to the visible canvas using integer multipliers for pixel-perfect visuals.
 */

export const BUFFER_WIDTH = 320;
export const BUFFER_HEIGHT = 240;

export class PixelRenderer {
    private buffer: HTMLCanvasElement;
    private bufferCtx: CanvasRenderingContext2D;
    private screen: HTMLCanvasElement;
    private screenCtx: CanvasRenderingContext2D;
    private scale: number = 1;

    constructor(screenCanvas: HTMLCanvasElement) {
        this.screen = screenCanvas;
        this.screenCtx = screenCanvas.getContext('2d')!;

        // Create off-screen buffer at fixed resolution
        this.buffer = document.createElement('canvas');
        this.buffer.width = BUFFER_WIDTH;
        this.buffer.height = BUFFER_HEIGHT;
        this.bufferCtx = this.buffer.getContext('2d')!;

        // TEXTURED PIXEL ENGINE: Disable smoothing for gritty pixels
        this.bufferCtx.imageSmoothingEnabled = false;
        this.screenCtx.imageSmoothingEnabled = false;

        // Calculate initial scale
        this.updateScale();

        // Handle window resize
        window.addEventListener('resize', () => this.updateScale());
    }

    /**
     * Recalculate the integer scale factor based on screen size.
     */
    private updateScale() {
        const container = this.screen.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate the largest integer scale that fits
        const scaleX = Math.floor(containerWidth / BUFFER_WIDTH);
        const scaleY = Math.floor(containerHeight / BUFFER_HEIGHT);
        this.scale = Math.max(1, Math.min(scaleX, scaleY));

        // Resize visible canvas to fit scaled buffer
        this.screen.width = BUFFER_WIDTH * this.scale;
        this.screen.height = BUFFER_HEIGHT * this.scale;

        // Re-disable smoothing after resize (context resets)
        this.screenCtx.imageSmoothingEnabled = false;
        this.bufferCtx.imageSmoothingEnabled = false;

        // Center the canvas
        this.screen.style.marginLeft = `${(containerWidth - this.screen.width) / 2}px`;
        this.screen.style.marginTop = `${(containerHeight - this.screen.height) / 2}px`;
    }

    /**
     * Get the buffer context for direct drawing.
     * All game rendering should use this context.
     */
    getBufferContext(): CanvasRenderingContext2D {
        // Ensure smoothing is always off
        this.bufferCtx.imageSmoothingEnabled = false;
        return this.bufferCtx;
    }

    /**
     * Get the buffer canvas (for systems that need direct access).
     */
    getBuffer(): HTMLCanvasElement {
        return this.buffer;
    }

    /**
     * Get current scale factor.
     */
    getScale(): number {
        return this.scale;
    }

    /**
     * Clear the buffer with a background color.
     */
    clear(color: string = '#111') {
        this.bufferCtx.fillStyle = color;
        this.bufferCtx.fillRect(0, 0, BUFFER_WIDTH, BUFFER_HEIGHT);
    }

    /**
     * Draw an image to the buffer with floored coordinates (prevents sub-pixel blur).
     */
    draw(
        image: CanvasImageSource,
        sx: number, sy: number, sw: number, sh: number,
        dx: number, dy: number, dw: number, dh: number
    ) {
        this.bufferCtx.drawImage(
            image,
            sx, sy, sw, sh,
            Math.floor(dx), Math.floor(dy), dw, dh
        );
    }

    /**
     * Present the buffer to the screen using integer upscaling.
     */
    present() {
        // Ensure smoothing is off before upscale
        this.screenCtx.imageSmoothingEnabled = false;

        // Clear and draw scaled buffer
        this.screenCtx.clearRect(0, 0, this.screen.width, this.screen.height);
        this.screenCtx.drawImage(
            this.buffer,
            0, 0, BUFFER_WIDTH, BUFFER_HEIGHT,
            0, 0, BUFFER_WIDTH * this.scale, BUFFER_HEIGHT * this.scale
        );
    }

    /**
     * Get buffer dimensions.
     */
    getBufferWidth(): number {
        return BUFFER_WIDTH;
    }

    getBufferHeight(): number {
        return BUFFER_HEIGHT;
    }
}
