const fs = require("node:fs");

const file = "app/api/chat/schema.ts";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  '  uploadSource: z.enum(["device", "mai-library"]).optional(),\n});',
  '  uploadSource: z.enum(["device", "mai-library"]).optional(),\n  tags: z.array(z.string()).optional(),\n});'
);

fs.writeFileSync(file, code);
