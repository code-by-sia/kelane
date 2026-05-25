import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Loading } from "@/components/loading";
import { useChef } from "@/hooks/chef";
import Step from "../step";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";
import useHistoryStore from "@/store/history";
import "./cook.css";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  ListIcon,
  UsersIcon,
} from "lucide-react";
import { MetaPill } from "./meta-pill";

function parseIngredient(str) {
  const match = str.match(/^(\d+\.?\d*)\s*(g|kg|ml|l|tbsp|tsp|cup)?\s*(.+)$/i);
  if (!match) return { name: str.trim(), quantity: null, unit: "pcs" };
  const [, qty, unit, name] = match;
  return { name: name.trim(), quantity: Number(qty), unit: unit?.toLowerCase() || "pcs" };
}

export default function CookPage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const getRecipe = useRecipeStore((store) => store.getRecipe);
  const recipe = useMemo(() => getRecipe(recipeId), [getRecipe, recipeId]);
  const deductFridgeIngredient = useGroceriesStore((s) => s.deductFridgeIngredient);
  const startCooking = useHistoryStore((s) => s.startCooking);
  const completeCooking = useHistoryStore((s) => s.completeCooking);
  const historyIdRef = useRef(null);

  const [ingOpen, setIngOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());

  useEffect(() => {
    if (!recipe) return;
    historyIdRef.current = startCooking(recipe.code, recipe.name);
  }, [recipe?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStepFinished = useCallback(
    (step) => {
      if (!step.ingredients?.length || !recipe?.ingredients) return;
      const deducted = [];
      for (const ingName of step.ingredients) {
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

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const allDone = steps.length > 0 && steps.every((s) => s.status === "completed");
  const progress = steps.length > 0 ? completedCount / steps.length : 0;

  useEffect(() => {
    if (!steps.length || !allDone) return;
    if (historyIdRef.current) {
      completeCooking(historyIdRef.current);
      historyIdRef.current = null;
    }
  }, [allDone, completeCooking, steps.length]);

  return (
    <Loading isLoading={!recipe}>
      <div className="min-h-screen bg-background flex flex-col">

        <header className="cook-header">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 -ml-1" aria-label="Back">
            <ArrowLeftIcon size={18} />
          </Button>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate leading-tight">{recipe?.name}</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {allDone ? "All done!" : steps.length > 0 ? `${completedCount} of ${steps.length} steps` : "No steps"}
            </p>
          </div>

          {steps.length > 0 && (
            <div className="cook-progress-track" title={`${Math.round(progress * 100)}% done`}>
              <div className="cook-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          )}

          {recipe?.ingredients?.length > 0 && (
            <Button variant="ghost" size="icon" onClick={() => setIngOpen(true)} className="shrink-0" title="View ingredients">
              <ListIcon size={18} />
            </Button>
          )}
        </header>

        {recipe?.image && (
          <div className="cook-hero">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
            <div className="cook-hero__overlay" />
            <div className="cook-hero__pills">
              {recipe.prepTime && <MetaPill icon={<ClockIcon size={11} />}>{recipe.prepTime} min</MetaPill>}
              {recipe.calories && <MetaPill icon={<FlameIcon size={11} />}>{recipe.calories} kcal</MetaPill>}
              {recipe.servings && <MetaPill icon={<UsersIcon size={11} />}>{recipe.servings}</MetaPill>}
            </div>
          </div>
        )}

        <div className="cook-steps">
          {recipe?.summary && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3 px-1">{recipe.summary}</p>
          )}

          {steps.map((step, i) => (
            <Step
              key={step.id}
              step={step}
              stepNumber={i + 1}
              totalSteps={steps.length}
              onStart={() => startStep(step.id)}
              onDone={() => finishStep(step.id)}
            />
          ))}

          {steps.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
              <p className="text-sm">No cooking steps available for this recipe.</p>
              <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
            </div>
          )}
        </div>

        <div className="h-10 shrink-0" />

        {allDone && (
          <div className="cook-done-overlay">
            <div className="cook-done-icon">
              <CheckCircle2Icon size={52} className="text-green-500" strokeWidth={1.5} />
            </div>
            <div className="text-center max-w-xs">
              <h1 className="text-2xl font-semibold">{recipe?.name}</h1>
              <p className="text-muted-foreground mt-1.5">All steps complete — great cooking!</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>Back to recipe</Button>
              <Button onClick={() => navigate("/")}>Home</Button>
            </div>
          </div>
        )}

        <Sheet open={ingOpen} onOpenChange={setIngOpen}>
          <SheetContent side="right" className="w-80 sm:w-96">
            <SheetHeader className="mb-4">
              <SheetTitle>Ingredients</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col divide-y overflow-y-auto max-h-[calc(100vh-8rem)]">
              {recipe?.ingredients?.map((ing, i) => {
                const checked = checkedIngredients.has(i);
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setCheckedIngredients((prev) => {
                        const next = new Set(prev);
                        if (checked) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                    className="cook-ing-item"
                  >
                    <div className={`cook-ing-checkbox ${checked ? "cook-ing-checkbox--checked" : "cook-ing-checkbox--unchecked"}`}>
                      {checked && <CheckIcon size={10} className="text-primary-foreground" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm leading-snug ${checked ? "line-through text-muted-foreground" : ""}`}>
                      {ing}
                    </span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Loading>
  );
}
