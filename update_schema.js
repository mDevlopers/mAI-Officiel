const fs = require("fs");
let code = fs.readFileSync("lib/db/schema.ts", "utf8");

const regex =
  /export const project = pgTable\("Project", {([\s\S]*?)files: json\("files"\).default\(\[\]\), \/\/ uploaded files metadata([\s\S]*?)}\);/;

code = code.replace(
  regex,
  'export const project = pgTable("Project", {$1files: json("files").default([]), // uploaded files metadata\n  agentIds: json("agentIds").$type<string[]>().default([]), // selected mAI ids$2});'
);

fs.writeFileSync("lib/db/schema.ts", code);
