
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = 'C:/Users/home/.gemini/antigravity/brain/637641f7-63af-4de0-93f2-e7b824bc95df/tibia_chest_tree_sheet_1768033177026.png';

async function analyze() {
    console.log(`Analyzing: ${INPUT_PATH}`);
    const image = sharp(INPUT_PATH);
    const metadata = await image.metadata();

    console.log(`Dimensions: ${metadata.width}x${metadata.height}`);

    // Scan column strips of 128px width
    const cols = Math.floor(metadata.width / 128);
    const rows = Math.floor(metadata.height / 128);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const left = c * 128;
            const top = r * 128;

            const stats = await image.clone()
                .extract({ left, top, width: 128, height: 128 })
                .stats();

            const red = stats.channels[0].mean;
            const green = stats.channels[1].mean;
            const blue = stats.channels[2].mean;

            // Heuristic Identification
            let type = "Unknown/Empty";

            // White/Empty (High brightness in all channels)
            if (red > 240 && green > 240 && blue > 240) {
                type = "Empty";
            }
            // Tree: Dominant Green
            else if (green > red && green > blue && green > 50) {
                type = "TREE 🌲";
            }
            // Chest: Brown (Red is dominant, Green is medium, Blue is low)
            else if (red > green && red > blue && red > 50) {
                type = "CHEST 📦";
            }
            // Dark/Black
            else if (red < 20 && green < 20 && blue < 20) {
                type = "Empty/Black";
            }

            if (type !== "Empty" && type !== "Empty/Black") {
                console.log(`[${type}] Grid (${c},${r}) -> x=${left}, y=${top} | RGB: ${Math.floor(red)},${Math.floor(green)},${Math.floor(blue)}`);
            }
        }
    }
}

analyze().catch(console.error);
