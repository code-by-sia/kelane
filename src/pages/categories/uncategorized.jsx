import CategoryPage from "./category-page";
import { useRecipeManager } from "@/hooks/recipe";
import { useEffect } from "react";
import { useMemo } from "react";

export function UncategorizedPage() {
  const { recipes } = useRecipeManager();

  const uncategorizedRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.categories.length === 0),
    [recipes],
  );

  return <CategoryPage id="Uncategorized" recipes={uncategorizedRecipes} />;
}
