const fs = require("fs");
let code = fs.readFileSync("components/chat/document-preview.tsx", "utf8");

code = code.replace(
  /createdAt: new Date\(\),\n {10}userId: "noop",/g,
  'createdAt: new Date(),\n          userId: "noop",\n          projectId: null,'
);

fs.writeFileSync("components/chat/document-preview.tsx", code);
