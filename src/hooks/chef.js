import { useMemo, useState } from "react";

export function useChef(recipe) {
  const [context, setContext] = useState({});

  if (!recipe?.steps) return [];

  const steps = useMemo(
    () =>
      recipe.steps.map((step) => ({
        id: step.id,
        action: step.action,
        status: context[step.id]?.status || "unknown",
        duration: step.duration,
        dependsOn: step.dependsOn.filter(
          (dep) => context[dep]?.status != "completed",
        ),
      })),
    [context, recipe.steps],
  );

  const startStep = (stepId) => {
    setContext((prev) => ({
      ...prev,
      [stepId]: { status: "in_progress" },
    }));
  };

  const finishStep = (stepId) => {
    setContext((prev) => ({
      ...prev,
      [stepId]: { status: "completed" },
    }));
  };

  return { steps, startStep, finishStep };
}
