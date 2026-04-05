const fs = require('fs');
let code = fs.readFileSync('app/(chat)/news/page.tsx', 'utf8');
code = code.replace(
  'import { jsPDF } from "jspdf";',
  ''
);

const downloadMethod = `  const downloadReport = async (format: "txt" | "md" | "pdf" | "docx") => {
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
      const { jsPDF } = await import("jspdf");
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
  };`;

code = code.replace(/const downloadReport = async \(format.+?\};\s*\n/s, downloadMethod + '\n');
fs.writeFileSync('app/(chat)/news/page.tsx', code);
