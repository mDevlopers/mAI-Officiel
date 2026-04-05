const fs = require("node:fs");

const file = "app/api/user/default-model/route.ts";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  'import { db } from "@/lib/db";',
  'import { drizzle } from "drizzle-orm/postgres-js";\nimport postgres from "postgres";\nconst client = postgres(process.env.POSTGRES_URL ?? "");\nconst db = drizzle(client);'
);

fs.writeFileSync(file, code);
