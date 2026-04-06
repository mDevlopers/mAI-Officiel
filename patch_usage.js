const fs = require('fs');
const file = 'lib/usage-limits.ts';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  'export type UsageFeature = "news" | "health";',
  'export type UsageFeature = "news" | "health" | "meals";'
);

fs.writeFileSync(file, content, 'utf-8');
