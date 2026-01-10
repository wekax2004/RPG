
import sharp from 'sharp';

async function process() {
    // 1. Resize Knight
    console.log('Resizing Knight Sheet...');
    await sharp('public/sprites/knight_sheet_transparent.png')
        .resize(96, 128, { fit: 'fill' }) // Force dimensions
        .toFile('public/sprites/knight_sheet.png');
    console.log('Saved public/sprites/knight_sheet.png (96x128)');

    // 2. Check Grass
    // If grass_tile doesn't exist or is wrong, we might need to extract it again or create a placeholder.
    // Ideally we assume it exists from previous steps. 
    // I'll create a simple green fallback just in case, or verify.
    try {
        const meta = await sharp('public/sprites/grass_tile.png').metadata();
        console.log(`Grass Tile exists: ${meta.width}x${meta.height}`);
        if (meta.width > 32) {
            console.log('Resizing Grass Tile...');
            await sharp('public/sprites/grass_tile.png')
                .resize(32, 32, { fit: 'fill' })
                .toFile('public/sprites/grass_tile.png');
        }
    } catch (e) {
        console.log('Grass tile missing, creating fallback...');
        await sharp({
            create: {
                width: 32,
                height: 32,
                channels: 4,
                background: { r: 34, g: 139, b: 34, alpha: 1 } // Forest Green
            }
        }).png().toFile('public/sprites/grass_tile.png');
    }
}

process().catch(console.error);
