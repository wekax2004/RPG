const fs = require('fs');
let content = fs.readFileSync('src/game.ts', 'utf8');
const lines = content.split('\n');

console.log("Looking for duplicate functions...");

// Find and remove duplicate switchMap (keep line 2442, remove line 2590)
// Find and remove duplicate createItemFromRegistry (keep line 1318, remove line 3885)

let removedLines = 0;
let inDuplicateFunction = false;
let duplicateFunctionDepth = 0;
let duplicateFunctions = ['switchMap', 'createItemFromRegistry'];
let firstOccurrence = {};

const filteredLines = [];
let lineNum = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    lineNum = i + 1;

    // Check for function definition
    const funcMatch = line.match(/^export function (\w+)\(/);
    if (funcMatch) {
        const funcName = funcMatch[1];
        if (duplicateFunctions.includes(funcName)) {
            if (!firstOccurrence[funcName]) {
                console.log(`First occurrence of ${funcName} at line ${lineNum} - keeping`);
                firstOccurrence[funcName] = lineNum;
            } else {
                console.log(`Duplicate ${funcName} at line ${lineNum} - REMOVING`);
                inDuplicateFunction = true;
                duplicateFunctionDepth = 1; // We've seen the opening brace
                removedLines++;
                continue; // Skip this line
            }
        }
    }

    // If we're inside a duplicate function, track brace depth
    if (inDuplicateFunction) {
        for (const ch of line) {
            if (ch === '{') duplicateFunctionDepth++;
            if (ch === '}') duplicateFunctionDepth--;
        }
        removedLines++;
        if (duplicateFunctionDepth <= 0) {
            console.log(`End of duplicate function at line ${lineNum}`);
            inDuplicateFunction = false;
        }
        continue; // Skip lines inside duplicate function
    }

    filteredLines.push(line);
}

fs.writeFileSync('src/game.ts', filteredLines.join('\n'));
console.log(`Removed ${removedLines} lines. File now has ${filteredLines.length} lines`);
