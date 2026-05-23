import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  AppleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  CitrusIcon,
  ClockFadingIcon,
  ClipboardCopyIcon,
  CookingPotIcon,
  DownloadIcon,
  FlameIcon,
  LibraryBigIcon,
  MicrowaveIcon,
  PencilIcon,
  PrinterIcon,
  RulerIcon,
  SaladIcon,
  UndoIcon,
  Users2Icon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { DIETS, findSubstitutions } from "@/lib/diet-substitutions";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { SmartExpiryPicker } from "./smart-expiry-picker";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";
import { RecipeFormDialog } from "./recipe-form";
import "./recipe.css";

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
          <CitrusIcon className="text-primary" size={18} />
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
                  <div key={ing} className="flex flex-col gap-2 py-2 pl-6">
                    <span className="text-sm font-medium">{ing}</span>
                    <div className="border rounded-lg p-2 bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1.5">Expiry date (optional)</p>
                      <SmartExpiryPicker
                        value={expiryDates[ing] ?? null}
                        onChange={(val) => setExpiry(ing, val)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="xs" onClick={() => addOne(ing)}>
                        Add to list
                      </Button>
                      <Button size="xs" variant="ghost" onClick={() => setExpandedIng(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div key={ing} className="flex items-center gap-2 py-1">
                    <XCircleIcon
                      size={16}
                      className="shrink-0 text-amber-400"
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

// ── Adjust to diet dialog ─────────────────────────────────────────────────

function AdjustToDietDialog({ open, onClose, ingredients, onApply }) {
  const [selectedDiet, setSelectedDiet] = useState(DIETS[0].id);
  // dismissed[ingredientIndex] = true means user said "keep original"
  const [dismissed, setDismissed] = useState({});

  const substitutions = useMemo(
    () => findSubstitutions(ingredients ?? [], selectedDiet),
    [ingredients, selectedDiet],
  );

  // Reset dismissals when diet changes
  const handleDietChange = (id) => {
    setSelectedDiet(id);
    setDismissed({});
  };

  const toggleDismiss = (idx) =>
    setDismissed((d) => ({ ...d, [idx]: !d[idx] }));

  const activeSubs = substitutions.filter((s) => !dismissed[s.ingredientIndex]);

  const apply = () => {
    // Build updated ingredients list
    const updated = [...(ingredients ?? [])];
    for (const sub of activeSubs) {
      // Preserve any leading quantity from the original ingredient string
      const original = sub.original;
      const qtyMatch = original.match(/^(\d+\.?\d*\s*(?:g|kg|ml|l|tbsp|tsp|cup|pcs)?)\s+/i);
      updated[sub.ingredientIndex] = qtyMatch
        ? `${qtyMatch[1]} ${sub.replacement}`
        : sub.replacement;
    }
    onApply(updated, selectedDiet);
    onClose();
  };

  const diet = DIETS.find((d) => d.id === selectedDiet);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AppleIcon size={16} className="text-green-600" />
            Adjust to diet
          </DialogTitle>
          <DialogDescription>
            Select a diet — substitutions are previewed below. Accept or dismiss
            each suggestion before applying.
          </DialogDescription>
        </DialogHeader>

        {/* Diet selector */}
        <div className="flex flex-wrap gap-2">
          {DIETS.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDietChange(d.id)}
              className={`diet-btn ${selectedDiet === d.id ? "diet-btn--active" : "diet-btn--idle"}`}
            >
              <span>{d.emoji}</span>
              {d.label}
            </button>
          ))}
        </div>

        {/* Substitution list */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1">
          {substitutions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <CheckIcon size={32} strokeWidth={0.8} className="text-green-500" />
              <p className="text-sm">
                No changes needed — all ingredients already suit the{" "}
                <strong>{diet?.label}</strong> diet.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-1">
                {activeSubs.length} of {substitutions.length} substitution
                {substitutions.length !== 1 ? "s" : ""} active
              </p>
              {substitutions.map((sub) => {
                const isDismissed = !!dismissed[sub.ingredientIndex];
                return (
                  <div
                    key={sub.ingredientIndex}
                    className={`diet-sub-item ${isDismissed ? "diet-sub-item--dismissed" : "diet-sub-item--active"}`}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span
                        className={`truncate ${isDismissed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {sub.original}
                      </span>
                      {!isDismissed && (
                        <>
                          <ArrowRightIcon
                            size={13}
                            className="shrink-0 text-muted-foreground"
                          />
                          <span className="font-medium text-green-700 truncate">
                            {sub.replacement}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => toggleDismiss(sub.ingredientIndex)}
                      title={isDismissed ? "Restore substitution" : "Keep original"}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isDismissed ? (
                        <UndoIcon size={14} />
                      ) : (
                        <XIcon size={14} />
                      )}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={apply}
            disabled={activeSubs.length === 0 && substitutions.length === 0}
          >
            <CheckIcon size={14} />
            Apply {activeSubs.length > 0 ? `${activeSubs.length} swap${activeSubs.length !== 1 ? "s" : ""}` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function recipeToPlainText(recipe) {
  const lines = [];
  lines.push(recipe.name);
  if (recipe.summary) lines.push("", recipe.summary);
  if (recipe.preperationTime) lines.push(`Prep time: ${recipe.preperationTime} min`);
  if (recipe.calories) lines.push(`Calories: ${recipe.calories} kcal`);
  if (recipe.guests) lines.push(`Servings: ${recipe.guests}`);
  if (recipe.ingredients?.length) {
    lines.push("", "Ingredients:");
    recipe.ingredients.forEach((ing) => lines.push(`  - ${ing}`));
  }
  if (recipe.steps?.length) {
    lines.push("", "Steps:");
    recipe.steps.forEach((step, i) =>
      lines.push(`  ${i + 1}. ${step.action}${step.duration ? ` (${step.duration} min)` : ""}`),
    );
  }
  return lines.join("\n");
}

function downloadRecipeJson(recipe) {
  const json = JSON.stringify(recipe, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${recipe.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function scaleIngredient(str, factor) {
  if (factor === 1) return str;
  const match = str.match(/^(\d+\.?\d*)\s*(g|kg|ml|l|tbsp|tsp|cup)?\s*(.+)$/i);
  if (!match) return str;
  const [, qty, unit, name] = match;
  const scaled = Math.round(Number(qty) * factor * 10) / 10;
  return `${scaled}${unit ? ` ${unit}` : ""} ${name}`.trim();
}

export function RecipeViewer({ recipeId }) {
  const go = useNavigate();
  const getRecipe = useRecipeStore((store) => store.getRecipe);
  const recipe = useMemo(() => getRecipe(recipeId), [getRecipe, recipeId]);
  const [editOpen, setEditOpen] = useState(false);
  const [scaledGuests, setScaledGuests] = useState(null); // null = use recipe default
  const [dietOpen, setDietOpen] = useState(false);
  // dietIngredients = null means show recipe original; non-null overrides
  const [dietIngredients, setDietIngredients] = useState(null);
  const [appliedDiet, setAppliedDiet] = useState(null);

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
      {/* Hero image */}
      <div className="relative">
        {recipe?.image ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="recipe-no-image">
            <FlameIcon size={48} strokeWidth={0.8} className="text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Title */}
      <h1 className="font-semibold text-2xl px-5 pt-3 pb-1 leading-tight">
        {recipe?.name}
      </h1>

      {/* ── Stats grid ── */}
      <div className="recipe-stats">
        {[
          {
            icon: FlameIcon,
            value: recipe?.calories
              ? recipe.calories >= 1000
                ? `${(recipe.calories / 1000).toFixed(1)}k`
                : recipe.calories
              : "—",
            label: "kcal",
          },
          { icon: Users2Icon, value: recipe?.guests || 1, label: "serv" },
          { icon: ClockFadingIcon, value: recipe?.preperationTime ? `${recipe.preperationTime}` : "—", label: "min" },
          { icon: SaladIcon, value: recipe?.ingredients?.length ?? "—", label: "ing" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="recipe-stat">
            <Icon size={14} className="text-muted-foreground mb-0.5" />
            <span className="font-semibold text-sm leading-none">{value}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-2 mx-5 mb-3">
        <Button onClick={() => go(`/cook/${recipeId}`)}>
          <CookingPotIcon size={15} />
          Cook
        </Button>
        <GroceriesSheet recipe={recipe} />
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <PencilIcon size={15} className="text-primary" />
          Edit
        </Button>
        <Button
          variant="outline"
          onClick={() => setDietOpen(true)}
          className={appliedDiet ? "border-green-500 text-green-700" : ""}
        >
          <AppleIcon size={15} className={appliedDiet ? "" : "text-primary"} />
          {appliedDiet
            ? `${DIETS.find((d) => d.id === appliedDiet)?.emoji} ${DIETS.find((d) => d.id === appliedDiet)?.label}`
            : "Adjust to diet"}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <RulerIcon size={15} className="text-primary" />
              Scale{scaledGuests !== null && scaledGuests !== (recipe.guests || 1)
                ? ` (${scaledGuests})`
                : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 flex flex-col gap-3 p-4">
            <p className="text-sm font-medium">Servings</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScaledGuests((g) => Math.max(1, (g ?? recipe.guests ?? 1) - 1))}
                className="scale-counter-btn"
              >
                −
              </button>
              <span className="flex-1 text-center text-lg font-light">
                {scaledGuests ?? recipe.guests ?? 1}
              </span>
              <button
                type="button"
                onClick={() => setScaledGuests((g) => (g ?? recipe.guests ?? 1) + 1)}
                className="scale-counter-btn"
              >
                +
              </button>
            </div>
            {scaledGuests !== null && scaledGuests !== (recipe.guests || 1) && (
              <button
                type="button"
                onClick={() => setScaledGuests(null)}
                className="text-xs text-muted-foreground hover:text-foreground text-center cursor-pointer"
              >
                Reset to {recipe.guests || 1}
              </button>
            )}
          </PopoverContent>
        </Popover>
        {/* Print */}
        <Button variant="outline" onClick={() => go(`/cook/${recipeId}/print`)}>
          <PrinterIcon size={15} className="text-primary" />
          Print
        </Button>
        {/* Copy as text */}
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(recipeToPlainText(recipe))
              .then(() => toast.success("Recipe copied to clipboard"))
              .catch(() => toast.error("Clipboard access denied"));
          }}
        >
          <ClipboardCopyIcon size={15} className="text-primary" />
          Copy
        </Button>
        {/* Export JSON */}
        <Button variant="outline" onClick={() => downloadRecipeJson(recipe)}>
          <DownloadIcon size={15} className="text-primary" />
          Export
        </Button>
      </div>
      <RecipeFormDialog open={editOpen} onOpenChange={setEditOpen} recipe={recipe} />
      <AdjustToDietDialog
        open={dietOpen}
        onClose={() => setDietOpen(false)}
        ingredients={recipe.ingredients}
        onApply={(updated, dietId) => {
          setDietIngredients(updated);
          setAppliedDiet(dietId);
        }}
      />
      {recipe?.summary && (
        <p className="px-5 pb-3 text-sm text-muted-foreground leading-relaxed">
          {recipe.summary}
        </p>
      )}
      {recipe.ingredients?.length > 0 && (() => {
        const baseGuests = recipe.guests || 1;
        const targetGuests = scaledGuests ?? baseGuests;
        const factor = targetGuests / baseGuests;
        const displayIngredients = dietIngredients ?? recipe.ingredients;
        const diet = DIETS.find((d) => d.id === appliedDiet);
        return (
          <div className="px-5 pb-3">
            <div className="flex items-baseline gap-2 pb-2 flex-wrap">
              <strong>Ingredients</strong>
              {factor !== 1 && (
                <span className="text-xs text-muted-foreground">
                  scaled ×{Math.round(factor * 10) / 10} for {targetGuests} serving{targetGuests !== 1 ? "s" : ""}
                </span>
              )}
              {diet && (
                <span className="text-xs font-medium text-green-700 flex items-center gap-1">
                  {diet.emoji} {diet.label}
                  <button
                    className="text-muted-foreground hover:text-foreground ml-1"
                    title="Reset to original ingredients"
                    onClick={() => { setDietIngredients(null); setAppliedDiet(null); }}
                  >
                    <XIcon size={11} />
                  </button>
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-1">
              {displayIngredients.map((ing, i) => {
                const wasSwapped = dietIngredients && dietIngredients[i] !== recipe.ingredients[i];
                return (
                  <li key={i} className={`text-sm flex items-start gap-2 ${wasSwapped ? "text-green-700" : ""}`}>
                    <span className="text-muted-foreground mt-0.5">·</span>
                    {scaleIngredient(ing, factor)}
                    {wasSwapped && <span className="text-xs text-muted-foreground ml-1 shrink-0">(swapped)</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })()}
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
