const fs = require("fs");
let code = fs.readFileSync("app/(chat)/projects/page.tsx", "utf8");

if (!code.includes('import Link from "next/link";')) {
  code = code.replace(
    'import { useState } from "react";',
    'import { useState } from "react";\nimport Link from "next/link";'
  );
}

// Remplacer le div de carte de projet par un composant cliquable tout en gardant le bouton paramètres
code = code.replace(
  /<div\s+className="group relative flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"\s+key={project\.id}\s*>/g,
  `<Link\n                href={\`/projects/\${project.id}\`}\n                className="group relative flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"\n                key={project.id}\n              >`
);

// Changer la fin de la carte de </div> à </Link>
code = code.replace(
  /<\/div>\n {12}\)}\)\}\n {10}<\/div>/g,
  "</Link>\n            )))}\n          </div>"
);

// Remplacer le bouton Settings par un Link ou empêcher la propagation pour Settings
code = code.replace(
  /<Button\s+className="size-8"\s+size="icon"\s+title="Paramètres \(Bientôt\)"\s+variant="ghost"\s*>\s*<SettingsIcon className="size-4" \/>\s*<\/Button>/g,
  `<Link href={\`/projects/\${project.id}\`} onClick={(e) => e.stopPropagation()}>\n                    <Button\n                      className="size-8"\n                      size="icon"\n                      title="Paramètres"\n                      variant="ghost"\n                    >\n                      <SettingsIcon className="size-4" />\n                    </Button>\n                  </Link>`
);

fs.writeFileSync("app/(chat)/projects/page.tsx", code);
