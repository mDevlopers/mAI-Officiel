const fs = require("fs");
let code = fs.readFileSync("app/(chat)/projects/page.tsx", "utf8");

code = code.replace(
  /<\/div>\n {14}<\/div>\n {12}\)\)\}/g,
  "</div>\n              </Link>\n            ))}"
);

fs.writeFileSync("app/(chat)/projects/page.tsx", code);
