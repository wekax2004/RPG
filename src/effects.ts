// src/effects.ts

export interface FloatingText {
    x: number;
    y: number;
    z: number;
    text: string;
    color: string;
    startTime: number;
    velocityY: number;
}

export interface BloodEffect {
    x: number;
    y: number;
    z: number;
    startTime: number;
    radius: number;
}

export const activeTexts: FloatingText[] = [];
export const activeBlood: BloodEffect[] = [];

/**
 * Spawns floating damage/heal text at world pixel coordinates.
 */
export function spawnFloatingText(worldOrX: any, xOrY: number, yOrText: any, zOrText: any, textOrColor: string = '#ff3333', colorStr?: string) {
    let x, y, z, text, color;
    // Overload handling: (world, x, y, z, text, color)
    if (typeof worldOrX === 'object') {
        x = xOrY; y = yOrText; z = zOrText; text = textOrColor; color = colorStr || '#ff3333';
    } else {
        // Fallback or old signature?
        // Let's enforce passing Z
        x = worldOrX; y = xOrY; z = yOrText; text = zOrText; color = textOrColor || '#ff3333';
    }

    // Default Z if undefined (legacy safety)
    if (z === undefined || typeof z === 'string') {
        // Did we shift arguments? 
        // If z turned out to be text...
        if (typeof z === 'string') { text = z; z = 7; } // Default to ground
        else z = 7;
    }

    activeTexts.push({
        x, y, z, text, color,
        startTime: performance.now(),
        velocityY: -40 // pixels per second
    });
}

/**
 * Spawns a blood splatter effect at world pixel coordinates.
 */
export function spawnBloodEffect(worldOrX: any, xOrY?: number, yOrX?: number, z?: number) {
    let x, y, finalZ;
    if (typeof worldOrX === 'object') {
        x = xOrY!; y = yOrX!; finalZ = z;
    } else {
        x = worldOrX; y = xOrY!; finalZ = yOrX; // Shifted?
    }

    if (finalZ === undefined) finalZ = 7;

    activeBlood.push({
        x, y, z: finalZ,
        startTime: performance.now(),
        radius: 10 + Math.random() * 8
    });
}

/**
 * Updates all active effects.
 */
export function updateEffects(dt: number) {
    const now = performance.now();

    // Update Text
    for (let i = activeTexts.length - 1; i >= 0; i--) {
        const t = activeTexts[i];
        t.y += t.velocityY * dt;
        if (now - t.startTime > 1000) {
            activeTexts.splice(i, 1);
        }
    }

    // Update Blood
    for (let i = activeBlood.length - 1; i >= 0; i--) {
        if (now - activeBlood[i].startTime > 600) {
            activeBlood.splice(i, 1);
        }
    }
}

/**
 * Renders all active effects.
 */
export function renderEffects(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, playerZ: number = 7) {
    const now = performance.now();

    // 1. Render Blood
    ctx.save();
    for (const b of activeBlood) {
        if (b.z !== undefined && b.z !== playerZ) continue;
        const age = now - b.startTime;
        const alpha = Math.max(0, 1 - age / 600);

        ctx.fillStyle = `rgba(180, 0, 0, ${alpha * 0.7})`;
        ctx.beginPath();
        // Offset by 16,16 to center on tile
        ctx.arc(b.x - cameraX + 16, b.y - cameraY + 16, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // 2. Render Text
    ctx.save();
    ctx.font = 'bold 16px "Verdana", sans-serif';
    ctx.textAlign = 'center';

    for (const t of activeTexts) {
        if (t.z !== undefined && t.z !== playerZ) continue;
        const age = now - t.startTime;
        const alpha = Math.max(0, 1 - age / 1000);

        const screenX = t.x - cameraX;
        const screenY = t.y - cameraY;

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(t.text, screenX, screenY);

        ctx.fillStyle = t.color;
        ctx.fillText(t.text, screenX, screenY);
    }
    ctx.restore();
}
