import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { RefrigeratorIcon, ShoppingCartIcon } from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useSetupStore from "@/store/setup";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";

function isInStock(ingredient, fridgeItems) {
  return fridgeItems.some((item) =>
    ingredient.toLowerCase().includes(item.name.toLowerCase()),
  );
}

function coverage(recipe, fridgeItems) {
  const total = recipe.ingredients?.length ?? 0;
  if (total === 0) return 0;
  const inStock = (recipe.ingredients ?? []).filter((ing) =>
    isInStock(ing, fridgeItems),
  ).length;
  return inStock / total;
}

function RecipeCard({ recipe, fridgeItems }) {
  const navigate = useNavigate();
  const pct = coverage(recipe, fridgeItems);
  const missing = (recipe.ingredients ?? []).filter(
    (ing) => !isInStock(ing, fridgeItems),
  );
  const cat = recipe.categories?.[0];
  const href = cat ? `/categories/${cat}/${recipe.code}` : `/uncategorized`;

  return (
    <div
      onClick={() => navigate(href)}
      className="flex gap-3 p-3 rounded-xl border bg-card hover:bg-accent/40 cursor-pointer transition-colors"
    >
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-16 h-16 rounded-lg object-cover shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm">{recipe.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct === 1 ? "bg-green-500" : pct >= 0.6 ? "bg-amber-400" : "bg-rose-300"}`}
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {Math.round(pct * 100)}%
          </span>
        </div>
        {missing.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            Missing: {missing.slice(0, 3).join(", ")}
            {missing.length > 3 ? ` +${missing.length - 3}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, recipes, fridgeItems, emptyText }) {
  if (recipes.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
        {title}
        <Badge variant="outline" className="ml-2 text-xs font-normal normal-case tracking-normal">
          {recipes.length}
        </Badge>
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => (
          <RecipeCard key={r.code} recipe={r} fridgeItems={fridgeItems} />
        ))}
      </div>
    </section>
  );
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const completed = useSetupStore((s) => s.completed);
  const recipes = useRecipeStore((s) => s.recipes);
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);

  useEffect(() => {
    if (!completed) navigate("/setup");
  }, [completed, navigate]);

  const { canCook, almostReady, needShopping } = useMemo(() => {
    const withPct = recipes.map((r) => ({ r, pct: coverage(r, fridgeItems) }));
    return {
      canCook: withPct.filter(({ pct }) => pct === 1).map(({ r }) => r),
      almostReady: withPct.filter(({ pct }) => pct >= 0.6 && pct < 1).map(({ r }) => r),
      needShopping: withPct.filter(({ pct }) => pct < 0.6).map(({ r }) => r),
    };
  }, [recipes, fridgeItems]);

  return (
    <SidebarPage title="Explore">
      <div className="p-6 flex flex-col gap-8 max-w-4xl">
        {fridgeItems.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <RefrigeratorIcon size={56} strokeWidth={0.6} className="text-muted-foreground" />
            <div>
              <p className="font-medium">Your fridge is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add items to your fridge/stock to see what you can cook.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/groceries")}>
              <ShoppingCartIcon size={14} />
              Go to Groceries
            </Button>
          </div>
        ) : (
          <>
            <Section
              title="Can cook now"
              recipes={canCook}
              fridgeItems={fridgeItems}
            />
            <Section
              title="Almost ready"
              recipes={almostReady}
              fridgeItems={fridgeItems}
            />
            <Section
              title="Need shopping"
              recipes={needShopping}
              fridgeItems={fridgeItems}
            />
            {canCook.length === 0 && almostReady.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recipes match your current fridge items closely.
              </p>
            )}
          </>
        )}
      </div>
    </SidebarPage>
  );
}
