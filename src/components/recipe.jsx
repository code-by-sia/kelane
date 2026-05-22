import { useMemo, useState, useCallback } from "react";
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
  PencilIcon,
  RulerIcon,
  SaladIcon,
  Users2Icon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
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
import { RecipeFormDialog } from "./recipe-form";

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
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  const { inStock, missing } = useMemo(() => {
    const ingredients = recipe.ingredients || [];
    return {
      inStock: ingredients.filter((ing) => isInStock(ing, fridgeItems)),
      missing: ingredients.filter((ing) => !isInStock(ing, fridgeItems)),
    };
  }, [recipe.ingredients, fridgeItems]);

  const [expandedIng, setExpandedIng] = useState(null);
  const [expiryDates, setExpiryDates] = useState({});
  const [onlyNew, setOnlyNew] = useState(true);
  const [addedAll, setAddedAll] = useState(false);

  const isAlreadyInList = useCallback(
    (ingredient) =>
      toBuyItems.some((t) =>
        parseIngredient(ingredient).name.toLowerCase() === t.name.toLowerCase(),
      ),
    [toBuyItems],
  );

  const effectiveMissing = useMemo(
    () => (onlyNew ? missing.filter((ing) => !isAlreadyInList(ing)) : missing),
    [missing, onlyNew, isAlreadyInList],
  );

  const setExpiry = (ing, val) =>
    setExpiryDates((d) => ({ ...d, [ing]: val }));

  const addOne = (ingredient) => {
    const parsed = parseIngredient(ingredient);
    addToBuyItem({ ...parsed, expiresAt: expiryDates[ingredient] || null });
    toast.success(`Added "${parsed.name}" to buy list`);
    setExpandedIng(null);
  };

  const addAllMissing = () => {
    effectiveMissing.forEach((ing) => {
      addToBuyItem({
        ...parseIngredient(ing),
        expiresAt: expiryDates[ing] || null,
      });
    });
    const n = effectiveMissing.length;
    toast.success(`Added ${n} item${n !== 1 ? "s" : ""} to buy list`);
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
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
            {recipe.name} · {inStock.length}/{recipe.ingredients?.length ?? 0}{" "}
            ingredients in stock
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
                    <CheckCircle2Icon
                      size={16}
                      className="shrink-0 text-green-500"
                    />
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
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Missing
                </h3>
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id="only-new"
                    checked={onlyNew}
                    onCheckedChange={(v) => setOnlyNew(!!v)}
                  />
                  <Label htmlFor="only-new" className="text-xs text-muted-foreground cursor-pointer">
                    Skip already in list
                  </Label>
                </div>
              </div>
              {effectiveMissing.map((ing) =>
                expandedIng === ing ? (
                  <div key={ing} className="flex flex-col gap-1 py-1 pl-6">
                    <span className="text-sm font-medium">{ing}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        className="flex-1 h-7 text-xs"
                        placeholder="Expiry (optional)"
                        value={expiryDates[ing] || ""}
                        onChange={(e) => setExpiry(ing, e.target.value)}
                        autoFocus
                      />
                      <Button size="xs" onClick={() => addOne(ing)}>
                        Add to list
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setExpandedIng(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div key={ing} className="flex items-center gap-2 py-1">
                    <XCircleIcon
                      size={16}
                      className="shrink-0 text-rose-400"
                    />
                    <span className="flex-1 text-sm">{ing}</span>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setExpandedIng(ing)}
                    >
                      Add
                    </Button>
                  </div>
                ),
              )}
              {onlyNew && missing.length > effectiveMissing.length && (
                <p className="text-xs text-muted-foreground mt-1">
                  {missing.length - effectiveMissing.length} already in your buy list
                </p>
              )}
            </section>
          )}

          {missing.length === 0 && inStock.length > 0 && (
            <p className="text-sm text-center text-muted-foreground py-4">
              All ingredients are in stock.
            </p>
          )}
        </div>

        {effectiveMissing.length > 0 && (
          <SheetFooter>
            <Button
              className={`w-full transition-colors ${addedAll ? "bg-green-600 hover:bg-green-600" : ""}`}
              onClick={addAllMissing}
              disabled={addedAll}
            >
              {addedAll
                ? `Added ${effectiveMissing.length} item${effectiveMissing.length !== 1 ? "s" : ""}!`
                : `Add ${effectiveMissing.length} missing to buy list`}
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
  const [editOpen, setEditOpen] = useState(false);

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
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <PencilIcon className="stroke-rose-600" size={18} />
          Edit
        </Button>
        <Button variant="outline">
          <AppleIcon className="stroke-rose-600" size={18} />
          Adjust to diet
        </Button>
        <Button variant="outline">
          <RulerIcon className="stroke-rose-600" size={18} />
          Adjust
        </Button>
      </div>
      <RecipeFormDialog open={editOpen} onOpenChange={setEditOpen} recipe={recipe} />
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
