const fs = require("node:fs");

const file = "lib/db/queries.ts";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  '  title: string;\n  visibility: VisibilityType;\n}) {\n  try {',
  '  title: string;\n  visibility: VisibilityType;\n  tags?: string[];\n}) {\n  try {'
);

code = code.replace(
  '      userId,\n      title,\n      visibility,\n    });\n  } catch (_error) {',
  '      userId,\n      title,\n      visibility,\n      tags: tags || [],\n    });\n  } catch (_error) {'
);

code = code.replace(
  '    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));',
  '    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));\n  } catch (error) {\n    return;\n  }\n}\n\nexport async function updateChatTagsById({ chatId, tags }: { chatId: string; tags: string[] }) {\n  try {\n    return await db.update(chat).set({ tags }).where(eq(chat.id, chatId));'
);

fs.writeFileSync(file, code);
