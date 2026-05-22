import { useMemo, useState } from "react";

export function useChef(recipe, { onStepFinished } = {}) {
  const [context, setContext] = useState({});

  if (!recipe?.steps) return { steps: [], startStep: () => {}, finishStep: () => {} };

  const steps = useMemo(
    () =>
      recipe.steps.map((step) => ({
        id: step.id,
        action: step.action,
        status: context[step.id]?.status || "unknown",
        duration: step.duration,
        ingredients: step.ingredients ?? [],
        dependsOn: step.dependsOn.filter(
          (dep) => context[dep]?.status !== "completed",
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
    const step = recipe.steps.find((s) => s.id === stepId);
    if (step && onStepFinished) {
      onStepFinished(step);
    }
  };

  return { steps, startStep, finishStep };
}
