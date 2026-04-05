const fs = require('fs');
let code = fs.readFileSync('app/(chat)/news/page.tsx', 'utf8');
code = code.replace('import jsPDF from "jspdf";', 'import { jsPDF } from "jspdf";');
fs.writeFileSync('app/(chat)/news/page.tsx', code);
