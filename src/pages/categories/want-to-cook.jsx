import CategoryPage from "./category-page";
import { useRecipeManager } from "@/hooks/recipe";
import { useMemo } from "react";

export function WantToCookPage() {
  const { recipes } = useRecipeManager();
  const flaggedRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.flagged),
    [recipes],
  );

  return <CategoryPage id="Want To Cook" recipes={flaggedRecipes} />;
}
