import { useParams } from "react-router";
import CategoryPage from "./category-page";

import useRecipeStore from "@/store/recipe";

export function SelectedCategoryPage() {
  const { id } = useParams();
  const getRecipesInCategory = useRecipeStore(
    (store) => store.getRecipesInCategory,
  );

  const recipes = useMemo(
    () => getRecipesInCategory(id),
    [getRecipesInCategory, id],
  );

  return <CategoryPage id={id} recipes={recipes} />;
}
