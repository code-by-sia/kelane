import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbStorage } from "@/lib/idb-storage";

const useCalendarStore = create(
  persist(
    (set, get) => ({
      meals: {}, // { "2026-05-22": [{ recipeCode, slot }] }

      addMeal: (date, recipeCode, slot) =>
        set((state) => {
          const existing = state.meals[date] ?? [];
          const alreadyAdded = existing.some(
            (m) => m.recipeCode === recipeCode && m.slot === slot,
          );
          if (alreadyAdded) return state;
          return {
            meals: {
              ...state.meals,
              [date]: [...existing, { recipeCode, slot }],
            },
          };
        }),

      removeMeal: (date, recipeCode, slot) =>
        set((state) => {
          const updated = (state.meals[date] ?? []).filter(
            (m) => !(m.recipeCode === recipeCode && m.slot === slot),
          );
          const meals = { ...state.meals };
          if (updated.length === 0) {
            delete meals[date];
          } else {
            meals[date] = updated;
          }
          return { meals };
        }),

      getMealsForDate: (date) => get().meals[date] ?? [],

      addMealToMultipleDays: (dates, recipeCode, slot) =>
        set((state) => {
          const meals = { ...state.meals };
          for (const date of dates) {
            const existing = meals[date] ?? [];
            const alreadyAdded = existing.some(
              (m) => m.recipeCode === recipeCode && m.slot === slot,
            );
            if (!alreadyAdded) {
              meals[date] = [...existing, { recipeCode, slot }];
            }
          }
          return { meals };
        }),
    }),
    { name: "calendar-storage", storage: idbStorage },
  ),
);

export default useCalendarStore;
