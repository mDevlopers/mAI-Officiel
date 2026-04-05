const fs = require("node:fs");

const file = "lib/db/schema.ts";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  '  updatedAt: timestamp("updatedAt").notNull().defaultNow(),\n});',
  '  updatedAt: timestamp("updatedAt").notNull().defaultNow(),\n  globalTags: json("globalTags").$type<{id: string, name: string, color: string}[]>().default([]),\n});'
);

code = code.replace(
  '  projectId: uuid("projectId").references(() => project.id),\n});',
  '  projectId: uuid("projectId").references(() => project.id),\n  tags: json("tags").$type<string[]>().default([]),\n});'
);

fs.writeFileSync(file, code);
