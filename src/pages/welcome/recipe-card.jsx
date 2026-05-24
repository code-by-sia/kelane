import { useNavigate } from "react-router";
import { ShoppingCartIcon } from "lucide-react";
import { isInStock, coverage } from "./utils";

export function RecipeCard({ recipe, fridgeItems }) {
  const navigate = useNavigate();
  const pct = coverage(recipe, fridgeItems);
  const missing = (recipe.ingredients ?? []).filter(
    (ing) => !isInStock(ing, fridgeItems),
  );
  const cat = recipe.categories?.[0];
  const href = cat ? `/categories/${cat}/${recipe.code}` : `/uncategorized`;

  return (
    <div onClick={() => navigate(href)} className="home-recipe-card">
      {recipe.image ? (
        <img src={recipe.image} alt={recipe.name} className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="home-recipe-card__placeholder">
          <ShoppingCartIcon size={32} strokeWidth={0.8} className="text-primary/40" />
        </div>
      )}
      <div className="home-recipe-card__overlay" />
      <div className="home-recipe-card__body">
        <p className="font-semibold text-sm leading-tight truncate">{recipe.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="home-recipe-card__progress-track">
            <div
              className={`h-full rounded-full ${pct === 1 ? "bg-green-400" : pct >= 0.6 ? "bg-amber-400" : "bg-red-400"}`}
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </div>
          <span className="text-xs text-white/80 shrink-0">{Math.round(pct * 100)}%</span>
        </div>
        {missing.length > 0 && (
          <p className="text-xs text-white/60 mt-0.5 truncate">
            Need: {missing.slice(0, 2).join(", ")}{missing.length > 2 ? ` +${missing.length - 2}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
