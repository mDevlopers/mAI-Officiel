"use client";

import { Boxes, PlugZap, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { pluginRegistry } from "@/lib/plugins/registry";

export default function PluginsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<
    "all" | "texte" | "utilitaire" | "voix"
  >("all");

  const activeCount = useMemo(
    () => Object.values(enabled).filter(Boolean).length,
    [enabled]
  );
  const filteredPlugins = useMemo(
    () =>
      pluginRegistry.filter((plugin) => {
        const matchCategory =
          category === "all" ? true : plugin.category === category;
        const matchSearch = plugin.name
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchCategory && matchSearch;
      }),
    [category, search]
  );

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-auto p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold">Plugins mAI</h1>
        <p className="text-sm text-muted-foreground">
          Architecture modulaire: activez/désactivez les modules et configurez
          leurs formulaires dynamiques.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Plugins actifs: {activeCount}
        </p>
      </header>
      <div className="liquid-panel flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <label className="relative min-w-[220px] flex-1 text-xs">
          <Search className="pointer-events-none absolute top-2.5 left-2 size-3.5 text-muted-foreground" />
          <input
            className="h-8 w-full rounded-lg border bg-background pl-7 pr-2 text-xs"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un plugin..."
            type="search"
            value={search}
          />
        </label>
        <select
          className="h-8 rounded-lg border bg-background px-2 text-xs"
          onChange={(event) =>
            setCategory(event.target.value as typeof category)
          }
          value={category}
        >
          <option value="all">Toutes catégories</option>
          <option value="texte">Texte</option>
          <option value="utilitaire">Utilitaire</option>
          <option value="voix">Voix</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredPlugins.map((plugin) => {
          const isEnabled = Boolean(enabled[plugin.id]);

          return (
            <section className="liquid-panel rounded-2xl p-4" key={plugin.id}>
              <div className="mb-3 flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-sm font-medium">
                  <PlugZap className="size-4" />
                  {plugin.name}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] uppercase">
                  <Boxes className="size-3" />
                  {plugin.category}
                </span>
                <button
                  className={`rounded-lg px-2 py-1 text-xs ${isEnabled ? "bg-black text-white" : "border"}`}
                  onClick={() =>
                    setEnabled((current) => ({
                      ...current,
                      [plugin.id]: !current[plugin.id],
                    }))
                  }
                  type="button"
                >
                  {isEnabled ? "Activé" : "Désactivé"}
                </button>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                {plugin.description}
              </p>

              <div className="space-y-2">
                {plugin.fields.map((field) => (
                  <label
                    className="block text-xs"
                    htmlFor={`${plugin.id}-${field.key}`}
                    key={field.key}
                  >
                    {field.label}
                    {field.type === "select" ? (
                      <select
                        className="mt-1 h-8 w-full rounded-lg border bg-background px-2 text-xs"
                        id={`${plugin.id}-${field.key}`}
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="mt-1 h-8 w-full rounded-lg border bg-background px-2 text-xs"
                        id={`${plugin.id}-${field.key}`}
                        placeholder={field.placeholder}
                        type={field.type}
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
