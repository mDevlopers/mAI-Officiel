"use client";

import { PlugZap } from "lucide-react";
import { useMemo, useState } from "react";
import { pluginRegistry } from "@/lib/plugins/registry";

export default function PluginsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  const activeCount = useMemo(
    () => Object.values(enabled).filter(Boolean).length,
    [enabled]
  );

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-auto p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold">Plugins mAI</h1>
        <p className="text-sm text-muted-foreground">
          Architecture modulaire: activez/désactivez les modules et configurez leurs formulaires dynamiques.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Plugins actifs: {activeCount}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {pluginRegistry.map((plugin) => {
          const isEnabled = Boolean(enabled[plugin.id]);

          return (
            <section className="liquid-panel rounded-2xl p-4" key={plugin.id}>
              <div className="mb-3 flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-sm font-medium">
                  <PlugZap className="size-4" />
                  {plugin.name}
                </p>
                <button
                  className={`rounded-lg px-2 py-1 text-xs ${isEnabled ? "bg-black text-white" : "border"}`}
                  onClick={() =>
                    setEnabled((current) => ({ ...current, [plugin.id]: !current[plugin.id] }))
                  }
                  type="button"
                >
                  {isEnabled ? "Activé" : "Désactivé"}
                </button>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{plugin.description}</p>

              <div className="space-y-2">
                {plugin.fields.map((field) => (
                  <label className="block text-xs" key={field.key}>
                    {field.label}
                    {field.type === "select" ? (
                      <select className="mt-1 h-8 w-full rounded-lg border bg-background px-2 text-xs">
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="mt-1 h-8 w-full rounded-lg border bg-background px-2 text-xs"
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
