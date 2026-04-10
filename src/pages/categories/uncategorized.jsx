import CategoryPage from "./category-page";
import useRecipeStore from "@/store/recipe";
import { useMemo } from "react";

export function UncategorizedPage() {
  const getUncategorizedRecipes = useRecipeStore(
    (store) => store.getUncategorizedRecipes,
  );

  const uncategorizedRecipes = useMemo(
    () => getUncategorizedRecipes(),
    [getUncategorizedRecipes],
  );

  return <CategoryPage id="Uncategorized" recipes={uncategorizedRecipes} />;
}
