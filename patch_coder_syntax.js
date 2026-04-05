const fs = require("fs");
let code = fs.readFileSync("app/(chat)/coder/page.tsx", "utf8");

// The issue in app/(chat)/coder/page.tsx is a missing closing brace for the default export.
if (!code.trim().endsWith("}")) {
  code += "\\n}\\n";
}

fs.writeFileSync("app/(chat)/coder/page.tsx", code);
