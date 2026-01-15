const fs = require('fs');
const content = fs.readFileSync('src/game.ts', 'utf8');
const lines = content.split('\n');
let depth = 0;
let maxDepth = 0;
let maxDepthLine = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
        if (ch === '{') {
            depth++;
            if (depth > maxDepth) {
                maxDepth = depth;
                maxDepthLine = i + 1;
            }
        }
        if (ch === '}') depth--;
    }

    // Log lines where depth is abnormally high (> 5)
    if (depth > 5 && i > 2500 && i < 3000) {
        console.log(`Line ${i + 1}: Depth = ${depth}`);
    }
}

console.log('Final depth:', depth);
console.log('Max depth:', maxDepth, 'at line', maxDepthLine);

// Find where depth first goes negative or stays positive at end
let runningDepth = 0;
let issueLines = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
        if (ch === '{') runningDepth++;
        if (ch === '}') runningDepth--;
    }
    if (runningDepth > 6) {
        issueLines.push({ line: i + 1, depth: runningDepth });
    }
}

console.log('\nLines where depth exceeds 6:');
// Just show first 20
issueLines.slice(0, 20).forEach(x => console.log(`Line ${x.line}: ${x.depth}`));
