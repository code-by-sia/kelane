/**
 * chat-blocks.jsx — rich inline content blocks for the Kejal assistant chat.
 *
 * Blocks are parsed from assistant messages and rendered below the text bubble:
 *   [RECIPE:name]   → ChatRecipeCard  — card for a recipe already in the collection
 *   [NEW_RECIPE]    → ChatAddRecipeButton — "Save to Kelane" opens the scanner
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronDownIcon, ChevronUpIcon,
  CheckCircle2Icon, CircleIcon,
  PlayIcon, ClockIcon, UsersIcon, FlameIcon,
  PlusIcon, BookOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";
import "./chat-blocks.css";

// ── Fridge availability helper ────────────────────────────────────────────────
// Strips leading quantities/units then fuzzy-matches against fridge item names.
function inFridge(ingredientStr, fridgeItems) {
  if (!fridgeItems.length) return false;
  const core = ingredientStr
    .toLowerCase()
    .replace(/^\d[\d/.,]*\s*(?:g|kg|ml|l|oz|lb|tbsp?|tsp?|cups?|pcs?|pinch|cloves?|bunch|head|small|large|medium)\s*/i, "")
    .split(/[,;(]/)[0]
    .trim();
  return fridgeItems.some((item) => {
    const fname = item.name.toLowerCase();
    return core.includes(fname) || fname.includes(core.split(" ")[0]);
  });
}

// ── Ingredient list with fridge status ───────────────────────────────────────
export function ChatIngredientList({ ingredients, fridgeItems = [] }) {
  const haveCount = ingredients.filter((ing) => inFridge(ing, fridgeItems)).length;

  return (
    <div className="cb-ingredient-wrap">
      {fridgeItems.length > 0 && (
        <p className="cb-ingredient-summary">
          {haveCount} of {ingredients.length} already in your fridge
        </p>
      )}
      <ul className="cb-ingredient-list">
        {ingredients.map((ing, i) => {
          const have = inFridge(ing, fridgeItems);
          return (
            <li key={i} className={`cb-ingredient ${have ? "cb-ingredient--have" : ""}`}>
              {have
                ? <CheckCircle2Icon size={12} className="shrink-0 text-green-500" />
                : <CircleIcon      size={12} className="shrink-0 text-muted-foreground/35" />}
              <span>{ing}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Steps list ────────────────────────────────────────────────────────────────
export function ChatStepsList({ steps }) {
  return (
    <ol className="cb-steps-list">
      {steps.map((step, i) => (
        <li key={step.id ?? i} className="cb-step">
          <span className="cb-step__num">{i + 1}</span>
          <div className="cb-step__body">
            <p className="cb-step__action">{step.action}</p>
            {step.duration && (
              <span className="cb-step__dur">
                <ClockIcon size={10} /> {step.duration} min
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ── Recipe card — for a known recipe already in the store ─────────────────────
export function ChatRecipeCard({ recipeName }) {
  const navigate   = useNavigate();
  const recipe     = useRecipeStore((s) =>
    s.recipes.find((r) => r.name.toLowerCase() === recipeName.toLowerCase().trim()) ??
    s.recipes.find((r) => r.name.toLowerCase().includes(recipeName.toLowerCase().trim()))
  );
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);

  const [showIng,   setShowIng]   = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  if (!recipe) return null;

  const detailPath = recipe.categories?.length
    ? `/categories/${encodeURIComponent(recipe.categories[0])}/${recipe.code}`
    : `/my-recipes`;

  return (
    <div className="cb-recipe-card">
      {recipe.image && (
        <img src={recipe.image} alt={recipe.name} className="cb-recipe-card__img" />
      )}

      <div className="cb-recipe-card__body">
        {/* Header */}
        <div>
          <h4 className="cb-recipe-card__name">{recipe.name}</h4>
          {recipe.summary && (
            <p className="cb-recipe-card__summary">{recipe.summary}</p>
          )}
        </div>

        {/* Stats */}
        <div className="cb-recipe-card__stats">
          {recipe.preperationTime && <span><ClockIcon size={11} /> {recipe.preperationTime}m</span>}
          {recipe.guests          && <span><UsersIcon size={11} /> {recipe.guests} servings</span>}
          {recipe.calories        && <span><FlameIcon size={11} /> {recipe.calories} kcal</span>}
        </div>

        {/* Category tags */}
        {recipe.categories?.length > 0 && (
          <div className="cb-recipe-card__tags">
            {recipe.categories.map((c) => (
              <Badge key={c} variant="secondary" className="text-[10px] h-4 px-1.5">{c}</Badge>
            ))}
          </div>
        )}

        {/* Ingredients accordion */}
        <button
          type="button"
          className="cb-recipe-card__accordion"
          onClick={() => setShowIng((v) => !v)}
        >
          <span>Ingredients · {recipe.ingredients.length}</span>
          {showIng ? <ChevronUpIcon size={13} /> : <ChevronDownIcon size={13} />}
        </button>
        {showIng && (
          <ChatIngredientList ingredients={recipe.ingredients} fridgeItems={fridgeItems} />
        )}

        {/* Steps accordion */}
        <button
          type="button"
          className="cb-recipe-card__accordion"
          onClick={() => setShowSteps((v) => !v)}
        >
          <span>Steps · {recipe.steps.length}</span>
          {showSteps ? <ChevronUpIcon size={13} /> : <ChevronDownIcon size={13} />}
        </button>
        {showSteps && <ChatStepsList steps={recipe.steps} />}

        {/* Action buttons */}
        <div className="cb-recipe-card__actions">
          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1"
            onClick={() => navigate(detailPath)}>
            <BookOpenIcon size={11} /> View
          </Button>
          <Button size="sm" className="flex-1 h-7 text-xs gap-1"
            onClick={() => navigate(`/cook/${recipe.code}`)}>
            <PlayIcon size={11} /> Cook Now
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── "Save to Kelane" button — opens the recipe scanner with prefilled text ────
export function ChatAddRecipeButton({ messageText, onScan }) {
  return (
    <button type="button" className="cb-add-recipe-btn" onClick={() => onScan(messageText)}>
      <PlusIcon size={13} />
      Save Recipe to Kelane
    </button>
  );
}
