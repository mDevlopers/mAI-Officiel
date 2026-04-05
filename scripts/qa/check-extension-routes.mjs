import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const appDir = path.join(repoRoot, "app");
const extensionsFile = path.join(repoRoot, "app", "(chat)", "extensions", "page.tsx");

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRouteFromPageFile(pageFile) {
  const relative = path.relative(appDir, pageFile).replaceAll("\\", "/");
  const segments = relative.split("/").slice(0, -1);
  const filteredSegments = segments.filter((segment) => !/^\(.*\)$/.test(segment));
  const route = `/${filteredSegments.join("/")}`.replace(/\/$/, "");
  return route === "" ? "/" : route;
}

if (!existsSync(extensionsFile)) {
  console.error(`Fichier introuvable: ${extensionsFile}`);
  process.exit(1);
}

const extensionPageSource = readFileSync(extensionsFile, "utf8");
const hrefRegex = /href:\s*"([^"]+)"/g;
const extensionHrefs = new Set();

for (const match of extensionPageSource.matchAll(hrefRegex)) {
  extensionHrefs.add(match[1]);
}

const appFiles = walk(appDir).filter((file) => file.endsWith("/page.tsx") || file.endsWith("/page.ts"));
const existingRoutes = new Set(appFiles.map(toRouteFromPageFile));

const missingRoutes = [...extensionHrefs].filter((href) => !existingRoutes.has(href));

if (missingRoutes.length > 0) {
  console.error("❌ Routes manquantes pour les extensions:");
  for (const href of missingRoutes) {
    console.error(` - ${href}`);
  }
  process.exit(1);
}

console.log(`✅ ${extensionHrefs.size} extensions vérifiées, toutes les routes existent.`);
