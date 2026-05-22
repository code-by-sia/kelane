import { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Loading } from "@/components/loading";
import { useChef } from "@/hooks/chef";
import Step from "./step";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";

// Parse "500g flour" → { name: "flour", quantity: 500, unit: "g" }
function parseIngredient(str) {
  const match = str.match(/^(\d+\.?\d*)\s*(g|kg|ml|l|tbsp|tsp|cup)?\s*(.+)$/i);
  if (!match) return { name: str.trim(), quantity: null, unit: "pcs" };
  const [, qty, unit, name] = match;
  return { name: name.trim(), quantity: Number(qty), unit: unit?.toLowerCase() || "pcs" };
}

export default function CookPage() {
  const { recipeId } = useParams();
  const getRecipe = useRecipeStore((store) => store.getRecipe);
  const recipe = useMemo(() => getRecipe(recipeId), [getRecipe, recipeId]);
  const deductFridgeIngredient = useGroceriesStore((s) => s.deductFridgeIngredient);

  const handleStepFinished = useCallback(
    (step) => {
      if (!step.ingredients?.length || !recipe?.ingredients) return;

      const deducted = [];
      for (const ingName of step.ingredients) {
        // Find the full recipe ingredient string that matches this name
        const recipeIng = recipe.ingredients.find((ri) =>
          ri.toLowerCase().includes(ingName.toLowerCase()),
        );
        if (!recipeIng) continue;
        const { name, quantity } = parseIngredient(recipeIng);
        deductFridgeIngredient(name, quantity);
        deducted.push(name);
      }

      if (deducted.length > 0) {
        toast.info(`Used from fridge: ${deducted.join(", ")}`);
      }
    },
    [recipe, deductFridgeIngredient],
  );

  const { steps, startStep, finishStep } = useChef(recipe, {
    onStepFinished: handleStepFinished,
  });

  return (
    <Loading isLoading={!recipe}>
      <div className="relative flex-1 flex flex-col items-center justify-center h-screen">
        <div
          style={{
            backgroundImage: `url('${recipe?.image}')`,
            maskImage: "linear-gradient(to up, black 60%, transparent)",
            opacity: "0.8",
          }}
          className="bg-cover w-full h-screen absolute top-0 left-0 -z-10"
        />

        <div className="z-10 flex items-center flex-1 p-6 w-full">
          <section className="z-10 m-6 border p-6 rounded-xl bg-neutral-50 shadow-xl">
            <h1 className="inline-block text-3xl p-3 mb-2 font-extralight">
              {recipe?.name}
            </h1>
            <br />
            {recipe?.summary && (
              <p className="px-2 inline-block mb-6 max-w-1/2">{recipe?.summary}</p>
            )}
            {steps && (
              <ol className="flex flex-col gap-2 my-2">
                {steps.map((step) => (
                  <Step
                    key={step.id}
                    step={step}
                    onStart={() => startStep(step.id)}
                    onDone={() => finishStep(step.id)}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </Loading>
  );
}
