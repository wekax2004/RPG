const fs = require('fs');
let content = fs.readFileSync('src/game.ts', 'utf8');

// Add closing braces at end of file
// The file has 5 more { than } so we need to add 5 closing braces
// First trim any trailing whitespace/empty lines
content = content.trimEnd();

// Add 5 closing braces with proper formatting
content += '\n}\n}\n}\n}\n}\n';

fs.writeFileSync('src/game.ts', content);
console.log("Added 5 closing braces to game.ts");
