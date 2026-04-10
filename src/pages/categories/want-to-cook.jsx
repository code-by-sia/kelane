import CategoryPage from "./category-page";
import useRecipeStore from "@/store/recipe";
import { useMemo } from "react";

export function WantToCookPage() {
  const getFlaggedRecipes = useRecipeStore((store) => store.getFlaggedRecipes);
  const flaggedRecipes = useMemo(
    () => getFlaggedRecipes(),
    [getFlaggedRecipes],
  );

  return <CategoryPage id="Want To Cook" recipes={flaggedRecipes} />;
}
