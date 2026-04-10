import CategoryPage from "./category-page";
import useRecipeStore from "@/store/recipe";
import { useMemo } from "react";

const A_WEEK = 7 * 24 * 60 * 60 * 1000;

export function MostRecentPage() {
  const recipes = useRecipeStore((state) => state.recipes);
  const recentRecipes = useMemo(
    () =>
      recipes.filter(
        (recipe) => new Date(recipe.date) > new Date(Date.now() - A_WEEK),
      ),
    [recipes],
  );

  return <CategoryPage id="Most Recent" recipes={recentRecipes} />;
}
