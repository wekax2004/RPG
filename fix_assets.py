import re
import os

filepath = r'c:\Users\home\.gemini\antigravity\scratch\retro-rpg\src\assets.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Target exactly the broken block
pattern = r'(console\.log\(`\[AssetManager\] Atlas sprite \$\{id\}: \$\{canvasWidth\}x\$\{canvasHeight\}, removed \$\{removed\} magenta pixels`\);)(\s+)(this\.applyTransparency\(ctx, canvasWidth, canvasHeight\);)(\s+)(this\.images\[id\] = spriteCvs;)(\s+)(if \(id === 10\) \{ .*? \})(\s+)(// console\.log\(`\[AssetManager\] Loaded Sprite \$\{id\} from \$\{file\}`\);)(\s+)(\})'

# Correct structure: close the IF block, then call transparency, then close the ID loop
replacement = r'\1\2}\n\n                        this.applyTransparency(ctx, canvasWidth, canvasHeight);\n                        this.images[id] = spriteCvs;\2\7\2}\n'

# Actually, let's just use a simpler replacement based on the viewed lines
# We want to insert a } before applyTransparency...
# And we want to keep the final } at 839 to close the loop? No, that } at 839 ALREADY closes the if.

# Wait, let's just search for the specific sequence and fix it.
new_content = re.sub(
    r'(console\.log\(`\[AssetManager\] Atlas sprite [^`]+`\);)\s+(this\.applyTransparency\(ctx, canvasWidth, canvasHeight\);)\s+(this\.images\[id\] = spriteCvs;)\s+(if \(id === 10\) \{.*?\}\s+)?(?:// .*?\s+)?\}',
    r'\1\n                        }\n\n                        this.applyTransparency(ctx, canvasWidth, canvasHeight);\n                        this.images[id] = spriteCvs;\n\n                        \4\n                    }',
    content, flags=re.DOTALL
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
