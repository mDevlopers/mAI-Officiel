const fs = require("fs");
let code = fs.readFileSync("app/(chat)/coder/page.tsx", "utf8");

// Add JSZip import
code = code.replace(
  'import { Button } from "@/components/ui/button";',
  'import { Button } from "@/components/ui/button";\nimport JSZip from "jszip";'
);

// Replace exportAllCode implementation
const oldExport = `  const exportAllCode = () => {
    const blob = new Blob([JSON.stringify(files, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "code-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };`;

const newExport = `  const exportAllCode = async () => {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.path, file.content || "");
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "projet-code.zip";
    anchor.click();
    URL.revokeObjectURL(url);
  };`;

code = code.replace(oldExport, newExport);

fs.writeFileSync("app/(chat)/coder/page.tsx", code);
