const fs = require('fs');
let code = fs.readFileSync('app/(chat)/coder/page.tsx', 'utf8');
code = code.replace(
  'import {',
  'import { Download,'
);
fs.writeFileSync('app/(chat)/coder/page.tsx', code);
