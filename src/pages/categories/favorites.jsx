import CategoryPage from "./category-page";

import useRecipeStore from "@/store/recipe";
import { useMemo } from "react";

export function FavoritesPage() {
  const getFavoriteRecipes = useRecipeStore(
    (store) => store.getFavoriteRecipes,
  );

  const likedRecipes = useMemo(
    () => getFavoriteRecipes(),
    [getFavoriteRecipes],
  );

  return <CategoryPage id="Favorites" recipes={likedRecipes} />;
}
