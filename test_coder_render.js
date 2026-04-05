import fs from "fs";

const code = fs.readFileSync("app/(chat)/coder/page.tsx", "utf8");

// Basic checks to ensure our additions are present.
if (!code.includes("import { Download"))
  throw new Error("Missing Download import");
if (!code.includes('<Download className="size-3.5" /> Export'))
  throw new Error("Missing Export button");
if (!code.includes("grid-cols-[400px_1fr]"))
  throw new Error("Missing new grid layout");
if (!code.includes("JSZip")) throw new Error("Missing JSZip import");

const newsCode = fs.readFileSync("app/(chat)/news/page.tsx", "utf8");
if (!newsCode.includes('downloadReport("txt")'))
  throw new Error("Missing News download dropdown");
if (!newsCode.includes('import("jspdf")'))
  throw new Error("Missing jsPDF dynamic import");

console.log("All verifications passed!");
