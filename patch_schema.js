const fs = require("fs");
let code = fs.readFileSync("lib/db/schema.ts", "utf8");

// The file might already have agentIds if we didn't checkout properly
if (!code.includes('agentIds: json("agentIds")')) {
  code = code.replace(
    /export const project = pgTable\("Project", {([\s\S]+?)}\);/,
    (match, inner) => {
      return `export const project = pgTable("Project", {${inner.replace('files: json("files").default([]), // uploaded files metadata', 'files: json("files").default([]), // uploaded files metadata\n  agentIds: json("agentIds").$type<string[]>().default([]), // selected mAI ids')}});`;
    }
  );
  fs.writeFileSync("lib/db/schema.ts", code);
}
