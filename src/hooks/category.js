import { useCallback, useState, useEffect } from "react";

const persistedData = JSON.parse(localStorage.getItem("data.categories")) || [
  "Bakery",
  "Vegan",
  "Healthy",
  "Fish",
  "Pasta",
  "Dessert",
];

export function useCategoryManager() {
  const [categories, setCategories] = useState(persistedData);
  useEffect(() => {
    localStorage.setItem("data.categories", JSON.stringify(categories));
  }, [categories]);

  const addCategory = useCallback(
    (cat) => {
      setCategories((cats) => [...cats, cat]);
    },
    [setCategories],
  );

  const removeCategory = useCallback(
    (toDelete) => {
      console.log("Removing Category  :", toDelete);
      setCategories((cats) => cats.filter((cat) => cat !== toDelete));
    },
    [setCategories],
  );

  const updateRecipe = useCallback(
    (old, update) => {
      setCategories((cats) => cats.map((cat) => (cat === old ? update : cat)));
    },
    [setCategories],
  );

  return {
    categories,
    addCategory,
    removeCategory,
    updateRecipe,
  };
}
