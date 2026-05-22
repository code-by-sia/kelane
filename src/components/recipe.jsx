import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AppleIcon,
  CheckCircle2Icon,
  CitrusIcon,
  ClockFadingIcon,
  CookingPotIcon,
  FlameIcon,
  LibraryBigIcon,
  MicrowaveIcon,
  RulerIcon,
  SaladIcon,
  Users2Icon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";

function parseIngredient(str) {
  const match = str.match(/^(\d+\.?\d*)\s*(g|kg|ml|l|tbsp|tsp|cup)?\s*(.+)$/i);
  if (!match) return { name: str.trim(), quantity: null, unit: "pcs" };
  const [, qty, unit, name] = match;
  return { name: name.trim(), quantity: Number(qty), unit: unit?.toLowerCase() || "pcs" };
}

function isInStock(ingredient, fridgeItems) {
  return fridgeItems.some((item) =>
    ingredient.toLowerCase().includes(item.name.toLowerCase()),
  );
}

function findStockMatch(ingredient, fridgeItems) {
  return fridgeItems.find((item) =>
    ingredient.toLowerCase().includes(item.name.toLowerCase()),
  );
}

function GroceriesSheet({ recipe }) {
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  const { inStock, missing } = useMemo(() => {
    const ingredients = recipe.ingredients || [];
    return {
      inStock: ingredients.filter((ing) => isInStock(ing, fridgeItems)),
      missing: ingredients.filter((ing) => !isInStock(ing, fridgeItems)),
    };
  }, [recipe.ingredients, fridgeItems]);

  const addOne = (ingredient) => {
    const parsed = parseIngredient(ingredient);
    addToBuyItem(parsed);
    toast.success(`Added "${parsed.name}" to buy list`);
  };

  const addAllMissing = () => {
    missing.forEach((ing) => addToBuyItem(parseIngredient(ing)));
    toast.success(`Added ${missing.length} item${missing.length !== 1 ? "s" : ""} to buy list`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <CitrusIcon className="stroke-rose-600" size={18} />
          Grocories
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Groceries</SheetTitle>
          <SheetDescription>
            {recipe.name} · {inStock.length}/{recipe.ingredients?.length ?? 0} ingredients in stock
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-6">
          {inStock.length > 0 && (
            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                In stock
              </h3>
              {inStock.map((ing) => {
                const match = findStockMatch(ing, fridgeItems);
                return (
                  <div key={ing} className="flex items-center gap-2 py-1">
                    <CheckCircle2Icon size={16} className="shrink-0 text-green-500" />
                    <span className="flex-1 text-sm">{ing}</span>
                    {match && (
                      <span className="text-xs text-muted-foreground">
                        via "{match.name}"
                      </span>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {missing.length > 0 && (
            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Missing
              </h3>
              {missing.map((ing) => (
                <div key={ing} className="flex items-center gap-2 py-1">
                  <XCircleIcon size={16} className="shrink-0 text-rose-400" />
                  <span className="flex-1 text-sm">{ing}</span>
                  <Button size="xs" variant="outline" onClick={() => addOne(ing)}>
                    Add
                  </Button>
                </div>
              ))}
            </section>
          )}

          {missing.length === 0 && inStock.length > 0 && (
            <p className="text-sm text-center text-muted-foreground py-4">
              All ingredients are in stock.
            </p>
          )}
        </div>

        {missing.length > 0 && (
          <SheetFooter>
            <Button className="w-full" onClick={addAllMissing}>
              Add all {missing.length} missing to buy list
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function RecipeViewer({ recipeId }) {
  const go = useNavigate();
  const getRecipe = useRecipeStore((store) => store.getRecipe);
  const recipe = useMemo(() => getRecipe(recipeId), [getRecipe, recipeId]);

  if (!recipe)
    return (
      <div className="flex items-center justify-center flex-1">
        <LibraryBigIcon
          size={128}
          strokeWidth={0.4}
          className="stroke-neutral-200"
        />
      </div>
    );

  return (
    <div className="relative flex-1">
      <div
        style={{
          backgroundImage: `url('${recipe?.image}')`,
          maskImage: `linear-gradient(to bottom, black, transparent)`,
        }}
        className={`h-32 w-full bg-cover bg-center`}
      ></div>
      <h1 className="flex flex-col mb-2 mx-6 z-10 font-extralight -mt-4">
        <span className="text-3xl">{recipe?.name}</span>
      </h1>
      <div className="flex gap-2 mx-3 divide-x text-gray-600 z-10">
        <Button variant="ghost">
          <FlameIcon size={16} />
          {recipe?.calories >= 1000
            ? Math.round(recipe.calories / 1000) + " kilo"
            : recipe?.calories || "N/A"}{" "}
          calories
        </Button>
        <Button variant="ghost">
          {recipe.guests || 1} <Users2Icon size={16} />
        </Button>
        <Button variant="ghost">
          <ClockFadingIcon size={16} />
          {recipe.preperationTime} minutes
        </Button>
        <Button variant="ghost">
          <SaladIcon size={16} />
          {recipe.ingredients?.length} ingredients
        </Button>
        <Button variant="ghost">
          <MicrowaveIcon size={16} />
          {recipe.tools?.length} tools
        </Button>
      </div>
      <div className="flex gap-2 m-3 divide-x text-rose-950">
        <Button variant="outline" onClick={() => go(`/cook/${recipeId}`)}>
          <CookingPotIcon className="stroke-rose-600" size={18} />
          Cook
        </Button>
        <GroceriesSheet recipe={recipe} />
        <Button variant="outline">
          <AppleIcon className="stroke-rose-600" size={18} />
          Adjust to diet
        </Button>
        <Button variant="outline">
          <RulerIcon className="stroke-rose-600" size={18} />
          Adjust
        </Button>
      </div>
      <p className="p-3 px-5">
        <strong className="block pb-2">Summary:</strong>
        {recipe?.summary || "No description available"}
      </p>
      <div className="px-5">
        <strong className="block pb-2">Steps:</strong>
        <ol className="flex flex-col gap-3">
          {recipe.steps?.map((step, index) => (
            <li key={step.id} className="flex gap-2">
              <small className="p-1 font-semibold text-gray-500">
                {index + 1}
              </small>
              <span className="flex-1">{step.action}</span>
              <Badge>{step.duration}m</Badge>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
