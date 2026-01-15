const fs = require('fs');
const path = 'src/game.ts';
let content = fs.readFileSync(path, 'utf8');

// Marker 1: The trash pile starting with wolfPelt
const startMarker = "wolfPelt: new Item('Wolf Pelt'";
// Marker 2: The start of the next valid function, usually lightingRenderSystem or the canvas var
const endMarker = "// Offscreen canvas for lighting";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    console.log("Found range: " + startIndex + " to " + endIndex);
    // Remove it
    const newContent = content.substring(0, startIndex) + "\n    " + content.substring(endIndex);
    fs.writeFileSync(path, newContent);
    console.log("Cleanup successful.");
} else {
    console.log("Markers not found.");
    console.log("Start found? " + (startIndex !== -1));
    console.log("End found? " + (endIndex !== -1));
}
