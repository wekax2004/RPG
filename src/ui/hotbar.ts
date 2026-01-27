import { Hotbar } from '../components';
import { UIManager } from '../client/ui_manager';
import { SPRITES } from '../constants';

// MVP: Just render empty boxes with text
export function renderHotbar(ctx: CanvasRenderingContext2D, hotbar: Hotbar, canvasHeight: number, canvasWidth: number) {
    const slotSize = 32;
    const padding = 4;
    const numSlots = 10;
    const totalWidth = (numSlots * slotSize) + ((numSlots - 1) * padding);
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = canvasHeight - slotSize - 10; // 10px from bottom

    for (let i = 0; i < numSlots; i++) {
        const x = startX + (i * (slotSize + padding));
        const y = startY;

        // Draw Slot Background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1;

        ctx.fillRect(x, y, slotSize, slotSize);
        ctx.strokeRect(x, y, slotSize, slotSize);

        // Draw Content
        const action = hotbar.slots[i];
        if (action) {
            // Draw Icon or Text
            // Ideally we look up sprite. For now, abbreviated text.
            ctx.fillStyle = "#fff";
            ctx.font = "10px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Abbreviate: "Health Potion" -> "HP"
            let label = action.substring(0, 2).toUpperCase();
            if (action.includes("Health")) label = "HP";
            if (action.includes("Mana")) label = "MP";
            if (action.includes("exura")) label = "HEAL";

            ctx.fillText(label, x + slotSize / 2, y + slotSize / 2);
        }

        // Draw Keybind Number
        ctx.fillStyle = "#aaa";
        ctx.font = "8px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const key = (i + 1) % 10; // 1, 2, ..., 9, 0
        ctx.fillText(key.toString(), x + 2, y + 2);
    }
}
