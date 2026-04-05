"use client";

import { useEffect, useMemo, useState } from "react";
import { type ChatModel, chatModels } from "@/lib/ai/models";

type ApiModel = {
  id: string;
  name?: string;
  provider?: string;
};

type ApiModelsPayload = {
  models?: ApiModel[];
};

/**
 * Expose la liste de modèles la plus large possible côté client.
 * - fallback: modèles locaux de l'application
 * - surcouche: /api/models (si disponible)
 */
export function useAvailableModels() {
  const [apiModels, setApiModels] = useState<ChatModel[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/models")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: ApiModelsPayload | null) => {
        if (!isMounted) {
          return;
        }

        const models = payload?.models;
        if (!Array.isArray(models) || models.length === 0) {
          setApiModels(null);
          return;
        }

        const sanitized: ChatModel[] = models
          .filter(
            (item) => typeof item?.id === "string" && item.id.trim().length > 0
          )
          .map((item) => ({
            description: "",
            id: item.id,
            name: item.name?.trim() || item.id,
            provider:
              item.provider?.trim() || item.id.split("/")[0] || "custom",
          }));

        setApiModels(sanitized);
      })
      .catch(() => {
        if (isMounted) {
          setApiModels(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const models = useMemo(() => {
    const source = apiModels && apiModels.length > 0 ? apiModels : chatModels;

    const unique = new Map<string, ChatModel>();
    for (const model of source) {
      if (!unique.has(model.id)) {
        unique.set(model.id, model);
      }
    }

    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [apiModels]);

  return {
    isLoading,
    models,
  };
}
