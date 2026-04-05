const fs = require("node:fs");

const file = "lib/db/schema.ts";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  '  globalTags: json("globalTags").$type<{id: string, name: string, color: string}[]>().default([]),\n});',
  '  globalTags: json("globalTags").$type<{id: string, name: string, color: string}[]>().default([]),\n  defaultModel: varchar("defaultModel").default("moonshotai/kimi-k2-0905"),\n});'
);

code = code.replace(
  '  agentIds: json("agentIds").$type<string[]>().default([]), // selected mAI ids\n  createdAt:',
  '  agentIds: json("agentIds").$type<string[]>().default([]), // selected mAI ids\n  defaultModel: varchar("defaultModel").default("moonshotai/kimi-k2-0905"),\n  createdAt:'
);

fs.writeFileSync(file, code);
