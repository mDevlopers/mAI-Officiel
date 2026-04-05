const fs = require("node:fs");

const file = "components/chat/suggested-actions.tsx";
let code = fs.readFileSync(file, "utf8");

const importLines = `import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";`;

code = code.replace('import { useMemo } from "react";', importLines);

const renderLogic = `
  const [shortcuts, setShortcuts] = useState<{name: string, url: string, icon: string}[]>([]);
  useEffect(() => {
    fetch("/api/user/shortcuts").then(r => r.json()).then(data => {
      if(Array.isArray(data)) setShortcuts(data);
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Raccourcis personnalisables (si non vide) */}
      {shortcuts.length > 0 && (
        <div className="flex w-full gap-2.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible mb-4">
          {shortcuts.map((sc, i) => (
            <Link key={i} href={sc.url} className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-muted transition-colors bg-card">
              <span className="text-2xl mb-2">{sc.icon}</span>
              <span className="text-sm font-medium">{sc.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Suggestions de base */}
      <div
        className="flex w-full gap-2.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible"
        data-testid="suggested-actions"
      >
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            key={\`suggested-action-\${suggestedAction}-\${index}\`}
            className={index > 1 ? "hidden sm:block" : "block"}
          >
            <Button
              variant="ghost"
              onClick={() => sendMessage({ role: "user", content: suggestedAction })}
              className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
            >
              <span className="font-medium">{suggestedAction}</span>
              <span className="text-muted-foreground">
                {suggestedAction}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
`;

code = code.replace(/  return \([\s\S]*\}\n/g, renderLogic + '\n');

fs.writeFileSync(file, code);
