const fs = require("fs");
let code = fs.readFileSync("app/(chat)/coder/page.tsx", "utf8");
code = code.replace(
  'import { CheckCircle2, Code2, FilePlus2, FolderPlus, Pencil, PlayCircle, Trash2 } from "lucide-react";',
  'import { CheckCircle2, Code2, Download, FilePlus2, FolderPlus, Pencil, PlayCircle, Trash2 } from "lucide-react";'
);
fs.writeFileSync("app/(chat)/coder/page.tsx", code);
