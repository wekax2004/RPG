const fs = require('fs');
const path = 'src/game.ts';
let content = fs.readFileSync(path, 'utf8');

// The issue is that export statements are nested inside a for loop in dungeonSystem.
// Lines 2579-2668 contain incorrectly nested exports.
// We need to close the dungeonSystem function BEFORE the MAP_SWITCHING code.

// Find the pattern: the for loop checking exits should end before MAP_SWITCHING
const badPattern = `if ((ui as any).console) (ui as any).console.addSystemMessage(\`Leaving Dungeon...\`);




            // --- MAP SWITCHING SYSTEM ---`;

const goodPattern = `if ((ui as any).console) (ui as any).console.addSystemMessage(\`Leaving Dungeon...\`);
            switchMap(world, 'overworld', 'main', Date.now());
            return;
        }
    }
}

// --- MAP SWITCHING SYSTEM ---`;

if (content.includes(badPattern)) {
    content = content.replace(badPattern, goodPattern);
    fs.writeFileSync(path, content);
    console.log("Fixed dungeonSystem closure and export nesting.");
} else {
    console.log("Pattern not found. Trying alternative fix...");

    // Alternative: Just remove the extra indentation from export statements
    content = content.replace(/            export const MAP_CACHE/g, 'export const MAP_CACHE');
    content = content.replace(/            export function switchMap/g, 'export function switchMap');
    content = content.replace(/            export function toolSystem/g, 'export function toolSystem');
    fs.writeFileSync(path, content);
    console.log("Removed extra indentation from exports.");
}
