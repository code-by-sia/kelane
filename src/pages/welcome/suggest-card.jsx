import { RecipeCard } from "./recipe-card";

export function SuggestCard({ recipe, fridgeItems, chip }) {
  return (
    <div className="flex flex-col gap-1.5">
      <RecipeCard recipe={recipe} fridgeItems={fridgeItems} />
      {chip && <span className="suggest-chip">{chip}</span>}
    </div>
  );
}
