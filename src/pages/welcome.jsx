import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { differenceInDays, formatDistanceToNow, parseISO } from "date-fns";
import { AlertTriangleIcon, ClockIcon, RefrigeratorIcon, ShoppingCartIcon } from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useSetupStore from "@/store/setup";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";
import useHistoryStore from "@/store/history";

const EXPIRY_WARN_DAYS = 5;

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
      className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
    >
      {recipe.image ? (
        <img src={recipe.image} alt={recipe.name} className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/8 to-primary/15 flex items-center justify-center">
          <ShoppingCartIcon size={32} strokeWidth={0.8} className="text-primary/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <p className="font-semibold text-sm leading-tight truncate">{recipe.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
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
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
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
  const getRecipe = useRecipeStore((s) => s.getRecipe);
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const historyEntries = useHistoryStore((s) => s.entries);

  useEffect(() => {
    if (!completed) navigate("/setup");
  }, [completed, navigate]);

  const { canCook, almostReady, needShopping, preventExpiry, expiringNames } = useMemo(() => {
    const withPct = recipes.map((r) => ({ r, pct: coverage(r, fridgeItems) }));

    // Items expiring within EXPIRY_WARN_DAYS (today or in the next N days)
    const expiringItems = fridgeItems.filter((item) => {
      if (!item.expiresAt) return false;
      const days = differenceInDays(parseISO(item.expiresAt), new Date());
      return days >= 0 && days <= EXPIRY_WARN_DAYS;
    });

    // Recipes that use the most expiring ingredients, sorted descending
    const preventExpiry =
      expiringItems.length > 0
        ? recipes
            .map((recipe) => {
              const matchCount = expiringItems.filter((item) =>
                (recipe.ingredients ?? []).some((ing) =>
                  ing.toLowerCase().includes(item.name.toLowerCase()),
                ),
              ).length;
              return { recipe, matchCount };
            })
            .filter(({ matchCount }) => matchCount > 0)
            .sort((a, b) => b.matchCount - a.matchCount)
            .slice(0, 9)
            .map(({ recipe }) => recipe)
        : [];

    return {
      canCook: withPct.filter(({ pct }) => pct === 1).map(({ r }) => r),
      almostReady: withPct.filter(({ pct }) => pct >= 0.6 && pct < 1).map(({ r }) => r),
      needShopping: withPct.filter(({ pct }) => pct < 0.6).map(({ r }) => r),
      preventExpiry,
      expiringNames: expiringItems.map((i) => i.name),
    };
  }, [recipes, fridgeItems]);

  // Deduplicated recently cooked recipes (last 6 unique, completed sessions only)
  const recentlyCooked = useMemo(() => {
    const seen = new Set();
    return historyEntries
      .filter((e) => !!e.completedAt)
      .filter((e) => {
        if (seen.has(e.recipeCode)) return false;
        seen.add(e.recipeCode);
        return true;
      })
      .slice(0, 6)
      .map((entry) => ({ entry, recipe: getRecipe(entry.recipeCode) }))
      .filter(({ recipe }) => !!recipe);
  }, [historyEntries, getRecipe]);

  return (
    <SidebarPage title="Explore">
      <div className="p-4 sm:p-6 flex flex-col gap-8 max-w-4xl">
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
            {preventExpiry.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon size={14} className="text-amber-500 shrink-0" />
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-amber-700">
                    Use before they expire
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-xs font-normal normal-case tracking-normal text-amber-700 border-amber-300"
                  >
                    {preventExpiry.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                  These recipes use{" "}
                  <span className="text-amber-700 font-medium">
                    {expiringNames.slice(0, 3).join(", ")}
                    {expiringNames.length > 3 ? ` +${expiringNames.length - 3} more` : ""}
                  </span>{" "}
                  — expiring within {EXPIRY_WARN_DAYS} days.
                </p>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {preventExpiry.map((r) => (
                    <RecipeCard key={r.code} recipe={r} fridgeItems={fridgeItems} />
                  ))}
                </div>
              </section>
            )}
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

        {/* Recently cooked — shown regardless of fridge state */}
        {recentlyCooked.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ClockIcon size={14} className="text-muted-foreground shrink-0" />
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Recently Cooked
              </h2>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {recentlyCooked.map(({ entry, recipe }) => {
                if (!recipe) return null;
                const cat = recipe.categories?.[0];
                const href = cat ? `/categories/${cat}/${recipe.code}` : `/uncategorized`;
                return (
                  <div
                    key={entry.id}
                    onClick={() => navigate(href)}
                    className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  >
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.name} className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-gradient-to-br from-amber-100 to-amber-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                      <p className="font-semibold text-xs leading-tight line-clamp-2">{recipe.name}</p>
                      <p className="text-xs text-white/60 mt-0.5">
                        {formatDistanceToNow(parseISO(entry.completedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </SidebarPage>
  );
}
