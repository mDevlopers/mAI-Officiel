const fs = require("fs");

// Fix app/(chat)/studio/page.tsx
let studioCode = fs.readFileSync("app/(chat)/studio/page.tsx", "utf8");
studioCode = studioCode.replace(
  /const \[prompt: finalPrompt, setPrompt\] = useState\(""\);/g,
  'const [prompt, setPrompt] = useState("");'
);
fs.writeFileSync("app/(chat)/studio/page.tsx", studioCode);

// Fix app/(chat)/projects/page.tsx
let projectsCode = fs.readFileSync("app/(chat)/projects/page.tsx", "utf8");
projectsCode = projectsCode.replace(
  /<\/div>\n {12}\)\)\)\}\n {10}<\/div>/g,
  "</Link>\n            ))}\n          </div>"
);
// We also need to fix the stray </div> issue inside Link
projectsCode = projectsCode.replace(
  /<\/div>\n {14}<\/Link>\n {12}\)\)\)}/g,
  "</Link>\n            ))}"
);

fs.writeFileSync("app/(chat)/projects/page.tsx", projectsCode);
