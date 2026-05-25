import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  AppleIcon,
  ClipboardCopyIcon,
  ClockFadingIcon,
  CookingPotIcon,
  DownloadIcon,
  FlameIcon,
  LibraryBigIcon,
  PencilIcon,
  PrinterIcon,
  RulerIcon,
  SaladIcon,
  Users2Icon,
  XIcon,
} from "lucide-react";
import { DIETS } from "@/lib/diet-substitutions";
import { applyVariant } from "@/lib/variants";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import useRecipeStore from "@/store/recipe";
import { GroceriesSheet } from "./groceries-sheet";
import { AdjustToDietDialog } from "./adjust-to-diet-dialog";
import "./recipe.css";

function recipeToPlainText(recipe) {
  const lines = [];
  lines.push(recipe.name);
  if (recipe.summary) lines.push("", recipe.summary);
  if (recipe.prepTime) lines.push(`Prep time: ${recipe.prepTime} min`);
  if (recipe.calories) lines.push(`Calories: ${recipe.calories} kcal`);
  if (recipe.servings) lines.push(`Servings: ${recipe.servings}`);
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
  const baseRecipe = useMemo(() => getRecipe(recipeId), [getRecipe, recipeId]);

  // Variant selection — null means base recipe
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  // Merge selected variant's overrides over the base recipe
  const recipe = useMemo(
    () => applyVariant(baseRecipe, selectedVariantId),
    [baseRecipe, selectedVariantId],
  );

  const [scaledGuests, setScaledGuests] = useState(null); // null = use recipe default
  const [dietOpen, setDietOpen] = useState(false);
  // dietIngredients = null means show recipe original; non-null overrides
  const [dietIngredients, setDietIngredients] = useState(null);
  const [appliedDiet, setAppliedDiet] = useState(null);

  // Reset diet/scale whenever variant changes
  const handleVariantChange = (id) => {
    setSelectedVariantId(id);
    setDietIngredients(null);
    setAppliedDiet(null);
    setScaledGuests(null);
  };

  if (!baseRecipe)
    return (
      <div className="flex items-center justify-center flex-1">
        <LibraryBigIcon
          size={128}
          strokeWidth={0.4}
          className="stroke-neutral-200"
        />
      </div>
    );

  const hasVariants = baseRecipe.variants?.length > 0;

  // Build the cook URL — include ?variant= when a non-base variant is active
  const cookUrl = selectedVariantId
    ? `/cook/${recipeId}?variant=${selectedVariantId}`
    : `/cook/${recipeId}`;

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

      {/* ── Variant switcher ── */}
      {hasVariants && (
        <div className="flex items-center gap-1.5 px-5 pt-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleVariantChange(null)}
            className={`recipe-variant-pill ${selectedVariantId === null ? "recipe-variant-pill--active" : ""}`}
          >
            Original
          </button>
          {baseRecipe.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleVariantChange(v.id)}
              className={`recipe-variant-pill ${selectedVariantId === v.id ? "recipe-variant-pill--active" : ""}`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}
      {/* Show the active variant description if it has one */}
      {hasVariants && selectedVariantId && (() => {
        const v = baseRecipe.variants.find((vr) => vr.id === selectedVariantId);
        return v?.description ? (
          <p className="mx-5 mt-2 mb-0 text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded-lg px-3 py-2 border border-border/50">
            {v.description}
          </p>
        ) : null;
      })()}

      {/* Title */}
      <h1 className="font-semibold text-2xl px-5 pt-3 pb-1 leading-tight">
        {recipe?.name}
        {selectedVariantId && (() => {
          const v = baseRecipe.variants.find((vr) => vr.id === selectedVariantId);
          return v ? (
            <span className="ml-2 text-sm font-normal text-muted-foreground align-middle">
              — {v.name}
            </span>
          ) : null;
        })()}
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
          { icon: Users2Icon, value: recipe?.servings || 1, label: "serv" },
          { icon: ClockFadingIcon, value: recipe?.prepTime ? `${recipe.prepTime}` : "—", label: "min" },
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
        <Button onClick={() => go(cookUrl)}>
          <CookingPotIcon size={15} />
          Cook{selectedVariantId ? ` (${baseRecipe.variants.find((v) => v.id === selectedVariantId)?.name})` : ""}
        </Button>
        <GroceriesSheet recipe={recipe} />
        <Button variant="outline" onClick={() => go(`/recipe/${recipeId}/edit`)}>
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
              Scale{scaledGuests !== null && scaledGuests !== (recipe.servings || 1)
                ? ` (${scaledGuests})`
                : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 flex flex-col gap-3 p-4">
            <p className="text-sm font-medium">Servings</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScaledGuests((g) => Math.max(1, (g ?? recipe.servings ?? 1) - 1))}
                className="scale-counter-btn"
              >
                −
              </button>
              <span className="flex-1 text-center text-lg font-light">
                {scaledGuests ?? recipe.servings ?? 1}
              </span>
              <button
                type="button"
                onClick={() => setScaledGuests((g) => (g ?? recipe.servings ?? 1) + 1)}
                className="scale-counter-btn"
              >
                +
              </button>
            </div>
            {scaledGuests !== null && scaledGuests !== (recipe.servings || 1) && (
              <button
                type="button"
                onClick={() => setScaledGuests(null)}
                className="text-xs text-muted-foreground hover:text-foreground text-center cursor-pointer"
              >
                Reset to {recipe.servings || 1}
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
        const baseGuests = recipe.servings || 1;
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
