"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PLAN_STORAGE_KEY,
  type PlanDefinition,
  type PlanKey,
  parsePlanKey,
  planDefinitions,
  planUpgradeTargetByCurrentPlan,
} from "@/lib/subscription";

export function useSubscriptionPlan() {
  const [plan, setPlan] = useState<PlanKey>("free");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    const savedPlan = window.localStorage.getItem(PLAN_STORAGE_KEY);
    setPlan(parsePlanKey(savedPlan));
    setIsHydrated(true);
  }, []);

  const updatePlan = useCallback((nextPlan: PlanKey) => {
    setPlan(nextPlan);
    window.localStorage.setItem(PLAN_STORAGE_KEY, nextPlan);
  }, []);

  const activateByCode = useCallback(
    async (code: string): Promise<PlanKey | null> => {
      setIsActivating(true);

      try {
        const response = await fetch("/api/subscription/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as { plan?: PlanKey };
        const nextPlan = parsePlanKey(data.plan);

        updatePlan(nextPlan);
        return nextPlan;
      } catch {
        return null;
      } finally {
        setIsActivating(false);
      }
    },
    [updatePlan]
  );

  const currentPlanDefinition: PlanDefinition = useMemo(
    () => planDefinitions[plan],
    [plan]
  );

  const nextUpgradePlan = useMemo(() => {
    const targetPlan = planUpgradeTargetByCurrentPlan[plan];
    return targetPlan ? planDefinitions[targetPlan] : null;
  }, [plan]);

  return {
    activateByCode,
    currentPlanDefinition,
    isActivating,
    isHydrated,
    nextUpgradePlan,
    plan,
    setPlan: updatePlan,
  };
}
