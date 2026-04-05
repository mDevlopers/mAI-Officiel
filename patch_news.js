const fs = require("fs");
let code = fs.readFileSync("app/(chat)/news/page.tsx", "utf8");

// Add imports
code = code.replace(
  'import { Button } from "@/components/ui/button";',
  'import { Button } from "@/components/ui/button";\nimport jsPDF from "jspdf";\nimport { Document, Packer, Paragraph, TextRun } from "docx";'
);

// Add download method
const downloadMethod = `

  const downloadReport = async (format: "txt" | "md" | "pdf" | "docx") => {
    if (!report) return;

    const filename = \`rapport-actualites.\${format}\`;

    if (format === "txt" || format === "md") {
      const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(report, 180);
      let y = 10;
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
        doc.text(splitText[i], 10, y);
        y += 7;
      }
      doc.save(filename);
    } else if (format === "docx") {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: report.split("\\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun(line)],
                })
            ),
          },
        ],
      });
      Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

`;

code = code.replace(
  "  if (!isUnlocked) {",
  downloadMethod + "  if (!isUnlocked) {"
);

// Replace Download Button
const originalDownloadBtn = `<Button
                onClick={() => {
                  const url = URL.createObjectURL(reportAsBlob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "rapport-actualites.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                size="sm"
                variant="outline"
              >
                <Download className="mr-1 size-4" />
                Télécharger
              </Button>`;

const newDownloadBtn = `<div className="group relative">
                <Button className="gap-2" disabled={!report} size="sm" variant="outline">
                  <Download className="size-4" />
                  Télécharger
                </Button>
                <div className="absolute right-0 top-full mt-1 hidden w-36 flex-col rounded-xl border border-border bg-card p-1.5 shadow-lg group-hover:flex">
                  <button className="rounded-lg px-2 py-1.5 text-left text-xs hover:bg-muted" onClick={() => downloadReport("txt")}>Format TXT</button>
                  <button className="rounded-lg px-2 py-1.5 text-left text-xs hover:bg-muted" onClick={() => downloadReport("md")}>Format Markdown</button>
                  <button className="rounded-lg px-2 py-1.5 text-left text-xs hover:bg-muted" onClick={() => downloadReport("pdf")}>Format PDF</button>
                  <button className="rounded-lg px-2 py-1.5 text-left text-xs hover:bg-muted" onClick={() => downloadReport("docx")}>Format DOCX</button>
                </div>
              </div>`;

code = code.replace(originalDownloadBtn, newDownloadBtn);

fs.writeFileSync("app/(chat)/news/page.tsx", code);
