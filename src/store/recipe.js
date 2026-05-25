import { create } from "zustand";
import { persist } from "zustand/middleware";
import DEFAULT_RECIPES from "../data/recipes.json" with { type: "json" };
import { idbStorage } from "@/lib/idb-storage";

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

      // Compare as strings so both legacy numeric codes and UUID-based string
      // codes (from the recipe scanner) resolve correctly.
      getRecipe: (code) => get().recipes.find((r) => String(r.code) === String(code)),
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

      /** Merge new recipes in (skip duplicates by code). */
      mergeRecipes: (incoming) =>
        set((state) => {
          const existing = new Set(state.recipes.map((r) => String(r.code)));
          const toAdd = incoming.filter((r) => !existing.has(String(r.code)));
          return { recipes: [...state.recipes, ...toAdd] };
        }),

      /** Replace the entire library. */
      replaceRecipes: (recipes, categories) =>
        set({ recipes, categories }),

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
      storage: idbStorage,
    },
  ),
);

export default useRecipeStore;
