import { create } from "zustand";
import { persist } from "zustand/middleware";

const useHistoryStore = create(
  persist(
    (set) => ({
      entries: [],

      startCooking: (recipeCode, recipeName) => {
        const id = crypto.randomUUID();
        set((s) => ({
          entries: [
            { id, recipeCode, recipeName, startedAt: new Date().toISOString(), completedAt: null },
            ...s.entries,
          ],
        }));
        return id;
      },

      completeCooking: (id) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, completedAt: new Date().toISOString() } : e,
          ),
        })),

      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    {
      name: "cooking-history-storage",

      partialize: (s) => ({ entries: s.entries }),
    },
  ),
);

export default useHistoryStore;
