const fs = require("node:fs");

const file = "lib/db/queries.ts";
let code = fs.readFileSync(file, "utf8");

// Ajouter globalTags
code = code.replace(
  '  isAnonymous: boolean;\n}) {\n  try {\n    const [userRow] = await db',
  '  isAnonymous: boolean;\n}) {\n  try {\n    const [userRow] = await db'
);

// Mettre à jour tags et defaultModel ? Non pour defaultModel c'est pour plus tard.
// on remplace saveChat pour inclure tags
code = code.replace(
  '  visibility:\n    | "public"\n    | "private";\n}) {\n  try {\n    return await db.insert(chat).values({',
  '  visibility:\n    | "public"\n    | "private";\n  tags?: string[];\n}) {\n  try {\n    return await db.insert(chat).values({'
);

code = code.replace(
  '      visibility,\n      createdAt: new Date(),\n    });\n  } catch (error) {',
  '      visibility,\n      tags: tags || [],\n      createdAt: new Date(),\n    });\n  } catch (error) {'
);

fs.writeFileSync(file, code);
