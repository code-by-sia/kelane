import { useParams } from "react-router";
import CategoryPage from "./category-page";
import { useCategoryRecipes } from "@/hooks/recipe";
import { useEffect } from "react";

export function SelectedCategoryPage() {
  const { id } = useParams();
  const recipes = useCategoryRecipes(id);

  return <CategoryPage id={id} recipes={recipes} />;
}
