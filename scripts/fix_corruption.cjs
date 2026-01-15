const fs = require('fs');
let content = fs.readFileSync('src/game.ts', 'utf8');
const lines = content.split('\n');

// The corruption starts at line 4390 (index 4389) where "const tile = map.getTile(source.x)"
// appears inside the spawnDebugSet for loop.
// We need to replace lines 4390 onwards with proper code.

// Find line 4389 which should say: "        if (typeof id === 'number') {"
// Then replace everything from line 4390 to end of file with proper closing

const lineIndex = 4388; // Line 4389 in 0-based index
if (lines[lineIndex] && lines[lineIndex].includes("if (typeof id === 'number')")) {
    console.log("Found corruption start point at line", lineIndex + 1);

    // Truncate from line 4389 onwards and add proper closing
    const goodLines = lines.slice(0, lineIndex + 1);
    goodLines.push("            spawnAt(id, row, col);");
    goodLines.push("            col++;");
    goodLines.push("            if (col >= MAX_COLS) { col = 0; row++; }");
    goodLines.push("        }");
    goodLines.push("    }");
    goodLines.push("}");
    goodLines.push("");

    fs.writeFileSync('src/game.ts', goodLines.join('\n'));
    console.log("Fixed! File now has", goodLines.length, "lines");
} else {
    console.log("Could not find expected line at index", lineIndex);
    console.log("Actual content:", lines[lineIndex]);
}
