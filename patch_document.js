const fs = require("fs");
let code = fs.readFileSync("lib/db/schema.ts", "utf8");

code = code.replace(
  /export const document = pgTable\(\s*"Document",\s*{([\s\S]*?)userId: uuid\("userId"\)\s*\.notNull\(\)\s*\.references\(\(\) => user\.id\),/g,
  `export const document = pgTable(\n  "Document",\n  {$1userId: uuid("userId")\n      .notNull()\n      .references(() => user.id),\n    projectId: uuid("projectId").references(() => project.id),`
);

fs.writeFileSync("lib/db/schema.ts", code);
