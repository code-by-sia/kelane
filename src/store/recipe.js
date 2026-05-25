import { create } from "zustand";
import { persist } from "zustand/middleware";
import DEFAULT_RECIPES from "../data/recipes.json" with { type: "json" };

export { DEFAULT_RECIPES };

const DEFAULT_CATEGORIES = ["Bakery", "Vegan", "Vegetarian", "Healthy", "Fish", "Pasta", "Meat", "Soup", "Breakfast", "Dessert"];

const useRecipeStore = create(
  persist(
    (set, get) => ({
      // Start empty — seeded during setup if the user wants example data.
      // Existing users with data in IndexedDB get their data hydrated normally.
      recipes: [],
      categories: DEFAULT_CATEGORIES,

      getCategoriesWithCounts: () => {
        const { categories, recipes } = get();
        return categories.map((name) => ({
          name,
          recipes: recipes.filter((r) => r.categories.includes(name)).length,
        }));
      },

      getRecipe: (code) => get().recipes.find((r) => r.code === code),
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
          const existing = new Set(state.recipes.map((r) => r.code));
          const toAdd = incoming.filter((r) => !existing.has(r.code));
          return { recipes: [...state.recipes, ...toAdd] };
        }),

      /** Replace the entire library. */
      replaceRecipes: (recipes, categories) =>
        set({ recipes, categories }),

      /** Seed built-in example recipes (skip any that already exist by code). */
      seedDefaultRecipes: () => {
        const { recipes } = get();
        const existing = new Set(recipes.map((r) => r.code));
        const toAdd = DEFAULT_RECIPES.filter((r) => !existing.has(r.code));
        if (toAdd.length > 0) {
          set((s) => ({ recipes: [...s.recipes, ...toAdd] }));
        }
      },

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

      partialize: (s) => ({ recipes: s.recipes, categories: s.categories }),

      // v1 migration: coerce legacy numeric codes to strings so route params
      // (always strings) match correctly after the schema refactor.
      migrate: (persisted) => ({
        ...persisted,
        recipes: (persisted.recipes ?? []).map((r) =>
          typeof r.code === "number" ? { ...r, code: String(r.code) } : r,
        ),
      }),
      version: 1,
    },
  ),
);

export default useRecipeStore;
