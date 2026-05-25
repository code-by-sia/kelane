import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  differenceInDays,
  formatDistanceToNow,
  parseISO,
} from "date-fns";
import {
  AlertTriangleIcon,
  ClockIcon,
  RefrigeratorIcon,
  RepeatIcon,
  ShoppingCartIcon,
  SunriseIcon,
} from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useSetupStore from "@/store/setup";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";
import useHistoryStore from "@/store/history";
import {
  EXPIRY_WARN_DAYS,
  RECENTLY_COOKED_SUPPRESS_DAYS,
  COOK_AGAIN_MIN_DAYS,
  COOK_AGAIN_MAX_DAYS,
  COOK_AGAIN_MIN_COVERAGE,
  coverage,
  isInStock,
  mealTimeAffinity,
  currentMealPeriod,
} from "./utils";
import { SuggestCard } from "./suggest-card";
import { Section } from "./section";
import "./welcome.css";

export default function ExplorePage() {
  const navigate  = useNavigate();
  const completed = useSetupStore((s) => s.completed);
  const recipes   = useRecipeStore((s) => s.recipes);
  const getRecipe = useRecipeStore((s) => s.getRecipe);
  const fridgeItems    = useGroceriesStore((s) => s.fridgeItems);
  const historyEntries = useHistoryStore((s) => s.entries);

  useEffect(() => {
    if (!completed) navigate("/setup");
  }, [completed, navigate]);

  const now = new Date();
  const mealPeriod = currentMealPeriod();

  const {
    canCook,
    almostReady,
    needShopping,
    preventExpiry,
    expiringNames,
    expiryChips,
    cookAgain,
    cookAgainChips,
    mealTimeSuggestions,
    recentlyCookedSet,
  } = useMemo(() => {
    // ── Recently cooked set (suppress from suggestions) ──
    const recentlyCookedSet = new Set(
      historyEntries
        .filter((e) => e.completedAt &&
          differenceInDays(now, parseISO(e.completedAt)) < RECENTLY_COOKED_SUPPRESS_DAYS)
        .map((e) => e.recipeCode),
    );

    // ── Expiring items ──
    const expiringItems = fridgeItems.filter((item) => {
      if (!item.expiresAt) return false;
      const days = differenceInDays(parseISO(item.expiresAt), now);
      return days >= 0 && days <= EXPIRY_WARN_DAYS;
    });

    // ── Prevent-expiry row with quantity-weighted ranking ──
    const expiryChips = {};
    const preventExpiry =
      expiringItems.length > 0
        ? recipes
            .filter((r) => !recentlyCookedSet.has(r.code))
            .map((recipe) => {
              const matches = expiringItems.filter((item) =>
                (recipe.ingredients ?? []).some((ing) =>
                  ing.toLowerCase().includes(item.name.toLowerCase()),
                ),
              );
              // Weight by item quantity (default 1 if missing)
              const score = matches.reduce((s, item) => s + (item.quantity ?? 1), 0);
              return { recipe, matchCount: matches.length, score };
            })
            .filter(({ matchCount }) => matchCount > 0)
            .sort((a, b) => b.score - a.score || b.matchCount - a.matchCount)
            .slice(0, 9)
            .map(({ recipe, matchCount }) => {
              expiryChips[recipe.code] =
                matchCount === 1 ? "1 item expiring" : `${matchCount} items expiring`;
              return recipe;
            })
        : [];

    // ── Coverage split (exclude recently cooked + already in expiry row) ──
    const expirySet = new Set(preventExpiry.map((r) => r.code));
    const withPct = recipes
      .filter((r) => !recentlyCookedSet.has(r.code) && !expirySet.has(r.code))
      .map((r) => ({ r, pct: coverage(r, fridgeItems) }));

    const canCook     = withPct.filter(({ pct }) => pct === 1).map(({ r }) => r);
    const almostReady = withPct.filter(({ pct }) => pct >= 0.6 && pct < 1).map(({ r }) => r);
    const needShopping = withPct.filter(({ pct }) => pct < 0.6).map(({ r }) => r);

    // ── Cook again row ──
    const cookAgainChips = {};
    const seenCookAgain = new Set();
    const cookAgain = historyEntries
      .filter((e) => {
        if (!e.completedAt) return false;
        const days = differenceInDays(now, parseISO(e.completedAt));
        return days >= COOK_AGAIN_MIN_DAYS && days <= COOK_AGAIN_MAX_DAYS;
      })
      .filter((e) => {
        if (seenCookAgain.has(e.recipeCode)) return false;
        seenCookAgain.add(e.recipeCode);
        return true;
      })
      .map((e) => {
        const recipe = getRecipe(e.recipeCode);
        if (!recipe) return null;
        const pct = coverage(recipe, fridgeItems);
        return { recipe, pct, completedAt: e.completedAt };
      })
      .filter((x) => x && x.pct >= COOK_AGAIN_MIN_COVERAGE)
      .slice(0, 6)
      .map(({ recipe, pct, completedAt }) => {
        const ago = formatDistanceToNow(parseISO(completedAt), { addSuffix: true });
        cookAgainChips[recipe.code] = `Cooked ${ago} · ${Math.round(pct * 100)}% ready`;
        return recipe;
      });

    // ── Meal-time suggestions ──
    const mealTimeSuggestions = mealPeriod
      ? recipes
          .filter((r) =>
            !recentlyCookedSet.has(r.code) &&
            !expirySet.has(r.code) &&
            mealTimeAffinity(r) === mealPeriod,
          )
          .sort((a, b) => coverage(b, fridgeItems) - coverage(a, fridgeItems))
          .slice(0, 4)
      : [];

    return {
      canCook,
      almostReady,
      needShopping,
      preventExpiry,
      expiringNames: expiringItems.map((i) => i.name),
      expiryChips,
      cookAgain,
      cookAgainChips,
      mealTimeSuggestions,
      recentlyCookedSet,
    };
  }, [recipes, fridgeItems, historyEntries, getRecipe, mealPeriod]);

  // Deduplicated recently cooked (last 6 unique, completed sessions only)
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
            {/* Use before they expire */}
            {preventExpiry.length > 0 && (
              <section className="home-section">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangleIcon size={14} className="text-amber-500 shrink-0" />
                  <h2 className="home-expiry-heading">
                    Use before they expire
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs font-normal normal-case tracking-normal text-amber-700 border-amber-300"
                    >
                      {preventExpiry.length}
                    </Badge>
                  </h2>
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
                    <SuggestCard key={r.code} recipe={r} fridgeItems={fridgeItems} chip={expiryChips[r.code]} />
                  ))}
                </div>
              </section>
            )}

            {/* Meal-time suggestions */}
            {mealTimeSuggestions.length > 0 && (
              <Section
                icon={SunriseIcon}
                title={`${mealPeriod.charAt(0).toUpperCase() + mealPeriod.slice(1)} ideas`}
                badge={mealTimeSuggestions.length}
                recipes={mealTimeSuggestions}
                fridgeItems={fridgeItems}
                chips={Object.fromEntries(
                  mealTimeSuggestions.map((r) => [
                    r.code,
                    `${Math.round(coverage(r, fridgeItems) * 100)}% ready`,
                  ]),
                )}
              />
            )}

            {/* Cook again */}
            {cookAgain.length > 0 && (
              <Section
                icon={RepeatIcon}
                title="Cook again"
                badge={cookAgain.length}
                subtitle="Recipes you've made recently that match your current fridge."
                recipes={cookAgain}
                fridgeItems={fridgeItems}
                chips={cookAgainChips}
              />
            )}

            <Section
              title="Can cook now"
              badge={canCook.length}
              recipes={canCook}
              fridgeItems={fridgeItems}
              chips={Object.fromEntries(canCook.map((r) => [r.code, "All ingredients ready"]))}
            />
            <Section
              title="Almost ready"
              badge={almostReady.length}
              recipes={almostReady}
              fridgeItems={fridgeItems}
              chips={Object.fromEntries(
                almostReady.map((r) => [r.code, `${Math.round(coverage(r, fridgeItems) * 100)}% ready`]),
              )}
            />
            <Section
              title="Need shopping"
              badge={needShopping.length}
              recipes={needShopping}
              fridgeItems={fridgeItems}
            />

            {canCook.length === 0 && almostReady.length === 0 && preventExpiry.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recipes match your current fridge items closely.
              </p>
            )}
          </>
        )}

        {/* Recently cooked — always shown */}
        {recentlyCooked.length > 0 && (
          <section className="home-section">
            <div className="flex items-center gap-2">
              <ClockIcon size={14} className="text-muted-foreground shrink-0" />
              <h2 className="home-section__heading">Recently Cooked</h2>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {recentlyCooked.map(({ entry, recipe }) => {
                if (!recipe) return null;
                const cat = recipe.categories?.[0];
                const href = cat ? `/categories/${cat}/${recipe.code}` : `/uncategorized`;
                return (
                  <div key={entry.id} onClick={() => navigate(href)} className="home-recipe-card">
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.name} className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <div className="home-recipe-card__placeholder" />
                    )}
                    <div className="home-recipe-card__overlay--light" />
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
