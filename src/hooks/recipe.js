import { useCallback, useState, useMemo, useEffect } from "react";
import DEFAULT_RECIPES from "../data/recipes.json" with { type: "json" };

const persistedData = JSON.parse(localStorage.getItem("data.recipes")) || [
  ...DEFAULT_RECIPES,
];

export function useRecipeManager() {
  const [recipes, setRecipes] = useState(persistedData);

  const getRecipe = useCallback(
    (code) => {
      return (
        recipes.find((recipe) => recipe.code === code) || {
          code: "N/A",
          name: "",
        }
      );
    },
    [recipes],
  );

  useEffect(() => {
    localStorage.setItem("data.recipes", JSON.stringify(recipes));
  }, [recipes]);

  const addRecipe = useCallback(
    (recipe) => {
      delete recipe._NEW;
      setRecipes((recipes) => [...recipes, recipe]);
    },
    [setRecipes],
  );

  const removeRecipe = useCallback(
    (toDelete) => {
      console.log("Removing recipe with code:", toDelete.code);
      setRecipes((recipes) =>
        recipes.filter((recipe) => recipe.code !== toDelete.code),
      );
    },
    [setRecipes],
  );

  const updateRecipe = useCallback(
    (update) => {
      setRecipes((recipes) =>
        recipes.map((recipe) =>
          recipe.code === update.code ? update : recipe,
        ),
      );
    },
    [setRecipes],
  );

  return {
    recipes,
    getRecipe,
    addRecipe,
    removeRecipe,
    updateRecipe,
  };
}

export function useRecipe(id) {
  const { recipes } = useRecipeManager();

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => recipe.code == id) || [];
  }, [recipes, id]);

  return filteredRecipes[0];
}

export function useCategoryRecipes(category) {
  const { recipes } = useRecipeManager();

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) =>
      (recipe.categories || []).includes(category),
    );
  }, [recipes, category]);

  return filteredRecipes;
}
