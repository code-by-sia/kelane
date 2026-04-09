import CategoryPage from "./category-page";
import { useRecipeManager } from "@/hooks/recipe";
import { useMemo } from "react";

export function FavoritesPage() {
  const { recipes } = useRecipeManager();
  const likedRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.liked),
    [recipes],
  );

  return <CategoryPage id="Favorites" recipes={likedRecipes} />;
}
