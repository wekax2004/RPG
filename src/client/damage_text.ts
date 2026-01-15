
export class DamageText {
    x: number;
    y: number;
    text: string;
    color: string;
    life: number;
    maxLife: number;
    velocityY: number;

    constructor(x: number, y: number, text: string, color: string = '#ff0000') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0; // 1 second duration
        this.maxLife = 1.0;
        this.velocityY = -20; // Float up speed pixels/sec
    }
}

export class DamageTextManager {
    texts: DamageText[] = [];

    addText(x: number, y: number, text: string, color: string = '#ff0000') {
        this.texts.push(new DamageText(x, y, text, color));
    }

    update(dt: number) {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const txt = this.texts[i];
            txt.y += txt.velocityY * dt;
            txt.life -= dt;
            if (txt.life <= 0) {
                this.texts.splice(i, 1);
            }
        }
    }

    render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
        ctx.save();
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        for (const txt of this.texts) {
            const alpha = Math.max(0, txt.life / txt.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = txt.color;
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000000';

            // Draw relative to camera
            const screenX = Math.floor(txt.x - cameraX);
            const screenY = Math.floor(txt.y - cameraY);

            ctx.strokeText(txt.text, screenX, screenY);
            ctx.fillText(txt.text, screenX, screenY);
        }

        ctx.restore();
    }
}

export const damageTextManager = new DamageTextManager();
