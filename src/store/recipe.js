import { create } from "zustand";
import { persist } from "zustand/middleware";
import DEFAULT_RECIPES from "../data/recipes.json" with { type: "json" };

const useRecipeStore = create(
  persist(
    (set, get) => ({
      recipes: DEFAULT_RECIPES,
      categories: ["Bakery", "Vegan", "Healthy", "Fish", "Pasta", "Dessert"],

      getCategoriesWithCounts: () => {
        const { categories, recipes } = get();
        return categories.map((name) => ({
          name,
          recipes: recipes.filter((r) => r.categories.includes(name)).length,
        }));
      },

      getRecipe: (code) => get().recipes.find((r) => r.code === code * 1),
      getRecipesInCategory: (category) =>
        get().recipes.filter((it) => it.categories.includes(category)),
      getFlaggedRecipes: () => get().recipes.filter((recipe) => recipe.flagged),
      getFavoriteRecipes: () => get().recipes.filter((it) => it.liked),
      getUncategorizedRecipes: () =>
        get().recipes.filter((it) => it.categories.length === 0),
      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [...state.recipes, recipe],
        })),

      removeRecipe: (code) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.code !== code),
        })),

      updateRecipe: (code, updatedRecipe) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.code === code ? { ...r, ...updatedRecipe } : r,
          ),
        })),

      addCategory: (category) => {
        const { categories } = get();
        if (!categories.includes(category)) {
          set({ categories: [...categories, category] });
        }
      },

      removeCategory: (categoryName) =>
        set((state) => ({
          categories: state.categories.filter((c) => c !== categoryName),
        })),

      updateCategory: (oldName, newName) => {
        const { categories } = get();
        if (categories.includes(newName)) return;

        set((state) => ({
          categories: state.categories.map((c) =>
            c === oldName ? newName : c,
          ),
          recipes: state.recipes.map((r) => ({
            ...r,
            categories: r.categories.map((cat) =>
              cat === oldName ? newName : cat,
            ),
          })),
        }));
      },
    }),
    {
      name: "recipe-app-storage",
      storage: window.localStorage,
    },
  ),
);

export default useRecipeStore;
