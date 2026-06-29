const fs = require('fs');

const content = fs.readFileSync('/src/components/AdminDashboard.tsx', 'utf8');

// Simple scanner to count braces, parens, and divs
let brace = 0;
let paren = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    continue;
  }
  for (let j = 0; j < line.length; j++) {
    let char = line[j];
    if (char === '{') brace++;
    else if (char === '}') brace--;
    else if (char === '(') paren++;
    else if (char === ')') paren--;
  }
  if (i >= 5200 && i <= 6380) {
    // Print brace and paren status in the relevant region
    console.log(`Line ${i + 1}: brace=${brace} paren=${paren} | ${trimmed.substring(0, 40)}`);
  }
}

console.log(`Final Totals: brace=${brace}, paren=${paren}`);
