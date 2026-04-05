const fs = require("node:fs");

const file = "lib/db/schema.ts";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  '  defaultModel: varchar("defaultModel").default("moonshotai/kimi-k2-0905"),\n});',
  '  defaultModel: varchar("defaultModel").default("moonshotai/kimi-k2-0905"),\n  shortcuts: json("shortcuts").$type<{name: string, url: string, icon: string}[]>().default([]),\n});'
);

fs.writeFileSync(file, code);
